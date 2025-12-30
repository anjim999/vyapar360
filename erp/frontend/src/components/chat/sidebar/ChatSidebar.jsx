// frontend/src/components/chat/sidebar/ChatSidebar.jsx
import { FaSearch, FaPlus, FaBell, FaComments, FaChevronDown, FaChevronRight, FaHashtag, FaEllipsisV, FaEdit, FaTrash, FaPhone, FaPhoneAlt, FaVideo, FaPhoneSlash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { TabButton, QuickAction, ChatItem } from '../common/ChatComponents';
import { FaCompass, FaAt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import api from '../../../api/axiosClient';

// Call History Component
function CallsHistory() {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCallHistory();
    }, []);

    const fetchCallHistory = async () => {
        try {
            const response = await api.get('/api/calls/history');
            setCalls(response.data.calls || []);
        } catch (error) {
            console.error('Error fetching call history:', error);
            setCalls([]);
        } finally {
            setLoading(false);
        }
    };

    const getCallIcon = (call, currentUserId) => {
        const isCaller = call.caller_id === currentUserId;
        const isMissed = call.status === 'missed' || call.status === 'declined';

        if (call.call_type === 'video') {
            return <FaVideo className={isMissed ? 'text-red-400' : 'text-green-400'} />;
        }
        return <FaPhone className={isMissed ? 'text-red-400' : 'text-green-400'} />;
    };

    const getCallDirection = (call, currentUserId) => {
        const isCaller = call.caller_id === currentUserId;
        return isCaller ? (
            <FaArrowUp className="text-xs text-blue-400" title="Outgoing" />
        ) : (
            <FaArrowDown className="text-xs text-green-400" title="Incoming" />
        );
    };

    const formatDuration = (seconds) => {
        if (!seconds || seconds === 0) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (calls.length === 0) {
        return (
            <div className="text-center py-8">
                <FaPhone className="text-4xl text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No call history yet</p>
                <p className="text-gray-600 text-xs mt-1">Start a call from any chat!</p>
            </div>
        );
    }

    return (
        <>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Recent Calls</p>
            {calls.map(call => {
                const isMissed = call.status === 'missed' || call.status === 'declined';
                const otherUser = call.caller_name === call.receiver_name ? call.caller_name :
                    (call.caller_id === call.receiver_id ? call.caller_name :
                        (call.caller_name || call.receiver_name || 'Unknown'));

                return (
                    <div
                        key={call.id}
                        className="flex items-center gap-3 px-2 py-3 rounded-md hover:bg-[#2b2b2b] cursor-pointer transition-colors"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isMissed ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                            {call.call_type === 'video' ? <FaVideo className={isMissed ? 'text-red-400' : 'text-green-400'} /> : <FaPhone className={isMissed ? 'text-red-400' : 'text-green-400'} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-200 truncate">{call.receiver_name || call.caller_name || 'Unknown'}</span>
                                <FaArrowUp className="text-xs text-gray-500" />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className={isMissed ? 'text-red-400' : 'text-gray-400'}>
                                    {call.status === 'completed' ? 'Completed' :
                                        call.status === 'missed' ? 'Missed' :
                                            call.status === 'declined' ? 'Declined' : call.status}
                                </span>
                                {call.duration_seconds > 0 && (
                                    <span className="text-gray-500">• {formatDuration(call.duration_seconds)}</span>
                                )}
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            {call.started_at && formatDistanceToNow(new Date(call.started_at), { addSuffix: true })}
                        </div>
                    </div>
                );
            })}
        </>
    );
}


export default function ChatSidebar({
    activeNav,
    setShowCreateGroup,
    sidebarTab,
    setSidebarTab,
    recentChats,
    channels,
    setShowUsersList,
    navigate,
    setShowGeminiChat,
    setSelectedChat,
    setSelectedChannel,
    mentions,
    teams,
    selectedTeam,
    expandedTeams,
    selectTeam,
    selectedChannel,
    selectedChat,
    channelMenuOpen,
    setChannelMenuOpen,
    selectChannel,
    setEditingChannel,
    setEditingChannelName,
    setShowEditChannel,
    handleDeleteChannel,
    setSelectedTeam,
    setShowCreateChannel,
    setEditingTeamName,
    setShowTeamSettings,
    selectChat,
    auth,
    activities
}) {
    return (
        <div className="w-[300px] bg-[#1f1f1f] flex flex-col border-r border-[#3b3b3b]">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                    {activeNav === 'activity' ? 'Activity' : 'Chat'}
                </h2>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[#3b3b3b] rounded text-gray-400">
                        <FaSearch />
                    </button>
                    <button
                        onClick={() => setShowCreateGroup(true)}
                        className="p-2 hover:bg-[#3b3b3b] rounded text-gray-400"
                        title="New Chat"
                    >
                        <FaPlus />
                    </button>
                </div>
            </div>

            {activeNav === 'activity' ? (
                /* Activity Feed */
                <div className="flex-1 overflow-y-auto px-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Recent Activity</p>
                    {activities.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-8">No recent activity</p>
                    ) : (
                        activities.map(activity => (
                            <div key={activity.id} className="p-3 hover:bg-[#2b2b2b] rounded-md cursor-pointer mb-1">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                        <FaBell className="text-sm" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-200">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.message}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <>
                    {/* Tabs with badges */}
                    <div className="px-3 flex gap-1 mb-3 flex-wrap">
                        <TabButton active={sidebarTab === 'unread'} onClick={() => setSidebarTab('unread')} badge={recentChats.filter(c => c.unread_count > 0).length}>Unread</TabButton>
                        <TabButton active={sidebarTab === 'chats'} onClick={() => setSidebarTab('chats')}>Chats</TabButton>
                        <TabButton active={sidebarTab === 'channels'} onClick={() => setSidebarTab('channels')} badge={channels.reduce((sum, c) => sum + (parseInt(c.unread_count) || 0), 0)}>Channels</TabButton>
                        <TabButton active={sidebarTab === 'calls'} onClick={() => setSidebarTab('calls')}>Calls</TabButton>
                    </div>

                    {/* Search - Click to open New Chat modal */}
                    <div className="px-3 mb-3">
                        <button
                            onClick={() => setShowUsersList(true)}
                            className="w-full flex items-center gap-2 pl-3 pr-3 py-2 bg-[#2b2b2b] border border-[#3b3b3b] rounded-md text-sm text-gray-500 hover:border-purple-500 transition-colors text-left"
                        >
                            <FaSearch className="text-sm" />
                            <span>Search people to chat...</span>
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-3 space-y-1 mb-3">
                        <QuickAction
                            icon={<span className="text-lg">✨</span>}
                            label="Gemini AI"
                            onClick={() => {
                                setShowGeminiChat(true);
                                setSelectedChat(null);
                                setSelectedChannel(null);
                            }}
                        />
                        <QuickAction icon={<FaCompass />} label="Discover" onClick={() => navigate('/marketplace')} />
                        <QuickAction icon={<FaAt />} label="Mentions" onClick={() => setSidebarTab('mentions')} count={mentions.length} />
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto px-3">
                        {sidebarTab === 'channels' ? (
                            <>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Teams and channels</p>
                                {teams.map(team => (
                                    <div key={team.id} className="mb-1">
                                        <div
                                            className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-[#3b3b3b] group overflow-hidden ${selectedTeam?.id === team.id ? 'bg-[#3b3b3b]' : ''}`}
                                        >
                                            <div onClick={() => selectTeam(team)} className="flex items-center gap-2 flex-1 min-w-0">
                                                {expandedTeams[team.id] ? <FaChevronDown className="text-gray-500 text-xs flex-shrink-0" /> : <FaChevronRight className="text-gray-500 text-xs flex-shrink-0" />}
                                                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {team.name[0]}
                                                </div>
                                                <span className="text-sm text-gray-200 flex-1 truncate min-w-0">{team.name}</span>
                                                {selectedTeam?.id === team.id && channels.reduce((sum, c) => sum + (parseInt(c.unread_count) || 0), 0) > 0 && (
                                                    <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                                        {channels.reduce((sum, c) => sum + (parseInt(c.unread_count) || 0), 0)}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedTeam(team); setEditingTeamName(team.name); setShowTeamSettings(true); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#4b4b4b] rounded"
                                                title="Team Settings"
                                            >
                                                <FaEllipsisV className="text-xs text-gray-400" />
                                            </button>
                                        </div>
                                        {expandedTeams[team.id] && (
                                            <div className="mt-1">
                                                {channels.filter(c => c.team_id === team.id).map(channel => (
                                                    <div
                                                        key={channel.id}
                                                        onClick={() => { selectChannel(channel); setChannelMenuOpen(null); }}
                                                        className={`flex items-center gap-2 pl-10 pr-2 py-1.5 rounded-md cursor-pointer hover:bg-[#3b3b3b] group relative ${selectedChannel?.id === channel.id ? 'bg-[#4a4a6a]' : ''}`}
                                                    >
                                                        <FaHashtag className="text-gray-500 text-xs flex-shrink-0" />
                                                        <span className="text-sm text-gray-300 flex-1 truncate min-w-0">{channel.name}</span>
                                                        {channel.unread_count > 0 && (
                                                            <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                                                {channel.unread_count}
                                                            </span>
                                                        )}
                                                        <button
                                                            data-channel-menu-button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setChannelMenuOpen(channelMenuOpen === channel.id ? null : channel.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#4b4b4b] rounded"
                                                        >
                                                            <FaEllipsisV className="text-[10px] text-gray-400" />
                                                        </button>

                                                        {channelMenuOpen === channel.id && (
                                                            <div
                                                                data-channel-menu
                                                                className="absolute right-0 top-full mt-1 bg-[#2b2b2b] border border-[#3b3b3b] rounded-lg shadow-xl z-50 py-1 min-w-[120px]"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingChannel(channel);
                                                                        setEditingChannelName(channel.name);
                                                                        setShowEditChannel(true);
                                                                        setChannelMenuOpen(null);
                                                                    }}
                                                                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#3b3b3b] flex items-center gap-2"
                                                                >
                                                                    <FaEdit className="text-xs" /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        handleDeleteChannel(channel.id);
                                                                        setChannelMenuOpen(null);
                                                                    }}
                                                                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-[#3b3b3b] flex items-center gap-2"
                                                                >
                                                                    <FaTrash className="text-xs" /> Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => { setSelectedTeam(team); setShowCreateChannel(true); }}
                                                    className="flex items-center gap-2 pl-10 pr-2 py-1.5 text-purple-400 hover:bg-[#3b3b3b] rounded-md w-full"
                                                >
                                                    <FaPlus className="text-xs" />
                                                    <span className="text-xs">Add channel</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => setShowCreateGroup(true)}
                                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-purple-400 hover:bg-[#3b3b3b] mt-2"
                                >
                                    <FaPlus className="text-xs" />
                                    <span className="text-sm">Create new team</span>
                                </button>
                            </>
                        ) : sidebarTab === 'unread' ? (
                            <>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Unread</p>
                                {recentChats.filter(c => c.unread_count > 0).map(chat => (
                                    <ChatItem
                                        key={chat.other_user_id}
                                        chat={chat}
                                        selected={selectedChat?.other_user_id === chat.other_user_id}
                                        onClick={() => selectChat(chat)}
                                        currentUserId={auth.user?.id}
                                    />
                                ))}
                                {recentChats.filter(c => c.unread_count > 0).length === 0 && (
                                    <p className="text-center text-gray-500 text-sm py-4">You're all caught up! 🎉</p>
                                )}
                            </>
                        ) : sidebarTab === 'calls' ? (
                            <CallsHistory />
                        ) : (
                            <>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Chats</p>
                                {recentChats.map(chat => (
                                    <ChatItem
                                        key={chat.other_user_id}
                                        chat={chat}
                                        selected={selectedChat?.other_user_id === chat.other_user_id}
                                        onClick={() => selectChat(chat)}
                                        currentUserId={auth.user?.id}
                                    />
                                ))}
                                {recentChats.length === 0 && (
                                    <p className="text-center text-gray-500 text-sm py-4">No recent chats</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* WhatsApp-style Floating Action Button */}
                    <div className="p-3">
                        <button
                            onClick={() => setShowUsersList(true)}
                            className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl shadow-lg flex items-center justify-center text-white ml-auto transition-all duration-200 hover:scale-105"
                            title="New Chat"
                        >
                            <FaComments className="text-xl" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
