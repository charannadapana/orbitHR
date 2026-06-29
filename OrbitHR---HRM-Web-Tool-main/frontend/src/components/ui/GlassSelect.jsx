import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

/**
 * GlassSelect — custom dark-themed dropdown that matches the glassmorphic design system.
 * Props:
 *   label       — string, optional label above the select
 *   value       — current value
 *   onChange    — (value) => void
 *   options     — [{ value, label }]
 *   placeholder — shown when no value selected
 *   error       — string, validation error
 *   required    — boolean
 *   className   — wrapper class override
 */
const GlassSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  error = '',
  required = false,
  className = '',
  dropdownPosition = 'bottom',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`flex flex-col ${className}`} ref={ref}>
      {label && (
        <label className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`
            w-full flex items-center justify-between
            px-4 py-3 rounded-xl text-sm text-left
            bg-slate-50 dark:bg-white/5 border transition-all shadow-sm dark:shadow-none
            ${open ? 'border-purple-500/40 bg-white dark:bg-white/[0.07]' : error ? 'border-red-500/50' : 'border-slate-200 dark:border-white/8'}
            ${!selected ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white font-medium'}
            focus:outline-none
          `}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
          </motion.div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: dropdownPosition === 'top' ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: dropdownPosition === 'top' ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-50 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white/98 dark:bg-[#050507]/98 backdrop-blur-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/80 overflow-hidden py-1 max-h-60 overflow-y-auto ${dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
            >
              {options.map(opt => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-all
                      ${isSelected
                        ? 'bg-purple-600/10 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.07] hover:text-slate-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <span className="mt-1.5 text-[11px] font-bold text-red-400">{error}</span>}
    </div>
  );
};

export default GlassSelect;
