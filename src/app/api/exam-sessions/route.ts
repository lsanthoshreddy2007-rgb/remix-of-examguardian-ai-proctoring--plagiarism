import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { examSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_STATUSES = ['active', 'completed', 'flagged'];

function validateStatus(status: string): boolean {
  return VALID_STATUSES.includes(status);
}

function validateCheatingScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 100;
}

function validateTabSwitches(switches: number): boolean {
  return Number.isInteger(switches) && switches >= 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const session = await db
        .select()
        .from(examSessions)
        .where(eq(examSessions.id, parseInt(id)))
        .limit(1);

      if (session.length === 0) {
        return NextResponse.json(
          { error: 'Exam session not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(session[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const examId = searchParams.get('examId');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    let query = db.select().from(examSessions);

    const conditions = [];

    if (examId) {
      if (isNaN(parseInt(examId))) {
        return NextResponse.json(
          { error: 'Valid examId is required', code: 'INVALID_EXAM_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(examSessions.examId, parseInt(examId)));
    }

    if (studentId) {
      if (isNaN(parseInt(studentId))) {
        return NextResponse.json(
          { error: 'Valid studentId is required', code: 'INVALID_STUDENT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(examSessions.studentId, parseInt(studentId)));
    }

    if (status) {
      if (!validateStatus(status)) {
        return NextResponse.json(
          {
            error: 'Invalid status. Must be one of: active, completed, flagged',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(examSessions.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const sessions = await query.limit(limit).offset(offset);

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      examId,
      studentId,
      endedAt,
      status = 'active',
      cheatingScore = 0,
      tabSwitches = 0,
    } = body;

    if (!examId || isNaN(parseInt(examId))) {
      return NextResponse.json(
        { error: 'Valid examId is required', code: 'MISSING_EXAM_ID' },
        { status: 400 }
      );
    }

    if (!studentId || isNaN(parseInt(studentId))) {
      return NextResponse.json(
        { error: 'Valid studentId is required', code: 'MISSING_STUDENT_ID' },
        { status: 400 }
      );
    }

    if (!validateStatus(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be one of: active, completed, flagged',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    if (!validateCheatingScore(cheatingScore)) {
      return NextResponse.json(
        {
          error: 'Invalid cheatingScore. Must be an integer between 0 and 100',
          code: 'INVALID_CHEATING_SCORE',
        },
        { status: 400 }
      );
    }

    if (!validateTabSwitches(tabSwitches)) {
      return NextResponse.json(
        {
          error: 'Invalid tabSwitches. Must be a non-negative integer',
          code: 'INVALID_TAB_SWITCHES',
        },
        { status: 400 }
      );
    }

    if (endedAt && typeof endedAt !== 'string') {
      return NextResponse.json(
        { error: 'endedAt must be a valid ISO timestamp string', code: 'INVALID_ENDED_AT' },
        { status: 400 }
      );
    }

    const newSession = await db
      .insert(examSessions)
      .values({
        examId: parseInt(examId),
        studentId: parseInt(studentId),
        startedAt: new Date().toISOString(),
        endedAt: endedAt || null,
        status,
        cheatingScore,
        tabSwitches,
      })
      .returning();

    return NextResponse.json(newSession[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Exam session not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      examId,
      studentId,
      startedAt,
      endedAt,
      status,
      cheatingScore,
      tabSwitches,
    } = body;

    if (examId !== undefined && (isNaN(parseInt(examId)))) {
      return NextResponse.json(
        { error: 'Valid examId is required', code: 'INVALID_EXAM_ID' },
        { status: 400 }
      );
    }

    if (studentId !== undefined && (isNaN(parseInt(studentId)))) {
      return NextResponse.json(
        { error: 'Valid studentId is required', code: 'INVALID_STUDENT_ID' },
        { status: 400 }
      );
    }

    if (status !== undefined && !validateStatus(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be one of: active, completed, flagged',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    if (cheatingScore !== undefined && !validateCheatingScore(cheatingScore)) {
      return NextResponse.json(
        {
          error: 'Invalid cheatingScore. Must be an integer between 0 and 100',
          code: 'INVALID_CHEATING_SCORE',
        },
        { status: 400 }
      );
    }

    if (tabSwitches !== undefined && !validateTabSwitches(tabSwitches)) {
      return NextResponse.json(
        {
          error: 'Invalid tabSwitches. Must be a non-negative integer',
          code: 'INVALID_TAB_SWITCHES',
        },
        { status: 400 }
      );
    }

    const updates: any = {};

    if (examId !== undefined) updates.examId = parseInt(examId);
    if (studentId !== undefined) updates.studentId = parseInt(studentId);
    if (startedAt !== undefined) updates.startedAt = startedAt;
    if (endedAt !== undefined) updates.endedAt = endedAt;
    if (status !== undefined) updates.status = status;
    if (cheatingScore !== undefined) updates.cheatingScore = cheatingScore;
    if (tabSwitches !== undefined) updates.tabSwitches = tabSwitches;

    const updated = await db
      .update(examSessions)
      .set(updates)
      .where(eq(examSessions.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Exam session not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(examSessions)
      .where(eq(examSessions.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Exam session deleted successfully',
        deletedSession: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}