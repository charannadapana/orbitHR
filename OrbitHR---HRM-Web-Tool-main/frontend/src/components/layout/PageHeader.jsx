const PageHeader = ({ title, subtitle, eyebrow = 'Workspace', children }) => {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.34em] text-[var(--accent-2)]">{eyebrow}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-strong)] sm:text-4xl xl:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-body)] sm:text-base">{subtitle}</p> : null}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
};

export default PageHeader;
