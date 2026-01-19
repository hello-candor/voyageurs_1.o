
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, GlassWater, Wine, Star, Sun, CalendarPlus, Download, ChevronRight, Bookmark, Bell } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { useNotification } from '../context/NotificationContext';
import { useAppConfig } from '../context/AppConfigContext';
import { AgendaEvent } from '../types';

const ICON_MAP: Record<string, any> = {
    GlassWater, Wine, Star, Sun
};

export const AgendaView: React.FC = () => {
    const [activeDay, setActiveDay] = useState<string | 'all'>('all');
    const { addNotification } = useNotification();
    const { config } = useAppConfig();
    const AGENDA_DATA = config.content.agenda;

    const filteredEvents = activeDay === 'all' 
        ? AGENDA_DATA 
        : AGENDA_DATA.filter(e => e.day === activeDay);

    const getGoogleCalendarLink = (event: AgendaEvent) => {
        const startDate = new Date(`${event.date}T${event.startTime}:00`);
        const endDate = new Date(startDate.getTime() + event.durationHours * 60 * 60 * 1000);
        const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&sf=true&output=xml`;
    };

    const downloadICS = (event: AgendaEvent) => {
        const start = event.date.replace(/-/g, '') + 'T' + event.startTime.replace(':', '') + '00';
        const endHour = parseInt(event.startTime.split(':')[0]) + event.durationHours;
        const end = event.date.replace(/-/g, '') + 'T' + (endHour < 10 ? '0' + endHour : endHour) + event.startTime.split(':')[1] + '00';
        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "BEGIN:VEVENT",
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description}`,
            `LOCATION:${event.location}`,
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
    };

    const handleRemindMe = async (event: AgendaEvent) => {
        const hasPermission = await notificationService.requestPermission();
        if(hasPermission) {
            notificationService.scheduleReminder(
                `Reminder: ${event.title}`,
                `Starting at ${event.time} in ${event.location}.`,
                5000 
            );
            addNotification(`Reminder set for ${event.title}`, 'success');
        } else {
            addNotification('Notification permission required.', 'error');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <div className="lg:w-1/3">
                <div className="lg:sticky lg:top-32 space-y-8">
                    <div>
                        <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">The Itinerary</span>
                        <h2 className="font-serif text-4xl lg:text-6xl text-med-blue dark:text-white leading-none mb-6">
                            Weekend<br />
                            <span className="italic text-med-terracotta">Agenda</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium italic mb-8">
                            "A curated sequence of celebrations designed to capture the soul of the Mediterranean."
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Filter by Day</p>
                        <div className="flex flex-col gap-2">
                            {['all', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <button
                                    key={day}
                                    onClick={() => setActiveDay(day)}
                                    className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all border ${activeDay === day ? 'bg-med-blue text-white border-med-blue shadow-lg shadow-med-blue/20' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-med-terracotta/30'}`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{day}</span>
                                    {activeDay === day && <ChevronRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:w-2/3 space-y-12">
                <div className="relative pl-8 md:pl-12 border-l border-gray-200 dark:border-gray-800 space-y-16">
                    {filteredEvents.map((event, idx) => {
                        const Icon = ICON_MAP[event.iconName || 'Star'] || Star;
                        return (
                            <div key={event.id} className="relative animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="absolute -left-[41px] md:-left-[57px] top-0 w-4 h-4 rounded-full bg-white dark:bg-gray-950 border-4 border-med-terracotta z-10 shadow-[0_0_0_8px_rgba(214,114,82,0.1)]" />
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-med-terracotta text-white px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm">{event.day}</div>
                                        <div className="flex items-center gap-2 text-gray-400"><Clock size={12} /><span className="text-[10px] font-bold uppercase tracking-widest">{event.time}</span></div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-800 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="md:w-2/5 relative h-56 md:h-auto overflow-hidden">
                                                <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-black/40 md:to-transparent" />
                                                <div className="absolute bottom-4 left-4 text-white">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Icon size={16} className="text-med-terracotta" />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{event.subtitle}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-serif text-3xl text-med-blue dark:text-white leading-tight">{event.title}</h3>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleRemindMe(event)} className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-med-terracotta rounded-xl transition-all"><Bell size={18} /></button>
                                                        <a href={getGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-500 rounded-xl transition-all"><CalendarPlus size={18} /></a>
                                                        <button onClick={() => downloadICS(event)} className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-med-terracotta rounded-xl transition-all"><Download size={18} /></button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-med-terracotta mb-6"><MapPin size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">{event.location}</span></div>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8">{event.description}</p>
                                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-med-olive animate-pulse" /><span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Host Managed</span></div>
                                                    <button className="text-[10px] font-bold uppercase tracking-widest text-med-blue dark:text-blue-300 flex items-center gap-2 group-hover:text-med-terracotta transition-colors">More Details <ChevronRight size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div className="absolute -left-[41px] md:-left-[57px] bottom-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-800 border-4 border-transparent" />
                </div>
            </div>
        </div>
    );
};
