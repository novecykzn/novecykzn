import Image from "next/image";
import Link from "next/link";

type Props = {
  showTagline?: boolean;
  className?: string;
};

export function BrandWordmark({ showTagline = true, className = "" }: Props) {
  const width = showTagline ? 230 : 170;

  return (
    <Link
      href="/"
      className={`group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00a4e4] focus-visible:ring-offset-2 ${className}`}
      aria-label="Novecy home"
    >
      <Image
        src="/novecylogo.png"
        alt="Novecy - pioneers of innovative compounding"
        width={width}
        height={106}
        priority
        className="h-auto w-auto max-w-[230px]"
      />
    </Link>
  );
}
