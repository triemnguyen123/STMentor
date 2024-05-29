'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react'; // Sử dụng Clerk's useAuth hook để lấy thông tin người dùng
import { Header } from './header';
import { FeedWrapper } from '@/components/feed-wrapper';

const exists = (value: any) => value !== null && value !== undefined;

interface Subject {
  STT: number;
  name: string;
  score: number;
  semester: string;
}

interface Result {
  subjects: Subject[];
}

const Ketqua = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth(); // Lấy userId từ Clerk's useAuth hook

  useEffect(() => {
    if (!userId) return;

    const fetchResults = async () => {
      setLoading(true);
      setResults([]);
      try {
        const response = await fetch('/api/get-results', {
          headers: {
            'user-id': userId, // Thêm userId vào header
          },
        });
        if (!response.ok) {
          throw new Error('Lỗi khi lấy dữ liệu');
        }
        const data = await response.json();
        console.log('Data from API:', data);
        setResults(Array.isArray(data) ? data : []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [userId]); // Chỉ gọi lại API khi `userId` thay đổi

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Kết Quả" />
        <div className="mb-10">
          {results.length === 0 ? (
            <p>Không có dữ liệu</p>
          ) : (
            results.map((result, resultIndex) => (
              <div key={resultIndex}>
                <h3 className="font-bold text-lg mt-4 mb-2">
  Học kỳ: {result.subjects && result.subjects.length > 0 ? result.subjects[0].semester : 'N/A'}
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {result.subjects && result.subjects.map((subject, subjectIndex) => (
  <tr key={subjectIndex}>
    <td className="px-6 py-4 whitespace-nowrap">{subject.STT}</td>
    <td className="px-6 py-4 whitespace-nowrap">{subject.name || 'N/A'}</td>
    <td className="px-6 py-4 whitespace-nowrap">{subject.score !== undefined ? subject.score : 'N/A'}</td>
    <td className="px-6 py-4 whitespace-nowrap">{exists(subject.semester) ? subject.semester : 'N/A'}</td>
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
