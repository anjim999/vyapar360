// src/pages/projects/TasksPage.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaTasks, FaFilter, FaCheck, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Badge, Modal, Input, Textarea, Select, StatCard } from "../../components/common";
import projectService from "../../services/projectService";
import hrService from "../../services/hrService";

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filterProject, setFilterProject] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [formData, setFormData] = useState({ project_id: "", title: "", description: "", assignee_id: "", priority: "medium", due_date: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); }, [filterProject, filterStatus]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterProject) params.project_id = filterProject;
            if (filterStatus) params.status = filterStatus;
            const [taskRes, projRes, empRes] = await Promise.all([
                projectService.getTasks(params),
                projectService.getProjects(),
                hrService.getEmployees()
            ]);
            setTasks(taskRes.data || []);
            setProjects(projRes.data || []);
            setEmployees(empRes.data || []);
        } catch (err) { toast.error("Failed"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.project_id) return toast.error("Title and project required");
        setSaving(true);
        try {
            if (selectedTask) {
                await projectService.updateTask(selectedTask.id, formData);
                toast.success("Updated");
            } else {
                await projectService.createTask(formData);
                toast.success("Created");
            }
            setShowModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
        finally { setSaving(false); }
    };

    const handleStatusChange = async (task, newStatus) => {
        try {
            await projectService.updateTask(task.id, { status: newStatus });
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const openModal = (task = null) => {
        setSelectedTask(task);
        setFormData(task ? { ...task } : { project_id: filterProject || "", title: "", description: "", assignee_id: "", priority: "medium", due_date: "" });
        setShowModal(true);
    };

    const priorityColors = { low: "default", medium: "warning", high: "danger", urgent: "danger" };
    const statusConfig = { todo: { label: "To Do", color: "bg-gray-500" }, in_progress: { label: "In Progress", color: "bg-blue-500" }, review: { label: "Review", color: "bg-purple-500" }, done: { label: "Done", color: "bg-green-500" } };

    const stats = { total: tasks.length, todo: tasks.filter(t => t.status === "todo").length, inProgress: tasks.filter(t => t.status === "in_progress").length, done: tasks.filter(t => t.status === "done").length };

    // Group tasks by status
    const tasksByStatus = { todo: tasks.filter(t => t.status === "todo"), in_progress: tasks.filter(t => t.status === "in_progress"), review: tasks.filter(t => t.status === "review"), done: tasks.filter(t => t.status === "done") };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold theme-text-primary">Tasks</h1><p className="theme-text-muted">Manage project tasks</p></div>
                <Button icon={<FaPlus />} onClick={() => openModal()}>Add Task</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Total Tasks" value={stats.total} icon={<FaTasks />} iconBg="blue" />
                <StatCard title="To Do" value={stats.todo} iconBg="gray" />
                <StatCard title="In Progress" value={stats.inProgress} iconBg="blue" />
                <StatCard title="Done" value={stats.done} icon={<FaCheck />} iconBg="green" />
            </div>
            <Card padding="md">
                <div className="flex gap-4">
                    <Select value={filterProject} onChange={e => setFilterProject(e.target.value)} options={projects.map(p => ({ value: p.id, label: p.name }))} placeholder="All Projects" className="w-48" />
                    <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={Object.entries(statusConfig).map(([k, v]) => ({ value: k, label: v.label }))} placeholder="All Status" className="w-40" />
                </div>
            </Card>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(statusConfig).map(([status, config]) => (
                    <div key={status} className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${config.color}`} />
                            <span className="font-medium theme-text-primary">{config.label}</span>
                            <span className="text-sm theme-text-muted">({tasksByStatus[status]?.length || 0})</span>
                        </div>
                        <div className="space-y-3 min-h-[200px] p-3 rounded-xl theme-bg-tertiary">
                            {tasksByStatus[status]?.map(task => (
                                <Card key={task.id} padding="sm" hover onClick={() => openModal(task)} className="cursor-pointer">
                                    <p className="font-medium theme-text-primary text-sm">{task.title}</p>
                                    <p className="text-xs theme-text-muted mt-1 line-clamp-2">{task.description}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <Badge variant={priorityColors[task.priority]} size="sm">{task.priority}</Badge>
                                        {task.assignee_name && <span className="text-xs theme-text-muted">{task.assignee_name}</span>}
                                    </div>
                                    {task.due_date && (
                                        <p className={`text-xs mt-1 flex items-center gap-1 ${new Date(task.due_date) < new Date() ? "text-red-500" : "theme-text-muted"}`}>
                                            <FaClock className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedTask ? "Edit Task" : "Add Task"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select label="Project" value={formData.project_id} onChange={e => setFormData({ ...formData, project_id: e.target.value })} options={projects.map(p => ({ value: p.id, label: p.name }))} required />
                    <Input label="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    <Textarea label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Assignee" value={formData.assignee_id} onChange={e => setFormData({ ...formData, assignee_id: e.target.value })} options={employees.map(e => ({ value: e.id, label: e.name }))} />
                        <Select label="Priority" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" }]} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Due Date" type="date" value={formData.due_date?.slice(0, 10)} onChange={e => setFormData({ ...formData, due_date: e.target.value })} />
                        {selectedTask && <Select label="Status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} options={Object.entries(statusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />}
                    </div>
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>{selectedTask ? "Update" : "Create"}</Button></div>
                </form>
            </Modal>
        </div>
    );
}
