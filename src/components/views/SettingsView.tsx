import React from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, CreditCard, Shield, FileText, Moon, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const setShowPricing = (show: boolean) => {};
  const setShowPrivacy = (show: boolean) => {};
  const setShowTerms = (show: boolean) => {};
  return (
    <motion.div 
      key="settings"
      variants={theme.motion.variants.container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="space-y-8 sm:space-y-12 pb-32"
    >
      <motion.div variants={theme.motion.variants.item}>
        <h2 className={`text-2xl md:text-5xl font-black tracking-tighter text-text_primary`}>System <span className="text-primary">Configuration</span></h2>
        <p className="text-text_secondary text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-2">
          {theme.id === 'elite' ? 'Neural Interface & Protocol Settings' : 'Customize your experience.'}
        </p>
      </motion.div>

      {/* User Profile Section */}
      <motion.div 
        variants={theme.motion.variants.item}
        whileHover={theme.motion.hover}
        className="stitch-card p-6 md:p-10 border-border relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-text_secondary">
          <Settings size={120} />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10 relative z-10">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 1 }}
            className="size-20 md:size-28 rounded-[32px] md:rounded-[40px] bg-primary/10 flex items-center justify-center text-primary border-4 border-surface shadow-2xl"
          >
            <span className="text-3xl md:text-5xl font-black">{user?.email?.[0].toUpperCase()}</span>
          </motion.div>
          <div className="text-center sm:text-left space-y-2">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-text_primary">{user?.email}</h3>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                {user?.plan === 'premium' ? 'Elite Protocol' : 'Standard Protocol'}
              </div>
              <div className="text-[10px] font-medium text-text_secondary">{user?.plan === 'premium' ? 'Elite Access Active' : 'Standard Protocol'}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theme Selection */}
      <motion.div variants={theme.motion.variants.container} className="space-y-6">
        <motion.div variants={theme.motion.variants.item} className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={16} />
          </div>
          <h3 className="text-lg font-black tracking-tight text-text_primary">UI Personality</h3>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'elite', name: 'Elite AI', desc: 'High-performance tactical interface' },
            { id: 'simple', name: 'Simple', desc: 'Clean, friendly, and approachable' },
            { id: 'minimal', name: 'Minimal', desc: 'Zero distractions, pure focus' },
            { id: 'gamified', name: 'Gamified', desc: 'Playful and rewarding experience' }
          ].map(t => (
            <motion.button 
              key={t.id}
              variants={theme.motion.variants.item}
              whileHover={theme.motion.hover}
              whileTap={theme.motion.tap}
              onClick={() => setTheme(t.id as any)}
              className={`stitch-card p-6 text-left transition-all group ${theme.id === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/30'}`}
            >
              <div className={`text-xs font-black uppercase tracking-widest mb-1 ${theme.id === t.id ? 'text-primary' : 'text-text_secondary'}`}>{t.name}</div>
              <div className="text-xs font-medium text-text_secondary group-hover:text-text_primary transition-colors">{t.desc}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* System Actions */}
      <motion.div variants={theme.motion.variants.container} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: CreditCard, label: 'Subscription', color: 'secondary', onClick: () => setShowPricing(true) },
          { icon: Shield, label: 'Privacy Protocol', color: 'accent', onClick: () => setShowPrivacy(true) },
          { icon: FileText, label: 'Terms of Service', color: 'text_secondary', onClick: () => setShowTerms(true) },
          { icon: LogOut, label: 'De-Authorize System', color: 'danger', onClick: logout, isDanger: true }
        ].map((action, idx) => (
          <motion.button 
            key={idx}
            variants={theme.motion.variants.item}
            whileHover={theme.motion.hover}
            whileTap={theme.motion.tap}
            onClick={action.onClick}
            className={`stitch-card p-6 flex items-center justify-between hover:bg-surface transition-all group ${action.isDanger ? 'border-danger/10' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`size-10 rounded-xl bg-${action.color}/10 flex items-center justify-center text-${action.color} group-hover:bg-${action.color} group-hover:text-black transition-all`}>
                <action.icon size={20} />
              </div>
              <span className={`font-black uppercase tracking-widest text-xs ${action.isDanger ? 'text-danger' : 'text-text_primary'}`}>{action.label}</span>
            </div>
            {!action.isDanger && <Settings size={16} className="text-text_secondary" />}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};
