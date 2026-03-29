import { Grid3x3, FolderOpen, Image, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'carousels', icon: Grid3x3, label: 'My Carousels' },
  { id: 'templates', icon: FolderOpen, label: 'Templates' },
  { id: 'assets', icon: Image, label: 'Assets' },
];

function NavButton({
  id,
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative group w-full flex justify-center">
      {/* Active indicator with Framer Motion */}
      {isActive && (
        <motion.div 
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-purple-400 rounded-r-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          transition-colors duration-200 relative
          ${isActive
            ? 'bg-purple-500/20 text-purple-300 shadow-inner shadow-purple-500/10'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
          }
        `}
      >
        <Icon className="w-[22px] h-[22px]" />
      </motion.button>

      {/* Tooltip */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-zinc-800/90 backdrop-blur-md border border-white/10 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 z-50 shadow-2xl translate-x-2 group-hover:translate-x-0">
        {label}
      </div>
    </div>
  );
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-[72px] h-screen bg-surface-panel backdrop-blur-3xl border-r border-white/5 flex flex-col items-center py-6 gap-0 z-20 relative isolate">
      {/* Logo */}
      <motion.div 
        whileHover={{ rotate: 15, scale: 1.1 }}
        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-600 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/30 flex-shrink-0 cursor-pointer"
      >
        <span className="text-white font-bold text-lg tracking-tighter">C</span>
      </motion.div>

      {/* Main Navigation */}
      <nav aria-label="Main navigation" className="flex flex-col gap-3 flex-1 w-full px-2">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </nav>

      {/* Bottom — Settings */}
      <div className="w-full px-2 pt-4 border-t border-white/5">
        <NavButton
          id="settings"
          icon={Settings}
          label="Settings"
          isActive={activeTab === 'settings'}
          onClick={() => onTabChange('settings')}
        />
      </div>
    </div>
  );
}
