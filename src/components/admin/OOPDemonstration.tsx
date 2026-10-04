"use client";

import React, { useState } from "react";
import {
  RouteOptimizerFactory,
  type BaseRouteOptimizer,
  type DeliveryNode,
  type RouteOptimizationResult,
} from "@/lib/dsa/classes/RouteOptimizer";
import {
  Cpu,
  Code,
  Layers,
  Zap,
  CheckCircle2,
  ArrowRight,
  Braces,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function OOPDemonstration() {
  const [selectedOptimizer, setSelectedOptimizer] = useState<"dijkstra" | "tsp" | "greedy">("tsp");
  const [result, setResult] = useState<RouteOptimizationResult | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);

  const availableOptimizers = RouteOptimizerFactory.getAvailableTypes();

  const runOptimization = () => {
    const storeNode: DeliveryNode = {
      id: "store",
      address: "Aroma Cafe HQ",
      lat: 17.0544,
      lng: 79.2671,
    };

    const deliveryNodes: DeliveryNode[] = [
      {
        id: "order-1",
        customerName: "Customer A",
        address: "Location A",
        lat: 17.0594,
        lng: 79.2721,
        prepTimeMinutes: 10,
      },
      {
        id: "order-2",
        customerName: "Customer B",
        address: "Location B",
        lat: 17.0494,
        lng: 79.2621,
        prepTimeMinutes: 12,
      },
      {
        id: "order-3",
        customerName: "Customer C",
        address: "Location C",
        lat: 17.0594,
        lng: 79.2621,
        prepTimeMinutes: 8,
      },
    ];

    // Factory pattern - create optimizer
    const optimizer = RouteOptimizerFactory.createOptimizer(selectedOptimizer);

    // Measure execution time
    const startTime = performance.now();
    const optimizationResult = optimizer.optimize(storeNode, deliveryNodes);
    const endTime = performance.now();

    setExecutionTime(endTime - startTime);
    setResult(optimizationResult);
  };

  return (
    <div className="space-y-4">
      {/* OOP Concepts Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Braces className="size-5 text-purple-600" />
            <span className="font-bold text-purple-900">Inheritance</span>
          </div>
          <p className="text-xs text-purple-800">
            BaseRouteOptimizer abstract class extended by Dijkstra, TSP, and Greedy
            optimizers
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="size-5 text-blue-600" />
            <span className="font-bold text-blue-900">Polymorphism</span>
          </div>
          <p className="text-xs text-blue-800">
            Each optimizer implements abstract <code>optimize()</code> method with unique
            algorithm
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <Code className="size-5 text-emerald-600" />
            <span className="font-bold text-emerald-900">Encapsulation</span>
          </div>
          <p className="text-xs text-emerald-800">
            Protected methods like <code>calculateEdgeWeight()</code> hidden from external
            access
          </p>
        </Card>
      </div>

      {/* Optimizer Selection */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold">Select Algorithm:</span>
        {availableOptimizers.map((opt) => (
          <Button
            key={opt.type}
            size="sm"
            variant={selectedOptimizer === opt.type ? "default" : "outline"}
            onClick={() => setSelectedOptimizer(opt.type as any)}
          >
            {opt.name}
          </Button>
        ))}
      </div>

      {/* Run Button */}
      <Button onClick={runOptimization} className="w-full">
        <Cpu className="size-4 mr-2" /> Run {availableOptimizers.find((o) => o.type === selectedOptimizer)?.name}
      </Button>

      {/* Results */}
      {result && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <span className="font-bold">Optimization Complete</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-300">
              {executionTime.toFixed(2)} ms
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-muted">
              <span className="text-muted-foreground block">Algorithm</span>
              <span className="font-bold block mt-1">{result.algorithmName}</span>
            </div>
            <div className="p-3 rounded-xl bg-muted">
              <span className="text-muted-foreground block">Total Distance</span>
              <span className="font-bold block mt-1">{result.totalRoadDistanceKm} km</span>
            </div>
            <div className="p-3 rounded-xl bg-muted">
              <span className="text-muted-foreground block">Est. Time</span>
              <span className="font-bold block mt-1">{result.totalEstimatedMinutes} min</span>
            </div>
            <div className="p-3 rounded-xl bg-muted">
              <span className="text-muted-foreground block">Stops</span>
              <span className="font-bold block mt-1">{result.stopsCount}</span>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-xl">
            <span className="text-xs font-semibold block mb-2">Route Sequence:</span>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {result.routeSequence.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <Badge variant="outline">{node.address}</Badge>
                  {idx < result.routeSequence.length - 1 && (
                    <ArrowRight className="size-3 text-muted-foreground" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {result.fuelSavedPercentage > 0 && (
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                <Zap className="size-4" />
                <span>🌱 {result.fuelSavedPercentage}% Fuel Saved via Optimization</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Class Hierarchy Diagram */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Code className="size-5 text-primary" />
          <span className="font-bold">TypeScript Class Hierarchy</span>
        </div>
        <div className="bg-muted p-4 rounded-xl font-mono text-xs space-y-2">
          <div className="text-purple-600">
            <span className="text-blue-600">abstract class</span> BaseRouteOptimizer
          </div>
          <div className="pl-4 text-muted-foreground">├── abstract optimize()</div>
          <div className="pl-4 text-muted-foreground">├── protected calculateEdgeWeight()</div>
          <div className="pl-4 text-muted-foreground">└── protected calculateRouteCost()</div>
          <div className="text-purple-600 pl-4">
            <span className="text-blue-600">class</span> DijkstraRouteOptimizer{" "}
            <span className="text-blue-600">extends</span> BaseRouteOptimizer
          </div>
          <div className="text-purple-600 pl-4">
            <span className="text-blue-600">class</span> TSPRouteOptimizer{" "}
            <span className="text-blue-600">extends</span> BaseRouteOptimizer
          </div>
          <div className="text-purple-600 pl-4">
            <span className="text-blue-600">class</span> GreedyRouteOptimizer{" "}
            <span className="text-blue-600">extends</span> BaseRouteOptimizer
          </div>
          <div className="text-purple-600">
            <span className="text-blue-600">class</span> RouteOptimizerFactory
          </div>
          <div className="pl-4 text-muted-foreground">└── static createOptimizer()</div>
        </div>
      </Card>
    </div>
  );
}
