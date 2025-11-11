import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
};

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'default', ...props }) => {
  const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2';
  const styles = variant === 'outline'
    ? 'border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 focus-visible:ring-indigo-500'
    : 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500';
  return <button className={cx(base, styles, className)} {...props} />;
};
