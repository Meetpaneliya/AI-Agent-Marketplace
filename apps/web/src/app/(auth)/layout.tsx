export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-signal/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <a href="/" className="relative z-10 flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-signal flex items-center justify-center">
          <svg className="w-6 h-6 text-void" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-xl font-bold">
          <span className="text-text-primary">Agent</span>
          <span className="text-signal ml-1">Store</span>
        </span>
      </a>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
