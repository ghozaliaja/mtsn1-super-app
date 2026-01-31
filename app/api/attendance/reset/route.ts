import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        const now = new Date();
        // Match the logic in scan/route.ts to ensure we target the same records (UTC Date)
        const today = now.toISOString().split('T')[0];

        const deleted = await prisma.attendance.deleteMany({
            where: {
                date: today
            }
        });

        return NextResponse.json({
            message: 'Data absensi hari ini berhasil dihapus.',
            count: deleted.count
        });
    } catch (error) {
        console.error('Reset Error:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan sistem' }, { status: 500 });
    }
}
