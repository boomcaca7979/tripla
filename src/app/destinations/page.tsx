import type { Metadata } from "next";
import DestinationsClient from "./DestinationsClient";

export const metadata: Metadata = {
  title: "Explore Destinations",
  description:
    "Discover curated travel destinations worldwide with AI-powered recommendations.",
};

export default function DestinationsPage() {
  return <DestinationsClient />;
}
