import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FlightLeg } from "../types/flight";
import type { Itinerary, TravelPlanInput } from "../types/itinerary";

interface TravelStore {
  // Hydration
  _hydrated: boolean;

  // Search
  searchParams: Partial<TravelPlanInput>;
  setSearchParams: (p: Partial<TravelPlanInput>) => void;

  // Results（不持久化）
  selectedFlights: FlightLeg[];
  setSelectedFlights: (f: FlightLeg[]) => void;
  currentItinerary: Itinerary | null;
  setItinerary: (i: Itinerary | null) => void;

  // Saved（持久化）
  savedItineraries: Itinerary[];
  saveItinerary: (i: Itinerary) => void;
  removeItinerary: (id: string) => void;

  // Preferences（持久化）
  temperatureUnit: "C" | "F";
  toggleTemperatureUnit: () => void;
  preferredCurrency: string; // e.g. "USD"
  setPreferredCurrency: (c: string) => void;

  // Reset
  resetSearch: () => void;
}

export const useTravelStore = create<TravelStore>()(
  persist(
    (set) => ({
      // --- Hydration ---
      _hydrated: false,

      // --- Search ---
      searchParams: {},
      setSearchParams: (p) => set({ searchParams: p }),

      // --- Results (not persisted) ---
      selectedFlights: [],
      setSelectedFlights: (f) => set({ selectedFlights: f }),
      currentItinerary: null,
      setItinerary: (i) => set({ currentItinerary: i }),

      // --- Saved (persisted) ---
      savedItineraries: [],
      saveItinerary: (i) =>
        set((s) => ({
          savedItineraries: [...s.savedItineraries, i],
        })),
      removeItinerary: (id) =>
        set((s) => ({
          savedItineraries: s.savedItineraries.filter((it) => it.id !== id),
        })),

      // --- Preferences (persisted) ---
      temperatureUnit: "C",
      toggleTemperatureUnit: () =>
        set((s) => ({
          temperatureUnit: s.temperatureUnit === "C" ? "F" : "C",
        })),
      preferredCurrency: "USD",
      setPreferredCurrency: (c) => set({ preferredCurrency: c }),

      // --- Reset ---
      resetSearch: () =>
        set({
          searchParams: {},
          selectedFlights: [],
          currentItinerary: null,
        }),
    }),
    {
      name: "travel-store",
      partialize: (s) => ({
        // searchParams 必须持久化：MyTripPanel 的 AI 输入（style/budget/interests/
        // groupSize/dates）来自这里的用户真实搜索参数。此前只存内存态，跨页面
        // 加载（如 /trips/new → /destinations/<slug>）后丢失，AI 退回目的地默认值。
        searchParams: s.searchParams,
        savedItineraries: s.savedItineraries,
        temperatureUnit: s.temperatureUnit,
        preferredCurrency: s.preferredCurrency,
      }),
      onRehydrateStorage: () => () => {
        // Mark as hydrated after localStorage rehydration completes.
        useTravelStore.setState({ _hydrated: true });
      },
    },
  ),
);
