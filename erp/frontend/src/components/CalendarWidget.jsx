import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function CalendarWidget({ events = [], onDateClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateClick = (day) => {
        const clickedDate = new Date(year, month, day);
        setSelectedDate(clickedDate);
        onDateClick?.(clickedDate);
    };

    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return events.filter((e) => e.date?.startsWith(dateStr));
    };

    const isToday = (day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    const isSelected = (day) => {
        if (!selectedDate) return false;
        return (
            day === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear()
        );
    };

    // Generate calendar grid
    const calendarDays = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarDays.push({
            day: daysInPrevMonth - i,
            isCurrentMonth: false,
            isPrevMonth: true,
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: true,
        });
    }

    // Next month days
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: false,
            isNextMonth: true,
        });
    }

    return (
        <div className="theme-bg-secondary rounded-xl theme-shadow-md p-4 border theme-border-light">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold theme-text-primary">
                    {MONTHS[month]} {year}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToday}
                        className="px-2 py-1 text-xs rounded theme-bg-tertiary hover:bg-blue-100 dark:hover:bg-blue-900 theme-text-secondary transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={prevMonth}
                        className="p-1.5 rounded-full hover:theme-bg-tertiary transition-colors"
                    >
                        <FaChevronLeft className="w-3 h-3 theme-text-secondary" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-full hover:theme-bg-tertiary transition-colors"
                    >
                        <FaChevronRight className="w-3 h-3 theme-text-secondary" />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {DAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium theme-text-muted py-1"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dateObj, idx) => {
                    const dayEvents = dateObj.isCurrentMonth
                        ? getEventsForDay(dateObj.day)
                        : [];
                    const hasEvents = dayEvents.length > 0;

                    return (
                        <button
                            key={idx}
                            onClick={() =>
                                dateObj.isCurrentMonth && handleDateClick(dateObj.day)
                            }
                            disabled={!dateObj.isCurrentMonth}
                            className={`
                relative p-2 text-center text-sm rounded-lg transition-all
                ${dateObj.isCurrentMonth
                                    ? "hover:theme-bg-tertiary cursor-pointer"
                                    : "opacity-40 cursor-default"
                                }
                ${isToday(dateObj.day) && dateObj.isCurrentMonth
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : ""
                                }
                ${isSelected(dateObj.day) && dateObj.isCurrentMonth && !isToday(dateObj.day)
                                    ? "ring-2 ring-blue-500 theme-bg-tertiary"
                                    : ""
                                }
                ${!isToday(dateObj.day) && dateObj.isCurrentMonth
                                    ? "theme-text-primary"
                                    : ""
                                }
              `}
                        >
                            {dateObj.day}
                            {hasEvents && (
                                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Events for Selected Date */}
            {selectedDate && (
                <div className="mt-4 pt-4 border-t theme-border-light">
                    <p className="text-xs font-medium theme-text-secondary mb-2">
                        Events for {selectedDate.toLocaleDateString()}
                    </p>
                    {getEventsForDay(selectedDate.getDate()).length > 0 ? (
                        <ul className="space-y-1">
                            {getEventsForDay(selectedDate.getDate()).map((event, idx) => (
                                <li
                                    key={idx}
                                    className="text-xs p-2 rounded theme-bg-tertiary flex items-center gap-2"
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${event.type === "deadline"
                                                ? "bg-red-500"
                                                : event.type === "payment"
                                                    ? "bg-green-500"
                                                    : "bg-blue-500"
                                            }`}
                                    />
                                    <span className="theme-text-primary">{event.title}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs theme-text-muted">No events for this date</p>
                    )}
                </div>
            )}
        </div>
    );
}
