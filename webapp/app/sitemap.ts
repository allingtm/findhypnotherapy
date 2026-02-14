import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://findhypnotherapy.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    {
      url: `${BASE_URL}/directory`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/videos`,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/for-practitioners`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Published therapist profiles
  const { data: therapists } = await supabase
    .from("therapist_profiles")
    .select("slug, updated_at")
    .eq("is_published", true);

  const therapistPages: MetadataRoute.Sitemap = (therapists ?? []).map(
    (t) => ({
      url: `${BASE_URL}/directory/${t.slug}`,
      lastModified: t.updated_at,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  // Booking pages for published therapists
  const bookingPages: MetadataRoute.Sitemap = (therapists ?? []).map((t) => ({
    url: `${BASE_URL}/book/${t.slug}`,
    lastModified: t.updated_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Active services for published therapists
  const { data: services } = await supabase
    .from("therapist_services")
    .select("id, updated_at, therapist_profiles!inner(slug, is_published)")
    .eq("is_active", true)
    .eq("therapist_profiles.is_published", true);

  const servicePages: MetadataRoute.Sitemap = (services ?? []).map((s) => {
    const profile = s.therapist_profiles as unknown as { slug: string };
    return {
      url: `${BASE_URL}/directory/${profile.slug}/service/${s.id}`,
      lastModified: s.updated_at,
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  // Published videos
  const { data: videos } = await supabase
    .from("therapist_videos")
    .select("slug, tags, updated_at")
    .eq("status", "published");

  const videoPages: MetadataRoute.Sitemap = (videos ?? [])
    .filter((v) => v.slug)
    .map((v) => ({
      url: `${BASE_URL}/videos/${v.slug}`,
      lastModified: v.updated_at,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  // Unique tags from published videos
  const tagSet = new Set<string>();
  (videos ?? []).forEach((v) => {
    if (Array.isArray(v.tags)) {
      v.tags.forEach((tag: string) => tagSet.add(tag));
    }
  });

  const tagPages: MetadataRoute.Sitemap = Array.from(tagSet).map((tag) => ({
    url: `${BASE_URL}/tags/${encodeURIComponent(tag)}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...therapistPages,
    ...bookingPages,
    ...servicePages,
    ...videoPages,
    ...tagPages,
  ];
}
