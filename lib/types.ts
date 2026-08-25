export interface ScrapedEvent {
  sourceId: string;
  sourceUrl: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  venueName: string | null;
  address: string | null;
};

export interface ScrapedEventFromDB {
  source_id: string;
  source_url: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  venue_name: string | null;
  address: string | null;
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
  }
}
