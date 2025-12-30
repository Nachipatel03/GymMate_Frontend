import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ 
  children, 
  className = '', 
  delay = 0,
  hover = true 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        relative overflow-hidden rounded-2xl 
        bg-slate-900/50 backdrop-blur-xl 
        border border-slate-700/50 
        ${hover ? 'hover:border-slate-600/50 hover:bg-slate-900/60' : ''} 
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}