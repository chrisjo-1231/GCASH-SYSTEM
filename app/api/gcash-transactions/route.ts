
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

// Service fee:
// Below ₱500: ₱10
// ₱500 and above: ₱15 per ₱1,000 or fraction thereof.
function getServiceFee(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  if (amount < 500) {
    return 10;
  }

  return Math.ceil(amount / 1000) * 15;
}

function serializeTransaction(transaction: {
  id: number;
  type: string;
  status: string;
  customerName: string;
  referenceNumber: string | null;
  amount: { toString(): string };
  serviceFee: { toString(): string };
  notes: string | null;
  createdAt: Date;
}) {
  return {
    ...transaction,
    amount: Number(transaction.amount.toString()),
    serviceFee: Number(transaction.serviceFee.toString()),
    createdAt: transaction.createdAt.toISOString(),
  };
}

// GET /api/gcash-transactions
// Fetch recent transactions. Login is required.
export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 }
    );
  }

  try {
    const transactions = await prisma.gcashTransaction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });

    return NextResponse.json({
      transactions: transactions.map(serializeTransaction),
    });
  } catch (error) {
    console.error("Fetch transactions error:", error);

    return NextResponse.json(
      { message: "Failed to load transactions." },
      { status: 500 }
    );
  }
}

// POST /api/gcash-transactions
// Record a transaction. Login is required.
export async function POST(request: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const customerName =
      typeof body.customerName === "string"
        ? body.customerName.trim()
        : "";

    const type = body.type;

    const referenceNumber =
      typeof body.referenceNumber === "string"
        ? body.referenceNumber.trim()
        : "";

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim()
        : "";

    const rawAmount = body.amount;

    const amountText =
      typeof rawAmount === "number" ||
      typeof rawAmount === "string"
        ? String(rawAmount).trim()
        : "";

    // Validate customer name.
    if (
      customerName.length < 2 ||
      customerName.length > 100
    ) {
      return NextResponse.json(
        {
          message:
            "Customer name must be 2 to 100 characters.",
        },
        { status: 400 }
      );
    }

    // Validate transaction type.
    if (
      type !== "CASH_IN" &&
      type !== "CASH_OUT"
    ) {
      return NextResponse.json(
        {
          message: "Choose Cash In or Cash Out.",
        },
        { status: 400 }
      );
    }

    // Validate amount format and value.
    if (
      !/^\d{1,10}(\.\d{1,2})?$/.test(amountText) ||
      !Number.isFinite(Number(amountText)) ||
      Number(amountText) <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Enter a valid amount greater than zero, with up to two decimal places.",
        },
        { status: 400 }
      );
    }

    const amount = Number(amountText);

    if (amount > 9999999999.99) {
      return NextResponse.json(
        {
          message: "The amount is too large.",
        },
        { status: 400 }
      );
    }

   
    // Prevent duplicate non-empty reference numbers.
    if (referenceNumber) {
      const existingTransaction =
        await prisma.gcashTransaction.findFirst({
          where: {
            referenceNumber,
          },
          select: {
            id: true,
          },
        });

      if (existingTransaction) {
        return NextResponse.json(
          {
            message:
              "This reference number is already recorded. Please use a different reference number.",
          },
          { status: 409 }
        );
      }
    }

    // Calculate the service fee on the server.
    // Never trust a service fee sent by the client.
    const serviceFee = getServiceFee(amount);

    const transaction =
      await prisma.gcashTransaction.create({
        data: {
          customerName,
          type,
          amount: amount.toFixed(2),
          serviceFee: serviceFee.toFixed(2),
          referenceNumber: referenceNumber || null,
          notes: notes || null,
        },
      });

    return NextResponse.json(
      {
        message: "Transaction recorded successfully!",
        transaction: serializeTransaction(transaction),
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle duplicate reference numbers.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message:
            "This reference number is already recorded.",
        },
        { status: 409 }
      );
    }

    console.error("Create transaction error:", error);

    return NextResponse.json(
      {
        message: "Failed to save transaction.",
      },
      { status: 500 }
    );
  }
}
