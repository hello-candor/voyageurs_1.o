
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeStorage } from '../utils/storage';
import { ChatThread, InternalMessage, ChatSource } from '../types';
import { useUser } from './UserContext';
import { useNotification } from './NotificationContext';
import { emailService } from '../services/emailService';

// Extension for internal metadata
export interface BroadcastMetadata {
    audience: string;
    channels: string[]; // 'app', 'email', 'sms'
    subject?: string;
}

interface ChatContextType {
  threads: ChatThread[];
  unreadTotal: number;
  scheduledMessages: InternalMessage[]; // For host view
  sendMessage: (threadId: string, content: string, senderId: string, senderName: string, imageUrl?: string, sources?: ChatSource[]) => void;
  createThread: (participants: string[], type: 'direct' | 'group', subject?: string) => string;
  addParticipant: (threadId: string, email: string) => void;
  scheduleBroadcast: (content: string, audience: string, channels: string[], scheduledTime?: number, subject?: string) => void;
  markThreadRead: (threadId: string, userId: string) => void;
  deleteScheduledMessage: (msgId: string) => void;
  getThread: (threadId: string) => ChatThread | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, allGuests } = useUser();
  const { addNotification } = useNotification();

  const [threads, setThreads] = useState<ChatThread[]>(() => 
    safeStorage.getItem('chat_threads', []) || []
  );

  const [scheduledMessages, setScheduledMessages] = useState<InternalMessage[]>(() => 
    safeStorage.getItem('chat_scheduled', []) || []
  );

  // Persist
  useEffect(() => {
    safeStorage.setItem('chat_threads', threads);
  }, [threads]);

  useEffect(() => {
    safeStorage.setItem('chat_scheduled', scheduledMessages);
  }, [scheduledMessages]);

  // Check for scheduled messages delivery every 10 seconds
  useEffect(() => {
    const checkSchedule = () => {
      const now = Date.now();
      const dueMessages = scheduledMessages.filter(m => m.scheduledFor && m.scheduledFor <= now);
      
      if (dueMessages.length > 0) {
        // Remove from queue
        setScheduledMessages(prev => prev.filter(m => !m.scheduledFor || m.scheduledFor > now));
        
        // Deliver
        setThreads(prevThreads => {
            const newThreads = [...prevThreads];
            
            dueMessages.forEach(msg => {
                // Extract metadata from the hidden tag in content
                const metaMatch = msg.content.match(/^\[Meta: (.*?)\]/);
                let audience = 'All';
                let channels = ['app'];
                let subject = 'Event Update';

                if (metaMatch) {
                    try {
                        const meta = JSON.parse(metaMatch[1]);
                        audience = meta.audience;
                        channels = meta.channels;
                        subject = meta.subject || subject;
                    } catch (e) { console.error("Meta parse error", e); }
                }

                const cleanContent = msg.content.replace(/^\[Meta: .*?\]\s*/, '');

                // Filter Targets based on Audience String
                const targets = allGuests.filter(g => {
                    if (audience === 'All') return true;
                    if (['Confirmed', 'Pending', 'Declined'].includes(audience)) return g.status === audience;
                    if (audience.startsWith('Arrival:')) {
                        const targetDate = audience.split(':')[1].trim();
                        return g.travelDetails?.arrivalDate === targetDate;
                    }
                    return false;
                });

                targets.forEach(guest => {
                    // 1. Deliver to In-App Chat
                    if (channels.includes('app')) {
                        let thread = newThreads.find(t => t.participants.includes('HOST') && t.participants.includes(guest.email) && t.type === 'direct');
                        
                        if (!thread) {
                            thread = {
                                id: `thread-host-${guest.email}`,
                                participants: ['HOST', guest.email],
                                type: 'direct',
                                messages: [],
                                updatedAt: now,
                                lastMessagePreview: ''
                            };
                            newThreads.push(thread);
                        }
                        
                        const newMsg = { ...msg, content: cleanContent, scheduledFor: undefined, timestamp: now, readBy: ['HOST'] };
                        thread.messages.push(newMsg as any);
                        thread.lastMessagePreview = cleanContent;
                        thread.updatedAt = now;
                    }

                    // 2. Deliver to Email (Simulated)
                    if (channels.includes('email')) {
                        emailService.sendTemplateEmail(guest.email, 'NEW_MESSAGE', {
                            recipientName: guest.name,
                            senderName: 'Bryan (Host)',
                            preview: cleanContent,
                            url: window.location.href
                        });
                    }

                    // 3. Deliver to SMS (Simulated via push for demo)
                    if (channels.includes('sms') && guest.social?.phoneUS) {
                         console.log(`%c 📱 SMS SENT TO: ${guest.social.phoneUS}`, 'color: #8A9A5B; font-weight: bold;');
                    }
                });
            });
            return newThreads;
        });
        
        if (user?.name) { 
             addNotification(`${dueMessages.length} scheduled broadcast(s) delivered.`, 'success');
        }
      }
    };

    const interval = setInterval(checkSchedule, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [scheduledMessages, allGuests, user, addNotification]);

  const unreadTotal = threads.reduce((acc, t) => {
      if (!user) return 0;
      const isParticipant = t.participants.includes(user.email);
      if (!isParticipant) return acc;
      
      const unreadInThread = t.messages.filter(m => !m.readBy.includes(user.email) && m.senderId !== user.email).length;
      return acc + (unreadInThread > 0 ? 1 : 0);
  }, 0);

  const sendMessage = useCallback((threadId: string, content: string, senderId: string, senderName: string, imageUrl?: string, sources?: ChatSource[]) => {
      setThreads(prev => prev.map(t => {
          if (t.id !== threadId) return t;
          
          const newMessage: InternalMessage = {
              id: Date.now().toString(),
              senderId,
              senderName,
              content,
              timestamp: Date.now(),
              readBy: [senderId], // Sender has read it
              type: imageUrl ? 'image' : 'text',
              imageUrl,
              sources
          };

          // Trigger Notification Email to Recipients
          const recipients = t.participants.filter(email => email !== senderId && email !== 'CELESTE');
          recipients.forEach(email => {
              const guestName = allGuests.find(g => g.email === email)?.name || 'Voyageur';
              emailService.sendTemplateEmail(email, 'NEW_MESSAGE', {
                  recipientName: guestName,
                  senderName: senderName,
                  preview: content.length > 50 ? content.substring(0, 50) + '...' : content,
                  url: window.location.href
              });
          });

          return {
              ...t,
              messages: [...t.messages, newMessage],
              lastMessagePreview: imageUrl ? '📷 Photo' : content,
              updatedAt: Date.now()
          };
      }));
  }, [allGuests]);

  const createThread = useCallback((participants: string[], type: 'direct' | 'group', subject?: string) => {
      const sortedParts = [...participants].sort();
      if (type === 'direct') {
          const existing = threads.find(t => 
              t.type === 'direct' && 
              t.participants.length === sortedParts.length &&
              t.participants.every(p => sortedParts.includes(p))
          );
          if (existing) return existing.id;
      }

      const newId = `thread-${Date.now()}`;
      const newThread: ChatThread = {
          id: newId,
          participants: sortedParts,
          type,
          subject,
          messages: [],
          updatedAt: Date.now(),
          lastMessagePreview: 'New conversation started'
      };

      setThreads(prev => [newThread, ...prev]);
      return newId;
  }, [threads]);

  const addParticipant = useCallback((threadId: string, email: string) => {
      setThreads(prev => prev.map(t => {
          if (t.id !== threadId) return t;
          if (t.participants.includes(email)) return t;

          const guest = allGuests.find(g => g.email === email);
          const guestName = guest ? guest.name : email;
          const updatedParticipants = [...t.participants, email];
          
          const sysMsg: InternalMessage = {
              id: `sys-${Date.now()}`,
              senderId: 'system',
              senderName: 'System',
              content: `${guestName} joined the group.`,
              timestamp: Date.now(),
              readBy: [],
              type: 'system'
          };

          return {
              ...t,
              participants: updatedParticipants,
              type: 'group',
              messages: [...t.messages, sysMsg],
              updatedAt: Date.now()
          };
      }));
  }, [allGuests]);

  const markThreadRead = useCallback((threadId: string, userId: string) => {
      setThreads(prev => prev.map(t => {
          if (t.id !== threadId) return t;
          const updatedMessages = t.messages.map(m => {
              if (!m.readBy.includes(userId)) {
                  return { ...m, readBy: [...m.readBy, userId] };
              }
              return m;
          });
          return { ...t, messages: updatedMessages };
      }));
  }, []);

  const scheduleBroadcast = useCallback((content: string, audience: string, channels: string[], scheduledTime?: number, subject?: string) => {
      const meta = JSON.stringify({ audience, channels, subject });
      const fullContent = `[Meta: ${meta}] ${content}`;

      // If immediate
      if (!scheduledTime || scheduledTime <= Date.now()) {
          const targets = allGuests.filter(g => {
              if (audience === 'All') return true;
              if (['Confirmed', 'Pending', 'Declined'].includes(audience)) return g.status === audience;
              if (audience.startsWith('Arrival:')) {
                  const targetDate = audience.split(':')[1].trim();
                  return g.travelDetails?.arrivalDate === targetDate;
              }
              return false;
          });
          
          setThreads(prev => {
              const newThreads = [...prev];
              targets.forEach(g => {
                  if (channels.includes('app')) {
                    let thread = newThreads.find(t => t.participants.includes('HOST') && t.participants.includes(g.email) && t.type === 'direct');
                    if (!thread) {
                        thread = {
                            id: `thread-host-${g.email}`,
                            participants: ['HOST', g.email],
                            type: 'direct',
                            messages: [],
                            updatedAt: Date.now(),
                            lastMessagePreview: ''
                        };
                        newThreads.push(thread);
                    }
                    
                    const msg: InternalMessage = {
                        id: `msg-${Date.now()}-${Math.random()}`,
                        senderId: 'HOST',
                        senderName: 'Bryan (Host)',
                        content,
                        timestamp: Date.now(),
                        readBy: ['HOST'],
                        type: 'text'
                    };
                    thread.messages.push(msg);
                    thread.lastMessagePreview = content;
                    thread.updatedAt = Date.now();
                  }

                  if (channels.includes('email')) {
                      emailService.sendTemplateEmail(g.email, 'NEW_MESSAGE', {
                          recipientName: g.name,
                          senderName: 'Bryan (Host)',
                          preview: content,
                          url: window.location.href
                      });
                  }
              });
              return newThreads;
          });
      } else {
          // Add to queue
          const queueMsg: InternalMessage = {
              id: `queue-${Date.now()}`,
              senderId: 'HOST',
              senderName: 'Bryan (Host)',
              content: fullContent,
              timestamp: Date.now(),
              scheduledFor: scheduledTime,
              readBy: [],
              type: 'text'
          };
          setScheduledMessages(prev => [...prev, queueMsg]);
      }
  }, [allGuests]);

  const deleteScheduledMessage = useCallback((msgId: string) => {
      setScheduledMessages(prev => prev.filter(m => m.id !== msgId));
  }, []);

  const getThread = useCallback((threadId: string) => {
      return threads.find(t => t.id === threadId);
  }, [threads]);

  return (
    <ChatContext.Provider value={{
        threads, unreadTotal, scheduledMessages,
        sendMessage, createThread, addParticipant, scheduleBroadcast, markThreadRead, deleteScheduledMessage, getThread
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
