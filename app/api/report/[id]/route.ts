import { PrismaService } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
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
        errors: "ID must be a number",
      },
      { status: 400 }
    );
  }

  const year = request.nextUrl.searchParams.get("year") || "";

  if (!year || isNaN(Number(year))) {
    return NextResponse.json(
      {
        errors: "Must include the year number in query params",
      },
      { status: 400 }
    );
  }

  const prisma = PrismaService.getInstance();
  try {
    const notDoneTask = await prisma.toDo.count({
      where: {
        user_id: userId,
        is_done: false,
        due_date: {
          gte: new Date(Number(year), 0, 1),
          lt: new Date(Number(year) + 1, 0, 1),
        },
      },
    });

    const doneTask = await prisma.toDo.count({
      where: {
        user_id: userId,
        is_done: true,
        due_date: {
          gte: new Date(Number(year), 0, 1),
          lt: new Date(Number(year) + 1, 0, 1),
        },
      },
    });

    const pengeluaran = await prisma.finance.findMany({
      where: {
        user_id: userId,
        date: {
          gte: new Date(Number(year), 0, 1),
          lt: new Date(Number(year) + 1, 0, 1),
        },
        category: {
          type: "Pengeluaran",
        },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    const pemasukan = await prisma.finance.findMany({
      where: {
        user_id: userId,
        date: {
          gte: new Date(Number(year), 0, 1),
          lt: new Date(Number(year) + 1, 0, 1),
        },
        category: {
          type: "Pemasukan",
        },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    const pengeluaranGroup: Record<string, number> = {};
    const pemasukanGroup: Record<string, number> = {};

    months.forEach((month) => {
      pengeluaranGroup[month] = 0;
      pemasukanGroup[month] = 0;
    });

    pengeluaran.forEach((outcome) => {
      const month = months[outcome.date.getMonth()];
      pengeluaranGroup[month] += outcome.amount;
    });

    pemasukan.forEach((income) => {
      const month = months[income.date.getMonth()];
      pemasukanGroup[month] += income.amount;
    });

    return NextResponse.json({
      Pengeluaran: {
        labels: months,
        datasets: [
          {
            data: Object.values(pengeluaranGroup),
          },
        ],
        legend: ["Total Pengeluaran"],
      },
      Pemasukan: {
        labels: months,
        datasets: [
          {
            data: Object.values(pemasukanGroup),
          },
        ],
        legend: ["Total Pemasukan"],
      },
      NotDoneTask: notDoneTask,
      DoneTask: doneTask,
    });

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
