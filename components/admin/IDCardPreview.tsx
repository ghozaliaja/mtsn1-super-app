'use client';

import React, { useEffect, useState } from 'react';
import { generateIDCard } from '../../utils/idCardGenerator';
import { Download } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    nisn: string | null;
    class: string;
}

interface IDCardPreviewProps {
    student: Student;
}

export default function IDCardPreview({ student }: IDCardPreviewProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;
        const generate = async () => {
            setLoading(true);
            try {
                // Use the front template
                const url = await generateIDCard(student, '/assets/idcard/front.png');
                if (active) setImageUrl(url);
            } catch (error) {
                console.error('Failed to generate ID card', error);
            } finally {
                if (active) setLoading(false);
            }
        };

        generate();
        return () => { active = false; };
    }, [student]);

    if (loading) return <div className="p-4 text-center">Generating Preview...</div>;
    if (!imageUrl) return <div className="p-4 text-center text-red-500">Failed to load preview</div>;

    return (
        <div className="flex flex-col items-center gap-4">
            <img src={imageUrl} alt={`ID Card ${student.name}`} className="w-full max-w-md shadow-lg rounded-lg" />
            <a
                href={imageUrl}
                download={`ID_Card_${student.name}.png`}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
                <Download size={18} /> Download PNG
            </a>
        </div>
    );
}
