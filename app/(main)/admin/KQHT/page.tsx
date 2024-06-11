'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Header } from './header';
import { FeedWrapper } from '@/components/feed-wrapper';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button"; 

const exists = (value: any) => value !== null && value !== undefined;

interface Subject {
  STT: number;
  id: string;
  _id: string; // Thêm thuộc tính _id vào interface
  name: string;
  score: number;
  semester: string;
}

interface GroupedResults {
  [semester: string]: Subject[];
}

const AdminKQHT = () => {
  const [groupedResults, setGroupedResults] = useState<GroupedResults>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const { userId } = useAuth();

  const fetchResults = async () => {
    setLoading(true);
    setGroupedResults({});
    try {
      const response = await fetch('/api/get-results', {
        headers: {
          'user-id': userId as string,
        },
      });
      if (!response.ok) {
        throw new Error('Lỗi khi lấy dữ liệu');
      }
      const data = await response.json();
      console.log('Data from API:', data);
      setGroupedResults(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (!userId) return;
    fetchResults();
  }, [userId]);

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleSaveEdit = async (updatedSubject: Subject) => {
    try {
      const res = await fetch(`/api/update-subject/${updatedSubject.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSubject),
      });
      if (!res.ok) {
        throw new Error('Failed to update subject');
      }
      fetchResults();
      toast.success('Đã cập nhật thông tin môn học thành công');
    } catch (error) {
      console.error('Failed to update subject:', error);
      toast.error('Lỗi khi cập nhật thông tin môn học');
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error('Missing subject ID');
      toast.error('Missing subject ID');
      return;
    }
  
    try {
      const res = await fetch(`/api/delete-subject?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(`Failed to delete subject: ${await res.text()}`);
      }
      // Tạo một bản sao mới của state groupedResults và cập nhật nó
      setGroupedResults(prevState => {
        const newState = { ...prevState };
        // Xóa môn học khỏi newState dựa trên id
        Object.keys(newState).forEach(semester => {
          newState[semester] = newState[semester].filter(subject => subject._id !== id);
        });
        return newState;
      });
      toast.success('Đã xóa môn học thành công');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to delete subject:', error.message);
        toast.error('Lỗi khi xóa môn học');
      } else {
        console.error('Failed to delete subject:', error);
        toast.error('Lỗi khi xóa môn học');
      }
    }
  };
  
  
  const EditSubjectPopup = ({ subject, onClose, onSave }: any) => {
    const [name, setName] = useState(subject.name);
    const [score, setScore] = useState(subject.score);
    const [semester, setSemester] = useState(subject.semester);
    const [validationErrors, setValidationErrors] = useState<any>({});

    const validateForm = () => {
      const errors: any = {};

      // Validate name and semester to not contain special characters
      const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/g;
      if (specialCharPattern.test(name)) {
        errors.name = 'Tên môn học không được chứa ký tự đặc biệt';
      }
      if (specialCharPattern.test(semester)) {
        errors.semester = 'Học kỳ không được chứa ký tự đặc biệt';
      }

      // Validate score to be between 0 and 10
      if (score < 0 || score > 10) {
        errors.score = 'Điểm phải từ 0 đến 10';
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
      if (validateForm()) {
        onSave({ ...subject, name, score, semester });
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-lg w-96">
          <h3 className="text-lg font-bold mb-4">Sửa thông tin môn học</h3>
          <div className="mb-4">
            <label className="block mb-1">Tên môn học</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-2 py-1" />
            {validationErrors.name && <span className="text-red-500 text-sm">{validationErrors.name}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1">Điểm</label>
            <input type="number" value={score} onChange={(e) => setScore(parseFloat(e.target.value))} className="w-full border px-2 py-1" />
            {validationErrors.score && <span className="text-red-500 text-sm">{validationErrors.score}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1">Học kỳ</label>
            <input type="text" value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full border px-2 py-1" />
            {validationErrors.semester && <span className="text-red-500 text-sm">{validationErrors.semester}</span>}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} className="mr-2">Lưu</Button>
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Kết Quả" />
        <div className="mb-10">
          {Object.keys(groupedResults).length === 0 ? (
            <p>Không có dữ liệu</p>
          ) : (
            Object.keys(groupedResults).map((semester, index) => (
              <div key={index}>
                <h3 className="font-bold text-lg mt-4 mb-2">
                  Học kỳ: {semester}
                </h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên môn học
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điểm
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Học kỳ
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupedResults[semester].map((subject, subjectIndex) => (
                      <tr key={subjectIndex}>
                        <td className="px-6 py-4 whitespace-nowrap">{subject.STT}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{subject.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{subject.score !== undefined ? subject.score : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{exists(subject.semester) ? subject.semester : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button variant="primary" size="sm" onClick={() => handleEdit(subject)}>Sửa</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(subject._id)}>Xóa</Button>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </FeedWrapper>
      {selectedSubject && (
        <EditSubjectPopup 
          subject={selectedSubject} 
          onClose={() => setSelectedSubject(null)}
          onSave={handleSaveEdit}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default AdminKQHT;
