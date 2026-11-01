export type Project = {
  slug: string;
  title: string;
  thumbnail: string;
  /** Bunny.net Stream library ID */
  libraryId: string;
  /** Bunny.net Stream video GUID */
  videoId: string;
};

/**
 * Add new short films here — the gallery (/projects) and the watch page
 * (/projects/[slug]) are both generated from this list.
 */
export const projects: Project[] = [
  {
    slug: "the-curse-of-the-miller",
    title: "The Curse of the Miller | Uncensored & Uncut",
    thumbnail:
      "https://vz-8b01c340-1ec.b-cdn.net/a3f50d21-4f0c-439d-8424-e5a00fb70f4a/thumbnail_9652666e.jpg",
    libraryId: "792798",
    videoId: "a3f50d21-4f0c-439d-8424-e5a00fb70f4a",
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);

export const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/14A8wQ0tY6x68lY9GH0sU00";

export const socials = [
  { name: "YouTube", href: "https://www.youtube.com/@TalesFromEphemeralReverie" },
  { name: "X", href: "https://x.com/ephemeral_rev" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/nicolailadegaard/" },
  { name: "Instagram", href: "https://www.instagram.com/talesfromephemeralreverie/?hl=da" },
  { name: "TikTok", href: "https://www.tiktok.com/@ephemeralreverie_" },
] as const;
