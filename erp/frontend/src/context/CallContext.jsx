import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from './AuthContext';
import { TEAMS_SOCKET_URL } from '../config/env';
import api from '../api/axiosClient';

const CallContext = createContext();

// Use Web Audio API for simple tones instead of external URLs
const createToneGenerator = () => {
    let audioContext = null;
    let oscillator = null;
    let gainNode = null;

    return {
        start: (frequency = 440, type = 'sine') => {
            try {
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (oscillator) {
                    oscillator.stop();
                }
                oscillator = audioContext.createOscillator();
                gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = frequency;
                oscillator.type = type;
                gainNode.gain.value = 0.1; // Low volume
                oscillator.start();
            } catch (e) {
                console.log('Audio not supported:', e);
            }
        },
        stop: () => {
            try {
                if (oscillator) {
                    oscillator.stop();
                    oscillator = null;
                }
            } catch (e) {
                // Ignore
            }
        }
    };
};

export const CallProvider = ({ children }) => {
    const { auth } = useAuth();

    // Call State
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [stream, setStream] = useState(null);
    const [call, setCall] = useState({}); // { isReceivingCall, from, name, signal }
    const [me, setMe] = useState('');
    const [isCalling, setIsCalling] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Track who we're calling (for end-call notification)
    const [callingUserId, setCallingUserId] = useState(null);
    const [callingUserName, setCallingUserName] = useState('');

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const socketRef = useRef();
    const streamRef = useRef();

    // Call tracking for history
    const currentCallId = useRef(null);
    const callStartTime = useRef(null);
    const currentCallType = useRef('video');

    // Simple tone generators
    const ringTone = useRef(createToneGenerator());
    const dialTone = useRef(createToneGenerator());

    // Initialize Socket
    useEffect(() => {
        if (!auth?.token) return;

        socketRef.current = io(TEAMS_SOCKET_URL, {
            auth: { token: auth.token },
            transports: ['polling', 'websocket'],
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log("CallContext Socket Connected:", socket.id);
            setMe(socket.id);
        });

        socket.on('call-made', ({ from, name, signal, isVideoCall }) => {
            console.log("CallContext: Incoming Call Received from", name, "userId:", from);
            setCall({ isReceivingCall: true, from, name, signal, isVideoCall });
            // If incoming is audio only, setting isVideoEnabled might be nice for UI
            if (isVideoCall === false) setIsVideoEnabled(false);
            else setIsVideoEnabled(true);

            // Play ring tone (alternating frequency for ring effect)
            let isHigh = true;
            const ringInterval = setInterval(() => {
                ringTone.current.start(isHigh ? 440 : 480, 'sine');
                isHigh = !isHigh;
            }, 500);
            socket._ringInterval = ringInterval;
        });

        socket.on('call-answered', ({ signal }) => {
            console.log("CallContext: Call Answered");
            setCallAccepted(true);
            dialTone.current.stop();

            if (connectionRef.current) {
                connectionRef.current.signal(signal);
            }
        });

        socket.on('ice-candidate', ({ candidate }) => {
            if (connectionRef.current) {
                connectionRef.current.signal(candidate);
            }
        });

        socket.on('end-call', () => {
            console.log("CallContext: Received end-call signal");
            cleanupCall();
        });

        return () => {
            ringTone.current.stop();
            dialTone.current.stop();
            if (socket._ringInterval) clearInterval(socket._ringInterval);
            socket.disconnect();
        };
    }, [auth?.token]);

    // Cleanup function (doesn't emit end-call, just cleans up locally)
    const cleanupCall = () => {
        setCallEnded(true);
        ringTone.current.stop();
        dialTone.current.stop();
        if (socketRef.current?._ringInterval) {
            clearInterval(socketRef.current._ringInterval);
        }

        if (connectionRef.current) {
            connectionRef.current.destroy();
            connectionRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        setStream(null);
        setCall({});
        setCallAccepted(false);
        setIsCalling(false);
        setIsScreenSharing(false);
        setCallingUserId(null);
        setCallingUserName('');

        setTimeout(() => {
            setCallEnded(false);
        }, 100);
    };

    // Setup Media Stream
    const getMedia = async (video = true, audio = true) => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video, audio });
            setStream(currentStream);
            streamRef.current = currentStream;
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
            return currentStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            if (video) { // Audio-only fallback
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    setStream(audioStream);
                    streamRef.current = audioStream;
                    if (myVideo.current) myVideo.current.srcObject = audioStream;
                    setIsVideoEnabled(false);
                    return audioStream;
                } catch (err) { console.error('Audio fallback failed', err); }
            }
        }
    };

    const answerCall = async () => {
        setCallAccepted(true);
        ringTone.current.stop();
        if (socketRef.current?._ringInterval) {
            clearInterval(socketRef.current._ringInterval);
        }

        // IMPORTANT: Match the exact call type from caller
        // If isVideoCall is explicitly false, only request audio
        // If isVideoCall is true or undefined (for backwards compatibility), request video
        const shouldUseVideo = call.isVideoCall === true;
        console.log('[CallContext] Answering call - isVideoCall:', call.isVideoCall, 'shouldUseVideo:', shouldUseVideo);

        // Set video enabled state based on call type
        setIsVideoEnabled(shouldUseVideo);

        // Track call for history (receiver side)
        callStartTime.current = Date.now();
        currentCallType.current = shouldUseVideo ? 'video' : 'audio';
        // Store caller ID so we can update call history when call ends
        setCallingUserId(call.from);

        const currentStream = await getMedia(shouldUseVideo, true);

        const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
            socketRef.current.emit('answer-call', { signal: data, to: call.from });
        });

        peer.on('stream', (remoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        peer.signal(call.signal);

        connectionRef.current = peer;
    };

    const callUser = async (id, name, isVideoCall = true) => {
        console.log("CallContext: Initiating call to userId:", id, "name:", name, "video:", isVideoCall);
        setIsCalling(true);
        setCallingUserId(id); // Store who we're calling
        setCallingUserName(name);
        // Set video enabled state based on call type
        setIsVideoEnabled(isVideoCall);
        currentCallType.current = isVideoCall ? 'video' : 'audio';

        // Log call initiation
        try {
            const response = await api.post('/api/calls/log', {
                callerId: auth.user.id,
                receiverId: id,
                callType: isVideoCall ? 'video' : 'audio',
                status: 'initiated'
            });
            if (response.data.call) {
                currentCallId.current = response.data.call.id;
            }
        } catch (error) {
            console.error('Error logging call:', error);
        }

        // Play dial tone
        dialTone.current.start(480, 'sine');

        // Request media based on call type
        const currentStream = await getMedia(isVideoCall, true);

        const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
            console.log("CallContext: Sending signal to user", id);
            socketRef.current.emit('call-user', {
                userToCall: id,
                signalData: data,
                from: auth.user.id,
                name: auth.user.name,
                isVideoCall // Send call type info
            });
        });

        peer.on('stream', (remoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        connectionRef.current = peer;
        callStartTime.current = Date.now(); // Track call start time
    };

    // Leave call - notifies the other party
    const leaveCall = async () => {
        // Determine who to notify
        const targetUserId = callingUserId || call.from;
        const isCaller = !!currentCallId.current; // Caller has the call ID

        console.log("CallContext: Leaving call, notifying:", targetUserId, "isCaller:", isCaller);

        // Calculate duration
        const duration = callStartTime.current
            ? Math.floor((Date.now() - callStartTime.current) / 1000)
            : 0;

        // Determine call status
        let status;
        if (callAccepted) {
            status = 'completed';
        } else if (call.isReceivingCall && !callAccepted) {
            status = 'declined'; // Receiver declined before answering
        } else {
            status = 'missed'; // Call was not answered
        }

        // Update call history
        try {
            if (currentCallId.current) {
                // Caller has the call ID
                await api.patch(`/api/calls/${currentCallId.current}`, {
                    status,
                    duration
                });
            } else if (call.from && auth?.user?.id) {
                // Receiver uses by-users endpoint (caller ID is call.from, receiver is current user)
                await api.patch(`/api/calls/by-users/${call.from}/${auth.user.id}`, {
                    status,
                    duration
                });
            }
        } catch (error) {
            console.error('Error updating call history:', error);
        }

        // Notify other user BEFORE cleanup
        if (targetUserId && socketRef.current) {
            socketRef.current.emit('end-call', { to: targetUserId });
        }

        // Reset call tracking
        currentCallId.current = null;
        callStartTime.current = null;

        // Then cleanup locally
        cleanupCall();
    };

    const toggleVideo = async () => {
        if (!streamRef.current) return;

        const videoTracks = streamRef.current.getVideoTracks();

        if (videoTracks.length > 0) {
            // Video track exists - just toggle enabled state
            videoTracks.forEach(track => track.enabled = !track.enabled);
            setIsVideoEnabled(!isVideoEnabled);
        } else if (!isVideoEnabled) {
            // No video track and we want to enable video - need to acquire camera
            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const videoTrack = videoStream.getVideoTracks()[0];

                // Add to our stream
                streamRef.current.addTrack(videoTrack);
                setStream(streamRef.current);

                // Add to peer connection if active
                if (connectionRef.current) {
                    const senders = connectionRef.current._pc?.getSenders() || [];
                    const videoSender = senders.find(s => s.track?.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(videoTrack);
                    } else {
                        connectionRef.current._pc?.addTrack(videoTrack, streamRef.current);
                    }
                }

                setIsVideoEnabled(true);
                console.log('[CallContext] Video track added');
            } catch (err) {
                console.error('[CallContext] Failed to add video track:', err);
            }
        }
    };

    const toggleAudio = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsAudioEnabled(!isAudioEnabled);
        }
    };

    return (
        <CallContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name: me,
            setName: setMe,
            callEnded,
            me,
            callUser,
            leaveCall,
            answerCall,
            isCalling,
            toggleVideo,
            toggleAudio,
            isVideoEnabled,
            isAudioEnabled,
            isScreenSharing,
            callingUserName
        }}>
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => useContext(CallContext);
