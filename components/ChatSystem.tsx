
import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, MoreVertical, ArrowLeft, Loader2, User, Sparkles, MessageCircle, Clock, ExternalLink } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { askConcierge } from '../services/geminiService';
import { ChatThread, InternalMessage } from '../types';
import { HubView } from './HubLayout';

interface ChatSystemProps {
    onNavigate?: (view: HubView) => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ onNavigate }) => {
    const { threads, sendMessage, createThread, markThreadRead, getThread } = useChat();
    const { user, allGuests } = useUser();
    const { items, travelers, durationDays } = useTripPlanner();
    
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // If no active thread, default to "CELESTE" (AI) thread if exists, or show list
    useEffect(() => {
        if (!activeThreadId && user) {
            const aiThread = threads.find(t => t.participants.includes('CELESTE') && t.participants.includes(user.email));
            if (aiThread) {
                // Optional: Auto-select AI thread? For now, let user select.
            }
        }
    }, [activeThreadId, threads, user]);

    useEffect(() => {
        if (activeThreadId) {
            scrollToBottom();
            if (user) markThreadRead(activeThreadId, user.email);
        }
    }, [activeThreadId, threads, user, markThreadRead]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !user || !activeThreadId) return;

        const currentThread = getThread(activeThreadId);
        if (!currentThread) return;

        const content = messageInput;
        sendMessage(activeThreadId, content, user.email, user.name);
        setMessageInput('');

        // AI Response Logic
        if (currentThread.participants.includes('CELESTE')) {
            setIsAiThinking(true);
            
            // Build Context
            const status = user.status || 'Pending';
            const arrivalInfo = user.travelDetails?.arrivalDate 
                ? `Arriving: ${user.travelDetails.arrivalDate} via ${user.travelDetails.arrivalMode}` 
                : 'Arrival: Not yet booked';
            const hotelInfo = user.travelDetails?.accommodation || 'Accommodation: Not yet booked';
            
            const itineraryDetails = items.map(i => 
                `- ${i.category}: ${i.name} (${i.bookingStatus === 'booked' ? 'Booked' : 'Planned'}, $${i.cost})`
            ).join('\n');

            const context = `
                USER PROFILE:
                - Name: ${user.name}
                - RSVP Status: ${status} (If 'Confirmed', do not ask them to RSVP. If 'Pending', remind them.)
                - Party Size: ${travelers}
                - Trip Dates: ${user.travelDetails?.arrivalDate || 'Not set'} to ${user.travelDetails?.departureDate || 'Not set'} (${durationDays} days)
                - Logistics: ${arrivalInfo}, ${hotelInfo}
                - Saved Itinerary Items:
                ${itineraryDetails || 'No items saved yet.'}
            `;
            
            // Get history for context
            const history = currentThread.messages.slice(-10).map(m => ({
                role: (m.senderId === 'CELESTE' ? 'model' : 'user') as 'user' | 'model',
                text: m.content
            }));

            try {
                const response = await askConcierge(content, context, undefined, history);
                sendMessage(activeThreadId, response.text, 'CELESTE', 'Céleste (AI)', undefined, response.sources);
            } catch (error) {
                console.error("AI Error", error);
                sendMessage(activeThreadId, "I'm having a moment of silence. Please try again later.", 'CELESTE', 'Céleste (AI)');
            } finally {
                setIsAiThinking(false);
            }
        }
    };

    const startAiChat = () => {
        if (!user) return;
        const threadId = createThread(['CELESTE', user.email], 'direct', 'Concierge');
        setActiveThreadId(threadId);
    };

    const activeThread = activeThreadId ? getThread(activeThreadId) : null;

    // Filter threads relevant to user
    const userThreads = threads.filter(t => user && t.participants.includes(user.email)).sort((a, b) => b.updatedAt - a.updatedAt);

    return (
        <div className="flex h-full bg-med-sand dark:bg-gray-950 overflow-hidden">
            {/* Thread List - Hidden on mobile if thread active */}
            <div className={`w-full md:w-80 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col ${activeThreadId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="font-serif text-2xl text-med-blue dark:text-white">Messages</h2>
                    <button onClick={startAiChat} className="p-2 bg-med-blue/10 text-med-blue rounded-full hover:bg-med-blue hover:text-white transition-colors" title="Ask Céleste">
                        <Sparkles size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {userThreads.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-sm">No conversations yet.</p>
                            <button onClick={startAiChat} className="mt-4 text-med-blue font-bold text-xs uppercase tracking-wider hover:underline">Start Chat with AI</button>
                        </div>
                    ) : (
                        userThreads.map(thread => {
                            const isAi = thread.participants.includes('CELESTE');
                            const otherParticpantEmail = thread.participants.find(p => p !== user?.email && p !== 'CELESTE') || 'Group';
                            const otherGuest = allGuests.find(g => g.email === otherParticpantEmail);
                            
                            // Avatar logic
                            let avatar = otherGuest?.img;
                            let name = otherGuest?.name || 'Group Chat';
                            
                            if (isAi) {
                                name = 'Céleste (AI)';
                                avatar = undefined; // Use icon
                            } else if (thread.participants.includes('HOST')) {
                                name = 'Host (Bryan)';
                            }

                            const isActive = activeThreadId === thread.id;
                            const lastMsg = thread.messages[thread.messages.length - 1];
                            const isUnread = user && lastMsg && !lastMsg.readBy.includes(user.email) && lastMsg.senderId !== user.email;

                            return (
                                <button
                                    key={thread.id}
                                    onClick={() => setActiveThreadId(thread.id)}
                                    className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 ${isActive ? 'bg-blue-50 dark:bg-gray-800' : ''}`}
                                >
                                    <div className="relative">
                                        {isAi ? (
                                            <div className="w-12 h-12 bg-med-blue text-white rounded-full flex items-center justify-center">
                                                <Sparkles size={20} />
                                            </div>
                                        ) : (
                                            <img src={avatar || `https://ui-avatars.com/api/?name=${name}`} alt={name} className="w-12 h-12 rounded-full object-cover" />
                                        )}
                                        {isUnread && <div className="absolute top-0 right-0 w-3 h-3 bg-med-terracotta rounded-full border-2 border-white dark:border-gray-900" />}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className={`text-sm font-bold truncate ${isUnread ? 'text-med-blue dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{name}</span>
                                            {lastMsg && <span className="text-[10px] text-gray-400">{new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                                        </div>
                                        <p className={`text-xs truncate ${isUnread ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}>
                                            {thread.lastMessagePreview || 'Start the conversation...'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Active Thread View */}
            <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-black/20 ${!activeThreadId ? 'hidden md:flex' : 'flex'}`}>
                {activeThread ? (
                    <>
                        <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveThreadId(null)} className="md:hidden p-2 -ml-2 text-gray-500">
                                    <ArrowLeft size={20} />
                                </button>
                                {activeThread.participants.includes('CELESTE') ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-med-blue text-white rounded-full flex items-center justify-center"><Sparkles size={18} /></div>
                                        <div>
                                            <h3 className="font-bold text-med-blue dark:text-white">Céleste</h3>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">AI Concierge</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><User size={20} /></div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">Chat</h3>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{activeThread.participants.length} Participants</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className="p-2 text-gray-400 hover:text-med-blue"><MoreVertical size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeThread.messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.email;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                                            isMe 
                                            ? 'bg-med-blue text-white rounded-br-none' 
                                            : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-800'
                                        }`}>
                                            {!isMe && <p className="text-[10px] font-bold opacity-50 mb-1 uppercase tracking-wider">{msg.senderName}</p>}
                                            {msg.type === 'image' && msg.imageUrl && (
                                                <img src={msg.imageUrl} alt="Attachment" className="rounded-lg mb-2 max-w-full" />
                                            )}
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            
                                            {/* GROUNDING SOURCES RENDERING */}
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className={`mt-4 pt-3 border-t ${isMe ? 'border-white/10' : 'border-gray-100 dark:border-gray-800'}`}>
                                                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${isMe ? 'text-blue-200/60' : 'text-gray-400'}`}>Sources</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {msg.sources.map((source, sIdx) => (
                                                            <a 
                                                                key={sIdx}
                                                                href={source.uri}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${
                                                                    isMe 
                                                                    ? 'bg-white/10 text-white hover:bg-white/20' 
                                                                    : 'bg-gray-100 dark:bg-gray-800 text-med-blue dark:text-blue-300 hover:bg-med-blue/5'
                                                                }`}
                                                            >
                                                                <ExternalLink size={10} />
                                                                <span className="truncate max-w-[120px]">{source.title}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <p className={`text-[9px] mt-2 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            {isAiThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-3 text-gray-500 border border-gray-100 dark:border-gray-800">
                                        <Loader2 size={16} className="animate-spin text-med-terracotta" />
                                        <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Checking records...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                            <button type="button" className="p-3 text-gray-400 hover:text-med-blue hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                <Image size={20} />
                            </button>
                            <input 
                                type="text" 
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 focus:ring-2 focus:ring-med-blue/20 outline-none dark:text-white"
                            />
                            <button 
                                type="submit" 
                                disabled={!messageInput.trim() || isAiThinking}
                                className="p-3 bg-med-blue text-white rounded-xl hover:bg-med-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle size={64} className="mb-4 opacity-20" />
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
