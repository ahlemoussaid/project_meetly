import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = forwardRef(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#00E0FF] to-[#7B61FF] text-white hover:opacity-90 shadow-[0_0_15px_rgba(0,224,255,0.3)] hover:shadow-[0_0_25px_rgba(123,97,255,0.5)] border-0',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md',
    outline: 'bg-transparent border-2 border-[#00E0FF] text-[#00E0FF] hover:bg-[#00E0FF]/10 shadow-[0_0_10px_rgba(0,224,255,0.2)]',
    ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
    icon: 'p-2',
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
