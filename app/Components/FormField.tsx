type FormFieldProps = {
  label: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
};

export default function FormField({
  label,
  helper,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-semibold text-stone-200">
          {label}
          {required ? <span className="text-amber-300"> *</span> : null}
        </label>
      </div>
      {helper ? <p className="text-xs leading-5 text-stone-500">{helper}</p> : null}
      {children}
    </div>
  );
}
