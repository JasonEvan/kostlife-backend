import { PrismaService } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

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
        errors: "ID must be a number",
      },
      { status: 400 }
    );
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          errors: "Must include file in body",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error } = await supabase.storage
      .from("image-profile")
      .upload(`avatar-${userId}.png`, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      return NextResponse.json(
        {
          errors: error.message,
        },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      {
        errors: String(err),
      },
      { status: 200 }
    );
  }

  const prisma = PrismaService.getInstance();
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        image_path: `avatar-${userId}.png`,
      },
    });

    return NextResponse.json({
      data: {
        id: user.id,
        image_path: user.image_path,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json(
      {
        errors: "Cannot update data in database",
      },
      { status: 500 }
    );
  }
}
