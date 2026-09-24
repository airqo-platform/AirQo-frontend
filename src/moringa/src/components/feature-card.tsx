import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  imageSrc: string;
  href: string;
  openInNewTab?: boolean;
}

export function FeatureCard({
  title,
  description,
  Icon,
  imageSrc,
  href,
  openInNewTab = false,
}: FeatureCardProps) {
  const linkProps = openInNewTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a href={href} {...linkProps} aria-label={title}>
      <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group">
        {/* Background image */}
        <Image
          src={imageSrc}
          alt={title}
          fill // Use `fill` instead of `layout="fill"`
          style={{ objectFit: "cover" }} // Use `style` for `objectFit`
          className="transition-transform duration-300 group-hover:scale-105"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

        {/* Icon in top-right corner */}
        <div className="absolute top-4 right-4 z-20">
          <Icon className="h-6 w-6 text-white opacity-80" />
        </div>

        {/* Content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-white/90">{description}</p>
        </div>
      </div>
    </a>
  );
}