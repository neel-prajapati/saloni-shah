import { createClient } from "@sanity/client";
import type { PortableTextBlock } from "@portabletext/types";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  coverImage?: {
    url: string;
    alt?: string;
  };
  body: PortableTextBlock[];
};

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || "production";

const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2025-02-19",
      useCdn: true,
      perspective: "published",
    })
  : null;

const POSTS_QUERY = `*[
  _type == "post" &&
  defined(slug.current) &&
  defined(publishedAt) &&
  dateTime(publishedAt) <= dateTime(now()) &&
  !(_id in path("drafts.**"))
] | order(publishedAt desc) {
  "id": _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "coverImage": select(defined(coverImage.asset) => {
    "url": coverImage.asset->url,
    "alt": coverImage.alt
  }),
  body
}`;

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!client) {
    throw new Error("Set VITE_SANITY_PROJECT_ID to enable the blog.");
  }

  return client.fetch<BlogPost[]>(POSTS_QUERY);
}
