import { getTransactionCategories } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = getTransactionCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching transaction categories:", error);
    return NextResponse.json({ error: "Failed to fetch transaction categories" }, { status: 500 });
  }
}
