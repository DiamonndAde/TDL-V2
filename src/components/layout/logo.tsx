import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/brand/logo.png";

/**
 * TDL's full logo as supplied (change 3): mark, wordmark and red tagline, in colour, unaltered (885×268 PNG; the
 * original vector is still owed, Q16). Readable size: 40 px tall on phones, 48 px at lg, 58 px at xl, against the
 * WordPress build's 35 px. On dark grounds it sits on a white tile, because the olive wordmark is ~2.5:1 on coal.
 */
export function Logo({ onDark = false, className = "" }: { onDark?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Total Data Limited, home"
      className={`inline-flex shrink-0 ${onDark ? "rounded-md bg-white p-3" : ""} ${className}`}
    >
      <Image
        src={logo}
        alt=""
        sizes="(min-width: 80rem) 192px, (min-width: 64rem) 160px, 132px"
        className="h-10 w-auto lg:h-12 xl:h-[3.625rem]"
        loading="eager"
      />
    </Link>
  );
}
