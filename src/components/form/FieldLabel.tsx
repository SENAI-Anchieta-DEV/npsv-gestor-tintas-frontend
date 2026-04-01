export function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}