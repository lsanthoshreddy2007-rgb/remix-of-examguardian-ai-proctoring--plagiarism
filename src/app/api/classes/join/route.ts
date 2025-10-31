import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes, classEnrollments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const studentId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { classCode } = body;

    // Validate classCode presence
    if (!classCode) {
      return NextResponse.json(
        { error: 'Class code is required', code: 'MISSING_CLASS_CODE' },
        { status: 400 }
      );
    }

    // Validate classCode format (exactly 6 characters)
    if (typeof classCode !== 'string' || classCode.length !== 6) {
      return NextResponse.json(
        { error: 'Class code must be exactly 6 characters', code: 'INVALID_CLASS_CODE_FORMAT' },
        { status: 400 }
      );
    }

    // Normalize code to uppercase for case-insensitive matching
    const normalizedCode = classCode.toUpperCase();

    // Find class by code
    const classRecords = await db
      .select()
      .from(classes)
      .where(eq(classes.code, normalizedCode))
      .limit(1);

    if (classRecords.length === 0) {
      return NextResponse.json(
        { error: 'Class not found with this code', code: 'CLASS_NOT_FOUND' },
        { status: 404 }
      );
    }

    const foundClass = classRecords[0];

    // Check if student is already enrolled
    const existingEnrollment = await db
      .select()
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.classId, foundClass.id),
          eq(classEnrollments.studentId, studentId)
        )
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      return NextResponse.json(
        { error: 'Already enrolled in this class', code: 'ALREADY_ENROLLED' },
        { status: 400 }
      );
    }

    // Create enrollment record
    const newEnrollment = await db
      .insert(classEnrollments)
      .values({
        classId: foundClass.id,
        studentId: studentId,
        enrolledAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(
      {
        enrollment: newEnrollment[0],
        class: foundClass,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}