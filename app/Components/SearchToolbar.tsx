type SearchToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  children?: React.ReactNode;
};

export default function SearchToolbar({
  query,
  onQueryChange,
  placeholder,
  children,
}: SearchToolbarProps) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/70 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-stone-500">
            ⌕
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
      </div>
    </div>
  );
}
