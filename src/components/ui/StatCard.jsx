import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  gradient = 'from-violet-500 to-purple-600',
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6 group hover:border-slate-600/50 transition-all duration-300"
    >
      {/* Gradient Glow Effect */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${gradient} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-500`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-purple-500/20`}>
            {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-slate-400 text-xs sm:text-sm font-medium">{title}</p>
      </div>
    </motion.div>
  );
}