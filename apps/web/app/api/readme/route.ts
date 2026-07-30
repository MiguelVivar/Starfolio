import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const name = searchParams.get("name");
  const branch = searchParams.get("branch") || "main";

  if (!owner || !name) {
    return NextResponse.json({ error: "Missing owner or name parameter." }, { status: 400 });
  }

  const branchesToTry = [branch, "main", "master", "develop"];
  
  for (const b of branchesToTry) {
    try {
      const url = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/${encodeURIComponent(b)}/README.md`;
      const res = await fetch(url, { headers: { "User-Agent": "Starfolio" } });
      if (res.ok) {
        const readme = await res.text();
        return NextResponse.json({ readme });
      }
    } catch {
      // Continue trying fallback branches
    }
  }

  return NextResponse.json({ error: "README not found for this repository." }, { status: 404 });
}
