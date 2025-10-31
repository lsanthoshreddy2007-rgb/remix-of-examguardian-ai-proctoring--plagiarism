import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exams } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single exam by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const exam = await db
        .select()
        .from(exams)
        .where(eq(exams.id, parseInt(id)))
        .limit(1);

      if (exam.length === 0) {
        return NextResponse.json(
          { error: 'Exam not found', code: 'EXAM_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(exam[0], { status: 200 });
    }

    // List exams with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const createdBy = searchParams.get('createdBy');

    let query = db.select().from(exams);

    const conditions = [];

    if (search) {
      conditions.push(like(exams.title, `%${search}%`));
    }

    if (createdBy) {
      if (isNaN(parseInt(createdBy))) {
        return NextResponse.json(
          { error: 'Valid createdBy ID is required', code: 'INVALID_CREATED_BY' },
          { status: 400 }
        );
      }
      conditions.push(eq(exams.createdBy, parseInt(createdBy)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(exams.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const { title, description, durationMinutes, questions, createdBy, classCode } = body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!durationMinutes) {
      return NextResponse.json(
        { error: 'Duration in minutes is required', code: 'MISSING_DURATION' },
        { status: 400 }
      );
    }

    if (!questions) {
      return NextResponse.json(
        { error: 'Questions are required', code: 'MISSING_QUESTIONS' },
        { status: 400 }
      );
    }

    if (!classCode || classCode.trim() === '') {
      return NextResponse.json(
        { error: 'Class code is required', code: 'MISSING_CLASS_CODE' },
        { status: 400 }
      );
    }

    // Validate durationMinutes is a positive integer
    const duration = parseInt(durationMinutes);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive integer', code: 'INVALID_DURATION' },
        { status: 400 }
      );
    }

    // Validate questions is a valid array
    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Questions must be a valid array', code: 'INVALID_QUESTIONS' },
        { status: 400 }
      );
    }

    // Validate createdBy if provided
    if (createdBy !== undefined && createdBy !== null) {
      const createdByInt = parseInt(createdBy);
      if (isNaN(createdByInt)) {
        return NextResponse.json(
          { error: 'CreatedBy must be a valid integer', code: 'INVALID_CREATED_BY' },
          { status: 400 }
        );
      }
    }

    // Check if class code already exists
    const existingExam = await db
      .select()
      .from(exams)
      .where(eq(exams.classCode, classCode.trim()))
      .limit(1);

    if (existingExam.length > 0) {
      return NextResponse.json(
        { error: 'Class code already exists', code: 'CLASS_CODE_EXISTS' },
        { status: 400 }
      );
    }

    // Create exam
    const newExam = await db
      .insert(exams)
      .values({
        title: title.trim(),
        description: description ? description.trim() : null,
        durationMinutes: duration,
        questions: questions,
        createdBy: createdBy ? parseInt(createdBy) : null,
        classCode: classCode.trim().toUpperCase(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newExam[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if exam exists
    const existingExam = await db
      .select()
      .from(exams)
      .where(eq(exams.id, parseInt(id)))
      .limit(1);

    if (existingExam.length === 0) {
      return NextResponse.json(
        { error: 'Exam not found', code: 'EXAM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, durationMinutes, questions, createdBy, classCode } = body;

    // Validate durationMinutes if provided
    if (durationMinutes !== undefined) {
      const duration = parseInt(durationMinutes);
      if (isNaN(duration) || duration <= 0) {
        return NextResponse.json(
          { error: 'Duration must be a positive integer', code: 'INVALID_DURATION' },
          { status: 400 }
        );
      }
    }

    // Validate questions if provided
    if (questions !== undefined) {
      if (!Array.isArray(questions)) {
        return NextResponse.json(
          { error: 'Questions must be a valid array', code: 'INVALID_QUESTIONS' },
          { status: 400 }
        );
      }
    }

    // Validate createdBy if provided
    if (createdBy !== undefined && createdBy !== null) {
      const createdByInt = parseInt(createdBy);
      if (isNaN(createdByInt)) {
        return NextResponse.json(
          { error: 'CreatedBy must be a valid integer', code: 'INVALID_CREATED_BY' },
          { status: 400 }
        );
      }
    }

    // Validate classCode if provided
    if (classCode !== undefined && classCode !== null) {
      if (classCode.trim() === '') {
        return NextResponse.json(
          { error: 'Class code cannot be empty', code: 'INVALID_CLASS_CODE' },
          { status: 400 }
        );
      }

      // Check if class code already exists for another exam
      const codeCheck = await db
        .select()
        .from(exams)
        .where(eq(exams.classCode, classCode.trim().toUpperCase()))
        .limit(1);

      if (codeCheck.length > 0 && codeCheck[0].id !== parseInt(id)) {
        return NextResponse.json(
          { error: 'Class code already exists', code: 'CLASS_CODE_EXISTS' },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (title !== undefined) {
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (durationMinutes !== undefined) {
      updates.durationMinutes = parseInt(durationMinutes);
    }

    if (questions !== undefined) {
      updates.questions = questions;
    }

    if (createdBy !== undefined) {
      updates.createdBy = createdBy !== null ? parseInt(createdBy) : null;
    }

    if (classCode !== undefined) {
      updates.classCode = classCode.trim().toUpperCase();
    }

    // Update exam
    const updatedExam = await db
      .update(exams)
      .set(updates)
      .where(eq(exams.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedExam[0], { status: 200 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if exam exists
    const existingExam = await db
      .select()
      .from(exams)
      .where(eq(exams.id, parseInt(id)))
      .limit(1);

    if (existingExam.length === 0) {
      return NextResponse.json(
        { error: 'Exam not found', code: 'EXAM_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete exam
    const deleted = await db
      .delete(exams)
      .where(eq(exams.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Exam deleted successfully',
        exam: deleted[0],
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