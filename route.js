import { supabase } from "../../../lib/supabase.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");

  if (!tab) {
    return Response.json({ error: "Missing tab parameter" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("tab", tab)
    .order("date", { ascending: false })
    .limit(500);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
