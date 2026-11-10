import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { signAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { ensureDemoUsers } from "@/lib/seed-users";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required for demo login" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await ensureDemoUsers();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: "Demo account not found" },
        { status: 404 }
      );
    }

    const token = await signAuthToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        message: `Logged in as demo user ${user.name}`,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Failed to log in as demo user" },
      { status: 500 }
    );
  }
}

