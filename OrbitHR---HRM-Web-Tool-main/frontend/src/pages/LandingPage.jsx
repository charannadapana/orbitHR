import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PublicNavbar from '../components/layout/PublicNavbar';
import BorderGlow from '../components/ui/BorderGlow';
import HeroSpotlight from '../components/ui/HeroSpotlight';
import { motion } from 'framer-motion';
import { Users, Clock, Activity, BookOpen, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      title: 'Workforce Records',
      description: 'Comprehensive employee lifecycle management with interactive profiles.',
      Icon: Users,
      glow: '200 85 65',
      color: '#7c3aed'
    },
    {
      title: 'Time Intelligence',
      description: 'Precision attendance tracking with automated anomaly detection.',
      Icon: Clock,
      glow: '160 75 60',
      color: '#10b981'
    },
    {
      title: 'Dynamic Leaves',
      description: 'Streamlined approval engines with real-time balance calculations.',
      Icon: Activity,
      glow: '38 90 65',
      color: '#f59e0b'
    },
    {
      title: 'Skill Architecture',
      description: 'Map and visualize talent proficiency across your entire organization.',
      Icon: BookOpen,
      glow: '260 70 75',
      color: '#a855f7'
    }

  ];

  return (
    <AppLayout showPrism={true}>
      <PublicNavbar />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
            <HeroSpotlight>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                Orchestrate your talent operations with precision
              </div>
              
              <h1 className="text-7xl md:text-[7rem] font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-[0.85]">
                MASTER YOUR <br />
                <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  WORKFORCE
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                OrbitHR orchestrates your HR operations with glassmorphic intelligence and data-driven precision.
              </p>

               <div className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-12 max-w-4xl mx-auto border-t border-slate-200 dark:border-white/5 pt-16 mb-12">
                <div>
                  <p className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-none tracking-tighter uppercase italic">MODERN UX</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Crystal-clear glassmorphism</p>
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-none tracking-tighter uppercase italic">SMART HRM</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intelligent role-based logic</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-none tracking-tighter uppercase italic">UNIFIED HUB</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Centralized talent operations</p>
                </div>
              </div>
            </HeroSpotlight>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/login">
                <button className="px-10 py-5 rounded-2xl bg-purple-600 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-purple-500 hover:scale-105 transition-all shadow-[0_0_40px_rgba(124,58,237,0.3)] flex items-center gap-2 group border border-purple-400/20">
                  Enter Portal
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <a href="#features" className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white font-bold text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all backdrop-blur-xl flex items-center justify-center">
                Documentation
              </a>
            </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="max-w-2xl">
                <p className="text-purple-600 dark:text-purple-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Core Ecosystem</p>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  Everything you need to <br /> Scale with confidence
                </h2>
              </div>
              <div className="text-slate-500 text-sm font-medium max-w-xs">
                Modular HR intelligence designed for hyper-growth environments.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <BorderGlow
                    glowColor={feature.glow}
                    colors={[feature.color, feature.color]}
                    borderRadius={28}
                    glowIntensity={0.6}
                    animated
                  >
                    <div className="p-8 h-full">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 shadow-inner">
                        <feature.Icon className="w-6 h-6" style={{ color: feature.color }} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </BorderGlow>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <BorderGlow glowColor="260 70 75" colors={['#a78bfa', '#818cf8']} borderRadius={28} animated>
              <div className="p-12 md:p-20 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -z-10" />
                
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">
                  Ready to evolve your <br /> HR Experience?
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
                  Join the elite teams already orchestrating their growth with OrbitHR.
                </p>
                <Link to="/login">
                  <button className="px-12 py-6 rounded-2xl bg-purple-600 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-purple-500 hover:scale-105 transition-all shadow-2xl shadow-purple-500/20 border border-purple-400/20">
                    Get Started Free
                  </button>
                </Link>
              </div>
            </BorderGlow>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <img src="/orbithr.png" alt="OrbitHR" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(124,58,237,0.2)] dark:invert" />
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">HIRONIX</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest pt-1">© 2026 NEXUS SYSTEMS</span>
            </div>
          </div>
        </footer>
      </main>
    </AppLayout>
  );
};

export default LandingPage;
