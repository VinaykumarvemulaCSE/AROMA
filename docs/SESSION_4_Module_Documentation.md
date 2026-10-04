# Session 4: Module Documentation

## System Modules

### 1. User & Admin Management Module

#### Components
- **Authentication**: Firebase Auth (Email/Password, Google OAuth)
- **Authorization**: Custom Firebase claims for admin access
- **Profile Management**: User profile with address book

#### Classes/Types
```typescript
type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone: string;
  addresses: Address[];
}
```

#### Features
- ✅ Secure authentication with session tokens
- ✅ Role-based access control (Admin/Customer/Rider)
- ✅ Profile management with address book

### 2. Route Optimization Module

#### Components
- **Dijkstra Optimizer**: Shortest path for single destination
- **TSP Optimizer**: Multi-stop route optimization
- **Greedy Optimizer**: Fast approximation for large batches

#### TypeScript Classes
```typescript
abstract class BaseRouteOptimizer {
  abstract optimize(start: DeliveryNode, deliveries: DeliveryNode[]): Result
  protected calculateEdgeWeight(nodeA, nodeB): number
}

class DijkstraRouteOptimizer extends BaseRouteOptimizer { ... }
class TSPRouteOptimizer extends BaseRouteOptimizer { ... }
class GreedyRouteOptimizer extends BaseRouteOptimizer { ... }
```

#### Features
- ✅ Class-based OOP implementation
- ✅ Inheritance from abstract base class
- ✅ Polymorphism through interface implementation
- ✅ Encapsulation with protected members

### 3. GPS Tracking Module

#### Components
- **Location Service**: Browser GPS API with retry logic
- **Geocoding Service**: Multi-provider reverse geocoding
- **Firebase Sync**: Real-time position updates

#### Functions
```typescript
getUserCoordinates(): Promise<{lat, lng}>
reverseGeocode(lat, lng): Promise<LocationResult>
updateRiderPositionInFirebase(riderId, data): Promise<void>
```

#### Features
- ✅ High-accuracy GPS with 3-retry logic
- ✅ Multi-provider geocoding fallback
- ✅ Real-time Firebase sync
- ✅ Error handling for permission denied, timeout

### 4. Delivery Management Module

#### Components
- **Order Management**: Order lifecycle (Pending → Delivered)
- **Rider Dispatch**: Automatic assignment with greedy algorithm
- **State Machine**: Delivery state transitions

#### State Machine
```
ASSIGNED → ACCEPTED → PICKED_UP → IN_TRANSIT → ARRIVING → DELIVERED
           ↓
         REJECTED → REASSIGN
           ↓
      DELIVERY_FAILED → RETRY
```

#### Features
- ✅ Automatic order dispatch
- ✅ Rider assignment with scoring algorithm
- ✅ State machine for delivery lifecycle
- ✅ Reassignment on rejection/failure

### 5. Traffic Monitoring Module

#### Components
- **Traffic Multiplier**: Dynamic congestion factor (1.0x - 3.0x)
- **Route Recalculation**: Re-run algorithms with new traffic
- **Alternative Routes**: Generate multiple routing options

#### Features
- ✅ Traffic congestion slider in admin hub
- ✅ Dynamic route recalculation on traffic change
- ✅ Alternative route suggestions in rider portal
- ✅ Route deviation detection

## Module Integration

### Dependencies
- **Orders Module** → Uses Routing Module for optimization
- **Riders Module** → Uses GPS Module for tracking
- **Routing Module** → Uses Traffic Module for weights
- **Dispatch Module** → Uses Riders Module for availability

### Data Flow
```
Order Created → Routing Module calculates optimal route
              → Dispatch Module assigns best rider
              → GPS Module tracks rider position
              → Traffic Module adjusts for congestion
              → Delivery Module updates status
```

## Error Handling

### GPS Errors
- **Permission Denied**: User guidance to enable location
- **Timeout**: 3-retry with exponential backoff
- **Unavailable**: Fallback to last known position

### Algorithm Errors
- **Invalid Input**: Validation before processing
- **NaN Coordinates**: Filter out invalid nodes
- **Empty Orders**: Return empty result gracefully

### Network Errors
- **Firebase Sync**: Retry on failure
- **Geocoding**: Fallback to next provider
- **API Calls**: Timeout and retry logic

## Implementation Status

- ✅ Delivery request handling via Firebase
- ✅ Route optimization algorithms (Dijkstra, TSP, Greedy)
- ✅ Interactive logistics hub dashboard
- ✅ TypeScript class-based module structure
- ✅ Comprehensive error handling
- ✅ Module integration testing framework
