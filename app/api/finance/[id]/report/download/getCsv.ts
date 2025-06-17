import { PrismaService } from "@/lib/prisma";
import { json2csv } from "json-2-csv";

export async function getCsv(gte: string, lt: string) {
  const prisma = PrismaService.getInstance();
  try {
    const finance = await prisma.finance.findMany({
      where: {
        date: {
          gte: new Date(gte),
          lt: new Date(lt),
        },
      },
      omit: {
        created_at: true,
        category_id: true,
        user_id: true,
      },
    });

    const csv = json2csv(finance);
    return csv;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return null;
  }
}
