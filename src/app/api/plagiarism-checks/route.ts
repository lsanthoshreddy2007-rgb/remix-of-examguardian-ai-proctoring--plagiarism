import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { plagiarismChecks } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_ANALYSIS_METHODS = ['tf-idf', 'cosine', 'gpt'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const plagiarismCheck = await db
        .select()
        .from(plagiarismChecks)
        .where(eq(plagiarismChecks.id, parseInt(id)))
        .limit(1);

      if (plagiarismCheck.length === 0) {
        return NextResponse.json(
          { error: 'Plagiarism check not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(plagiarismCheck[0], { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const sessionId = searchParams.get('sessionId');
    const analysisMethod = searchParams.get('analysisMethod');

    let query = db.select().from(plagiarismChecks);

    // Build where conditions
    const conditions = [];
    if (sessionId) {
      if (isNaN(parseInt(sessionId))) {
        return NextResponse.json(
          { error: 'Valid sessionId is required', code: 'INVALID_SESSION_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(plagiarismChecks.sessionId, parseInt(sessionId)));
    }
    if (analysisMethod) {
      if (!VALID_ANALYSIS_METHODS.includes(analysisMethod)) {
        return NextResponse.json(
          {
            error: `Invalid analysisMethod. Must be one of: ${VALID_ANALYSIS_METHODS.join(', ')}`,
            code: 'INVALID_ANALYSIS_METHOD',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(plagiarismChecks.analysisMethod, analysisMethod));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sort by checkedAt DESC and apply pagination
    const results = await query
      .orderBy(desc(plagiarismChecks.checkedAt))
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
    const { sessionId, fileName, fileUrl, plagiarismScore, matchedSources, analysisMethod } = body;

    // Validate required fields
    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName is required', code: 'MISSING_FILE_NAME' },
        { status: 400 }
      );
    }

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'fileUrl is required', code: 'MISSING_FILE_URL' },
        { status: 400 }
      );
    }

    if (plagiarismScore === undefined || plagiarismScore === null) {
      return NextResponse.json(
        { error: 'plagiarismScore is required', code: 'MISSING_PLAGIARISM_SCORE' },
        { status: 400 }
      );
    }

    if (!matchedSources) {
      return NextResponse.json(
        { error: 'matchedSources is required', code: 'MISSING_MATCHED_SOURCES' },
        { status: 400 }
      );
    }

    if (!analysisMethod) {
      return NextResponse.json(
        { error: 'analysisMethod is required', code: 'MISSING_ANALYSIS_METHOD' },
        { status: 400 }
      );
    }

    // Validate plagiarismScore range
    const score = parseInt(plagiarismScore);
    if (isNaN(score) || score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'plagiarismScore must be between 0 and 100', code: 'INVALID_PLAGIARISM_SCORE' },
        { status: 400 }
      );
    }

    // Validate analysisMethod
    if (!VALID_ANALYSIS_METHODS.includes(analysisMethod)) {
      return NextResponse.json(
        {
          error: `analysisMethod must be one of: ${VALID_ANALYSIS_METHODS.join(', ')}`,
          code: 'INVALID_ANALYSIS_METHOD',
        },
        { status: 400 }
      );
    }

    // Validate matchedSources is an array
    if (!Array.isArray(matchedSources)) {
      return NextResponse.json(
        { error: 'matchedSources must be a valid JSON array', code: 'INVALID_MATCHED_SOURCES' },
        { status: 400 }
      );
    }

    // Validate sessionId if provided
    if (sessionId !== undefined && sessionId !== null) {
      const sessionIdInt = parseInt(sessionId);
      if (isNaN(sessionIdInt)) {
        return NextResponse.json(
          { error: 'sessionId must be a valid integer', code: 'INVALID_SESSION_ID' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: any = {
      fileName: fileName.trim(),
      fileUrl: fileUrl.trim(),
      plagiarismScore: score,
      matchedSources,
      analysisMethod: analysisMethod.trim(),
      checkedAt: new Date().toISOString(),
    };

    // Only include sessionId if it's provided and valid
    if (sessionId !== undefined && sessionId !== null) {
      insertData.sessionId = parseInt(sessionId);
    }

    const newPlagiarismCheck = await db
      .insert(plagiarismChecks)
      .values(insertData)
      .returning();

    return NextResponse.json(newPlagiarismCheck[0], { status: 201 });
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

    const body = await request.json();
    const { sessionId, fileName, fileUrl, plagiarismScore, matchedSources, analysisMethod, checkedAt } = body;

    // Check if record exists
    const existing = await db
      .select()
      .from(plagiarismChecks)
      .where(eq(plagiarismChecks.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Plagiarism check not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {};

    if (sessionId !== undefined) {
      if (sessionId !== null) {
        const sessionIdInt = parseInt(sessionId);
        if (isNaN(sessionIdInt)) {
          return NextResponse.json(
            { error: 'sessionId must be a valid integer', code: 'INVALID_SESSION_ID' },
            { status: 400 }
          );
        }
        updates.sessionId = sessionIdInt;
      } else {
        updates.sessionId = null;
      }
    }

    if (fileName !== undefined) {
      if (!fileName) {
        return NextResponse.json(
          { error: 'fileName cannot be empty', code: 'INVALID_FILE_NAME' },
          { status: 400 }
        );
      }
      updates.fileName = fileName.trim();
    }

    if (fileUrl !== undefined) {
      if (!fileUrl) {
        return NextResponse.json(
          { error: 'fileUrl cannot be empty', code: 'INVALID_FILE_URL' },
          { status: 400 }
        );
      }
      updates.fileUrl = fileUrl.trim();
    }

    if (plagiarismScore !== undefined) {
      const score = parseInt(plagiarismScore);
      if (isNaN(score) || score < 0 || score > 100) {
        return NextResponse.json(
          { error: 'plagiarismScore must be between 0 and 100', code: 'INVALID_PLAGIARISM_SCORE' },
          { status: 400 }
        );
      }
      updates.plagiarismScore = score;
    }

    if (matchedSources !== undefined) {
      if (!Array.isArray(matchedSources)) {
        return NextResponse.json(
          { error: 'matchedSources must be a valid JSON array', code: 'INVALID_MATCHED_SOURCES' },
          { status: 400 }
        );
      }
      updates.matchedSources = matchedSources;
    }

    if (analysisMethod !== undefined) {
      if (!VALID_ANALYSIS_METHODS.includes(analysisMethod)) {
        return NextResponse.json(
          {
            error: `analysisMethod must be one of: ${VALID_ANALYSIS_METHODS.join(', ')}`,
            code: 'INVALID_ANALYSIS_METHOD',
          },
          { status: 400 }
        );
      }
      updates.analysisMethod = analysisMethod.trim();
    }

    if (checkedAt !== undefined) {
      updates.checkedAt = checkedAt;
    }

    const updated = await db
      .update(plagiarismChecks)
      .set(updates)
      .where(eq(plagiarismChecks.id, parseInt(id)))
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

    // Check if record exists
    const existing = await db
      .select()
      .from(plagiarismChecks)
      .where(eq(plagiarismChecks.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Plagiarism check not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(plagiarismChecks)
      .where(eq(plagiarismChecks.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Plagiarism check deleted successfully',
        deletedRecord: deleted[0],
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