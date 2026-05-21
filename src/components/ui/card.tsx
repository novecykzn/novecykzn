export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#e0dedf] bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-[#e0dedf] px-6 py-4">
      <h2 className="font-nunito text-lg font-semibold text-[#234467]">{title}</h2>
      {description ? (
        <p className="font-jakarta mt-1 text-sm text-[#6d6e71]">{description}</p>
      ) : null}
    </div>
  );
}
