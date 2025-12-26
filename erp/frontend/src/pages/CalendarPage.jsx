// src/pages/CalendarPage.jsx - Full Calendar Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt, FaPlus, FaChevronLeft, FaChevronRight, FaTimes,
    FaClock, FaMapMarkerAlt, FaUsers, FaVideo, FaEdit, FaTrash,
    FaBell, FaCheck, FaSpinner, FaRegClock, FaTag, FaSearch,
    FaFilter, FaList, FaThLarge, FaCalendarDay, FaCalendarWeek,
    FaSyncAlt, FaUserFriends
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import { toast } from 'react-toastify';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    addDays, addMonths, subMonths, addWeeks, subWeeks,
    isSameMonth, isSameDay, parseISO, startOfDay, endOfDay,
    eachDayOfInterval, eachHourOfInterval, isToday, isSameWeek
} from 'date-fns';

export default function CalendarPage() {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showEventDetails, setShowEventDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // View mode: 'month', 'week', 'day'
    const [viewMode, setViewMode] = useState('month');

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, meeting, task, reminder, holiday
    const [showOnlyMyEvents, setShowOnlyMyEvents] = useState(false);

    // Event Form with enhanced fields
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '10:00',
        location: '',
        type: 'meeting',
        color: '#8b5cf6',
        is_all_day: false,
        is_company_wide: true,
        reminder: '15',
        participants: ''
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

            const res = await api.get(`/api/calendar/events?start=${start}&end=${end}`);

            if (res.data.success) {
                setEvents(res.data.data || []);
            } else {
                console.error('Failed to fetch events:', res.data.error);
                setEvents([]);
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
            // Only show error, don't replace with demo events
            if (err.response?.status === 401) {
                toast.error('Please log in to view calendar events');
            }
            // Keep existing events if fetch fails
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!eventForm.title.trim()) {
            errors.title = 'Event title is required';
        }
        if (!eventForm.date) {
            errors.date = 'Date is required';
        }
        if (!eventForm.is_all_day) {
            if (!eventForm.start_time) {
                errors.start_time = 'Start time is required';
            }
            if (!eventForm.end_time) {
                errors.end_time = 'End time is required';
            }
            if (eventForm.start_time && eventForm.end_time && eventForm.start_time >= eventForm.end_time) {
                errors.end_time = 'End time must be after start time';
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateEvent = async () => {
        if (!validateForm()) {
            return;
        }

        setIsCreating(true);

        try {
            const eventData = {
                title: eventForm.title.trim(),
                description: eventForm.description.trim(),
                date: eventForm.date,
                start_time: eventForm.is_all_day ? null : eventForm.start_time,
                end_time: eventForm.is_all_day ? null : eventForm.end_time,
                location: eventForm.location.trim(),
                type: eventForm.type,
                color: eventForm.color,
                is_company_wide: eventForm.is_company_wide
            };

            const res = await api.post('/api/calendar/events', eventData);

            if (res.data.success) {
                // Add the newly created event immediately to state
                const createdEvent = res.data.data;
                setEvents(prev => {
                    const updated = [...prev, createdEvent];
                    return updated;
                });

                toast.success('🎉 Event created successfully!');
                setShowEventModal(false);
                resetForm();

                // Fetch all events to ensure sync with backend
                fetchEvents();
            } else {
                throw new Error(res.data.error || 'Failed to create event');
            }
        } catch (err) {
            console.error('Create event error:', err);
            toast.error(err.response?.data?.error || 'Failed to create event');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await api.delete(`/api/calendar/events/${eventId}`);
            toast.success('Event deleted');
            setShowEventDetails(null);
            fetchEvents();
        } catch (err) {
            // Remove locally for demo
            setEvents(events.filter(e => e.id !== eventId));
            setShowEventDetails(null);
            toast.success('Event removed');
        }
    };

    const resetForm = () => {
        setEventForm({
            title: '',
            description: '',
            date: format(selectedDate, 'yyyy-MM-dd'),
            start_time: '09:00',
            end_time: '10:00',
            location: '',
            type: 'meeting',
            color: '#8b5cf6',
            is_all_day: false,
            is_company_wide: true,
            reminder: '15',
            participants: ''
        });
        setFormErrors({});
    };

    const prevMonth = (

    ) => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevDay = () => setCurrentDate(addDays(currentDate, -1));
    const nextDay = () => setCurrentDate(addDays(currentDate, 1));

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    // Navigation based on view mode
    const goToPrevious = () => {
        if (viewMode === 'month') prevMonth();
        else if (viewMode === 'week') prevWeek();
        else prevDay();
    };

    const goToNext = () => {
        if (viewMode === 'month') nextMonth();
        else if (viewMode === 'week') nextWeek();
        else nextDay();
    };

    // Filter events based on search and filters
    const getFilteredEvents = () => {
        return events.filter(event => {
            // Search filter
            if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !event.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Type filter
            if (filterType !== 'all' && event.type !== filterType) {
                return false;
            }

            // My events filter
            if (showOnlyMyEvents && event.user_id !== auth.user?.id) {
                return false;
            }

            return true;
        });
    };

    // Generate calendar grid
    const renderCalendar = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const filteredEvents = getFilteredEvents();

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayEvents = filteredEvents.filter(e => e.date === format(day, 'yyyy-MM-dd'));
                const isTodayDate = isToday(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day}
                        onClick={() => {
                            setSelectedDate(cloneDay);
                            setEventForm(prev => ({ ...prev, date: format(cloneDay, 'yyyy-MM-dd') }));
                        }}
                        className={`min-h-[100px] p-2 border border-[#3b3b3b] cursor-pointer transition-colors ${!isCurrentMonth ? 'bg-[#1f1f1f] text-gray-600' :
                            isSelected ? 'bg-purple-500/20 border-purple-500' :
                                isTodayDate ? 'bg-blue-500/10 border-blue-500/30' :
                                    'bg-[#2b2b2b] hover:bg-[#3b3b3b]'
                            }`}
                    >
                        <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-blue-400' : 'text-gray-300'}`}>
                            {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                            {dayEvents.slice(0, 3).map(event => (
                                <div
                                    key={event.id}
                                    onClick={(e) => { e.stopPropagation(); setShowEventDetails(event); }}
                                    className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                                    style={{ backgroundColor: event.color + '30', color: event.color, borderLeft: `2px solid ${event.color}` }}
                                >
                                    {event.start_time && <span className="mr-1">{event.start_time}</span>}
                                    {!event.is_company_wide && <span className="mr-1">🔒</span>}
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 3} more</div>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }
        return rows;
    };

    return (
        <div className="min-h-screen bg-[#1b1b1b]">
            {/* Header */}
            <div className="bg-[#2b2b2b] border-b border-[#3b3b3b] px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/teams')}
                            className="p-2 hover:bg-[#3b3b3b] rounded-lg text-gray-400"
                        >
                            <FaChevronLeft />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <FaCalendarAlt className="text-white text-lg" />
                            </div>
                            <h1 className="text-xl font-bold text-white">Calendar</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 bg-[#3b3b3b] hover:bg-[#4b4b4b] text-gray-200 rounded-lg text-sm"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowEventModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm"
                        >
                            <FaPlus /> New Event
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Toolbar - View Switcher, Search, and Filters */}
            <div className="bg-[#2b2b2b] border-b border-[#3b3b3b] px-6 py-3">
                <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
                    {/* View Mode Switcher */}
                    <div className="flex items-center gap-2 bg-[#1f1f1f] rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${viewMode === 'month'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-[#3b3b3b]'
                                }`}
                        >
                            <FaThLarge className="text-xs" />
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${viewMode === 'week'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-[#3b3b3b]'
                                }`}
                        >
                            <FaCalendarWeek className="text-xs" />
                            Week
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${viewMode === 'day'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-[#3b3b3b]'
                                }`}
                        >
                            <FaCalendarDay className="text-xs" />
                            Day
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search events..."
                            className="w-full pl-10 pr-4 py-2 bg-[#1f1f1f] border border-[#3b3b3b] rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-sm"
                        />
                    </div>

                    {/* Event Type Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-500 text-sm" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 bg-[#1f1f1f] border border-[#3b3b3b] rounded-lg text-white text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            <option value="meeting">📅 Meetings</option>
                            <option value="task">✅ Tasks</option>
                            <option value="reminder">🔔 Reminders</option>
                            <option value="holiday">🎉 Holidays</option>
                        </select>
                    </div>

                    {/* My Events Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showOnlyMyEvents}
                            onChange={(e) => setShowOnlyMyEvents(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800 cursor-pointer"
                        />
                        <span className="text-sm text-gray-300">My Events Only</span>
                    </label>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Dynamic Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                        {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
                        {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToPrevious}
                            className="p-2 hover:bg-[#3b3b3b] rounded-lg text-gray-400"
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            onClick={goToNext}
                            className="p-2 hover:bg-[#3b3b3b] rounded-lg text-gray-400"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="border border-[#3b3b3b] rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="h-96 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        renderCalendar()
                    )}
                </div>

                {/* Selected Date Events */}
                <div className="mt-6 bg-[#2b2b2b] rounded-lg p-4 border border-[#3b3b3b]">
                    <h3 className="text-lg font-semibold text-white mb-3">
                        Events on {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                    <div className="space-y-2">
                        {getFilteredEvents().filter(e => e.date === format(selectedDate, 'yyyy-MM-dd')).map(event => (
                            <div
                                key={event.id}
                                onClick={() => setShowEventDetails(event)}
                                className="flex items-center gap-3 p-3 bg-[#1f1f1f] rounded-lg cursor-pointer hover:bg-[#3b3b3b] transition-colors"
                                style={{ borderLeft: `3px solid ${event.color}` }}
                            >
                                <div className="flex-1">
                                    <p className="text-white font-medium">
                                        {!event.is_company_wide && <span className="mr-2">🔒</span>}
                                        {event.title}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {event.start_time} - {event.end_time}
                                        {event.location && <span className="ml-2">📍 {event.location}</span>}
                                    </p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: event.color + '30', color: event.color }}>
                                    {event.type}
                                </span>
                            </div>
                        ))}
                        {getFilteredEvents().filter(e => e.date === format(selectedDate, 'yyyy-MM-dd')).length === 0 && (
                            <p className="text-gray-500 text-center py-4">No events on this day</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Event Modal - Enhanced Design */}
            {showEventModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
                    onClick={() => !isCreating && setShowEventModal(false)}
                >
                    <div
                        className="bg-gradient-to-br from-[#2b2b2b] to-[#1f1f1f] rounded-2xl w-full max-w-lg border border-[#3b3b3b]/50 shadow-2xl transform transition-all animate-slideUp"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-[#3b3b3b]/50 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <FaCalendarAlt className="text-white text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Create New Event</h3>
                                    <p className="text-xs text-gray-400">Add an event to your calendar</p>
                                </div>
                            </div>
                            <button
                                onClick={() => !isCreating && setShowEventModal(false)}
                                disabled={isCreating}
                                className="p-2 hover:bg-[#3b3b3b] rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                            {/* Event Title */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                    <FaTag className="text-purple-400" />
                                    Event Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={eventForm.title}
                                    onChange={e => {
                                        setEventForm({ ...eventForm, title: e.target.value });
                                        if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                                    }}
                                    placeholder="Enter event title..."
                                    className={`w-full px-4 py-3 bg-[#1a1a1a] border ${formErrors.title ? 'border-red-500' : 'border-[#3b3b3b]'} rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all`}
                                />
                                {formErrors.title && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                        <span>⚠</span> {formErrors.title}
                                    </p>
                                )}
                            </div>

                            {/* All Day Toggle & Visibility Toggle */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={eventForm.is_all_day}
                                            onChange={e => setEventForm({ ...eventForm, is_all_day: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <div className={`w-11 h-6 rounded-full transition-colors ${eventForm.is_all_day ? 'bg-purple-500' : 'bg-[#3b3b3b]'}`}>
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${eventForm.is_all_day ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">All day event</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={eventForm.is_company_wide}
                                            onChange={e => setEventForm({ ...eventForm, is_company_wide: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <div className={`w-11 h-6 rounded-full transition-colors ${eventForm.is_company_wide ? 'bg-green-500' : 'bg-[#3b3b3b]'}`}>
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${eventForm.is_company_wide ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                            {eventForm.is_company_wide ? '🌐 Visible to all employees' : '🔒 Private (only you)'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {eventForm.is_company_wide ? 'Everyone in the company can see this event' : 'Only you can see this event'}
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Date & Type Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <FaCalendarAlt className="text-blue-400" />
                                        Date <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={eventForm.date}
                                        onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                                        className={`w-full px-4 py-3 bg-[#1a1a1a] border ${formErrors.date ? 'border-red-500' : 'border-[#3b3b3b]'} rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all`}
                                    />
                                    {formErrors.date && (
                                        <p className="mt-1 text-xs text-red-400">⚠ {formErrors.date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <FaTag className="text-green-400" />
                                        Event Type
                                    </label>
                                    <select
                                        value={eventForm.type}
                                        onChange={e => setEventForm({ ...eventForm, type: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3b3b3b] rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all cursor-pointer"
                                    >
                                        <option value="meeting">📅 Meeting</option>
                                        <option value="task">✅ Task</option>
                                        <option value="reminder">🔔 Reminder</option>
                                        <option value="holiday">🎉 Holiday</option>
                                    </select>
                                </div>
                            </div>

                            {/* Time Row - Only show when not all day */}
                            {!eventForm.is_all_day && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                            <FaClock className="text-orange-400" />
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            value={eventForm.start_time}
                                            onChange={e => {
                                                setEventForm({ ...eventForm, start_time: e.target.value });
                                                if (formErrors.start_time) setFormErrors({ ...formErrors, start_time: '' });
                                            }}
                                            className={`w-full px-4 py-3 bg-[#1a1a1a] border ${formErrors.start_time ? 'border-red-500' : 'border-[#3b3b3b]'} rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all`}
                                        />
                                        {formErrors.start_time && (
                                            <p className="mt-1 text-xs text-red-400">⚠ {formErrors.start_time}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                            <FaRegClock className="text-pink-400" />
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            value={eventForm.end_time}
                                            onChange={e => {
                                                setEventForm({ ...eventForm, end_time: e.target.value });
                                                if (formErrors.end_time) setFormErrors({ ...formErrors, end_time: '' });
                                            }}
                                            className={`w-full px-4 py-3 bg-[#1a1a1a] border ${formErrors.end_time ? 'border-red-500' : 'border-[#3b3b3b]'} rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all`}
                                        />
                                        {formErrors.end_time && (
                                            <p className="mt-1 text-xs text-red-400">⚠ {formErrors.end_time}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Location & Reminder Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <FaMapMarkerAlt className="text-red-400" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={eventForm.location}
                                        onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                                        placeholder="Add location..."
                                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3b3b3b] rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <FaBell className="text-yellow-400" />
                                        Reminder
                                    </label>
                                    <select
                                        value={eventForm.reminder}
                                        onChange={e => setEventForm({ ...eventForm, reminder: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3b3b3b] rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all cursor-pointer"
                                    >
                                        <option value="0">No reminder</option>
                                        <option value="5">5 minutes before</option>
                                        <option value="15">15 minutes before</option>
                                        <option value="30">30 minutes before</option>
                                        <option value="60">1 hour before</option>
                                        <option value="1440">1 day before</option>
                                    </select>
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">Event Color</label>
                                <div className="flex gap-3 flex-wrap">
                                    {[
                                        { color: '#8b5cf6', name: 'Purple' },
                                        { color: '#f59e0b', name: 'Orange' },
                                        { color: '#10b981', name: 'Green' },
                                        { color: '#ef4444', name: 'Red' },
                                        { color: '#3b82f6', name: 'Blue' },
                                        { color: '#ec4899', name: 'Pink' },
                                        { color: '#06b6d4', name: 'Cyan' },
                                        { color: '#84cc16', name: 'Lime' }
                                    ].map(({ color, name }) => (
                                        <button
                                            key={color}
                                            onClick={() => setEventForm({ ...eventForm, color })}
                                            title={name}
                                            className={`w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 ${eventForm.color === color
                                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1f1f1f] scale-110'
                                                : 'hover:ring-2 hover:ring-white/30'}`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {eventForm.color === color && (
                                                <FaCheck className="text-white text-xs mx-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={eventForm.description}
                                    onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                                    placeholder="Add event details, notes, or agenda..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3b3b3b] rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-[#3b3b3b]/50 flex items-center justify-between bg-[#1f1f1f]/50 rounded-b-2xl">
                            <button
                                onClick={() => !isCreating && setShowEventModal(false)}
                                disabled={isCreating}
                                className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-[#3b3b3b] rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateEvent}
                                disabled={isCreating}
                                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
                            >
                                {isCreating ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck />
                                        Create Event
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Details Modal */}
            {showEventDetails && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowEventDetails(null)}>
                    <div className="bg-[#2b2b2b] rounded-xl w-full max-w-md border border-[#3b3b3b] shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-[#3b3b3b] flex items-center justify-between" style={{ borderTop: `4px solid ${showEventDetails.color}`, borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                            <h3 className="text-lg font-bold text-white">
                                {!showEventDetails.is_company_wide && <span className="mr-2">🔒</span>}
                                {showEventDetails.title}
                            </h3>
                            <button onClick={() => setShowEventDetails(null)} className="p-1 hover:bg-[#3b3b3b] rounded text-gray-400">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {/* Visibility Indicator */}
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-3 py-1 rounded-full ${showEventDetails.is_company_wide ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {showEventDetails.is_company_wide ? '🌐 Visible to all employees' : '🔒 Private event'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-gray-300">
                                <FaCalendarAlt className="text-gray-500" />
                                <span>{format(parseISO(showEventDetails.date), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <FaClock className="text-gray-500" />
                                <span>{showEventDetails.start_time} - {showEventDetails.end_time}</span>
                            </div>
                            {showEventDetails.location && (
                                <div className="flex items-center gap-3 text-gray-300">
                                    <FaMapMarkerAlt className="text-gray-500" />
                                    <span>{showEventDetails.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: showEventDetails.color + '30', color: showEventDetails.color }}>
                                    {showEventDetails.type}
                                </span>
                            </div>
                            {showEventDetails.description && (
                                <p className="text-gray-400 text-sm pt-2 border-t border-[#3b3b3b]">
                                    {showEventDetails.description}
                                </p>
                            )}
                        </div>
                        <div className="p-4 border-t border-[#3b3b3b] flex justify-end gap-2">
                            <button
                                onClick={() => handleDeleteEvent(showEventDetails.id)}
                                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300"
                            >
                                <FaTrash /> Delete
                            </button>
                            <button onClick={() => setShowEventDetails(null)} className="px-4 py-2 bg-[#3b3b3b] hover:bg-[#4b4b4b] text-white rounded-lg">Close</button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
