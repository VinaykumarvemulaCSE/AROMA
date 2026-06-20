// src/components/AddressAutocomplete.tsx
// Wraps the Google Maps Places Autocomplete API.
// Requires VITE_GOOGLE_MAPS_API_KEY to be set in .env.
// Falls back to a plain text input if the key is missing (dev/offline mode).

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

type ParsedAddress = {
  line1: string;
  city: string;
  pin: string;
};

export type GoogleLocation = {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
};

type Props = {
  value: string;
  onChange: (raw: string, parsed?: ParsedAddress, location?: GoogleLocation) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
};

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

// Load the Google Maps JS SDK once
let scriptLoaded = false;
function loadMapsScript(): Promise<void> {
  if (scriptLoaded || !MAPS_KEY) return Promise.resolve();
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => { scriptLoaded = true; resolve(); };
    document.head.appendChild(s);
  });
}

export function AddressAutocomplete({ value, onChange, placeholder = "Start typing your address…", className, required }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!MAPS_KEY) return; // no key → plain input
    loadMapsScript().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current) return;
    // @ts-ignore — google is loaded via script tag
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "in" },
      fields: ["address_components", "formatted_address", "geometry", "place_id"],
      types: ["address"],
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      const get = (type: string) =>
        place.address_components!.find((c: any) => c.types.includes(type))
          ?.long_name ?? "";

      const streetNumber = get("street_number");
      const route = get("route");
      const sublocality = get("sublocality_level_1") || get("sublocality");
      const city =
        get("locality") || get("administrative_area_level_2") || get("administrative_area_level_1");
      const pin = get("postal_code");

      const line1 = [streetNumber, route, sublocality].filter(Boolean).join(", ");
      
      const location = place.geometry?.location ? {
        address: place.formatted_address ?? line1,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        placeId: place.place_id ?? "",
      } : undefined;

      onChange(place.formatted_address ?? line1, { line1: line1 || (place.formatted_address ?? ""), city, pin }, location);
    });

    return () => {
      // @ts-ignore
      google.maps.event.removeListener(listener);
    };
  }, [ready, onChange]);

  if (!MAPS_KEY) {
    // Graceful fallback — plain input with a note
    return (
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          required={required}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          (autocomplete unavailable)
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className ?? ""}`}
      />
    </div>
  );
}
