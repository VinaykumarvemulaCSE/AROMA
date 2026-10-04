// src/lib/performance.ts
// Performance measurement utilities for algorithm benchmarking

export type PerformanceMetric = {
  algorithmName: string;
  executionTimeMs: number;
  inputSize: number;
  timestamp: number;
  additionalData?: Record<string, any>;
};

class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];

  /**
   * Measure the execution time of a function
   */
  async measure<T>(
    algorithmName: string,
    inputSize: number,
    fn: () => Promise<T> | T,
    additionalData?: Record<string, any>
  ): Promise<{ result: T; metric: PerformanceMetric }> {
    const startTime = performance.now();
    let result: T;
    let error: Error | null = null;

    try {
      result = await fn();
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      const endTime = performance.now();
      const executionTimeMs = endTime - startTime;

      const metric: PerformanceMetric = {
        algorithmName,
        executionTimeMs,
        inputSize,
        timestamp: Date.now(),
        additionalData: {
          ...additionalData,
          error: error?.message,
        },
      };

      this.metrics.push(metric);
      console.log(`[Performance] ${algorithmName}: ${executionTimeMs.toFixed(2)}ms (input: ${inputSize})`);
    }

    return { result: result!, metric: this.metrics[this.metrics.length - 1] };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific algorithm
   */
  getMetricsForAlgorithm(algorithmName: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.algorithmName === algorithmName);
  }

  /**
   * Get average execution time for an algorithm
   */
  getAverageExecutionTime(algorithmName: string): number {
    const metrics = this.getMetricsForAlgorithm(algorithmName);
    if (metrics.length === 0) return 0;

    const totalTime = metrics.reduce((sum, m) => sum + m.executionTimeMs, 0);
    return totalTime / metrics.length;
  }

  /**
   * Get statistics for an algorithm
   */
  getAlgorithmStats(algorithmName: string) {
    const metrics = this.getMetricsForAlgorithm(algorithmName);
    if (metrics.length === 0) return null;

    const times = metrics.map((m) => m.executionTimeMs);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = [...times].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      count: metrics.length,
      averageMs: avg,
      minMs: min,
      maxMs: max,
      medianMs: median,
      totalMs: times.reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Singleton instance
export const performanceTracker = new PerformanceTracker();

/**
 * Higher-order function to wrap any function with performance measurement
 */
export function withPerformanceMeasurement<T extends (...args: any[]) => any>(
  algorithmName: string,
  fn: T,
  inputSizeFn?: (...args: Parameters<T>) => number
): T {
  return (async (...args: Parameters<T>) => {
    const inputSize = inputSizeFn ? inputSizeFn(...args) : 1;
    return performanceTracker.measure(
      algorithmName,
      inputSize,
      () => fn(...args)
    );
  }) as T;
}
