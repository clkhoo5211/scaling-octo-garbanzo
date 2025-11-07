/**
 * Adaptive Rate Limiter
 * Adjusts intervals based on source update frequency and recent activity
 */

interface SourceMetrics {
  lastFetchTime: number;
  lastUpdateTime: number;
  fetchCount: number;
  errorCount: number;
  averageInterval: number;
}

export class AdaptiveRateLimiter {
  private metrics: Map<string, SourceMetrics> = new Map();
  private readonly MIN_INTERVAL = 120000; // 2 minutes minimum
  private readonly MAX_INTERVAL = 3600000; // 1 hour maximum
  private readonly BASE_INTERVAL = 300000; // 5 minutes default

  /**
   * Get adaptive interval for a source based on its update frequency
   */
  getInterval(
    sourceId: string,
    expectedFrequency?: number,
    recentActivity?: boolean
  ): number {
    const metrics = this.metrics.get(sourceId);
    
    // If source has expected frequency, use it as base
    if (expectedFrequency) {
      // Add 20% buffer to avoid hitting rate limits
      const baseInterval = expectedFrequency * 1.2;
      
      // Adjust based on recent activity
      if (recentActivity && metrics) {
        // If source updates frequently, reduce interval slightly
        if (metrics.fetchCount > 10 && metrics.errorCount < 2) {
          return Math.max(this.MIN_INTERVAL, baseInterval * 0.9);
        }
      }
      
      return Math.max(this.MIN_INTERVAL, Math.min(this.MAX_INTERVAL, baseInterval));
    }

    // Use historical metrics if available
    if (metrics && metrics.fetchCount > 5) {
      const adaptiveInterval = metrics.averageInterval;
      
      // Adjust based on error rate
      const errorRate = metrics.errorCount / metrics.fetchCount;
      if (errorRate > 0.3) {
        // High error rate - increase interval
        return Math.min(this.MAX_INTERVAL, adaptiveInterval * 1.5);
      } else if (errorRate < 0.1) {
        // Low error rate - can reduce interval slightly
        return Math.max(this.MIN_INTERVAL, adaptiveInterval * 0.9);
      }
      
      return Math.max(this.MIN_INTERVAL, Math.min(this.MAX_INTERVAL, adaptiveInterval));
    }

    // Default interval for new sources
    return this.BASE_INTERVAL;
  }

  /**
   * Record a successful fetch
   */
  recordFetch(sourceId: string, fetchTime: number, updateTime?: number): void {
    const metrics = this.metrics.get(sourceId) || {
      lastFetchTime: 0,
      lastUpdateTime: 0,
      fetchCount: 0,
      errorCount: 0,
      averageInterval: this.BASE_INTERVAL,
    };

    const interval = fetchTime - metrics.lastFetchTime;
    
    // Update average interval (exponential moving average)
    if (metrics.fetchCount > 0) {
      metrics.averageInterval = 
        metrics.averageInterval * 0.7 + interval * 0.3;
    } else {
      metrics.averageInterval = interval;
    }

    metrics.lastFetchTime = fetchTime;
    if (updateTime) {
      metrics.lastUpdateTime = updateTime;
    }
    metrics.fetchCount++;

    this.metrics.set(sourceId, metrics);
  }

  /**
   * Record a fetch error
   */
  recordError(sourceId: string): void {
    const metrics = this.metrics.get(sourceId) || {
      lastFetchTime: 0,
      lastUpdateTime: 0,
      fetchCount: 0,
      errorCount: 0,
      averageInterval: this.BASE_INTERVAL,
    };

    metrics.errorCount++;
    this.metrics.set(sourceId, metrics);
  }

  /**
   * Check if source should be fetched now
   */
  shouldFetch(sourceId: string, expectedFrequency?: number): boolean {
    const metrics = this.metrics.get(sourceId);
    if (!metrics || metrics.fetchCount === 0) {
      return true; // First fetch
    }

    const interval = this.getInterval(sourceId, expectedFrequency);
    const timeSinceLastFetch = Date.now() - metrics.lastFetchTime;
    
    return timeSinceLastFetch >= interval;
  }

  /**
   * Get time until next fetch
   */
  getTimeUntilNextFetch(sourceId: string, expectedFrequency?: number): number {
    const metrics = this.metrics.get(sourceId);
    if (!metrics || metrics.fetchCount === 0) {
      return 0; // Can fetch immediately
    }

    const interval = this.getInterval(sourceId, expectedFrequency);
    const timeSinceLastFetch = Date.now() - metrics.lastFetchTime;
    const timeUntilNext = interval - timeSinceLastFetch;
    
    return Math.max(0, timeUntilNext);
  }

  /**
   * Reset metrics for a source
   */
  reset(sourceId: string): void {
    this.metrics.delete(sourceId);
  }

  /**
   * Get all metrics (for debugging)
   */
  getMetrics(): Map<string, SourceMetrics> {
    return new Map(this.metrics);
  }
}

// Export singleton instance
export const adaptiveRateLimiter = new AdaptiveRateLimiter();

