export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-ink-900">
      <div className="glass-card max-w-md p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}
