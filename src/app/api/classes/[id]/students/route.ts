import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes, classEnrollments, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and validate class ID
    const classId = params.id;
    if (!classId || isNaN(parseInt(classId))) {
      return NextResponse.json(
        { error: 'Valid class ID is required', code: 'INVALID_CLASS_ID' },
        { status: 400 }
      );
    }

    const parsedClassId = parseInt(classId);

    // Check if class exists
    const classRecord = await db
      .select()
      .from(classes)
      .where(eq(classes.id, parsedClassId))
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

    // Query students enrolled in the class with JOIN
    const enrolledStudents = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        enrolledAt: classEnrollments.enrolledAt,
      })
      .from(classEnrollments)
      .innerJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, parsedClassId))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(enrolledStudents, { status: 200 });
  } catch (error) {
    console.error('GET students error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}