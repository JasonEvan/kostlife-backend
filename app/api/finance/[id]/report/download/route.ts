import { NextRequest, NextResponse } from "next/server";
import { getCsv } from "./getCsv";
import { getXlsx } from "./getXlsx";

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

  const format = request.nextUrl.searchParams.get("format") || "";
  const gte = request.nextUrl.searchParams.get("gte") || "";
  const lt = request.nextUrl.searchParams.get("lt") || "";

  if (!format || (format !== "csv" && format !== "xlsx")) {
    return NextResponse.json(
      {
        errors: "Format must be included in query params either csv or xlsx",
      },
      { status: 400 }
    );
  }

  if (!gte || !lt) {
    return NextResponse.json(
      {
        errors: "gte and lt must be included in query params",
      },
      { status: 400 }
    );
  }

  if (format === "csv") {
    const csv = await getCsv(gte, lt);
    if (!csv) {
      return NextResponse.json(
        {
          errors: "Cannot convert data to csv",
        },
        { status: 500 }
      );
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=finance.csv",
      },
      status: 200,
    });
  } else {
    const xlsxBuffer = await getXlsx(gte, lt);
    if (!xlsxBuffer) {
      return NextResponse.json(
        {
          errors: "Cannot convert data to xlsx",
        },
        { status: 500 }
      );
    }

    return new NextResponse(xlsxBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=finance.xlsx",
      },
      status: 200,
    });
  }
}
