// src/components/Meetings.jsx - Meeting Links Component
import { useState, useEffect } from 'react';
import { FaVideo, FaPlus, FaExternalLinkAlt, FaCalendarAlt, FaClock, FaTrash, FaEdit } from 'react-icons/fa';
import { SiZoom, SiGooglemeet, SiMicrosoftteams } from 'react-icons/si';
import { toast } from 'react-toastify';
import api from '../api/axiosClient';
import { format, isPast, isFuture } from 'date-fns';
import Modal from './common/Modal';
import { Input, Textarea, Select, Button } from './common';

const platformIcons = {
    zoom: <SiZoom className="text-blue-500" />,
    meet: <SiGooglemeet className="text-green-500" />,
    teams: <SiMicrosoftteams className="text-purple-500" />,
    other: <FaVideo className="text-gray-500" />
};

const platformOptions = [
    { value: 'zoom', label: 'Zoom' },
    { value: 'meet', label: 'Google Meet' },
    { value: 'teams', label: 'Microsoft Teams' },
    { value: 'other', label: 'Other' }
];

export function MeetingCard({ meeting, onEdit, onDelete }) {
    const isUpcoming = isFuture(new Date(meeting.scheduled_at));
    const isPastMeeting = isPast(new Date(meeting.scheduled_at));

    return (
        <div className={`p-4 rounded-xl border theme-border-light ${isPastMeeting ? 'opacity-60' : 'theme-bg-tertiary'}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                        {platformIcons[meeting.platform] || platformIcons.other}
                    </div>
                    <div>
                        <h4 className="font-medium theme-text-primary">{meeting.title}</h4>
                        {meeting.project_name && (
                            <p className="text-sm text-blue-500">{meeting.project_name}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-sm theme-text-muted">
                            <span className="flex items-center gap-1">
                                <FaCalendarAlt />
                                {format(new Date(meeting.scheduled_at), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                                <FaClock />
                                {format(new Date(meeting.scheduled_at), 'h:mm a')}
                            </span>
                            <span>({meeting.duration_minutes} min)</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isUpcoming && (
                        <a
                            href={meeting.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                        >
                            <FaExternalLinkAlt /> Join
                        </a>
                    )}
                    <button onClick={() => onEdit?.(meeting)} className="p-2 theme-text-muted hover:text-blue-500">
                        <FaEdit />
                    </button>
                    <button onClick={() => onDelete?.(meeting.id)} className="p-2 theme-text-muted hover:text-red-500">
                        <FaTrash />
                    </button>
                </div>
            </div>
            {meeting.description && (
                <p className="mt-3 text-sm theme-text-secondary">{meeting.description}</p>
            )}
        </div>
    );
}

export function MeetingForm({ projectId, meeting, onClose, onSuccess }) {
    const [form, setForm] = useState({
        title: meeting?.title || '',
        description: meeting?.description || '',
        meeting_link: meeting?.meeting_link || '',
        platform: meeting?.platform || 'zoom',
        scheduled_at: meeting?.scheduled_at ? format(new Date(meeting.scheduled_at), "yyyy-MM-dd'T'HH:mm") : '',
        duration_minutes: meeting?.duration_minutes || 60,
        project_id: projectId || meeting?.project_id || null
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.meeting_link || !form.scheduled_at) {
            return toast.error('Please fill in all required fields');
        }

        setLoading(true);
        try {
            if (meeting?.id) {
                await api.put(`/api/meetings/${meeting.id}`, form);
                toast.success('Meeting updated');
            } else {
                await api.post('/api/meetings', form);
                toast.success('Meeting scheduled');
            }
            onSuccess?.();
            onClose?.();
        } catch (err) {
            toast.error('Failed to save meeting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Meeting Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Weekly standup"
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <Select
                    label="Platform"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    options={platformOptions}
                />
                <Input
                    label="Duration (minutes)"
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                    min={15}
                    step={15}
                />
            </div>

            <Input
                label="Meeting Link *"
                value={form.meeting_link}
                onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                placeholder="https://zoom.us/j/1234567890"
                required
            />

            <Input
                label="Scheduled Date & Time *"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                required
            />

            <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Meeting agenda..."
                rows={3}
            />

            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={loading}>
                    {meeting?.id ? 'Update Meeting' : 'Schedule Meeting'}
                </Button>
            </div>
        </form>
    );
}

export function MeetingsList({ projectId }) {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMeeting, setEditMeeting] = useState(null);

    useEffect(() => {
        fetchMeetings();
    }, [projectId]);

    const fetchMeetings = async () => {
        try {
            const url = projectId
                ? `/api/meetings/project/${projectId}`
                : '/api/meetings/upcoming';
            const res = await api.get(url);
            setMeetings(res.data.data || []);
        } catch (err) {
            console.error('Error fetching meetings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this meeting?')) return;
        try {
            await api.delete(`/api/meetings/${id}`);
            toast.success('Meeting deleted');
            fetchMeetings();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleEdit = (meeting) => {
        setEditMeeting(meeting);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold theme-text-primary flex items-center gap-2">
                    <FaVideo /> Meetings
                </h3>
                <Button size="sm" icon={<FaPlus />} onClick={() => { setEditMeeting(null); setShowModal(true); }}>
                    Schedule Meeting
                </Button>
            </div>

            {meetings.length === 0 ? (
                <div className="text-center py-8 theme-text-muted">
                    <FaVideo className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>No meetings scheduled</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {meetings.map(meeting => (
                        <MeetingCard
                            key={meeting.id}
                            meeting={meeting}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
                size="md"
            >
                <MeetingForm
                    projectId={projectId}
                    meeting={editMeeting}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchMeetings}
                />
            </Modal>
        </div>
    );
}

export default MeetingsList;
