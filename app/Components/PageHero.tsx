type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  badge?: string;
  children?: React.ReactNode;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  action,
  badge,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-zinc-700/20 blur-3xl" />
      </div>

      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-3xl">
          {(eyebrow || badge) ? (
            <div className="flex flex-wrap items-center gap-3">
              {eyebrow ? (
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300/80">
                  {eyebrow}
                </p>
              ) : null}
              {badge ? (
                <span className="rounded-full border border-amber-500/15 bg-amber-500/8 px-4 py-2 text-xs uppercase tracking-[0.3em] text-amber-300/60">
                  {badge}
                </span>
              ) : null}
            </div>
          ) : null}
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-stone-100 md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-400">
            {description}
          </p>
        </div>

        {action ? <div className="relative">{action}</div> : null}
      </div>

      {children ? <div className="relative mt-8">{children}</div> : null}
    </section>
  );
}
