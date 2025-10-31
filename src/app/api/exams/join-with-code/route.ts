import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exams, examSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classCode, studentId } = body;

    // Validate required fields
    if (!classCode) {
      return NextResponse.json(
        { 
          error: 'Class code is required',
          code: 'MISSING_CLASS_CODE'
        },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { 
          error: 'Student ID is required',
          code: 'MISSING_STUDENT_ID'
        },
        { status: 400 }
      );
    }

    // Validate studentId is a valid integer
    const parsedStudentId = parseInt(studentId);
    if (isNaN(parsedStudentId)) {
      return NextResponse.json(
        { 
          error: 'Student ID must be a valid integer',
          code: 'INVALID_STUDENT_ID'
        },
        { status: 400 }
      );
    }

    // Find exam by classCode (case-insensitive match using uppercase)
    const examResults = await db.select()
      .from(exams)
      .where(eq(exams.classCode, classCode.toUpperCase()))
      .limit(1);

    if (examResults.length === 0) {
      return NextResponse.json(
        { 
          error: 'Exam not found with this class code',
          code: 'EXAM_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const exam = examResults[0];

    // Check if student already has a session for this exam
    const existingSessions = await db.select()
      .from(examSessions)
      .where(
        and(
          eq(examSessions.examId, exam.id),
          eq(examSessions.studentId, parsedStudentId)
        )
      )
      .limit(1);

    if (existingSessions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Student already has a session for this exam',
          code: 'SESSION_ALREADY_EXISTS'
        },
        { status: 400 }
      );
    }

    // Create new exam session
    const newSession = await db.insert(examSessions)
      .values({
        examId: exam.id,
        studentId: parsedStudentId,
        startedAt: new Date().toISOString(),
        endedAt: null,
        status: 'in_progress',
        cheatingScore: 0,
        tabSwitches: 0
      })
      .returning();

    return NextResponse.json(
      {
        session: newSession[0],
        exam: exam
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}