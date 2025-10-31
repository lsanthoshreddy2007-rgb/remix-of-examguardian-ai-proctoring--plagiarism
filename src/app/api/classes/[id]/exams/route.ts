import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes, exams } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and validate class ID
    const classId = parseInt(params.id);

    if (!classId || isNaN(classId)) {
      return NextResponse.json(
        { error: 'Valid class ID is required', code: 'INVALID_CLASS_ID' },
        { status: 400 }
      );
    }

    // Check if class exists
    const classRecord = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (classRecord.length === 0) {
      return NextResponse.json(
        { error: 'Class not found', code: 'CLASS_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Extract pagination parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Fetch exams for the class with pagination
    const classExams = await db
      .select()
      .from(exams)
      .where(eq(exams.classId, classId))
      .orderBy(desc(exams.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(classExams, { status: 200 });
  } catch (error) {
    console.error('GET exams error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}