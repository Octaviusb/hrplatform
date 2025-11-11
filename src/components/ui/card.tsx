import React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const Card: React.FC<DivProps> = ({ className, ...props }) => (
  <div className={cx('rounded-lg border bg-white shadow-sm', className)} {...props} />
);

export const CardHeader: React.FC<DivProps> = ({ className, ...props }) => (
  <div className={cx('p-4 border-b', className)} {...props} />
);

export const CardTitle: React.FC<DivProps> = ({ className, ...props }) => (
  <h3 className={cx('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
);

export const CardContent: React.FC<DivProps> = ({ className, ...props }) => (
  <div className={cx('p-4', className)} {...props} />
);
