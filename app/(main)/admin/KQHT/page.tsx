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
  name: string;
  score: number;
  semester: string;
}

const AdminKQHT = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const { userId } = useAuth();

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/get-results`, {
        headers: {
          'user-id': userId as string,
        },
      });
      
      if (!response.ok)
        {
          throw new Error('Lỗi khi lấy dữ liệu');
        }
    
        const data = await response.json();
        console.log('Data from API:', data);
    
        if (!Array.isArray(data)) {
          throw new Error('Dữ liệu trả về không hợp lệ');
        }
    
        const formattedData: Subject[] = data.map((subject, index) => ({
          _id: subject._id,
          name: subject.name,
          score: subject.score,
          semester: subject.semester,
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
      fetchResults();
    }, [userId]);
  
    const handleEdit = (subject: Subject) => {
      if (subject._id) {
        setSelectedSubject(subject);
      } else {
        console.error('Invalid subject ID:', subject._id);
      }
    };
    
    
  
    const handleSaveEdit = async (updatedSubject: Subject) => {
      try {
        const res = await fetch(`/api/update-subject/${updatedSubject._id}`, {
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
    
        setSubjects(prevSubjects => prevSubjects.filter(subject => subject._id !== id));
    
        toast.success('Đã xóa môn học thành công');
      } catch (error) {
        console.error('Failed to delete subject:', error);
        toast.error('Lỗi khi xóa môn học');
      }
    };
    
    const EditSubjectPopup = ({ subject, onClose, onSave, title }: any) => {
      const [name, setName] = useState(subject.name);
      const [score, setScore] = useState(subject.score);
      const [semester, setSemester] = useState(subject.semester);
  
      const handleSave = () => {
        onSave({ ...subject,
          name,
          score,
          semester,
        });
        onClose();
      };
  
      return (
        <div className="edit-popup">
          <div className="edit-popup-content">
            <span className="close" onClick={onClose}>&times;</span>
            <h2>Chỉnh sửa môn học</h2>
            <label htmlFor="name">Tên môn học:</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
            <label htmlFor="score">Điểm:</label>
            <input type="number" id="score" value={score} onChange={(e) => setScore(Number(e.target.value))} />
            <label htmlFor="semester">Học kỳ:</label>
            <input type="text" id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
            <Button onClick={handleSave}>Lưu</Button>
          </div>
        </div>
      );
    };
  
    return (
      <div>
        <Header title={'Admin - quản lý kết quả học tập'} />
        <FeedWrapper>
          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <p>Có lỗi xảy ra: {error}</p>}
          {!loading && !error && (
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên môn học</th>
                  <th>Điểm</th>
                  <th>Học kỳ</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject._id}>
                    <td>{subject.STT}</td>
                    <td>{subject.name}</td>
                    <td>{subject.score}</td>
                    <td>{subject.semester}</td>
                    <td>
                      <Button onClick={() => handleEdit(subject)}>Sửa</Button>
                      <Button onClick={() => handleDelete(subject._id)}>Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  
  export default AdminKQHT;
  