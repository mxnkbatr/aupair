"use client";

import Image from "next/image";
import { BRAND } from "@/lib/branding";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  /** iOS app-icon corner radius (default true) */
  rounded?: boolean;
};

/** APM app icon — header, splash, auth дээр ижил logo */
export default function BrandLogo({
  size = 40,
  className = "",
  priority,
  rounded = true,
}: BrandLogoProps) {
  const radius = rounded ? Math.round(size * 0.223) : 0;

  return (
    <div
      className={`brand-app-icon shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        boxShadow: "0 2px 10px rgba(196, 30, 58, 0.22), 0 0 0 0.5px rgba(0,0,0,0.06)",
      }}
    >
      <Image
        src={BRAND.appIcon}
        alt={BRAND.name}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        priority={priority}
      />
    </div>
  );
}
