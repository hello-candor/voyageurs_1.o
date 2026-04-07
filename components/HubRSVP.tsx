import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useNotification } from '../context/NotificationContext';

interface HubRSVPProps {
    onComplete?: () => void;
}

export const HubRSVP: React.FC<HubRSVPProps> = ({ onComplete }) => {
  const { user, submitRSVP } = useUser();
  const { updateSettings } = useTripPlanner();
  const { addNotification } = useNotification();
  
  const [status, setStatus] = useState<'Yes' | 'No' | ''>(
    user?.status === 'Confirmed' ? 'Yes' : user?.status === 'Declined' ? 'No' : ''
  );
  const [guests, setGuests] = useState(user?.guestsCount || 1);

  const handleAttend = () => {
      setStatus('Yes');
      submitRSVP({
          status: 'Confirmed',
          guestsCount: guests,
          dietary: '',
          note: '',
          arrival: '2026-09-15',
          travelDetails: {
              ...user?.travelDetails,
          }
      });
      updateSettings(guests, 7);
      addNotification("RSVP Confirmed!", "success");
      // Optional: automatically route away on complete
      // if (onComplete) setTimeout(onComplete, 1200);
  };

  const handleDecline = () => {
      setStatus('No');
      submitRSVP({
          status: 'Declined',
          guestsCount: 0,
          dietary: '',
          note: '',
          arrival: 'N/A'
      });
      addNotification("Miss You Already", "success");
      // if (onComplete) setTimeout(onComplete, 1200);
  };

  return (
      <div className="absolute inset-0 w-full h-full text-white overflow-hidden isolate font-sans">
          {/* Aesthetic Aurora Background */}
          <div className="absolute inset-0 -z-10 bg-[#15151e] overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#5d4485] rounded-full blur-[120px] opacity-40 mix-blend-screen"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#36687c] rounded-full blur-[140px] opacity-40 mix-blend-screen"></div>
              <div className="absolute top-[20%] right-[30%] w-[40%] h-[40%] bg-[#774f4f] rounded-full blur-[100px] opacity-30 mix-blend-screen"></div>
          </div>

          {/* OS Header Text */}
          <h1 className="absolute top-6 left-6 md:top-8 md:left-10 text-2xl md:text-3xl font-bold tracking-[-0.03em] text-white/95 drop-shadow-md z-10">
              RSVP Invitation Card
          </h1>

          <div className="w-full h-full flex flex-col items-center justify-center p-4 pb-20">
              {/* iOS 18 style Squircle Card */}
              <div className="relative w-full max-w-[360px] h-auto min-h-[440px] rounded-[36px] overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col z-20 transition-all duration-500 ease-out">
                  
                  {/* Image Section */}
                  <div className="h-[200px] w-full relative shrink-0">
                      <img 
                          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop" 
                          alt="Cooking Class" 
                          className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col items-center justify-start py-8 px-6 bg-gradient-to-b from-[#b7bdca]/10 to-[#8c94a6]/10 text-center">
                      <h2 className="font-serif text-[28px] leading-tight text-white/95 mb-2 drop-shadow-sm">
                          Join us for a<br/>Cooking Class
                      </h2>
                      <p className="text-white/60 text-[13px] font-medium tracking-wide mb-auto">
                          Tomorrow, 10:00 AM • Lyon, France
                      </p>

                      <div className="w-full mt-8 mb-5 flex gap-3">
                          {/* Attend Button */}
                          <button 
                              onClick={handleAttend}
                              className={`flex-1 py-3.5 rounded-[24px] font-semibold text-[15px] transition-all active:scale-95 border
                                  ${status === 'Yes' 
                                      ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)]' 
                                      : 'bg-[#d29b4e]/10 text-[#d29b4e] border-[#d29b4e]/70 shadow-[0_0_24px_rgba(210,155,78,0.2)] hover:bg-[#d29b4e]/20'}
                              `}
                          >
                              {status === 'Yes' ? 'Attending' : 'Attend'}
                          </button>
                           {/* Decline Button */}
                           <button 
                              onClick={handleDecline}
                              className={`flex-1 py-3.5 rounded-[24px] font-semibold text-[15px] transition-all active:scale-95 border
                                  ${status === 'No'
                                      ? 'bg-white/20 text-white border-white/40'
                                      : 'bg-white/5 text-white/80 border-white/20 hover:bg-white/10'}
                              `}
                          >
                              {status === 'No' ? 'Declined' : 'Decline'}
                          </button>
                      </div>

                      {/* Add Guest / Footer Component */}
                      <button 
                          onClick={() => setGuests(guests + 1)}
                          className="text-white/60 hover:text-white text-[13px] underline decoration-white/30 hover:decoration-white/80 underline-offset-4 transition-colors font-medium"
                      >
                          {guests > 1 ? `Add another Guest (Total: ${guests})` : 'Add a Guest'}
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );
};