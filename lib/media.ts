import { toSlug } from "./content/slug";
// Media appearances (podcasts, press, video).
// TODO(TWS-117 open question 2): hardcoded for launch. Move to a CMS mediaAppearances schema later.
// Source: the old site's Contentful export (podcasts and interviews), the YouTube and Spotify
// listings for Female Founders #077, and the WomELLE article (2026-11-11).

export interface MediaLink {
  label: string;
  url: string;
}

export interface MediaAppearance {
  id: string;
  /** Outlet shown in the Home "Featured in" strip. */
  outlet: string;
  /** The outlet's main URL. */
  url: string;
  kind: string;
  /** When it came out, as shown on the page ("January 2023"). */
  date?: string;
  title: string;
  summary: string;
  links: MediaLink[];
  /** Episodes in a series, newest first. A missing url renders as plain text. */
  parts?: { label: string; url?: string }[];
}

const youtube = (id: string) => `https://www.youtube.com/watch?v=${id}`;

const femaleFoundersVideo = youtube("AOTdkjDBdzM");

export const mediaAppearances: Record<string, MediaAppearance> = {
  "female-founders-ep-77": {
    id: "female-founders-ep-77",
    outlet: "Female Founders Podcast",
    url: femaleFoundersVideo,
    kind: "Podcast & video · WomELLE",
    date: "January 2023",
    title: "Self-worth is key in relationship dynamics",
    summary:
      "Episode 77. Jessica talks about her own path through abuse and domestic violence, why she founded her practice, how she uses EMDR, and how clients turn pain into power.",
    links: [
      { label: "Watch on YouTube", url: femaleFoundersVideo },
      { label: "Spotify", url: "https://open.spotify.com/episode/5nWVZ64dgqsg7F4DT5iJiv" },
      {
        label: "Apple Podcasts",
        url: "https://podcasts.apple.com/us/podcast/jessica-rebelo-self-worth-is-key-in-relationship-dynamics/id1617927566?i=1000596320700",
      },
      { label: "Read on WomELLE", url: "https://www.womelle.com/blog/Jessica-Rebelo" },
    ],
  },
  // The WomELLE write-up of the episode above, listed on its own (Peter, 2026-11-12).
  "womelle-article": {
    id: "womelle-article",
    outlet: "WomELLE",
    url: "https://www.womelle.com/blog/Jessica-Rebelo",
    kind: "Article",
    date: "January 2023",
    title: "Self-worth is key in relationship dynamics",
    summary: "Jessica's feature on WomELLE.",
    links: [{ label: "Read on WomELLE", url: "https://www.womelle.com/blog/Jessica-Rebelo" }],
  },
  "chief-navigators-2023": {
    id: "chief-navigators-2023",
    outlet: "The Chief Navigators",
    url: "https://thechiefnavigators.com/jessica-rebelo-a-renowned-licensed-clinical-social-worker-and-trauma-informed-life-coach/",
    kind: "Magazine feature",
    date: "September 2023",
    title: "Jessica Rebelo: A renowned licensed clinical social worker and trauma-informed life coach",
    summary: "Featured in The 10 Most Influential Women Leading the Business in 2023.",
    links: [
      {
        label: "Read the feature",
        url: "https://thechiefnavigators.com/jessica-rebelo-a-renowned-licensed-clinical-social-worker-and-trauma-informed-life-coach/",
      },
    ],
  },
  "journey-with-jess": {
    id: "journey-with-jess",
    outlet: "Journey With Jess",
    url: "https://podcasters.spotify.com/pod/show/jessica-monge6",
    kind: "Podcast & video",
    title: "Trauma-informed life coach and therapist, Jessica Rebelo",
    summary:
      "A conversation about Jessica's work as a licensed clinical social worker and trauma-informed life coach, and the founding of her practice.",
    links: [
      { label: "Watch on YouTube", url: youtube("hsw23sN8aUc") },
      { label: "The show on Spotify", url: "https://podcasters.spotify.com/pod/show/jessica-monge6" },
    ],
  },
  "pbn-steve-harper-series": {
    id: "pbn-steve-harper-series",
    outlet: "PBN Podcasts",
    url: youtube("WYJPPvPD5_Y"),
    kind: "Interview series",
    date: "Spring 2024",
    title: "Steve Harper interviews Jessica Rebelo",
    summary: "A four-part video series on Jessica's work and her practice.",
    links: [],
    parts: [
      { label: "Part 4 · April 1, 2024", url: youtube("WYJPPvPD5_Y") },
      { label: "Part 3 · March 25, 2024", url: youtube("Ht-UiaUcPf0") },
      { label: "Part 2 · March 18, 2024", url: youtube("zEhCKMOe8Cc") },
      { label: "Part 1", url: youtube("1MLmoBL2CHs") },
    ],
  },
  "can-you-dig-it": {
    id: "can-you-dig-it",
    outlet: "Can You Dig It? Podcast",
    url: youtube("HtAxoCFKiIo"),
    kind: "Video podcast · co-host",
    title: "Can You Dig It? with Jessica and Jordan",
    summary:
      "Jessica co-hosts this video podcast on personal growth. Episodes cover coaching and counseling, pain, self-worth, showing up for yourself, and a four-part series on anxiety.",
    links: [],
    parts: [
      { label: "Anxiety series, episode 4: Q&A", url: youtube("HtAxoCFKiIo") },
      { label: "Anxiety series, episode 3", url: youtube("2m0PpZcrB3k") },
      { label: "Anxiety series, episode 2", url: youtube("IaAmRAtooTE") },
      { label: "Anxiety series, episode 1", url: youtube("htYVFgc7p4E") },
      { label: "Episode 10: Happy but not healthy", url: youtube("SaFO5yIbn7M") },
      { label: "Marching into April", url: youtube("MoOmcIuJKFw") },
      { label: "Listener Q&A", url: youtube("R6D-d4VFM0g") },
      { label: "Episode 7: Chainbreakers", url: youtube("WShXumvLlXw") },
      { label: "Episode 6: The toughness of enoughness", url: youtube("eF0VmkzFUQI") },
      { label: "Episode 5: Showing up", url: youtube("wHGj0bKjzYY") },
      { label: "Episode 4: Turning pain into power", url: youtube("9ZAbVvvM6rg") },
      { label: "Episode 3: The personal narrative", url: youtube("_CSa1d-zb0k") },
      { label: "Episode 2: Just because we can dig it, should we?", url: youtube("5YmupiYxok8") },
      { label: "Episode 1: Coaching vs. counseling", url: youtube("-OwyKO_KbSY") },
    ],
  },
};

// Older ids and outlet names from earlier content, so references made before 2026-11-11 still resolve.
const aliases: Record<string, string> = {
  "womlead-self-worth": "female-founders-ep-77",
  "youtube-interview": "female-founders-ep-77",
  womelle: "female-founders-ep-77",
};

// The CMS reference can hold the outlet name ("Female Founders Podcast"), so match that too.
export function getMediaAppearance(id: string): MediaAppearance | null {
  const slug = toSlug(id);
  const key = aliases[slug] ?? slug;
  const direct = mediaAppearances[id] ?? mediaAppearances[key];
  if (direct) {
    return direct;
  }
  return Object.values(mediaAppearances).find((a) => toSlug(a.outlet) === key) ?? null;
}
