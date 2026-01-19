
import React, { useState, useEffect } from 'react';
import { Users, Utensils, MessageSquare } from 'lucide-react';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useUser } from '../context/UserContext';
import { Button } from './Button';

interface RSVPFormProps {
  onSuccess?: () => void;
}

export const RSVPForm: React.FC<RSVPFormProps> = ({ onSuccess }) => {
  const { travelers, updateSettings, durationDays } = useTripPlanner();
  const { user, submitRSVP } = useUser();
  
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    guests: user?.guestsCount || travelers || 1,
    dietary: user?.dietary || '',
    note: ''
  });

  // Local state for immediate input feedback
  const [guestInputValue, setGuestInputValue] = useState(String(formData.guests));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounce effect for guest count updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const count = parseInt(guestInputValue);
      
      if (!isNaN(count)) {
        // Sync to main form data
        setFormData(prev => ({ ...prev, guests: count }));

        // Perform validation
        if (count > 10) {
            setErrors(prev => ({ ...prev, guests: 'Max 10 guests allowed.' }));
        } else if (count < 1) {
            setErrors(prev => ({ ...prev, guests: 'Min 1 guest required.' }));
        } else {
            setErrors(prev => ({ ...prev, guests: '' }));
        }
      }
    }, 400); // 400ms delay

    return () => clearTimeout(timer);
  }, [guestInputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'guests') {
        // Update local input state immediately
        setGuestInputValue(value);
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we use the latest input value even if debounce hasn't fired yet
    const finalGuestCount = parseInt(guestInputValue);
    
    if (errors.guests) return;
    if (finalGuestCount < 1 || finalGuestCount > 10) {
        setErrors(prev => ({ ...prev, guests: 'Please enter between 1 and 10 guests.' }));
        return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
        submitRSVP({
            guestsCount: finalGuestCount,
            dietary: formData.dietary,
            note: formData.note,
            status: 'Confirmed'
        });
        updateSettings(finalGuestCount, durationDays);
        setIsSubmitting(false);
        setSubmitted(true);
        if (onSuccess) onSuccess();
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-[2rem] shadow-2xl text-center max-w-lg mx-auto border border-med-terracotta/10 transition-all animate-in zoom-in duration-700">
        <div className="relative mb-4">
            <div className="absolute inset-0 bg-med-terracotta/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
            <h3 className="text-2xl font-serif text-med-blue dark:text-white mb-2 relative z-10">Merci Beaucoup!</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 font-sans text-xs leading-relaxed mb-6 max-w-xs mx-auto">
          Your attendance is confirmed. We have synchronized your party details.
        </p>
        <Button 
            variant="primary"
            fullWidth
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
            Enter The Hub
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="h-1.5 w-full bg-med-terracotta opacity-80"></div>
      
      <div className="p-4 md:p-8">
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-serif text-med-blue dark:text-white mb-1 leading-tight">Access Your Invitation</h2>
          <p className="text-gray-400 font-sans text-[10px] italic">
             Finalize details for the celebration gala.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                <Users size={10} className="text-med-terracotta" /> Total Party Size
            </label>
            <div className="relative group">
               <input
                  required
                  type="number"
                  min="1"
                  max="10"
                  name="guests"
                  value={guestInputValue}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border-2 rounded-xl text-lg font-sans outline-none transition-all ${
                      errors.guests 
                      ? 'border-red-400 text-red-500' 
                      : 'border-transparent focus:border-med-terracotta/30 dark:text-white'
                  }`}
                />
                {errors.guests && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                        {errors.guests}
                    </p>
                )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                <Utensils size={10} className="text-med-terracotta" /> Culinary Notes
            </label>
            <textarea
                name="dietary"
                rows={1}
                value={formData.dietary}
                onChange={handleInputChange}
                placeholder="Allergies or preferences..."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-med-terracotta/30 rounded-xl text-xs outline-none transition-all dark:text-white resize-none h-12"
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                <MessageSquare size={10} className="text-med-terracotta" /> Personal Note
            </label>
            <textarea
                name="note"
                rows={1}
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Surprises or requests for Bryan?"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-med-terracotta/30 rounded-xl text-xs outline-none transition-all dark:text-white resize-none h-12"
            />
          </div>

          <div className="pt-2">
              <Button
                type="submit"
                variant="action"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                loadingText="Confirming..."
                disabled={!!errors.guests}
              >
                Confirm Invitation
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
