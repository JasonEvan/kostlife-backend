import { PrismaService } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function getXlsx(gte: string, lt: string) {
  const prisma = PrismaService.getInstance();
  try {
    const todo = await prisma.toDo.findMany({
      where: {
        due_date: {
          gte: new Date(gte),
          lt: new Date(lt),
        },
      },
      omit: {
        created_at: true,
        user_id: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.columns = Object.keys(todo[0]).map((key) => ({
      header: key,
      key: key,
    }));
    worksheet.addRows(todo);

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return null;
  }
}
