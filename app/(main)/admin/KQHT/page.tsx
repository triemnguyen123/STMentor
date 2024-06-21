'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Header } from './header';
import { FeedWrapper } from '@/components/feed-wrapper';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button";

interface Subject {
  _id: string;
  STT: number;
  tenMonHoc: string;
  diem: number;
  hk: string;
}

const AdminKQHT = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>('');
  const { userId } = useAuth();

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/get-results`, {
        headers: {
          'user-id': selectedUserId as string,
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi lấy dữ liệu');
      }

      const data = await response.json();
      console.log('Data from API:', data);

      if (!Array.isArray(data)) {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }

      const formattedData: Subject[] = data.map((subject, index) => ({
        _id: subject._id.toString(),
        tenMonHoc: subject.tenMonHoc, 
        TC: subject.TC, 
        diem: subject.diem, 
        hk: subject.hk, 
        STT: index + 1,
      }));

      setSubjects(formattedData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchUsers();
  }, [userId]);

  useEffect(() => {
    if (selectedUserId) {
      fetchResults();
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
      toast.error('Lỗi khi tải danh sách người dùng');
    }
  };
  

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleSaveEdit = async (updatedSubject: Subject) => {
    try {
      const { _id, tenMonHoc, diem, hk } = updatedSubject;
  
      const validNameRegex = /^[\p{L}0-9\s]+$/u;  
      const validhkRegex = /^[\p{L}0-9\s]+$/u;  // Unicode, số và khoảng trắng
  
      if (!tenMonHoc || !validNameRegex.test(tenMonHoc.trim())) {
        toast.error('Tên môn học không hợp lệ. Vui lòng nhập lại.');
        return;
      }
      if (isNaN(diem) || diem < 0 || diem > 10) {
        toast.error('Điểm phải nằm trong khoảng từ 0 đến 10.');
        return;
      }
      if (!hk || !validhkRegex.test(hk.trim())) {
        toast.error('Học kỳ không hợp lệ. Vui lòng nhập lại.');
        return;
      }
  
      const updatedData = {
        name: tenMonHoc,
        diem,
        hk,
      };
  
      const res = await fetch(`/api/update-subject?id=${_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!res.ok) {
        throw new Error('Failed to update subject');
      }
  
      setSelectedSubject(null);
  
      setSubjects((prevSubjects) =>
        prevSubjects.map((subject) =>
          subject._id === _id ? { ...subject, ...updatedData } : subject
        )
      );
  
      toast.success('Đã cập nhật thông tin môn học thành công', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error('Failed to update subject:', error);
      toast.error('Lỗi khi cập nhật thông tin môn học');
    }
  };
  

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/delete-subject?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete subject: ${await res.text()}`);
      }

      setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject._id !== id));

      toast.success('Đã xóa môn học thành công');
    } catch (error) {
      console.error('Failed to delete subject:', error);
      toast.error('Lỗi khi xóa môn học');
    }
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newUserId = event.target.value;
    setSelectedUserId(newUserId);
  };

  const groupedSubjects = Object.entries(
    subjects.reduce((groups, subject) => {
      const hk = subject.hk;
      if (!groups[hk]) {
        groups[hk] = [];
      }
      groups[hk].push(subject);
      return groups;
    }, {} as { [key: string]: Subject[] })
  )
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })) // Sắp xếp các học kỳ theo thứ tự tự nhiên
    .map(([hk, subjects]) => ({
      hk,
      subjects: subjects.map((subject, index) => ({
        ...subject,
        STT: index + 1,
      })),
    }));

  return (
    <div className="min-h-screen">
      <Header title={'Admin - Quản lý kết quả học tập'} />
      <FeedWrapper>
        <div className="user-select-container mb-4 px-4">
          <label htmlFor="user-select" className="block text-gray-700 mb-2">Chọn Users:</label>
          <select
            id="user-select"
            value={selectedUserId ?? ''}
            onChange={handleUserChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Chọn một người dùng...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
            ))}
          </select>
        </div>

        {loading && <p className="text-center text-gray-500">Đang tải dữ liệu...</p>}
        {error && <p className="text-center text-red-500">Có lỗi xảy ra: {error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto px-4">
            {groupedSubjects.map(({ hk, subjects }) => (
              <div key={hk} className="mb-8">
                <h2 className="text-xl font-bold mb-4">Học kỳ: {hk}</h2>
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="border border-gray-300 py-2 px-4">STT</th>
                      <th className="border border-gray-300 py-2 px-4">Tên môn học</th>
                      <th className="border border-gray-300 py-2 px-4">Điểm</th>
                      <th className="border border-gray-300 py-2 px-4">Lựa chọn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject._id} className={`border-t ${subject.STT % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="border border-gray-300 py-2 px-4 text-center">{subject.STT}</td>
                        <td className="border border-gray-300 py-2 px-4 text-center">{subject.tenMonHoc}</td>
                        <td className="border border-gray-300 py-2 px-4 text-center">{subject.diem}</td>
                        <td className="border border-gray-300 py-2 px-4 text-center">
                          <Button onClick={() => handleEdit(subject)} className="bg-yellow-500 text-white hover:bg-yellow-700 mr-2">Sửa</Button>
                          <Button onClick={() => handleDelete(subject._id)} className="bg-red-500 text-white hover:bg-red-700">Xóa</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
        {selectedSubject && (
          <EditSubjectPopup
            subject={selectedSubject}
            onClose={() => setSelectedSubject(null)}
            onSave={handleSaveEdit}
          />
        )}
      </FeedWrapper>
      <ToastContainer />
    </div>
  );
};

interface EditSubjectPopupProps {
  subject: Subject;
  onClose: () => void;
  onSave: (updatedSubject: Subject) => void;
}

const EditSubjectPopup: React.FC<EditSubjectPopupProps> = ({ subject, onClose, onSave }) => {
  const [tenMonHoc, setName] = useState(subject.tenMonHoc);
  const [diem, setdiem] = useState(subject.diem);
  const [hk, sethk] = useState(subject.hk);

  const handleSave = () => {
    onSave({ ...subject, tenMonHoc, diem, hk });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4">Sửa thông tin môn học</h3>
        <div className="mb-4">
          <label className="block mb-1">Tên môn học</label>
          <input type="text" value={tenMonHoc} onChange={(e) => setName(e.target.value)} className="w-full border px-2 py-1" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Điểm</label>
          <input type="number" value={diem} onChange={(e) => setdiem(parseFloat(e.target.value))} className="w-full border px-2 py-1" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Học kỳ</label>
          <input type="text" value={hk} onChange={(e) => sethk(e.target.value)} className="w-full border px-2 py-1" />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="mr-2 bg-blue-500 text-white hover:bg-blue-700">Lưu</Button>
          <Button onClick={onClose} className="bg-red-500 text-white hover:bg-red-700">Đóng</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminKQHT;
