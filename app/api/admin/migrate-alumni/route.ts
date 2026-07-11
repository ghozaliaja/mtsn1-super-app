import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// One-time migration endpoint:
// 1. Adds graduationYear column via raw SQL (if not exists)
// 2. Backfills existing ALUMNI students with year 2026

export async function POST() {
    try {
        // Step 1: Add column if not exists (safe to run multiple times)
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "graduationYear" INTEGER;
        `);

        // Step 2: Backfill existing ALUMNI students with year 2026
        const result = await prisma.$executeRaw`
            UPDATE "Student" SET "graduationYear" = 2026
            WHERE class = 'ALUMNI' AND "graduationYear" IS NULL;
        `;

        return NextResponse.json({
            success: true,
            message: `Migration complete. ${result} existing ALUMNI students backfilled with year 2026.`,
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
