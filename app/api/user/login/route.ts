import { PrismaService } from "@/lib/prisma";
import { validate } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as bcrypt from "bcrypt";

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

  const requiredFields = ["email", "password"];
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
    email: z.string().email(),
    password: z.string().min(8, "Password should be 8 characters long"),
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

  const prisma = PrismaService.getInstance();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          errors: "No User found",
        },
        { status: 404 }
      );
    }

    const result = await bcrypt.compare(data.password, user.password);
    if (!result) {
      return NextResponse.json(
        {
          errors: "Email or password is wrong",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        data: {
          id: user.id,
          name: user.name,
          phone_number: user.phone_number,
          gender: user.gender,
          image_path: user.image_path,
        },
      },
      { status: 200 }
    );
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
