type StatCardProps = {
  label: string;
  value: string | number;
  accent?: boolean;
  hint?: string;
};

export default function StatCard({
  label,
  value,
  accent = false,
  hint,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-2 text-3xl font-black ${accent ? "text-amber-300" : "text-stone-100"}`}>
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}
