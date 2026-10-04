"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, Check, Crosshair, Search, Home as HomeIcon, Briefcase as WorkIcon, X } from "lucide-react";
import { getUserCoordinates, reverseGeocode, calculateHaversineDistance, LocationResult } from "@/lib/location";
import { MapPickerCanvas } from "./MapPickerCanvas";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationResult & { line2?: string; label?: string }) => void;
  initialCoords?: { latitude: number; longitude: number };
};

type SearchResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

// Default coordinates: Hyderabad Cafe area
const DEFAULT_LAT = 17.4399;
const DEFAULT_LNG = 78.4017;

export function LocationPickerModal({ isOpen, onClose, onSelectLocation, initialCoords }: Props) {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: initialCoords?.latitude || DEFAULT_LAT,
    longitude: initialCoords?.longitude || DEFAULT_LNG,
  });

  const [locationDetails, setLocationDetails] = useState<LocationResult | null>(null);
  const [line2, setLine2] = useState("");
  const [addressLabel, setAddressLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Automatically fetch user GPS location when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialCoords?.latitude && initialCoords?.longitude) {
        setCoords({ latitude: initialCoords.latitude, longitude: initialCoords.longitude });
        fetchAddress(initialCoords.latitude, initialCoords.longitude);
      } else {
        setLoadingAddress(true);
        getUserCoordinates()
          .then((pos) => {
            setCoords(pos);
            fetchAddress(pos.latitude, pos.longitude);
          })
          .catch((err) => {
            console.log("GPS auto-locate fallback to store base:", err);
            setCoords({ latitude: DEFAULT_LAT, longitude: DEFAULT_LNG });
            fetchAddress(DEFAULT_LAT, DEFAULT_LNG);
          });
      }
    }
  }, [isOpen, initialCoords]);

  const fetchAddress = async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const res = await reverseGeocode(lat, lng);
      setLocationDetails(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleCenterChange = useCallback((lat: number, lng: number) => {
    setCoords({ latitude: lat, longitude: lng });
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchAddress(lat, lng);
    }, 300);
  }, []);

  // Location search auto-complete
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery.trim()
          )}&limit=5&countrycodes=in`,
          {
            headers: {
              "Accept-Language": "en-US,en",
              "User-Agent": "AromaCafe/1.0",
            },
          }
        );
        const data = await res.json();
        setSearchResults(data || []);
        setShowSearchResults(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setCoords({ latitude: lat, longitude: lng });
    setShowSearchResults(false);
    setSearchQuery("");
    fetchAddress(lat, lng);
    toast.success("Location set from search");
  };

  const handleLocateUser = async () => {
    setLocatingGps(true);
    try {
      const pos = await getUserCoordinates();
      setCoords(pos);
      await fetchAddress(pos.latitude, pos.longitude);
      toast.success("Location updated to current GPS");
    } catch (err: any) {
      toast.error(err.message || "Failed to locate.");
    } finally {
      setLocatingGps(false);
    }
  };

  const handleConfirm = () => {
    if (!locationDetails) return;
    onSelectLocation({
      ...locationDetails,
      line2,
      label: addressLabel,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] sm:max-h-[88vh] w-[95vw] sm:max-w-xl p-0 overflow-hidden rounded-2xl flex flex-col gap-0 border border-border shadow-2xl">
        <DialogHeader className="p-3.5 sm:p-4 pb-2 shrink-0 border-b border-border/50 bg-background">
          <DialogTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
            <MapPin className="size-4 sm:size-5 text-primary" />
            Choose Location on Map
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar Overlaid */}
        <div className="px-3.5 sm:px-4 py-2 relative z-30 shrink-0 bg-background/80 backdrop-blur-sm border-b border-border/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area, landmark or street name..."
              className="pl-9 pr-8 text-xs sm:text-sm h-9 bg-background border-border"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchResults && (
            <div className="absolute left-3.5 right-3.5 sm:left-4 sm:right-4 top-12 z-40 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-border">
              {searching ? (
                <div className="p-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" /> Searching locations...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground text-center">No locations found</div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.place_id}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left p-2.5 text-xs hover:bg-muted transition-colors flex items-start gap-2"
                  >
                    <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item.display_name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Map Container Canvas */}
        <div className="relative w-full h-[180px] sm:h-[240px] md:h-[260px] shrink-0 bg-muted overflow-hidden">
          {isOpen && (
            <MapPickerCanvas center={coords} onCenterChange={handleCenterChange} />
          )}

          {/* Center Pin Overlay */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none flex flex-col items-center">
            <div className="bg-primary text-primary-foreground p-1.5 sm:p-2 rounded-full shadow-lg border-2 border-background animate-bounce">
              <MapPin className="size-5 sm:size-6 fill-primary-foreground" />
            </div>
            <div className="size-2 bg-black/40 rounded-full blur-[1px] mt-0.5" />
          </div>

          {/* Locate Me Floating Button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleLocateUser}
            disabled={locatingGps}
            className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-20 shadow-md bg-background/95 backdrop-blur border border-border hover:bg-background text-xs h-8 px-2.5 sm:px-3"
          >
            {locatingGps ? (
              <Loader2 className="size-3.5 animate-spin mr-1" />
            ) : (
              <Crosshair className="size-3.5 mr-1 text-primary" />
            )}
            {locatingGps ? "Locating..." : "Use My GPS"}
          </Button>
        </div>

        {/* Selected Address Details Card - Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 bg-card min-h-0">
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] font-semibold text-primary uppercase tracking-wider">
                Delivering to
              </p>
              <h4 className="font-semibold text-xs sm:text-sm mt-0.5 truncate text-foreground">
                {loadingAddress ? "Detecting address..." : locationDetails?.line1 || "Selected location"}
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {loadingAddress ? "Fetching map data..." : locationDetails?.formattedAddress}
              </p>

              {!loadingAddress && locationDetails && (
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1.5">
                  {locationDetails.landmark && (
                    <span className="text-[9px] sm:text-[10px] bg-secondary px-2 py-0.5 rounded-full text-foreground/80 font-medium">
                      Area: {locationDetails.landmark}
                    </span>
                  )}
                  {locationDetails.city && (
                    <span className="text-[9px] sm:text-[10px] bg-secondary px-2 py-0.5 rounded-full text-foreground/80 font-medium">
                      City: {locationDetails.city}
                    </span>
                  )}
                  {locationDetails.pin && (
                    <span className="text-[9px] sm:text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-mono font-semibold">
                      PIN: {locationDetails.pin}
                    </span>
                  )}
                  {coords && (
                    <span className="text-[9px] sm:text-[10px] bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      {calculateHaversineDistance(DEFAULT_LAT, DEFAULT_LNG, coords.latitude, coords.longitude)} km from Cafe
                    </span>
                  )}
                </div>
              )}
            </div>
            {loadingAddress && <Loader2 className="size-4 animate-spin text-muted-foreground shrink-0 mt-1" />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
            <div>
              <Label className="text-[11px] sm:text-xs text-muted-foreground">House / Flat / Floor / Building (Optional)</Label>
              <Input
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                placeholder="e.g. Flat 302, 3rd Floor"
                className="mt-1 text-xs sm:text-sm h-8 sm:h-9"
              />
            </div>

            <div>
              <Label className="text-[11px] sm:text-xs text-muted-foreground">Save address as</Label>
              <div className="flex items-center gap-1.5 mt-1">
                {(["Home", "Work", "Other"] as const).map((tag) => {
                  const Icon = tag === "Home" ? HomeIcon : tag === "Work" ? WorkIcon : MapPin;
                  const isSelected = addressLabel === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAddressLabel(tag)}
                      className={`flex-1 py-1 sm:py-1.5 px-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon className="size-3 shrink-0" />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fixed Action Footer */}
        <div className="p-3 sm:p-4 pt-2.5 border-t border-border bg-card/95 backdrop-blur shrink-0 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-3 text-xs sm:text-sm">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={loadingAddress || !locationDetails}
            className="h-9 px-4 sm:px-5 font-semibold text-xs sm:text-sm"
          >
            <Check className="size-4 mr-1.5" /> Confirm Location & Deliver Here
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
