"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTravelStore } from "@/store/travel";
import type { Airport } from "@/types/flight";
import type { TravelStyle, TravelInterest } from "@/types/itinerary";

// ── Types ──────────────────────────────────────────────────────────────

interface Author {
  /** "ai" = tripla AI, otherwise treated as a community author. */
  kind: "ai" | "user";
  name: string;
  avatarColor: string;
  initials: string;
}

interface Activity {
  time: string;
  name: string;
  emoji: string;
}

interface TripDay {
  day: number;
  theme: string;
  activities: Activity[];
}

interface Restaurant {
  name: string;
  cuisine: string;
  emoji: string;
}

interface Trip {
  id: string;
  title: string;
  /** Optional cover image under /public; null falls back to gradient. */
  coverImage: string | null;
  /** Fallback gradient when no cover image. */
  gradient: string;
  author: Author;
  days: number;
  estimatedCost: number;
  currency: string;
  tags: string[];
  excerpt: string;
  weatherTip: string;
  fullDays: TripDay[];
  restaurants: Restaurant[];
  city: string;
  country: string;
  airport: Airport;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
}

// ── Mock data ──────────────────────────────────────────────────────────

const TRIPS: Trip[] = [
  {
    id: "tokyo-3d-foodie",
    title: "Tokyo 3-Day Foodie Adventure",
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    gradient: "from-rose-500 to-pink-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 800,
    currency: "USD",
    tags: ["Foodie", "Shopping", "Culture"],
    excerpt:
      "Three days of sushi, ramen and Shibuya neon — a tightly packed taste of Tokyo at a relaxed pace.",
    weatherTip:
      "Aim for March–May or October–November for mild temperatures and clear skies. Summer is humid; winter is dry and cool.",
    fullDays: [
      {
        day: 1,
        theme: "Tsukiji & Shibuya",
        activities: [
          { time: "08:00", name: "Sushi breakfast at Tsukiji Outer Market", emoji: "🍣" },
          { time: "11:00", name: "Meiji Shrine & Yoyogi Park stroll", emoji: "⛩️" },
          { time: "14:00", name: "Harajuku Takeshita Street shopping", emoji: "🛍️" },
          { time: "19:00", name: "Shibuya Crossing & ramen dinner", emoji: "🍜" },
        ],
      },
      {
        day: 2,
        theme: "Asakusa & Akihabara",
        activities: [
          { time: "09:00", name: "Senso-ji Temple & Nakamise-dori", emoji: "🏯" },
          { time: "13:00", name: "Akihabara electronics & anime", emoji: "🤖" },
          { time: "17:00", name: "Ueno Park museum visit", emoji: "🖼️" },
          { time: "20:00", name: "Izakaya hopping in Shinjuku", emoji: "🍶" },
        ],
      },
      {
        day: 3,
        theme: "Shinjuku & Ginza",
        activities: [
          { time: "10:00", name: "Shinjuku Gyoen gardens", emoji: "🌸" },
          { time: "13:00", name: "Depachika (underground food hall) lunch", emoji: "🍱" },
          { time: "16:00", name: "Ginza boutique window-shopping", emoji: "💎" },
          { time: "20:00", name: "Robot Restaurant show & farewell dinner", emoji: "🤖" },
        ],
      },
    ],
    restaurants: [
      { name: "Sushi Dai", cuisine: "Sushi · $$$", emoji: "🍣" },
      { name: "Ichiran Shibuya", cuisine: "Tonkotsu ramen · $", emoji: "🍜" },
      { name: "Omoide Yokocho", cuisine: "Yakitori alley · $$", emoji: "🏮" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: {
      iata: "NRT",
      icao: "RJAA",
      name: "Narita International Airport",
      city: "Tokyo",
      country: "Japan",
      timezone: "Asia/Tokyo",
      latitude: 35.7647,
      longitude: 140.3864,
    },
    travelStyle: "foodie",
    interests: ["food", "shopping", "history"],
  },
  {
    id: "paris-weekend",
    title: "Paris Romantic Weekend",
    coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    gradient: "from-indigo-500 to-pink-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 600,
    currency: "USD",
    tags: ["Culture", "Foodie", "Couples"],
    excerpt:
      "Two art-filled days along the Seine — Louvre mornings, café afternoons, a sunset cruise, and one unforgettable dinner.",
    weatherTip:
      "April–June or September–October is ideal. Pack a light jacket even in summer — Parisian evenings cool off fast.",
    fullDays: [
      {
        day: 1,
        theme: "Louvre & Latin Quarter",
        activities: [
          { time: "09:00", name: "Louvre Museum (Mona Lisa & Venus de Milo)", emoji: "🖼️" },
          { time: "13:00", name: "Café de Flore lunch in Saint-Germain", emoji: "☕" },
          { time: "16:00", name: "Walk the Jardin du Luxembourg", emoji: "🌳" },
          { time: "20:00", name: "Seine River sunset cruise", emoji: "🌊" },
        ],
      },
      {
        day: 2,
        theme: "Montmartre & Eiffel",
        activities: [
          { time: "09:00", name: "Sacré-Cœur & Montmartre artists", emoji: "🎨" },
          { time: "13:00", name: "Eiffel Tower & Champ de Mars picnic", emoji: "🗼" },
          { time: "17:00", name: "Le Marais vintage boutiques", emoji: "🛍️" },
          { time: "20:30", name: "Le Marais wine bar dinner", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Café de Flore", cuisine: "Classic Parisian café · $$$", emoji: "☕" },
      { name: "Le Comptoir du Relais", cuisine: "Bistro · $$", emoji: "🥖" },
      { name: "Du Pain et des Idées", cuisine: "Bakery · $", emoji: "🥐" },
    ],
    city: "Paris",
    country: "France",
    airport: {
      iata: "CDG",
      icao: "LFPG",
      name: "Charles de Gaulle Airport",
      city: "Paris",
      country: "France",
      timezone: "Europe/Paris",
      latitude: 49.0097,
      longitude: 2.5479,
    },
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
  },
  {
    id: "nyc-explorer",
    title: "New York City Explorer",
    coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    gradient: "from-amber-500 to-red-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 900,
    currency: "USD",
    tags: ["Active", "Culture", "Foodie"],
    excerpt:
      "Midtown icons, Brooklyn mornings and a Broadway night — three full days of the city that never sleeps.",
    weatherTip:
      "September–October has the best weather. Winter is cold but festive; summer is hot and crowded.",
    fullDays: [
      {
        day: 1,
        theme: "Midtown Manhattan",
        activities: [
          { time: "09:00", name: "Times Square & Bryant Park", emoji: "🌃" },
          { time: "12:00", name: "Top of the Rock observation deck", emoji: "🏙️" },
          { time: "15:00", name: "MoMA or Grand Central tour", emoji: "🎨" },
          { time: "19:30", name: "Broadway show", emoji: "🎭" },
        ],
      },
      {
        day: 2,
        theme: "Central Park & Museums",
        activities: [
          { time: "08:00", name: "Central Park bike ride", emoji: "🌳" },
          { time: "12:00", name: "Metropolitan Museum of Art", emoji: "🏛️" },
          { time: "17:00", name: "Hell's Kitchen dinner", emoji: "🍽️" },
          { time: "21:00", name: "Rooftop bar in Midtown", emoji: "🍸" },
        ],
      },
      {
        day: 3,
        theme: "Brooklyn & Downtown",
        activities: [
          { time: "07:00", name: "Brooklyn Bridge walk at sunrise", emoji: "🌉" },
          { time: "11:00", name: "DUMBO & Brooklyn Flea", emoji: "🛍️" },
          { time: "15:00", name: "9/11 Memorial & One World Observatory", emoji: "🕊️" },
          { time: "20:00", name: "Greenwich Village jazz club", emoji: "🎷" },
        ],
      },
    ],
    restaurants: [
      { name: "Joe's Pizza", cuisine: "Classic NYC slice · $", emoji: "🍕" },
      { name: "Katz's Delicatessen", cuisine: "Pastrami · $$", emoji: "🥪" },
      { name: "Le Bernardin", cuisine: "French seafood · $$$$", emoji: "🦞" },
    ],
    city: "New York",
    country: "USA",
    airport: {
      iata: "JFK",
      icao: "KJFK",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "USA",
      timezone: "America/New_York",
      latitude: 40.6413,
      longitude: -73.7781,
    },
    travelStyle: "active",
    interests: ["museums", "food", "nightlife"],
  },
  {
    id: "bangkok-nightlife",
    title: "Bangkok Night Market Journey",
    coverImage: null,
    gradient: "from-orange-500 to-yellow-600",
    author: { kind: "user", name: "Lalita S.", avatarColor: "from-orange-500 to-yellow-500", initials: "LS" },
    days: 3,
    estimatedCost: 450,
    currency: "USD",
    tags: ["Foodie", "Nightlife", "Budget"],
    excerpt:
      "Street food from dusk to dawn — Chinatown skewers, floating markets, and a rooftop bar to cap it all off.",
    weatherTip:
      "November–February is cool and dry. Avoid March–May (very hot) and the heavy September rains.",
    fullDays: [
      {
        day: 1,
        theme: "Chinatown & Yaowarat",
        activities: [
          { time: "17:00", name: "Wat Pho temple visit at golden hour", emoji: "🛕" },
          { time: "19:30", name: "Yaowarat street food crawl", emoji: "🥢" },
          { time: "22:00", name: "T&K Seafood dinner", emoji: "🦐" },
        ],
      },
      {
        day: 2,
        theme: "Floating Market & Maeklong",
        activities: [
          { time: "07:00", name: "Damnoen Saduak floating market", emoji: "🛶" },
          { time: "11:00", name: "Maeklong Railway Market", emoji: "🚂" },
          { time: "16:00", name: "Chatuchak weekend market (if Sat/Sun)", emoji: "🛍️" },
          { time: "21:00", name: "Khao San Road night scene", emoji: "🎒" },
        ],
      },
      {
        day: 3,
        theme: "Rooftops & Riverside",
        activities: [
          { time: "10:00", name: "Jim Thompson House silk museum", emoji: "🏛️" },
          { time: "14:00", name: "Asiatique the Riverfront shopping", emoji: "🛒" },
          { time: "19:00", name: "Vertigo rooftop dinner", emoji: "🌃" },
          { time: "22:00", name: "Riverside bar on the Chao Phraya", emoji: "🍹" },
        ],
      },
    ],
    restaurants: [
      { name: "Jay Fai", cuisine: "Legendary street crab omelette · $$$", emoji: "🦀" },
      { name: "T&K Seafood", cuisine: "Chinatown seafood · $$", emoji: "🦐" },
      { name: "Gaggan Anand", cuisine: "Progressive Indian · $$$$", emoji: "🍛" },
    ],
    city: "Bangkok",
    country: "Thailand",
    airport: {
      iata: "BKK",
      icao: "VTBS",
      name: "Suvarnabhumi Airport",
      city: "Bangkok",
      country: "Thailand",
      timezone: "Asia/Bangkok",
      latitude: 13.69,
      longitude: 100.7501,
    },
    travelStyle: "foodie",
    interests: ["food", "nightlife", "shopping"],
  },
  {
    id: "london-cultural",
    title: "London Cultural Walk",
    coverImage: null,
    gradient: "from-slate-700 to-blue-900",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 550,
    currency: "USD",
    tags: ["History", "Museums", "Slow Travel"],
    excerpt:
      "Seven centuries of London on foot — Tower, Borough Market, the South Bank, and a free museum afternoon.",
    weatherTip:
      "May–September is the mildest. Always carry a light rain jacket — London weather is famously changeable.",
    fullDays: [
      {
        day: 1,
        theme: "The City & the South Bank",
        activities: [
          { time: "08:30", name: "Tower of London & Crown Jewels", emoji: "🏰" },
          { time: "11:00", name: "Walk across Tower Bridge", emoji: "🌉" },
          { time: "13:00", name: "Borough Market lunch", emoji: "🧀" },
          { time: "16:00", name: "Tate Modern on the South Bank", emoji: "🖼️" },
          { time: "19:30", name: "West End theatre show", emoji: "🎭" },
        ],
      },
      {
        day: 2,
        theme: "Westminster & Covent Garden",
        activities: [
          { time: "09:00", name: "Westminster Abbey & Big Ben", emoji: "🏛️" },
          { time: "12:00", name: "St. Paul's Cathedral", emoji: "⛪" },
          { time: "15:00", name: "British Museum (free)", emoji: "🏺" },
          { time: "19:00", name: "Covent Garden dinner & street performers", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Borough Market stalls", cuisine: "Street food · $", emoji: "🧀" },
      { name: "The Wolseley", cuisine: "Grand European brasserie · $$$", emoji: "🥐" },
      { name: "Sketch", cuisine: "Afternoon tea · $$$$", emoji: "🫖" },
    ],
    city: "London",
    country: "United Kingdom",
    airport: {
      iata: "LHR",
      icao: "EGLL",
      name: "London Heathrow Airport",
      city: "London",
      country: "United Kingdom",
      timezone: "Europe/London",
      latitude: 51.47,
      longitude: -0.4543,
    },
    travelStyle: "cultural",
    interests: ["history", "museums", "food"],
  },
  {
    id: "sydney-nature",
    title: "Sydney Nature Adventure",
    coverImage: null,
    gradient: "from-sky-500 to-cyan-700",
    author: { kind: "user", name: "Olivia P.", avatarColor: "from-sky-500 to-cyan-500", initials: "OP" },
    days: 3,
    estimatedCost: 700,
    currency: "USD",
    tags: ["Adventure", "Nature", "Beaches"],
    excerpt:
      "Coastal walks, hidden harbour coves and a sunrise kayak — three days of outdoor Sydney beyond the Opera House.",
    weatherTip:
      "September–November is spring perfection. February is the hottest month; June–August is mild but shorter days.",
    fullDays: [
      {
        day: 1,
        theme: "Bondi to Coogee",
        activities: [
          { time: "07:00", name: "Bondi to Coogee coastal walk", emoji: "🌊" },
          { time: "10:30", name: "Bronte Baths ocean swim", emoji: "🏊" },
          { time: "13:00", name: "Lunch at Coogee Pavilion", emoji: "🥗" },
          { time: "16:00", name: "Tamarama beach sunset", emoji: "🌅" },
        ],
      },
      {
        day: 2,
        theme: "Harbour & North Head",
        activities: [
          { time: "06:30", name: "Sunrise kayak from Mosman", emoji: "🛶" },
          { time: "10:00", name: "Taronga Zoo", emoji: "🦘" },
          { time: "14:00", name: "Manly beach & Corso", emoji: "🏖️" },
          { time: "19:00", name: "Harbour dinner cruise", emoji: "⛵" },
        ],
      },
      {
        day: 3,
        theme: "Blue Mountains Day Trip",
        activities: [
          { time: "07:00", name: "Drive to Blue Mountains", emoji: "🚗" },
          { time: "09:30", name: "Three Sisters lookout", emoji: "🏔️" },
          { time: "12:00", name: "Scenic World rides", emoji: "🚞" },
          { time: "16:00", name: "Leura village coffee & return", emoji: "☕" },
        ],
      },
    ],
    restaurants: [
      { name: "Quay Restaurant", cuisine: "Modern Australian · $$$$", emoji: "🍽️" },
      { name: "Bondi Icebergs Club", cuisine: "Italian with a view · $$$", emoji: "🍝" },
      { name: "Mr. Wong", cuisine: "Cantonese · $$$", emoji: "🥟" },
    ],
    city: "Sydney",
    country: "Australia",
    airport: {
      iata: "SYD",
      icao: "YSSY",
      name: "Sydney Kingsford Smith Airport",
      city: "Sydney",
      country: "Australia",
      timezone: "Australia/Sydney",
      latitude: -33.9399,
      longitude: 151.1753,
    },
    travelStyle: "active",
    interests: ["nature", "beaches", "food"],
  },
  // ── China ───────────────────────────────────────────────────────────
  {
    id: "beijing-cultural-escape",
    title: "Beijing Cultural Escape",
    coverImage: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    gradient: "from-red-600 to-orange-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 2800,
    currency: "CNY",
    tags: ["Culture", "History", "Foodie"],
    excerpt:
      "Three days through imperial Beijing — the Forbidden City, the Great Wall, and hutong alleyways alive with local flavor.",
    weatherTip:
      "Best in spring (April–May) and autumn (September–October). Summers are hot and humid; winters are cold and dry.",
    fullDays: [
      {
        day: 1,
        theme: "Forbidden City & Tiananmen",
        activities: [
          { time: "08:30", name: "Tiananmen Square morning walk", emoji: "🏛️" },
          { time: "09:30", name: "Forbidden City full tour", emoji: "🏯" },
          { time: "14:00", name: "Jingshan Park panoramic view", emoji: "⛰️" },
          { time: "17:00", name: "Hutong rickshaw ride & courtyard visit", emoji: "🛒" },
          { time: "19:30", name: "Peking roast duck dinner", emoji: "🦆" },
        ],
      },
      {
        day: 2,
        theme: "Great Wall & Olympic Park",
        activities: [
          { time: "07:00", name: "Mutianyu Great Wall hike", emoji: "🧱" },
          { time: "13:00", name: "Farmhouse lunch near the Wall", emoji: "🍲" },
          { time: "16:00", name: "Bird's Nest & Water Cube exterior", emoji: "🏟️" },
          { time: "19:00", name: "Wangfujing snack street", emoji: "🍢" },
        ],
      },
      {
        day: 3,
        theme: "Temple of Heaven & Nanluoguxiang",
        activities: [
          { time: "08:00", name: "Temple of Heaven morning locals", emoji: "⛩️" },
          { time: "11:00", name: "Pearl Market bargaining", emoji: "💎" },
          { time: "14:00", name: "Nanluoguxiang hutong café crawl", emoji: "☕" },
          { time: "18:00", name: "Houhai lakeside bar stroll", emoji: "🌙" },
        ],
      },
    ],
    restaurants: [
      { name: "Quanjude Roast Duck", cuisine: "Peking duck · $$$", emoji: "🦆" },
      { name: "Siji Minfu", cuisine: "Beijing home-style · $$", emoji: "🍲" },
      { name: "Yaoji Chaogan", cuisine: "Breakfast noodles · $", emoji: "🍜" },
    ],
    city: "Beijing",
    country: "China",
    airport: {
      iata: "PEK",
      icao: "ZBAA",
      name: "Beijing Capital International Airport",
      city: "Beijing",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 40.0799,
      longitude: 116.6031,
    },
    travelStyle: "cultural",
    interests: ["history", "museums", "food"],
  },
  {
    id: "shanghai-urban-experience",
    title: "Shanghai Urban Experience",
    coverImage: "https://images.unsplash.com/photo-1537531383496-f4749b76ceba?w=800&q=80",
    gradient: "from-violet-600 to-purple-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 3000,
    currency: "CNY",
    tags: ["Urban", "Foodie", "Shopping"],
    excerpt:
      "East meets West in Shanghai — the Bund at sunset, Yu Garden serenity, and Lujiazui's glittering skyline.",
    weatherTip:
      "Spring (March–May) and autumn (September–November) are ideal. Summers are hot and humid; winters are chilly.",
    fullDays: [
      {
        day: 1,
        theme: "The Bund & Nanjing Road",
        activities: [
          { time: "09:00", name: "Nanjing Road pedestrian shopping", emoji: "🛍️" },
          { time: "12:00", name: "Xiaolongbao lunch at Jia Jia Tang Bao", emoji: "🥟" },
          { time: "15:00", name: "Bund waterfront promenade", emoji: "🏙️" },
          { time: "19:00", name: "Huangpu River night cruise", emoji: "🚢" },
        ],
      },
      {
        day: 2,
        theme: "Yu Garden & French Concession",
        activities: [
          { time: "09:00", name: "Yu Garden & City God Temple", emoji: "🏯" },
          { time: "11:30", name: "Breakfast snacks at Yu Garden Bazaar", emoji: "🥮" },
          { time: "14:00", name: "Tianzifang arts & crafts alleys", emoji: "🎨" },
          { time: "17:00", name: "French Concession café hopping", emoji: "☕" },
          { time: "20:00", name: "Xintiandi nightlife", emoji: "🍸" },
        ],
      },
      {
        day: 3,
        theme: "Lujiazui & Pudong",
        activities: [
          { time: "09:00", name: "Shanghai Tower observation deck", emoji: "🏙️" },
          { time: "12:00", name: "Oriental Pearl Tower area lunch", emoji: "🗼" },
          { time: "15:00", name: "Shanghai Museum bronze & ceramics", emoji: "🏺" },
          { time: "19:00", name: "Lujiazui skyline dinner", emoji: "🌃" },
        ],
      },
    ],
    restaurants: [
      { name: "Jia Jia Tang Bao", cuisine: "Soup dumplings · $", emoji: "🥟" },
      { name: "M on the Bund", cuisine: "European fine dining · $$$$", emoji: "🍷" },
      { name: "Din Tai Fung", cuisine: "Taiwanese dumplings · $$", emoji: "🥟" },
    ],
    city: "Shanghai",
    country: "China",
    airport: {
      iata: "PVG",
      icao: "ZSPD",
      name: "Shanghai Pudong International Airport",
      city: "Shanghai",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 31.1443,
      longitude: 121.8083,
    },
    travelStyle: "cultural",
    interests: ["food", "shopping", "nightlife"],
  },
  {
    id: "guangzhou-foodie-journey",
    title: "Guangzhou Foodie Journey",
    coverImage: null,
    gradient: "from-amber-500 to-red-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 1800,
    currency: "CNY",
    tags: ["Foodie", "Culture", "Budget"],
    excerpt:
      "Cantonese dim sum paradise — morning yum cha, Pearl River night cruise, and street food that defines a culinary capital.",
    weatherTip:
      "October–December is the most pleasant. Spring is rainy; summer is hot and humid with typhoons possible.",
    fullDays: [
      {
        day: 1,
        theme: "Dim Sum & Old Town",
        activities: [
          { time: "08:00", name: "Traditional yum cha at Guangzhou Restaurant", emoji: "🫖" },
          { time: "11:00", name: "Shamian Island colonial architecture walk", emoji: "🏛️" },
          { time: "14:00", name: "Chen Clan Ancestral Hall", emoji: "🏯" },
          { time: "18:00", name: "Shangxiajiu pedestrian street snacks", emoji: "🍢" },
          { time: "20:30", name: "Pearl River night cruise", emoji: "🌊" },
        ],
      },
      {
        day: 2,
        theme: "Markets & Canton Tower",
        activities: [
          { time: "08:30", name: "Point Court dim sum breakfast", emoji: "🥟" },
          { time: "11:00", name: "Qingping Market exotic ingredients tour", emoji: "🥬" },
          { time: "15:00", name: "Canton Tower skywalk", emoji: "🗼" },
          { time: "18:00", name: "Beijing Road street food dinner", emoji: "🍜" },
        ],
      },
    ],
    restaurants: [
      { name: "Guangzhou Restaurant", cuisine: "Classic Cantonese · $$", emoji: "🫖" },
      { name: "Bingsheng Taste", cuisine: "Cantonese seafood · $$$", emoji: "🦐" },
      { name: "Yinji Rice Roll", cuisine: "Rice noodle rolls · $", emoji: "🍚" },
    ],
    city: "Guangzhou",
    country: "China",
    airport: {
      iata: "CAN",
      icao: "ZGGG",
      name: "Guangzhou Baiyun International Airport",
      city: "Guangzhou",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 23.3925,
      longitude: 113.2988,
    },
    travelStyle: "foodie",
    interests: ["food", "museums"],
  },
  {
    id: "chengdu-slow-life",
    title: "Chengdu Slow Life",
    coverImage: null,
    gradient: "from-green-600 to-emerald-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 2000,
    currency: "CNY",
    tags: ["Slow Travel", "Foodie", "Nature"],
    excerpt:
      "Panda encounters, fiery hotpot nights, and wide-and-narrow alleyway strolls — Chengdu's signature laid-back charm.",
    weatherTip:
      "March–June and September–November are best. Summers are hot and muggy; winters are grey and damp.",
    fullDays: [
      {
        day: 1,
        theme: "Panda Base & Hotpot",
        activities: [
          { time: "07:30", name: "Chengdu Research Base of Giant Panda Breeding", emoji: "🐼" },
          { time: "12:00", name: "Chunxi Road lunch & shopping", emoji: "🛍️" },
          { time: "15:00", name: "People's Park teahouse afternoon", emoji: "🍵" },
          { time: "18:30", name: "Authentic Sichuan hotpot dinner", emoji: "🌶️" },
        ],
      },
      {
        day: 2,
        theme: "Kuanzhai Alley & Wuhou Shrine",
        activities: [
          { time: "09:00", name: "Wuhou Shrine & Jinli Ancient Street", emoji: "⛩️" },
          { time: "12:30", name: "Kuanzhai Alley snack crawl", emoji: "🍢" },
          { time: "15:00", name: "Sichuan Opera face-changing show", emoji: "🎭" },
          { time: "19:00", name: "Jiuyanqiao bar street night out", emoji: "🍸" },
        ],
      },
      {
        day: 3,
        theme: "Dujiangyan Day Trip",
        activities: [
          { time: "08:00", name: "Drive to Dujiangyan Irrigation System", emoji: "🌊" },
          { time: "11:00", name: "Mount Qingcheng Taoist temple hike", emoji: "🏔️" },
          { time: "15:00", name: "Dujiangyan old town stroll", emoji: "🏘️" },
          { time: "18:00", name: "Return to Chengdu & farewell dinner", emoji: "🍲" },
        ],
      },
    ],
    restaurants: [
      { name: "Haidilao Hotpot", cuisine: "Sichuan hotpot · $$", emoji: "🌶️" },
      { name: "Chen Mapo Tofu", cuisine: "Mapo tofu origin · $", emoji: "🧈" },
      { name: "Long Chao Shou", cuisine: "Wontons & snacks · $", emoji: "🥟" },
    ],
    city: "Chengdu",
    country: "China",
    airport: {
      iata: "CTU",
      icao: "ZUUU",
      name: "Chengdu Shuangliu International Airport",
      city: "Chengdu",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 30.5785,
      longitude: 103.9471,
    },
    travelStyle: "relaxed",
    interests: ["food", "nature", "museums"],
  },
  {
    id: "xian-historical-journey",
    title: "Xi'an Historical Journey",
    coverImage: null,
    gradient: "from-yellow-600 to-amber-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 1800,
    currency: "CNY",
    tags: ["History", "Culture", "Foodie"],
    excerpt:
      "The ancient capital reveals its secrets — Terracotta Warriors, Big Wild Goose Pagoda, and Muslim Quarter feasts.",
    weatherTip:
      "Spring (March–May) and autumn (September–November) offer the best weather. Summers are hot; winters are cold.",
    fullDays: [
      {
        day: 1,
        theme: "Terracotta Warriors & City Wall",
        activities: [
          { time: "08:00", name: "Terracotta Warriors Museum", emoji: "🗿" },
          { time: "13:00", name: "Lishan Garden & lunch", emoji: "🍲" },
          { time: "16:00", name: "Ancient City Wall bike ride", emoji: "🚲" },
          { time: "19:00", name: "Muslim Quarter street food", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "Big Wild Goose Pagoda & Museums",
        activities: [
          { time: "09:00", name: "Big Wild Goose Pagoda & Da Ci'en Temple", emoji: "🏛️" },
          { time: "12:00", name: "Shaanxi History Museum", emoji: "🏺" },
          { time: "16:00", name: "Small Wild Goose Pagoda park", emoji: "⛩️" },
          { time: "20:00", name: "Datang Everbright City night show", emoji: "🎆" },
        ],
      },
      {
        day: 3,
        theme: "Huashan Day Trip",
        activities: [
          { time: "07:00", name: "High-speed train to Mount Huashan", emoji: "🚄" },
          { time: "09:30", name: "Cable car up & plank walk", emoji: "🏔️" },
          { time: "14:00", name: "Summit views & descent", emoji: "⛰️" },
          { time: "18:30", name: "Return to Xi'an & dumpling banquet", emoji: "🥟" },
        ],
      },
    ],
    restaurants: [
      { name: "Defachang Dumplings", cuisine: "Dumpling banquet · $$", emoji: "🥟" },
      { name: "Lao Sun Jia", cuisine: "Yangrou paomo (lamb soup) · $$", emoji: "🐑" },
      { name: "Muslim Quarter stalls", cuisine: "Roujiamo & biangbiang noodles · $", emoji: "🥙" },
    ],
    city: "Xi'an",
    country: "China",
    airport: {
      iata: "XIY",
      icao: "ZLXY",
      name: "Xi'an Xianyang International Airport",
      city: "Xi'an",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 34.4471,
      longitude: 108.7519,
    },
    travelStyle: "cultural",
    interests: ["history", "museums", "food"],
  },
  {
    id: "hangzhou-west-lake-poetry",
    title: "Hangzhou West Lake Poetry",
    coverImage: null,
    gradient: "from-teal-500 to-cyan-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 1600,
    currency: "CNY",
    tags: ["Nature", "Culture", "Slow Travel"],
    excerpt:
      "Poetic West Lake mornings, Lingyin Temple serenity, and Longjing tea fields — Hangzhou in its gentlest form.",
    weatherTip:
      "March–May and September–November are perfect. Plum blossoms bloom in February; lotus flowers peak in July.",
    fullDays: [
      {
        day: 1,
        theme: "West Lake & Lingyin Temple",
        activities: [
          { time: "08:00", name: "West Lake boat ride & Broken Bridge", emoji: "🛶" },
          { time: "11:00", name: "Lingyin Temple & Feilai Peak carvings", emoji: "⛩️" },
          { time: "14:00", name: "Longjing Village tea tasting", emoji: "🍵" },
          { time: "17:30", name: "Leifeng Pagoda sunset", emoji: "🌅" },
          { time: "19:30", name: "Impression West Lake night show", emoji: "🎭" },
        ],
      },
      {
        day: 2,
        theme: "Tea Fields & Hefang Street",
        activities: [
          { time: "08:30", name: "Meijiawu tea plantation walk", emoji: "🌿" },
          { time: "11:00", name: "China National Tea Museum", emoji: "🍵" },
          { time: "14:00", name: "Hefang Street souvenir shopping", emoji: "🛍️" },
          { time: "16:00", name: "Xixi National Wetland Park", emoji: "🦆" },
        ],
      },
    ],
    restaurants: [
      { name: "Lou Wai Lou", cuisine: "West Lake vinegar fish · $$$", emoji: "🐟" },
      { name: "Zhi Wei Guan", cuisine: "Hangzhou snacks · $", emoji: "🥟" },
      { name: "Longjing Village teahouse", cuisine: "Farm-to-table · $$", emoji: "🍵" },
    ],
    city: "Hangzhou",
    country: "China",
    airport: {
      iata: "HGH",
      icao: "ZSHC",
      name: "Hangzhou Xiaoshan International Airport",
      city: "Hangzhou",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 30.2348,
      longitude: 120.4293,
    },
    travelStyle: "relaxed",
    interests: ["nature", "museums", "food"],
  },
  {
    id: "chongqing-mountain-adventure",
    title: "Chongqing Mountain Adventure",
    coverImage: null,
    gradient: "from-rose-700 to-red-900",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 2000,
    currency: "CNY",
    tags: ["Adventure", "Foodie", "Nightlife"],
    excerpt:
      "Cyberpunk mountain city magic — Hongyadong's glowing tiers, fiery Chongqing hotpot, and a Yangtze River cableway ride.",
    weatherTip:
      "Spring (March–May) and autumn (October–November) are best. Summers are extremely hot; winters are foggy and mild.",
    fullDays: [
      {
        day: 1,
        theme: "Hongyadong & Jiefangbei",
        activities: [
          { time: "10:00", name: "Jiefangbei pedestrian street", emoji: "🏙️" },
          { time: "12:00", name: "Chongqing hotpot lunch", emoji: "🌶️" },
          { time: "15:00", name: "Yangtze River Cableway ride", emoji: "🚡" },
          { time: "19:00", name: "Hongyadong night view & snacks", emoji: "🏮" },
        ],
      },
      {
        day: 2,
        theme: "Ciqikou & Liziba",
        activities: [
          { time: "09:00", name: "Ciqikou Ancient Town stroll", emoji: "🏘️" },
          { time: "12:00", name: "Chen Mahua snack crawl", emoji: "🍡" },
          { time: "14:30", name: "Liziba monorail through building", emoji: "🚝" },
          { time: "17:00", name: "Eling Park panoramic view", emoji: "⛰️" },
          { time: "20:00", name: "Nanbin Road riverside dinner", emoji: "🌃" },
        ],
      },
      {
        day: 3,
        theme: "Wulong Karst Day Trip",
        activities: [
          { time: "07:00", name: "Drive to Wulong Karst Geopark", emoji: "🚗" },
          { time: "10:00", name: "Three Natural Bridges hike", emoji: "🌉" },
          { time: "13:00", name: "Furong Cave exploration", emoji: "🕳️" },
          { time: "17:00", name: "Return & farewell hotpot", emoji: "🌶️" },
        ],
      },
    ],
    restaurants: [
      { name: "Xiaolongkan Hotpot", cuisine: "Chongqing spicy hotpot · $$", emoji: "🌶️" },
      { name: "Haochi Street stalls", cuisine: "Street food · $", emoji: "🍢" },
      { name: "Shancheng Xiaotang", cuisine: "Chongqing noodles · $", emoji: "🍜" },
    ],
    city: "Chongqing",
    country: "China",
    airport: {
      iata: "CKG",
      icao: "ZUCK",
      name: "Chongqing Jiangbei International Airport",
      city: "Chongqing",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 29.7192,
      longitude: 106.6417,
    },
    travelStyle: "active",
    interests: ["food", "sports", "nightlife"],
  },
  {
    id: "hongkong-shopping-foodie",
    title: "Hong Kong Shopping & Foodie",
    coverImage: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80",
    gradient: "from-sky-600 to-indigo-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 3500,
    currency: "CNY",
    tags: ["Shopping", "Foodie", "Urban"],
    excerpt:
      "Victoria Harbour panoramas, Victoria Peak sunsets, and dim sum feasts — Hong Kong in 48 electrifying hours.",
    weatherTip:
      "October–December is the best time. Summers are hot, humid, and typhoon-prone; spring is rainy.",
    fullDays: [
      {
        day: 1,
        theme: "Victoria Harbour & Central",
        activities: [
          { time: "09:00", name: "Star Ferry across Victoria Harbour", emoji: "⛴️" },
          { time: "10:30", name: "Central Mid-Levels escalator & Soho", emoji: "🏙️" },
          { time: "13:00", name: "Dim sum lunch at Tim Ho Wan", emoji: "🥟" },
          { time: "16:00", name: "Causeway Bay shopping spree", emoji: "🛍️" },
          { time: "20:00", name: "A Symphony of Lights harbour show", emoji: "🌃" },
        ],
      },
      {
        day: 2,
        theme: "Victoria Peak & Mong Kok",
        activities: [
          { time: "08:00", name: "Victoria Peak tram & morning view", emoji: "🏔️" },
          { time: "11:00", name: "Lan Kwai Fong brunch", emoji: "☕" },
          { time: "14:00", name: "Mong Kok street markets (Ladies Market)", emoji: "🛒" },
          { time: "17:00", name: "Tsim Sha Tsui promenade sunset", emoji: "🌅" },
          { time: "19:30", name: "Char siu & egg tart dinner", emoji: "🥧" },
        ],
      },
    ],
    restaurants: [
      { name: "Tim Ho Wan", cuisine: "Michelin dim sum · $$", emoji: "🥟" },
      { name: "Yat Lok Roast Goose", cuisine: "Cantonese roast goose · $$", emoji: "🦆" },
      { name: "Australia Dairy Company", cuisine: "HK-style café · $", emoji: "🥛" },
    ],
    city: "Hong Kong",
    country: "China",
    airport: {
      iata: "HKG",
      icao: "VHHH",
      name: "Hong Kong International Airport",
      city: "Hong Kong",
      country: "China",
      timezone: "Asia/Hong_Kong",
      latitude: 22.308,
      longitude: 113.9185,
    },
    travelStyle: "active",
    interests: ["shopping", "food", "nightlife"],
  },
  {
    id: "macau-portuguese-charm",
    title: "Macau Portuguese Charm",
    coverImage: null,
    gradient: "from-amber-600 to-yellow-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 2500,
    currency: "CNY",
    tags: ["Culture", "Foodie", "Couples"],
    excerpt:
      "Portuguese heritage meets casino glamour — Ruins of St. Paul's, Venetian canals, and egg tart bliss in Macau.",
    weatherTip:
      "October–March is the most pleasant. Summers are hot and typhoon-prone; autumn is the driest season.",
    fullDays: [
      {
        day: 1,
        theme: "Historic Centre & Egg Tarts",
        activities: [
          { time: "09:00", name: "Ruins of St. Paul's & Mount Fortress", emoji: "⛪" },
          { time: "11:00", name: "Senado Square & St. Dominic's Church", emoji: "🏛️" },
          { time: "13:00", name: "Margaret's Café e Nata egg tart lunch", emoji: "🥧" },
          { time: "15:00", name: "A-Ma Temple & Barra Square", emoji: "⛩️" },
          { time: "19:00", name: "Taipa Village Portuguese dinner", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Cotai Strip & Coloane",
        activities: [
          { time: "09:00", name: "The Venetian gondola ride", emoji: "🛶" },
          { time: "11:30", name: "Cotai Strip casino hopping", emoji: "🎰" },
          { time: "14:00", name: "Coloane Village & Lord Stow's Bakery", emoji: "🥧" },
          { time: "16:30", name: "Hac Sa Beach & Fernando's dinner", emoji: "🏖️" },
        ],
      },
    ],
    restaurants: [
      { name: "Lord Stow's Bakery", cuisine: "Portuguese egg tarts · $", emoji: "🥧" },
      { name: "Fernando's", cuisine: "Portuguese · $$", emoji: "🍷" },
      { name: "A Lorcha", cuisine: "Macanese · $$", emoji: "🦐" },
    ],
    city: "Macau",
    country: "China",
    airport: {
      iata: "MFM",
      icao: "VMMC",
      name: "Macau International Airport",
      city: "Macau",
      country: "China",
      timezone: "Asia/Macau",
      latitude: 22.1496,
      longitude: 113.5914,
    },
    travelStyle: "cultural",
    interests: ["museums", "food", "nightlife"],
  },
  // ── Asia (non-China) ────────────────────────────────────────────────
  {
    id: "seoul-k-culture",
    title: "Seoul K-Culture Experience",
    coverImage: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
    gradient: "from-pink-500 to-violet-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 450000,
    currency: "KRW",
    tags: ["Culture", "Shopping", "Foodie"],
    excerpt:
      "K-wave meets ancient Joseon — Gyeongbokgung palaces, Myeongdong shopping sprees, and N Seoul Tower sunsets.",
    weatherTip:
      "April–June and September–November are ideal. Summers are hot and rainy; winters are cold and dry.",
    fullDays: [
      {
        day: 1,
        theme: "Palaces & Hanok Village",
        activities: [
          { time: "09:00", name: "Gyeongbokgung Palace & guard ceremony", emoji: "🏯" },
          { time: "12:00", name: "Bukchon Hanok Village walk", emoji: "🏘️" },
          { time: "14:30", name: "Insadong crafts & tea houses", emoji: "🍵" },
          { time: "18:00", name: "Gwangjang Market street food", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "Myeongdong & N Seoul Tower",
        activities: [
          { time: "10:00", name: "Myeongdong K-beauty shopping", emoji: "🛍️" },
          { time: "13:00", name: "Korean BBQ lunch", emoji: "🥩" },
          { time: "16:00", name: "N Seoul Tower cable car & view", emoji: "🗼" },
          { time: "19:30", name: "Hongdae indie music & nightlife", emoji: "🎵" },
        ],
      },
      {
        day: 3,
        theme: "DMZ or Gangnam",
        activities: [
          { time: "08:00", name: "DMZ tour (or COEX Mall & Starfield Library)", emoji: "📚" },
          { time: "13:00", name: "Gangnam style lunch & café", emoji: "☕" },
          { time: "16:00", name: "Cheonggyecheon stream stroll", emoji: "🌊" },
          { time: "19:00", name: "Itaewon international dinner", emoji: "🍽️" },
        ],
      },
    ],
    restaurants: [
      { name: "Jyoti Indian Cuisine", cuisine: "Korean BBQ · $$", emoji: "🥩" },
      { name: "Gwangjang Market", cuisine: "Bindaetteok & gimbap · $", emoji: "🥞" },
      { name: "Café Onion", cuisine: "Trendy bakery · $$", emoji: "🥐" },
    ],
    city: "Seoul",
    country: "South Korea",
    airport: {
      iata: "ICN",
      icao: "RKSI",
      name: "Incheon International Airport",
      city: "Seoul",
      country: "South Korea",
      timezone: "Asia/Seoul",
      latitude: 37.46,
      longitude: 126.44,
    },
    travelStyle: "cultural",
    interests: ["shopping", "food", "history"],
  },
  {
    id: "singapore-garden-city",
    title: "Singapore Garden City",
    coverImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
    gradient: "from-emerald-500 to-teal-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 600,
    currency: "SGD",
    tags: ["Urban", "Foodie", "Nature"],
    excerpt:
      "Futuristic gardens, hawker centre feasts, and Sentosa sunsets — Singapore packs a continent into a city.",
    weatherTip:
      "Year-round tropical climate. February–April is the driest; November–January has the most rain.",
    fullDays: [
      {
        day: 1,
        theme: "Marina Bay & Gardens",
        activities: [
          { time: "09:00", name: "Gardens by the Bay & Cloud Forest", emoji: "🌳" },
          { time: "13:00", name: "Lau Pa Sat hawker lunch", emoji: "🍜" },
          { time: "16:00", name: "Marina Bay Sands SkyPark", emoji: "🏙️" },
          { time: "20:00", name: "Spectra light & water show", emoji: "🎆" },
        ],
      },
      {
        day: 2,
        theme: "Sentosa Island",
        activities: [
          { time: "09:00", name: "Universal Studios Singapore", emoji: "🎢" },
          { time: "14:00", name: "Sentosa beach & cable car", emoji: "🏖️" },
          { time: "18:00", name: "Chinatown dinner & night market", emoji: "🏮" },
        ],
      },
      {
        day: 3,
        theme: "Chinatown & Little India",
        activities: [
          { time: "09:00", name: "Buddha Tooth Relic Temple", emoji: "⛩️" },
          { time: "11:30", name: "Little India & Mustafa Centre", emoji: "🛍️" },
          { time: "14:00", name: "Kampong Glam & Haji Lane", emoji: "🎨" },
          { time: "18:00", name: "Clarke Quay riverside dinner", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Lau Pa Sat", cuisine: "Hawker centre · $", emoji: "🍜" },
      { name: "Tim Ho Wan", cuisine: "Dim sum · $$", emoji: "🥟" },
      { name: "Jumbo Seafood", cuisine: "Chili crab · $$$", emoji: "🦀" },
    ],
    city: "Singapore",
    country: "Singapore",
    airport: {
      iata: "SIN",
      icao: "WSSS",
      name: "Singapore Changi Airport",
      city: "Singapore",
      country: "Singapore",
      timezone: "Asia/Singapore",
      latitude: 1.3644,
      longitude: 103.9915,
    },
    travelStyle: "active",
    interests: ["food", "nature", "shopping"],
  },
  {
    id: "osaka-food-capital",
    title: "Osaka Food Capital",
    coverImage: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80",
    gradient: "from-orange-500 to-red-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 80000,
    currency: "JPY",
    tags: ["Foodie", "Culture", "Shopping"],
    excerpt:
      "Japan's kitchen — Dotonbori neon, Osaka Castle, and Universal Studios in three unforgettable days.",
    weatherTip:
      "Spring (March–May) and autumn (October–November) are best. Summers are hot and humid.",
    fullDays: [
      {
        day: 1,
        theme: "Dotonbori & Namba",
        activities: [
          { time: "10:00", name: "Kuromon Market fresh seafood", emoji: "🐟" },
          { time: "13:00", name: "Dotonbori food crawl (takoyaki & okonomiyaki)", emoji: "🐙" },
          { time: "16:00", name: "Shinsaibashi shopping street", emoji: "🛍️" },
          { time: "19:00", name: "Hozenji Temple alley & yakitori", emoji: "🏮" },
        ],
      },
      {
        day: 2,
        theme: "Osaka Castle & Universal",
        activities: [
          { time: "09:00", name: "Osaka Castle & park", emoji: "🏯" },
          { time: "12:00", name: "Universal Studios Japan", emoji: "🎢" },
          { time: "20:00", name: "Namba Yasaka Shrine night view", emoji: "⛩️" },
        ],
      },
      {
        day: 3,
        theme: "Kobe Day Trip & Umeda",
        activities: [
          { time: "08:30", name: "Kobe beef lunch in Chinatown", emoji: "🥩" },
          { time: "12:00", name: "Kobe Port Tower & Meriken Park", emoji: "🗼" },
          { time: "16:00", name: "Umeda Sky Building floating garden", emoji: "🏙️" },
          { time: "19:00", name: "Farewell kushikatsu dinner", emoji: "🍢" },
        ],
      },
    ],
    restaurants: [
      { name: "Ichiran Ramen", cuisine: "Tonkotsu ramen · $", emoji: "🍜" },
      { name: "Dotonbori Konamon Museum", cuisine: "Takoyaki · $", emoji: "🐙" },
      { name: "Kobe Beef Kiso", cuisine: "Kobe beef · $$$$", emoji: "🥩" },
    ],
    city: "Osaka",
    country: "Japan",
    airport: {
      iata: "KIX",
      icao: "RJBB",
      name: "Kansai International Airport",
      city: "Osaka",
      country: "Japan",
      timezone: "Asia/Tokyo",
      latitude: 34.4346,
      longitude: 135.244,
    },
    travelStyle: "foodie",
    interests: ["food", "shopping", "history"],
  },
  {
    id: "bali-island-escape",
    title: "Bali Island Escape",
    coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    gradient: "from-green-400 to-emerald-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 4,
    estimatedCost: 5000000,
    currency: "IDR",
    tags: ["Nature", "Beaches", "Slow Travel"],
    excerpt:
      "Rice terraces, sacred temples, and sunset beaches — four days of Bali's spiritual and tropical magic.",
    weatherTip:
      "April–October is the dry season. May–September is peak. Avoid December–March (rainy season).",
    fullDays: [
      {
        day: 1,
        theme: "Ubud Rice Terraces",
        activities: [
          { time: "08:00", name: "Tegalalang Rice Terrace walk", emoji: "🌾" },
          { time: "11:00", name: "Ubud Monkey Forest", emoji: "🐒" },
          { time: "14:00", name: "Ubud Art Market & Palace", emoji: "🎨" },
          { time: "18:00", name: "Traditional Kecak fire dance", emoji: "🔥" },
        ],
      },
      {
        day: 2,
        theme: "Temples & Waterfalls",
        activities: [
          { time: "07:00", name: "Tirta Empul water purification", emoji: "⛩️" },
          { time: "10:30", name: "Tegenungan Waterfall swim", emoji: "🌊" },
          { time: "14:00", name: "Coffee plantation tour (luwak)", emoji: "☕" },
          { time: "17:00", name: "Tanah Lot temple sunset", emoji: "🌅" },
        ],
      },
      {
        day: 3,
        theme: "Seminyak Beach Day",
        activities: [
          { time: "09:00", name: "Seminyak Beach morning swim", emoji: "🏖️" },
          { time: "12:00", name: "Beach club lunch & pool", emoji: "🍹" },
          { time: "16:00", name: "Surf lesson for beginners", emoji: "🏄" },
          { time: "19:00", name: "Seafood BBQ on Jimbaran Beach", emoji: "🦐" },
        ],
      },
      {
        day: 4,
        theme: "Nusa Penida Day Trip",
        activities: [
          { time: "07:00", name: "Speedboat to Nusa Penida", emoji: "🚤" },
          { time: "09:00", name: "Kelingking Beach viewpoint", emoji: "🏔️" },
          { time: "12:00", name: "Angel's Billabong & Broken Beach", emoji: "🌊" },
          { time: "15:00", name: "Snorkeling with manta rays", emoji: "🤿" },
        ],
      },
    ],
    restaurants: [
      { name: "Locavore", cuisine: "Farm-to-table fine dining · $$$", emoji: "🍽️" },
      { name: "Warung Babi Guling Ibu Oka", cuisine: "Balinese suckling pig · $", emoji: "🐷" },
      { name: "Swept Away", cuisine: "Riverside dining · $$", emoji: "🌊" },
    ],
    city: "Bali",
    country: "Indonesia",
    airport: {
      iata: "DPS",
      icao: "WADD",
      name: "Ngurah Rai International Airport",
      city: "Bali",
      country: "Indonesia",
      timezone: "Asia/Makassar",
      latitude: -8.7467,
      longitude: 115.1668,
    },
    travelStyle: "relaxed",
    interests: ["nature", "beaches", "food"],
  },
  {
    id: "dubai-luxury",
    title: "Dubai Luxury Experience",
    coverImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    gradient: "from-yellow-500 to-amber-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 3000,
    currency: "AED",
    tags: ["Shopping", "Adventure", "Luxury"],
    excerpt:
      "Burj Khalifa heights, desert dune bashing, and Palm Jumeirah glamour — Dubai at its most extravagant.",
    weatherTip:
      "November–March is the best time. Summers (June–September) are extremely hot (45°C+).",
    fullDays: [
      {
        day: 1,
        theme: "Downtown Dubai",
        activities: [
          { time: "09:00", name: "Burj Khalifa At The Top", emoji: "🏙️" },
          { time: "12:00", name: "Dubai Mall & aquarium", emoji: "🛍️" },
          { time: "18:00", name: "Dubai Fountain show", emoji: "⛲" },
          { time: "20:00", name: "Dinner at Atmosphere (122nd floor)", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Desert Safari & Marina",
        activities: [
          { time: "09:00", name: "Dubai Marina yacht tour", emoji: "⛵" },
          { time: "14:00", name: "Palm Jumeirah & Atlantis", emoji: "🏝️" },
          { time: "16:30", name: "Desert dune bashing & BBQ camp", emoji: "🏜️" },
          { time: "21:00", name: "Stargazing in the desert", emoji: "⭐" },
        ],
      },
      {
        day: 3,
        theme: "Old Dubai & Gold Souk",
        activities: [
          { time: "09:00", name: "Al Fahidi Historical District", emoji: "🏛️" },
          { time: "11:00", name: "Abra ride across Dubai Creek", emoji: "🛶" },
          { time: "13:00", name: "Gold Souk & Spice Souk", emoji: "💎" },
          { time: "17:00", name: "Madinat Jumeirah sunset", emoji: "🌅" },
        ],
      },
    ],
    restaurants: [
      { name: "At.mosphere", cuisine: "Fine dining 122nd floor · $$$$", emoji: "🏙️" },
      { name: "Al Hadheerah", cuisine: "Desert Arabian feast · $$$", emoji: "🏜️" },
      { name: "Ravi Restaurant", cuisine: "Pakistani street food · $", emoji: "🍛" },
    ],
    city: "Dubai",
    country: "UAE",
    airport: {
      iata: "DXB",
      icao: "OMDB",
      name: "Dubai International Airport",
      city: "Dubai",
      country: "UAE",
      timezone: "Asia/Dubai",
      latitude: 25.2532,
      longitude: 55.3657,
    },
    travelStyle: "adventure",
    interests: ["shopping", "sports", "food"],
  },
  // ── Europe ──────────────────────────────────────────────────────────
  {
    id: "rome-eternal-city",
    title: "Rome Eternal City",
    coverImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    gradient: "from-amber-600 to-red-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 500,
    currency: "EUR",
    tags: ["History", "Foodie", "Culture"],
    excerpt:
      "The Colosseum, Vatican wonders, and Trevi Fountain wishes — three days walking through two millennia of history.",
    weatherTip:
      "April–June and September–October are ideal. Summers are hot and crowded; winters are mild but rainy.",
    fullDays: [
      {
        day: 1,
        theme: "Ancient Rome",
        activities: [
          { time: "09:00", name: "Colosseum & Roman Forum", emoji: "🏛️" },
          { time: "13:00", name: "Trastevere pasta lunch", emoji: "🍝" },
          { time: "16:00", name: "Pantheon & Piazza Navona", emoji: "⛪" },
          { time: "19:30", name: "Trevi Fountain & gelato", emoji: "⛲" },
        ],
      },
      {
        day: 2,
        theme: "Vatican City",
        activities: [
          { time: "08:00", name: "Vatican Museums & Sistine Chapel", emoji: "🖼️" },
          { time: "12:00", name: "St. Peter's Basilica & dome climb", emoji: "⛪" },
          { time: "15:00", name: "Castel Sant'Angelo", emoji: "🏰" },
          { time: "19:00", name: "Roman pizza & wine in Monti", emoji: "🍕" },
        ],
      },
      {
        day: 3,
        theme: "Spanish Steps & Borghese",
        activities: [
          { time: "09:00", name: "Galleria Borghese", emoji: "🎨" },
          { time: "12:00", name: "Spanish Steps & luxury shopping", emoji: "🛍️" },
          { time: "15:00", name: "Appian Way bike ride", emoji: "🚲" },
          { time: "19:00", name: "Supplì & aperitivo farewell", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Da Enzo al 29", cuisine: "Trastevere trattoria · $$", emoji: "🍝" },
      { name: "Pizzarium Bonci", cuisine: "Pizza al taglio · $", emoji: "🍕" },
      { name: "Roscioli", cuisine: "Deli & pasta · $$", emoji: "🧀" },
    ],
    city: "Rome",
    country: "Italy",
    airport: {
      iata: "FCO",
      icao: "LIRF",
      name: "Leonardo da Vinci–Fiumicino Airport",
      city: "Rome",
      country: "Italy",
      timezone: "Europe/Rome",
      latitude: 41.8003,
      longitude: 12.2389,
    },
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
  },
  {
    id: "barcelona-art-architecture",
    title: "Barcelona Art & Architecture",
    coverImage: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    gradient: "from-red-500 to-orange-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 450,
    currency: "EUR",
    tags: ["Culture", "Foodie", "Beaches"],
    excerpt:
      "Gaudí's masterpieces, tapas crawls, and Mediterranean sun — Barcelona where art meets the sea.",
    weatherTip:
      "May–June and September–October are perfect. Summers are hot and crowded; winters are mild.",
    fullDays: [
      {
        day: 1,
        theme: "Gaudí's Masterpieces",
        activities: [
          { time: "09:00", name: "Sagrada Família", emoji: "⛪" },
          { time: "12:00", name: "Park Güell mosaic walk", emoji: "🎨" },
          { time: "15:00", name: "Casa Batlló & Passeig de Gràcia", emoji: "🏛️" },
          { time: "19:00", name: "El Born tapas crawl", emoji: "🥘" },
        ],
      },
      {
        day: 2,
        theme: "Gothic Quarter & Beach",
        activities: [
          { time: "09:00", name: "Gothic Quarter & Cathedral", emoji: "🏰" },
          { time: "12:00", name: "La Boqueria market lunch", emoji: "🍊" },
          { time: "15:00", name: "Barceloneta Beach afternoon", emoji: "🏖️" },
          { time: "20:00", name: "Flamenco show & dinner", emoji: "💃" },
        ],
      },
      {
        day: 3,
        theme: "Montjuïc & Magic Fountain",
        activities: [
          { time: "09:00", name: "Montjuïc cable car & castle", emoji: "🏔️" },
          { time: "12:00", name: "Picasso Museum", emoji: "🖼️" },
          { time: "16:00", name: "Casa Milà (La Pedrera)", emoji: "🏗️" },
          { time: "21:00", name: "Magic Fountain light show", emoji: "🎆" },
        ],
      },
    ],
    restaurants: [
      { name: "Cervecería Catalana", cuisine: "Tapas · $$", emoji: "🥘" },
      { name: "La Boqueria Pinotxo Bar", cuisine: "Market stall · $", emoji: "🍊" },
      { name: "Tickets", cuisine: "Avant-garde tapas · $$$", emoji: "🎭" },
    ],
    city: "Barcelona",
    country: "Spain",
    airport: {
      iata: "BCN",
      icao: "LEBL",
      name: "Josep Tarradellas Barcelona–El Prat Airport",
      city: "Barcelona",
      country: "Spain",
      timezone: "Europe/Madrid",
      latitude: 41.2974,
      longitude: 2.0833,
    },
    travelStyle: "cultural",
    interests: ["museums", "food", "beaches"],
  },
  {
    id: "amsterdam-canal-romance",
    title: "Amsterdam Canal Romance",
    coverImage: "https://images.unsplash.com/photo-1534351590666-13e3e96b5571?w=800&q=80",
    gradient: "from-blue-500 to-indigo-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 400,
    currency: "EUR",
    tags: ["Culture", "Museums", "Slow Travel"],
    excerpt:
      "Canal cruises, Van Gogh's colours, and windmill day trips — Amsterdam at its most charming pace.",
    weatherTip:
      "April–May (tulip season) and September are best. Winters are dark and rainy; summers are mild.",
    fullDays: [
      {
        day: 1,
        theme: "Canal Ring & Museums",
        activities: [
          { time: "09:00", name: "Van Gogh Museum", emoji: "🌻" },
          { time: "12:00", name: "Rijksmuseum highlights", emoji: "🖼️" },
          { time: "15:00", name: "Canal cruise (1 hour)", emoji: "🛶" },
          { time: "19:00", name: "Jordaan neighbourhood dinner", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Anne Frank & Vondelpark",
        activities: [
          { time: "09:00", name: "Anne Frank House", emoji: "📖" },
          { time: "12:00", name: "Vondelpark picnic", emoji: "🌳" },
          { time: "15:00", name: "De Pijp & Albert Cuyp Market", emoji: "🧀" },
          { time: "19:00", name: "Red Light District walk", emoji: "🏮" },
        ],
      },
      {
        day: 3,
        theme: "Zaanse Schans Windmills",
        activities: [
          { time: "09:00", name: "Zaanse Schans windmill village", emoji: "🌬️" },
          { time: "12:00", name: "Cheese tasting & clog workshop", emoji: "🧀" },
          { time: "15:00", name: "Volendam fishing village", emoji: "🐟" },
          { time: "19:00", name: "Farewell Indonesian rijsttafel", emoji: "🍛" },
        ],
      },
    ],
    restaurants: [
      { name: "The Pancake Bakery", cuisine: "Dutch pancakes · $$", emoji: "🥞" },
      { name: "Restaurant Blauw", cuisine: "Indonesian rijsttafel · $$", emoji: "🍛" },
      { name: "Winkel 43", cuisine: "Apple pie · $", emoji: "🥧" },
    ],
    city: "Amsterdam",
    country: "Netherlands",
    airport: {
      iata: "AMS",
      icao: "EHAM",
      name: "Amsterdam Airport Schiphol",
      city: "Amsterdam",
      country: "Netherlands",
      timezone: "Europe/Amsterdam",
      latitude: 52.3105,
      longitude: 4.7683,
    },
    travelStyle: "relaxed",
    interests: ["museums", "food", "history"],
  },
  {
    id: "zurich-swiss-lakes",
    title: "Zurich Swiss Lakes",
    coverImage: null,
    gradient: "from-sky-400 to-blue-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 500,
    currency: "CHF",
    tags: ["Nature", "Shopping", "Slow Travel"],
    excerpt:
      "Bahnhofstrasse elegance, Lake Zurich serenity, and Swiss chocolate indulgence — two pristine Swiss days.",
    weatherTip:
      "June–September is warmest and best. December–February for Christmas markets. Spring is unpredictable.",
    fullDays: [
      {
        day: 1,
        theme: "Old Town & Lake",
        activities: [
          { time: "09:00", name: "Bahnhofstrasse luxury shopping", emoji: "🛍️" },
          { time: "12:00", name: "Old Town (Altstadt) walk & fondue lunch", emoji: "🧀" },
          { time: "15:00", name: "Lake Zurich boat cruise", emoji: "⛵" },
          { time: "19:00", name: "Grossmünster church & riverside dinner", emoji: "⛪" },
        ],
      },
      {
        day: 2,
        theme: "Chocolate & Mountains",
        activities: [
          { time: "09:00", name: "Lindt Chocolate Factory tour", emoji: "🍫" },
          { time: "12:00", name: "Uetliberg mountain viewpoint", emoji: "🏔️" },
          { time: "15:00", name: "Kunsthaus Zurich art museum", emoji: "🖼️" },
          { time: "18:00", name: "Swiss raclette farewell dinner", emoji: "🧀" },
        ],
      },
    ],
    restaurants: [
      { name: "Zeughauskeller", cuisine: "Traditional Swiss · $$", emoji: "🧀" },
      { name: "Sprüngli", cuisine: "Swiss chocolate & café · $$", emoji: "🍫" },
      { name: "Kronenhalle", cuisine: "Classic European · $$$$", emoji: "🍽️" },
    ],
    city: "Zurich",
    country: "Switzerland",
    airport: {
      iata: "ZRH",
      icao: "LSZH",
      name: "Zurich Airport",
      city: "Zurich",
      country: "Switzerland",
      timezone: "Europe/Zurich",
      latitude: 47.4647,
      longitude: 8.5492,
    },
    travelStyle: "relaxed",
    interests: ["nature", "shopping", "food"],
  },
  {
    id: "prague-fairy-tale",
    title: "Prague Fairy Tale",
    coverImage: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80",
    gradient: "from-stone-500 to-amber-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 8000,
    currency: "CZK",
    tags: ["History", "Culture", "Budget"],
    excerpt:
      "Charles Bridge at dawn, Prague Castle at dusk, and Astronomical Clock magic — a fairy tale come to life.",
    weatherTip:
      "May–June and September are ideal. Christmas season is magical but cold. Summers can be crowded.",
    fullDays: [
      {
        day: 1,
        theme: "Old Town & Jewish Quarter",
        activities: [
          { time: "09:00", name: "Old Town Square & Astronomical Clock", emoji: "🕰️" },
          { time: "11:00", name: "Jewish Quarter & synagogues", emoji: "🕍" },
          { time: "14:00", name: "Wenceslas Square & lunch", emoji: "🍲" },
          { time: "19:00", name: "Vltava River evening cruise", emoji: "🛶" },
        ],
      },
      {
        day: 2,
        theme: "Prague Castle & Malá Strana",
        activities: [
          { time: "08:00", name: "Charles Bridge at sunrise", emoji: "🌉" },
          { time: "09:30", name: "Prague Castle & St. Vitus Cathedral", emoji: "🏰" },
          { time: "13:00", name: "Malá Strana lunch & Lennon Wall", emoji: "🎨" },
          { time: "17:00", name: "Petřín Hill observation tower", emoji: "🗼" },
          { time: "20:00", name: "Czech beer hall dinner", emoji: "🍺" },
        ],
      },
      {
        day: 3,
        theme: "Day Trip to Kutná Hora",
        activities: [
          { time: "08:30", name: "Train to Kutná Hora", emoji: "🚂" },
          { time: "10:00", name: "Sedlec Ossuary (Bone Church)", emoji: "💀" },
          { time: "12:30", name: "St. Barbara's Cathedral", emoji: "⛪" },
          { time: "15:00", name: "Return & trdelník farewell", emoji: "🥐" },
        ],
      },
    ],
    restaurants: [
      { name: "Lokál Dlouhááá", cuisine: "Czech pub food · $$", emoji: "🍺" },
      { name: "Café Louvre", cuisine: "Historic café · $$", emoji: "☕" },
      { name: "Good Food Bakery", cuisine: "Trdelník (chimney cake) · $", emoji: "🥐" },
    ],
    city: "Prague",
    country: "Czech Republic",
    airport: {
      iata: "PRG",
      icao: "LKPR",
      name: "Václav Havel Airport Prague",
      city: "Prague",
      country: "Czech Republic",
      timezone: "Europe/Prague",
      latitude: 50.1008,
      longitude: 14.26,
    },
    travelStyle: "cultural",
    interests: ["history", "museums", "food"],
  },
  // ── Americas ────────────────────────────────────────────────────────
  {
    id: "los-angeles-hollywood",
    title: "Los Angeles Hollywood Dream",
    coverImage: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80",
    gradient: "from-yellow-400 to-pink-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 800,
    currency: "USD",
    tags: ["Culture", "Shopping", "Beaches"],
    excerpt:
      "Hollywood signs, Universal Studios thrills, and Santa Monica sunsets — three days of LA dreams.",
    weatherTip:
      "Year-round sunshine. June Gloom brings morning fog. Best September–November for clear skies.",
    fullDays: [
      {
        day: 1,
        theme: "Hollywood & Griffith",
        activities: [
          { time: "09:00", name: "Hollywood Walk of Fame & TCL Theatre", emoji: "⭐" },
          { time: "12:00", name: "Griffith Observatory & Hollywood sign view", emoji: "🔭" },
          { time: "16:00", name: "Sunset Boulevard drive", emoji: "🌅" },
          { time: "19:00", name: "Dinner in West Hollywood", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Universal Studios & Studio Tour",
        activities: [
          { time: "08:00", name: "Universal Studios full day", emoji: "🎢" },
          { time: "13:00", name: "Studio Tour backlot", emoji: "🎬" },
          { time: "18:00", name: "CityWalk dinner & entertainment", emoji: "🎸" },
        ],
      },
      {
        day: 3,
        theme: "Santa Monica & Venice",
        activities: [
          { time: "09:00", name: "Santa Monica Pier & beach", emoji: "🎡" },
          { time: "12:00", name: "Venice Beach boardwalk & canals", emoji: "🏄" },
          { time: "15:00", name: "Rodeo Drive window shopping", emoji: "💎" },
          { time: "19:00", name: "Fareword dinner in Beverly Hills", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "In-N-Out Burger", cuisine: "Classic burger · $", emoji: "🍔" },
      { name: "Grand Central Market", cuisine: "Food hall · $$", emoji: "🌮" },
      { name: "Nobu Malibu", cuisine: "Japanese fine dining · $$$$", emoji: "🍣" },
    ],
    city: "Los Angeles",
    country: "USA",
    airport: {
      iata: "LAX",
      icao: "KLAX",
      name: "Los Angeles International Airport",
      city: "Los Angeles",
      country: "USA",
      timezone: "America/Los_Angeles",
      latitude: 33.9425,
      longitude: -118.408,
    },
    travelStyle: "active",
    interests: ["shopping", "beaches", "food"],
  },
  {
    id: "san-francisco-bay",
    title: "San Francisco Bay Style",
    coverImage: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
    gradient: "from-orange-400 to-red-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 850,
    currency: "USD",
    tags: ["Culture", "Foodie", "Nature"],
    excerpt:
      "Golden Gate fog, Fisherman's Wharf clam chowder, and Silicon Valley vibes — the City by the Bay.",
    weatherTip:
      "September–October is the warmest. Summer fog (Karl) is famous. Pack layers — weather changes fast.",
    fullDays: [
      {
        day: 1,
        theme: "Golden Gate & Presidio",
        activities: [
          { time: "08:00", name: "Golden Gate Bridge walk or bike", emoji: "🌉" },
          { time: "11:00", name: "Presidio & Palace of Fine Arts", emoji: "🏛️" },
          { time: "14:00", name: "Fisherman's Wharf & Pier 39 sea lions", emoji: "🦭" },
          { time: "19:00", name: "Chinatown dinner", emoji: "🥢" },
        ],
      },
      {
        day: 2,
        theme: "Alcatraz & North Beach",
        activities: [
          { time: "09:00", name: "Alcatraz Island tour", emoji: "🏝️" },
          { time: "13:00", name: "North Beach Italian lunch", emoji: "🍝" },
          { time: "16:00", name: "Lombard Street crooked walk", emoji: "🏘️" },
          { time: "19:00", name: "Mission District murals & tacos", emoji: "🌮" },
        ],
      },
      {
        day: 3,
        theme: "Silicon Valley & Haight",
        activities: [
          { time: "09:00", name: "Apple Park Visitor Center", emoji: "🍎" },
          { time: "12:00", name: "Haight-Ashbury vintage shops", emoji: "🎸" },
          { time: "15:00", name: "Golden Gate Park & Japanese Tea Garden", emoji: "🍵" },
          { time: "19:00", name: "Ferry Building artisan dinner", emoji: "🧀" },
        ],
      },
    ],
    restaurants: [
      { name: "Tartine Bakery", cuisine: "Artisan bread & pastries · $$", emoji: "🥖" },
      { name: "Swan Oyster Depot", cuisine: "Fresh oysters · $$$", emoji: "🦪" },
      { name: "La Taqueria", cuisine: "Mission burrito · $", emoji: "🌮" },
    ],
    city: "San Francisco",
    country: "USA",
    airport: {
      iata: "SFO",
      icao: "KSFO",
      name: "San Francisco International Airport",
      city: "San Francisco",
      country: "USA",
      timezone: "America/Los_Angeles",
      latitude: 37.6213,
      longitude: -122.379,
    },
    travelStyle: "active",
    interests: ["food", "nature", "museums"],
  },
  {
    id: "vancouver-nature-city",
    title: "Vancouver Nature & City",
    coverImage: null,
    gradient: "from-green-500 to-sky-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 900,
    currency: "CAD",
    tags: ["Nature", "Foodie", "Active"],
    excerpt:
      "Stanley Park trails, Capilano suspension bridge, and Grouse Mountain — Vancouver where city meets wilderness.",
    weatherTip:
      "June–September is the driest and warmest. Winters are rainy but mild. Ski season runs December–March.",
    fullDays: [
      {
        day: 1,
        theme: "Stanley Park & Downtown",
        activities: [
          { time: "09:00", name: "Stanley Park seawall bike ride", emoji: "🌳" },
          { time: "12:00", name: "Granville Island Public Market lunch", emoji: "🥗" },
          { time: "15:00", name: "Gastown Steam Clock & boutiques", emoji: "🕰️" },
          { time: "19:00", name: "Yaletown dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Capilano & Grouse Mountain",
        activities: [
          { time: "09:00", name: "Capilano Suspension Bridge", emoji: "🌉" },
          { time: "12:00", name: "Grouse Mountain skyride", emoji: "🏔️" },
          { time: "15:00", name: "Lighthouse Park ocean view", emoji: "🗼" },
          { time: "19:00", name: "Richmond Night Market (weekends)", emoji: "🍢" },
        ],
      },
      {
        day: 3,
        theme: "Whistler Day Trip",
        activities: [
          { time: "08:00", name: "Sea to Sky Highway drive", emoji: "🚗" },
          { time: "10:00", name: "Whistler Village & Peak 2 Peak gondola", emoji: "🚡" },
          { time: "14:00", name: "Shannon Falls hike", emoji: "🌊" },
          { time: "18:00", name: "Return & sushi dinner", emoji: "🍣" },
        ],
      },
    ],
    restaurants: [
      { name: "Miku", cuisine: "Aburi sushi · $$$", emoji: "🍣" },
      { name: "Granville Island stalls", cuisine: "Market food · $", emoji: "🥗" },
      { name: "Japadog", cuisine: "Japanese hot dogs · $", emoji: "🌭" },
    ],
    city: "Vancouver",
    country: "Canada",
    airport: {
      iata: "YVR",
      icao: "CYVR",
      name: "Vancouver International Airport",
      city: "Vancouver",
      country: "Canada",
      timezone: "America/Vancouver",
      latitude: 49.1947,
      longitude: -123.1792,
    },
    travelStyle: "active",
    interests: ["nature", "food", "sports"],
  },
  {
    id: "mexico-city-ancient-culture",
    title: "Mexico City Ancient Culture",
    coverImage: null,
    gradient: "from-lime-500 to-green-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 8000,
    currency: "MXN",
    tags: ["History", "Foodie", "Culture"],
    excerpt:
      "Aztec pyramids, Frida Kahlo's blue house, and taco stands that define a culinary civilization.",
    weatherTip:
      "March–May is the warmest and driest. June–September is rainy season (afternoon showers). December is festive.",
    fullDays: [
      {
        day: 1,
        theme: "Zócalo & Historic Centre",
        activities: [
          { time: "09:00", name: "Zócalo & Metropolitan Cathedral", emoji: "⛪" },
          { time: "11:00", name: "Templo Mayor Aztec ruins", emoji: "🏛️" },
          { time: "14:00", name: "San Juan Market taco lunch", emoji: "🌮" },
          { time: "17:00", name: "Palacio de Bellas Artes", emoji: "🎨" },
          { time: "20:00", name: "Roma Norte mezcal bar", emoji: "🥃" },
        ],
      },
      {
        day: 2,
        theme: "Teotihuacán Pyramids",
        activities: [
          { time: "08:00", name: "Teotihuacán Sun & Moon Pyramids", emoji: "🏛️" },
          { time: "13:00", name: "Pulque tasting & lunch", emoji: "🥛" },
          { time: "16:00", name: "Basilica of Our Lady of Guadalupe", emoji: "⛪" },
          { time: "19:00", name: "Condesa neighbourhood dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 3,
        theme: "Coyoacán & Frida Kahlo",
        activities: [
          { time: "09:00", name: "Frida Kahlo Museum (Casa Azul)", emoji: "🎨" },
          { time: "12:00", name: "Coyoacán Market lunch", emoji: "🥟" },
          { time: "15:00", name: "Chapultepec Castle & park", emoji: "🏰" },
          { time: "19:00", name: "Farewell mole & mariachi", emoji: "🎵" },
        ],
      },
    ],
    restaurants: [
      { name: "Pujol", cuisine: "Modern Mexican · $$$$", emoji: "🌮" },
      { name: "El Huequito", cuisine: "Tacos al pastor · $", emoji: "🥙" },
      { name: "Mercado San Juan", cuisine: "Market food · $", emoji: "🧀" },
    ],
    city: "Mexico City",
    country: "Mexico",
    airport: {
      iata: "MEX",
      icao: "MMMX",
      name: "Mexico City International Airport",
      city: "Mexico City",
      country: "Mexico",
      timezone: "America/Mexico_City",
      latitude: 19.4363,
      longitude: -99.0721,
    },
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
  },
  // ── Oceania ─────────────────────────────────────────────────────────
  {
    id: "melbourne-arts-coffee",
    title: "Melbourne Arts & Coffee",
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    gradient: "from-slate-600 to-zinc-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 900,
    currency: "AUD",
    tags: ["Culture", "Foodie", "Nature"],
    excerpt:
      "Great Ocean Road adventure, penguin parades, and laneway café culture — Melbourne's creative soul.",
    weatherTip:
      "March–May and September–November are most pleasant. Summers can be very hot; winters are cool and grey.",
    fullDays: [
      {
        day: 1,
        theme: "Laneways & Coffee",
        activities: [
          { time: "09:00", name: "Degraves Street laneway coffee", emoji: "☕" },
          { time: "11:00", name: "Hosier Lane street art", emoji: "🎨" },
          { time: "14:00", name: "Queen Victoria Market", emoji: "🛍️" },
          { time: "17:00", name: "Federation Square & Yarra River", emoji: "🌊" },
          { time: "19:30", name: "Lygon Street Italian dinner", emoji: "🍝" },
        ],
      },
      {
        day: 2,
        theme: "Great Ocean Road",
        activities: [
          { time: "07:00", name: "Great Ocean Road drive", emoji: "🚗" },
          { time: "10:30", name: "Twelve Apostles lookout", emoji: "🏔️" },
          { time: "13:00", name: "Loch Ard Gorge & lunch", emoji: "🌊" },
          { time: "18:00", name: "Return to Melbourne", emoji: "🌆" },
        ],
      },
      {
        day: 3,
        theme: "Penguin Island & St Kilda",
        activities: [
          { time: "09:00", name: "Phillip Island Penguin Parade", emoji: "🐧" },
          { time: "13:00", name: "St Kilda Beach & Luna Park", emoji: "🏖️" },
          { time: "16:00", name: "Royal Botanic Gardens", emoji: "🌿" },
          { time: "19:00", name: "Southbank farewell dinner", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Attica", cuisine: "Modern Australian · $$$$", emoji: "🍽️" },
      { name: "Market Lane Coffee", cuisine: "Specialty coffee · $", emoji: "☕" },
      { name: "Chin Chin", cuisine: "Asian fusion · $$", emoji: "🍜" },
    ],
    city: "Melbourne",
    country: "Australia",
    airport: {
      iata: "MEL",
      icao: "YMML",
      name: "Melbourne Airport",
      city: "Melbourne",
      country: "Australia",
      timezone: "Australia/Melbourne",
      latitude: -37.669,
      longitude: 144.841,
    },
    travelStyle: "cultural",
    interests: ["food", "nature", "museums"],
  },
  {
    id: "auckland-sail-city",
    title: "Auckland City of Sails",
    coverImage: null,
    gradient: "from-cyan-500 to-blue-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 1000,
    currency: "NZD",
    tags: ["Nature", "Adventure", "Culture"],
    excerpt:
      "Sky Tower thrills, Hobbiton magic, and volcanic crater walks — Auckland, the City of Sails.",
    weatherTip:
      "December–March is summer and the best time. Winters (June–August) are mild but rainy.",
    fullDays: [
      {
        day: 1,
        theme: "Sky Tower & Waterfront",
        activities: [
          { time: "09:00", name: "Sky Tower observation & skywalk", emoji: "🗼" },
          { time: "12:00", name: "Viaduct Harbour lunch", emoji: "🐟" },
          { time: "15:00", name: "Wynyard Quarter & Silo Park", emoji: "🌊" },
          { time: "19:00", name: "Britomart dinner district", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Hobbiton Day Trip",
        activities: [
          { time: "07:30", name: "Drive to Matamata Hobbiton", emoji: "🚗" },
          { time: "10:00", name: "Hobbiton Movie Set tour", emoji: "🧙" },
          { time: "13:00", name: "Green Dragon Inn lunch", emoji: "🍺" },
          { time: "16:00", name: "Waitomo Glowworm Caves", emoji: "✨" },
          { time: "20:00", name: "Return to Auckland", emoji: "🌆" },
        ],
      },
      {
        day: 3,
        theme: "Volcanoes & Beaches",
        activities: [
          { time: "09:00", name: "Rangitoto Island volcano hike", emoji: "🌋" },
          { time: "13:00", name: "Devonport village lunch", emoji: "🥧" },
          { time: "15:30", name: "Mount Eden summit 360° view", emoji: "🏔️" },
          { time: "18:00", name: "Piha Beach sunset (black sand)", emoji: "🏖️" },
        ],
      },
    ],
    restaurants: [
      { name: "Orbit 360° Dining", cuisine: "Revolving restaurant · $$$", emoji: "🗼" },
      { name: "Depot Eatery", cuisine: "New Zealand · $$", emoji: "🦪" },
      { name: "Federal Delicatessen", cuisine: "NY-style deli · $$", emoji: "🥪" },
    ],
    city: "Auckland",
    country: "New Zealand",
    airport: {
      iata: "AKL",
      icao: "NZAA",
      name: "Auckland Airport",
      city: "Auckland",
      country: "New Zealand",
      timezone: "Pacific/Auckland",
      latitude: -37.0082,
      longitude: 174.785,
    },
    travelStyle: "adventure",
    interests: ["nature", "sports", "food"],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Component ──────────────────────────────────────────────────────────

export default function TripsPage() {
  const router = useRouter();
  const setSearchParams = useTravelStore((s) => s.setSearchParams);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const handleUseTrip = useCallback(
    (t: Trip) => {
      setSearchParams({
        destination: t.airport,
        travelStyle: t.travelStyle,
        interests: t.interests,
      });
      setActiveTrip(null);
      const dep = todayPlusDays(14);
      const ret = todayPlusDays(14 + t.days);
      router.push(
        `/?to=${encodeURIComponent(t.city)}&departureDate=${dep}&returnDate=${ret}#hero-search`,
      );
    },
    [router, setSearchParams],
  );

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ───────────────────────────────────────────────── */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Curated Trips
        </h1>
        <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
          Ready-made itineraries crafted by AI and experienced travelers — just
          pick one and go
        </p>

        {/* ── Grid ─────────────────────────────────────────────────── */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRIPS.map((t) => (
            <TripCard
              key={t.id}
              trip={t}
              onPreview={() => setActiveTrip(t)}
              onUse={() => handleUseTrip(t)}
            />
          ))}
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────── */}
      {activeTrip && (
        <TripModal
          trip={activeTrip}
          onClose={() => setActiveTrip(null)}
          onUse={() => handleUseTrip(activeTrip)}
        />
      )}
    </div>
  );
}

// ── Card component ─────────────────────────────────────────────────────

function TripCard({
  trip,
  onPreview,
  onUse,
}: {
  trip: Trip;
  onPreview: () => void;
  onUse: () => void;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      {/* Cover */}
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${trip.gradient}`}>
        {trip.coverImage ? (
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Days badge */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {trip.days} {trip.days === 1 ? "day" : "days"}
          </span>
        </div>

        {/* Cost badge */}
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur-sm">
            ${trip.estimatedCost} est.
          </span>
        </div>

        {/* City / country */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3
            onClick={onPreview}
            className="cursor-pointer text-xl font-bold leading-snug text-white transition-colors hover:text-blue-100"
          >
            {trip.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Author + cost */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${trip.author.avatarColor} text-[10px] font-bold text-white`}
            aria-hidden="true"
          >
            {trip.author.initials}
          </div>
          <p className="text-sm font-medium text-gray-700">
            {trip.author.name}
          </p>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Excerpt */}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {trip.excerpt}
        </p>

        {/* Footer actions */}
        <div className="mt-auto flex items-center gap-2 pt-5">
          <button
            type="button"
            onClick={onUse}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Use This Trip
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Preview
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Modal component ────────────────────────────────────────────────────

function TripModal({
  trip,
  onClose,
  onUse,
}: {
  trip: Trip;
  onClose: () => void;
  onUse: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Hero cover */}
        <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${trip.gradient}`}>
          {trip.coverImage ? (
            <Image
              src={trip.coverImage}
              alt={trip.title}
              fill
              unoptimized
              sizes="(min-width: 768px) 600px, 100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>

          {/* Meta badges */}
          <div className="absolute left-6 bottom-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {trip.days} {trip.days === 1 ? "day" : "days"}
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              ${trip.estimatedCost} {trip.currency} est.
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
            {trip.title}
          </h2>

          {/* Author row */}
          <div className="mt-3 flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${trip.author.avatarColor} text-xs font-bold text-white`}
              aria-hidden="true"
            >
              {trip.author.initials}
            </div>
            <p className="text-sm font-medium text-gray-700">
              {trip.author.name}
            </p>
            <div className="ml-auto flex flex-wrap gap-1.5">
              {trip.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <p className="mt-5 text-sm leading-relaxed text-gray-600">
            {trip.excerpt}
          </p>

          {/* Weather tip */}
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-3.5">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                Weather tip
              </p>
              <p className="mt-0.5 text-sm text-sky-900">{trip.weatherTip}</p>
            </div>
          </div>

          {/* Day-by-day */}
          <div className="mt-6 space-y-5">
            {trip.fullDays.map((day) => (
              <div key={day.day}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Day {day.day}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {day.theme}
                  </span>
                </div>
                <ul className="ml-1 mt-2 space-y-1.5 border-l-2 border-gray-100 pl-4">
                  {day.activities.map((act, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <span className="w-12 flex-shrink-0 text-xs font-medium text-gray-400">
                        {act.time}
                      </span>
                      <span aria-hidden="true">{act.emoji}</span>
                      <span>{act.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Restaurants */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900">
              Restaurant picks
            </h3>
            <ul className="mt-3 space-y-2">
              {trip.restaurants.map((r) => (
                <li
                  key={r.name}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                >
                  <span className="text-xl" aria-hidden="true">
                    {r.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {r.name}
                    </p>
                    <p className="text-xs text-gray-500">{r.cuisine}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white p-5">
          <button
            type="button"
            onClick={onUse}
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Use This Trip — Plan {trip.city}
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Auto-fills destination, dates and interests
          </p>
        </div>
      </div>
    </div>
  );
}
