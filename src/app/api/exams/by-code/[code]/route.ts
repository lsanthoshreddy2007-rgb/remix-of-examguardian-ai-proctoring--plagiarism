import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exams } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;

    // Validate code parameter
    if (!code || code.trim() === '') {
      return NextResponse.json(
        {
          error: 'Class code is required',
          code: 'MISSING_CLASS_CODE',
        },
        { status: 400 }
      );
    }

    // Search for exam by class code (case-insensitive)
    const exam = await db
      .select()
      .from(exams)
      .where(eq(exams.classCode, code.toUpperCase()))
      .limit(1);

    // Check if exam exists
    if (exam.length === 0) {
      return NextResponse.json(
        {
          error: 'Exam not found with this class code',
          code: 'EXAM_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Return the complete exam object
    return NextResponse.json(exam[0], { status: 200 });
  } catch (error) {
    console.error('GET exam by code error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}