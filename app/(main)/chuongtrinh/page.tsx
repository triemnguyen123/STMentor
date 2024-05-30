'use client';

import { Header } from "./header";
import { FeedWrapper } from "@/components/feed-wrapper";
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

const ChuongTrinh = () => {
    const { user } = useUser();
    const [programs, setPrograms] = useState<any[]>([]);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (user) {
            const fetchPrograms = async () => {
                try {
                    const res = await fetch('/api/programs');
                    if (!res.ok) {
                        throw new Error('Failed to fetch programs');
                    }
                    const data = await res.json();
                    const programsWithNATitle = data.map((program: any) => ({
                        ...program,
                        TenHocPhan: program['Tên học phần '] || 'N/A'
                    }));
                    setPrograms(programsWithNATitle);
                } catch (error) {
                    console.error('Failed to fetch programs:', error);
                }
            };

            const loadCheckboxes = async () => {
                try {
                    const res = await fetch('/api/load-checkboxes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ userId: user.id })
                    });
                    if (!res.ok) {
                        throw new Error('Failed to load checkboxes');
                    }
                    const data = await res.json();
                    setCheckedItems(data);
                } catch (error) {
                    console.error('Failed to load checkboxes:', error);
                }
            };

            fetchPrograms();
            loadCheckboxes();
        }
    }, [user]);

    const handleCheckboxChange = async (id: string) => {
        const newCheckedItems = {
            ...checkedItems,
            [id]: !checkedItems[id]
        };
        setCheckedItems(newCheckedItems);

        try {
            const res = await fetch('/api/save-checkboxes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user?.id, checkedItems: newCheckedItems })
            });
            if (!res.ok) {
                throw new Error('Failed to save checkboxes');
            }
        } catch (error) {
            console.error('Failed to save checkboxes:', error);
        }
    };

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <FeedWrapper>
                <Header title="Chương Trình Đào Tạo" />
                {programs.length === 0 ? (
                    <p>Không có dữ liệu</p>
                ) : (
                    <table className="min-w-full border-collapse border border-gray-200">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">Mã học phần</th>
                                <th className="border border-gray-300 px-4 py-2">Tên học phần</th>
                                <th className="border border-gray-300 px-4 py-2">Số tín chỉ</th>
                                <th className="border border-gray-300 px-4 py-2">Chọn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programs.map((program) => (
                                <tr key={program._id} style={{ backgroundColor: checkedItems[program._id] ? 'lightgreen' : 'inherit' }}>
                                    <td className="border border-gray-300 px-4 py-2">{program['Mã học phần']}</td>
                                    <td className="border border-gray-300 px-4 py-2">{program.TenHocPhan}</td>
                                    <td className="border border-gray-300 px-4 py-2">{program.TC !== undefined ? program.TC : 'N/A'}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={checkedItems[program._id] || false}
                                            onChange={() => handleCheckboxChange(program._id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </FeedWrapper>
        </div>
    );
};

export default ChuongTrinh;
