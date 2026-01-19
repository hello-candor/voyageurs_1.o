
import React, { useState } from 'react';
import { UserPlus, UserMinus, Mail, Check, Users2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { isValidEmail, isValidName } from '../utils/validation';
import { Button } from './Button';

export const HubParty: React.FC = () => {
  const { user, inviteToParty, removeFromParty } = useUser();
  const [inviteMode, setInviteMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const validate = () => {
      const newErrors: Record<string, string> = {};
      if (!isValidName(formData.name)) newErrors.name = "Name too short.";
      if (!isValidEmail(formData.email)) newErrors.email = "Invalid email.";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsProcessing(true);
    setTimeout(() => {
        inviteToParty(formData.email, formData.name);
        setFormData({ name: '', email: '' });
        setInviteMode(false);
        setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Module Header */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-med-blue/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6 w-full lg:w-auto">
                    <div className="p-4 bg-med-blue text-white rounded-3xl shadow-xl shadow-med-blue/20 shrink-0">
                        <Users2 size={32} />
                    </div>
                    <div>
                        <h3 className="font-serif text-3xl md:text-4xl text-med-blue dark:text-white leading-tight mb-1">Your Party</h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Coordinating with Travel Companions</p>
                    </div>
                </div>
                {!inviteMode && (
                    <Button 
                        onClick={() => setInviteMode(true)}
                        variant="action"
                    >
                        Add Companion
                    </Button>
                )}
            </div>
        </div>

        {/* Invite Form Overlay-ish */}
        {inviteMode && (
            <div className="bg-med-sand dark:bg-gray-900 border-2 border-dashed border-med-blue/30 p-8 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-300 shadow-inner">
                <div className="mb-6">
                    <h4 className="font-serif text-2xl text-med-blue dark:text-white">Invite to Your Party</h4>
                    <p className="text-xs text-gray-500 mt-1">They will receive an invitation to sync travel logistics with yours.</p>
                </div>
                <form onSubmit={handleInvite} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Companion Name</label>
                            <input 
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => {
                                    setFormData({...formData, name: e.target.value});
                                    if(errors.name) setErrors({...errors, name: ''});
                                }}
                                className={`w-full p-4 bg-white dark:bg-gray-800 rounded-2xl focus:ring-2 focus:ring-med-terracotta/20 outline-none transition-all dark:text-white text-base font-sans border ${errors.name ? 'border-red-500' : 'border-gray-100 dark:border-gray-700'}`}
                                placeholder="e.g. Jean Dupont"
                            />
                            {errors.name && <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider ml-1">{errors.name}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Email Address</label>
                            <input 
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => {
                                    setFormData({...formData, email: e.target.value});
                                    if(errors.email) setErrors({...errors, email: ''});
                                }}
                                className={`w-full p-4 bg-white dark:bg-gray-800 rounded-2xl focus:ring-2 focus:ring-med-terracotta/20 outline-none transition-all dark:text-white font-sans border ${errors.email ? 'border-red-500' : 'border-gray-100 dark:border-gray-700'}`}
                                placeholder="email@example.com"
                            />
                            {errors.email && <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider ml-1">{errors.email}</span>}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button 
                            type="submit" 
                            variant="primary"
                            fullWidth
                            isLoading={isProcessing}
                            loadingText="Sending..."
                        >
                            Send Invitation
                        </Button>
                        <Button 
                            type="button"
                            variant="secondary"
                            onClick={() => setInviteMode(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        )}

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.partyMembers.map((member) => (
                <div key={member.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-lg group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-med-blue/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
                    
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="relative shrink-0">
                            <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-med-sand dark:border-gray-700 shadow-md" />
                            {member.status === 'Member' && (
                                <div className="absolute -bottom-1 -right-1 bg-med-olive text-white p-1 rounded-lg ring-4 ring-white dark:ring-gray-800 shadow-lg">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-serif text-xl text-med-blue dark:text-white truncate">{member.name}</h4>
                                {member.isPrimary && <span className="text-[8px] bg-med-blue/10 text-med-blue dark:text-blue-300 px-2 py-0.5 rounded-full uppercase font-bold border border-med-blue/10">Host</span>}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{member.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        {member.status === 'Invited' && (
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                                Pending
                            </span>
                        )}
                        {!member.isPrimary && (
                            <button 
                                onClick={() => removeFromParty(member.id)}
                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                title="Remove Companion"
                            >
                                <UserMinus size={18} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
