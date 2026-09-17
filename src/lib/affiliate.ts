/**
 * Travelpayouts affiliate link helpers.
 *
 * Generates tracked search URLs for flights (Aviasales) and hotels (Hotellook).
 * The marker is read from NEXT_PUBLIC_TRAVELPAYOUTS_MARKER.
 */

export const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "";

/** Build an Aviasales flight search URL with affiliate marker. */
export function buildFlightSearchUrl(params: {
  originIata: string;
  destinationIata: string;
  departDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
}): string {
  const { originIata, destinationIata, departDate, returnDate } = params;

  const url = new URL("https://www.aviasales.com/search");
  if (MARKER) url.searchParams.set("marker", MARKER);
  url.searchParams.set("origin_iata", originIata);
  url.searchParams.set("destination_iata", destinationIata);
  url.searchParams.set("depart_date", departDate);
  if (returnDate) url.searchParams.set("return_date", returnDate);
  return url.toString();
}

/**
 * Build a Wink Booking Engine URL for one hotel, carrying Utripla attribution.
 *
 * Official format (academy.wink.travel/booking-engine/features):
 *   https://book.wink.travel/hotel/{urlName}?client-id=…&sd=…&n=…&rc=a2&l=en&c=USD
 * `client-id` 是官方归因参数（首次点击 6 个月 attribution，ToS §3.2）。
 * WINK_CLIENT_ID 非 secret（官方文档要求其出现在可分享 URL 中），但本 helper
 * 只在 server-side provider（src/lib/api/hotels.ts）中调用。
 */
export function buildWinkBookingUrl(params: {
  hotelUrlName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
}): string {
  const { hotelUrlName, checkIn, checkOut, adults } = params;

  const clientId = process.env.WINK_CLIENT_ID?.trim();
  const url = new URL(`https://book.wink.travel/hotel/${encodeURIComponent(hotelUrlName)}`);
  if (clientId) url.searchParams.set("client-id", clientId);
  url.searchParams.set("sd", checkIn);
  url.searchParams.set(
    "n",
    String(
      Math.max(
        1,
        Math.round(
          (new Date(`${checkOut}T00:00:00Z`).getTime() -
            new Date(`${checkIn}T00:00:00Z`).getTime()) /
            86400000,
        ),
      ),
    ),
  );
  url.searchParams.set("rc", `a${adults}`);
  url.searchParams.set("l", "en");
  url.searchParams.set("c", "USD");
  return url.toString();
}

/** Build a Hotellook hotel search URL with affiliate marker. */
export function buildHotelSearchUrl(params: {
  city: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
}): string {
  const { city, checkIn, checkOut } = params;

  const url = new URL("https://search.hotellook.com/");
  if (MARKER) url.searchParams.set("marker", MARKER);
  url.searchParams.set("location", city);
  url.searchParams.set("checkIn", checkIn);
  url.searchParams.set("checkOut", checkOut);
  return url.toString();
}
