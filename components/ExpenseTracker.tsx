
import React, { useState, useMemo, useRef } from 'react';
import { 
    Receipt, Camera, Loader2, Users, DollarSign, 
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Share2, 
    CreditCard, Smartphone, Banknote, Calendar, Landmark, Sparkles, UserPlus,
    Utensils, Car, Ticket, Bed, ShoppingBag, HelpCircle, History, CheckCircle2,
    Plus, ExternalLink
} from 'lucide-react';
import { useUser, Guest } from '../context/UserContext';
import { analyzeReceipt } from '../services/geminiService';
import { uploadImage } from '../services/storageService'; // Import Upload Service
import { SharedExpense, CoordinatedGroup } from '../types';
import { isValidAmount, isValidName } from '../utils/validation';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { useNotification } from '../context/NotificationContext';

const EXPENSE_CATEGORIES = [
    { id: 'Dining', label: 'Dining', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'Transport', label: 'Transport', icon: Car, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'Activities', label: 'Activities', icon: Ticket, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'Lodging', label: 'Lodging', icon: Bed, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'Groceries', label: 'Groceries', icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'Other', label: 'Other', icon: HelpCircle, color: 'text-gray-500', bg: 'bg-gray-500/10' }
];

export const ExpenseTracker: React.FC = () => {
    const { user, allGuests, sharedExpenses, addSharedExpense, resolveSharedExpense, coordinatedGroups } = useUser();
    const { addNotification } = useNotification();
    const [isLogging, setIsLogging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedSplitees, setSelectedSplitees] = useState<string[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [viewStatus, setViewStatus] = useState<'active' | 'resolved'>('active');
    
    const [newExpense, setNewExpense] = useState({
        amount: 0,
        description: '',
        merchant: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Dining',
        receiptUrl: '' // Add URL state
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate Balances
    const myStats = useMemo(() => {
        if (!user) return { owed: 0, owe: 0 };
        let owed = 0;
        let owe = 0;

        sharedExpenses.forEach(exp => {
            if (exp.status === 'resolved') return;
            const splitCount = exp.splitWithIds.length + 1; // +1 for the payer
            const splitAmount = exp.amount / splitCount;

            if (exp.payerId === user.email) {
                // I paid, others owe me
                owed += splitAmount * exp.splitWithIds.length;
            } else if (exp.splitWithIds.includes(user.email)) {
                // Someone else paid, I owe my share
                owe += splitAmount;
            }
        });

        return { owed, owe };
    }, [sharedExpenses, user]);

    const filteredExpenses = useMemo(() => {
        let filtered = sharedExpenses;
        
        // Filter by Status
        filtered = filtered.filter(e => e.status === viewStatus);

        // Filter by Category
        if (categoryFilter !== 'All') {
            filtered = filtered.filter(e => e.category === categoryFilter);
        }
        
        return filtered;
    }, [sharedExpenses, categoryFilter, viewStatus]);

    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        
        try {
            // 1. Upload to Firebase Storage
            const downloadUrl = await uploadImage(file, 'receipts');
            
            // 2. Read for Gemini Analysis (needs Base64)
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const data = await analyzeReceipt(base64, file.type);
                
                setNewExpense(prev => ({
                    ...prev,
                    amount: data.amount,
                    merchant: data.merchant,
                    description: data.description,
                    date: data.date || new Date().toISOString().split('T')[0],
                    receiptUrl: downloadUrl // Store the Firebase URL
                }));
                setIsAnalyzing(false);
                addNotification("Receipt analyzed and attached.", "success");
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Upload failed", error);
            setIsAnalyzing(false);
            addNotification("Receipt upload failed. Please try again.", "error");
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!isValidAmount(newExpense.amount)) newErrors.amount = "Amount must be > 0";
        if (!isValidName(newExpense.merchant)) newErrors.merchant = "Required";
        if (selectedSplitees.length === 0) newErrors.split = "Select at least 1 person";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !validate()) return;
        addSharedExpense({
            payerId: user.email,
            payerName: user.name,
            amount: newExpense.amount,
            description: newExpense.description,
            date: newExpense.date,
            merchant: newExpense.merchant,
            category: newExpense.category,
            splitWithIds: selectedSplitees,
            receiptUrl: newExpense.receiptUrl
        });
        setIsLogging(false);
        setNewExpense({ amount: 0, description: '', merchant: '', date: new Date().toISOString().split('T')[0], category: 'Dining', receiptUrl: '' });
        setSelectedSplitees([]);
    };

    const toggleSplitee = (guestEmail: string) => {
        setSelectedSplitees(prev => 
            prev.includes(guestEmail) ? prev.filter(e => e !== guestEmail) : [...prev, guestEmail]
        );
        if (errors.split) setErrors({...errors, split: ''});
    };

    const applyGroupMembers = (members: string[]) => {
        setSelectedSplitees(members.filter(email => email !== user?.email));
        if (errors.split) setErrors({...errors, split: ''});
    };

    const getPaymentLink = (guest: Guest, amount: number) => {
        if (guest.social?.venmo) return `https://venmo.com/${guest.social.venmo}?txn=pay&amount=${amount.toFixed(2)}`;
        if (guest.social?.cashapp) return `https://cash.app/${guest.social.cashapp}/${amount.toFixed(2)}`;
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Header - Standardized Style */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 dark:border-white/5 pb-6">
                <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-none whitespace-nowrap">
                    Shared <span className="italic text-med-terracotta">Ledger</span>
                </h2>
                <div className="bg-white/80 dark:bg-gray-800/80 p-1 border border-gray-100 dark:border-gray-700 rounded-full flex items-center gap-1 shadow-sm">
                    <Button 
                        variant="primary"
                        onClick={() => setIsLogging(true)}
                        size="sm"
                    >
                        Log Expense
                    </Button>
                    <div className="flex items-center gap-2 px-5 py-2.5 text-gray-500 dark:text-gray-400">
                         <Receipt size={14} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Finance Hub</span>
                    </div>
                </div>
            </div>

            <div className="animate-in fade-in duration-700 pt-2">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                    
                    {/* Left Column: Summary */}
                    <div className="lg:w-1/3">
                        <div className="lg:sticky lg:top-28 space-y-8">
                            <div id="splitter-summary">
                                <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-xs block mb-3">Balance Sheet</span>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-sans mb-8 text-sm">
                                    Coordinate side-trips and group dinners without the awkward math. Upload a receipt, select your group, and settle up at your convenience.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">You are Owed</p>
                                    <p className="text-2xl font-serif font-bold text-med-olive">${myStats.owed.toLocaleString()}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">You Owe</p>
                                    <p className="text-2xl font-serif font-bold text-med-terracotta">${myStats.owe.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Feed */}
                    <div id="splitter-feed" className="lg:w-2/3 space-y-8 min-h-[600px]">
                        {isLogging ? (
                            <div className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl animate-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="font-serif text-3xl text-med-blue dark:text-white">New Shared Bill</h3>
                                    <Button variant="ghost" onClick={() => setIsLogging(false)}>Cancel</Button>
                                </div>

                                <div className="space-y-10">
                                    {/* Image Upload */}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative h-48 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-med-terracotta/50 transition-all group bg-gray-50 dark:bg-gray-800/50"
                                    >
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleReceiptUpload} />
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center gap-3 text-med-terracotta">
                                                <Loader2 size={32} className="animate-spin" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Uploading & Analyzing...</p>
                                            </div>
                                        ) : newExpense.receiptUrl ? (
                                            <div className="w-full h-full relative group rounded-3xl overflow-hidden">
                                                <img src={newExpense.receiptUrl} alt="Receipt" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-med-olive text-white px-4 py-2 rounded-full text-xs font-bold uppercase flex items-center gap-2 shadow-lg">
                                                        <CheckCircle2 size={14} /> Receipt Attached
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Camera size={40} className="text-gray-300 group-hover:text-med-terracotta transition-colors mb-3" />
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Snap or Upload Receipt</p>
                                                <p className="text-[10px] text-gray-400 mt-1 italic">AI will extract total & merchant</p>
                                            </>
                                        )}
                                    </div>

                                    <form onSubmit={handleLogExpense} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest ml-1">Merchant / Venue</label>
                                                <input 
                                                    type="text" 
                                                    value={newExpense.merchant} 
                                                    onChange={e => {
                                                        setNewExpense({...newExpense, merchant: e.target.value});
                                                        if (errors.merchant) setErrors({...errors, merchant: ''});
                                                    }} 
                                                    className={`w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none font-sans text-lg dark:text-white shadow-inner border ${errors.merchant ? 'border-red-500' : 'border-transparent'}`} 
                                                    placeholder="e.g. Brasserie du Peyrou" 
                                                />
                                                {errors.merchant && <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider ml-1">{errors.merchant}</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest ml-1">Total Amount ($)</label>
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    value={newExpense.amount} 
                                                    onChange={e => {
                                                        setNewExpense({...newExpense, amount: parseFloat(e.target.value)});
                                                        if (errors.amount) setErrors({...errors, amount: ''});
                                                    }} 
                                                    className={`w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none text-2xl font-sans text-med-blue dark:text-white shadow-inner border ${errors.amount ? 'border-red-500' : 'border-transparent'}`} 
                                                />
                                                {errors.amount && <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider ml-1">{errors.amount}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest ml-1">Category</label>
                                            <div className="flex flex-wrap gap-2">
                                                {EXPENSE_CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => setNewExpense({...newExpense, category: cat.id})}
                                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                                                            newExpense.category === cat.id
                                                            ? `bg-med-blue text-white border-med-blue shadow-md`
                                                            : `bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-gray-300`
                                                        }`}
                                                    >
                                                        <cat.icon size={14} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">{cat.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest ml-1">Description</label>
                                            <input required type="text" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none outline-none text-sm font-sans dark:text-white shadow-inner" placeholder="e.g. Lunch after Sète market" />
                                        </div>

                                        {/* DEEP INTEGRATION: Coordinated Groups */}
                                        {coordinatedGroups.length > 0 && (
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-bold uppercase text-med-blue dark:text-blue-300 tracking-widest ml-1 flex items-center gap-2">
                                                    <Sparkles size={12} className="text-med-terracotta" /> Quick Selection from Matchmaker
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {coordinatedGroups.map(group => (
                                                        <button 
                                                            key={group.id} 
                                                            type="button"
                                                            onClick={() => applyGroupMembers(group.members)}
                                                            className="px-3 py-1.5 bg-med-sand dark:bg-gray-800 border border-med-terracotta/20 rounded-full text-[9px] font-bold uppercase tracking-widest text-med-blue dark:text-blue-200 hover:bg-med-terracotta hover:text-white transition-all flex items-center gap-1.5"
                                                        >
                                                            <UserPlus size={10} /> {group.name} Team
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className={`text-[9px] font-bold uppercase tracking-widest ml-1 ${errors.split ? 'text-red-500' : 'text-gray-400'}`}>Split With Voyageurs {errors.split && '*'}</label>
                                                <span className="text-[9px] text-med-terracotta font-bold uppercase">Share: ${(newExpense.amount / (selectedSplitees.length + 1)).toFixed(2)} / pp</span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {allGuests.filter(g => g.email !== user?.email).map(guest => (
                                                    <button 
                                                        key={guest.id}
                                                        type="button"
                                                        onClick={() => toggleSplitee(guest.email)}
                                                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                                                            selectedSplitees.includes(guest.email) 
                                                            ? 'border-med-blue bg-med-blue/5' 
                                                            : 'border-gray-50 dark:bg-gray-800 hover:border-med-blue/20 dark:border-gray-700'
                                                        }`}
                                                    >
                                                        <img src={guest.img} className="w-6 h-6 rounded-full" alt="" />
                                                        <span className="text-[10px] font-bold truncate dark:text-white">{guest.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            fullWidth
                                        >
                                            Confirm Split
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <h3 className="font-serif text-2xl text-med-blue dark:text-blue-100">Activity Ledger</h3>
                                    
                                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
                                        <button 
                                            onClick={() => setViewStatus('active')}
                                            className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${viewStatus === 'active' ? 'bg-white dark:bg-gray-700 text-med-blue dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            Active
                                        </button>
                                        <button 
                                            onClick={() => setViewStatus('resolved')}
                                            className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${viewStatus === 'resolved' ? 'bg-white dark:bg-gray-700 text-med-blue dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <History size={10} /> History
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Category Filters */}
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full">
                                    <button 
                                        onClick={() => setCategoryFilter('All')}
                                        className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${categoryFilter === 'All' ? 'bg-med-blue text-white border-med-blue' : 'text-gray-500 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    >
                                        All
                                    </button>
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <button 
                                            key={cat.id}
                                            onClick={() => setCategoryFilter(cat.id)}
                                            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all flex items-center gap-1.5 whitespace-nowrap ${categoryFilter === cat.id ? 'bg-med-blue text-white border-med-blue' : 'text-gray-500 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                        >
                                            <cat.icon size={10} />
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    {filteredExpenses.length === 0 ? (
                                        <EmptyState 
                                            icon={viewStatus === 'active' ? Receipt : History}
                                            title={viewStatus === 'active' ? "No Active Bills" : "History Empty"}
                                            message={viewStatus === 'active' 
                                                ? "There are no outstanding expenses to settle. Time to grab a drink?" 
                                                : "No settled expenses recorded yet."}
                                            actionLabel={viewStatus === 'active' ? "Log Expense" : undefined}
                                            onAction={() => setIsLogging(true)}
                                        />
                                    ) : (
                                        filteredExpenses.map(exp => {
                                            const sharePerPerson = exp.amount / (exp.splitWithIds.length + 1);
                                            const iOwe = exp.payerId !== user?.email && exp.splitWithIds.includes(user?.email || '');
                                            const iPaid = exp.payerId === user?.email;
                                            const isResolved = exp.status === 'resolved';
                                            const catInfo = EXPENSE_CATEGORIES.find(c => c.id === exp.category) || EXPENSE_CATEGORIES[5];

                                            return (
                                                <div key={exp.id} className={`bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden transition-all hover:shadow-lg ${isResolved ? 'opacity-75' : ''}`}>
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                                        <div className="flex items-center gap-6">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${catInfo.bg} ${catInfo.color}`}>
                                                                <catInfo.icon size={24} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-1">
                                                                    <h4 className="font-serif text-2xl text-med-blue dark:text-white">{exp.merchant || 'General Expense'}</h4>
                                                                    {isResolved && <span className="bg-gray-100 dark:bg-gray-800 text-gray-400 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> Settled</span>}
                                                                </div>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                                    <Calendar size={12} /> {exp.date} • {exp.payerName} Paid
                                                                </p>
                                                                {/* Receipt Link */}
                                                                {exp.receiptUrl && (
                                                                    <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-med-terracotta hover:underline mt-1 flex items-center gap-1">
                                                                        <ExternalLink size={10} /> View Receipt
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                                                                {iPaid ? "Others Owe You" : iOwe ? "Your share" : "Group Total"}
