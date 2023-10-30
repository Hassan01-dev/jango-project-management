import { NextRequest, NextResponse } from "next/server";
import db from "@/dbConfig/dbConfig";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { username, fullname, email, password } = reqBody;

    if (!username || !fullname || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await db.user.create({
      data: {
        fullname,
        username,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      success: true,
      user: newUser,
    });
  } catch (err: any) {
    console.error("Error while creating user", err);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
