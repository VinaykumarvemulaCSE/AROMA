"use client";

import React, { useState, useEffect } from "react";
import { performanceTracker, type PerformanceMetric } from "@/lib/performance";
import {
  Activity,
  Clock,
  Zap,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("all");

  useEffect(() => {
    // Load metrics from tracker
    setMetrics(performanceTracker.getAllMetrics());

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      setMetrics(performanceTracker.getAllMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredMetrics =
    selectedAlgorithm === "all"
      ? metrics
      : metrics.filter((m) => m.algorithmName === selectedAlgorithm);

  const algorithmNames = Array.from(new Set(metrics.map((m) => m.algorithmName)));

  const getStats = (algoName: string) => {
    const stats = performanceTracker.getAlgorithmStats(algoName);
    return stats;
  };

  const handleExport = () => {
    const data = performanceTracker.export();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    performanceTracker.clear();
    setMetrics([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Algorithm Performance Dashboard</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMetrics(performanceTracker.getAllMetrics())}
          >
            <RefreshCw className="size-4 mr-1.5" /> Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="size-4 mr-1.5" /> Export
          </Button>
          <Button size="sm" variant="destructive" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>

      {/* Algorithm Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedAlgorithm === "all" ? "default" : "outline"}
          onClick={() => setSelectedAlgorithm("all")}
        >
          All Algorithms
        </Button>
        {algorithmNames.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={selectedAlgorithm === name ? "default" : "outline"}
            onClick={() => setSelectedAlgorithm(name)}
          >
            {name}
          </Button>
        ))}
      </div>

      {/* Statistics Cards */}
      {selectedAlgorithm !== "all" && getStats(selectedAlgorithm) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Clock className="size-4" />
              <span>Average Time</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {getStats(selectedAlgorithm)!.averageMs.toFixed(2)} ms
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Zap className="size-4" />
              <span>Min Time</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {getStats(selectedAlgorithm)!.minMs.toFixed(2)} ms
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <TrendingUp className="size-4" />
              <span>Max Time</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {getStats(selectedAlgorithm)!.maxMs.toFixed(2)} ms
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <BarChart3 className="size-4" />
              <span>Executions</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {getStats(selectedAlgorithm)!.count}
            </p>
          </Card>
        </div>
      )}

      {/* Metrics Table */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-semibold">Algorithm</th>
                <th className="text-left py-2 px-3 font-semibold">Execution Time</th>
                <th className="text-left py-2 px-3 font-semibold">Input Size</th>
                <th className="text-left py-2 px-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No performance metrics available yet. Run some routing operations to see data.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((metric, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3">
                      <Badge variant="outline">{metric.algorithmName}</Badge>
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold">
                      {metric.executionTimeMs.toFixed(2)} ms
                    </td>
                    <td className="py-2 px-3">{metric.inputSize}</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
