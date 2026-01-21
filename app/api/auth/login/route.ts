
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ message: 'Username dan password wajib diisi' }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user || user.password !== password) {
            return NextResponse.json({ message: 'Username atau password salah' }, { status: 401 });
        }

        // Return user info (excluding password)
        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                assignedClass: user.assignedClass
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
