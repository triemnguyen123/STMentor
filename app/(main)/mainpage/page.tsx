'use client';
import { useState, useEffect } from 'react';
import { FeedWrapper } from '@/components/feed-wrapper';
import ErrorModal from './ErrorModal';
import { Header } from './header';
import { useAuth } from '@clerk/clerk-react';
import React from 'react';

const MainPage = () => {
  const { userId } = useAuth();
  const [subjects, setSubjects] = useState<{ name: string; credits: number; score: number; semester: string; userId: string | null; isChanged: boolean; _id: string; }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/Subjects-data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const initialSubjects = data.map((subject: { _id: any; name: string; credits: number }) => ({
          name: subject.name,
          credits: subject.credits,
          score: 0,
          semester: 'HK1',
          _id: subject._id,
          userId: userId || null,
          isChanged: false
        }));
        setSubjects(initialSubjects);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [userId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('userId:', userId);

    const changedSubjects = subjects.filter(subject => subject.isChanged);

    const data = changedSubjects.map(subject => ({
      name: subject.name,
      credits: subject.credits,
      score: subject.score,
      semester: subject.semester,
      userId: userId || null,
    }));

    console.log('Data being sent:', JSON.stringify(data, null, 2));

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
        alert('Dữ liệu đã được gửi thành công');
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

  return (
    <div className="flex flex-col px-6">
      <FeedWrapper>
        <Header title="Hệ Khuyến Nghị" />
        <div className="mb-10 justify-center">
          <form onSubmit={handleSubmit}>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2">STT</th>
                  <th className="py-2">Tên môn học</th>
                  <th className="py-2">Số tín chỉ</th>
                  <th className="py-2">Điểm</th>
                  <th className="py-2">Học kỳ</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => (
                  <tr key={index} className="text-center">
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">
                      <input
                        type="text"
                        placeholder="Tên môn học"
                        className="border p-2 rounded-md"
                        value={subject.name}
                        onChange={(e) => handleInputChange('name', e.target.value, index)}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        placeholder="Số tín chỉ"
                        min="0"
                        className="border p-2 rounded-md"
                        value={subject.credits}
                        onChange={(e) => handleInputChange('credits', parseInt(e.target.value), index)}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        placeholder="Điểm"
                        min="0"
                        max="10"
                        className="border p-2 rounded-md"
                        value={subject.score}
                        onChange={(e) => handleInputChange('score', parseFloat(e.target.value), index)}
                      />
                    </td>
                    <td className="py-2">
                      <select
                        value={subject.semester}
                        onChange={(e) => handleSemesterChange(e.target.value, index)}
                        className="border p-2 rounded-md"
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
            <div className="flex justify-center mt-10">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Submit</button>
            </div>
          </form>
        </div>
      </FeedWrapper>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </div>
  );
};

export default MainPage;
