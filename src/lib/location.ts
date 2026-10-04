// src/lib/location.ts
// Geolocation & High-Precision Reverse Geocoding Utilities for Indian addresses.

export type LocationResult = {
  latitude: number;
  longitude: number;
  line1: string;
  landmark: string;
  city: string;
  pin: string;
  state?: string;
  formattedAddress: string;
};

/**
 * Gets high-accuracy GPS coordinates from the browser.
 * Includes comprehensive error handling and retry logic.
 */
export function getUserCoordinates(
  maxRetries: number = 3
): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    let retryCount = 0;

    const attemptLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          retryCount++;
          if (retryCount < maxRetries) {
            console.warn(`Location fetch failed (attempt ${retryCount}/${maxRetries}), retrying...`);
            setTimeout(attemptLocation, 1000 * retryCount); // Exponential backoff
            return;
          }

          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("Location permission denied. Please allow access in browser settings."));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("Location information unavailable. Check device GPS or network connection."));
              break;
            case error.TIMEOUT:
              reject(new Error("Location request timed out after multiple attempts. Please try again."));
              break;
            default:
              reject(new Error(`Could not fetch location: ${error.message}`));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    };

    attemptLocation();
  });
}

/** Helper to extract 6-digit Indian PIN code from text */
function extractPinCode(text: string): string {
  if (!text) return "";
  const match = text.match(/\b[1-9]\d{5}\b/);
  return match ? match[0] : "";
}

/**
 * Cleans string from duplicate words or awkward formatting.
 */
function cleanAddressSegment(text: string): string {
  if (!text) return "";
  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
  const unique = Array.from(new Set(parts));
  return unique.join(", ");
}

/**
 * Reverse geocodes coordinates (lat, lng) into detailed, human-readable Indian address components.
 * Multi-provider strategy:
 * 1. Google Geocoding API (if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is available)
 * 2. OpenStreetMap Nominatim API (Zoom level 18 for granular details)
 * 3. Photon Geocoder Fallback (by Komoot, fast open-source geocoder)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // ── Provider 1: Google Geocoding API ──
  if (apiKey) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await res.json();
      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];
        let streetParts: string[] = [];
        let sublocalityParts: string[] = [];
        let city = "";
        let pin = "";
        let state = "";

        for (const comp of result.address_components) {
          const types = comp.types;
          if (types.includes("premise") || types.includes("subpremise") || types.includes("street_number") || types.includes("route") || types.includes("establishment")) {
            streetParts.push(comp.long_name);
          }
          if (types.includes("sublocality_level_1") || types.includes("sublocality_level_2") || types.includes("neighborhood")) {
            sublocalityParts.push(comp.long_name);
          }
          if (types.includes("locality") || types.includes("administrative_area_level_2")) {
            city = city || comp.long_name;
          }
          if (types.includes("postal_code")) {
            pin = comp.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            state = comp.long_name;
          }
        }

        if (!pin) {
          pin = extractPinCode(result.formatted_address);
        }

        const line1 = cleanAddressSegment(streetParts.join(", ")) || result.formatted_address.split(",")[0] || "Selected Pin Location";
        const landmark = cleanAddressSegment(sublocalityParts.join(", ")) || (result.formatted_address.split(",")[1]?.trim() ?? "");

        return {
          latitude: lat,
          longitude: lng,
          line1,
          landmark,
          city: city || "Nalgonda",
          pin,
          state,
          formattedAddress: result.formatted_address,
        };
      }
    } catch (e) {
      console.warn("Google Geocoding failed, falling back to Nominatim:", e);
    }
  }

  // ── Provider 2: OpenStreetMap Nominatim API ──
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en-US,en",
          "User-Agent": "AromaCafe/1.0",
        },
      }
    );
    const data = await res.json();

    if (data && data.address) {
      const addr = data.address;
      const rawDisplayName = data.display_name || "";

      // Extract 6-digit Indian Postal PIN Code
      let pin = addr.postcode ? extractPinCode(addr.postcode) : "";
      if (!pin) {
        pin = extractPinCode(rawDisplayName);
      }

      // Building / House / Shop Name
      const primaryBuilding = addr.house_number || addr.building || addr.amenity || addr.shop || addr.office || addr.commercial || addr.residential || "";
      // Road / Street
      const road = addr.road || addr.pedestrian || addr.footway || addr.path || addr.street || "";
      // Suburb / Colony / Sector / Neighborhood
      const colonyOrSuburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.colony || addr.hamlet || "";
      // Mandal / Sub-district / Locality
      const mandalOrLocality = addr.subdistrict || addr.mandal || addr.city_district || "";
      // City / Town / Village / District
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || "Nalgonda";
      const state = addr.state || "";

      // Formulate Line 1 (Street / Building)
      let line1Parts = [primaryBuilding, road].filter(Boolean);
      if (line1Parts.length === 0) {
        line1Parts = [colonyOrSuburb, road].filter(Boolean);
      }
      let line1 = cleanAddressSegment(line1Parts.join(", "));

      if (!line1 || line1.length < 4) {
        const parts = rawDisplayName.split(",");
        line1 = cleanAddressSegment(parts.slice(0, 2).join(", "));
      }

      // Formulate Landmark / Sub-area
      let landmarkParts = [colonyOrSuburb, mandalOrLocality].filter((p) => p && p !== line1);
      let landmark = cleanAddressSegment(landmarkParts.join(", "));

      return {
        latitude: lat,
        longitude: lng,
        line1: line1 || "Selected Location Pin",
        landmark: landmark || colonyOrSuburb || mandalOrLocality,
        city: city || "Nalgonda",
        pin: pin || "",
        state,
        formattedAddress: rawDisplayName,
      };
    }
  } catch (err) {
    console.warn("Nominatim Geocoding error, trying Photon fallback:", err);
  }

  // ── Provider 3: Photon Komoot Geocoder Fallback ──
  try {
    const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
    const data = await res.json();
    if (data && data.features && data.features.length > 0) {
      const props = data.features[0].properties;
      const name = props.name || props.street || props.housenumber || "";
      const district = props.district || props.suburb || props.locality || "";
      const city = props.city || props.county || "Nalgonda";
      const postcode = props.postcode ? extractPinCode(props.postcode) : "";

      const formatted = [name, district, city, props.state, postcode, "India"].filter(Boolean).join(", ");

      return {
        latitude: lat,
        longitude: lng,
        line1: name || district || "Selected Location Pin",
        landmark: district || "",
        city: city || "Nalgonda",
        pin: postcode,
        state: props.state || "",
        formattedAddress: formatted,
      };
    }
  } catch (photonErr) {
    console.error("Photon Geocoding error:", photonErr);
  }

  // Final fallback
  return {
    latitude: lat,
    longitude: lng,
    line1: `Location Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    landmark: "",
    city: "Nalgonda",
    pin: "",
    formattedAddress: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
  };
}

/**
 * Calculates straight-line distance in km between two lat/lng coordinates (Haversine Formula).
 * Safely handles null, NaN, and floating-point precision bounds.
 */
export function calculateHaversineDistance(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return 0;
  }

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  // Clamp 'a' between 0 and 1 to prevent Math.sqrt(1 - a) from producing NaN
  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  return Math.round(R * c * 10) / 10;
}

/**
 * Generates a 1-click Google Maps turn-by-turn navigation URL for a delivery address.
 * Uses exact GPS lat/lng if available; falls back to street address query string.
 */
export function buildGoogleMapsNavUrl(
  addr: {
    line1: string;
    landmark?: string;
    city: string;
    pin: string;
    latitude?: number;
    longitude?: number;
  },
  origin?: { latitude: number; longitude: number } | string,
  travelMode: string = "driving"
): string {
  const params = new URLSearchParams({
    api: "1",
    travelmode: travelMode,
    dir_action: "navigate",
  });

  if (typeof origin === "string") {
    params.append("origin", origin);
  } else if (origin?.latitude && origin?.longitude) {
    params.append("origin", `${origin.latitude},${origin.longitude}`);
  }

  if (
    addr.latitude !== undefined &&
    addr.longitude !== undefined &&
    addr.latitude !== 0 &&
    addr.longitude !== 0
  ) {
    params.append("destination", `${addr.latitude},${addr.longitude}`);
  } else {
    const query = [addr.line1, addr.landmark, addr.city, addr.pin, "India"].filter(Boolean).join(", ");
    params.append("destination", query);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export type DeliveryFeeCalculation = {
  distanceKm: number;
  roadDistanceKm: number;
  fee: number;
  isDeliverable: boolean;
  isFreeDelivery: boolean;
  reason?: string;
  estimatedEtaMinutes: { min: number; max: number; formatted: string };
};

/**
 * Calculates dynamic distance-based delivery fee and validates delivery radius/geofence.
 * Formula: Base Fee (0-3km) + Per-KM Charge beyond Base Radius.
 */
export function calculateDynamicDeliveryFee({
  customerLat,
  customerLng,
  storeLat = 17.0544,
  storeLng = 79.2671,
  subtotal = 0,
  baseFee = 30,
  baseRadiusKm = 3,
  perKmRate = 10,
  maxDeliveryRadiusKm = 10,
  freeDeliveryThreshold = 499,
}: {
  customerLat?: number | null;
  customerLng?: number | null;
  storeLat?: number;
  storeLng?: number;
  subtotal?: number;
  baseFee?: number;
  baseRadiusKm?: number;
  perKmRate?: number;
  maxDeliveryRadiusKm?: number;
  freeDeliveryThreshold?: number;
}): DeliveryFeeCalculation {
  if (!customerLat || !customerLng || isNaN(customerLat) || isNaN(customerLng)) {
    return {
      distanceKm: 0,
      roadDistanceKm: 0,
      fee: subtotal >= freeDeliveryThreshold ? 0 : baseFee,
      isDeliverable: true,
      isFreeDelivery: subtotal >= freeDeliveryThreshold,
      reason: "Location coordinates unselected; using standard base fee.",
      estimatedEtaMinutes: { min: 25, max: 35, formatted: "25 - 35 mins" },
    };
  }

  // Calculate straight-line distance using Haversine formula
  const straightLineKm = calculateHaversineDistance(storeLat, storeLng, customerLat, customerLng);

  // Estimate real city road driving distance (~1.25x detour factor)
  const roadDistanceKm = Math.round(straightLineKm * 1.25 * 10) / 10;

  // Validate operational delivery range geofence
  if (straightLineKm > maxDeliveryRadiusKm) {
    return {
      distanceKm: straightLineKm,
      roadDistanceKm,
      fee: 0,
      isDeliverable: false,
      isFreeDelivery: false,
      reason: `Location is ${straightLineKm} km away, which exceeds our maximum delivery range of ${maxDeliveryRadiusKm} km.`,
      estimatedEtaMinutes: { min: 0, max: 0, formatted: "Out of delivery area" },
    };
  }

  // Check free delivery threshold (eligible for orders >= freeDeliveryThreshold within 5 km)
  if (subtotal >= freeDeliveryThreshold && straightLineKm <= 5) {
    const travelTime = (roadDistanceKm / 25) * 60; // 25 km/h avg rider speed
    const minMinutes = Math.round(15 + travelTime); // 15 mins prep time
    return {
      distanceKm: straightLineKm,
      roadDistanceKm,
      fee: 0,
      isDeliverable: true,
      isFreeDelivery: true,
      reason: "Free Delivery unlocked!",
      estimatedEtaMinutes: { min: minMinutes, max: minMinutes + 10, formatted: `${minMinutes} - ${minMinutes + 10} mins` },
    };
  }

  // Calculate dynamic tiered fee based on delivered kilometers
  let calculatedFee = baseFee;
  if (roadDistanceKm > baseRadiusKm) {
    const extraKm = Math.ceil(roadDistanceKm - baseRadiusKm);
    calculatedFee += extraKm * perKmRate;
  }

  const travelTime = (roadDistanceKm / 25) * 60;
  const minMinutes = Math.round(15 + travelTime);

  return {
    distanceKm: straightLineKm,
    roadDistanceKm,
    fee: Math.round(calculatedFee),
    isDeliverable: true,
    isFreeDelivery: false,
    estimatedEtaMinutes: { min: minMinutes, max: minMinutes + 10, formatted: `${minMinutes} - ${minMinutes + 10} mins` },
  };
}
