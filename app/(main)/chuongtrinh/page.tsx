'use client';

import { Header } from "./header";
import { FeedWrapper } from "@/components/feed-wrapper";
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ChuongTrinh = () => {
    const { user } = useUser();
    const [programs, setPrograms] = useState<any[]>([]);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
    const [courses, setCourses] = useState<string[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchCourses = async () => {
                try {
                    const res = await fetch('/api/programs');
                    if (!res.ok) {
                        throw new Error('Failed to fetch programs');
                    }
                    const data = await res.json();
                    console.log('Programs from API:', data);

                   
                    const uniqueCourses = Array.from(new Set(data.map((program: any) => program.khoa))) as string[];
                    console.log('Unique courses:', uniqueCourses);

                    setCourses(uniqueCourses);
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

            fetchCourses();
            loadCheckboxes();
        }
    }, [user]);

    useEffect(() => {
        const fetchFilteredPrograms = async () => {
            if (selectedCourse) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/programs?course=${selectedCourse}`);
                    if (!res.ok) {
                        throw new Error('Failed to fetch filtered programs');
                    }
                    const data = await res.json();
                    console.log('Filtered programs:', data);

                    const programsWithNATitle = data.map((program: any) => ({
                        ...program,
                        TenHocPhan: program['Tên học phần '] || 'N/A'
                    }));

                    programsWithNATitle.sort((a: Record<string, any>, b: Record<string, any>) => a['Mã học phần'].localeCompare(b['Mã học phần']));

                    setPrograms(programsWithNATitle);
                } catch (error) {
                    console.error('Failed to fetch filtered programs:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setPrograms([]);
            }
        };

        fetchFilteredPrograms();
    }, [selectedCourse]);

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
    };

    if (loading) return <LoadingSpinner />;

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
                        {courses.map((course, index) => (
                            <option key={index} value={course}>{course}</option>
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
