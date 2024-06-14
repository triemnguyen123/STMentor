'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Header } from './header';
import { FeedWrapper } from '@/components/feed-wrapper';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const exists = (value: any) => value !== null && value !== undefined;

interface Subject {
  STT: number;
  name: string;
  score: number;
  semester: string;
}

const Ketqua = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/get-results', {
          headers: {
            'user-id': userId,
          },
        });
        if (!response.ok) {
          throw new Error('Lỗi khi lấy dữ liệu');
        }
        const data = await response.json();
        console.log('Data from API:', data);
        setSubjects(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [userId]);

  if (loading) return <LoadingSpinner />; 
  if (error) return <div>{error}</div>;

  const semesters = subjects.reduce((acc, subject) => {
    if (!acc[subject.semester]) {
      acc[subject.semester] = [];
    }
    acc[subject.semester].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  const sortedSemesters = Object.keys(semesters).sort((a, b) => {
    const semesterA = parseInt(a.replace('HK', ''));
    const semesterB = parseInt(b.replace('HK', ''));
    return semesterA - semesterB;
  });

  return (
    <div className="flex flex-row-reverse gap-12 px-6">
      {loading && <LoadingSpinner />}
      <FeedWrapper>
        <Header title="Kết Quả" />
        <div className="mb-10">
          {subjects.length === 0 ? (
            <p>Không có dữ liệu</p>
          ) : (
            sortedSemesters.map((semester, semesterIndex) => (
              <div key={semesterIndex} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-indigo-600">{semester}:</h2>
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden divide-y divide-gray-200 ">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-indigo-600 border border-gray-300 text-center text-xs font-medium text-gray-100 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 bg-indigo-600 border border-gray-300 text-center text-xs font-medium text-gray-100  uppercase tracking-wider">
                        Tên môn học
                      </th>
                      <th className="px-6 py-3 bg-indigo-600 border border-gray-300 text-center text-xs font-medium text-gray-100  uppercase tracking-wider">
                        Điểm
                      </th>
                      <th className="px-6 py-3 bg-indigo-600 border border-gray-300 text-center text-xs font-medium text-gray-100  uppercase tracking-wider">
                        Học kỳ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {semesters[semester].map((subject, index) => (
                      <tr key={index} className={`border-t ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="border border-gray-300 py-2 px-4 text-center">{index + 1}</td>
                        <td className="border border-gray-300 py-2 px-4 text-center">{subject.name || 'N/A'}</td>
                        <td className="border border-gray-300 py-2 px-4 text-center">{subject.score !== undefined ? subject.score : 'N/A'}</td>
                        <td className="border border-gray-300 py-2 px-4 text-center">{exists(subject.semester) ? subject.semester : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default Ketqua;
