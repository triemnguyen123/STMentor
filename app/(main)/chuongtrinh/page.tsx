'use client';

import { Header } from "./header";
import { FeedWrapper } from "@/components/feed-wrapper";
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

const ChuongTrinh = () => {
    const { user } = useUser();
    const [programs, setPrograms] = useState<any[]>([]);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');

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
            const fetchCourses = async () => {
                try {
                    const res = await fetch('/api/courses');
                    if (!res.ok) {
                        throw new Error('Failed to fetch courses');
                    }
                    const data = await res.json();
                    setCourses(data);
                } catch (error) {
                    console.error('Failed to fetch courses:', error);
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
    
    const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCourse(event.target.value);
        // Fetch or filter programs based on the selected course if needed
    };

    return (
        <div className="flex flex-row-reverse gap-12 px-6">
            <FeedWrapper>
                <Header title="Chương Trình Đào Tạo" />
                <div className="mb-4 flex justify-between items-center">
                    <select
                        value={selectedCourse}
                        onChange={handleCourseChange}
                        className="form-select mt-1 block w-full max-w-xs px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Chọn Khóa</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                </div>
                {programs.length === 0 ? (
                    <p className="text-center text-red-600">Không có dữ liệu</p>
                ) : (
                    <table className="min-w-full table-auto border-collapse border border-gray-300 shadow-lg">
                        <thead className="bg-gray-200 text-white ">
                            <tr>
                                <th className="border bg-indigo-600 px-4 py-2 text-left">Mã học phần</th>
                                <th className="border bg-indigo-600 px-4 py-2 text-left">Tên học phần</th>
                                <th className="border bg-indigo-600 px-4 py-2 text-left">Số tín chỉ</th>
                                <th className="border bg-indigo-600 px-4 py-2 text-center">Chọn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programs.map((program) => (
                                <tr key={program._id} className={`hover:bg-gray-100 ${checkedItems[program._id] ? 'bg-green-100' : ''}`}>
                                    <td className="border border-gray-300 px-4 py-2">{program['Mã học phần']}</td>
                                    <td className="border border-gray-300 px-4 py-2">{program.TenHocPhan}</td>
                                    <td className="border border-gray-300 px-4 py-2">{program.TC !== undefined ? program.TC : 'N/A'}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={checkedItems[program._id] || false}
                                            onChange={() => handleCheckboxChange(program._id)}
                                            className="form-checkbox h-5 w-5 text-green-600"
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
