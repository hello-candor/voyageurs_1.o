import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface WebOSCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isActive: boolean;
  isOverview: boolean;
  index: number;
  activeIndex: number;
  stackIndex: number;
  stackSize: number;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export const WebOSCard: React.FC<WebOSCardProps> = ({ 
    title, 
    children, 
    isActive, 
    isOverview, 
    index, 
    activeIndex,
    stackIndex = 0,
    stackSize = 1,
    onClose, 
    onFocus,
    onMinimize,
    isFullScreen,
    onToggleFullScreen
}) => {
  const [isDismissing, setIsDismissing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { theme } = useTheme();
  
  // Is this the card at the top of its stack?
  const isTopCard = stackIndex === stackSize - 1;

  // --- Animation Physics ---

  // Deck View Fanned Cards layout calculation
  const relativeIndex = index - activeIndex;
  
  const distance = Math.abs(relativeIndex);
  const sign = Math.sign(relativeIndex);
  
  let baseOffset = 0;
  if (distance === 1) baseOffset = 240;
  else if (distance === 2) baseOffset = 400;
  else if (distance > 2) baseOffset = 400 + (distance - 2) * 120;
  
  const overviewX = sign * baseOffset;
  
  // Vertical Stacking position (based on card index within stack)
  const depth = (stackSize - 1) - stackIndex;
  const stackYOffset = isOverview ? -40 * depth : 0;
  
  const totalYOffset = stackYOffset;

  // --- Visual State Calculations ---

  // Scale: Shrink in overview, further cards shrink more
  const baseOverviewScale = isActive ? 0.85 : Math.max(0.6, 0.75 - distance * 0.05);
  const targetScale = isOverview ? baseOverviewScale - (depth * 0.05) : 1;
  
  // Opacity
  const targetOpacity = isOverview ? (isTopCard ? 1 : 0) : (isActive && isTopCard ? 1 : 0);
  
  // Z-Index: Center is top
  const targetZIndex = isOverview 
    ? (100 - distance * 10 - depth) 
    : (isActive && isTopCard ? 100 : 0);
  
  // Brightness/Blur
  const targetBrightness = (isOverview && !isActive) ? (theme === 'dark' ? 0.5 : 0.8) : (isOverview && !isTopCard) ? 0.8 : 1;
  const targetBlur = (isOverview && !isActive) ? 'blur(4px)' : 'none';

  // --- Interaction Rules ---

  // Draggable only if it's the top card of a stack in overview mode.
  const isDraggable = isOverview && isTopCard;

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    // "Throw" up to close
    if (isDraggable && (info.velocity.y < -500 || info.offset.y < -200)) {
      handleClose();
    }
  };

  const handleTap = () => {
      // Tapping a card in overview mode should focus it and exit overview.
      if (isOverview) {
          onFocus();
      }
  };
  
  const handleClose = () => {
      if(isDismissing) return;
      setIsDismissing(true);
      setTimeout(onClose, 300); // Allow animation to play
  }

  return (
    <motion.div
      layout // This property is powerful for handling re-ordering animations smoothly.
      initial={false}
      animate={isDismissing ? { 
          y: -1000, 
          opacity: 0,
          scale: 0.5
      } : {
          scale: isDragging ? targetScale * 1.05 : targetScale,
          x: isOverview ? overviewX : 0,
          y: totalYOffset,
          opacity: targetOpacity,
          zIndex: targetZIndex,
          filter: `brightness(${targetBrightness}) ${targetBlur}`
      }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      drag={isDraggable}
      dragConstraints={{ top: -400, bottom: 50, left: 0, right: 0 }}
      dragElastic={{ top: 0.5, bottom: 0.1 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        cursor: isOverview ? 'pointer' : 'default'
      }}
      className={`
        origin-center will-change-transform flex flex-col
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${!isActive && !isOverview ? 'pointer-events-none' : ''} 
      `}
    >
        <div className={`
            w-full h-full flex flex-col overflow-hidden transition-all duration-300 relative
            ${theme === 'light' 
              ? 'bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] text-gray-900' 
              : 'dark bg-[#1e293b]/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)] text-white/90'
            }
            ${isOverview 
              ? `rounded-[32px] ring-1 ${theme === 'light' ? 'ring-black/5' : 'ring-white/10'}` 
              : isFullScreen ? 'rounded-none' : `rounded-none md:rounded-[24px] ring-1 ${theme === 'light' ? 'ring-black/5' : 'ring-white/10'}`}
        `}>
            {/* Header Bar */}
            <div className={`
                h-14 shrink-0 flex items-center justify-between px-6 backdrop-blur-md border-b relative z-20 select-none
                ${theme === 'light' ? 'bg-white/40 border-black/5' : 'bg-[#1e293b]/40 border-white/10'}
                ${isOverview ? 'pointer-events-none' : ''}
            `}>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-med-terracotta shadow-[0_0_8px_#D67252]"></div>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{title}</span>
                </div>
                
                {!isOverview && (
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                            className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'hover:bg-gray-200/60 text-gray-500 hover:text-gray-700' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'}`}
                            title="Minimize"
                        >
                            <Minus size={18} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleFullScreen(); }}
                            className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'hover:bg-gray-200/60 text-gray-500 hover:text-gray-700' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'}`}
                            title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleClose(); }}
                            className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'hover:bg-red-100 text-gray-500 hover:text-red-600' : 'hover:bg-red-900/20 text-gray-400 hover:text-red-500'}`}
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content Mask */}
            <div className={`flex-1 relative overflow-hidden ${isOverview ? 'pointer-events-none' : ''}`}>
                <div className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
                    {children}
                </div>
                {/* Click guard in overview mode */}
                {isOverview && <div className="absolute inset-0 z-50 bg-transparent" />}
            </div>

            {/* Label for Overview Mode (Only Top Card) */}
            {isOverview && isActive && isTopCard && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -bottom-16 left-0 right-0 text-center pointer-events-none"
                >
                    <span className={`text-sm font-bold uppercase tracking-widest drop-shadow-md ${theme === 'light' ? 'text-med-blue' : 'text-white'}`}>{title}</span>
                    {stackSize > 1 && <p className={`text-[10px] uppercase tracking-wider mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-white/60'}`}>{stackSize} Cards</p>}
                </motion.div>
            )}
        </div>
    </motion.div>
  );
};
