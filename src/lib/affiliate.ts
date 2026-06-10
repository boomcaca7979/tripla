/**
 * Travelpayouts affiliate link helpers.
 *
 * Generates tracked search URLs for flights (Aviasales) and hotels (Hotellook).
 * The marker is read from NEXT_PUBLIC_TRAVELPAYOUTS_MARKER.
 */

const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "";

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
