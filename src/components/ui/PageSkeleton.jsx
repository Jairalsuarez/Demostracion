function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton-block rounded-md ${className}`} />;
}

export default function PageSkeleton({ mode = "page", title = "Cargando contenido" }) {
  if (mode === "auth") {
    return (
      <div className="min-h-screen bg-white px-4 py-10 text-[#183325] dark:bg-[#0b1220] dark:text-[#f8fafc]">
        <div className="mx-auto grid max-w-5xl gap-8 rounded-2xl border border-[#e4ece2] bg-white p-8 shadow-[0_22px_50px_rgba(24,51,37,0.08)] dark:border-[#23314d] dark:bg-[#111827]">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-16 w-16 rounded-xl" />
            <div className="grid flex-1 gap-3">
              <SkeletonBlock className="h-6 w-56" />
              <SkeletonBlock className="h-4 w-72" />
            </div>
          </div>

          <div className="grid gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">Seguridad</span>
            <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
            <p className="max-w-2xl text-sm leading-7 text-[#5b6d61] dark:text-[#c7d2e0]">
              Estamos verificando tu acceso y preparando el panel con tu informacion actual.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-[#183325] dark:bg-[#0b1220] dark:text-[#f8fafc] lg:px-6 lg:py-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <div className="rounded-xl border border-[#e4ece2] bg-white p-6 shadow-[0_18px_40px_rgba(24,51,37,0.06)] dark:border-[#23314d] dark:bg-[#111827]">
          <div className="grid gap-4">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-9 w-80 max-w-full" />
            <SkeletonBlock className="h-4 w-full max-w-3xl" />
            <SkeletonBlock className="h-4 w-2/3 max-w-2xl" />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-xl border border-[#e4ece2] bg-white p-5 shadow-[0_18px_40px_rgba(24,51,37,0.05)] dark:border-[#23314d] dark:bg-[#111827]">
            <div className="grid gap-4">
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="h-11 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <SkeletonBlock className="h-10" />
                <SkeletonBlock className="h-10" />
                <SkeletonBlock className="h-10" />
                <SkeletonBlock className="h-10" />
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-[#e4ece2] bg-white p-4 shadow-[0_18px_40px_rgba(24,51,37,0.05)] dark:border-[#23314d] dark:bg-[#111827]">
                <SkeletonBlock className="aspect-[4/3] w-full rounded-lg" />
                <div className="mt-4 grid gap-3">
                  <SkeletonBlock className="h-5 w-20" />
                  <SkeletonBlock className="h-7 w-36" />
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-4 w-3/4" />
                  <div className="mt-2 grid gap-2">
                    <SkeletonBlock className="h-11 w-full" />
                    <SkeletonBlock className="h-11 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
