import { ZodType } from "zod";

export function validate<T>(data: T, schema: ZodType): T {
  return schema.parse(data);
}
