import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

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
          code: 'MISSING_CODE'
        },
        { status: 400 }
      );
    }

    // Normalize code to uppercase for case-insensitive matching
    const normalizedCode = code.trim().toUpperCase();

    // Query database for class with matching code (case-insensitive)
    const classRecord = await db
      .select()
      .from(classes)
      .where(sql`UPPER(${classes.code}) = ${normalizedCode}`)
      .limit(1);

    // Check if class was found
    if (classRecord.length === 0) {
      return NextResponse.json(
        { 
          error: 'Class not found with this code',
          code: 'CLASS_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Return the found class
    return NextResponse.json(classRecord[0], { status: 200 });

  } catch (error) {
    console.error('GET /api/classes/[code] error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}