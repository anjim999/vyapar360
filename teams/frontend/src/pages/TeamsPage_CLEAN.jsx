// src/pages/TeamsPage.jsx - Microsoft Teams Professional Interface with Full Features
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    FaPaperPlane, FaSmile, FaPaperclip, FaUsers, FaPlus, FaHashtag, FaComments,
    FaThumbsUp, FaHeart, FaLaugh, FaTimes, FaSearch, FaUser, FaVideo, FaPhone,
    FaCalendarAlt, FaCloud, FaEllipsisH, FaTh, FaBell, FaRobot, FaCompass,
    FaAt, FaStar, FaCog, FaChevronDown, FaChevronRight, FaChevronLeft, FaLock, FaGlobe,
    FaMicrophone, FaImage, FaGift, FaReply, FaEllipsisV, FaCheck, FaCheckDouble,
    FaFile, FaDownload, FaTrash, FaEdit, FaBold, FaItalic, FaLink, FaList, FaShare,
    FaFilePdf, FaPlay, FaPause, FaBackward, FaForward, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../api/axiosClient';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-toastify';

// Extracted Components
import ChatHeader from '../components/chat/header/ChatHeader';
import ChatSidebar from '../components/chat/sidebar/ChatSidebar';
import ContactInfoSidebar from '../components/chat/sidebar/ContactInfoSidebar';
import StarredMessagesView from '../components/chat/sidebar/StarredMessagesView';
import MessageInput from '../components/chat/message/MessageInput';
import MessageList from '../components/chat/message/MessageList';
import CreateGroupModal from '../components/chat/modals/CreateGroupModal';
import DeleteModal from '../components/chat/modals/DeleteModal';
import ComingSoonModal from '../components/chat/modals/ComingSoonModal';
import ForwardMessageModal from '../components/chat/modals/ForwardMessageModal';
import TeamSettingsModal from '../components/chat/modals/TeamSettingsModal';
import CreateChannelModal from '../components/chat/modals/CreateChannelModal';
import EditChannelModal from '../components/chat/modals/EditChannelModal';
import AddMemberModal from '../components/chat/modals/AddMemberModal';
import ReactionsModal from '../components/chat/modals/ReactionsModal';
import ImagePreviewModal from '../components/chat/modals/ImagePreviewModal';
import CustomVideoPlayer from '../components/chat/common/VideoPlayer';
import Modal from '../components/chat/common/Modal';
import { NavItem, TabButton, QuickAction, ChatItem } from '../components/chat/common/ChatComponents';
import { EMOJI_LIST, GEM INI_RESPONSES } from '../utils/chatConstants';

// ========== TEAMS PAGE COMPONENT ==========
export default function TeamsPage() {
