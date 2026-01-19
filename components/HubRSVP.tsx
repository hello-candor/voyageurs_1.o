import React, { useState, useEffect } from 'react';
import { Check, Save, Calendar, Utensils, Users, Heart, Send, Sparkles, XCircle, Compass, Home, ChevronRight, Loader2, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useNotification } from '../context/NotificationContext';
import { notificationService } from '../services/notificationService';
import { Button } from './Button';

interface HubRSVPProps {
    onComplete?: () => void;
}

export const HubRSVP: React.FC<HubRSVPProps> = ({ onComplete }) => {
  const { user, submitRSVP, logout } = useUser();
  const { updateSettings } = useTripPlanner();
  const { addNotification } = useNotification();
  
  const [status, setStatus] = useState<'Yes' | 'Maybe' | 'No' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Countdown State
  const [timeLeft, setTimeLeft] = useState<{d: number, h: number, m: number, s: number} | null>(null);

  // Form State - Updated to match 9/15/26 to 9/22/26
  const [formData, setFormData] = useState({
      startDate: '2026-09-15',
      endDate: '2026-09-22',
      guests: 1,
      dietary: '',
      note: ''
  });

  // Countdown Timer Logic
  useEffect(() => {
      const target = new Date('2026-07-01T00:00:00').getTime();
      
      const updateTimer = () => {
          const now = Date.now();
          const diff = target - now;
          
          if (diff <= 0) {
              setTimeLeft(null);
          } else {
              setTimeLeft({
                  d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                  h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                  m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                  s: Math.floor((diff % (1000 * 60)) / 1000),
              });
          }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
  }, []);

  // Sync with User Context on Load
  useEffect(() => {
      if (user) {
          const currentStatus = user.status === 'Confirmed' ? 'Yes' : user.status === 'Declined' ? 'No' : '';
          setStatus(currentStatus);
          setFormData({
              startDate: user.travelDetails?.arrivalDate || '2026-09-15',
              endDate: user.travelDetails?.departureDate || '2026-09-22',
              guests: user.guestsCount || 1,
              dietary: user.dietary || '',
              note: user.note || ''
          });
      }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      const mappedStatus = status === 'No' ? 'Declined' : (status === 'Maybe' ? 'Pending' : 'Confirmed');
      
      // Calculate duration for planner
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Simulate network delay for UX
      setTimeout(async () => {
          submitRSVP({
              status: mappedStatus,
              guestsCount: status === 'No' ? 0 : formData.guests,
              dietary: formData.dietary,
              note: formData.note,
              arrival: status === 'No' ? 'N/A' : `${formData.startDate}`,
              travelDetails: {
                  ...user?.travelDetails,
                  arrivalDate: formData.startDate,
                  departureDate: formData.endDate,
                  arrivalMode: user?.travelDetails?.arrivalMode || 'Plane',
                  arrivalNumber: user?.travelDetails?.arrivalNumber || '',
                  accommodation: user?.travelDetails?.accommodation || ''
              }
          });

          if (status !== 'No') {
              updateSettings(formData.guests, Math.max(1, diffDays));
          }

          if (user?.email && status === 'Yes') {
             await notificationService.sendEmail(
                user.email, 
                "RSVP Confirmed", 
                `We have confirmed your attendance for ${formData.guests} people.`
             );
          }

          addNotification("RSVP preferences updated.", "success");
          setIsSubmitting(false);
          setIsSaved(true);
          
          if (onComplete) {
              setTimeout(onComplete, 1000);
          } else {
              setTimeout(() => setIsSaved(false), 2000);
          }
      }, 800);
  };

  if (status === 'No' && isSaved) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mb-6">
                  <Heart size={40} className="fill-gray-400" />
              </div>
              <h3 className="font-serif text-3xl text-med-blue dark:text-white mb-4">Miss You Already</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mb-8">
                  Your response has been logged. If your plans change, you can always come back and update your RSVP.
              </p>
              <Button onClick={logout} variant="secondary" size="md">
                  Return Home
              </Button>
              <button onClick={() => setIsSaved(false)} className="mt-6 text-xs text-med-blue underline decoration-dotted underline-offset-4">
                  Edit Response
              </button>
          </div>
      );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 py-2 md:p-8 pb-32">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header */}
            <div className="text-center space-y-2">
                <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px]">The Celebration</span>
                <h2 className="font-serif text-3xl md:text-4xl text-med-blue dark:text-white">Will you be there?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Montpellier, France • Sept 18—20, 2026</p>
            </div>

            {/* Countdown Banner */}
            {timeLeft && (
                <div className="flex flex-col items-center justify-center space-y-3 py-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-med-terracotta bg-med-terracotta/10 px-3 py-1 rounded-full border border-med-terracotta/20">
                        <Clock size={10} /> Response Deadline: July 1st
                    </div>
                    <div className="flex items-baseline gap-3 md:gap-5 text-med-blue dark:text-white">
                        <div className="text-center">
                            <span className="font-serif text-2xl md:text-3xl font-bold leading-none tabular-nums">{timeLeft.d}</span>
                            <span className="block text-[8px] uppercase tracking-wider opacity-60">Days</span>
                        </div>
                        <span className="text-lg font-serif opacity-30">:</span>
                        <div className="text-center">
                            <span className="font-serif text-2xl md:text-3xl font-bold leading-none tabular-nums">{timeLeft.h.toString().padStart(2, '0')}</span>
                            <span className="block text-[8px] uppercase tracking-wider opacity-60">Hrs</span>
                        </div>
                        <span className="text-lg font-serif opacity-30">:</span>
                        <div className="text-center">
                            <span className="font-serif text-2xl md:text-3xl font-bold leading-none tabular-nums">{timeLeft.m.toString().padStart(2, '0')}</span>
                            <span className="block text-[8px] uppercase tracking-wider opacity-60">Mins</span>
                        </div>
                        <span className="text-lg font-serif opacity-30">:</span>
                        <div className="text-center">
                            <span className="font-serif text-2xl md:text-3xl font-bold leading-none tabular-nums w-8 md:w-10">{timeLeft.s.toString().padStart(2, '0')}</span>
                            <span className="block text-[8px] uppercase tracking-wider opacity-60">Secs</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Selection Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
                <button 
                    onClick={() => setStatus('Yes')}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                        status === 'Yes' 
                        ? 'bg-med-blue text-white border-med-blue shadow-lg scale-105' 
                        : 'bg-white dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800 hover:border-med-blue/30 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                    <Check size={24} strokeWidth={status === 'Yes' ? 3 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Yes</span>
                </button>

                <button 
                    onClick={() => setStatus('Maybe')}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                        status === 'Maybe' 
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg scale-105' 
                        : 'bg-white dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800 hover:border-amber-500/30 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                    <Compass size={24} strokeWidth={status === 'Maybe' ? 3 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Maybe</span>
                </button>

                <button 
                    onClick={() => setStatus('No')}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                        status === 'No' 
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-700 shadow-inner' 
                        : 'bg-white dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800 hover:border-red-400/30 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                    <XCircle size={24} strokeWidth={status === 'No' ? 3 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No</span>
                </button>
            </div>

            {/* Conditional Form */}
            {status && (
                <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 bg-white/50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                    
                    {/* Yes Logic */}
                    {status === 'Yes' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Dates */}
                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2 group-focus-within:text-med-blue">
                                        <Calendar size={12} /> Arrival
                                    </label>
                                    <input 
                                        type="date" 
                                        value={formData.startDate}
                                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                                        className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-med-blue focus:ring-4 focus:ring-med-blue/10 text-sm font-bold font-sans text-med-blue dark:text-white transition-all"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2 group-focus-within:text-med-blue">
                                        <Calendar size={12} /> Departure
                                    </label>
                                    <input 
                                        type="date" 
                                        value={formData.endDate}
                                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                                        className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-med-blue focus:ring-4 focus:ring-med-blue/10 text-sm font-bold font-sans text-med-blue dark:text-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Guests */}
                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2 group-focus-within:text-med-blue">
                                        <Users size={12} /> Party Size
                                    </label>
                                    <select 
                                        value={formData.guests} 
                                        onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}
                                        className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-med-blue focus:ring-4 focus:ring-med-blue/10 text-sm font-bold font-sans text-med-blue dark:text-white appearance-none cursor-pointer transition-all"
                                    >
                                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?'Guest':'Guests'}</option>)}
                                    </select>
                                </div>

                                {/* Dietary */}
                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2 group-focus-within:text-med-blue">
                                        <Utensils size={12} /> Dietary Needs
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="None, Vegetarian, Allergies..."
                                        value={formData.dietary}
                                        onChange={e => setFormData({...formData, dietary: e.target.value})}
                                        className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-med-blue focus:ring-4 focus:ring-med-blue/10 text-sm font-sans text-med-blue dark:text-white transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Note Field (All Statuses) */}
                    <div className="space-y-2 group">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2 group-focus-within:text-med-blue">
                            <Send size={12} /> {status === 'No' ? 'Send a Note' : 'Message to Host'}
                        </label>
                        <textarea 
                            rows={3}
                            placeholder={status === 'No' ? "Sending love from afar..." : "Can't wait! Also, I love dark chocolate..."}
                            value={formData.note}
                            onChange={e => setFormData({...formData, note: e.target.value})}
                            className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-med-blue focus:ring-4 focus:ring-med-blue/10 text-sm font-sans text-med-blue dark:text-white resize-none transition-all"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button 
                        type="submit"
                        disabled={isSubmitting || isSaved}
                        variant={isSaved ? 'success' : 'primary'}
                        fullWidth
                        size="lg"
                        isLoading={isSubmitting}
                        loadingText="Saving..."
                    >
                        {isSaved ? 'Saved' : 'Confirm RSVP'}
                    </Button>
                </form>
            )}
        </div>
    </div>
  );
};