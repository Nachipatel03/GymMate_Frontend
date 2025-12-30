import React from 'react';

const statusStyles = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  expired: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  present: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  absent: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  failed: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  paused: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  basic: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  premium: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  vip: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function StatusBadge({ status, className = '' }) {
  const style = statusStyles[status?.toLowerCase()] || statusStyles.inactive;
  
  return (
    <span className={`
      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
      border backdrop-blur-sm ${style} ${className}
    `}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ')}
    </span>
  );
}