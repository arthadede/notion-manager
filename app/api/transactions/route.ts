import { createTransaction, getTransactionsByMonth } from "@/lib/notion";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!year || !month) {
      return NextResponse.json({ error: "Missing required parameters: year, month" }, { status: 400 });
    }

    const transactions = await getTransactionsByMonth(parseInt(year), parseInt(month));
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Transaction fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, type, note } = body;

    if (!amount || !type) {
      return NextResponse.json({ error: "Missing required fields: amount, type" }, { status: 400 });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const transaction = await createTransaction({
      amount,
      type,
      note,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
