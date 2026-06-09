import { useReducer, useRef, useEffect, useCallback } from "react";
import type { FlightLeg } from "../types/flight";
import type { FlightSearchParams } from "../types/flight";
import type { AppError } from "../types/common";
import { cache, CACHE_TTL } from "../lib/cache";

type State = {
  status: "idle" | "loading" | "success" | "error";
  flights: FlightLeg[];
  error: AppError | null;
};

type Action =
  | { type: "LOADING" }
  | { type: "SUCCESS"; flights: FlightLeg[] }
  | { type: "ERROR"; error: AppError }
  | { type: "RESET" };

const initialState: State = {
  status: "idle",
  flights: [],
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOADING":
      return { ...state, status: "loading", error: null };
    case "SUCCESS":
      return { status: "success", flights: action.flights, error: null };
    case "ERROR":
      return { status: "error", flights: [], error: action.error };
    case "RESET":
      return { ...initialState };
  }
}

export function useFlightSearch() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const controllerRef = useRef<AbortController | null>(null);

  // Cancel inflight request on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const search = useCallback(async (params: FlightSearchParams) => {
    // 1. Check cache
    const key = `flight_${params.depIata}_${params.arrIata}_${params.date}`;
    const cached = cache.get<FlightLeg[]>(key);
    if (cached) {
      dispatch({ type: "SUCCESS", flights: cached });
      return;
    }

    // 2. Cancel previous inflight request
    controllerRef.current?.abort();

    // 3. Create new controller
    const controller = new AbortController();
    controllerRef.current = controller;

    // 4. Dispatch loading
    dispatch({ type: "LOADING" });

    try {
      const res = await fetch(
        `/api/flights?${new URLSearchParams(params as unknown as Record<string, string>)}`,
        { signal: controller.signal },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        dispatch({
          type: "ERROR",
          error: {
            code: body.code ?? "API_ERROR",
            message: body.message ?? `Request failed with status ${res.status}`,
            statusCode: res.status,
          },
        });
        return;
      }

      const data: FlightLeg[] = await res.json();

      // 5. Cache and dispatch
      cache.set(key, data, CACHE_TTL.FLIGHT);
      dispatch({ type: "SUCCESS", flights: data });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Ignore aborted requests
        return;
      }

      dispatch({
        type: "ERROR",
        error: {
          code: "NETWORK_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "An unexpected network error occurred",
        },
      });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    flights: state.flights,
    loading: state.status === "loading",
    error: state.error,
    search,
    reset,
  };
}
