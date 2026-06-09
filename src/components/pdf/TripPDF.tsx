import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Itinerary } from "@/types/itinerary";
import type { FlightLeg } from "@/types/flight";

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #2563eb",
    paddingBottom: 12,
  },
  brand: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
    marginBottom: 4,
  },
  destination: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  dateRange: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  demoBadge: {
    fontSize: 9,
    color: "#b45309",
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
    marginTop: 16,
    marginBottom: 8,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 4,
  },
  flightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottom: "1px solid #f3f4f6",
  },
  flightLabel: {
    fontSize: 9,
    color: "#9ca3af",
  },
  flightValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  dayHeader: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
    marginTop: 14,
    marginBottom: 6,
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activityRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingLeft: 12,
    borderBottom: "1px solid #f9fafb",
  },
  activityTime: {
    width: 70,
    fontSize: 9,
    color: "#6b7280",
  },
  activityName: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  activityCost: {
    width: 70,
    fontSize: 10,
    textAlign: "right",
    color: "#059669",
  },
  activityDesc: {
    paddingLeft: 82,
    paddingBottom: 4,
    fontSize: 9,
    color: "#6b7280",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 8,
    borderTop: "2px solid #2563eb",
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  totalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 6,
  },
});

// ── Helpers ─────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TIME_OF_DAY_LABELS: Record<string, string> = {
  morning: "09:00",
  afternoon: "13:00",
  evening: "18:00",
  night: "21:00",
};

function isMockData(itinerary: Itinerary): boolean {
  return itinerary.days[0]?.activities[0]?.id.startsWith("mock-") ?? false;
}

// ── Props ───────────────────────────────────────────────────────────

interface TripPDFProps {
  itinerary: Itinerary;
  flights?: FlightLeg[];
}

// ── Component ───────────────────────────────────────────────────────

export default function TripPDF({ itinerary, flights }: TripPDFProps) {
  const demo = isMockData(itinerary);
  const dest = itinerary.input.destination;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>tripla</Text>
          <Text style={styles.destination}>
            {dest.city}, {dest.country}
          </Text>
          <Text style={styles.dateRange}>
            {formatDate(itinerary.input.departureDate)} —{" "}
            {formatDate(itinerary.input.returnDate)}
          </Text>
          {demo && <Text style={styles.demoBadge}>Demo Data</Text>}
        </View>

        {/* Flights */}
        {flights && flights.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Flights</Text>
            {flights.map((flight, i) => (
              <View key={i} style={styles.flightRow}>
                <View>
                  <Text style={styles.flightLabel}>Flight</Text>
                  <Text style={styles.flightValue}>
                    {flight.airline.iata} {flight.flightNumber}
                  </Text>
                </View>
                <View>
                  <Text style={styles.flightLabel}>Departure</Text>
                  <Text style={styles.flightValue}>
                    {formatTime(flight.departure.scheduledTime)}{" "}
                    {flight.departure.airport.iata}
                  </Text>
                </View>
                <View>
                  <Text style={styles.flightLabel}>Arrival</Text>
                  <Text style={styles.flightValue}>
                    {formatTime(flight.arrival.scheduledTime)}{" "}
                    {flight.arrival.airport.iata}
                  </Text>
                </View>
                <View>
                  <Text style={styles.flightLabel}>Date</Text>
                  <Text style={styles.flightValue}>
                    {formatDate(flight.departure.scheduledTime.slice(0, 10))}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Daily Itinerary */}
        <Text style={styles.sectionTitle}>Itinerary</Text>
        {itinerary.days.map((day) => (
          <View key={day.date}>
            <Text style={styles.dayHeader}>
              Day {day.dayNumber} — {formatDate(day.date)}
            </Text>
            {day.activities.map((act) => (
              <View key={act.id}>
                <View style={styles.activityRow}>
                  <Text style={styles.activityTime}>
                    {TIME_OF_DAY_LABELS[act.timeOfDay] ?? act.timeOfDay}
                  </Text>
                  <Text style={styles.activityName}>{act.name}</Text>
                  <Text style={styles.activityCost}>
                    {act.estimatedCost > 0
                      ? `${act.estimatedCost} ${itinerary.currency}`
                      : "Free"}
                  </Text>
                </View>
                {act.description && (
                  <Text style={styles.activityDesc}>{act.description}</Text>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Total Cost */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Estimated Cost</Text>
          <Text style={styles.totalValue}>
            {itinerary.totalEstimatedCost} {itinerary.currency}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by tripla</Text>
          <Text>{new Date().toLocaleDateString("en-US")}</Text>
        </View>
      </Page>
    </Document>
  );
}
