// src/pages/SocketTestPage.jsx - WebSocket Testing Page
import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { ERP_SOCKET_URL } from '../config/env';

export default function SocketTestPage() {
    const { isConnected, socket, emit, subscribe } = useSocket();
    const [messages, setMessages] = useState([]);
    const [testMessage, setTestMessage] = useState('');

    useEffect(() => {
        // Listen for test events
        const unsubscribe = subscribe('test:response', (data) => {
            setMessages(prev => [...prev, { type: 'received', text: data.message, time: new Date().toLocaleTimeString() }]);
        });

        return unsubscribe;
    }, [subscribe]);

    const sendTestMessage = () => {
        if (testMessage.trim()) {
            emit('test:message', { message: testMessage });
            setMessages(prev => [...prev, { type: 'sent', text: testMessage, time: new Date().toLocaleTimeString() }]);
            setTestMessage('');
        }
    };

    const pingServer = () => {
        emit('ping', { timestamp: Date.now() });
        setMessages(prev => [...prev, { type: 'ping', text: 'Ping sent', time: new Date().toLocaleTimeString() }]);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">WebSocket Connection Test</h1>

            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
                <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-lg font-medium">
                        {isConnected ? '✅ Connected' : '❌ Disconnected'}
                    </span>
                </div>
                {isConnected && (
                    <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800">
                            Socket ID: {socket?.id || 'N/A'}
                        </p>
                        <p className="text-sm text-green-800">
                            Connected to: {ERP_SOCKET_URL}
                        </p>
                    </div>
                )}
            </div>

            {/* Test Controls */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Test Controls</h2>

                <div className="space-y-4">
                    {/* Ping Test */}
                    <div>
                        <button
                            onClick={pingServer}
                            disabled={!isConnected}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Send Ping
                        </button>
                        <p className="text-sm text-gray-600 mt-1">Test if server responds to events</p>
                    </div>

                    {/* Custom Message Test */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Send Custom Message</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                                placeholder="Type a test message..."
                                disabled={!isConnected}
                                className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            <button
                                onClick={sendTestMessage}
                                disabled={!isConnected || !testMessage.trim()}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Log */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Message Log</h2>
                    <button
                        onClick={() => setMessages([])}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                    >
                        Clear
                    </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {messages.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No messages yet. Send a test message!</p>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded ${msg.type === 'sent' ? 'bg-blue-50 border-l-4 border-blue-500' :
                                    msg.type === 'received' ? 'bg-green-50 border-l-4 border-green-500' :
                                        'bg-yellow-50 border-l-4 border-yellow-500'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`text-xs font-medium ${msg.type === 'sent' ? 'text-blue-600' :
                                            msg.type === 'received' ? 'text-green-600' :
                                                'text-yellow-600'
                                            }`}>
                                            {msg.type === 'sent' ? '📤 SENT' : msg.type === 'received' ? '📥 RECEIVED' : '🔔 PING'}
                                        </span>
                                        <p className="text-sm mt-1">{msg.text}</p>
                                    </div>
                                    <span className="text-xs text-gray-500">{msg.time}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Connection Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded border">
                <h3 className="font-semibold mb-2">ℹ️ Testing Guide</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                    <li>• Check if the connection status shows as Connected</li>
                    <li>• Click "Send Ping" to test basic communication</li>
                    <li>• Send custom messages to test event handling</li>
                    <li>• Open multiple browser tabs to test real-time sync</li>
                    <li>• Check browser console (F12) for detailed Socket.io logs</li>
                </ul>
            </div>
        </div>
    );
}
