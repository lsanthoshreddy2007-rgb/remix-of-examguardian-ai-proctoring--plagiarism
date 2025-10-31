import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function generateClassCode(): Promise<string> {
  const generateCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let code = '';
    for (let i = 0; i < 3; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 3; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return code;
  };

  let code = generateCode();
  let isUnique = false;

  while (!isUnique) {
    const existing = await db.select()
      .from(classes)
      .where(eq(classes.code, code))
      .limit(1);
    
    if (existing.length === 0) {
      isUnique = true;
    } else {
      code = generateCode();
    }
  }

  return code;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const classRecord = await db.select()
        .from(classes)
        .where(eq(classes.id, parseInt(id)))
        .limit(1);

      if (classRecord.length === 0) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }

      return NextResponse.json(classRecord[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const adminId = searchParams.get('adminId');

    let query = db.select().from(classes);

    const conditions = [];

    if (search) {
      conditions.push(like(classes.name, `%${search}%`));
    }

    if (adminId) {
      if (!adminId || isNaN(parseInt(adminId))) {
        return NextResponse.json({ 
          error: "Valid adminId is required",
          code: "INVALID_ADMIN_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(classes.adminId, parseInt(adminId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(classes.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Admin role required',
        code: 'ADMIN_ROLE_REQUIRED' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    if ('adminId' in body || 'admin_id' in body) {
      return NextResponse.json({ 
        error: "Admin ID cannot be provided in request body",
        code: "ADMIN_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Name is required and must be a non-empty string',
        code: 'INVALID_NAME' 
      }, { status: 400 });
    }

    if (description !== undefined && typeof description !== 'string') {
      return NextResponse.json({ 
        error: 'Description must be a string',
        code: 'INVALID_DESCRIPTION' 
      }, { status: 400 });
    }

    const code = await generateClassCode();

    const newClass = await db.insert(classes)
      .values({
        name: name.trim(),
        code: code,
        description: description?.trim() || null,
        adminId: parseInt(session.user.id),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newClass[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, code } = body;

    if ('adminId' in body || 'admin_id' in body) {
      return NextResponse.json({ 
        error: "Admin ID cannot be provided in request body",
        code: "ADMIN_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const existingClass = await db.select()
      .from(classes)
      .where(eq(classes.id, parseInt(id)))
      .limit(1);

    if (existingClass.length === 0) {
      return NextResponse.json({ 
        error: 'Class not found',
        code: 'CLASS_NOT_FOUND' 
      }, { status: 404 });
    }

    if (existingClass[0].adminId !== parseInt(session.user.id)) {
      return NextResponse.json({ 
        error: 'You are not authorized to update this class',
        code: 'NOT_CLASS_ADMIN' 
      }, { status: 403 });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ 
        error: 'Name must be a non-empty string',
        code: 'INVALID_NAME' 
      }, { status: 400 });
    }

    if (description !== undefined && typeof description !== 'string') {
      return NextResponse.json({ 
        error: 'Description must be a string',
        code: 'INVALID_DESCRIPTION' 
      }, { status: 400 });
    }

    if (code !== undefined) {
      if (typeof code !== 'string' || code.length !== 6) {
        return NextResponse.json({ 
          error: 'Code must be exactly 6 characters',
          code: 'INVALID_CODE_LENGTH' 
        }, { status: 400 });
      }

      if (code !== existingClass[0].code) {
        const codeExists = await db.select()
          .from(classes)
          .where(eq(classes.code, code))
          .limit(1);

        if (codeExists.length > 0) {
          return NextResponse.json({ 
            error: 'Code already exists',
            code: 'CODE_NOT_UNIQUE' 
          }, { status: 400 });
        }
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description.trim() || null;
    }

    if (code !== undefined) {
      updates.code = code;
    }

    const updated = await db.update(classes)
      .set(updates)
      .where(eq(classes.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existingClass = await db.select()
      .from(classes)
      .where(eq(classes.id, parseInt(id)))
      .limit(1);

    if (existingClass.length === 0) {
      return NextResponse.json({ 
        error: 'Class not found',
        code: 'CLASS_NOT_FOUND' 
      }, { status: 404 });
    }

    if (existingClass[0].adminId !== parseInt(session.user.id)) {
      return NextResponse.json({ 
        error: 'You are not authorized to delete this class',
        code: 'NOT_CLASS_ADMIN' 
      }, { status: 403 });
    }

    const deleted = await db.delete(classes)
      .where(eq(classes.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Class deleted successfully',
      deleted: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}