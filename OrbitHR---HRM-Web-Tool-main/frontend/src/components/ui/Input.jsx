const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={name} className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        {...props}
        className={`
          px-4 py-3
          bg-slate-50 dark:bg-white/5
          border border-slate-200 dark:border-white/8
          rounded-xl
          text-sm text-slate-900 dark:text-white
          placeholder:text-slate-400 dark:placeholder:text-slate-600
          focus:outline-none
          focus:ring-2 focus:ring-purple-500/20
          focus:border-purple-500/40
          focus:bg-white dark:focus:bg-white/[0.07]
          disabled:opacity-40
          disabled:cursor-not-allowed
          transition-all shadow-sm dark:shadow-none
          ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10' : ''}
        `}
      />
      {error && <span className="mt-1.5 text-[11px] font-bold text-red-400">{error}</span>}
    </div>
  );
};

export default Input;
