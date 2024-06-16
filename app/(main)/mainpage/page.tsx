'use client';
import { useState, useEffect } from 'react';
import { FeedWrapper } from '@/components/feed-wrapper';
import ErrorModal from './ErrorModal';
import { Header } from './header';
import { useAuth } from '@clerk/clerk-react';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button"; 
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const MainPage = () => {
  const { userId } = useAuth();
  const [subjects, setSubjects] = useState<{ name: string; credits: number; score: number; semester: string; userId: string | null; isChanged: boolean; _id: string; category: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Add CSS styles directly
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = `
        .custom-tbody {
          font-size: 1rem; /* Adjust this value as needed */
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/Subjects-data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const initialSubjects = data.map((subject: { _id: any; name: string; credits: number; category: string }) => ({
          name: subject.name,
          credits: subject.credits,
          score: 0,
          semester: 'HK1',
          _id: subject._id,
          userId: userId || null,
          isChanged: false,
          category: subject.category,
        }));
        setSubjects(initialSubjects);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const changedSubjects = subjects.filter(subject => subject.isChanged);

    const data = changedSubjects.map(subject => ({
      name: subject.name,
      credits: subject.credits,
      score: subject.score,
      semester: subject.semester,
      userId: userId || null,
    }));

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId || '',
        },
        body: JSON.stringify({ data }),
      });

      if (response.ok) {
        toast.success('Dữ liệu đã được gửi thành công');
        setSubjects(subjects.map(subject => ({ ...subject, score: 0, isChanged: false }))); // Reset data
      } else {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        setError(errorData.message || 'Có lỗi xảy ra khi gửi dữ liệu');
      }
    } catch (err) {
      let errorMessage = 'Có lỗi xảy ra khi gửi dữ liệu';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      console.error('Có lỗi xảy ra khi gửi dữ liệu:', err);
      setError(errorMessage);
    }
  };

  const handleInputChange = (name: string, value: string | number, index: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { ...subjects[index], [name]: value, isChanged: true };
    setSubjects(updatedSubjects);
  };

  const handleSemesterChange = (semester: string, index: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { ...subjects[index], semester, isChanged: true };
    setSubjects(updatedSubjects);
  };

  const groupedSubjects = subjects.reduce((acc, subject) => {
    if (!acc[subject.category]) {
      acc[subject.category] = [];
    }
    acc[subject.category].push(subject);
    return acc;
  }, {} as { [key: string]: typeof subjects });

  return (
    <div className="relative flex flex-col px-6">
      {loading && <LoadingSpinner />}
      <FeedWrapper>
        <Header title="Hệ Khuyến Nghị" />
        <div className="overflow-x-auto">
          <form onSubmit={handleSubmit}>
            {Object.keys(groupedSubjects).map(category => (
              <div key={category} className="mb-6">
                <h2 className="text-xl font-bold mb-4">{category}</h2>
                <table className="min-w-full bg-white shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-indigo-600 text-gray-100 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">STT</th>
                      <th className="py-3 px-6 text-left">Tên môn học</th>
                      <th className="py-3 px-6 text-left">Số tín chỉ</th>
                      <th className="py-3 px-6 text-left">Điểm</th>
                      <th className="py-3 px-6 text-left">Học kỳ</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm font-light custom-tbody">
                    {groupedSubjects[category].map((subject, index) => (
                      <tr key={subject._id} className="border-b border-gray-100 hover:bg-gray-100">
                        <td className="py-3 px-6 text-left whitespace-nowrap">{index + 1}</td>
                        <td className="py-3 px-6 text-left">
                          <span>{subject.name}</span>
                        </td>
                        <td className="py-3 px-6 text-left">
                          <span>{subject.credits}</span>
                        </td>
                        <td className="py-3 px-6 text-left">
                          <input
                            type="number"
                            placeholder="Điểm"
                            min="0"
                            max="10"
                            className="border p-2 rounded-md w-full"
                            value={subject.score}
                            onChange={(e) => handleInputChange('score', parseFloat(e.target.value), subjects.indexOf(subject))}
                          />
                        </td>
                        <td className="py-3 px-6 text-left">
                          <select
                            value={subject.semester}
                            onChange={(e) => handleSemesterChange(e.target.value, subjects.indexOf(subject))}
                            className="border p-2 rounded-md w-full"
                          >
                            <option value="HK1">HK1</option>
                            <option value="HK2">HK2</option>
                            <option value="HK3">HK3</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <div className="flex justify-center mt-10">
              <Button type="submit" variant="default" className="py-1 px-2 bg-blue-500 text-white hover:bg-yellow-700 mr-2">Submit</Button>
            </div>
          </form>
        </div>
      </FeedWrapper>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      <ToastContainer position="top-right" autoClose={1000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
    </div>
  );
};

export default MainPage;
