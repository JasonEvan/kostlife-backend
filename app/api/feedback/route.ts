import { PrismaService } from "@/lib/prisma";
import { validate } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

  const requiredFields = ["feedback"];
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        errors: "Must fill all the data",
      },
      { status: 400 }
    );
  }

  const schema = z.object({
    feedback: z.string().min(1, "Feedback must be filled"),
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
    await prisma.feedback.create({
      data: {
        feedback: data.feedback,
      },
    });

    return NextResponse.json(
      {
        data: true,
      },
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json(
      {
        errors: "Cannot insert feedback",
      },
      { status: 500 }
    );
  }
}
