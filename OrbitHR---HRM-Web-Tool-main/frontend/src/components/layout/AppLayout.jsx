const AppLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-root)] text-[var(--text-strong)]">
      <div className="dashboard-orb left-[-8rem] top-[-4rem] h-72 w-72 bg-cyan-400/30" />
      <div className="dashboard-orb right-[-8rem] top-24 h-80 w-80 bg-emerald-400/20" />
      <div className="dashboard-orb bottom-[-8rem] left-1/3 h-96 w-96 bg-amber-300/10" />
      <div className="grid-sheen pointer-events-none absolute inset-0 opacity-40" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
};

export default AppLayout;
