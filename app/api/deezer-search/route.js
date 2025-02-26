export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return Response.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.deezer.com/search/album?q=${query}`);
    if (!res.ok) {
      throw new Error("Failed to fetch data from Deezer");
    }
    const data = await res.json();

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
