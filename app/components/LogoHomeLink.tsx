import Image from "next/image";
import Link from "next/link";

type LogoHomeLinkProps = {
  className?: string;
  imageClassName?: string;
};

export function LogoHomeLink({
  className = "flex shrink-0 items-center py-1",
  imageClassName = "h-12 w-auto max-w-[min(280px,62vw)] object-contain object-left sm:h-14",
}: LogoHomeLinkProps) {
  return (
    <Link href="/" aria-label="ATTABOY home" className={className}>
      <Image
        src="/attaboyinc2-transparent.png"
        alt="ATTABOY Website Building Inc."
        width={280}
        height={112}
        priority
        className={imageClassName}
      />
    </Link>
  );
}
