import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    // Read from the project's internal cv-files directory
    const filePath = path.join(process.cwd(), 'cv-files', 'cv_es.html');

    try {
        const fileBuffer = fs.readFileSync(filePath);
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'CV file not found', details: String(error) },
            { status: 404 }
        );
    }
}
