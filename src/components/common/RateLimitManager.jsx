class RateLimitManager {
  constructor() {
    this.lastCallTime = 0;
    this.minInterval = 8000; // Increased to 8 seconds between calls
    this.queue = [];
    this.processing = false;
    this.failureCount = 0;
    this.backoffMultiplier = 1;
  }

  async executeWithRateLimit(asyncFunction) {
    return new Promise((resolve, reject) => {
      this.queue.push({ asyncFunction, resolve, reject, timestamp: Date.now() });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const { asyncFunction, resolve, reject } = this.queue.shift();
      
      try {
        // Adaptive delay based on recent failures
        const adaptiveDelay = this.minInterval * this.backoffMultiplier;
        
        // Ensure minimum interval between calls
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;
        
        if (timeSinceLastCall < adaptiveDelay) {
          const waitTime = adaptiveDelay - timeSinceLastCall;
          console.log(`Rate limiting: waiting ${waitTime}ms before next call (multiplier: ${this.backoffMultiplier})`);
          await this.sleep(waitTime);
        }

        // Execute the function with retry logic
        const result = await this.executeWithRetry(asyncFunction);
        this.lastCallTime = Date.now();
        
        // Success - reduce backoff multiplier gradually
        if (this.backoffMultiplier > 1) {
          this.backoffMultiplier = Math.max(1, this.backoffMultiplier * 0.8);
        }
        this.failureCount = 0;
        
        resolve(result);

        // Additional delay after successful call - increased
        await this.sleep(2000);

      } catch (error) {
        // Increase backoff on failure
        this.failureCount++;
        this.backoffMultiplier = Math.min(5, 1 + (this.failureCount * 0.5));
        
        reject(error);
        
        // Wait longer after failures
        await this.sleep(5000);
      }
    }

    this.processing = false;
  }

  async executeWithRetry(asyncFunction, maxRetries = 3) {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        return await asyncFunction();
      } catch (error) {
        if (error.response?.status === 429) {
          retryCount++;
          
          if (retryCount >= maxRetries) {
            throw new Error(`Rate limit exceeded after ${maxRetries} attempts. The system is currently overloaded. Please wait 10-15 minutes before trying again.`);
          }

          // Much more aggressive backoff
          const baseDelay = 15000; // 15 seconds base
          const jitter = Math.random() * 5000; // Up to 5 seconds jitter
          const backoffDelay = Math.min(baseDelay * Math.pow(3, retryCount) + jitter, 120000); // Max 2 minutes
          
          console.log(`Rate limited. Waiting ${backoffDelay}ms before retry ${retryCount}/${maxRetries}`);
          await this.sleep(backoffDelay);
        } else {
          throw error; // Re-throw non-rate-limit errors
        }
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get queue status for UI feedback
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      estimatedWaitTime: this.queue.length * (this.minInterval * this.backoffMultiplier),
      backoffMultiplier: this.backoffMultiplier,
      failureCount: this.failureCount
    };
  }

  // Force a longer cooldown period
  async forceCooldown() {
    this.backoffMultiplier = 3;
    await this.sleep(30000); // 30 second forced cooldown
  }
}

// Create singleton instance
const rateLimitManager = new RateLimitManager();

export default rateLimitManager;