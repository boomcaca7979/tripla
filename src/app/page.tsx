import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "tripla - Plan Your Next Adventure with AI",
  description:
    "Create personalized travel itineraries with real-time flight data, weather scoring, and AI recommendations. Free to start.",
};

export default function Home() {
  return <HomeClient />;
}
