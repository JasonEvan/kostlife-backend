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
      { status: 200 }
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
  let financeOut;
  let financeIn;
  let totalOut;
  let totalIn;
  try {
    financeOut = await prisma.finance.groupBy({
      by: ["category_id"],
      where: {
        user_id: userId,
        date: {
          gte: start,
          lte: end,
        },
        category: {
          type: "Pengeluaran",
        },
      },
      _sum: {
        amount: true,
      },
    });

    financeIn = await prisma.finance.groupBy({
      by: ["category_id"],
      where: {
        user_id: userId,
        date: {
          gte: start,
          lte: end,
        },
        category: {
          type: "Pemasukan",
        },
      },
      _sum: {
        amount: true,
      },
    });

    totalIn = await prisma.finance.aggregate({
      where: {
        user_id: userId,
        date: {
          gte: start,
          lte: end,
        },
        category: {
          type: "Pemasukan",
        },
      },
      _sum: {
        amount: true,
      },
    });

    totalOut = await prisma.finance.aggregate({
      where: {
        user_id: userId,
        date: {
          gte: start,
          lte: end,
        },
        category: {
          type: "Pengeluaran",
        },
      },
      _sum: {
        amount: true,
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

  const detailedPengeluaran = await Promise.all(
    financeOut.map(async (item) => {
      const category = await prisma.category.findUnique({
        where: {
          id: item.category_id,
        },
      });

      return {
        category_name: category?.name ?? "Unknown",
        total_amount: item._sum.amount ?? 0,
        percent: parseFloat(
          (
            ((item._sum.amount ?? 0) / (totalOut._sum.amount ?? 1)) *
            100
          ).toFixed(2)
        ),
        icon_color: category?.icon_color ?? "#9ACBD0",
        icon_name: category?.icon_name ?? "",
        icon_family: category?.icon_family ?? "",
      };
    })
  );

  const detailPemasukan = await Promise.all(
    financeIn.map(async (item) => {
      const category = await prisma.category.findUnique({
        where: {
          id: item.category_id,
        },
      });

      return {
        category_name: category?.name ?? "Unknown",
        total_amount: item._sum.amount ?? 0,
        percent: parseFloat(
          (
            ((item._sum.amount ?? 0) / (totalIn._sum.amount ?? 1)) *
            100
          ).toFixed(2)
        ),
        icon_color: category?.icon_color ?? "#9ACBD0",
        icon_name: category?.icon_name ?? "",
        icon_family: category?.icon_family ?? "",
      };
    })
  );

  return NextResponse.json({
    pengeluaran: detailedPengeluaran,
    pemasukan: detailPemasukan,
  });
}
