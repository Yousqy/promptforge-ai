import { NextRequest } from "next/server";
import { prisma } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json();

    if (!userId || !email || !name) {
      return Response.json(
        { error: "userId, email, and name are required." },
        { status: 400 }
      );
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (existingUser) {
      return Response.json({ ok: true });
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: `${name}'s Workspace`,
        slug: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`,
      },
    });

    // Create user linked to organization
    await prisma.user.create({
      data: {
        id: userId,
        email,
        name,
        orgId: organization.id,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Register API error:", error);
    return Response.json(
      { error: "Failed to create account." },
      { status: 500 }
    );
  }
}
