import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, Plus, Loader2, RefreshCw } from 'lucide-react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

const db = getFirestore();

interface ScheduledEmail {
  id: string;
  to: string[];
  message: {
    subject: string;
    text: string;
    html: string;
  };
  sendAt: Date;
  status: 'pending' | 'sent' | 'error';
}

export const EmailCampaigns = () => {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendDate, setSendDate] = useState('');
  const [sendTime, setSendTime] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'scheduled_emails'), orderBy('sendAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sendAt: doc.data().sendAt?.toDate() || new Date()
      })) as ScheduledEmail[];
      setEmails(data);
    });
    return unsubscribe;
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !body) return;
    setIsLoading(true);

    try {
      let sendAtTimestamp = Timestamp.now();
      if (sendDate && sendTime) {
        const dateStr = `${sendDate}T${sendTime}:00`;
        sendAtTimestamp = Timestamp.fromDate(new Date(dateStr));
      }

      await addDoc(collection(db, 'scheduled_emails'), {
        to: to.split(',').map(e => e.trim()).filter(Boolean),
        message: {
          subject,
          text: body,
          html: body.replace(/\n/g, '<br/>')
        },
        sendAt: sendAtTimestamp,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      setIsDrafting(false);
      setTo('');
      setSubject('');
      setBody('');
      setSendDate('');
      setSendTime('');
    } catch (err) {
      console.error("Failed to schedule email", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-light">Communications</h2>
          <p className="text-xs font-body text-white/50 tracking-wider">Schedule emails to your guests</p>
        </div>
        <button
          onClick={() => setIsDrafting(!isDrafting)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C07D5E] text-white rounded-full text-xs font-bold tracking-widest hover:brightness-110 transition-all"
        >
          {isDrafting ? 'Cancel' : <><Plus size={14} /> New Email</>}
        </button>
      </div>

      {isDrafting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/20 p-6 rounded-2xl border border-white/10 mb-8"
        >
          <form onSubmit={handleSchedule} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">To (comma separated emails)</label>
              <input
                type="text"
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="guests@example.com"
                className="w-full h-10 bg-black/30 border border-white/10 rounded-lg px-3 text-sm focus:border-[#C07D5E] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Important updates for our trip!"
                className="w-full h-10 bg-black/30 border border-white/10 rounded-lg px-3 text-sm focus:border-[#C07D5E] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Message</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-3 text-sm focus:border-[#C07D5E] outline-none resize-none"
                placeholder="Write your email body here..."
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Send Date (Optional)</label>
                <input
                  type="date"
                  value={sendDate}
                  onChange={e => setSendDate(e.target.value)}
                  className="w-full h-10 bg-black/30 border border-white/10 rounded-lg px-3 text-sm focus:border-[#C07D5E] outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Send Time</label>
                <input
                  type="time"
                  value={sendTime}
                  onChange={e => setSendTime(e.target.value)}
                  className="w-full h-10 bg-black/30 border border-white/10 rounded-lg px-3 text-sm focus:border-[#C07D5E] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !to || !subject || !body}
              className="w-full h-10 bg-[#C07D5E] text-white rounded-lg text-xs font-bold tracking-widest uppercase mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : (sendDate ? <Clock size={14} /> : <Send size={14} />)}
              {sendDate ? 'Schedule Email' : 'Send Now'}
            </button>
          </form>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {emails.length === 0 && !isDrafting && (
          <div className="text-center py-12 text-white/40">
            <Send size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-body">No emails scheduled or sent yet.</p>
          </div>
        )}
        
        {emails.map(email => (
          <div key={email.id} className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium">{email.message.subject}</h3>
              <p className="text-xs text-white/50 mt-1 line-clamp-1">{email.message.text}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2 flex items-center gap-1">
                To: {email.to.join(', ')}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded border ${
                email.status === 'sent' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                email.status === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                {email.status}
              </span>
              <span className="text-[10px] text-white/40 mt-2 whitespace-nowrap">
                {email.sendAt.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
