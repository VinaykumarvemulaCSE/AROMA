// src/components/AddressAutocomplete.tsx

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

/**
 * Simple address input without Google Maps integration.
 * Retains the same API surface for callers.
 */
export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Start typing your address…",
  className,
  required,
}: Props) {
  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        required={required}
      />
    </div>
  );
}
