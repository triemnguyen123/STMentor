'use client';

import { Header } from "./header";
import { FeedWrapper } from "@/components/feed-wrapper";
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

const Admin = () => {
    const { user } = useUser();
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [programs, setPrograms] = useState<any[]>([]);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({ ma: '', ten: '', soTinChi: '' });

    useEffect(() => {
        if (user) {
            fetchUsers();
        }
    }, [user]);

    useEffect(() => {
        if (selectedUserId) {
            fetchPrograms(selectedUserId);
            loadCheckboxes(selectedUserId);
        }
    }, [selectedUserId]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (!res.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchPrograms = async (userId: string) => {
        try {
            const res = await fetch(`/api/programs?userId=${userId}`);
            if (!res.ok) {
                throw new Error('Failed to fetch programs');
            }
            const data = await res.json();
    
            // Sắp xếp dữ liệu mới theo tiêu chí nào đó, chẳng hạn theo 'Mã học phần'
            data.sort((a: Record<string, any>, b: Record<string, any>) => a['Mã học phần'].localeCompare(b['Mã học phần']));
    
            setPrograms(data);
        } catch (error: any) {
            console.error('Failed to fetch programs:', error);
            alert('Failed to fetch programs: ' + error.message);
        }
    };

    const loadCheckboxes = async (userId: string) => {
        try {
            const res = await fetch('/api/load-checkboxes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });
            if (!res.ok) {
                throw new Error('Failed to load checkboxes');
            }
            const data = await res.json();
            setCheckedItems(data);
        } catch (error: any) {
            console.error('Failed to load checkboxes:', error);
            alert('Failed to load checkboxes: ' + error.message);
        }
    };

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
                body: JSON.stringify({ userId: selectedUserId, checkedItems: newCheckedItems })
            });
            if (!res.ok) {
                throw new Error('Failed to save checkboxes');
            }
        } catch (error) {
            console.error('Failed to save checkboxes:', error);
        }
    };

    const handleUserChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
        await fetchPrograms(userId);
        await loadCheckboxes(userId);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddProgram = async () => {
        if (!selectedUserId) {
            alert("Please select a user first.");
            return;
        }
    
        const newProgram = {
            'Mã học phần': formData.ma,
            'Tên học phần ': formData.ten,
            TC: formData.soTinChi,
            isNew: true // Thêm thuộc tính isNew
        };
    
        try {
            const res = await fetch('/api/add-program', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ program: newProgram })
            });
    
            if (!res.ok) {
                throw new Error('Failed to add program');
            }
    
            // Refresh the programs list
            await fetchPrograms(selectedUserId);
            setIsPopupOpen(false);
            setFormData({ ma: '', ten: '', soTinChi: '' }); // Clear the form
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to add program:', error);
                alert('Failed to add program: ' + error.message);
            } else {
                console.error('Failed to add program:', error);
                alert('Failed to add program: ' + error);
            }
        }
    };
    

    return (
        <div className="flex flex-row-reverse gap-12 px-6">
            <FeedWrapper>
                <Header title="Admin - Quản lý Chương Trình Đào Tạo" />
                <div className="admin-container">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
                    <div className="mb-4">
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">Select User:</label>
                        <select id="user-select" value={selectedUserId} onChange={handleUserChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md">
                        <option value="">Select a user</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={() => setIsPopupOpen(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Thêm Môn Học</button>
                    {programs.length === 0 ? (
                        <p className="text-gray-600">No data available</p>
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
                                    <tr key={program._id} style={{ backgroundColor: checkedItems[program._id] ? 'lightgreen' : 'inherit', fontWeight: program.isNew ? 'bold' : 'normal' }}>
                                        <td className="border border-gray-300 px-4 py-2">{program['Mã học phần']}</td>
                                        <td className="border border-gray-300 px-4 py-2">{program['Tên học phần ']}</td>
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
                </div>
                {isPopupOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-md shadow-md w-96">
                            <h2 className="text-xl font-semibold mb-4">Thêm Môn Học</h2>
                            <div className="mb-4">
                                <label htmlFor="ma" className="block text-sm font-medium text-gray-700">Mã học phần</label>
                                <input type="text" name="ma" value={formData.ma} onChange={handleInputChange} className="block w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="ten" className="block text-sm font-medium text-gray-700">Tên học phần</label>
                                <input type="text" name="ten" value={formData.ten} onChange={handleInputChange} className="block w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="soTinChi" className="block text-sm font-medium text-gray-700">Số tín chỉ</label>
                                <input type="text" name="soTinChi" value={formData.soTinChi} onChange={handleInputChange} className="block w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="flex justify-end">
                                <button onClick={handleAddProgram} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Thêm</button>
                                <button onClick={() => setIsPopupOpen(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2">Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </FeedWrapper>
        </div>
    );
};

export default Admin;
