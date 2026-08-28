export interface ScrapedEvent {
  sourceId: string;
  sourceUrl: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  venueName: string | null;
  address: string | null;
  image: string;
  description: string;
};

export interface ScrapedEventFromDB {
  id: number;
  source_id: string;
  source_url: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  venue_name: string | null;
  address: string | null;
  image: string;
  description: string;
};

export interface Row {
  event_id: string;
  url: string;
  event_date: string;
  title: string;
  location: {
    address: string;
  },
  hosts: { name: string }[],
  discovery_input: {
    url: string;
  },
  description: {
    text: string;
  },
  main_image_downloadable: string;
  unformatted_description_text: string;
}
