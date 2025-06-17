import { PrismaService } from "@/lib/prisma";
import { validate } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        errors: "ID is not a number",
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

  const requiredFields = [
    "name",
    "is_important",
    "is_done",
    "due_date",
    "is_remindered",
  ];
  const missingFields = requiredFields.filter(
    (field) => data[field] === undefined || data[field] === null
  );

  if (missingFields.length > 0) {
    console.log(missingFields);
    return NextResponse.json(
      {
        errors: "Must fill all the data",
      },
      { status: 400 }
    );
  }

  const schema = z.object({
    name: z.string().min(1, "Name must be filled"),
    is_important: z.boolean(),
    is_done: z.boolean(),
    due_date: z.string().datetime(),
    is_remindered: z.boolean(),
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

  const prisma = await PrismaService.getInstance();
  try {
    await prisma.toDo.create({
      data: {
        name: data.name,
        is_important: data.is_important,
        is_done: data.is_done,
        due_date: data.due_date,
        is_remindered: data.is_remindered,
        user_id: userId,
      },
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
        errors: "Cannot get data",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let toDoId;
  try {
    toDoId = Number((await params).id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    toDoId = NaN;
  }

  if (isNaN(toDoId)) {
    return NextResponse.json(
      {
        errors: "To-Do ID must be a number",
      },
      { status: 400 }
    );
  }

  const prisma = PrismaService.getInstance();
  try {
    const data = await request.json();

    const updatedData = await prisma.toDo.update({
      where: {
        id: toDoId,
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
        errors: "ID must be a number",
      },
      { status: 400 }
    );
  }

  const gte = request.nextUrl.searchParams.get("gte") || "";
  const lt = request.nextUrl.searchParams.get("lt") || "";

  if (!gte || !lt) {
    return NextResponse.json(
      {
        errors: "Must include the gte and lt in query params",
      },
      { status: 400 }
    );
  }

  const prisma = PrismaService.getInstance();
  try {
    const data = await prisma.toDo.findMany({
      where: {
        user_id: userId,
        due_date: {
          gte: new Date(gte),
          lt: new Date(lt),
        },
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
        errors: `Cannot get data with user id ${userId}`,
      },
      { status: 500 }
    );
  }
}
