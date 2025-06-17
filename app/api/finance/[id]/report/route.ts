import { PrismaService } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const MONTH_IN_STRING = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

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
        errors: "ID is not a number",
      },
      { status: 400 }
    );
  }

  const year = Number(request.nextUrl.searchParams.get("year") || "");
  if (!year) {
    return NextResponse.json(
      {
        errors: "Year must be included in query params",
      },
      { status: 400 }
    );
  }

  if (isNaN(year)) {
    return NextResponse.json(
      {
        errors: "Year must be a number",
      },
      { status: 400 }
    );
  }

  // rentang waktu
  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const prisma = PrismaService.getInstance();
  try {
    const data = await prisma.finance.findMany({
      where: {
        user_id: userId,
        date: {
          gte: start,
          lt: end,
        },
      },
      include: {
        category: true,
      },
    });

    const response = data.reduce(
      (acc: Record<string, Record<string, number>>, curr) => {
        const month = MONTH_IN_STRING[curr.date.getMonth()];
        if (!acc[month]) {
          acc[month] = {
            Pemasukan: 0,
            Pengeluaran: 0,
          };
        }

        acc[month][curr.category.type] += curr.amount;
        return acc;
      },
      {}
    );

    return NextResponse.json(
      {
        data: response,
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
