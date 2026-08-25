import { useState } from "react";

export default function Filters(
  { filters, setFilter }: {
    filters: { [k: string]: boolean },
    setFilter: (venue: string, value: boolean) => void
  }) {
  const [isOpen, setOpen] = useState(false);

  return (
    <div>
      <button className="btn btn-soft mb-4" onClick={() => setOpen(isOpen => !isOpen)}>Filters</button>
    <div className="flex-row">
      {isOpen ? (
          Object.entries(filters).map(([venue, value]) => (
            <label className="label w-1/3 max-md:w-1/2" key={venue}>
              <input type="checkbox" className="toggle" checked={value} onChange={() => setFilter(venue, !value)} />
              {venue}
            </label>
          ))
        ) : null}
      </div>
    </div>
  )
}
