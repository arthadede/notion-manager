import { createTransaction } from "@/lib/notion";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, type, payDate, note } = body;

    if (!amount || !type) {
      return NextResponse.json(
        { error: "Missing required fields: amount, type" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const transaction = await createTransaction({
      amount,
      type,
      payDate,
      note,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}