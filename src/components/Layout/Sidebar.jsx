import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  CreditCard,
  Dumbbell,
  Apple,
  ClipboardList,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Settings as SettingsIcon,
  Activity,
} from 'lucide-react';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'AdminDashboard' },
  { icon: Users, label: 'Members', page: 'ManageMembers' },
  { icon: UserCog, label: 'Trainers', page: 'ManageTrainers' },
  { icon: CreditCard, label: 'Plans', page: 'MembershipPlans' },
  { icon: ClipboardList, label: 'Attendance', page: 'AttendanceOverview' },
  { icon: TrendingUp, label: 'Payments', page: 'PaymentsRevenue' },
  { icon: SettingsIcon, label: 'Settings', page: 'Settings' },
];

const trainerMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'TrainerDashboard' },
  { icon: Users, label: 'My Members', page: 'AssignedMembers' },
  { icon: Dumbbell, label: 'Workout Plans', page: 'WorkoutPlans' },
  { icon: Apple, label: 'Diet Plans', page: 'DietPlans' },
  { icon: ClipboardList, label: 'Attendance', page: 'TrainerAttendance' },
];

const memberMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'MemberDashboard' },
  { icon: CreditCard, label: 'Plans', page: 'MemberPlans' },
  { icon: Dumbbell, label: 'My Workout', page: 'MyWorkout' },
  { icon: Apple, label: 'My Diet', page: 'MyDiet' },
  { icon: Calendar, label: 'Attendance', page: 'MyAttendance' },
  { icon: TrendingUp, label: 'Progress', page: 'MyProgress' },
  { icon: Activity, label: 'BMI Checker', page: 'BMIChecker' },
];

export default function Sidebar({
  role = 'admin',
  isOpen,
  onToggle,
  currentPage,
  isMobile = false
}) {
  const menuItems = role === 'admin'
    ? adminMenuItems
    : role === 'trainer'
      ? trainerMenuItems
      : memberMenuItems;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"
            >
              GymMate
            </motion.span>
          )}
        </motion.div>
        {isMobile && (
          <button onClick={onToggle} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-white border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }
              `}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-violet-400' : ''}`} />
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button - Desktop Only */}
      {!isMobile && (
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ?180 : 72 }}
      className="hidden lg:flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 h-screen sticky top-0"
    >
      {sidebarContent}
    </motion.aside>
  );
}