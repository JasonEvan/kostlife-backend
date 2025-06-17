import { PrismaService } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface GroupInterface {
  name: string;
  count: number;
  percent: number;
}

interface ResponseInterface {
  id: number;
  name: string;
  is_important: boolean;
  is_done: boolean;
  due_date: Date;
  created_at: Date;
  user_id: number;
  is_remindered: boolean;
  done_time: Date | null;
}

const month = [
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
        errors: "ID must be a number",
      },
      { status: 400 }
    );
  }

  const year = request.nextUrl.searchParams.get("year") || "";
  if (!year || !Number(year)) {
    return NextResponse.json(
      {
        errors: "Year must be valid in query params",
      },
      { status: 400 }
    );
  }

  const prisma = PrismaService.getInstance();
  try {
    const start = new Date(Number(year), 0, 1);
    const end = new Date(Number(year) + 1, 0, 1);
    const doneOnTime: ResponseInterface[] = await prisma.$queryRaw`
      SELECT * FROM "todos"
      WHERE
          "user_id" = ${userId} AND
          "due_date" >= ${start} AND
          "due_date" < ${end} AND
          "is_done" = true AND
          "done_time" IS NOT NULL AND
          "done_time" <= "due_date"
    `;

    const doneLate: ResponseInterface[] = await prisma.$queryRaw`
      SELECT * FROM "todos"
      WHERE
        "user_id" = ${userId} AND
        "due_date" >= ${start} AND
        "due_date" < ${end} AND
        "is_done" = true AND
        "done_time" IS NOT NULL AND
        "done_time" > "due_date"
    `;

    const notDone: ResponseInterface[] = await prisma.$queryRaw`
      SELECT * FROM "todos"
      WHERE
        "user_id" = ${userId} AND
        "due_date" >= ${start} AND
        "due_date" < ${end} AND
        "is_done" = false AND
        "done_time" IS NULL
    `;

    const groups: Record<string, GroupInterface[]> = {};

    doneOnTime.forEach((task) => {
      const key = `${
        month[task.due_date.getMonth()]
      } ${task.due_date.getFullYear()}`;

      if (!groups[key]) {
        groups[key] = [
          {
            name: "Tugas Selesai",
            count: 0,
            percent: 0,
          },
          {
            name: "Tugas Belum Selesai",
            count: 0,
            percent: 0,
          },
          {
            name: "Tugas Selesai Terlambat",
            count: 0,
            percent: 0,
          },
        ];
      }

      groups[key][0].count += 1;
    });

    doneLate.forEach((task) => {
      const key = `${
        month[task.due_date.getMonth()]
      } ${task.due_date.getFullYear()}`;

      if (!groups[key]) {
        groups[key] = [
          {
            name: "Tugas Selesai",
            count: 0,
            percent: 0,
          },
          {
            name: "Tugas Belum Selesai",
            count: 0,
            percent: 0,
          },
          {
            name: "Tugas Selesai Terlambat",
            count: 0,
            percent: 0,
          },
        ];
      }

      groups[key][2].count += 1;
    });

    notDone.forEach((task) => {
      const key = `${
        month[task.due_date.getMonth()]
      } ${task.due_date.getFullYear()}`;

      if (!groups[key]) {
        groups[key] = [
          {
            name: "Tugas Selesai",
            count: 0,
            percent: 0,
          },
          {
            name: "Tugas Belum Selesai",
            count: 0,
            percent: 0,
          },
          {
            name: "Tugas Selesai Terlambat",
            count: 0,
            percent: 0,
          },
        ];
      }

      groups[key][1].count += 1;
    });

    Object.keys(groups).forEach((date) => {
      const totalCount =
        groups[date][0].count + groups[date][1].count + groups[date][2].count;

      groups[date][0].percent = Number(
        ((groups[date][0].count / totalCount) * 100).toFixed(2)
      );
      groups[date][1].percent = Number(
        ((groups[date][1].count / totalCount) * 100).toFixed(2)
      );
      groups[date][2].percent = Number(
        ((groups[date][2].count / totalCount) * 100).toFixed(2)
      );
    });

    return NextResponse.json(
      {
        data: groups,
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
