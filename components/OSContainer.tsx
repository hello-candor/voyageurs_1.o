import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HubLayout } from './HubLayout';
import { HostAdmin } from './HostAdmin';
import { safeStorage } from '../utils/storage';
import { Loader2 } from 'lucide-react';

interface OSContainerProps {
  initialMode?: 'guest' | 'host';
}

const LoadingScreen = () => (
  <div className="absolute inset-0 bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
);

export const OSContainer: React.FC<OSContainerProps> = ({ initialMode = 'guest' }) => {
  const [mode, setMode] = useState<'guest' | 'host'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Clear admin hub data when switching between modes to prevent hang-ups
  useEffect(() => {
    if (mode === 'guest') {
      // When switching to guest mode, clear admin-related storage
      safeStorage.clearAppStorage([
        'host_tour_seen',
        'host_session'
      ]);
    }
  }, [mode]);

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden font-sans z-[100] transition-colors duration-300">
      <AnimatePresence initial={false} mode="wait">
        {mode === 'guest' ? (
          <motion.div
            key="guest"
            className="absolute inset-0"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={<LoadingScreen />}>
              <HubLayout onSwitchToHost={() => setMode('host')} />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="host"
            className="absolute inset-0"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={<LoadingScreen />}>
              <HostAdmin onSwitchToGuest={() => setMode('guest')} onClose={() => setMode('guest')} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};