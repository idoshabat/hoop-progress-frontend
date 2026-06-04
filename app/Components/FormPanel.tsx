type FormPanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function FormPanel({
  eyebrow,
  title,
  description,
  children,
}: FormPanelProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="border-b border-zinc-800 bg-amber-500/8 px-6 py-5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-2xl font-bold text-stone-100">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-400">{description}</p> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}
