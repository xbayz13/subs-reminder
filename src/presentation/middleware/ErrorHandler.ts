/**
 * Error Handler Middleware
 * 
 * Centralized error handling for API routes
 */

export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: unknown): Response {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return Response.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return Response.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }

  return Response.json(
    {
      error: "Unknown error occurred",
    },
    { status: 500 }
  );
}

/**
 * Wrap route handler with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<Response> | Response>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}

