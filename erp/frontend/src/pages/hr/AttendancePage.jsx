// src/pages/hr/AttendancePage.jsx
// Attendance tracking page

import { useState, useEffect } from "react";
import { FaClock, FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaCheck, FaTimes, FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Table, Badge, Select, StatCard } from "../../components/common";
import hrService from "../../services/hrService";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants";

export default function AttendancePage() {
    const { auth } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);

    // Filters
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const userRole = auth?.user?.role || ROLES.EMPLOYEE;
    const isHR = [ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER].includes(userRole);

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear, selectedEmployee]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {
                month: selectedMonth,
                year: selectedYear,
            };
            if (selectedEmployee) {
                params.user_id = selectedEmployee;
            }

            const [attRes, empRes] = await Promise.all([
                hrService.getAttendance(params),
                isHR ? hrService.getEmployees() : Promise.resolve({ data: [] }),
            ]);

            setAttendance(attRes.data || []);
            setEmployees(empRes.data || []);

            // Check today's attendance
            const today = new Date().toISOString().slice(0, 10);
            const todayRecord = (attRes.data || []).find(
                (a) => a.date === today && a.user_id === auth?.user?.id
            );
            setTodayAttendance(todayRecord);
        } catch (err) {
            toast.error("Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        setCheckingIn(true);
        try {
            const result = await hrService.checkIn();
            toast.success("Checked in successfully!");
            setTodayAttendance(result.data);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to check in");
        } finally {
            setCheckingIn(false);
        }
    };

    const handleCheckOut = async () => {
        setCheckingOut(true);
        try {
            const result = await hrService.checkOut();
            toast.success("Checked out successfully!");
            setTodayAttendance(result.data);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to check out");
        } finally {
            setCheckingOut(false);
        }
    };

    // Stats calculation
    const stats = {
        present: attendance.filter((a) => a.status === "present").length,
        absent: attendance.filter((a) => a.status === "absent").length,
        halfDay: attendance.filter((a) => a.status === "half_day").length,
        leave: attendance.filter((a) => a.status === "leave").length,
    };

    const statusColors = {
        present: "success",
        absent: "danger",
        half_day: "warning",
        leave: "info",
        holiday: "primary",
    };

    const columns = [
        {
            key: "date",
            label: "Date",
            render: (val) => new Date(val).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
            }),
        },
        ...(isHR ? [{
            key: "employee_name",
            label: "Employee",
        }] : []),
        {
            key: "check_in",
            label: "Check In",
            render: (val) => val || "-",
        },
        {
            key: "check_out",
            label: "Check Out",
            render: (val) => val || "-",
        },
        {
            key: "work_hours",
            label: "Hours",
            render: (val) => val ? `${parseFloat(val).toFixed(1)}h` : "-",
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <Badge variant={statusColors[val] || "default"} size="sm">
                    {val?.replace("_", " ").toUpperCase()}
                </Badge>
            ),
        },
    ];

    const months = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ];

    const years = Array.from({ length: 5 }, (_, i) => ({
        value: new Date().getFullYear() - i,
        label: (new Date().getFullYear() - i).toString(),
    }));

    const currentTime = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold theme-text-primary">Attendance</h1>
                <p className="theme-text-muted">Track and manage attendance</p>
            </div>

            {/* Today's Check-in/out Card */}
            <Card padding="lg" variant="gradient">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="theme-text-muted text-sm">Today, {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <FaClock className="w-5 h-5 text-blue-500" />
                            <span className="text-2xl font-bold theme-text-primary">{currentTime}</span>
                        </div>
                        {todayAttendance && (
                            <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="theme-text-muted">
                                    Check-in: <span className="theme-text-primary font-medium">{todayAttendance.check_in || "-"}</span>
                                </span>
                                {todayAttendance.check_out && (
                                    <span className="theme-text-muted">
                                        Check-out: <span className="theme-text-primary font-medium">{todayAttendance.check_out}</span>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {!todayAttendance ? (
                            <Button
                                icon={<FaSignInAlt />}
                                onClick={handleCheckIn}
                                loading={checkingIn}
                                variant="success"
                                size="lg"
                            >
                                Check In
                            </Button>
                        ) : !todayAttendance.check_out ? (
                            <Button
                                icon={<FaSignOutAlt />}
                                onClick={handleCheckOut}
                                loading={checkingOut}
                                variant="danger"
                                size="lg"
                            >
                                Check Out
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                                <FaCheck className="w-5 h-5" />
                                <span className="font-medium">Day Completed</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                    title="Present Days"
                    value={stats.present}
                    icon={<FaCheck />}
                    iconBg="green"
                />
                <StatCard
                    title="Absent Days"
                    value={stats.absent}
                    icon={<FaTimes />}
                    iconBg="red"
                />
                <StatCard
                    title="Half Days"
                    value={stats.halfDay}
                    icon={<FaClock />}
                    iconBg="yellow"
                />
                <StatCard
                    title="Leaves"
                    value={stats.leave}
                    icon={<FaCalendarAlt />}
                    iconBg="blue"
                />
            </div>

            {/* Filters */}
            <Card padding="md">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        options={months}
                        className="w-full sm:w-40"
                    />
                    <Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        options={years}
                        className="w-full sm:w-32"
                    />
                    {isHR && (
                        <Select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            options={employees.map((e) => ({ value: e.id, label: e.name }))}
                            placeholder="All Employees"
                            className="w-full sm:w-48"
                        />
                    )}
                </div>
            </Card>

            {/* Attendance Table */}
            <Card padding="none">
                <Table
                    columns={columns}
                    data={attendance}
                    loading={loading}
                    emptyMessage="No attendance records found"
                />
            </Card>
        </div>
    );
}
