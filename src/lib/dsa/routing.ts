// src/lib/dsa/routing.ts
// Core Data Structures & Algorithms (DSA) Engine for Aroma Cafe Smart Delivery & Navigation.

import { calculateHaversineDistance } from "@/lib/location";

export type DeliveryNode = {
  id: string;
  orderId?: string;
  customerName?: string;
  phone?: string;
  address: string;
  lat: number;
  lng: number;
  prepTimeMinutes?: number;
};

/**
 * 🚲 Rider Availability State Machine (Submodule 1)
 */
export type RiderAvailabilityStatus = "OFFLINE" | "AVAILABLE" | "ON_DELIVERY" | "UNAVAILABLE";

export type RiderProfile = {
  id: string;
  name: string;
  phone: string;
  pin?: string;
  currentLat: number;
  currentLng: number;
  isOnline: boolean;
  availability: RiderAvailabilityStatus;
  status: "idle" | "en_route" | "busy" | "offline";
  activeOrdersCount: number;
  batteryLevel?: number;
  vehicleType?: "bike" | "scooter" | "bicycle";
  todayDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
};

/**
 * 📦 Explicit Delivery State Machine (Submodule 6)
 * Primary Flow: ASSIGNED -> ACCEPTED -> PICKED_UP -> IN_TRANSIT -> ARRIVING -> DELIVERED
 * Failure Paths: REJECTED -> REASSIGN_RIDER | DELIVERY_FAILED -> RETRY_OR_RETURN
 */
export type DeliveryState =
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "ARRIVING"
  | "DELIVERED"
  | "REJECTED"
  | "DELIVERY_FAILED";

export type RouteLegDetail = {
  fromNode: DeliveryNode;
  toNode: DeliveryNode;
  distanceKm: number;
  durationMins: number;
};

export type RouteOptimizationResult = {
  routeSequence: DeliveryNode[];
  totalDistanceKm: number;
  totalRoadDistanceKm: number;
  unoptimizedRoadDistanceKm: number;
  totalEstimatedMinutes: number;
  fuelSavedPercentage: number;
  fuelSavedLitres: number;
  co2SavedKg: number;
  stopsCount: number;
  legs: RouteLegDetail[];
};

/**
 * 🗺️ Weighted Graph & Dijkstra Shortest-Path Algorithm Structures (Submodule 4)
 */
export type GraphNode = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  distanceKm: number;
  weight: number; // Weighted by distance & traffic congestion
};

export type WeightedGraph = {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
};

export type DijkstraResult = {
  path: GraphNode[];
  totalDistanceKm: number;
  totalEstimatedMinutes: number;
  alternativeRoutePath?: GraphNode[];
};

const ROAD_DETOUR_FACTOR = 1.25;
const AVERAGE_RIDER_SPEED_KMPH = 25;

export function getEdgeWeight(
  nodeA: { lat: number; lng: number },
  nodeB: { lat: number; lng: number },
  trafficMultiplier = 1.0
): number {
  const straightLine = calculateHaversineDistance(nodeA.lat, nodeA.lng, nodeB.lat, nodeB.lng);
  return straightLine * ROAD_DETOUR_FACTOR * trafficMultiplier;
}

export function calculateRouteCost(storeNode: DeliveryNode, nodesSequence: DeliveryNode[]): number {
  if (nodesSequence.length === 0) return 0;
  let total = getEdgeWeight(storeNode, nodesSequence[0]);

  for (let i = 0; i < nodesSequence.length - 1; i++) {
    total += getEdgeWeight(nodesSequence[i], nodesSequence[i + 1]);
  }

  return Math.round(total * 10) / 10;
}

function twoOptSwap(route: DeliveryNode[], i: number, k: number): DeliveryNode[] {
  const newRoute = route.slice(0, i);
  const reversedSegment = route.slice(i, k + 1).reverse();
  const rest = route.slice(k + 1);
  return [...newRoute, ...reversedSegment, ...rest];
}

/**
 * 🚲 TSP (Traveling Salesperson Problem) Route Optimization Engine with 2-Opt Local Search Heuristic.
 * Evaluates greedy nearest-neighbor tour against unoptimized round-trips and refines intersections.
 */
export function optimizeDeliveryRoute(
  storeNode: DeliveryNode,
  deliveryNodes: DeliveryNode[]
): RouteOptimizationResult {
  // Input validation
  if (!storeNode || !storeNode.lat || !storeNode.lng) {
    console.error("Invalid store node provided to optimizeDeliveryRoute");
    return {
      routeSequence: [],
      totalDistanceKm: 0,
      totalRoadDistanceKm: 0,
      unoptimizedRoadDistanceKm: 0,
      totalEstimatedMinutes: 0,
      fuelSavedPercentage: 0,
      fuelSavedLitres: 0,
      co2SavedKg: 0,
      stopsCount: 0,
      legs: [],
    };
  }

  if (!deliveryNodes || deliveryNodes.length === 0) {
    return {
      routeSequence: [storeNode],
      totalDistanceKm: 0,
      totalRoadDistanceKm: 0,
      unoptimizedRoadDistanceKm: 0,
      totalEstimatedMinutes: 0,
      fuelSavedPercentage: 0,
      fuelSavedLitres: 0,
      co2SavedKg: 0,
      stopsCount: 0,
      legs: [],
    };
  }

  // Validate delivery nodes
  const validNodes = deliveryNodes.filter(
    (node) => node && node.lat && node.lng && !isNaN(node.lat) && !isNaN(node.lng)
  );

  if (validNodes.length === 0) {
    console.error("No valid delivery nodes provided");
    return {
      routeSequence: [storeNode],
      totalDistanceKm: 0,
      totalRoadDistanceKm: 0,
      unoptimizedRoadDistanceKm: 0,
      totalEstimatedMinutes: 0,
      fuelSavedPercentage: 0,
      fuelSavedLitres: 0,
      co2SavedKg: 0,
      stopsCount: 0,
      legs: [],
    };
  }

  // Unoptimized cost: sum of independent round-trips Store -> Drop_i -> Store
  const unoptimizedCost = validNodes.reduce((sum, n) => sum + getEdgeWeight(storeNode, n) * 2, 0);

  if (validNodes.length === 1) {
    const roadDist = getEdgeWeight(storeNode, validNodes[0]);
    const straightDist = calculateHaversineDistance(
      storeNode.lat,
      storeNode.lng,
      validNodes[0].lat,
      validNodes[0].lng
    );
    const travelMins = Math.round((roadDist / AVERAGE_RIDER_SPEED_KMPH) * 60);
    const prepMins = validNodes[0].prepTimeMinutes ?? 15;

    return {
      routeSequence: [storeNode, validNodes[0]],
      totalDistanceKm: straightDist,
      totalRoadDistanceKm: Math.round(roadDist * 10) / 10,
      unoptimizedRoadDistanceKm: Math.round(roadDist * 10) / 10,
      totalEstimatedMinutes: prepMins + travelMins,
      fuelSavedPercentage: 0,
      fuelSavedLitres: 0,
      co2SavedKg: 0,
      stopsCount: 1,
      legs: [
        {
          fromNode: storeNode,
          toNode: validNodes[0],
          distanceKm: Math.round(roadDist * 10) / 10,
          durationMins: travelMins,
        },
      ],
    };
  }

  // Step 1: Nearest-Neighbor Heuristic (Greedy tour construction)
  const unvisited = [...validNodes];
  let currentPos: { lat: number; lng: number } = { lat: storeNode.lat, lng: storeNode.lng };
  const initialRoute: DeliveryNode[] = [];

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = getEdgeWeight(currentPos, unvisited[i]);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nextNode = unvisited.splice(nearestIdx, 1)[0];
    initialRoute.push(nextNode);
    currentPos = { lat: nextNode.lat, lng: nextNode.lng };
  }

  // Step 2: 2-Opt Local Search (Refines path by removing crossing edges)
  let bestRoute = [...initialRoute];
  let bestCost = calculateRouteCost(storeNode, bestRoute);
  let improved = true;
  let iterations = 0;
  const maxIterations = 50;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;
    for (let i = 0; i < bestRoute.length - 1; i++) {
      for (let k = i + 1; k < bestRoute.length; k++) {
        const candidateRoute = twoOptSwap(bestRoute, i, k);
        const newCost = calculateRouteCost(storeNode, candidateRoute);

        if (newCost < bestCost - 0.01) {
          bestCost = newCost;
          bestRoute = candidateRoute;
          improved = true;
        }
      }
    }
  }

  // Calculate Fuel & CO2 Savings (assuming ~35 km/L for delivery bikes)
  const kmSaved = Math.max(0, unoptimizedCost - bestCost);
  const fuelSavedPct =
    unoptimizedCost > 0 ? Math.max(0, Math.min(85, Math.round((kmSaved / unoptimizedCost) * 100))) : 0;
  const fuelSavedLitres = Math.round((kmSaved / 35) * 100) / 100;
  const co2SavedKg = Math.round(fuelSavedLitres * 2.31 * 100) / 100;

  const totalTravelMins = Math.round((bestCost / AVERAGE_RIDER_SPEED_KMPH) * 60);
  const maxPrepTime = Math.max(...bestRoute.map((n) => n.prepTimeMinutes ?? 15));
  const totalEtaMinutes = maxPrepTime + totalTravelMins;

  // Build sequential leg details
  const fullSeq = [storeNode, ...bestRoute];
  const legs: RouteLegDetail[] = [];
  for (let i = 0; i < fullSeq.length - 1; i++) {
    const fromN = fullSeq[i];
    const toN = fullSeq[i + 1];
    const dist = Math.round(getEdgeWeight(fromN, toN) * 10) / 10;
    const dur = Math.max(1, Math.round((dist / AVERAGE_RIDER_SPEED_KMPH) * 60));
    legs.push({
      fromNode: fromN,
      toNode: toN,
      distanceKm: dist,
      durationMins: dur,
    });
  }

  return {
    routeSequence: fullSeq,
    totalDistanceKm: Math.round((bestCost / ROAD_DETOUR_FACTOR) * 10) / 10,
    totalRoadDistanceKm: Math.round(bestCost * 10) / 10,
    unoptimizedRoadDistanceKm: Math.round(unoptimizedCost * 10) / 10,
    totalEstimatedMinutes: totalEtaMinutes,
    fuelSavedPercentage: fuelSavedPct,
    fuelSavedLitres,
    co2SavedKg,
    stopsCount: bestRoute.length,
    legs,
  };
}

/**
 * ⚡ Dijkstra's Algorithm for Shortest-Path Calculation on Road Graphs.
 * Graph Representation: Nodes (Locations/Junctions), Edges (Roads weighted by Distance & Traffic).
 */
export function dijkstraShortestPath(
  graph: WeightedGraph,
  startNodeId: string,
  targetNodeId: string
): DijkstraResult {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisitedNodes = new Set<string>();

  Object.keys(graph.nodes).forEach((nodeId) => {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    unvisitedNodes.add(nodeId);
  });

  distances[startNodeId] = 0;

  while (unvisitedNodes.size > 0) {
    let smallestNode: string | null = null;
    let smallestDist = Infinity;

    unvisitedNodes.forEach((nodeId) => {
      if (distances[nodeId] < smallestDist) {
        smallestDist = distances[nodeId];
        smallestNode = nodeId;
      }
    });

    if (!smallestNode || smallestDist === Infinity || smallestNode === targetNodeId) {
      break;
    }

    unvisitedNodes.delete(smallestNode);

    const currentNodeId = smallestNode;
    const neighborEdges = graph.edges.filter((e) => e.from === currentNodeId);

    for (const edge of neighborEdges) {
      if (!unvisitedNodes.has(edge.to)) continue;

      const alt = distances[currentNodeId] + edge.weight;
      if (alt < distances[edge.to]) {
        distances[edge.to] = alt;
        previous[edge.to] = currentNodeId;
      }
    }
  }

  const pathNodes: GraphNode[] = [];
  let curr: string | null = targetNodeId;
  while (curr) {
    if (graph.nodes[curr]) {
      pathNodes.unshift(graph.nodes[curr]);
    }
    curr = previous[curr];
  }

  const totalDist = Math.round(distances[targetNodeId] * 10) / 10;
  const travelMins = Math.round((totalDist / AVERAGE_RIDER_SPEED_KMPH) * 60);

  return {
    path: pathNodes.length > 0 ? pathNodes : [graph.nodes[startNodeId], graph.nodes[targetNodeId]],
    totalDistanceKm: isFinite(totalDist) ? totalDist : 0,
    totalEstimatedMinutes: travelMins,
  };
}

/**
 * Helper to construct a synthetic road graph between Cafe HQ, Road Junctions (A, B, C), and Customer Pin.
 * Includes traffic multiplier for dynamic routing.
 */
export function buildRoadNetworkGraph(
  cafeLat: number,
  cafeLng: number,
  customerLat: number,
  customerLng: number,
  trafficMultiplier: number = 1.0
): WeightedGraph {
  const midLat = (cafeLat + customerLat) / 2;
  const midLng = (cafeLng + customerLng) / 2;

  const nodes: Record<string, GraphNode> = {
    cafe: { id: "cafe", name: "Aroma Cafe HQ", lat: cafeLat, lng: cafeLng },
    junction_A: { id: "junction_A", name: "Junction A (Main Road)", lat: midLat + 0.002, lng: midLng - 0.002 },
    junction_B: { id: "junction_B", name: "Junction B (Bypass Rd)", lat: midLat - 0.002, lng: midLng + 0.002 },
    junction_C: { id: "junction_C", name: "Junction C (Highway)", lat: midLat + 0.004, lng: midLng + 0.004 },
    customer: { id: "customer", name: "Customer Drop Location", lat: customerLat, lng: customerLng },
  };

  // Apply traffic multiplier to edge weights
  const distCafeToA = getEdgeWeight(nodes.cafe, nodes.junction_A, trafficMultiplier);
  const distAToCust = getEdgeWeight(nodes.junction_A, nodes.customer, trafficMultiplier);
  const distCafeToB = getEdgeWeight(nodes.cafe, nodes.junction_B, trafficMultiplier * 1.15); // Heavier traffic on B
  const distBToCust = getEdgeWeight(nodes.junction_B, nodes.customer, trafficMultiplier);
  const distCafeToC = getEdgeWeight(nodes.cafe, nodes.junction_C, trafficMultiplier * 0.8); // Lighter traffic on C
  const distCToCust = getEdgeWeight(nodes.junction_C, nodes.customer, trafficMultiplier * 0.9);

  const edges: GraphEdge[] = [
    { from: "cafe", to: "junction_A", distanceKm: distCafeToA / trafficMultiplier, weight: distCafeToA },
    { from: "junction_A", to: "customer", distanceKm: distAToCust / trafficMultiplier, weight: distAToCust },
    { from: "cafe", to: "junction_B", distanceKm: distCafeToB / (trafficMultiplier * 1.15), weight: distCafeToB },
    { from: "junction_B", to: "customer", distanceKm: distBToCust / trafficMultiplier, weight: distBToCust },
    { from: "cafe", to: "junction_C", distanceKm: distCafeToC / (trafficMultiplier * 0.8), weight: distCafeToC },
    { from: "junction_C", to: "customer", distanceKm: distCToCust / (trafficMultiplier * 0.9), weight: distCToCust },
  ];

  return { nodes, edges };
}

/**
 * ⚡ Rider Assignment Scoring Algorithm.
 */
export function findBestRiderForOrder(
  storeNode: { lat: number; lng: number },
  activeRiders: RiderProfile[]
): { bestRider: RiderProfile | null; matchScore: number; reason: string } {
  const availableRiders = activeRiders.filter(
    (r) => r.isOnline && (r.availability === "AVAILABLE" || r.status === "idle")
  );

  if (!availableRiders.length) {
    return {
      bestRider: null,
      matchScore: 0,
      reason: "No active riders currently available.",
    };
  }

  let bestRider: RiderProfile | null = null;
  let highestScore = -Infinity;

  for (const rider of availableRiders) {
    const distToStore = calculateHaversineDistance(
      rider.currentLat,
      rider.currentLng,
      storeNode.lat,
      storeNode.lng
    );

    let score = 100 - distToStore * 5 - rider.activeOrdersCount * 25;
    if (rider.availability === "AVAILABLE") score += 15;
    if (rider.batteryLevel !== undefined && rider.batteryLevel < 20) score -= 40;

    if (score > highestScore) {
      highestScore = score;
      bestRider = rider;
    }
  }

  return {
    bestRider,
    matchScore: Math.max(0, Math.round(highestScore)),
    reason: bestRider
      ? `Assigned rider ${bestRider.name} (Score: ${Math.max(0, Math.round(highestScore))})`
      : "No suitable rider matched.",
  };
}

export function shouldTriggerReroute(
  lastRiderPos: { lat: number; lng: number },
  currentRiderPos: { lat: number; lng: number },
  nextStopNode: DeliveryNode,
  thresholdMeters = 500
): boolean {
  const deviationKm = calculateHaversineDistance(
    currentRiderPos.lat,
    currentRiderPos.lng,
    nextStopNode.lat,
    nextStopNode.lng
  );

  const prevDistance = calculateHaversineDistance(
    lastRiderPos.lat,
    lastRiderPos.lng,
    nextStopNode.lat,
    nextStopNode.lng
  );

  return (deviationKm - prevDistance) * 1000 > thresholdMeters;
}

export type GreedyMatchResult = {
  orderId: string;
  riderId: string;
  riderName: string;
  pickupToDropKm: number;
  riderToStoreKm: number;
  totalTripKm: number;
};

/**
 * 🧠 GREEDY ALGORITHM: Optimal Rider & Drop Point Matching Engine.
 * 
 * Greedy Choice Property:
 * At each step, greedily selects the (Order, Rider) pair that minimizes local incremental trip distance
 * and active workload penalty.
 */
export function greedyDispatchRiders(
  storeNode: { lat: number; lng: number },
  unassignedOrders: Array<{
    id: string;
    customerName: string;
    customerPhone: string;
    address: string;
    lat: number;
    lng: number;
  }>,
  riders: RiderProfile[]
): GreedyMatchResult[] {
  const availableRiders = riders.filter(
    (r) => r.isOnline && (r.availability === "AVAILABLE" || r.status === "idle")
  );

  if (!availableRiders.length || !unassignedOrders.length) {
    return [];
  }

  const results: GreedyMatchResult[] = [];
  const remainingOrders = [...unassignedOrders];
  const riderLoads: Record<string, number> = {};
  const riderPositions: Record<string, { lat: number; lng: number }> = {};

  availableRiders.forEach((r) => {
    riderLoads[r.id] = r.activeOrdersCount;
    riderPositions[r.id] = { lat: r.currentLat, lng: r.currentLng };
  });

  while (remainingOrders.length > 0 && availableRiders.length > 0) {
    let bestOrderIdx = -1;
    let bestRiderId = "";
    let minGreedyCost = Infinity;
    let bestPickupToDropKm = 0;
    let bestRiderToStoreKm = 0;

    for (let i = 0; i < remainingOrders.length; i++) {
      const order = remainingOrders[i];

      for (const rider of availableRiders) {
        const riderPos = riderPositions[rider.id];
        const riderToStoreKm = calculateHaversineDistance(
          riderPos.lat,
          riderPos.lng,
          storeNode.lat,
          storeNode.lng
        );

        const storeToDropKm = calculateHaversineDistance(
          storeNode.lat,
          storeNode.lng,
          order.lat,
          order.lng
        );

        // Greedy Cost Function = Rider-to-Store Distance + Store-to-Drop Distance + Workload Penalty
        const currentLoad = riderLoads[rider.id] || 0;
        const greedyCost = riderToStoreKm * 1.5 + storeToDropKm + currentLoad * 3.0;

        if (greedyCost < minGreedyCost) {
          minGreedyCost = greedyCost;
          bestOrderIdx = i;
          bestRiderId = rider.id;
          bestPickupToDropKm = storeToDropKm;
          bestRiderToStoreKm = riderToStoreKm;
        }
      }
    }

    if (bestOrderIdx === -1 || !bestRiderId) break;

    const matchedOrder = remainingOrders.splice(bestOrderIdx, 1)[0];
    const matchedRider = availableRiders.find((r) => r.id === bestRiderId)!;

    riderLoads[bestRiderId] = (riderLoads[bestRiderId] || 0) + 1;
    riderPositions[bestRiderId] = { lat: matchedOrder.lat, lng: matchedOrder.lng };

    results.push({
      orderId: matchedOrder.id,
      riderId: matchedRider.id,
      riderName: matchedRider.name,
      pickupToDropKm: bestPickupToDropKm,
      riderToStoreKm: bestRiderToStoreKm,
      totalTripKm: Math.round((bestRiderToStoreKm + bestPickupToDropKm) * 10) / 10,
    });
  }

  return results;
}

/**
 * 🧭 Turn-by-Turn Maneuver Navigation Types & Physics Calculation
 */
export type TurnDirection =
  | "straight"
  | "left"
  | "right"
  | "slight_left"
  | "slight_right"
  | "sharp_left"
  | "sharp_right"
  | "uturn"
  | "roundabout"
  | "arrive"
  | "depart"
  | "fork"
  | "merge"
  | "ramp";

export type ManeuverInstruction = {
  stepIndex: number;
  direction: TurnDirection;
  instruction: string;
  streetName: string;
  distanceMeters: number;
  durationSeconds: number;
  fromCoords: { lat: number; lng: number };
  toCoords: { lat: number; lng: number };
  audioPrompt: string;
  exitNumber?: number;
  nextPreview?: string;
};

export type DualLegEtaResult = {
  leg1RiderToCafe: {
    distanceKm: number;
    durationMins: number;
    etaTimestamp: string;
    prepTimeRemainingMins: number;
    isFoodReady: boolean;
  };
  leg2CafeToCustomer: {
    distanceKm: number;
    durationMins: number;
    etaTimestamp: string;
  };
  totalTrip: {
    totalDistanceKm: number;
    totalDurationMins: number;
    finalDeliveryTimestamp: string;
  };
};

/**
 * Calculates compass bearing (heading angle 0-360 deg) between two coordinate points
 */
export function calculateCompassBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));

  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

function formatClockTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

/**
 * ⏱️ Dual-Leg Estimated Time Analysis (ETA) Engine
 * Calculates:
 * 1. Leg 1: Rider -> Cafe (Transit + Kitchen Prep sync)
 * 2. Leg 2: Cafe -> Customer (Transit + Handover)
 */
export async function calculateDualLegEta(
  riderCoords: { lat: number; lng: number },
  cafeCoords: { lat: number; lng: number },
  customerCoords: { lat: number; lng: number },
  kitchenPrepMinutes: number = 10,
  orderPlacedAtTimestamp?: number,
  trafficMultiplier: number = 1.0
): Promise<DualLegEtaResult> {
  const now = Date.now();
  const elapsedPrepMins = orderPlacedAtTimestamp
    ? Math.max(0, Math.floor((now - orderPlacedAtTimestamp) / 60000))
    : 0;
  const remainingPrepMins = Math.max(0, kitchenPrepMinutes - elapsedPrepMins);

  // Compute Leg 1 (Rider -> Cafe) with traffic scaling
  const riderToCafeDistKm = calculateHaversineDistance(
    riderCoords.lat,
    riderCoords.lng,
    cafeCoords.lat,
    cafeCoords.lng
  );
  const roadDetourLeg1 = Math.round(riderToCafeDistKm * ROAD_DETOUR_FACTOR * 10) / 10;
  const leg1TransitMins = Math.max(
    1,
    Math.round(((roadDetourLeg1 * trafficMultiplier) / AVERAGE_RIDER_SPEED_KMPH) * 60)
  );

  // If kitchen prep takes longer than rider transit, rider will wait at cafe
  const effectiveLeg1Mins = Math.max(leg1TransitMins, remainingPrepMins);
  const cafeArrivalDate = new Date(now + effectiveLeg1Mins * 60000);

  // Compute Leg 2 (Cafe -> Customer) with traffic scaling
  const cafeToCustDistKm = calculateHaversineDistance(
    cafeCoords.lat,
    cafeCoords.lng,
    customerCoords.lat,
    customerCoords.lng
  );
  const roadDetourLeg2 = Math.round(cafeToCustDistKm * ROAD_DETOUR_FACTOR * 10) / 10;
  const leg2TransitMins = Math.max(
    2,
    Math.round(((roadDetourLeg2 * trafficMultiplier) / AVERAGE_RIDER_SPEED_KMPH) * 60)
  );

  // Handover buffer at Cafe (packaging & checking order)
  const cafeHandoverBufferMins = 2;
  const totalMins = effectiveLeg1Mins + cafeHandoverBufferMins + leg2TransitMins;
  const customerArrivalDate = new Date(now + totalMins * 60000);

  return {
    leg1RiderToCafe: {
      distanceKm: roadDetourLeg1,
      durationMins: effectiveLeg1Mins,
      etaTimestamp: formatClockTime(cafeArrivalDate),
      prepTimeRemainingMins: remainingPrepMins,
      isFoodReady: remainingPrepMins <= 0,
    },
    leg2CafeToCustomer: {
      distanceKm: roadDetourLeg2,
      durationMins: leg2TransitMins,
      etaTimestamp: formatClockTime(customerArrivalDate),
    },
    totalTrip: {
      totalDistanceKm: Math.round((roadDetourLeg1 + roadDetourLeg2) * 10) / 10,
      totalDurationMins: totalMins,
      finalDeliveryTimestamp: formatClockTime(customerArrivalDate),
    },
  };
}

/**
 * Natural language parser for OSRM raw step maneuvers to generate human-grade GPS directions
 */
function parseOsrmStepToManeuver(
  step: any,
  idx: number,
  isFirst: boolean,
  isLast: boolean,
  destinationLabel: string,
  start: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): ManeuverInstruction {
  const m = step.maneuver || {};
  const type: string = m.type || "straight";
  const modifier: string = m.modifier || "";
  const streetName: string = step.name || step.ref || "Main Road";
  const distMeters = Math.max(10, Math.round(step.distance || 40));
  const durationSeconds = Math.max(3, Math.round(step.duration || 8));

  let direction: TurnDirection = "straight";
  let instruction = `Continue on ${streetName}`;
  let audioPrompt = `In ${distMeters} meters, continue on ${streetName}`;
  let exitNumber: number | undefined = undefined;

  if (isFirst || type === "depart") {
    direction = "depart";
    instruction = `Head ${modifier ? modifier + " " : ""}on ${streetName}`;
    audioPrompt = `Start route. Head on ${streetName} for ${distMeters} meters.`;
  } else if (isLast || type === "arrive") {
    direction = "arrive";
    const side = modifier.includes("left") ? " on the left" : modifier.includes("right") ? " on the right" : "";
    instruction = `Arrive at ${destinationLabel}${side}`;
    audioPrompt = `You have arrived at ${destinationLabel}${side}.`;
  } else if (type === "roundabout" || type === "rotary" || type === "roundabout turn") {
    direction = "roundabout";
    exitNumber = m.exit || 1;
    instruction = `At the roundabout, take exit ${exitNumber} onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, at the roundabout, take the ${exitNumber}${getOrdinalSuffix(exitNumber ?? 1)} exit onto ${streetName}.`;
  } else if (type === "fork") {
    direction = "fork";
    const forkSide = modifier.includes("left") ? "left" : "right";
    instruction = `At the fork, keep ${forkSide} onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, keep ${forkSide} at the fork onto ${streetName}.`;
  } else if (type === "merge") {
    direction = "merge";
    instruction = `Merge onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, merge onto ${streetName}.`;
  } else if (type === "ramp" || type === "on ramp" || type === "off ramp") {
    direction = "ramp";
    instruction = `Take the ramp onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, take the ramp onto ${streetName}.`;
  } else if (modifier.includes("uturn")) {
    direction = "uturn";
    instruction = `Make a U-turn onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, make a U-turn onto ${streetName}.`;
  } else if (modifier.includes("sharp right")) {
    direction = "sharp_right";
    instruction = `Turn sharp right onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, turn sharp right onto ${streetName}.`;
  } else if (modifier.includes("sharp left")) {
    direction = "sharp_left";
    instruction = `Turn sharp left onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, turn sharp left onto ${streetName}.`;
  } else if (modifier.includes("slight right")) {
    direction = "slight_right";
    instruction = `Slight right onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, take a slight right onto ${streetName}.`;
  } else if (modifier.includes("slight left")) {
    direction = "slight_left";
    instruction = `Slight left onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, take a slight left onto ${streetName}.`;
  } else if (modifier.includes("right")) {
    direction = "right";
    instruction = `Turn right onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, turn right onto ${streetName}.`;
  } else if (modifier.includes("left")) {
    direction = "left";
    instruction = `Turn left onto ${streetName}`;
    audioPrompt = `In ${distMeters} meters, turn left onto ${streetName}.`;
  } else {
    direction = "straight";
    instruction = `Continue straight on ${streetName}`;
    audioPrompt = `In ${distMeters} meters, continue straight on ${streetName}.`;
  }

  return {
    stepIndex: idx,
    direction,
    instruction,
    streetName,
    distanceMeters: distMeters,
    durationSeconds,
    fromCoords: {
      lat: m.location?.[1] || start.lat,
      lng: m.location?.[0] || start.lng,
    },
    toCoords: {
      lat: destination.lat,
      lng: destination.lng,
    },
    audioPrompt,
    exitNumber,
  };
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Generates algorithmic turn-by-turn maneuvers from a coordinate path using vector angle deviations
 */
export function generateTurnByTurnManeuvers(
  path: Array<{ lat: number; lng: number; name?: string }>,
  destinationLabel: string = "Destination"
): ManeuverInstruction[] {
  if (!path || path.length < 2) return [];

  const maneuvers: ManeuverInstruction[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];

    const distKm = calculateHaversineDistance(current.lat, current.lng, next.lat, next.lng);
    const distMeters = Math.max(15, Math.round(distKm * 1000));
    const durationSeconds = Math.max(5, Math.round((distKm / AVERAGE_RIDER_SPEED_KMPH) * 3600));
    const streetName = next.name || `Road Segment ${i + 1}`;

    let direction: TurnDirection = "straight";
    let instruction = `Continue straight towards ${streetName}`;

    if (i === 0) {
      direction = "depart";
      instruction = `Head towards ${streetName} (${distMeters}m)`;
    } else if (i === path.length - 2) {
      direction = "arrive";
      instruction = `Arrive at ${destinationLabel}`;
    } else {
      const prev = path[i - 1];
      const bearing1 = calculateCompassBearing(prev.lat, prev.lng, current.lat, current.lng);
      const bearing2 = calculateCompassBearing(current.lat, current.lng, next.lat, next.lng);

      let delta = (bearing2 - bearing1 + 360) % 360;
      if (delta > 180) delta -= 360;

      if (delta > 80) {
        direction = "sharp_right";
        instruction = `Turn sharp right onto ${streetName}`;
      } else if (delta > 35) {
        direction = "right";
        instruction = `Turn right onto ${streetName}`;
      } else if (delta > 15) {
        direction = "slight_right";
        instruction = `Slight right onto ${streetName}`;
      } else if (delta < -80) {
        direction = "sharp_left";
        instruction = `Turn sharp left onto ${streetName}`;
      } else if (delta < -35) {
        direction = "left";
        instruction = `Turn left onto ${streetName}`;
      } else if (delta < -15) {
        direction = "slight_left";
        instruction = `Slight left onto ${streetName}`;
      } else {
        direction = "straight";
        instruction = `Continue straight on ${streetName}`;
      }
    }

    const audioPrompt =
      direction === "arrive"
        ? `You have arrived at ${destinationLabel}. Please deliver order.`
        : direction === "depart"
        ? `Start route. Head forward on ${streetName} for ${distMeters} meters.`
        : `In ${distMeters} meters, ${instruction.toLowerCase()}.`;

    maneuvers.push({
      stepIndex: i,
      direction,
      instruction,
      streetName,
      distanceMeters: distMeters,
      durationSeconds,
      fromCoords: { lat: current.lat, lng: current.lng },
      toCoords: { lat: next.lat, lng: next.lng },
      audioPrompt,
    });
  }

  // Attach next preview step
  for (let i = 0; i < maneuvers.length - 1; i++) {
    maneuvers[i].nextPreview = maneuvers[i + 1].instruction;
  }

  return maneuvers;
}

/**
 * Free OpenStreetMap OSRM Live Road Routing with In-Memory DSA Fallback.
 * Requires 0 API keys.
 */
export async function getLiveRoadRoute(
  start: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  destinationLabel = "Customer Location",
  trafficMultiplier: number = 1.0
): Promise<{
  polyline: [number, number][];
  totalDistanceKm: number;
  totalDurationMins: number;
  maneuvers: ManeuverInstruction[];
}> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );

        const steps = route.legs?.[0]?.steps || [];
        const rawManeuvers: ManeuverInstruction[] = steps.map((s: any, idx: number) => {
          const isFirst = idx === 0;
          const isLast = idx === steps.length - 1;
          return parseOsrmStepToManeuver(s, idx, isFirst, isLast, destinationLabel, start, destination);
        });

        // Attach next step preview
        for (let i = 0; i < rawManeuvers.length - 1; i++) {
          rawManeuvers[i].nextPreview = rawManeuvers[i + 1].instruction;
        }

        const validManeuvers = rawManeuvers.length > 0
          ? rawManeuvers
          : generateTurnByTurnManeuvers(coordinates.map((c) => ({ lat: c[0], lng: c[1] })), destinationLabel);

        const durationMins = Math.max(1, Math.round((route.duration / 60) * trafficMultiplier));

        return {
          polyline: coordinates,
          totalDistanceKm: Math.round((route.distance / 1000) * 10) / 10,
          totalDurationMins: durationMins,
          maneuvers: validManeuvers,
        };
      }
    }
  } catch (err) {
    // Silently fall back to DSA Dijkstra
  }

  // DSA Dijkstra Graph Fallback (100% offline & zero external dependency)
  const graph = buildRoadNetworkGraph(start.lat, start.lng, destination.lat, destination.lng, trafficMultiplier);
  const dijkstraResult = dijkstraShortestPath(graph, "cafe", "customer");
  const fallbackCoords: [number, number][] = dijkstraResult.path.map((node) => [node.lat, node.lng]);
  const fallbackManeuvers = generateTurnByTurnManeuvers(dijkstraResult.path, destinationLabel);

  return {
    polyline: fallbackCoords,
    totalDistanceKm: dijkstraResult.totalDistanceKm,
    totalDurationMins: Math.max(1, Math.round(dijkstraResult.totalEstimatedMinutes * trafficMultiplier)),
    maneuvers: fallbackManeuvers,
  };
}

export type MultiStopWaypoint = {
  lat: number;
  lng: number;
  label: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  isStore?: boolean;
};

export type MultiStopLeg = {
  legIndex: number;
  fromLabel: string;
  toLabel: string;
  orderId?: string;
  distanceKm: number;
  durationMins: number;
  polyline: [number, number][];
  maneuvers: ManeuverInstruction[];
};

export type MultiStopRoadResult = {
  polyline: [number, number][];
  legs: MultiStopLeg[];
  totalDistanceKm: number;
  totalDurationMins: number;
  allManeuvers: ManeuverInstruction[];
  fuelSavedPercentage: number;
  fuelSavedLitres: number;
  co2SavedKg: number;
};

/**
 * 🚀 Multi-Stop OSRM Road Route Engine with Sequential DSA Fallback.
 * Traverses an ordered TSP route sequence across multiple delivery drop points.
 */
export async function getMultiStopRoadRoute(
  stops: MultiStopWaypoint[],
  trafficMultiplier: number = 1.0
): Promise<MultiStopRoadResult> {
  if (!stops || stops.length < 2) {
    return {
      polyline: [],
      legs: [],
      totalDistanceKm: 0,
      totalDurationMins: 0,
      allManeuvers: [],
      fuelSavedPercentage: 0,
      fuelSavedLitres: 0,
      co2SavedKg: 0,
    };
  }

  // Attempt batch OSRM multi-waypoint query
  try {
    const coordsParam = stops.map((s) => `${s.lng},${s.lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson&steps=true`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );

        const legs: MultiStopLeg[] = [];
        const allManeuvers: ManeuverInstruction[] = [];
        let runningStepIdx = 0;

        (route.legs || []).forEach((osrmLeg: any, legIdx: number) => {
          const fromStop = stops[legIdx];
          const toStop = stops[legIdx + 1];
          const legSteps = osrmLeg.steps || [];

          const legManeuvers: ManeuverInstruction[] = legSteps.map((s: any, stepI: number) => {
            const isFirst = stepI === 0;
            const isLast = stepI === legSteps.length - 1;
            const m = parseOsrmStepToManeuver(
              s,
              runningStepIdx++,
              isFirst,
              isLast,
              toStop?.label || `Stop ${legIdx + 1}`,
              fromStop,
              toStop
            );
            return m;
          });

          // Attach leg preview
          for (let k = 0; k < legManeuvers.length - 1; k++) {
            legManeuvers[k].nextPreview = legManeuvers[k + 1].instruction;
          }

          legs.push({
            legIndex: legIdx,
            fromLabel: fromStop?.label || `Origin`,
            toLabel: toStop?.label || `Stop ${legIdx + 1}`,
            orderId: toStop?.orderId,
            distanceKm: Math.round((osrmLeg.distance / 1000) * 10) / 10,
            durationMins: Math.max(1, Math.round(((osrmLeg.duration / 60) * trafficMultiplier))),
            polyline: coordinates, // Entire polyline is shared, or per leg
            maneuvers: legManeuvers,
          });

          allManeuvers.push(...legManeuvers);
        });

        const totalDist = Math.round((route.distance / 1000) * 10) / 10;
        const totalDur = Math.max(1, Math.round((route.duration / 60) * trafficMultiplier));

        // Unoptimized comparison (individual round-trips from stops[0])
        const unoptimizedDist = stops.slice(1).reduce((sum, st) => {
          return sum + calculateHaversineDistance(stops[0].lat, stops[0].lng, st.lat, st.lng) * 2 * ROAD_DETOUR_FACTOR;
        }, 0);

        const kmSaved = Math.max(0, unoptimizedDist - totalDist);
        const fuelSavedPct = unoptimizedDist > 0 ? Math.round((kmSaved / unoptimizedDist) * 100) : 0;
        const fuelLitres = Math.round((kmSaved / 35) * 100) / 100;
        const co2Kg = Math.round(fuelLitres * 2.31 * 100) / 100;

        return {
          polyline: coordinates,
          legs,
          totalDistanceKm: totalDist,
          totalDurationMins: totalDur,
          allManeuvers,
          fuelSavedPercentage: fuelSavedPct,
          fuelSavedLitres: fuelLitres,
          co2SavedKg: co2Kg,
        };
      }
    }
  } catch (err) {
    // Fall back to sequential pairwise computation
  }

  // Fallback: Pairwise sequential routes
  const combinedPolyline: [number, number][] = [];
  const legs: MultiStopLeg[] = [];
  const allManeuvers: ManeuverInstruction[] = [];
  let totalDistSum = 0;
  let totalDurSum = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    const fromS = stops[i];
    const toS = stops[i + 1];
    const legRes = await getLiveRoadRoute(fromS, toS, toS.label, trafficMultiplier);

    combinedPolyline.push(...legRes.polyline);
    totalDistSum += legRes.totalDistanceKm;
    totalDurSum += legRes.totalDurationMins;

    legs.push({
      legIndex: i,
      fromLabel: fromS.label,
      toLabel: toS.label,
      orderId: toS.orderId,
      distanceKm: legRes.totalDistanceKm,
      durationMins: legRes.totalDurationMins,
      polyline: legRes.polyline,
      maneuvers: legRes.maneuvers,
    });

    allManeuvers.push(...legRes.maneuvers);
  }

  const unoptimizedDist = stops.slice(1).reduce((sum, st) => {
    return sum + calculateHaversineDistance(stops[0].lat, stops[0].lng, st.lat, st.lng) * 2 * ROAD_DETOUR_FACTOR;
  }, 0);

  const kmSaved = Math.max(0, unoptimizedDist - totalDistSum);
  const fuelSavedPct = unoptimizedDist > 0 ? Math.round((kmSaved / unoptimizedDist) * 100) : 0;
  const fuelLitres = Math.round((kmSaved / 35) * 100) / 100;
  const co2Kg = Math.round(fuelLitres * 2.31 * 100) / 100;

  return {
    polyline: combinedPolyline,
    legs,
    totalDistanceKm: Math.round(totalDistSum * 10) / 10,
    totalDurationMins: totalDurSum,
    allManeuvers,
    fuelSavedPercentage: fuelSavedPct,
    fuelSavedLitres: fuelLitres,
    co2SavedKg: co2Kg,
  };
}

