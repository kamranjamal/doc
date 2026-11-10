import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureDemoUsers, DEMO_ACCOUNTS } from "@/lib/seed-users";

export async function GET() {
  try {
    // Ensure demo accounts exist in MongoDB
    await ensureDemoUsers();

    const user = await getCurrentUser();

    return NextResponse.json({
      user: user
        ? {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt,
          }
        : null,
      demoAccounts: DEMO_ACCOUNTS,
    });
  } catch (error: unknown) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate session" },
      { status: 500 }
    );
  }
}

