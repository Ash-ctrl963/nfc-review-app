interface BusinessHeaderProps {
  name: string;
  logoUrl: string;
}

export function BusinessHeader({ name, logoUrl }: BusinessHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {}
      <img src={logoUrl} alt="" className="h-12 w-12" aria-hidden="true" />
      <p className="font-display text-lg font-medium text-ink">{name}</p>
    </div>
  );
}
