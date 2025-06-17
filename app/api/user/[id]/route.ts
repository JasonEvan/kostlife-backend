import { PrismaService } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcrypt";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id;
  try {
    id = Number((await params).id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    id = NaN;
  }
  if (isNaN(id)) {
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

  const prisma = PrismaService.getInstance();

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  try {
    await prisma.user.update({
      where: {
        id,
      },
      data,
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
        errors: "Cannot get data",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

  const prisma = PrismaService.getInstance();
  try {
    await prisma.finance.deleteMany({
      where: {
        user_id: userId,
      },
    });

    await prisma.category.deleteMany({
      where: {
        user_id: userId,
      },
    });

    await prisma.toDo.deleteMany({
      where: {
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
