export async function GET(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (!q) return Response.json({ error: "Missing q" }, { status: 400 });
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  return Response.json(data.results ?? [], {
    headers: { "Cache-Control": "s-maxage=604800" },
  });
}
