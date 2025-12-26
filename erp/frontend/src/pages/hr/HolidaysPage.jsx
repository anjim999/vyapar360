// src/pages/hr/HolidaysPage.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaCalendarAlt, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Table, Badge, Modal, Input, ConfirmModal } from "../../components/common";
import hrService from "../../services/hrService";

export default function HolidaysPage() {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedHoliday, setSelectedHoliday] = useState(null);
    const [formData, setFormData] = useState({ name: "", date: "", is_optional: false });
    const [saving, setSaving] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => { fetchData(); }, [year]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await hrService.getHolidays(year);
            setHolidays(res.data || []);
        } catch (err) { toast.error("Failed to fetch holidays"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.date) return toast.error("Fill all fields");
        setSaving(true);
        try {
            await hrService.createHoliday(formData);
            toast.success("Holiday added");
            setShowModal(false);
            setFormData({ name: "", date: "", is_optional: false });
            fetchData();
        } catch (err) { toast.error("Failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await hrService.deleteHoliday(selectedHoliday.id);
            toast.success("Holiday deleted");
            setShowDeleteModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const columns = [
        { key: "name", label: "Holiday Name" },
        { key: "date", label: "Date", render: v => new Date(v).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) },
        { key: "is_optional", label: "Type", render: v => <Badge variant={v ? "warning" : "success"}>{v ? "Optional" : "Mandatory"}</Badge> },
        {
            key: "actions", label: "", sortable: false, render: (_, r) => (
                <button onClick={() => { setSelectedHoliday(r); setShowDeleteModal(true); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><FaTrash /></button>
            )
        },
    ];

    const years = Array.from({ length: 5 }, (_, i) => ({ value: new Date().getFullYear() - 2 + i, label: (new Date().getFullYear() - 2 + i).toString() }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">Holidays</h1>
                    <p className="theme-text-muted">Company holidays for {year}</p>
                </div>
                <Button icon={<FaPlus />} onClick={() => setShowModal(true)}>Add Holiday</Button>
            </div>
            <Card padding="md">
                <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="px-4 py-2 rounded-lg theme-bg-secondary theme-border border">
                    {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                </select>
            </Card>
            <div className="grid grid-cols-2 gap-4">
                <Card padding="md" hover><p className="text-sm theme-text-muted">Total Holidays</p><p className="text-2xl font-bold">{holidays.length}</p></Card>
                <Card padding="md" hover><p className="text-sm theme-text-muted">Optional</p><p className="text-2xl font-bold">{holidays.filter(h => h.is_optional).length}</p></Card>
            </div>
            <Card padding="none"><Table columns={columns} data={holidays} loading={loading} emptyMessage="No holidays" /></Card>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Holiday">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Holiday Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Diwali" required />
                    <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                    <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_optional} onChange={e => setFormData({ ...formData, is_optional: e.target.checked })} /> Optional holiday</label>
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Add</Button></div>
                </form>
            </Modal>
            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Holiday" message={`Delete "${selectedHoliday?.name}"?`} variant="danger" />
        </div>
    );
}
