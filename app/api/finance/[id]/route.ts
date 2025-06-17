import { PrismaService } from "@/lib/prisma";
import { validate } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
  const month = Number(request.nextUrl.searchParams.get("month") || "");
  const year = Number(request.nextUrl.searchParams.get("year") || "");

  if (isNaN(userId)) {
    return NextResponse.json(
      {
        errors: "ID is not a number",
      },
      { status: 400 }
    );
  }

  if (!month || !year) {
    return NextResponse.json(
      {
        errors: "Month and year must be included in query params",
      },
      { status: 400 }
    );
  }

  if (isNaN(month) || isNaN(year)) {
    return NextResponse.json(
      {
        errors: "Month or Year must be a number",
      },
      { status: 400 }
    );
  }

  // rentang waktu
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const prisma = PrismaService.getInstance();
  let finance;
  try {
    finance = await prisma.finance.findMany({
      where: {
        user_id: userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        category: true,
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

  let total_pemasukan = 0;
  let total_pengeluaran = 0;
  const totalCount = finance.reduce(
    (acc: Record<string, Record<string, number>>, curr) => {
      const key = curr.date.toISOString().split("T")[0]; // ambil tanggal saja
      if (!acc[key]) {
        acc[key] = {
          pemasukan: 0,
          pengeluaran: 0,
        };
      }

      if (curr.category.type == "Pemasukan") {
        acc[key].pemasukan += curr.amount;
        total_pemasukan += curr.amount;
      } else if (curr.category.type == "Pengeluaran") {
        acc[key].pengeluaran += curr.amount;
        total_pengeluaran += curr.amount;
      }

      return acc;
    },
    {}
  );

  return NextResponse.json({
    data: finance,
    total_count: totalCount,
    total_pemasukan,
    total_pengeluaran,
  });
}

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

  const requiredFields = ["name", "type", "category", "amount", "date"];
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
    type: z.enum(["Pemasukan", "Pengeluaran"]),
    category: z.string().min(1, "Category must be filled"),
    amount: z.number(),
    date: z.string().datetime(),
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
    const category = await prisma.category.upsert({
      where: {
        name_type_user_id: {
          name: data.category,
          type: data.type,
          user_id: userId,
        },
      },
      update: {},
      create: {
        name: data.category,
        type: data.type,
        icon_family: "MaterialIcons",
        icon_name: "pets",
        user_id: userId,
      },
    });

    await prisma.finance.create({
      data: {
        name: data.name,
        amount: data.amount,
        date: data.date,
        user_id: userId,
        category_id: category.id,
      },
    });

    return NextResponse.json({
      data: true,
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
