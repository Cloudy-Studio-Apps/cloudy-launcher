/** A determinate bar for `value` in 0..1, or a sliding one when it's unknown. */
export function ProgressBar({ value }: { value: number | undefined }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      {value === undefined ? (
        <div className="h-full w-1/3 animate-indeterminate rounded-full bg-primary" />
      ) : (
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      )}
    </div>
  );
}
