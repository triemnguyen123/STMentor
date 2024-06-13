'use client';

import { Header } from "./header";
import { FeedWrapper } from "@/components/feed-wrapper";
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button"; 


const adminCTDT = () => {
    const { user } = useUser();
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [programs, setPrograms] = useState<any[]>([]);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [formData, setFormData] = useState({ ma: '', ten: '', soTinChi: '' });
    const [editFormData, setEditFormData] = useState({ id: '', ma: '', ten: '', soTinChi: '' });

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
        console.log("New value of formData.soTinChi:", value); // Kiểm tra giá trị mới của formData.soTinChi
        setFormData({ ...formData, [name]: value });
    };
    

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value }); // Kiểm tra xem editFormData có được cập nhật đúng không
    };
    
    

    const validateInput = () => {
        const specialCharPattern = /[~!@#%^&*_+={}|[\]\\:";'<>?,./]/;
        if (specialCharPattern.test(formData.ma) || specialCharPattern.test(formData.ten)) {
            alert("Mã học phần và Tên học phần không được chứa ký tự đặc biệt.");
            return false;
        }
    
        const soTinChi = parseInt(formData.soTinChi, 10);
        if (!formData.soTinChi || isNaN(soTinChi) || soTinChi > 10 || soTinChi <= 0) {
            alert("Số tín chỉ không phù hợp, vui lòng nhập lại!");
            return false;
        }
    
        return true;
    };
    
    const validateInputEdit = () => {
        const specialCharPattern = /[~!@#%^&*_+={}|[\]\\:";'<>?,./]/;
        if (specialCharPattern.test(editFormData.ma) || specialCharPattern.test(editFormData.ten)) {
            alert("Mã học phần và Tên học phần không được chứa ký tự đặc biệt.");
            return false;
        }
    
        const soTinChi = parseInt(editFormData.soTinChi, 10);
        if (!editFormData.soTinChi || isNaN(soTinChi) || soTinChi > 10 || soTinChi <= 0) {
            alert("Số tín chỉ không phù hợp, vui lòng nhập lại!");
            return false;
        }
    
        return true;
    };
    
    
    

    const handleAddProgram = async () => {
        if (!selectedUserId) {
            alert("Vui lòng chọn User trước khi thêm môn học.");
            return;
        }

        if (!validateInput()) {
            return;
        }

        const { ma, ten, soTinChi } = formData;

        // Kiểm tra nếu đã tồn tại mã học phần hoặc tên học phần
        const existingProgram = programs.find(program => program['Mã học phần'] === ma || program['Tên học phần '] === ten);
        if (existingProgram) {
            alert('Mã học phần hoặc tên học phần đã tồn tại. Vui lòng nhập thông tin khác.');
            return;
        }
    
        const newProgram = {
            'Mã học phần': ma,
            'Tên học phần ': ten,
            TC: soTinChi,
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

            // Hiển thị thông báo
            toast.success('Bạn đã thêm môn học thành công', {
                position: "top-right",
                autoClose: 1000, 
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
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

    const handleEditProgram = async () => {
        if (!validateInputEdit()) {
            return;
        }
    
        const { id, ma, ten, soTinChi } = editFormData;
    
        const updatedProgram = {
            'Mã học phần': ma,
            'Tên học phần ': ten,
            TC: soTinChi
        };
    
        try {
            const res = await fetch('/api/update-program', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, updatedProgram })
            });
    
            if (!res.ok) {
                throw new Error('Failed to update program');
            }
    
            // Refresh the programs list
            await fetchPrograms(selectedUserId);
            setIsEditPopupOpen(false);
    
            // Hiển thị thông báo
            toast.success('Bạn đã cập nhật môn học thành công.', {
                position: "top-right",
                autoClose: 1000, 
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to delete program:', error);
                alert('Failed to delete program: ' + error.message);
            } else {
                console.error('Failed to delete program:', error);
                alert('Failed to delete program: ' + error);
            }
        }
    };
    
    

    const handleDeleteProgram = async (id: string) => {
        try {
            const res = await fetch('/api/delete-program', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            if (!res.ok) {
                throw new Error('Failed to delete program');
            }

            // Refresh the programs list
            await fetchPrograms(selectedUserId);

            // Hiển thị thông báo
            toast.success('Bạn đã xóa môn học thành công.', {
                position: "top-right",
                autoClose: 1000, 
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to delete program:', error);
                alert('Failed to delete program: ' + error.message);
            } else {
                console.error('Failed to delete program:', error);
                alert('Failed to delete program: ' + error);
            }
        }
    };

    const openEditPopup = (program: any) => {
        setEditFormData({
            id: program._id,
            ma: program['Mã học phần'],
            ten: program['Tên học phần '],
            soTinChi: program.TC
        });
        setIsEditPopupOpen(true);
    };

    return (
        <div className="flex flex-row-reverse gap-12 px-6">
          <FeedWrapper>
            <Header title="Admin - Quản lý Chương Trình Đào Tạo" />
            <div className="admin-container">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
              <div className="mb-4">
                <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">Chọn Users:</label>
                <select
                  id="user-select"
                  value={selectedUserId}
                  onChange={handleUserChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                >
                  <option value="">Chọn một người dùng...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <Button
                  onClick={() => setIsPopupOpen(true)}
                  variant="default"
                  className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full"
                >
                  Thêm Môn Học
                </Button>
              </div>
              {programs.length === 0 ? (
                <p className=" text-red-500 mt-4">Không có dữ liệu</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-indigo-600 text-white">
                      <tr>
                        <th className="border border-gray-300 py-2 px-4">Mã học phần</th>
                        <th className="border border-gray-300 py-2 px-4">Tên học phần</th>
                        <th className="border border-gray-300 py-2 px-4">Số tín chỉ</th>
                        <th className="border border-gray-300 py-2 px-4">Chọn</th>
                        <th className="border border-gray-300 py-2 px-4">Lựa chọn</th>
                      </tr>
                    </thead>
                    <tbody >
                      {programs.map((program) => (
                        <tr 
                          key={program._id}
                          //className={checkedItems[program._id] ? 'bg-green-100' : ''  }
                          className={`border-t ${checkedItems[program._id] ? 'bg-green-100' : ''} ${program.isNew ? 'bg-gray-50' : 'bg-white'}`}
                          style={{ fontWeight: program.isNew ? 'bold' : 'normal' }}
                        >
                          <td className="border border-gray-300 px-4 py-2 ">{program['Mã học phần']}</td>
                          <td className="border border-gray-300 px-4 py-2">{program['Tên học phần ']}</td>
                          <td className="border border-gray-300 px-4 py-2">{program.TC !== undefined ? program.TC : 'N/A'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={checkedItems[program._id] || false}
                              onChange={() => handleCheckboxChange(program._id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Button
                              onClick={() => openEditPopup(program)}
                              variant="default"
                              className="py-1 px-2 bg-yellow-500 text-white hover:bg-yellow-700 mr-2"
                            >
                              Sửa
                            </Button>
                            <Button
                              onClick={() => handleDeleteProgram(program._id)}
                              variant="default"
                              className="py-1 px-2 bg-red-500 text-white hover:bg-red-700"
                            >
                              Xóa
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {isPopupOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-md shadow-md w-96">
                  <h2 className="text-xl font-semibold mb-4">Thêm Môn Học</h2>
                  <div className="mb-4">
                    <label htmlFor="ma" className="block text-sm font-medium text-gray-700">Mã học phần</label>
                    <input
                      type="text"
                      name="ma"
                      value={formData.ma}
                      onChange={handleInputChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="ten" className="block text-sm font-medium text-gray-700">Tên học phần</label>
                    <input
                      type="text"
                      name="ten"
                      value={formData.ten}
                      onChange={handleInputChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="soTinChi" className="block text-sm font-medium text-gray-700">Số tín chỉ</label>
                    <input
                      type="text"
                      name="soTinChi"
                      value={formData.soTinChi}
                      onChange={handleInputChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddProgram}
                      variant="default"
                      className="font-bold py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded-full"
                    >
                      Thêm
                    </Button>
                    <Button
                      onClick={() => setIsPopupOpen(false)}
                      variant="ghost"
                      className="font-bold py-2 px-4 rounded-full ml-2"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {isEditPopupOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-md shadow-md w-96">
                  <h2 className="text-xl font-semibold mb-4">Sửa Môn Học</h2>
                  <div className="mb-4">
                    <label htmlFor="ma" className="block text-sm font-medium text-gray-700">Mã học phần</label>
                    <input
                      type="text"
                      name="ma"
                      value={editFormData.ma}
                      onChange={handleEditInputChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="ten" className="block text-sm font-medium text-gray-700">Tên học phần</label>
                    <input
                      type="text"
                      name="ten"
                      value={editFormData.ten}
                      onChange={handleEditInputChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="soTinChi" className="block text-sm font-medium text-gray-700">Số tín chỉ</label>
                    <input
                      type="text"
                      name="soTinChi"
                      value={editFormData.soTinChi}
                      onChange={handleEditInputChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleEditProgram}
                      variant="default"
                      className="font-bold py-2 px-4 bg-yellow-500 hover:bg-yellow-700 text-white rounded-full"
                    >
                      Cập nhật
                    </Button>
                    <Button
                      onClick={() => setIsEditPopupOpen(false)}
                      variant="ghost"
                      className="font-bold py-2 px-4 rounded-full ml-2"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </FeedWrapper>
          <ToastContainer />
        </div>
      );
    };
    
export default adminCTDT;