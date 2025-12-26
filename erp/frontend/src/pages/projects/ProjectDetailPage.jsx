// src/pages/projects/ProjectDetailPage.jsx - Project Detail with Tasks
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft, FaEdit, FaTrash, FaPlus, FaCalendar, FaUser, FaDollarSign,
  FaTasks, FaCheckCircle, FaClock, FaExclamationCircle, FaChartLine
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Button, Badge, Modal, Input, Textarea, Select, ConfirmModal } from "../../components/common";
import { MeetingsList } from "../../components/Meetings";
import api from "../../api/axiosClient";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    assigned_to: "",
  });

  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchTeamMembers();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/api/projects/${id}`);
      setProject(res.data?.data || res.data);
    } catch (error) {
      toast.error("Project not found");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/api/projects/${id}/tasks`);
      setTasks(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch tasks");
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get("/api/hr/employees");
      setTeamMembers(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch team members");
    }
  };

  const handleOpenTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        due_date: task.due_date?.slice(0, 10) || "",
        assigned_to: task.assigned_to || "",
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        due_date: "",
        assigned_to: "",
      });
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title) return toast.error("Task title is required");

    setSaving(true);
    try {
      if (editingTask) {
        await api.put(`/api/projects/tasks/${editingTask.id}`, { ...taskForm, project_id: id });
        toast.success("Task updated");
      } else {
        await api.post(`/api/projects/${id}/tasks`, taskForm);
        toast.success("Task created");
      }
      setShowTaskModal(false);
      fetchTasks();
    } catch (error) {
      toast.error("Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/api/projects/tasks/${taskId}`, { status: newStatus });
      toast.success("Status updated");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/api/projects/${id}`);
      toast.success("Project deleted");
      navigate("/projects");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const statusColors = {
    planning: "default",
    in_progress: "primary",
    on_hold: "warning",
    completed: "success",
    cancelled: "danger",
  };

  const priorityColors = {
    low: "default",
    medium: "warning",
    high: "danger",
    critical: "danger",
  };

  const taskStatusColors = {
    todo: "default",
    in_progress: "primary",
    review: "warning",
    done: "success",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) return null;

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const reviewTasks = tasks.filter(t => t.status === "review");
  const doneTasks = tasks.filter(t => t.status === "done");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="p-2 rounded-lg hover:theme-bg-tertiary theme-text-muted"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold theme-text-primary">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusColors[project.status]}>
                {project.status?.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge variant={priorityColors[project.priority]}>
                {project.priority?.toUpperCase()} Priority
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" icon={<FaEdit />} onClick={() => navigate(`/projects/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="danger" icon={<FaTrash />} onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="text-center">
          <FaTasks className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold theme-text-primary">{tasks.length}</p>
          <p className="text-sm theme-text-muted">Total Tasks</p>
        </Card>
        <Card padding="md" className="text-center">
          <FaCheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold theme-text-primary">{doneTasks.length}</p>
          <p className="text-sm theme-text-muted">Completed</p>
        </Card>
        <Card padding="md" className="text-center">
          <FaDollarSign className="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold theme-text-primary">
            ₹{(project.budget || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-sm theme-text-muted">Budget</p>
        </Card>
        <Card padding="md" className="text-center">
          <FaChartLine className="w-8 h-8 mx-auto text-amber-500 mb-2" />
          <p className="text-2xl font-bold theme-text-primary">{project.progress || 0}%</p>
          <p className="text-sm theme-text-muted">Progress</p>
        </Card>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="lg" className="lg:col-span-2">
          <h3 className="font-semibold theme-text-primary mb-4">Description</h3>
          <p className="theme-text-secondary whitespace-pre-wrap">
            {project.description || "No description provided"}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t theme-border-light">
            <div>
              <p className="text-sm theme-text-muted flex items-center gap-2">
                <FaCalendar /> Start Date
              </p>
              <p className="font-medium theme-text-primary">
                {project.start_date ? new Date(project.start_date).toLocaleDateString("en-IN") : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm theme-text-muted flex items-center gap-2">
                <FaCalendar /> End Date
              </p>
              <p className="font-medium theme-text-primary">
                {project.end_date ? new Date(project.end_date).toLocaleDateString("en-IN") : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm theme-text-muted flex items-center gap-2">
                <FaUser /> Client
              </p>
              <p className="font-medium theme-text-primary">
                {project.client_name || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm theme-text-muted flex items-center gap-2">
                <FaDollarSign /> Spent
              </p>
              <p className="font-medium theme-text-primary">
                ₹{(project.spent || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </Card>

        {/* Progress */}
        <Card padding="lg">
          <h3 className="font-semibold theme-text-primary mb-4">Progress</h3>
          <div className="relative pt-4">
            <div className="w-32 h-32 mx-auto relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={`${(project.progress || 0) * 3.52} 352`}
                  strokeLinecap="round"
                  className="text-blue-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold theme-text-primary">
                {project.progress || 0}%
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {[
              { label: "To Do", count: todoTasks.length, color: "bg-gray-400" },
              { label: "In Progress", count: inProgressTasks.length, color: "bg-blue-500" },
              { label: "Review", count: reviewTasks.length, color: "bg-amber-500" },
              { label: "Done", count: doneTasks.length, color: "bg-green-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm theme-text-secondary">{item.label}</span>
                </div>
                <span className="text-sm font-medium theme-text-primary">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Meetings Section */}
      <Card padding="lg">
        <MeetingsList projectId={id} />
      </Card>

      {/* Tasks Section */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold theme-text-primary text-lg">Tasks</h3>
          <Button icon={<FaPlus />} onClick={() => handleOpenTaskModal()}>
            Add Task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <FaTasks className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h4 className="font-medium theme-text-primary">No tasks yet</h4>
            <p className="text-sm theme-text-muted mb-4">Create your first task to get started</p>
            <Button icon={<FaPlus />} onClick={() => handleOpenTaskModal()}>
              Add Task
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 rounded-lg theme-bg-tertiary hover:theme-bg-secondary transition-colors cursor-pointer"
                onClick={() => handleOpenTaskModal(task)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium theme-text-primary truncate">{task.title}</p>
                    <Badge variant={priorityColors[task.priority]} size="sm">
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm theme-text-muted truncate">{task.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  {task.due_date && (
                    <span className="text-xs theme-text-muted flex items-center gap-1">
                      <FaClock /> {new Date(task.due_date).toLocaleDateString("en-IN")}
                    </span>
                  )}
                  <Select
                    value={task.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleUpdateTaskStatus(task.id, e.target.value);
                    }}
                    options={[
                      { value: "todo", label: "To Do" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "review", label: "Review" },
                      { value: "done", label: "Done" },
                    ]}
                    className="w-32"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? "Edit Task" : "Add Task"}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              options={[
                { value: "todo", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "review", label: "Review" },
                { value: "done", label: "Done" },
              ]}
            />
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
            />
            <Select
              label="Assigned To"
              value={taskForm.assigned_to}
              onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
              options={teamMembers.map(m => ({ value: m.id, label: m.name }))}
              placeholder="Unassigned"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
