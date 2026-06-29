import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const PublicNavbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="pointer-events-auto fixed top-4 left-4 sm:top-6 sm:left-6 animate-float-in-left">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 transition-all hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/5 group bg-white/60 dark:bg-black/20 backdrop-blur-md shadow-sm dark:shadow-none"
        >
          <img
            src="/orbithr.png"
            alt="OrbitHR logo"
            className="h-[34px] w-[34px] rounded-lg object-contain border border-white/20 group-hover:scale-110 transition-transform dark:invert"
          />
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-[-0.05em] uppercase">
            OrbitHR
          </span>
        </Link>

      </div>

      <div className="pointer-events-auto fixed top-4 right-4 sm:top-6 sm:right-6 flex flex-wrap items-center justify-end gap-2 sm:gap-4 animate-float-in-right max-w-[calc(100vw-2rem)] sm:max-w-none">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/60 dark:bg-black/20 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm dark:shadow-none"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link to="/login">
          <Button variant="outline" size="sm">
            Login
          </Button>
        </Link>
        <Link to="/login">
          <Button size="sm">
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;
