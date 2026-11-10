// Media appearances (podcasts, press, video).
// TODO(TWS-117 open question 2): hardcoded for launch. Move to a CMS mediaAppearances schema later.
// TODO(handoff open question 7): PBN episode URLs and the Part 1 date are not known yet.

export interface MediaLink {
  label: string;
  url: string;
}

export interface MediaAppearance {
  id: string;
  /** Outlet shown in the Home "Featured in" strip. */
  outlet: string;
  /** The outlet's main URL, used by the Home strip. */
  url: string;
  kind: string;
  title: string;
  summary: string;
  links: MediaLink[];
  /** Episodes in a series, newest first. A missing url renders as plain text. */
  parts?: { label: string; url?: string }[];
}

const spotify = "https://open.spotify.com/episode/5nWVZ64dgqsg7F4DT5iJiv";
const apple =
  "https://podcasts.apple.com/us/podcast/jessica-rebelo-self-worth-is-key-in-relationship-dynamics/id1617927566?i=1000596320700";
const youtube = "https://youtu.be/AOTdkjDBdzM";
const womlead = "https://www.womleadmag.com/jessica-rebelo/";

export const mediaAppearances: Record<string, MediaAppearance> = {
  "female-founders-ep-77": {
    id: "female-founders-ep-77",
    outlet: "Female Founders Podcast",
    url: "https://traffic.libsyn.com/3d217128-111a-4aac-a1a5-dce8b932b1ac/Female_Founders_Podcast_-_Episode_77_-_Jessica_Rebelo.mp3",
    kind: "Podcast",
    title: "Episode 77: Jessica Rebelo",
    summary: "On founding a trauma-focused practice and what it takes to build care that lasts.",
    links: [
      {
        label: "Listen (MP3)",
        url: "https://traffic.libsyn.com/3d217128-111a-4aac-a1a5-dce8b932b1ac/Female_Founders_Podcast_-_Episode_77_-_Jessica_Rebelo.mp3",
      },
    ],
  },
  "womlead-self-worth": {
    id: "womlead-self-worth",
    outlet: "WomLEAD Magazine",
    url: womlead,
    kind: "Magazine & podcast",
    title: "Self-worth is key in relationship dynamics",
    summary: "The full feature and episode page on WomLEAD.",
    links: [
      { label: "Read on WomLEAD", url: womlead },
      { label: "Spotify", url: spotify },
      { label: "Apple Podcasts", url: apple },
    ],
  },
  "youtube-interview": {
    id: "youtube-interview",
    outlet: "YouTube",
    url: youtube,
    kind: "Video",
    title: "In conversation with Jess Rebelo",
    summary: "The interview on video, for those who prefer to watch.",
    links: [{ label: "Watch on YouTube", url: youtube }],
  },
  "pbn-steve-harper-series": {
    id: "pbn-steve-harper-series",
    outlet: "PBN Podcasts",
    url: "",
    kind: "Interview series",
    title: "Steve Harper interviews Jessica Rebelo",
    summary: "A four-part series, recorded in spring 2024.",
    links: [],
    parts: [
      { label: "Part 4 · April 1, 2024" },
      { label: "Part 3 · March 25, 2024" },
      { label: "Part 2 · March 18, 2024" },
      { label: "Part 1 · [Date]" },
    ],
  },
};

export function getMediaAppearance(id: string): MediaAppearance | null {
  return mediaAppearances[id] ?? null;
}
