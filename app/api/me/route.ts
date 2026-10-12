import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const secret = process.env.SESSION_SECRET;

    if (!secret || secret.length < 32) {
      return NextResponse.json(
        { message: "Server authentication is not configured." },
        { status: 500 }
      );
    }

    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);

    if (!payload.sub) {
      return NextResponse.json(
        { message: "Invalid session." },
        { status: 401 }
      );
    }

    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { message: "Invalid session." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      const response = NextResponse.json(
        { message: "User not found." },
        { status: 401 }
      );

      response.cookies.delete("session");
      return response;
    }

    return NextResponse.json({ user });
  } catch {
    const response = NextResponse.json(
      { message: "Invalid or expired session." },
      { status: 401 }
    );

    response.cookies.delete("session");
    return response;
  }
}