'use client';
import { Header } from "./header";
import { FeedWrapper } from "@/components/feed-wrapper";
import { useEffect, useState } from 'react';
// import clientPromise from '@/lib/mongodb';

const ChuongTrinh = () => {
    const [programs, setPrograms] = useState<any[]>([]);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const res = await fetch('/api/programs');
                const data = await res.json();
                setPrograms(data);
            } catch (error) {
                console.error('Failed to fetch programs:', error);
            }
        };

        fetchPrograms();
    }, []);

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <FeedWrapper>
                <Header title="Chương Trình Đào Tạo" />
                {programs.map((program) => (
                    <div key={program._id} className="mb-10">
                        <h2 className="text-xl font-bold mb-4">{program.name} - Tổng số tín chỉ: {program.totalCredits}</h2>
                        {Object.entries(program.details).map(([category, subjects]) => (
                            <div key={category} className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">{category}</h3>
                                {Array.isArray(subjects) && (
                                    <table className="min-w-full border-collapse border border-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 px-4 py-2">Tên môn học</th>
                                                <th className="border border-gray-300 px-4 py-2">Số tín chỉ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjects.map((subject, index) => (
                                                <tr key={index}>
                                                    <td className="border border-gray-300 px-4 py-2">{subject.name}</td>
                                                    <td className="border border-gray-300 px-4 py-2">{subject.credits}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </FeedWrapper>
        </div>
    );
};

export default ChuongTrinh;
