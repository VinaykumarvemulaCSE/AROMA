// src/lib/route-deviation.ts
// Route deviation detection and alternative route suggestions

import {
  type DeliveryNode,
  buildRoadNetworkGraph,
  dijkstraShortestPath,
  type DijkstraResult,
} from "@/lib/dsa/routing";
import { calculateHaversineDistance } from "@/lib/location";

export type AlternativeRoute = {
  id: string;
  name: string;
  path: string[];
  totalDistanceKm: number;
  estimatedMinutes: number;
  trafficFactor: number;
  recommendation: string;
};

/**
 * Detect if rider has deviated from planned route
 */
export function detectRouteDeviation(
  plannedPath: { lat: number; lng: number }[],
  currentPosition: { lat: number; lng: number },
  nextWaypointIndex: number,
  thresholdMeters: number = 500
): {
  isDeviated: boolean;
  deviationMeters: number;
  shouldReroute: boolean;
} {
  if (plannedPath.length === 0 || nextWaypointIndex >= plannedPath.length) {
    return { isDeviated: false, deviationMeters: 0, shouldReroute: false };
  }

  const nextWaypoint = plannedPath[nextWaypointIndex];
  const deviationKm = calculateHaversineDistance(
    currentPosition.lat,
    currentPosition.lng,
    nextWaypoint.lat,
    nextWaypoint.lng
  );

  const deviationMeters = deviationKm * 1000;
  const isDeviated = deviationMeters > thresholdMeters;

  return {
    isDeviated,
    deviationMeters,
    shouldReroute: isDeviated && deviationMeters > thresholdMeters * 2, // Reroute if 2x threshold
  };
}

/**
 * Generate alternative routes with different traffic factors
 */
export function generateAlternativeRoutes(
  storeLat: number,
  storeLng: number,
  customerLat: number,
  customerLng: number,
  currentTrafficMultiplier: number = 1.0
): AlternativeRoute[] {
  const alternatives: AlternativeRoute[] = [];

  // Generate routes with different traffic scenarios
  const trafficScenarios = [
    { factor: 0.8, name: "Fast Route (Light Traffic)" },
    { factor: 1.0, name: "Standard Route" },
    { factor: 1.2, name: "Conservative Route (Heavy Traffic)" },
    { factor: 1.5, name: "Safe Route (Very Heavy Traffic)" },
  ];

  trafficScenarios.forEach((scenario, index) => {
    const graph = buildRoadNetworkGraph(
      storeLat,
      storeLng,
      customerLat,
      customerLng,
      scenario.factor
    );

    const result = dijkstraShortestPath(graph, "cafe", "customer");

    const estimatedMinutes = result.totalEstimatedMinutes * scenario.factor;

    let recommendation = "";
    if (scenario.factor < currentTrafficMultiplier) {
      recommendation = "Faster than current conditions";
    } else if (scenario.factor > currentTrafficMultiplier) {
      recommendation = "Slower but more reliable";
    } else {
      recommendation = "Matches current conditions";
    }

    alternatives.push({
      id: `route-${index}`,
      name: scenario.name,
      path: result.path.map((node) => node.name),
      totalDistanceKm: result.totalDistanceKm,
      estimatedMinutes: Math.round(estimatedMinutes),
      trafficFactor: scenario.factor,
      recommendation,
    });
  });

  // Sort by estimated time
  alternatives.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);

  return alternatives;
}

/**
 * Compare two routes and return comparison metrics
 */
export function compareRoutes(
  routeA: AlternativeRoute,
  routeB: AlternativeRoute
): {
  timeDifferenceMinutes: number;
  distanceDifferenceKm: number;
  recommendedRoute: "A" | "B" | "equal";
  reason: string;
} {
  const timeDiff = routeA.estimatedMinutes - routeB.estimatedMinutes;
  const distanceDiff = routeA.totalDistanceKm - routeB.totalDistanceKm;

  let recommended: "A" | "B" | "equal" = "equal";
  let reason = "Both routes are equivalent";

  if (Math.abs(timeDiff) > 5) {
    // More than 5 minutes difference
    recommended = timeDiff < 0 ? "A" : "B";
    reason = `${Math.abs(timeDiff)} minutes faster`;
  } else if (Math.abs(distanceDiff) > 1) {
    // More than 1km difference
    recommended = distanceDiff < 0 ? "A" : "B";
    reason = `${Math.abs(distanceDiff).toFixed(1)} km shorter`;
  }

  return {
    timeDifferenceMinutes: timeDiff,
    distanceDifferenceKm: distanceDiff,
    recommendedRoute: recommended,
    reason,
  };
}
