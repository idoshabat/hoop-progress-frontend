type SectionSurfaceProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export default function SectionSurface({
  title,
  description,
  action,
  children,
}: SectionSurfaceProps) {
  return (
    <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.22)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-100">{title}</h2>
          {description ? <p className="mt-2 text-sm text-stone-400">{description}</p> : null}
        </div>

        {action ? <div>{action}</div> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}
