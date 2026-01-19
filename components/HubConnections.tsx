
import React, { useState } from 'react';
import { Search, Plane, MessageSquare, Users2, Check, UserCircle2, Mail, Instagram, Phone, UserPlus, UserMinus, Sparkles } from 'lucide-react';
import { useUser, Guest } from '../context/UserContext';
import { useChat } from '../context/ChatContext'; 
import { emailService } from '../services/emailService';
import { useNotification } from '../context/NotificationContext';
import { Button } from './Button'; 

type RegistryTab = 'directory' | 'my-party';

export const HubConnections: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RegistryTab>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Party state
  const [inviteMode, setInviteMode] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '' });
  const [isInviting, setIsInviting] = useState(false);

  // Sync state
  const [syncConfig, setSyncConfig] = useState({ flights: true, lodging: true });
  const [isSyncing, setIsSyncing] = useState(false);

  const { allGuests, user, inviteToParty, removeFromParty, syncPartyTravel, updateUserInterests } = useUser();
  const { createThread } = useChat(); 
  const { addNotification } = useNotification();

  const filteredGuests = allGuests.filter(guest => {
    const isPublic = guest.privacy?.publicRegistry ?? true;
    const isSelf = guest.email === user?.email;
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
    return (isPublic || isSelf) && matchesSearch;
  });

  const handleContactGuest = (guest: Guest) => {
      if (!user) return;
      createThread([user.email, guest.email], 'direct');
      addNotification(`Chat started with ${guest.name}. Check your Messages app.`, 'success');
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.name || !inviteData.email) return;
    setIsInviting(true);
    setTimeout(async () => {
        // Update user context state
        inviteToParty(inviteData.email, inviteData.name);
        
        // Generate Invite Code (Mock logic consistent with context)
        const cleanName = inviteData.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
        const code = `${cleanName}999`;

        // Send Email via Service
        await emailService.sendTemplateEmail(inviteData.email, 'INVITATION', {
            inviteeName: inviteData.name,
            senderName: user?.name || 'A Friend',
            code: code,
            url: window.location.href
        });

        setInviteData({ name: '', email: '' });
        setInviteMode(false);
        setIsInviting(false);
        addNotification("Invitation sent successfully.", "success");
    }, 800);
  };

  const handleSync = () => {
    if (!user?.partyMembers || user.partyMembers.length <= 1) return;
    setIsSyncing(true);
    setTimeout(() => {
        syncPartyTravel(syncConfig);
        setIsSyncing(false);
        addNotification("Travel details synchronized with party.", "success");
    }, 1000);
  };

  const navItems = [
      { id: 'directory', label: 'Directory', icon: Users2 },
      { id: 'my-party', label: 'My Party', icon: UserCircle2 },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 dark:border-white/5 pb-6">
             <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-none whitespace-nowrap">
                Voyage <span className="italic text-med-terracotta">Connections</span>
            </h2>
            <div className="bg-white/80 dark:bg-gray-800/80 p-1 border border-gray-100 dark:border-gray-700 rounded-full flex items-center gap-1 shadow-sm">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as RegistryTab)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap ${
                            activeTab === item.id 
                            ? 'bg-med-blue text-white shadow-md' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-med-blue dark:hover:text-blue-100 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                    >
                        <item.icon size={14} className={activeTab === item.id ? 'text-white' : 'text-med-terracotta/80'} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="animate-in fade-in duration-500">
            {/* SEARCH BAR (Directory Only) */}
            {activeTab === 'directory' && (
                <div className="relative group mb-8">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="text-gray-400 group-focus-within:text-med-terracotta transition-colors" size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search for a guest..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-med-terracotta/20 outline-none text-sm font-medium text-med-blue dark:text-white shadow-sm transition-all"
                    />
                </div>
            )}

            {/* DIRECTORY VIEW */}
            {activeTab === 'directory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-bottom-4 duration-500">
                    {filteredGuests.map((guest) => {
                        const showSocial = guest.privacy?.shareSocial ?? true;
                        const showPhone = guest.privacy?.sharePhone ?? true;
                        const isSelf = guest.email === user?.email;
                        const phone = guest.social?.phoneFrench || guest.social?.phoneUS || guest.social?.phoneOther;

                        return (
                        <div key={guest.id} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] p-7 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            <div className="flex items-start gap-5 mb-6 relative z-10">
                                <div className="relative shrink-0">
                                    <img src={guest.img} alt={guest.name} className="w-16 h-16 rounded-2xl border-2 border-white dark:border-gray-800 shadow-md object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 shadow-sm flex items-center justify-center ${
                                        guest.status === 'Confirmed' ? 'bg-med-olive' : 'bg-amber-400'
                                    }`}>
                                            {guest.status === 'Confirmed' ? <Check size={10} className="text-white" strokeWidth={4} /> : <Sparkles size={10} className="text-white animate-pulse" />}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-serif text-xl text-med-blue dark:text-white transition-colors group-hover:text-med-terracotta truncate">{guest.name}</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                            {guest.guestsCount === 1 ? 'Solo' : `Party of ${guest.guestsCount}`}
                                        </span>
                                        {guest.arrival && guest.arrival !== 'Not Set' && (
                                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded text-[9px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-1">
                                                <Plane size={8} /> {guest.arrival}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Social / Contact Row */}
                            <div className="mt-auto pt-5 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2">
                                    {showSocial && guest.social?.instagram && (
                                        <a href={`https://instagram.com/${guest.social.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-pink-500 rounded-xl transition-colors" title="Instagram">
                                            <Instagram size={14} />
                                        </a>
                                    )}
                                    {showSocial && guest.social?.whatsapp && (
                                        <a href={`https://wa.me/${guest.social.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-green-500 rounded-xl transition-colors" title="WhatsApp">
                                            <Phone size={14} />
                                        </a>
                                    )}
                                    {showPhone && phone && (
                                        <a href={`tel:${phone}`} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-500 rounded-xl transition-colors" title="Call">
                                            <Phone size={14} />
                                        </a>
                                    )}
                                </div>
                                
                                {!isSelf && (
                                    <Button 
                                        onClick={() => handleContactGuest(guest)}
                                        variant="secondary"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <MessageSquare size={12} /> Message
                                    </Button>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            )}

            {/* MY PARTY VIEW */}
            {activeTab === 'my-party' && user && (
                <div id="party-management" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-serif text-3xl text-med-blue dark:text-white">Your Circle</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage Companions</p>
                        </div>
                        <Button 
                            onClick={() => setInviteMode(!inviteMode)} 
                            variant="action"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <UserPlus size={14} /> Add Person
                        </Button>
                    </div>

                    {inviteMode && (
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-med-terracotta/5 rounded-full blur-3xl -mr-10 -mt-10" />
                            <h4 className="font-serif text-xl mb-6 text-med-blue dark:text-white relative z-10">Invite Companion</h4>
                            <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest ml-1">Full Name</label>
                                    <input required type="text" placeholder="Jean Dupont" value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 outline-none text-sm dark:text-white focus:border-med-terracotta transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest ml-1">Email Address</label>
                                    <input required type="email" placeholder="email@example.com" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 outline-none text-sm dark:text-white focus:border-med-terracotta transition-colors" />
                                </div>
                                <div className="md:col-span-2 flex gap-3 pt-2">
                                    <Button type="submit" isLoading={isInviting} loadingText="Sending..." variant="primary" fullWidth size="md">
                                        Send Invite
                                    </Button>
                                    <Button type="button" onClick={() => setInviteMode(false)} variant="ghost" size="md">Cancel</Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {user.partyMembers.map((member) => (
                            <div key={member.id} className="group flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="relative">
                                        <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-md" />
                                        {member.isPrimary && <div className="absolute -top-2 -right-2 bg-med-blue text-white p-1 rounded-full ring-2 ring-white dark:ring-gray-900"><Sparkles size={8} fill="currentColor" /></div>}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-serif text-xl text-med-blue dark:text-white truncate">{member.name}</h4>
                                            {member.isPrimary ? (
                                                <span className="px-2 py-0.5 bg-med-blue/10 text-med-blue dark:text-blue-300 text-[8px] font-bold uppercase rounded-md tracking-wider">Primary</span>
                                            ) : (
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider ${member.status === 'Invited' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>{member.status}</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{member.email}</p>
                                    </div>
                                </div>
                                {!member.isPrimary && (
                                    <button onClick={() => removeFromParty(member.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all" title="Remove Member">
                                        <UserMinus size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Sync Logic */}
                    {user.partyMembers.length > 1 && (
                        <div className="bg-med-blue dark:bg-gray-950 p-10 rounded-[3rem] border border-med-blue/10 dark:border-gray-800 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                            <div className="relative z-10">
                                <h4 className="font-serif text-3xl text-white mb-3 flex items-center gap-3">
                                    Sync Logistics
                                    <Sparkles size={20} className="text-med-terracotta" />
                                </h4>
                                <p className="text-sm text-blue-200/80 mb-8 max-w-lg leading-relaxed font-medium">
                                    Automatically update your companions' travel details to match yours. Perfect if you booked group flights or a shared villa.
                                </p>
                                <Button 
                                    onClick={handleSync}
                                    disabled={isSyncing || (!syncConfig.flights && !syncConfig.lodging)}
                                    variant="action"
                                    size="lg"
                                    isLoading={isSyncing}
                                    loadingText="Syncing..."
                                >
                                    Apply to Party
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};
