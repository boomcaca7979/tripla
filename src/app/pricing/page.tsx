import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free, upgrade anytime. AI itinerary, flights, weather, currency, and more.",
};

export default function PricingPage() {
  return <PricingClient />;
}
