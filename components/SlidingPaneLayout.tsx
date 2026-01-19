
import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { ChevronLeft, GripVertical } from 'lucide-react';

interface SlidingPaneLayoutProps {
  master: React.ReactNode;
  detail: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const SlidingPaneLayout: React.FC<SlidingPaneLayoutProps> = ({ 
    master, 
    detail, 
    isOpen, 
    onClose,
    title,
    subtitle
}) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive width calculation
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const panelWidth = isMobile ? '90%' : '50%';
  
  useEffect(() => {
      if (isOpen) {
          controls.start({ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } });
      } else {
          controls.start({ x: '100%', opacity: 0, transition: { duration: 0.3 } });
      }
  }, [isOpen, controls]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100;
      if (info.offset.x > threshold || info.velocity.x > 500) {
          onClose();
      } else {
          controls.start({ x: 0 });
      }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex" ref={containerRef}>
        {/* MASTER VIEW */}
        <div className={`w-full h-full transition-transform duration-500 ease-out ${isOpen ? (isMobile ? 'scale-95 opacity-50' : 'w-1/2') : 'w-full'}`}>
            {master}
        </div>

        {/* DETAIL PANE (Sliding Overlay on Mobile, Split Screen on Desktop) */}
        <motion.div
            initial={{ x: '100%' }}
            animate={controls}
            drag="x"
            dragConstraints={{ left: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className={`
                absolute right-0 top-0 bottom-0 bg-white dark:bg-gray-900 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.1)] border-l border-gray-100 dark:border-gray-800 z-40 flex flex-col
            `}
            style={{ 
                x,
                width: isMobile ? '90%' : '50%',
                // On desktop we might want it to act as a split view, but for now we overlay to match "Slide in" prompt
                // Refinement: If desktop and open, we could animate the master view to shrink to 50%, but prompt asks for slide in covering 50%
            }}
        >
            {/* Drag Handle / Header */}
            <div 
                className="h-full absolute left-0 top-0 w-6 cursor-ew-resize z-50 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                // This div intercepts drag events for the "Edge"
            >
                <div className="h-12 w-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-med-terracotta transition-colors" />
            </div>

            {/* Pane Content Wrapper */}
            <div className="flex-1 flex flex-col h-full pl-6 overflow-hidden relative bg-white dark:bg-gray-900">
                
                {/* Header (Optional based on props, but good for context) */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shrink-0 z-10">
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="md:hidden p-2 -ml-2 text-med-blue hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h3 className="font-serif text-lg text-med-blue dark:text-white leading-none">{title || 'Details'}</h3>
                            {subtitle && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {detail}
                </div>
            </div>
        </motion.div>

        {/* Backdrop for Mobile Only */}
        {isOpen && isMobile && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            />
        )}
    </div>
  );
};
