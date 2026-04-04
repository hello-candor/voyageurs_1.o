
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, 
    GlassWater, Wine, Star, Sun, Clock, Plus, 
    LayoutGrid, List, Columns, GripVertical, CheckCircle2, ArrowRight,
    CalendarPlus, Download, X, CalendarDays, Share2, Copy, Navigation,
    AlertCircle, Plane, Bed, ArrowUpRight, ArrowDownLeft, Train, Car, User,
    DollarSign, Wallet
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTripPlanner, PlanItem } from '../context/TripPlannerContext';
import { useNotification } from '../context/NotificationContext';
import { SegmentedControl } from './SegmentedControl';
import { Button } from './Button';
import { safeStorage } from '../utils/storage';
import { CalendarEvent } from '../types';

// --- Mock Data Generator ---
const GENERATE_EVENTS = (): CalendarEvent[] => [
    // Planning Milestones
    {
        id: 'planning-lodging',
        title: "Book Lodging",
        subtitle: "Recommended Window",
        start: new Date(2026, 1, 1, 9, 0), // Feb 1, 2026
        end: new Date(2026, 1, 1, 18, 0),
        type: 'planning',
        location: "",
        icon: Bed
    },
    {
        id: 'planning-flights',
        title: "Book Flights",
        subtitle: "Recommended Window",
        start: new Date(2026, 2, 1, 9, 0), // March 1, 2026
        end: new Date(2026, 2, 1, 18, 0),
        type: 'planning',
        location: "Global",
        icon: Plane
    },
    {
        id: 'planning-rsvp',
        title: "RSVP Deadline",
        subtitle: "Final Confirmation",
        start: new Date(2026, 6, 1, 0, 0), // July 1, 2026
        end: new Date(2026, 6, 1, 23, 59),
        type: 'planning',
        location: "Voyage Hub",
        icon: AlertCircle
    },
    // Official Events
    {
        id: 'welcome',
        title: "L'Apéro de Bienvenue",
        subtitle: "Sunset Welcome",
        start: new Date(2026, 8, 18, 18, 0), // Sept 18, 6:00 PM
        end: new Date(2026, 8, 18, 22, 0),
        type: 'official',
        location: "Arceaux Rooftop",
        icon: GlassWater
    },
    {
        id: 'vineyard',
        title: "Tour du Vin",
        subtitle: "Pic Saint-Loup",
        start: new Date(2026, 8, 19, 11, 0), // Sept 19, 11:00 AM
        end: new Date(2026, 8, 19, 16, 0),
        type: 'official',
        location: "Domaine de l'Hortus",
        icon: Wine
    },
    {
        id: 'gala',
        title: "La Grande Fête",
        subtitle: "The 40th Birthday",
        start: new Date(2026, 8, 19, 19, 30), // Sept 19, 7:30 PM
        end: new Date(2026, 8, 20, 2, 0),
        type: 'official',
        location: "Château de Flaugergues",
        icon: Star
    },
    {
        id: 'brunch',
        title: "Le Brunch",
        subtitle: "Recovery & Farewell",
        start: new Date(2026, 8, 20, 11, 30), // Sept 20, 11:30 AM
        end: new Date(2026, 8, 20, 14, 30),
        type: 'official',
        location: "Jardin des Plantes",
        icon: Sun
    }
];

type ViewMode = 'month' | 'week' | 'day';

export const SeptemberCalendar: React.FC<{ onOpenMap?: () => void }> = ({ onOpenMap }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 19)); // Start focused on the birthday
    
    // Initialize events with defaults + persisted user events
    const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(() => {
        const defaults = GENERATE_EVENTS();
        const stored = safeStorage.getItem('user_calendar_events', []);
        // Restore Date objects from strings
        const restored = stored.map((e: any) => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end)
        }));
        return [...defaults, ...restored];
    });
    
    // Interaction States
    const [placingItem, setPlacingItem] = useState<PlanItem | null>(null);
    const [draggedItem, setDraggedItem] = useState<PlanItem | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    
    // Modal State for Finalizing Schedule
    const [scheduleData, setScheduleData] = useState<{ item: PlanItem, date: Date } | null>(null);
    const [modalTime, setModalTime] = useState("12:00");

    const { items } = useTripPlanner(); 
    const { addNotification } = useNotification();
    const { allGuests } = useUser();

    // --- Helpers ---

    const getWeekDays = (baseDate: Date) => {
        const start = new Date(baseDate);
        const day = start.getDay(); // 0 is Sunday
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
        start.setDate(diff); // Monday of this week
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const unscheduledItems = useMemo(() => {
        return items.filter(i => !localEvents.some(e => e.title === i.name));
    }, [items, localEvents]);

    // --- Logistics Helpers ---
    const activeMovers = useMemo(() => {
        const targetDate = currentDate.toISOString().split('T')[0];
        const targetDateShort = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // e.g. "Sep 18"

        const arrivals = allGuests.filter(g => {
            if (g.travelDetails?.arrivalDate === targetDate) return true;
            if (g.arrival && g.arrival.includes(targetDateShort)) return true;
            return false;
        });
        
        const departures = allGuests.filter(g => g.travelDetails?.departureDate === targetDate);
        
        return { arrivals, departures };
    }, [allGuests, currentDate]);

    // --- Sync Helpers ---

    const formatFloatingTime = (date: Date) => {
        const pad = (n: number) => n < 10 ? '0' + n : n;
        return '' + date.getFullYear() + 
               pad(date.getMonth() + 1) + 
               pad(date.getDate()) + 'T' + 
               pad(date.getHours()) + 
               pad(date.getMinutes()) + 
               pad(date.getSeconds());
    };

    const getGoogleCalendarLink = (event: CalendarEvent) => {
        const start = formatFloatingTime(event.start);
        const end = formatFloatingTime(event.end);
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.subtitle)}&location=${encodeURIComponent(event.location || ', France')}&sf=true&output=xml`;
    };

    const downloadICS = (event: CalendarEvent) => {
        const start = formatFloatingTime(event.start);
        const end = formatFloatingTime(event.end);
        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "BEGIN:VEVENT",
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.subtitle}`,
            `LOCATION:${event.location || ''}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\n");

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification("Event downloaded.", "success");
    };

    const downloadAllICS = () => {
        addNotification("Full itinerary exported.", "success");
    };

    // --- Interaction Handlers ---

    // 1. Initial Drop or Click
    const initiateSchedule = (date: Date, specificTimeStr?: string) => {
        const item = draggedItem || placingItem;
        if (!item) return;

        // Set default time to 12:00 or the slot time if provided
        const timeStr = specificTimeStr || "12:00";
        
        setScheduleData({ item, date });
        setModalTime(timeStr);
        
        // Reset immediate drag/place states to clean up UI, waiting for modal confirmation
        setDraggedItem(null);
        setPlacingItem(null); 
    };

    // 2. Finalize in Modal
    const confirmSchedule = () => {
        if (!scheduleData) return;

        const [hours, minutes] = modalTime.split(':').map(Number);
        const start = new Date(scheduleData.date);
        start.setHours(hours, minutes);
        
        const end = new Date(start);
        end.setHours(hours + 2); // Default 2 hour duration

        const newEvent: CalendarEvent = {
            id: `planned-${Date.now()}`,
            title: scheduleData.item.name,
            subtitle: scheduleData.item.category,
            start: start,
            end: end,
            type: 'personal',
            location: '',
            cost: scheduleData.item.cost,
            pricingType: scheduleData.item.pricingType
        };

        const updatedEvents = [...localEvents, newEvent];
        setLocalEvents(updatedEvents);
        
        // Save only personal events to storage
        const userEvents = updatedEvents.filter(e => e.type === 'personal');
        safeStorage.setItem('user_calendar_events', userEvents);

        addNotification(`${scheduleData.item.name} scheduled for ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 'success');
        setScheduleData(null);
    };

    const handleNavigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        else newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        setCurrentDate(newDate);
    };

    // --- Sub Components ---

    const ScheduleModal = () => {
        if (!scheduleData) return null;
        return (
            <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200 p-6">
                    <h3 className="font-serif text-2xl text-med-blue dark:text-white mb-2">Schedule Event</h3>
                    <p className="text-gray-500 mb-6 text-sm">When would you like to plan <strong>{scheduleData.item.name}</strong>?</p>
                    
                    <div className="space-y-4 mb-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Date</label>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                                {scheduleData.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Start Time</label>
                            <input 
                                type="time" 
                                value={modalTime}
                                onChange={(e) => setModalTime(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-gray-900 border-2 border-med-blue/20 rounded-xl text-lg font-bold text-med-blue dark:text-white outline-none focus:border-med-blue transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setScheduleData(null)} fullWidth>Cancel</Button>
                        <Button variant="primary" onClick={confirmSchedule} fullWidth>Confirm</Button>
                    </div>
                </div>
            </div>
        );
    };

    const EventDetailsModal = () => {
        if (!selectedEvent) return null;
        const Icon = selectedEvent.icon || CalendarIcon;
        
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-med-blue/20 backdrop-blur-sm p-4" onClick={() => setSelectedEvent(null)}>
                <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className={`h-32 relative flex items-center justify-center ${selectedEvent.type === 'official' ? 'bg-med-blue' : selectedEvent.type === 'planning' ? 'bg-purple-600' : 'bg-med-terracotta'}`}>
                         <div className="absolute inset-0 bg-black/10" />
                         <div className="relative text-white/30">
                            <Icon size={64} />
                         </div>
                         <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors">
                            <X size={16} />
                         </button>
                    </div>
                    <div className="p-6">
                        <h3 className="font-serif text-2xl text-med-blue dark:text-white leading-tight mb-1">{selectedEvent.title}</h3>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${selectedEvent.type === 'planning' ? 'text-purple-600' : 'text-med-terracotta'}`}>{selectedEvent.subtitle}</p>
                        
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-gray-400" />
                                <span>{selectedEvent.start.toLocaleDateString([], {weekday: 'long', month:'short', day:'numeric'})} • {selectedEvent.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            {selectedEvent.location && (
                                <div className="flex items-center gap-3">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span>{selectedEvent.location}</span>
                                </div>
                            )}
                            {selectedEvent.cost !== undefined && selectedEvent.cost > 0 && (
                                <div className="flex items-center gap-3">
                                    <Wallet size={16} className="text-gray-400" />
                                    <span>${selectedEvent.cost.toLocaleString()} ({selectedEvent.pricingType === 'perPerson' ? 'Total' : 'Fixed'})</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <a 
                                    href={getGoogleCalendarLink(selectedEvent)} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
                                >
                                    <CalendarPlus size={14} /> G-Cal
                                </a>
                                <button 
                                    onClick={() => downloadICS(selectedEvent)}
                                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
                                >
                                    <Download size={14} /> iCal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const WeekView = () => {
        const weekDays = getWeekDays(currentDate);
        return (
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                {weekDays.map((day, i) => {
                    const dayEvents = localEvents.filter(e => 
                        e.start.getDate() === day.getDate() && 
                        e.start.getMonth() === day.getMonth() &&
                        e.start.getFullYear() === day.getFullYear()
                    ).sort((a,b) => a.start.getTime() - b.start.getTime());
                    
                    const isSelectedDay = day.getDate() === currentDate.getDate() && day.getMonth() === currentDate.getMonth();

                    return (
                        <div 
                            key={i}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                initiateSchedule(day, "12:00");
                            }}
                            className={`relative min-h-[120px] sm:min-h-[400px] bg-white dark:bg-gray-900 group transition-colors ${isSelectedDay ? 'bg-med-blue/5 dark:bg-blue-900/10' : ''} ${placingItem || draggedItem ? 'hover:bg-med-blue/10 cursor-pointer' : ''}`}
                            onClick={() => {
                                setCurrentDate(day);
                                if (placingItem) initiateSchedule(day);
                            }}
                        >
                            <div className={`text-center py-3 border-b border-gray-50 dark:border-gray-800 ${isSelectedDay ? 'bg-med-terracotta text-white' : ''}`}>
                                <span className={`text-[9px] font-bold uppercase block mb-1 ${isSelectedDay ? 'text-white/80' : 'text-gray-400'}`}>
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className={`text-sm font-bold ${isSelectedDay ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {day.getDate()}
                                </span>
                            </div>

                            <div className="p-2 space-y-2">
                                {dayEvents.map(ev => (
                                    <div 
                                        key={ev.id} 
                                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                                        className={`p-2.5 rounded-xl border text-xs shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95 ${
                                            ev.type === 'official' 
                                            ? 'bg-med-blue text-white border-med-blue' 
                                            : ev.type === 'planning'
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        <p className="font-bold mb-0.5 truncate">{ev.title}</p>
                                        <p className="opacity-80 text-[10px] flex items-center gap-1">
                                            <Clock size={10} /> {ev.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                ))}
                                {(placingItem || draggedItem) && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 border-2 border-dashed border-med-terracotta rounded-xl flex items-center justify-center text-med-terracotta bg-med-terracotta/5">
                                        <Plus size={16} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const MonthView = () => {
        const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); 
        const offset = firstDay === 0 ? 6 : firstDay - 1; 
        
        const grid = [];
        for (let i = 0; i < offset; i++) grid.push(null);
        for (let i = 1; i <= daysInMonth; i++) grid.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));

        return (
            <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                    <div key={d} className="bg-white dark:bg-gray-900 py-3 text-center text-[10px] font-bold uppercase text-gray-400">
                        {d}
                    </div>
                ))}
                {grid.map((day, i) => {
                    if (!day) return <div key={i} className="bg-gray-50/50 dark:bg-gray-900/50 min-h-[100px]" />;
                    
                    const dayEvents = localEvents.filter(e => 
                        e.start.getDate() === day.getDate() && 
                        e.start.getMonth() === day.getMonth() &&
                        e.start.getFullYear() === day.getFullYear()
                    );
                    const isTarget = placingItem !== null || draggedItem !== null;
                    const isSelected = day.getDate() === currentDate.getDate() && day.getMonth() === currentDate.getMonth();

                    return (
                        <div 
                            key={i}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                initiateSchedule(day, "12:00");
                            }}
                            onClick={() => {
                                setCurrentDate(day);
                                if (isTarget) initiateSchedule(day);
                            }}
                            className={`bg-white dark:bg-gray-900 min-h-[100px] p-2 relative group transition-colors cursor-pointer ${
                                isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            <span className={`text-xs font-bold block mb-1 ${isSelected ? 'text-med-blue dark:text-blue-300' : 'text-gray-500'}`}>{day.getDate()}</span>
                            <div className="mt-1 space-y-1">
                                {dayEvents.map(ev => (
                                    <div 
                                        key={ev.id} 
                                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                                        className={`h-1.5 rounded-full w-full cursor-pointer hover:scale-x-105 transition-transform ${
                                            ev.type === 'official' 
                                            ? 'bg-med-blue' 
                                            : ev.type === 'planning'
                                                ? 'bg-purple-600'
                                                : 'bg-med-olive'
                                        }`} 
                                        title={ev.title} 
                                    />
                                ))}
                                {isTarget && (
                                    <div className="hidden group-hover:flex items-center justify-center absolute inset-0 bg-med-blue/10 backdrop-blur-[1px]">
                                        <Plus size={24} className="text-med-blue" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const DayView = () => {
        const hours = Array.from({length: 16}, (_, i) => i + 8); // 8 AM to 11 PM
        const dayEvents = localEvents.filter(e => 
            e.start.getDate() === currentDate.getDate() && 
            e.start.getMonth() === currentDate.getMonth() &&
            e.start.getFullYear() === currentDate.getFullYear()
        );

        return (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                {hours.map(hour => {
                    const event = dayEvents.find(e => e.start.getHours() === hour);
                    const isTarget = placingItem !== null || draggedItem !== null;
                    const timeStr = `${hour < 10 ? '0'+hour : hour}:00`;

                    return (
                        <div 
                            key={hour}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                initiateSchedule(currentDate, timeStr);
                            }}
                            className={`flex min-h-[80px] group ${isTarget ? 'hover:bg-med-blue/5 cursor-pointer' : ''}`}
                            onClick={() => isTarget && initiateSchedule(currentDate, timeStr)}
                        >
                            <div className="w-16 py-3 px-2 text-right text-xs text-gray-400 font-mono border-r border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
                                {timeStr}
                            </div>
                            <div className="flex-1 p-2 relative">
                                {event ? (
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                                        className={`h-full rounded-xl p-3 flex flex-col justify-center cursor-pointer transition-all hover:shadow-md ${
                                            event.type === 'official' 
                                            ? 'bg-med-blue text-white' 
                                            : event.type === 'planning'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-green-100 text-green-900 border border-green-200'
                                        }`}
                                    >
                                        <p className="font-bold text-sm">{event.title}</p>
                                        <p className="text-xs opacity-80 flex items-center gap-2"><MapPin size={10} /> {event.location}</p>
                                    </div>
                                ) : isTarget ? (
                                    <div className="hidden group-hover:flex h-full border-2 border-dashed border-med-terracotta rounded-xl items-center justify-center text-med-terracotta text-xs font-bold uppercase tracking-widest bg-med-terracotta/5">
                                        Place Here
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <EventDetailsModal />
            <ScheduleModal />

            {/* Standardized Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 dark:border-white/5 pb-6">
                 <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-none whitespace-nowrap">
                    Weekend <span className="italic text-med-terracotta">Agenda</span>
                </h2>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={downloadAllICS}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-med-terracotta text-white shadow-md hover:bg-[#c56143] transition-all active:scale-95"
                    >
                        <CalendarPlus size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Sync All</span>
                    </button>
                    
                    <SegmentedControl 
                        items={[
                            { id: 'month', label: 'Month' },
                            { id: 'week', label: 'Week' },
                            { id: 'day', label: 'Day' }
                        ]}
                        selectedId={viewMode}
                        onChange={(id) => setViewMode(id as ViewMode)}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col xl:flex-row gap-8 items-start animate-in fade-in duration-500 pt-2">
                
                {/* Left Column: Context & Staging */}
                <div className="w-full xl:w-1/4 space-y-6">
                    {/* Navigation */}
                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <button onClick={() => handleNavigate('prev')} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"><ChevronLeft size={18} /></button>
                        <h2 className="font-serif text-lg text-med-blue dark:text-white">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => handleNavigate('next')} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"><ChevronRight size={18} /></button>
                    </div>

                    {/* Logistics Card (Arrivals/Departures) */}
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl">
                                <Plane size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-med-blue dark:text-white">Travel Movements</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{currentDate.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Arrivals */}
                            {activeMovers.arrivals.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-1"><ArrowDownLeft size={12} className="text-green-500" /> Arriving</p>
                                    <div className="space-y-2">
                                        {activeMovers.arrivals.map(g => (
                                            <div key={g.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                                <img src={g.img} className="w-6 h-6 rounded-full object-cover" alt="" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{g.name}</p>
                                                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                        {g.travelDetails?.arrivalMode === 'Train' ? <Train size={8}/> : g.travelDetails?.arrivalMode === 'Car' ? <Car size={8}/> : <Plane size={8}/>}
                                                        {g.travelDetails?.arrivalNumber || 'Scheduled'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Departures */}
                            {activeMovers.departures.length > 0 && (
                                <div>
                                     <p className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-1"><ArrowUpRight size={12} className="text-red-500" /> Departing</p>
                                     <div className="space-y-2">
                                        {activeMovers.departures.map(g => (
                                            <div key={g.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                                <img src={g.img} className="w-6 h-6 rounded-full object-cover" alt="" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{g.name}</p>
                                                    <p className="text-[10px] text-gray-500">Leaving</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeMovers.arrivals.length === 0 && activeMovers.departures.length === 0 && (
                                <div className="text-center py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                                    <p className="text-xs text-gray-400 italic">No travel activity found for this day.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Staging Area */}
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-med-terracotta/10 text-med-terracotta rounded-xl">
                                <LayoutGrid size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-med-blue dark:text-white">Unscheduled</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Drag to Calendar</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {placingItem && (
                                <div className="bg-med-terracotta text-white p-4 rounded-2xl shadow-lg mb-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest opacity-80">
                                        <Clock size={12} className="animate-spin-slow" /> Placing...
                                    </div>
                                    <p className="font-serif text-lg leading-none">{placingItem.name}</p>
                                    <p className="text-[10px] mt-2 opacity-90">Select a slot on the calendar grid.</p>
                                    <button 
                                        onClick={() => setPlacingItem(null)} 
                                        className="mt-3 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {unscheduledItems.length === 0 ? (
                                <div className="text-center py-8 opacity-40">
                                    <CheckCircle2 size={32} className="mx-auto mb-2 text-gray-400" />
                                    <p className="text-xs font-medium text-gray-500">All planned items scheduled.</p>
                                </div>
                            ) : (
                                unscheduledItems.map(item => (
                                    <div 
                                        key={item.id} 
                                        draggable
                                        onDragStart={() => setDraggedItem(item)}
                                        onDragEnd={() => setDraggedItem(null)}
                                        className={`group bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-med-blue/30 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${placingItem?.id === item.id ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-med-terracotta bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                                                {item.category}
                                            </span>
                                            <GripVertical size={14} className="text-gray-300 group-hover:text-med-blue transition-colors" />
                                        </div>
                                        <h4 className="font-serif text-med-blue dark:text-white leading-tight mb-3 text-sm">{item.name}</h4>
                                        <button 
                                            onClick={() => setPlacingItem(item)}
                                            className="w-full py-2 flex items-center justify-center gap-2 bg-white dark:bg-gray-900 hover:bg-med-blue hover:text-white dark:text-gray-300 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm border border-gray-100 dark:border-gray-700 hover:border-transparent"
                                        >
                                            Schedule
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Calendar Grid */}
                <div className="flex-1 w-full min-h-[500px]">
                    {viewMode === 'month' && <MonthView />}
                    {viewMode === 'week' && <WeekView />}
                    {viewMode === 'day' && <DayView />}
                </div>
            </div>
        </div>
    );
};
