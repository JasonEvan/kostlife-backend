import { validate } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as bcrypt from "bcrypt";
import { PrismaService } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let data;
  try {
    data = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json(
      {
        errors: "Invalid format",
      },
      { status: 400 }
    );
  }

  const requiredFields = ["name", "email", "phone_number", "password"];
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        errors: "Must fill all the data",
      },
      {
        status: 400,
      }
    );
  }

  const schema = z.object({
    name: z.string().min(1).max(30),
    email: z.string().email(),
    password: z.string().min(8, "Password should be 8 characters long"),
    phone_number: z.string().min(11).max(14),
  });

  try {
    validate(data, schema);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          errors: err.errors[0].message,
        },
        { status: 400 }
      );
    }
  }

  const encryptedPassword = await bcrypt.hash(data.password, 10);
  const prisma = PrismaService.getInstance();

  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: encryptedPassword,
        phone_number: data.phone_number,
        gender: null,
        image_path: null,
      },
    });

    return NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        phone_number: user.phone_number,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json(
      {
        errors: "Cannot get data",
      },
      { status: 500 }
    );
  }
}
