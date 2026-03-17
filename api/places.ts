import { APILayer } from "./APILayer";

const placesAPI = new APILayer(process.env.AVIATIONSTACK_API_KEY);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return new Response(JSON.stringify({ error: "Query is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await placesAPI.fetchAirportData(query);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch airport data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
