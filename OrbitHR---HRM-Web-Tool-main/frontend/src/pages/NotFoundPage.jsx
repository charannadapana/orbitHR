export default function NotFoundPage() {
  return (
     <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/80 p-12 text-center shadow-2xl dark:shadow-none">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">404</h1>
        <p className="mt-4 text-slate-500 font-medium">The route you requested does not exist yet.</p>
        <button onClick={() => window.history.back()} className="mt-8 px-6 py-2.5 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all">
          Go Back
        </button>
      </div>
    </main>
  );
}
