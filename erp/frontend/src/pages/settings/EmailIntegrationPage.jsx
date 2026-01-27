// src/pages/settings/EmailIntegrationPage.jsx - Gmail/Email Integration Settings
import { useState, useEffect } from 'react';
import { FaGoogle, FaLink, FaUnlink, FaEnvelope, FaSync, FaSearch } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axiosClient';
import { Card, Button, Loader, Modal } from '../../components/common';

export default function EmailIntegrationPage() {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [gmailStatus, setGmailStatus] = useState({ isConnected: false, profile: null });
    const [emails, setEmails] = useState([]);
    const [emailsLoading, setEmailsLoading] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [composeModal, setComposeModal] = useState(false);

    useEffect(() => {
        checkStatus();

        // Handle OAuth redirect
        if (searchParams.get('connected') === 'true') {
            alert('Gmail connected successfully!');
        }
        if (searchParams.get('error')) {
            alert('Failed to connect Gmail. Please try again.');
        }
    }, [searchParams]);

    const checkStatus = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/gmail/status');
            setGmailStatus(res.data);

            if (res.data.isConnected) {
                fetchEmails();
            }
        } catch (error) {
            console.error('Status check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectGmail = async () => {
        try {
            const res = await api.get('/api/gmail/auth-url');
            window.location.href = res.data.authUrl;
        } catch (error) {
            console.error('Failed to get auth URL:', error);
            alert('Failed to initiate Gmail connection');
        }
    };

    const disconnectGmail = async () => {
        if (!confirm('Are you sure you want to disconnect Gmail?')) return;

        try {
            await api.delete('/api/gmail/disconnect');
            setGmailStatus({ isConnected: false, profile: null });
            setEmails([]);
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    };

    const fetchEmails = async (query = '') => {
        try {
            setEmailsLoading(true);
            const params = query ? { query } : {};
            const res = await api.get('/api/gmail/emails', { params });
            setEmails(res.data.messages || []);
        } catch (error) {
            console.error('Failed to fetch emails:', error);
        } finally {
            setEmailsLoading(false);
        }
    };

    const viewEmail = async (messageId) => {
        try {
            const res = await api.get(`/api/gmail/emails/${messageId}`);
            setSelectedEmail(res.data.email);
        } catch (error) {
            console.error('Failed to view email:', error);
        }
    };

    if (loading) {
        return <Loader text="Checking connection status..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">📧 Email Integration</h1>
                    <p className="theme-text-muted text-sm">Connect your Gmail to send and receive emails within Vyapar360</p>
                </div>
            </div>

            {/* Gmail Connection Card */}
            <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-yellow-500/10 rounded-full -mr-16 -mt-16" />

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center">
                        <FaGoogle className="text-white text-2xl" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold theme-text-primary">Gmail</h3>
                        {gmailStatus.isConnected ? (
                            <div>
                                <p className="text-sm text-green-500 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    Connected
                                </p>
                                {gmailStatus.profile && (
                                    <p className="text-sm theme-text-muted">{gmailStatus.profile.emailAddress}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm theme-text-muted">Not connected</p>
                        )}
                    </div>

                    {gmailStatus.isConnected ? (
                        <Button variant="danger" onClick={disconnectGmail}>
                            <FaUnlink className="mr-2" /> Disconnect
                        </Button>
                    ) : (
                        <Button onClick={connectGmail}>
                            <FaLink className="mr-2" /> Connect Gmail
                        </Button>
                    )}
                </div>
            </Card>

            {/* Email Inbox (if connected) */}
            {gmailStatus.isConnected && (
                <Card title="📥 Recent Emails">
                    <div className="mb-4 flex gap-2">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" />
                            <input
                                type="text"
                                placeholder="Search emails..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary"
                                onKeyDown={(e) => e.key === 'Enter' && fetchEmails(e.target.value)}
                            />
                        </div>
                        <Button variant="secondary" onClick={() => fetchEmails()}>
                            <FaSync className={emailsLoading ? 'animate-spin' : ''} /> Refresh
                        </Button>
                        <Button onClick={() => setComposeModal(true)}>
                            <FaEnvelope className="mr-2" /> Compose
                        </Button>
                    </div>

                    {emailsLoading ? (
                        <div className="py-8 text-center theme-text-muted">Loading emails...</div>
                    ) : emails.length === 0 ? (
                        <div className="py-8 text-center theme-text-muted">No emails found</div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {emails.map(email => (
                                <div
                                    key={email.id}
                                    onClick={() => viewEmail(email.id)}
                                    className={`p-3 rounded-lg border theme-border-light hover:theme-bg-tertiary transition-colors cursor-pointer ${email.isUnread ? 'bg-blue-50 dark:bg-blue-900/20' : 'theme-bg-secondary'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${email.isUnread ? 'font-semibold' : ''} theme-text-primary`}>
                                                {email.from}
                                            </p>
                                            <p className="text-sm theme-text-secondary truncate">{email.subject}</p>
                                            <p className="text-xs theme-text-muted line-clamp-1">{email.snippet}</p>
                                        </div>
                                        <span className="text-xs theme-text-muted whitespace-nowrap ml-4">
                                            {new Date(email.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Features Info */}
            {!gmailStatus.isConnected && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: '📥', title: 'View Emails', desc: 'See your inbox directly in Vyapar360' },
                        { icon: '📤', title: 'Send Emails', desc: 'Compose and send emails to contacts' },
                        { icon: '🔗', title: 'Auto-log', desc: 'Emails automatically linked to CRM contacts' }
                    ].map((feature, i) => (
                        <Card key={i} className="text-center py-6">
                            <span className="text-4xl">{feature.icon}</span>
                            <h4 className="font-semibold theme-text-primary mt-2">{feature.title}</h4>
                            <p className="text-sm theme-text-muted mt-1">{feature.desc}</p>
                        </Card>
                    ))}
                </div>
            )}

            {/* Email View Modal */}
            <Modal
                isOpen={!!selectedEmail}
                onClose={() => setSelectedEmail(null)}
                title={selectedEmail?.subject || 'Email'}
                size="lg"
            >
                {selectedEmail && (
                    <div className="space-y-4">
                        <div className="text-sm theme-text-secondary">
                            <p><strong>From:</strong> {selectedEmail.from}</p>
                            <p><strong>To:</strong> {selectedEmail.to}</p>
                            <p><strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}</p>
                        </div>
                        <div className="border-t theme-border-light pt-4">
                            <div
                                className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Compose Modal */}
            <Modal
                isOpen={composeModal}
                onClose={() => setComposeModal(false)}
                title="Compose Email"
            >
                <ComposeEmail
                    onClose={() => setComposeModal(false)}
                    onSent={() => {
                        setComposeModal(false);
                        fetchEmails();
                    }}
                />
            </Modal>
        </div>
    );
}

// Compose Email Component
function ComposeEmail({ onClose, onSent }) {
    const [form, setForm] = useState({ to: '', subject: '', body: '' });
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!form.to || !form.subject || !form.body) {
            alert('Please fill all fields');
            return;
        }

        setSending(true);
        try {
            await api.post('/api/gmail/send', form);
            alert('Email sent successfully!');
            onSent();
        } catch (error) {
            console.error('Send failed:', error);
            alert('Failed to send email');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-4">
            <input
                type="email"
                placeholder="To"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary"
            />
            <input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary"
            />
            <textarea
                placeholder="Message"
                rows={8}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary"
            />
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSend} disabled={sending}>
                    {sending ? 'Sending...' : 'Send Email'}
                </Button>
            </div>
        </div>
    );
}
