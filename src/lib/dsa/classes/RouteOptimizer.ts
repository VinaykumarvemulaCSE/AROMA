// src/lib/dsa/classes/RouteOptimizer.ts
// TypeScript OOP implementation of routing algorithms
// Demonstrates: Abstract classes, inheritance, polymorphism, encapsulation

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

export type RouteOptimizationResult = {
  routeSequence: DeliveryNode[];
  totalDistanceKm: number;
  totalRoadDistanceKm: number;
  totalEstimatedMinutes: number;
  fuelSavedPercentage: number;
  stopsCount: number;
  algorithmName: string;
};

/**
 * Abstract base class for route optimizers
 * Demonstrates: Abstract class, protected members, abstract methods
 */
export abstract class BaseRouteOptimizer {
  protected ROAD_DETOUR_FACTOR = 1.25;
  protected AVERAGE_RIDER_SPEED_KMPH = 25;

  /**
   * Abstract method - must be implemented by subclasses
   * Demonstrates: Polymorphism through abstract methods
   */
  abstract optimize(
    startNode: DeliveryNode,
    deliveryNodes: DeliveryNode[]
  ): RouteOptimizationResult;

  /**
   * Protected helper method - encapsulation
   * Demonstrates: Protected access modifier
   */
  protected calculateEdgeWeight(
    nodeA: { lat: number; lng: number },
    nodeB: { lat: number; lng: number },
    trafficMultiplier: number = 1.0
  ): number {
    const straightLine = calculateHaversineDistance(
      nodeA.lat,
      nodeA.lng,
      nodeB.lat,
      nodeB.lng
    );
    return straightLine * this.ROAD_DETOUR_FACTOR * trafficMultiplier;
  }

  /**
   * Protected helper for calculating route cost
   */
  protected calculateRouteCost(
    startNode: DeliveryNode,
    nodesSequence: DeliveryNode[],
    trafficMultiplier: number = 1.0
  ): number {
    if (nodesSequence.length === 0) return 0;

    let total = this.calculateEdgeWeight(
      startNode,
      nodesSequence[0],
      trafficMultiplier
    );

    for (let i = 0; i < nodesSequence.length - 1; i++) {
      total += this.calculateEdgeWeight(
        nodesSequence[i],
        nodesSequence[i + 1],
        trafficMultiplier
      );
    }

    return Math.round(total * 10) / 10;
  }

  /**
   * Get optimizer name - concrete method
   */
  getOptimizerName(): string {
    return this.constructor.name;
  }
}

/**
 * Dijkstra-based route optimizer
 * Demonstrates: Inheritance, implementation of abstract methods
 */
export class DijkstraRouteOptimizer extends BaseRouteOptimizer {
  private nodes: Record<string, { id: string; name: string; lat: number; lng: number }>;
  private edges: Array<{
    from: string;
    to: string;
    distanceKm: number;
    weight: number;
  }>;

  constructor() {
    super();
    this.nodes = {};
    this.edges = [];
  }

  /**
   * Implement abstract method from base class
   * Demonstrates: Polymorphism - provides Dijkstra-specific implementation
   */
  optimize(
    startNode: DeliveryNode,
    deliveryNodes: DeliveryNode[]
  ): RouteOptimizationResult {
    if (!deliveryNodes || deliveryNodes.length === 0) {
      return this.createEmptyResult(startNode);
    }

    // Build graph with Dijkstra-specific structure
    this.buildGraph(startNode, deliveryNodes);

    // Find shortest path
    const result = this.findShortestPath(startNode.id, deliveryNodes[0].id);

    return {
      routeSequence: [startNode, deliveryNodes[0]],
      totalDistanceKm: result.totalDistanceKm,
      totalRoadDistanceKm: result.totalRoadDistanceKm,
      totalEstimatedMinutes: result.totalEstimatedMinutes,
      fuelSavedPercentage: 0,
      stopsCount: 1,
      algorithmName: this.getOptimizerName(),
    };
  }

  private buildGraph(startNode: DeliveryNode, deliveryNodes: DeliveryNode[]): void {
    this.nodes = {
      [startNode.id]: { id: startNode.id, name: "Start", lat: startNode.lat, lng: startNode.lng },
    };

    deliveryNodes.forEach((node) => {
      this.nodes[node.id] = {
        id: node.id,
        name: node.address,
        lat: node.lat,
        lng: node.lng,
      };
    });

    // Build edges (simplified for demo)
    this.edges = [];
    Object.keys(this.nodes).forEach((nodeId) => {
      Object.keys(this.nodes).forEach((targetId) => {
        if (nodeId !== targetId) {
          const weight = this.calculateEdgeWeight(this.nodes[nodeId], this.nodes[targetId]);
          this.edges.push({
            from: nodeId,
            to: targetId,
            distanceKm: weight / this.ROAD_DETOUR_FACTOR,
            weight,
          });
        }
      });
    });
  }

  private findShortestPath(startId: string, targetId: string): {
    totalDistanceKm: number;
    totalRoadDistanceKm: number;
    totalEstimatedMinutes: number;
  } {
    // Simplified Dijkstra implementation
    const distances: Record<string, number> = {};
    const unvisited = new Set(Object.keys(this.nodes));

    Object.keys(this.nodes).forEach((id) => {
      distances[id] = Infinity;
    });
    distances[startId] = 0;

    while (unvisited.size > 0) {
      let current: string | null = null;
      let minDist = Infinity;

      unvisited.forEach((id) => {
        if (distances[id] < minDist) {
          minDist = distances[id];
          current = id;
        }
      });

      if (!current || current === targetId) break;
      const currId: string = current;
      unvisited.delete(currId);

      this.edges
        .filter((e) => e.from === currId)
        .forEach((edge) => {
          if (unvisited.has(edge.to)) {
            const alt = distances[currId] + edge.weight;
            if (alt < distances[edge.to]) {
              distances[edge.to] = alt;
            }
          }
        });
    }

    const totalDist = distances[targetId] || 0;
    const travelMins = Math.round((totalDist / this.AVERAGE_RIDER_SPEED_KMPH) * 60);

    return {
      totalDistanceKm: Math.round((totalDist / this.ROAD_DETOUR_FACTOR) * 10) / 10,
      totalRoadDistanceKm: Math.round(totalDist * 10) / 10,
      totalEstimatedMinutes: travelMins,
    };
  }

  private createEmptyResult(startNode: DeliveryNode): RouteOptimizationResult {
    return {
      routeSequence: [startNode],
      totalDistanceKm: 0,
      totalRoadDistanceKm: 0,
      totalEstimatedMinutes: 0,
      fuelSavedPercentage: 0,
      stopsCount: 0,
      algorithmName: this.getOptimizerName(),
    };
  }
}

/**
 * TSP 2-Opt route optimizer
 * Demonstrates: Inheritance, complex algorithm implementation
 */
export class TSPRouteOptimizer extends BaseRouteOptimizer {
  /**
   * Implement abstract method with TSP 2-Opt algorithm
   */
  optimize(
    startNode: DeliveryNode,
    deliveryNodes: DeliveryNode[]
  ): RouteOptimizationResult {
    if (!deliveryNodes || deliveryNodes.length === 0) {
      return this.createEmptyResult(startNode);
    }

    const validNodes = deliveryNodes.filter(
      (n) => n && n.lat && n.lng && !isNaN(n.lat) && !isNaN(n.lng)
    );

    if (validNodes.length === 0) {
      return this.createEmptyResult(startNode);
    }

    if (validNodes.length === 1) {
      return this.optimizeSingleDelivery(startNode, validNodes[0]);
    }

    // TSP 2-Opt optimization
    const optimizedRoute = this.twoOptOptimization(startNode, validNodes);
    const unoptimizedCost = this.calculateRouteCost(startNode, validNodes);
    const optimizedCost = this.calculateRouteCost(startNode, optimizedRoute);

    const fuelSaved =
      unoptimizedCost > 0
        ? Math.max(0, Math.round(((unoptimizedCost - optimizedCost) / unoptimizedCost) * 100))
        : 0;

    const totalTravelMins = Math.round((optimizedCost / this.AVERAGE_RIDER_SPEED_KMPH) * 60);
    const maxPrepTime = Math.max(...optimizedRoute.map((n) => n.prepTimeMinutes ?? 15));
    const totalEtaMinutes = maxPrepTime + totalTravelMins;

    return {
      routeSequence: [startNode, ...optimizedRoute],
      totalDistanceKm: Math.round((optimizedCost / this.ROAD_DETOUR_FACTOR) * 10) / 10,
      totalRoadDistanceKm: Math.round(optimizedCost * 10) / 10,
      totalEstimatedMinutes: totalEtaMinutes,
      fuelSavedPercentage: fuelSaved,
      stopsCount: optimizedRoute.length,
      algorithmName: this.getOptimizerName(),
    };
  }

  private optimizeSingleDelivery(
    startNode: DeliveryNode,
    deliveryNode: DeliveryNode
  ): RouteOptimizationResult {
    const roadDist = this.calculateEdgeWeight(startNode, deliveryNode);
    const straightDist = calculateHaversineDistance(
      startNode.lat,
      startNode.lng,
      deliveryNode.lat,
      deliveryNode.lng
    );
    const travelMins = Math.round((roadDist / this.AVERAGE_RIDER_SPEED_KMPH) * 60);
    const prepMins = deliveryNode.prepTimeMinutes ?? 15;

    return {
      routeSequence: [startNode, deliveryNode],
      totalDistanceKm: straightDist,
      totalRoadDistanceKm: Math.round(roadDist * 10) / 10,
      totalEstimatedMinutes: prepMins + travelMins,
      fuelSavedPercentage: 0,
      stopsCount: 1,
      algorithmName: this.getOptimizerName(),
    };
  }

  private twoOptOptimization(startNode: DeliveryNode, nodes: DeliveryNode[]): DeliveryNode[] {
    // Nearest neighbor initial solution
    const unvisited = [...nodes];
    let currentPos: { lat: number; lng: number } = { lat: startNode.lat, lng: startNode.lng };
    const initialRoute: DeliveryNode[] = [];

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const dist = this.calculateEdgeWeight(currentPos, unvisited[i]);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }

      const nextNode = unvisited.splice(nearestIdx, 1)[0];
      initialRoute.push(nextNode);
      currentPos = { lat: nextNode.lat, lng: nextNode.lng };
    }

    // 2-Opt improvement
    let bestRoute = [...initialRoute];
    let bestCost = this.calculateRouteCost(startNode, bestRoute);
    let improved = true;

    while (improved) {
      improved = false;
      for (let i = 0; i < bestRoute.length - 1; i++) {
        for (let k = i + 1; k < bestRoute.length; k++) {
          const candidateRoute = this.twoOptSwap(bestRoute, i, k);
          const newCost = this.calculateRouteCost(startNode, candidateRoute);

          if (newCost < bestCost) {
            bestCost = newCost;
            bestRoute = candidateRoute;
            improved = true;
          }
        }
      }
    }

    return bestRoute;
  }

  private twoOptSwap(route: DeliveryNode[], i: number, k: number): DeliveryNode[] {
    const newRoute = route.slice(0, i);
    const reversedSegment = route.slice(i, k + 1).reverse();
    const rest = route.slice(k + 1);
    return [...newRoute, ...reversedSegment, ...rest];
  }

  private createEmptyResult(startNode: DeliveryNode): RouteOptimizationResult {
    return {
      routeSequence: [startNode],
      totalDistanceKm: 0,
      totalRoadDistanceKm: 0,
      totalEstimatedMinutes: 0,
      fuelSavedPercentage: 0,
      stopsCount: 0,
      algorithmName: this.getOptimizerName(),
    };
  }
}

/**
 * Greedy route optimizer
 * Demonstrates: Inheritance, simple greedy algorithm
 */
export class GreedyRouteOptimizer extends BaseRouteOptimizer {
  /**
   * Implement abstract method with greedy algorithm
   */
  optimize(
    startNode: DeliveryNode,
    deliveryNodes: DeliveryNode[]
  ): RouteOptimizationResult {
    if (!deliveryNodes || deliveryNodes.length === 0) {
      return this.createEmptyResult(startNode);
    }

    // Greedy: sort by distance from start
    const sortedNodes = [...deliveryNodes].sort((a, b) => {
      const distA = this.calculateEdgeWeight(startNode, a);
      const distB = this.calculateEdgeWeight(startNode, b);
      return distA - distB;
    });

    const totalCost = this.calculateRouteCost(startNode, sortedNodes);
    const travelMins = Math.round((totalCost / this.AVERAGE_RIDER_SPEED_KMPH) * 60);
    const maxPrepTime = Math.max(...sortedNodes.map((n) => n.prepTimeMinutes ?? 15));

    return {
      routeSequence: [startNode, ...sortedNodes],
      totalDistanceKm: Math.round((totalCost / this.ROAD_DETOUR_FACTOR) * 10) / 10,
      totalRoadDistanceKm: Math.round(totalCost * 10) / 10,
      totalEstimatedMinutes: maxPrepTime + travelMins,
      fuelSavedPercentage: 0,
      stopsCount: sortedNodes.length,
      algorithmName: this.getOptimizerName(),
    };
  }

  private createEmptyResult(startNode: DeliveryNode): RouteOptimizationResult {
    return {
      routeSequence: [startNode],
      totalDistanceKm: 0,
      totalRoadDistanceKm: 0,
      totalEstimatedMinutes: 0,
      fuelSavedPercentage: 0,
      stopsCount: 0,
      algorithmName: this.getOptimizerName(),
    };
  }
}

/**
 * Factory class for creating route optimizers
 * Demonstrates: Factory design pattern, encapsulation
 */
export class RouteOptimizerFactory {
  /**
   * Factory method - creates optimizer based on type
   * Demonstrates: Factory pattern, encapsulation of object creation
   */
  static createOptimizer(type: "dijkstra" | "tsp" | "greedy"): BaseRouteOptimizer {
    switch (type) {
      case "dijkstra":
        return new DijkstraRouteOptimizer();
      case "tsp":
        return new TSPRouteOptimizer();
      case "greedy":
        return new GreedyRouteOptimizer();
      default:
        throw new Error(`Unknown optimizer type: ${type}`);
    }
  }

  /**
   * Get all available optimizer types
   */
  static getAvailableTypes(): Array<{ type: string; name: string; description: string }> {
    return [
      {
        type: "dijkstra",
        name: "Dijkstra Shortest Path",
        description: "Optimal for single destination with multiple paths",
      },
      {
        type: "tsp",
        name: "TSP 2-Opt",
        description: "Optimal for multiple deliveries with route optimization",
      },
      {
        type: "greedy",
        name: "Greedy Nearest Neighbor",
        description: "Fast approximation for large-scale deliveries",
      },
    ];
  }
}
