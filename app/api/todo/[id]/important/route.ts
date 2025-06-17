import { PrismaService } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
        is_important: true,
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
