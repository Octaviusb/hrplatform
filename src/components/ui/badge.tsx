import React from 'react';

type SpanProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline' | 'secondary';
};

export const Badge: React.FC<SpanProps> = ({ className, variant = 'default', ...props }) => {
  const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold';
  const styles =
    variant === 'outline' ? 'bg-white border-gray-300 text-gray-800' : variant === 'secondary' ? 'bg-gray-100 border-transparent text-gray-700' : 'bg-black border-transparent text-white';
  return <span className={[base, styles, className].filter(Boolean).join(' ')} {...props} />;
};
