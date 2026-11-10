import { connectToDatabase } from "./db";
import { User, IUser } from "@/models/User";

export interface DemoUserDef {
  name: string;
  email: string;
  role: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoUserDef[] = [
  {
    name: "Alex Morgan",
    email: "alex@draftly.demo",
    role: "Primary Owner",
    description: "Creates and owns the primary team documents",
  },
  {
    name: "Sam Taylor",
    email: "sam@draftly.demo",
    role: "Sharing Recipient",
    description: "Invited to view and collaborate on shared docs",
  },
  {
    name: "Jordan Lee",
    email: "jordan@draftly.demo",
    role: "Unrelated User",
    description: "Isolated workspace member for testing access control",
  },
];

export async function ensureDemoUsers(): Promise<IUser[]> {
  await connectToDatabase();
  const seeded: IUser[] = [];

  for (const account of DEMO_ACCOUNTS) {
    let user = await User.findOne({ email: account.email }).select("+password");
    if (!user) {
      user = await User.create({
        name: account.name,
        email: account.email,
        password: "password123",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(account.name)}`,
      });
    }
    seeded.push(user);
  }

  return seeded;
}

