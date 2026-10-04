# Session 3: System Architecture & Algorithm Complexity

## System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Customer Interface                         │
│  (Next.js Frontend - Menu, Cart, Checkout, Tracking)         │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API / Real-time
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Firestore   │  │   Auth      │  │   Storage   │        │
│  │ (Orders)    │  │ (Users)     │  │ (Images)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└──────────────────────┬──────────────────────────────────────┘
                       │ Real-time Listeners
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Route       │  │   Dispatch   │  │   GPS       │        │
│  │ Optimizer   │  │   Engine     │  │   Tracker   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Admin & Rider Interfaces                    │
│  (Logistics Hub, Rider Portal, Performance Dashboard)         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Order Flow
1. **Customer** places order → Firebase Firestore
2. **Auto-Dispatch** triggers → Assigns best rider
3. **Rider Portal** receives notification → Accepts/Rejects
4. **GPS Tracking** syncs to Firebase → Customer sees live position
5. **Delivery Completion** → Updates order status

### Module Interactions
- **Orders Module**: Manages order lifecycle (Pending → Delivered)
- **Riders Module**: Manages rider availability and GPS positions
- **Routing Module**: Calculates optimal routes using algorithms
- **Settings Module**: Store configuration (location, fees, hours)

## Data Structures

### Weighted Graph (Road Network)
```typescript
type WeightedGraph = {
  nodes: Record<string, GraphNode>;  // Location junctions
  edges: GraphEdge[];                // Roads with weights
}

type GraphEdge = {
  from: string;      // Start junction
  to: string;        // End junction
  distanceKm: number; // Physical distance
  weight: number;     // Distance × traffic multiplier
}
```

### Hash Map (State Management)
- **Zustand Store**: Orders, riders, assignments, settings
- **Firebase Sync**: Real-time data synchronization
- **Local Persistence**: Rider profiles, assignments

### Priority Queue (Implicit)
- **Dijkstra Algorithm**: Priority-based node selection
- **Edge Relaxation**: Updates shortest path distances

## Algorithm Complexity Analysis

### Dijkstra's Algorithm
- **Time Complexity**: O((V + E) log V)
  - V = number of vertices (locations)
  - E = number of edges (roads)
- **Space Complexity**: O(V)
- **Best Use Case**: Single source, single destination
- **Average Performance**: ~2-5ms for 4 nodes

### TSP 2-Opt Algorithm
- **Time Complexity**: O(n² × k)
  - n = number of delivery nodes
  - k = number of 2-opt iterations
- **Space Complexity**: O(n)
- **Best Use Case**: Multiple deliveries, route optimization
- **Average Performance**: ~5-15ms for 10 nodes

### Greedy Nearest Neighbor
- **Time Complexity**: O(n²)
  - n = number of delivery nodes
- **Space Complexity**: O(n)
- **Best Use Case**: Large-scale quick approximation
- **Average Performance**: ~1-3ms for 10 nodes

## TypeScript OOP Class Hierarchy

```
abstract class BaseRouteOptimizer
├── protected calculateEdgeWeight()
├── protected calculateRouteCost()
└── abstract optimize()

class DijkstraRouteOptimizer extends BaseRouteOptimizer
├── optimize() // Dijkstra implementation
└── findShortestPath()

class TSPRouteOptimizer extends BaseRouteOptimizer
├── optimize() // TSP 2-Opt implementation
└── twoOptOptimization()

class GreedyRouteOptimizer extends BaseRouteOptimizer
└── optimize() // Greedy implementation

class RouteOptimizerFactory
└── static createOptimizer(type)
```

## Scalability Considerations

### Current Scale
- **Orders**: Real-time Firestore listener
- **Riders**: 10-second GPS broadcast
- **Algorithms**: Client-side execution (<15ms)

### Scaling Strategies
1. **Firestore**: Auto-scaling with Firebase
2. **Algorithm Optimization**: Memoization, caching
3. **Load Balancing**: CDN for static assets
4. **Performance Monitoring**: Real-time metrics dashboard

## Implementation Status

- ✅ Graph data structures (WeightedGraph, GraphNode, GraphEdge)
- ✅ Dijkstra's algorithm implementation
- ✅ TSP 2-Opt for route optimization
- ✅ Greedy algorithm for rider dispatch
- ✅ Priority queues (implicit in Dijkstra)
- ✅ Hash maps (Zustand state)
- ✅ TypeScript class-based OOP implementation
- ✅ System architecture diagram
- ✅ Algorithm complexity analysis
