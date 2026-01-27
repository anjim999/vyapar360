// src/pages/settings/EmailTemplatesPage.jsx - Email Template Manager
import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaPaperPlane, FaCode } from 'react-icons/fa';
import api from '../../api/axiosClient';
import { Card, Button, Modal, Loader } from '../../components/common';

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [editModal, setEditModal] = useState({ open: false, template: null });
    const [previewModal, setPreviewModal] = useState({ open: false, template: null, html: '' });
    const [testModal, setTestModal] = useState({ open: false, template: null });

    useEffect(() => {
        fetchTemplates();
    }, [selectedCategory]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const params = selectedCategory ? { category: selectedCategory } : {};
            const res = await api.get('/api/email-templates', { params });
            setTemplates(res.data.templates || []);
            setCategories(res.data.categories || []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (template) => {
        try {
            const res = await api.post(`/api/email-templates/${template.id}/preview`, {
                variables: {
                    user_name: 'John Doe',
                    user_email: 'john@example.com',
                    company_name: 'Sample Company',
                    customer_name: 'Customer Name',
                    invoice_number: 'INV-001',
                    amount: '10,000',
                    due_date: '2026-01-15'
                }
            });
            setPreviewModal({ open: true, template, html: res.data.preview.body });
        } catch (error) {
            console.error('Preview failed:', error);
        }
    };

    const handleDelete = async (template) => {
        if (!confirm(`Delete template "${template.name}"?`)) return;

        try {
            await api.delete(`/api/email-templates/${template.id}`);
            fetchTemplates();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleSendTest = async (template, email) => {
        try {
            await api.post(`/api/email-templates/${template.id}/send-test`, {
                recipientEmail: email,
                variables: {
                    user_name: 'Test User',
                    company_name: 'Test Company'
                }
            });
            alert('Test email sent successfully!');
            setTestModal({ open: false, template: null });
        } catch (error) {
            alert('Failed to send test email');
        }
    };

    if (loading) {
        return <Loader text="Loading templates..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">📧 Email Templates</h1>
                    <p className="theme-text-muted text-sm">Customize emails sent from Vyapar360</p>
                </div>
                <Button onClick={() => setEditModal({ open: true, template: null })}>
                    <FaPlus className="mr-2" /> New Template
                </Button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${!selectedCategory
                            ? 'bg-blue-500 text-white'
                            : 'theme-bg-tertiary theme-text-secondary hover:theme-bg-hover'
                        }`}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${selectedCategory === cat.value
                                ? 'bg-blue-500 text-white'
                                : 'theme-bg-tertiary theme-text-secondary hover:theme-bg-hover'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                    <Card key={template.id} className="relative">
                        {template.is_default && (
                            <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                System
                            </span>
                        )}
                        <h3 className="font-semibold theme-text-primary mb-2">{template.name}</h3>
                        <p className="text-sm theme-text-muted mb-2 line-clamp-1">{template.subject}</p>
                        <span className="text-xs px-2 py-1 rounded-full theme-bg-tertiary theme-text-secondary">
                            {template.category}
                        </span>

                        <div className="flex gap-2 mt-4 pt-4 border-t theme-border-light">
                            <button
                                onClick={() => handlePreview(template)}
                                className="flex-1 py-2 text-sm rounded-lg theme-bg-tertiary hover:theme-bg-hover transition-colors flex items-center justify-center gap-1"
                            >
                                <FaEye className="w-3 h-3" /> Preview
                            </button>
                            {!template.is_default && (
                                <>
                                    <button
                                        onClick={() => setEditModal({ open: true, template })}
                                        className="p-2 rounded-lg theme-bg-tertiary hover:theme-bg-hover"
                                    >
                                        <FaEdit className="w-4 h-4 text-blue-500" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template)}
                                        className="p-2 rounded-lg theme-bg-tertiary hover:theme-bg-hover"
                                    >
                                        <FaTrash className="w-4 h-4 text-red-500" />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setTestModal({ open: true, template })}
                                className="p-2 rounded-lg theme-bg-tertiary hover:theme-bg-hover"
                            >
                                <FaPaperPlane className="w-4 h-4 text-green-500" />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {templates.length === 0 && (
                <div className="text-center py-12 theme-text-muted">
                    <p>No templates found</p>
                </div>
            )}

            {/* Preview Modal */}
            <Modal
                isOpen={previewModal.open}
                onClose={() => setPreviewModal({ open: false, template: null, html: '' })}
                title={`Preview: ${previewModal.template?.name || ''}`}
                size="lg"
            >
                <div className="bg-white rounded-lg p-6 max-h-96 overflow-auto">
                    <div dangerouslySetInnerHTML={{ __html: previewModal.html }} />
                </div>
            </Modal>

            {/* Test Email Modal */}
            <Modal
                isOpen={testModal.open}
                onClose={() => setTestModal({ open: false, template: null })}
                title="Send Test Email"
            >
                <TestEmailForm
                    template={testModal.template}
                    onSend={handleSendTest}
                    onCancel={() => setTestModal({ open: false, template: null })}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, template: null })}
                title={editModal.template ? 'Edit Template' : 'New Template'}
                size="lg"
            >
                <TemplateForm
                    template={editModal.template}
                    categories={categories}
                    onSave={() => {
                        setEditModal({ open: false, template: null });
                        fetchTemplates();
                    }}
                    onCancel={() => setEditModal({ open: false, template: null })}
                />
            </Modal>
        </div>
    );
}

// Test Email Form Component
function TestEmailForm({ template, onSend, onCancel }) {
    const [email, setEmail] = useState('');

    return (
        <div className="space-y-4">
            <p className="text-sm theme-text-muted">
                Send a test email using the "{template?.name}" template
            </p>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter recipient email"
                className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary"
            />
            <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSend(template, email)} disabled={!email}>
                    <FaPaperPlane className="mr-2" /> Send Test
                </Button>
            </div>
        </div>
    );
}

// Template Form Component
function TemplateForm({ template, categories, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: template?.name || '',
        slug: template?.slug || '',
        subject: template?.subject || '',
        body: template?.body || '',
        category: template?.category || 'general',
        variables: template?.variables || []
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (template) {
                await api.put(`/api/email-templates/${template.id}`, form);
            } else {
                await api.post('/api/email-templates', form);
            }
            onSave();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">Slug</label>
                    <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary"
                        required
                        disabled={!!template}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">Category</label>
                <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary"
                >
                    {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">Subject</label>
                <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary"
                    placeholder="Use {{variable_name}} for dynamic content"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">
                    Body (HTML)
                    <span className="text-xs theme-text-muted ml-2">Use {"{{variable_name}}"} for dynamic content</span>
                </label>
                <textarea
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary font-mono text-sm"
                    required
                />
            </div>

            <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Template'}
                </Button>
            </div>
        </form>
    );
}
