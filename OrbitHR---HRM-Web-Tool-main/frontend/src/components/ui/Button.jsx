const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  type = 'button',
  className = '',
  onClick,
  disabled = false
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm';
  
  const variants = {
    primary: 'bg-purple-600/10 dark:bg-purple-600/20 hover:bg-purple-600/20 dark:hover:bg-purple-600/40 active:bg-purple-600/60 text-purple-700 dark:text-purple-200 hover:text-purple-900 dark:hover:text-white border border-purple-500/40 hover:border-purple-400 focus:ring-purple-500/50 shadow-sm dark:shadow-[0_0_12px_rgba(124,58,237,0.2)] hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] font-black uppercase tracking-widest text-[10px]',
    secondary: 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 active:bg-slate-300 dark:active:bg-white/15 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:ring-purple-500/20',
    outline: 'border border-purple-500/20 dark:border-purple-500/30 hover:border-purple-500/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-purple-500/5 dark:hover:bg-purple-500/10 active:bg-purple-500/20 focus:ring-purple-500/50 font-black uppercase tracking-widest text-[10px]',
    danger: 'bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 active:bg-red-500/40 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 border border-red-500/30 dark:border-red-500/40 hover:border-red-400/70 focus:ring-red-500/50 shadow-sm'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
