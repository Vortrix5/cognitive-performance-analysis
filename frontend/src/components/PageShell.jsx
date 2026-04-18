export default function PageShell({ title, subtitle, children }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        ) : null}
      </div>

      {children}
    </div>
  );
}