const Badge = ({ 
  children, 
  variant = 'default',
  color,
  size = 'md',
  className = '' 
}) => {
  const colorToVariant = {
    gray: 'default',
    cyan: 'primary',
    green: 'success',
    yellow: 'warning',
    red: 'danger',
    info: 'info',
    purple: 'primary',
  };

  const effectiveVariant = color ? (colorToVariant[color] || 'default') : variant;

  const variants = {
    default: 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 shadow-sm',
    primary: 'bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 font-bold uppercase tracking-widest text-[9px]',
    success: 'bg-emerald-100 dark:bg-green-600/20 text-emerald-700 dark:text-green-400 border border-emerald-200 dark:border-green-500/30',
    warning: 'bg-amber-100 dark:bg-yellow-600/20 text-amber-700 dark:text-yellow-400 border border-amber-200 dark:border-yellow-500/30',
    danger: 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30',
    info: 'bg-sky-100 dark:bg-blue-600/20 text-sky-700 dark:text-blue-400 border border-sky-200 dark:border-blue-500/30'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  return (
    <span 
      className={`
        inline-flex 
        items-center 
        rounded-full 
        font-medium
        ${variants[effectiveVariant]} 
        ${sizes[size]} 
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
