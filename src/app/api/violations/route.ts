import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { violations } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_VIOLATION_TYPES = ['multiple_faces', 'phone_detected', 'tab_switch', 'no_face'];
const VALID_SEVERITIES = ['low', 'medium', 'high'];

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

      const violation = await db
        .select()
        .from(violations)
        .where(eq(violations.id, parseInt(id)))
        .limit(1);

      if (violation.length === 0) {
        return NextResponse.json(
          { error: 'Violation not found', code: 'VIOLATION_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(violation[0], { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const sessionId = searchParams.get('sessionId');
    const violationType = searchParams.get('violationType');
    const severity = searchParams.get('severity');

    let query = db.select().from(violations);

    // Build filter conditions
    const conditions = [];

    if (sessionId) {
      if (isNaN(parseInt(sessionId))) {
        return NextResponse.json(
          { error: 'Valid session ID is required', code: 'INVALID_SESSION_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(violations.sessionId, parseInt(sessionId)));
    }

    if (violationType) {
      if (!VALID_VIOLATION_TYPES.includes(violationType)) {
        return NextResponse.json(
          { 
            error: `Invalid violation type. Must be one of: ${VALID_VIOLATION_TYPES.join(', ')}`, 
            code: 'INVALID_VIOLATION_TYPE' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(violations.violationType, violationType));
    }

    if (severity) {
      if (!VALID_SEVERITIES.includes(severity)) {
        return NextResponse.json(
          { 
            error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}`, 
            code: 'INVALID_SEVERITY' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(violations.severity, severity));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(violations.timestamp))
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
    const { sessionId, violationType, severity, description, snapshotUrl } = body;

    // Validate required fields
    if (!violationType) {
      return NextResponse.json(
        { error: 'Violation type is required', code: 'MISSING_VIOLATION_TYPE' },
        { status: 400 }
      );
    }

    if (!VALID_VIOLATION_TYPES.includes(violationType)) {
      return NextResponse.json(
        { 
          error: `Invalid violation type. Must be one of: ${VALID_VIOLATION_TYPES.join(', ')}`, 
          code: 'INVALID_VIOLATION_TYPE' 
        },
        { status: 400 }
      );
    }

    if (!severity) {
      return NextResponse.json(
        { error: 'Severity is required', code: 'MISSING_SEVERITY' },
        { status: 400 }
      );
    }

    if (!VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json(
        { 
          error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}`, 
          code: 'INVALID_SEVERITY' 
        },
        { status: 400 }
      );
    }

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'Description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (sessionId !== null && sessionId !== undefined) {
      if (isNaN(parseInt(sessionId))) {
        return NextResponse.json(
          { error: 'Valid session ID is required', code: 'INVALID_SESSION_ID' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: {
      sessionId: number | null;
      violationType: string;
      severity: string;
      description: string;
      timestamp: string;
      snapshotUrl?: string;
    } = {
      sessionId: sessionId ? parseInt(sessionId) : null,
      violationType: violationType.trim(),
      severity: severity.trim(),
      description: description.trim(),
      timestamp: new Date().toISOString(),
    };

    if (snapshotUrl && snapshotUrl.trim() !== '') {
      insertData.snapshotUrl = snapshotUrl.trim();
    }

    const newViolation = await db
      .insert(violations)
      .values(insertData)
      .returning();

    return NextResponse.json(newViolation[0], { status: 201 });
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
    const { sessionId, violationType, severity, timestamp, snapshotUrl, description } = body;

    // Check if violation exists
    const existing = await db
      .select()
      .from(violations)
      .where(eq(violations.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Violation not found', code: 'VIOLATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate violationType if provided
    if (violationType !== undefined && !VALID_VIOLATION_TYPES.includes(violationType)) {
      return NextResponse.json(
        { 
          error: `Invalid violation type. Must be one of: ${VALID_VIOLATION_TYPES.join(', ')}`, 
          code: 'INVALID_VIOLATION_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate severity if provided
    if (severity !== undefined && !VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json(
        { 
          error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}`, 
          code: 'INVALID_SEVERITY' 
        },
        { status: 400 }
      );
    }

    // Validate description if provided
    if (description !== undefined && description.trim() === '') {
      return NextResponse.json(
        { error: 'Description cannot be empty', code: 'INVALID_DESCRIPTION' },
        { status: 400 }
      );
    }

    // Validate sessionId if provided
    if (sessionId !== undefined && sessionId !== null && isNaN(parseInt(sessionId))) {
      return NextResponse.json(
        { error: 'Valid session ID is required', code: 'INVALID_SESSION_ID' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: {
      sessionId?: number | null;
      violationType?: string;
      severity?: string;
      timestamp?: string;
      snapshotUrl?: string | null;
      description?: string;
    } = {};

    if (sessionId !== undefined) {
      updates.sessionId = sessionId ? parseInt(sessionId) : null;
    }

    if (violationType !== undefined) {
      updates.violationType = violationType.trim();
    }

    if (severity !== undefined) {
      updates.severity = severity.trim();
    }

    if (timestamp !== undefined) {
      updates.timestamp = timestamp;
    }

    if (snapshotUrl !== undefined) {
      updates.snapshotUrl = snapshotUrl ? snapshotUrl.trim() : null;
    }

    if (description !== undefined) {
      updates.description = description.trim();
    }

    const updated = await db
      .update(violations)
      .set(updates)
      .where(eq(violations.id, parseInt(id)))
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

    // Check if violation exists
    const existing = await db
      .select()
      .from(violations)
      .where(eq(violations.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Violation not found', code: 'VIOLATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(violations)
      .where(eq(violations.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { 
        message: 'Violation deleted successfully', 
        violation: deleted[0] 
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