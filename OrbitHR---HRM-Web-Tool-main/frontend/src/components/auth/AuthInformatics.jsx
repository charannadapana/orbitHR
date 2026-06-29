import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, BarChart3, Globe } from 'lucide-react';
import HeroSpotlight from '../ui/HeroSpotlight';

const AuthInformatics = ({ role = 'employee' }) => {
  const employeeBenefits = [
    { icon: Shield, text: 'Enterprise-grade security' },
    { icon: Zap, text: 'Real-time performance metrics' },
    { icon: BarChart3, text: 'Automated skill mapping' },
    { icon: Globe, text: 'Global workforce mobility' },
  ];

  const managerBenefits = [
    { icon: BarChart3, text: 'Team performance analytics' },
    { icon: Zap, text: 'Resource allocation hub' },
    { icon: Globe, text: 'Strategic workforce planning' },
    { icon: Shield, text: 'Automated approval engine' },
  ];

  const benefits = role === 'manager' ? managerBenefits : employeeBenefits;

  return (
    <div className="relative h-full w-full flex flex-col justify-center p-12 lg:p-24 overflow-hidden bg-slate-50 dark:bg-[#050507] transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full animate-pulse transition-colors duration-700 ${role === 'manager' ? 'bg-indigo-600/10' : 'bg-purple-600/10'}`} />
      <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] blur-[120px] rounded-full animate-pulse transition-colors duration-700 ${role === 'manager' ? 'bg-purple-600/10' : 'bg-indigo-600/10'}`} style={{ animationDelay: '2s' }} />
      
      <HeroSpotlight>
        <motion.div
          key={role}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <img src="/orbithr.png" alt="OrbitHR Logo" className="w-[66px] h-[66px] mb-5 drop-shadow-[0_0_15px_rgba(124,58,237,0.3)] dark:invert" />
          
          <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-8 uppercase">
            {role === 'manager' ? 'COMMAND' : 'INTELLIGENCE'} <br />
            <span className={`bg-gradient-to-r ${role === 'manager' ? 'from-indigo-400 via-indigo-600 to-violet-500' : 'from-purple-400 via-purple-600 to-indigo-500'} bg-clip-text text-transparent italic`}>
              AT SCALE
            </span>
          </h2>
          
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-md leading-relaxed">
            {role === 'manager' ? 'Orchestrate your team operations with glassmorphic beauty and data-driven precision.' : 'Navigate your career growth with glassmorphic beauty and data-driven precision.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (idx * 0.1) }}
                className="flex items-center gap-3 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all ${role === 'manager' ? 'group-hover:border-indigo-500/50' : 'group-hover:border-purple-500/50'}`}>
                  <benefit.icon className={`w-5 h-5 ${role === 'manager' ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'}`} />
                </div>
                <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em] group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </HeroSpotlight>

      {/* Decorative Mesh */}
      <div className="absolute inset-0 z-0 opacity-[0.04] dark:opacity-20 bg-[radial-gradient(circle_at_2px_2px,rgba(0,0,0,1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.3)_1px,transparent_0)]" 
           style={{ backgroundSize: '40px 40px' }} 
      />
    </div>
  );
};

export default AuthInformatics;
