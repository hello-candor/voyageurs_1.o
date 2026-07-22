
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Bell, Plane, Calendar, UserCircle2, Mail, Instagram, Twitter, Facebook, Phone, Share2, DollarSign, ShieldCheck, Users, Compass, Globe, Camera, Loader2, LogOut } from 'lucide-react';
import { OnboardingFlow } from './OnboardingFlow';
import { isValidEmail, isValidName, isValidPhone, isValidInstagram } from '../utils/validation';
import { Button } from './Button';
import { uploadImage } from '../services/storageService'; 
import { useNotification } from '../context/NotificationContext';

export const GuestProfile: React.FC = () => {
  const { user, isVerified, setVerified, loginWithCode, logout, updateProfile, updateTravelDetails, allGuests } = useUser();
  const { addNotification } = useNotification();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      dietary: user?.dietary || '',
      venmo: user?.social?.venmo || '',
      cashapp: user?.social?.cashapp || '',
      zelle: user?.social?.zelle || '',
      instagram: user?.social?.instagram || '',
      twitter: user?.social?.twitter || '',
      facebook: user?.social?.facebook || '',
      phoneFrench: user?.social?.phoneFrench || '',
      phoneUS: user?.social?.phoneUS || '',
      phoneOther: user?.social?.phoneOther || '+852 ',
      whatsapp: user?.social?.whatsapp || '',
      shareSocial: user?.privacy?.shareSocial ?? true,
      sharePhone: user?.privacy?.sharePhone ?? true,
      shareInterests: user?.privacy?.shareInterests ?? true,
      publicRegistry: user?.privacy?.publicRegistry ?? true,
      notifyEmail: true, 
      notifySMS: true,
      avatar: user?.avatar || ''
  });

  const [travelData, setTravelData] = useState({
      arrivalDate: user?.travelDetails?.arrivalDate || '',
      departureDate: user?.travelDetails?.departureDate || '',
      arrivalMode: user?.travelDetails?.arrivalMode || 'Plane',
      arrivalNumber: user?.travelDetails?.arrivalNumber || '',
      accommodation: user?.travelDetails?.accommodation || ''
  });

  // --- Auto-fill from URL Query Params (QR Code Support) ---
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code');
      if (urlCode && !user && !isVerified) {
          setCode(urlCode);
      }
  }, [user, isVerified]);

  useEffect(() => {
      if (user) {
          setFormData({
              name: user.name,
              email: user.email,
              dietary: user.dietary || '',
              venmo: user.social?.venmo || '',
              cashapp: user.social?.cashapp || '',
              zelle: user.social?.zelle || '',
              instagram: user.social?.instagram || '',
              twitter: user.social?.twitter || '',
              facebook: user.social?.facebook || '',
              phoneFrench: user.social?.phoneFrench || '',
              phoneUS: user.social?.phoneUS || '',
              phoneOther: user.social?.phoneOther || '+852 ',
              whatsapp: user.social?.whatsapp || '',
              shareSocial: user.privacy?.shareSocial ?? true,
              sharePhone: user.privacy?.sharePhone ?? true,
              shareInterests: user.privacy?.shareInterests ?? true,
              publicRegistry: user.privacy?.publicRegistry ?? true,
              notifyEmail: true, 
              notifySMS: true,
              avatar: user.avatar || ''
          });
          setTravelData({
              arrivalDate: user.travelDetails?.arrivalDate || '',
              departureDate: user.travelDetails?.departureDate || '',
              arrivalMode: user.travelDetails?.arrivalMode || 'Plane',
              arrivalNumber: user.travelDetails?.arrivalNumber || '',
              accommodation: user.travelDetails?.accommodation || ''
  });
      }
  }, [user]);

  const handleSubmitCode = async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await loginWithCode(code);
      if (!success) {
          setError('Invalid Invitation Code.');
      } else {
          setError('');
      }
  };

  const validate = () => {
      const errors: Record<string, string> = {};
      if (!isValidName(formData.name)) errors.name = "Name must be at least 2 characters.";
      if (!isValidEmail(formData.email)) errors.email = "Please enter a valid email address.";
      if (!isValidPhone(formData.phoneUS)) errors.phoneUS = "Invalid US phone format.";
      if (!isValidPhone(formData.phoneFrench)) errors.phoneFrench = "Invalid French phone format.";
      if (!isValidInstagram(formData.instagram)) errors.instagram = "Invalid Instagram handle.";
      
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingAvatar(true);
      try {
          const downloadUrl = await uploadImage(file, 'avatars');
          setFormData(prev => ({ ...prev, avatar: downloadUrl }));
          // Update profile immediately for better UX
          updateProfile({ avatar: downloadUrl });
          addNotification("Profile photo updated successfully.", "success");
      } catch (err) {
          console.error("Avatar upload failed", err);
          addNotification("Failed to upload photo. Please check your connection or file size.", "error");
      } finally {
          setIsUploadingAvatar(false);
      }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setIsSaving(true);
      setTimeout(() => {
          updateProfile({
              name: formData.name,
              email: formData.email,
              dietary: formData.dietary,
              avatar: formData.avatar,
              social: {
                  ...user?.social,
                  venmo: formData.venmo,
                  cashapp: formData.cashapp,
                  zelle: formData.zelle,
                  instagram: formData.instagram,
                  twitter: formData.twitter,
                  facebook: formData.facebook,
                  phoneFrench: formData.phoneFrench,
                  phoneUS: formData.phoneUS,
                  phoneOther: formData.phoneOther,
                  whatsapp: formData.whatsapp
              },
              privacy: {
                  shareSocial: formData.shareSocial,
                  sharePhone: formData.sharePhone,
                  shareInterests: formData.shareInterests,
                  publicRegistry: formData.publicRegistry,
                  smsConsent: formData.notifySMS ?? true
              }
          });

          updateTravelDetails({
              arrivalDate: travelData.arrivalDate,
              departureDate: travelData.departureDate,
              arrivalMode: travelData.arrivalMode as 'Plane' | 'Train' | 'Car',
              arrivalNumber: travelData.arrivalNumber,
              accommodation: travelData.accommodation,
              hub: travelData.arrivalMode === 'Plane' ? 'MPL' : 'St-Roch' 
          });

          setIsSaving(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
      }, 800);
  };

  // If user is logged in BUT has not completed onboarding, force onboarding flow
  if (user && (!user.hasCompletedOnboarding || user.status === 'Declined')) {
      return <OnboardingFlow />;
  }

  // If user is logged in AND completed onboarding, show settings profile (Standard)
  if (user && user.hasCompletedOnboarding) {
    return (
        <div className="animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                
                {/* Left Column */}
                <div className="lg:w-1/3">
                    <div className="lg:sticky lg:top-28 space-y-8">
                        <div>
                            <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">Account Settings</span>
                            <h2 className="font-serif text-4xl lg:text-5xl text-med-blue dark:text-white mb-6 leading-none">
                                Voyage<br />
                                <span className="italic text-med-terracotta">Identity</span>
                            </h2>
                            
                            <div className="flex items-center gap-5 mb-8 p-4 bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <img src={formData.avatar || user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover" />
                                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isUploadingAvatar ? <Loader2 size={20} className="text-white animate-spin"/> : <Camera size={20} className="text-white"/>}
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-serif text-xl text-med-blue dark:text-white truncate">{user.name}</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Verified Voyageur</p>
                                </div>
                                <div className="ml-auto">
                                    <button onClick={logout} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <LogOut size={20} className="text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-sans text-sm mb-8">
                                Manage your personal details and privacy preferences.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:w-2/3 space-y-8">
                    
                    <form onSubmit={handleSaveSettings} className="space-y-8">
                        
                        {/* Section 1: Alerts */}
                        <div className="bg-med-blue/5 dark:bg-blue-900/20 p-8 rounded-[2.5rem] border border-med-blue/10 dark:border-blue-800">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white dark:bg-gray-800 text-med-blue dark:text-blue-300 rounded-xl shadow-sm">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-med-blue dark:text-white">Alert Preferences</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Stay in the Loop</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, notifyEmail: !formData.notifyEmail})}
                                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${formData.notifyEmail ? 'bg-white dark:bg-gray-800 border-med-terracotta shadow-sm' : 'bg-transparent border-gray-200 dark:border-gray-700 opacity-60'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} className={formData.notifyEmail ? 'text-med-terracotta' : 'text-gray-400'} />
                                        <span className="text-[10px] font-bold text-med-blue dark:text-white uppercase tracking-wider block">Email Updates</span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.notifyEmail ? 'bg-med-terracotta' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${formData.notifyEmail ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, notifySMS: !formData.notifySMS})}
                                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${formData.notifySMS ? 'bg-white dark:bg-gray-800 border-med-terracotta shadow-sm' : 'bg-transparent border-gray-200 dark:border-gray-700 opacity-60'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={formData.notifySMS ? 'text-med-terracotta' : 'text-gray-400'} />
                                        <span className="text-[10px] font-bold text-med-blue dark:text-white uppercase tracking-wider">SMS Alerts</span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.notifySMS ? 'bg-med-terracotta' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${formData.notifySMS ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Section 2: Logistics */}
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-med-blue/10 text-med-blue dark:text-blue-300 rounded-xl">
                                    <Plane size={20} />
                                </div>
                                <h3 className="font-serif text-2xl text-med-blue dark:text-white">Travel Logistics</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Arrival Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="date" value={travelData.arrivalDate} onChange={e => setTravelData({...travelData, arrivalDate: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent outline-none transition-all dark:text-white text-base font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Departure Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="date" value={travelData.departureDate} onChange={e => setTravelData({...travelData, departureDate: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent outline-none transition-all dark:text-white text-base font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Transport Mode</label>
                                    <div className="flex gap-2">
                                        {(['Plane', 'Train', 'Car'] as const).map(mode => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setTravelData({...travelData, arrivalMode: mode})}
                                                className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-2 ${travelData.arrivalMode === mode ? 'bg-med-blue text-white border-med-blue shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent hover:border-gray-200'}`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Flight / Train #</label>
                                    <input type="text" placeholder="e.g. AF1234" value={travelData.arrivalNumber} onChange={e => setTravelData({...travelData, arrivalNumber: e.target.value})} className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent outline-none transition-all dark:text-white text-base font-mono placeholder:text-gray-300" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Identity */}
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-med-terracotta/10 text-med-terracotta rounded-xl">
                                    <UserCircle2 size={20} />
                                </div>
                                <h3 className="font-serif text-2xl text-med-blue dark:text-white">Personal Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Display Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:bg-white dark:focus:bg-gray-900 transition-all dark:text-white text-base font-medium border-2 border-transparent" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Email</label>
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none transition-all dark:text-white text-base font-medium border-2 border-transparent" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1 flex items-center gap-2">
                                        <Phone size={10} /> US Phone
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="+1..." 
                                        value={formData.phoneUS} 
                                        onChange={e => setFormData({...formData, phoneUS: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none transition-all dark:text-white text-base font-medium border-2 border-transparent" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1 flex items-center gap-2">
                                        <Globe size={10} /> French Phone (+33)
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="+33 6..." 
                                        value={formData.phoneFrench} 
                                        onChange={e => setFormData({...formData, phoneFrench: e.target.value})} 
                                        className={`w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none transition-all dark:text-white text-base font-medium border-2 border-transparent ${fieldErrors.phoneFrench ? 'border-red-500' : ''}`} 
                                    />
                                    {fieldErrors.phoneFrench && <p className="text-[9px] text-red-500 font-bold ml-1">{fieldErrors.phoneFrench}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Social Connections */}
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl">
                                    <Share2 size={20} />
                                </div>
                                <h3 className="font-serif text-2xl text-med-blue dark:text-white">Social Connections</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1 flex items-center gap-2">
                                        <Instagram size={10} /> Instagram
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="@username" 
                                        value={formData.instagram} 
                                        onChange={e => setFormData({...formData, instagram: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none transition-all dark:text-white text-base font-medium border-2 border-transparent focus:border-pink-500/30" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1 flex items-center gap-2">
                                        <Twitter size={10} /> Twitter
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="@username" 
                                        value={formData.twitter} 
                                        onChange={e => setFormData({...formData, twitter: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none transition-all dark:text-white text-base font-medium border-2 border-transparent focus:border-blue-400/30" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1 flex items-center gap-2">
                                        <Facebook size={10} /> Facebook
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Profile URL or Name" 
                                        value={formData.facebook} 
                                        onChange={e => setFormData({...formData, facebook: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none transition-all dark:text-white text-base font-medium border-2 border-transparent focus:border-blue-600/30" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4.5: Payment Handles */}
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                                    <DollarSign size={20} />
                                </div>
                                <h3 className="font-serif text-2xl text-med-blue dark:text-white">Payment Handles</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Venmo</label>
                                    <input 
                                        type="text" 
                                        placeholder="@username" 
                                        value={formData.venmo} 
                                        onChange={e => setFormData({...formData, venmo: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none transition-all dark:text-white text-base font-medium border-2 border-transparent focus:border-blue-500/30" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Cash App</label>
                                    <input 
                                        type="text" 
                                        placeholder="$username" 
                                        value={formData.cashapp} 
                                        onChange={e => setFormData({...formData, cashapp: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none transition-all dark:text-white text-base font-medium border-2 border-transparent focus:border-green-500/30" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Zelle</label>
                                    <input 
                                        type="text" 
                                        placeholder="Email or Phone" 
                                        value={formData.zelle} 
                                        onChange={e => setFormData({...formData, zelle: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none transition-all dark:text-white text-base font-medium border-2 border-transparent focus:border-purple-500/30" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Privacy & Visibility */}
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-med-blue/10 text-med-blue dark:text-blue-300 rounded-xl">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="font-serif text-2xl text-med-blue dark:text-white">Privacy & Visibility</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Public Registry Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <Users size={18} className="text-gray-400" />
                                        <div>
                                            <span className="text-sm font-bold text-med-blue dark:text-white block">Public Directory</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Visible to other guests</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, publicRegistry: !formData.publicRegistry})}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.publicRegistry ? 'bg-med-olive' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.publicRegistry ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Share Socials */}
                                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.publicRegistry ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50' : 'opacity-50 pointer-events-none border-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <Instagram size={18} className="text-gray-400" />
                                        <div>
                                            <span className="text-sm font-bold text-med-blue dark:text-white block">Share Socials</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Show Instagram/Twitter</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, shareSocial: !formData.shareSocial})}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.shareSocial ? 'bg-med-blue' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.shareSocial ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Share Phone */}
                                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.publicRegistry ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50' : 'opacity-50 pointer-events-none border-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <Phone size={18} className="text-gray-400" />
                                        <div>
                                            <span className="text-sm font-bold text-med-blue dark:text-white block">Share Phone</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Allow contact via Hub</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, sharePhone: !formData.sharePhone})}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.sharePhone ? 'bg-med-blue' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.sharePhone ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                 {/* Share Interests */}
                                 <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.publicRegistry ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50' : 'opacity-50 pointer-events-none border-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <Compass size={18} className="text-gray-400" />
                                        <div>
                                            <span className="text-sm font-bold text-med-blue dark:text-white block">Matchmaker</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Show interests to others</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, shareInterests: !formData.shareInterests})}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.shareInterests ? 'bg-med-terracotta' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.shareInterests ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                variant={saveSuccess ? 'success' : 'primary'}
                                size="lg"
                                isLoading={isSaving}
                                loadingText="Saving..."
                            >
                                {saveSuccess ? 'Saved' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
  }

  // Fallback: If verification is required but not done
  if (isVerified) {
      return <OnboardingFlow />;
  }

  return (
    <div className="animate-in fade-in zoom-in-98 duration-1000 max-w-md mx-auto w-full py-8 md:py-16 px-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center mb-10">
            <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-white dark:bg-gray-800 text-med-blue dark:text-white rounded-full flex items-center justify-center mx-auto shadow-2xl border border-gray-100 dark:border-gray-700">
                    <Mail size={40} strokeWidth={1} />
                </div>
            </div>
            
            <h3 className="font-serif text-4xl text-med-terracotta italic mb-3 leading-none">Access Your Invitation</h3>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Guest Entry</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm italic font-medium leading-relaxed max-w-[280px] mx-auto">
                Please enter the code from your invitation to unlock your itinerary and RSVP.
            </p>
        </div>

        <form onSubmit={handleSubmitCode} className="space-y-12 w-full">
            <div className="relative group">
                <input 
                    autoFocus
                    type="text" 
                    placeholder="INVITE CODE"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(''); }}
                    className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-800 focus:border-med-terracotta py-4 outline-none transition-all text-center text-2xl md:text-4xl text-med-blue dark:text-white font-serif tracking-[0.2em] uppercase placeholder:text-gray-300 dark:placeholder:text-gray-700"
                />
            </div>

            {error && (
                <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center animate-in shake">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                variant="action"
                size="lg"
                fullWidth
                disabled={code.length < 3}
            >
                Confirm Invite
            </Button>
        </form>
    </div>
  );
};
