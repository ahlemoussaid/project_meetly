import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Card = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'glass-card rounded-2xl p-6 relative overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Subtle top highlight to enhance glass effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export { Card };
