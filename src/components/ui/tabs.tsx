import React, { createContext, useContext } from 'react';

type TabsContextType = {
  value: string;
  onValueChange?: (v: string) => void;
};

const TabsCtx = createContext<TabsContextType | null>(null);

type DivProps = React.HTMLAttributes<HTMLDivElement>;

type TabsProps = DivProps & {
  value: string;
  onValueChange?: (v: string) => void;
};

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, ...props }) => (
  <TabsCtx.Provider value={{ value, onValueChange }}>
    <div {...props}>{children}</div>
  </TabsCtx.Provider>
);

export const TabsList: React.FC<DivProps> = ({ className, ...props }) => (
  <div className={['inline-flex items-center justify-center rounded-md bg-indigo-50 p-1 text-indigo-700', className].filter(Boolean).join(' ')} {...props} />
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string };

export const TabsTrigger: React.FC<ButtonProps> = ({ className, value, ...props }) => {
  const ctx = useContext(TabsCtx);
  const active = ctx?.value === value;
  const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const styles = active ? 'bg-white text-indigo-700 shadow-sm border border-indigo-200' : 'text-indigo-700/70 hover:text-indigo-800';
  return (
    <button
      className={[base, styles, className].filter(Boolean).join(' ')}
      onClick={(e) => {
        props.onClick?.(e);
        ctx?.onValueChange?.(value);
      }}
      {...props}
    />
  );
};

type TabsContentProps = DivProps & { value: string };

export const TabsContent: React.FC<TabsContentProps> = ({ value, className, ...props }) => {
  const ctx = useContext(TabsCtx);
  if (ctx?.value !== value) return null;
  return <div className={className} {...props} />;
};
