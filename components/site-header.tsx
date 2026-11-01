import Link from "next/link";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Logo (top-left) + liquid-glass nav (top-right). Absolutely positioned with a
 * high z-index so it floats over the hero video and the shader backgrounds.
 */
export default function SiteHeader() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-3 p-4 sm:p-6">
      <Link
        href="/"
        aria-label="Ephemeral Reverie — home"
        className="pointer-events-auto block"
      >
        {/* image2.png has wide transparent padding; crop to the artwork so the
            logo sits flush in the corner and scales cleanly. */}
        <span className="relative block aspect-[240/213] h-12 overflow-hidden sm:h-16 lg:h-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image2.png"
            alt="Ephemeral Reverie"
            className="absolute max-w-none select-none"
            style={{ width: "278.75%", left: "-90.4%", top: "-33.3%" }}
            draggable={false}
          />
        </span>
      </Link>

      <nav
        aria-label="Primary"
        className="liquid-glass font-tech pointer-events-auto rounded-full px-2 py-1.5 sm:px-3"
      >
        <ul className="flex items-center gap-0.5 sm:gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/15 hover:text-white sm:px-4 sm:text-xs"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
