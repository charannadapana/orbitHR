import { Children, forwardRef, isValidElement, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Command, Search } from 'lucide-react';
import { fadeUp } from '../../lib/motion';

export const cn = (...parts) => parts.filter(Boolean).join(' ');

const overlayBaseClassName = 'glass-panel-strong max-h-72 overflow-y-auto rounded-[24px] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45)]';

const overlayMotionProps = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

function useFloatingPanel(triggerRef, open) {
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return undefined;
    }

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 10,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, triggerRef]);

  return position;
}

export const AppSurface = ({ children, className = '' }) => (
  <div className={cn('glass-panel rounded-[28px] border border-white/8', className)}>{children}</div>
);

export const ElevatedSurface = ({ children, className = '' }) => (
  <div className={cn('glass-panel-strong rounded-[32px]', className)}>{children}</div>
);

export const PageSection = ({ eyebrow, title, description, action, className = '' }) => (
  <motion.section {...fadeUp} className={cn('space-y-6', className)}>
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.34em] text-[var(--accent-2)]">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-strong)] sm:text-3xl">{title}</h2>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-body)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  </motion.section>
);

export const StatCard = ({ label, value, hint, icon: Icon, accent = 'var(--accent)', trend, className = '' }) => (
  <motion.div whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.99 }} className={cn('glass-panel card-hover rounded-[28px] p-5 sm:p-6', className)}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">{label}</p>
        <p className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--text-strong)] sm:text-4xl">{value}</p>
        {hint ? <p className="mt-2 text-sm text-[var(--text-body)]">{hint}</p> : null}
      </div>
      {Icon ? (
        <div className="soft-ring flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10" style={{ background: `${accent}14` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
      ) : null}
    </div>
    {trend ? <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>{trend}</p> : null}
  </motion.div>
);

export const Pill = ({ children, tone = 'neutral', className = '' }) => {
  const tones = {
    neutral: 'bg-white/6 text-[var(--text-body)] border-white/10',
    green: 'bg-emerald-400/12 text-emerald-300 border-emerald-300/20',
    blue: 'bg-sky-400/12 text-sky-300 border-sky-300/20',
    amber: 'bg-amber-400/12 text-amber-300 border-amber-300/20',
    red: 'bg-rose-400/12 text-rose-300 border-rose-300/20',
    dark: 'bg-black/20 text-[var(--text-strong)] border-white/10',
  };

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em]', tones[tone], className)}>
      {children}
    </span>
  );
};

export const ActionButton = ({ children, tone = 'primary', className = '', ...props }) => {
  const tones = {
    primary: 'bg-[linear-gradient(135deg,#4dd8ff,#32ff9d)] text-slate-950 shadow-[0_18px_40px_rgba(50,255,157,0.2)]',
    secondary: 'glass-panel text-[var(--text-strong)]',
    ghost: 'bg-transparent text-[var(--text-body)] border border-white/10',
    danger: 'bg-[linear-gradient(135deg,#ff8a8a,#ff5370)] text-white shadow-[0_18px_40px_rgba(255,83,112,0.22)]',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={cn('inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all', tones[tone], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Segmented = ({ value, onChange, options, className = '' }) => (
  <div className={cn('glass-panel inline-flex rounded-[22px] p-1', className)}>
    {options.map((option) => (
      <motion.button
        key={option.value}
        whileTap={{ scale: 0.98 }}
        onClick={() => onChange(option.value)}
        className={cn(
          'rounded-[18px] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] transition-all',
          value === option.value ? 'bg-white text-slate-950 shadow-lg' : 'text-[var(--text-body)]',
        )}
      >
        {option.label}
      </motion.button>
    ))}
  </div>
);

const SelectField = forwardRef(function SelectField(
  {
    id,
    label,
    icon: Icon,
    className = '',
    wrapperClassName = '',
    children,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    name,
  },
  ref,
) {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const panelPosition = useFloatingPanel(buttonRef, open);

  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter((child) => isValidElement(child) && child.type === 'option')
        .map((child) => ({
          value: child.props.value ?? '',
          label: typeof child.props.children === 'string' ? child.props.children : child.props.children,
          disabled: Boolean(child.props.disabled),
        })),
    [children],
  );

  const selectedOption = options.find((option) => String(option.value) === String(value));
  const displayLabel = selectedOption?.label || placeholder || options.find((option) => option.value === '')?.label || 'Select an option';

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  useEffect(() => {
    const currentIndex = options.findIndex((option) => String(option.value) === String(value));
    setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [options, value]);

  const commitSelection = (nextValue) => {
    onChange?.({ target: { value: nextValue, name } });
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <label htmlFor={id} className={cn('block', wrapperClassName)}>
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--text-muted)]">{label}</span>
      <div ref={containerRef} className="relative">
        <input
          ref={ref}
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          required={required}
          value={value ?? ''}
          readOnly
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
        <button
          id={id}
          ref={buttonRef}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (!options.length) {
              return;
            }

            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setOpen(true);
              setHighlightedIndex((current) => (current + 1) % options.length);
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setOpen(true);
              setHighlightedIndex((current) => (current - 1 + options.length) % options.length);
            }

            if ((event.key === 'Enter' || event.key === ' ') && open) {
              event.preventDefault();
              const option = options[highlightedIndex];
              if (option && !option.disabled) {
                commitSelection(option.value);
              }
            }

            if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
          className="input-shell relative flex w-full items-center gap-3 rounded-[24px] px-4 py-3 text-left transition-all focus-visible:border-[var(--accent-2)] focus-visible:shadow-[0_0_0_1px_rgba(77,216,255,0.24)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" /> : null}
          <span className={cn('min-h-[24px] flex-1 truncate text-sm', selectedOption ? 'text-[var(--text-strong)]' : 'text-[var(--text-muted)]', className)}>
            {displayLabel}
          </span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform', open ? 'rotate-180' : '')} />
        </button>

        {open && panelPosition
          ? createPortal(
              <motion.div
                {...overlayMotionProps}
                className={cn(overlayBaseClassName, 'fixed z-[200]')}
                style={{
                  top: panelPosition.top,
                  left: panelPosition.left,
                  width: panelPosition.width,
                }}
              >
                <div role="listbox" aria-labelledby={id} className="space-y-1">
                  {options.map((option, index) => {
                    const active = index === highlightedIndex;
                    const selected = String(option.value) === String(value);

                    return (
                      <button
                        key={`${option.value}-${index}`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={option.disabled}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => !option.disabled && commitSelection(option.value)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-[18px] px-3 py-2.5 text-left text-sm transition',
                          option.disabled ? 'cursor-not-allowed opacity-45' : '',
                          active ? 'bg-[linear-gradient(135deg,rgba(77,216,255,0.16),rgba(50,255,157,0.12))] text-[var(--text-strong)]' : 'text-[var(--text-body)] hover:bg-white/8',
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {selected ? <Check className="h-4 w-4 text-[var(--accent)]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </motion.div>,
              document.body,
            )
          : null}
      </div>
    </label>
  );
});

export const FloatingField = forwardRef(function FloatingField(
  {
    label,
    icon: Icon,
    as = 'input',
    className = '',
    wrapperClassName = '',
    children,
    ...props
  },
  ref,
) {
  const Component = as;
  const id = useId();
  const isSelect = Component === 'select';

  if (isSelect) {
    return (
      <SelectField
        id={id}
        ref={ref}
        label={label}
        icon={Icon}
        className={className}
        wrapperClassName={wrapperClassName}
        children={children}
        {...props}
      />
    );
  }

  return (
    <label htmlFor={id} className={cn('block', wrapperClassName)}>
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--text-muted)]">{label}</span>
      <div className="input-shell relative flex items-center gap-3 rounded-[24px] px-4 py-3 transition-all focus-within:border-[var(--accent-2)] focus-within:shadow-[0_0_0_1px_rgba(77,216,255,0.24)]">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" /> : null}
        <Component
          id={id}
          ref={ref}
          className={cn(
            'min-h-[24px] w-full border-0 bg-transparent text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--text-muted)]',
            className,
          )}
          {...props}
        >
          {children}
        </Component>
      </div>
    </label>
  );
});

export const AutocompleteField = ({
  label,
  icon: Icon,
  value,
  onInputChange,
  onSelect,
  options = [],
  placeholder = '',
  emptyMessage = 'No matches found.',
  className = '',
  wrapperClassName = '',
  displayValue,
  required = false,
  disabled = false,
}) => {
  const id = useId();
  const containerRef = useRef(null);
  const shellRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const panelPosition = useFloatingPanel(shellRef, open);

  const normalizedOptions = useMemo(
    () => options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option)),
    [options],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [value, normalizedOptions.length]);

  const commitSelection = (option) => {
    onSelect?.(option);
    setOpen(false);
  };

  return (
    <label htmlFor={id} className={cn('block', wrapperClassName)}>
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--text-muted)]">{label}</span>
      <div ref={containerRef} className="relative">
        <div ref={shellRef} className="input-shell flex items-center gap-3 rounded-[24px] px-4 py-3 transition-all focus-within:border-[var(--accent-2)] focus-within:shadow-[0_0_0_1px_rgba(77,216,255,0.24)]">
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" /> : null}
          <input
            id={id}
            value={value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete="off"
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              onInputChange?.(event.target.value);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (!normalizedOptions.length) {
                return;
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
                setHighlightedIndex((current) => (current + 1) % normalizedOptions.length);
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setOpen(true);
                setHighlightedIndex((current) => (current - 1 + normalizedOptions.length) % normalizedOptions.length);
              }

              if (event.key === 'Enter' && open) {
                event.preventDefault();
                commitSelection(normalizedOptions[highlightedIndex]);
              }

              if (event.key === 'Escape') {
                setOpen(false);
              }
            }}
            className={cn('min-h-[24px] w-full border-0 bg-transparent text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--text-muted)]', className)}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((current) => !current)}
            className="rounded-full bg-white/5 p-1 text-[var(--text-muted)] transition hover:bg-white/10 hover:text-[var(--text-strong)]"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', open ? 'rotate-180' : '')} />
          </button>
        </div>

        {displayValue ? (
          <p className="mt-2 text-xs text-[var(--text-muted)]">{displayValue}</p>
        ) : null}

        {open && panelPosition
          ? createPortal(
              <motion.div
                {...overlayMotionProps}
                className={cn(overlayBaseClassName, 'fixed z-[200] max-h-60')}
                style={{
                  top: panelPosition.top,
                  left: panelPosition.left,
                  width: panelPosition.width,
                }}
              >
                {normalizedOptions.length ? (
                  normalizedOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => commitSelection(option)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-[18px] px-3 py-2.5 text-left text-sm transition',
                        index === highlightedIndex ? 'bg-[linear-gradient(135deg,rgba(77,216,255,0.16),rgba(50,255,157,0.12))] text-[var(--text-strong)]' : 'text-[var(--text-body)] hover:bg-white/8',
                      )}
                    >
                      <span>{option.label}</span>
                      {option.label === value || option.value === value ? <Check className="h-4 w-4 text-[var(--accent)]" /> : null}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-[var(--text-muted)]">{emptyMessage}</p>
                )}
              </motion.div>,
              document.body,
            )
          : null}
      </div>
    </label>
  );
};

export const SearchField = ({ className = '', ...props }) => (
  <FloatingField label="Search" icon={Search} placeholder="Search people, departments, or records" className={className} {...props} />
);

export const SurfaceHeader = ({ title, subtitle, extra }) => (
  <div className="mb-5 flex items-start justify-between gap-4">
    <div>
      <h3 className="text-lg font-bold text-[var(--text-strong)]">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-[var(--text-body)]">{subtitle}</p> : null}
    </div>
    {extra}
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 px-6 py-10 text-center">
    {Icon ? (
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-white/6">
        <Icon className="h-7 w-7 text-[var(--accent-2)]" />
      </div>
    ) : null}
    <h4 className="text-lg font-bold text-[var(--text-strong)]">{title}</h4>
    <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-body)]">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

export const SkeletonBlock = ({ className = '' }) => (
  <div className={cn('animate-pulse rounded-[24px] bg-white/8', className)} />
);

export const MiniChartLegend = ({ items = [] }) => (
  <div className="mt-4 flex flex-wrap gap-3">
    {items.map((item) => (
      <div key={item.label} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] text-[var(--text-body)]">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
        {item.label}
      </div>
    ))}
  </div>
);

export const CommandHint = () => (
  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-[var(--text-muted)]">
    <Command className="h-3.5 w-3.5" />
    Search
    <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px]">Ctrl K</span>
  </div>
);
