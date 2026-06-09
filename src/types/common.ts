/**
 * Common type definitions used across the travel planner application.
 *
 * @module types/common
 */

/** Generic wrapper for API responses. */
export interface ApiResponse<T> {
  data: T | null;
  error: AppError | null;
  loading: boolean;
}

/** Standardised application error object. */
export interface AppError {
  /** Machine-readable error code (e.g. "RATE_LIMIT", "NOT_FOUND"). */
  code: string;
  /** Human-readable description of what went wrong. */
  message: string;
  /** HTTP status code when the error originates from a network request. */
  statusCode?: number;
}

/**
 * Lifecycle states for an async operation.
 * - `idle`: no request has been made yet
 * - `loading`: request is in flight
 * - `success`: request completed successfully
 * - `error`: request failed
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/** Generic wrapper for paginated API responses. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
