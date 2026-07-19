"use server";

import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function signUpUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email || !name) {
    throw new Error("Email and Name are required");
  }

  try {
    // 1. Create a default Organization for the user
    const organization = await prisma.organization.create({
      data: {
        name: `${name}'s Workspace`,
        slug: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`,
      },
    });

    // 2. Create the User and link them to the Organization
    await prisma.user.create({
      data: {
        email,
        name,
        orgId: organization.id,
      },
    });

  } catch (error) {
    console.error("Database insertion failed:", error);
    throw new Error("Failed to create account.");
  }

  // Redirect to a dashboard or home page after successful sign up
  redirect("/");
}