import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single report by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const report = await db
        .select()
        .from(reports)
        .where(eq(reports.id, parseInt(id)))
        .limit(1);

      if (report.length === 0) {
        return NextResponse.json(
          { error: 'Report not found', code: 'REPORT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(report[0], { status: 200 });
    }

    // List all reports with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const sessionId = searchParams.get('sessionId');

    let query = db.select().from(reports);

    // Filter by sessionId if provided
    if (sessionId) {
      const sessionIdInt = parseInt(sessionId);
      if (isNaN(sessionIdInt)) {
        return NextResponse.json(
          { error: 'Invalid sessionId parameter', code: 'INVALID_SESSION_ID' },
          { status: 400 }
        );
      }
      query = query.where(eq(reports.sessionId, sessionIdInt));
    }

    // Sort by generatedAt DESC by default
    const results = await query
      .orderBy(desc(reports.generatedAt))
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
    const { sessionId, summary, pdfUrl } = body;

    // Validate required fields
    if (sessionId === undefined || sessionId === null) {
      return NextResponse.json(
        { error: 'sessionId is required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    if (!summary) {
      return NextResponse.json(
        { error: 'summary is required', code: 'MISSING_SUMMARY' },
        { status: 400 }
      );
    }

    // Validate summary is a valid object
    if (typeof summary !== 'object' || Array.isArray(summary)) {
      return NextResponse.json(
        { error: 'summary must be a valid JSON object', code: 'INVALID_SUMMARY_FORMAT' },
        { status: 400 }
      );
    }

    // Validate sessionId is a valid integer
    const sessionIdInt = parseInt(sessionId);
    if (isNaN(sessionIdInt)) {
      return NextResponse.json(
        { error: 'sessionId must be a valid integer', code: 'INVALID_SESSION_ID' },
        { status: 400 }
      );
    }

    // Create new report
    const newReport = await db
      .insert(reports)
      .values({
        sessionId: sessionIdInt,
        summary,
        pdfUrl: pdfUrl || null,
        generatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newReport[0], { status: 201 });
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const reportId = parseInt(id);

    // Check if report exists
    const existingReport = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (existingReport.length === 0) {
      return NextResponse.json(
        { error: 'Report not found', code: 'REPORT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { sessionId, generatedAt, summary, pdfUrl } = body;

    // Build update object with only provided fields
    const updates: any = {};

    if (sessionId !== undefined) {
      const sessionIdInt = parseInt(sessionId);
      if (isNaN(sessionIdInt)) {
        return NextResponse.json(
          { error: 'sessionId must be a valid integer', code: 'INVALID_SESSION_ID' },
          { status: 400 }
        );
      }
      updates.sessionId = sessionIdInt;
    }

    if (generatedAt !== undefined) {
      updates.generatedAt = generatedAt;
    }

    if (summary !== undefined) {
      // Validate summary is a valid object
      if (typeof summary !== 'object' || Array.isArray(summary)) {
        return NextResponse.json(
          { error: 'summary must be a valid JSON object', code: 'INVALID_SUMMARY_FORMAT' },
          { status: 400 }
        );
      }
      updates.summary = summary;
    }

    if (pdfUrl !== undefined) {
      updates.pdfUrl = pdfUrl;
    }

    // Update report
    const updatedReport = await db
      .update(reports)
      .set(updates)
      .where(eq(reports.id, reportId))
      .returning();

    return NextResponse.json(updatedReport[0], { status: 200 });
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const reportId = parseInt(id);

    // Check if report exists
    const existingReport = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (existingReport.length === 0) {
      return NextResponse.json(
        { error: 'Report not found', code: 'REPORT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete report
    const deletedReport = await db
      .delete(reports)
      .where(eq(reports.id, reportId))
      .returning();

    return NextResponse.json(
      {
        message: 'Report deleted successfully',
        report: deletedReport[0],
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