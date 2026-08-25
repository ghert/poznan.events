export interface ScrapeInput {
  url: string;
  upcoming_events_only: boolean;
  venue: string;
}
export const SCRAPE_INPUTS: ScrapeInput[] = [
  { url: 'https://www.facebook.com/bluenotepoznan/events', "upcoming_events_only": true, venue: "Blue Note" },
  { url: 'https://www.facebook.com/slinamordo/events', "upcoming_events_only": true, venue: "Ślina"},
  { url: 'https://www.facebook.com/tamaklub/events', "upcoming_events_only": true, venue: "Tama"},
  { url: 'https://www.facebook.com/FARBYWILDAPOZNAN/events', "upcoming_events_only": true, venue: "Farby" },
  { url: 'https://www.facebook.com/schron44/events', "upcoming_events_only": true, venue: "Schron" },
  { url: 'https://www.facebook.com/domtechnika/events', "upcoming_events_only": true, venue: "Dom technika" },
  { url: "https://www.facebook.com/las.poznan/events", "upcoming_events_only": true, venue: "LAS" },
  { url: "https://www.facebook.com/Rewiry.Klub/events", "upcoming_events_only": true, venue: "Rewiry" }
];
