import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';

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
  
  // Is this the card at the top of its stack?
  const isTopCard = stackIndex === stackSize - 1;

  // --- Animation Physics ---

  // Horizontal position (based on stack index)
  const relativeIndex = index - activeIndex;
  const overviewX = relativeIndex * 280;
  
  // Vertical Stacking position (based on card index within stack)
  const depth = (stackSize - 1) - stackIndex;
  const stackYOffset = isOverview ? -40 * depth : 0;
  
  // "Push down" inactive stacks in overview mode
  const inactiveStackYOffset = (isOverview && !isActive) ? 40 : 0;
  const totalYOffset = stackYOffset + inactiveStackYOffset;

  // --- Visual State Calculations ---

  // Scale: Shrink in overview, slightly smaller if inactive or occluded
  const baseOverviewScale = isActive ? 0.7 : 0.6;
  const targetScale = isOverview ? baseOverviewScale - (depth * 0.05) : 1;
  
  // Opacity: Only top card of active stack is visible in focus mode.
  // In overview, we show the top card and slightly visible stacked cards.
  const targetOpacity = isOverview ? (isTopCard ? 1 : 0) : (isActive && isTopCard ? 1 : 0);
  
  // Z-Index: For proper layering in overview
  const targetZIndex = isOverview 
    ? ((100 - Math.abs(relativeIndex) * 10) + stackIndex) 
    : (isActive && isTopCard ? 100 : 0);
  
  // Brightness/Blur: De-emphasize inactive/occluded cards
  const targetBrightness = (isOverview && !isActive) ? 0.6 : (isOverview && !isTopCard) ? 0.8 : 1;
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
            w-full h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900 
            shadow-2xl transition-all duration-300 relative
            ${isOverview ? 'rounded-[2.5rem] ring-2 ring-white/10' : isFullScreen ? 'rounded-none' : 'rounded-none md:rounded-[2rem]'}
        `}>
            {/* Header Bar */}
            <div className={`
                h-14 shrink-0 flex items-center justify-between px-6 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 relative z-20 select-none
                ${isOverview ? 'pointer-events-none' : ''}
            `}>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-med-terracotta shadow-[0_0_8px_#D67252]"></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{title}</span>
                </div>
                
                {!isOverview && (
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-500 rounded-full transition-colors"
                            title="Minimize"
                        >
                            <Minus size={18} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleFullScreen(); }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-500 rounded-full transition-colors"
                            title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleClose(); }}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content Mask */}
            <div className={`flex-1 relative overflow-hidden bg-med-sand dark:bg-gray-950 ${isOverview ? 'pointer-events-none' : ''}`}>
                <div className="w-full h-full overflow-y-auto scrollbar-hide">
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
                    <span className="text-white text-sm font-bold uppercase tracking-widest shadow-black drop-shadow-md">{title}</span>
                    {stackSize > 1 && <p className="text-white/60 text-[10px] uppercase tracking-wider mt-1">{stackSize} Cards</p>}
                </motion.div>
            )}
        </div>
    </motion.div>
  );
};
