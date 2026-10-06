export interface ScrapedEvent {
  sourceId: string;
  sourceUrl: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  venueName: string | null;
  venueSlug: string | null;
  address: string | null;
  image: string;
  description: string;
}

export interface Tag {
  slug: string;
  name: string;
  emoji: string;
}

export interface ScrapedEventFromDB {
  id: number;
  sourceId: string;
  sourceUrl: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  venueName: string | null;
  venueSlug: string | null;
  address: string | null;
  image: string;
  description: string;
  tags?: Tag[];
}

export interface Row {
  event_id: string;
  url: string;
  event_date: string;
  event_end_date?: string;
  title: string;
  location: {
    address: string;
  };
  hosts: { name: string }[];
  // Absent for collect-by-URL deliveries (user submissions)
  discovery_input?: {
    url: string;
  };
  description: {
    text: string;
  };
  main_image_downloadable: string;
  unformatted_description_text: string;
}
