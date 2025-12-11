/**
 * Response Optimization Middleware
 * 
 * Adds compression, caching headers, and other performance optimizations
 */

/**
 * Add performance headers to response
 */
export function addPerformanceHeaders(response: Response, options?: {
  cacheMaxAge?: number;
  enableCompression?: boolean;
}): Response {
  const headers = new Headers(response.headers);
  
  // Cache headers for static assets
  if (options?.cacheMaxAge) {
    headers.set("Cache-Control", `public, max-age=${options.cacheMaxAge}, immutable`);
  } else {
    // Default: no cache for API responses
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
  }
  
  // Security headers
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "1; mode=block");
  
  // Performance hints
  headers.set("X-DNS-Prefetch-Control", "on");
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Compress response if supported
 */
export function compressResponse(response: Response, acceptEncoding: string | null): Response {
  if (!acceptEncoding || !response.body) {
    return response;
  }
  
  // Bun automatically handles compression, but we can add headers
  const headers = new Headers(response.headers);
  
  if (acceptEncoding.includes("gzip")) {
    headers.set("Content-Encoding", "gzip");
  } else if (acceptEncoding.includes("br")) {
    headers.set("Content-Encoding", "br");
  } else if (acceptEncoding.includes("deflate")) {
    headers.set("Content-Encoding", "deflate");
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Optimize JSON response
 */
export function optimizeJsonResponse(data: any, options?: {
  cacheMaxAge?: number;
}): Response {
  const response = Response.json(data, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  
  return addPerformanceHeaders(response, options);
}

