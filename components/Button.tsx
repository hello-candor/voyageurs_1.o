
import React from 'react';

type ButtonVariant = 'primary' | 'action' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  
  const baseStyles = "font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // Primary: Saffron - stays dark enough for white text usually.
    primary: "bg-[#E2923D] text-white hover:bg-[#d17e2b] shadow-lg hover:shadow-xl shadow-[#E2923D]/20 border border-transparent",
    
    // Action: Terracotta. 
    action: "bg-med-terracotta text-white hover:bg-[#c56143] shadow-lg hover:shadow-xl shadow-med-terracotta/20 border border-transparent",
    
    // Secondary: High contrast in dark mode (Slate 800 bg with white text).
    secondary: "bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-gray-200 dark:border-slate-600 hover:border-med-blue dark:hover:border-slate-400 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-700",
    
    // Outline: Visible border in both modes.
    outline: "bg-transparent border-2 border-med-terracotta text-med-terracotta hover:bg-med-terracotta hover:text-white",
    
    // Ghost: Ensure text is visible in dark mode (white/gray-300) instead of med-blue (which might be too dim or shift color unexpectedly).
    ghost: "bg-transparent text-gray-500 dark:text-gray-300 hover:text-med-blue dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10",
    
    destructive: "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white border border-transparent hover:border-red-500",
    
    success: "bg-med-olive text-white shadow-lg cursor-default border border-transparent" 
  };

  const sizes = {
    sm: "py-2 px-4 text-[9px] rounded-xl",
    md: "py-3 px-6 text-[10px] rounded-2xl",
    lg: "py-4 px-8 text-xs rounded-2xl",
    icon: "p-0 w-11 h-11 rounded-full text-lg" 
  };

  const widthClass = fullWidth && size !== 'icon' ? "w-full" : "w-auto";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {isLoading && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />}
        {isLoading ? loadingText : children}
      </span>
    </button>
  );
};
