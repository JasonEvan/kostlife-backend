import { PrismaService } from "@/lib/prisma";
import { validate } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let categoryId;
  try {
    categoryId = Number((await params).id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    categoryId = NaN;
  }
  if (isNaN(categoryId)) {
    return NextResponse.json(
      {
        errors: "Id must be a number",
      },
      { status: 400 }
    );
  }

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
  const prisma = PrismaService.getInstance();

  try {
    const updatedData = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data,
    });

    return NextResponse.json(
      {
        data: updatedData,
      },
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json(
      {
        errors: "Cannot update data",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const type = request.nextUrl.searchParams.get("type") || "";

  if (!type) {
    return NextResponse.json(
      {
        errors: "Must include the type in query params",
      },
      { status: 400 }
    );
  }

  let userId;
  try {
    userId = Number((await params).id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    userId = NaN;
  }
  if (isNaN(userId)) {
    return NextResponse.json(
      {
        errors: "Id must be a number",
      },
      { status: 400 }
    );
  }

  const prisma = PrismaService.getInstance();
  try {
    const data = await prisma.category.findMany({
      where: {
        type,
        user_id: userId,
      },
    });
    return NextResponse.json(
      {
        data,
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  let userId;
  try {
    userId = Number((await params).id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    userId = NaN;
  }
  if (isNaN(userId)) {
    return NextResponse.json(
      {
        errors: "Id must be a number",
      },
      { status: 400 }
    );
  }

  const requiredFields = ["name", "type", "icon_family", "icon_name"];
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
    name: z.string().min(1, "Name must be filled"),
    type: z.enum(["Pengeluaran", "Pemasukan"]),
    icon_family: z.string().min(1, "Icon Family must be filled"),
    icon_name: z.string().min(1, "Icon Name must be filled"),
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
    await prisma.category.create({
      data: { ...data, user_id: userId },
    });
    return NextResponse.json(
      {
        data: true,
      },
      { status: 201 }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json(
      {
        errors: "Cannot insert data",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  let userId;
  try {
    userId = Number((await params).id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    userId = NaN;
  }
  if (isNaN(userId)) {
    return NextResponse.json(
      {
        errors: "Id must be a number",
      },
      { status: 400 }
    );
  }

  const requiredFields = ["ids"];
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
    ids: z.array(z.number()),
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
    await prisma.category.deleteMany({
      where: {
        id: {
          in: data.ids,
        },
        user_id: userId,
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
        errors: "Cannot delete data",
      },
      { status: 500 }
    );
  }
}
