'use client';
import { useState, useEffect } from 'react';
import { FeedWrapper } from '@/components/feed-wrapper';
import ErrorModal from './ErrorModal'; // Corrected import
import { Header } from './header';
import { useAuth } from '@clerk/clerk-react';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";

const MainPage = () => {
  const { userId } = useAuth();
  const [subjects, setSubjects] = useState<{ tenMonHoc: string; TC: number; diem: number; hk: string; userId: string | null; isChanged: boolean; _id: string; chuyenNganh: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false); // New state for dialog

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = `
        .custom-tbody {
          font-size: 1rem; 
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
        const initialSubjects = data.map((subject: any) => ({
          tenMonHoc: subject.tenMonHoc,
          TC: subject.TC,
          diem: 0,
          hk: 'HK1',
          _id: subject._id,
          userId: userId || null,
          isChanged: false,
          chuyenNganh: subject.chuyenNganh,
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
      tenMonHoc: subject.tenMonHoc,
      TC: subject.TC,
      diem: subject.diem,
      hk: subject.hk,
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
        setSubjects(subjects.map(subject => ({ ...subject, diem: 0, isChanged: false }))); // Reset data
        generateRecommendation();
        setIsDialogOpen(true); // Open the dialog
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
  

  const handleInputChange = (tenMonHoc: string, value: string, index: number) => {
    const updatedSubjects = [...subjects];
    const parsedValue = parseFloat(value);
    updatedSubjects[index] = { ...updatedSubjects[index], diem: isNaN(parsedValue) ? 0 : parsedValue, isChanged: true };
    setSubjects(updatedSubjects);
  };

  const handleSemesterChange = (hk: string, index: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], hk: hk, isChanged: true };
    setSubjects(updatedSubjects);
  };

  const generateRecommendation = () => {
    // Extracting subject scores
    const scores = subjects.reduce((acc, subject) => {
      acc[subject.tenMonHoc] = subject.diem;
      return acc;
    }, {} as { [key: string]: number });
  
    // Initial values for all subjects
    const toanCaoCap = scores['Toán cao cấp và ứng dụng'] || 0;
    const daiSoTuyenTinh = scores['Đại số tuyến tính và ứng dụng'] || 0;
    const vatLyDaiCuong1 = scores['Vật lý đại cương 1'] || 0;
    const vatLyDaiCuong2 = scores['Vật lý đại cương 2'] || 0;
    const toanRoiRac = scores['Toán rời rạc'] || 0;
    const nhapMonCNTT = scores['Nhập môn Công nghệ thông tin'] || 0;
    const coSoLapTrinh = scores['Cơ sở lập trình'] || 0;
    const kyThuatLapTrinh = scores['Kỹ thuật lập trình'] || 0;
    const lapTrinhHuongDoiTuong = scores['Lập trình hướng đối tượng'] || 0;
    const cauTrucDuLieuVaGiaiThuat = scores['Cấu trúc dữ liệu và giải thuật'] || 0;
    const coSoDuLieu = scores['Cơ sở dữ liệu'] || 0;
    const monMangMayTinh = scores['Nhập môn Mạng máy tính và điện toán đám mây'] || 0;
    const cacNenTangPhatTrienPhanMem = scores['Các nền tảng phát triển phần mềm'] || 0;
  
    let recommendation = '';
  
    // Decision tree logic with all subjects
    if (nhapMonCNTT > 6.75) {
      if (vatLyDaiCuong2 > 8.10) {
        if (lapTrinhHuongDoiTuong > 8.75) {
          if (vatLyDaiCuong1 > 8.95) {
            recommendation = 'Công nghệ phần mềm';
          } else if (vatLyDaiCuong2 > 9.40) {
            recommendation = 'Trí tuệ nhân tạo';
          } else if (nhapMonCNTT > 8.60) {
            recommendation = 'An ninh Mạng và IoT';
          } else {
            recommendation = 'Công nghệ phần mềm';
          }
        } else if (coSoDuLieu > 7.15) {
          recommendation = 'An ninh Mạng và IoT';
        } else {
          recommendation = 'Công nghệ phần mềm';
        }
      } else if (cauTrucDuLieuVaGiaiThuat > 6.55) {
        if (coSoDuLieu > 3.30) {
          if (vatLyDaiCuong2 > 8.25) {
            if (vatLyDaiCuong2 > 8.80) {
              recommendation = 'Công nghệ phần mềm';
            } else if (cacNenTangPhatTrienPhanMem > 7.80) {
              recommendation = 'Trí tuệ nhân tạo';
            } else {
              recommendation = 'An ninh Mạng và IoT';
            }
          } else {
            recommendation = 'Công nghệ phần mềm';
          }
        } else if (monMangMayTinh > 8.85) {
          recommendation = 'An ninh Mạng và IoT';
        } else {
          recommendation = 'Công nghệ phần mềm';
        }
      } else {
        recommendation = 'Công nghệ phần mềm';
      }
    } else if (cauTrucDuLieuVaGiaiThuat > 5.90) {
      if (vatLyDaiCuong2 > 8.10) {
        if (lapTrinhHuongDoiTuong > 6.75) {
          recommendation = 'Trí tuệ nhân tạo';
        } else {
          recommendation = 'Công nghệ phần mềm';
        }
      } else {
        if (coSoDuLieu > 8.30) {
          recommendation = 'An ninh Mạng và IoT';
        } else if (vatLyDaiCuong2 > 8.00) {
          recommendation = 'Công nghệ phần mềm';
        } else if (kyThuatLapTrinh > 5.90) {
          recommendation = 'Trí tuệ nhân tạo';
        } else {
          recommendation = 'Công nghệ phần mềm';
        }
      }
    } else if (toanRoiRac > 9.20) {
      recommendation = 'An ninh Mạng và IoT';
    } else {
      recommendation = 'Công nghệ phần mềm';
    }
  
    setRecommendation(recommendation);
  };
  

  const groupedSubjects = subjects.reduce((acc, subject) => {
    if (!acc[subject.chuyenNganh]) {
      acc[subject.chuyenNganh] = [];
    }
    acc[subject.chuyenNganh].push(subject);
    return acc;
  }, {} as { [key: string]: { tenMonHoc: string; TC: number; diem: number; hk: string; userId: string | null; isChanged: boolean; _id: string }[] });

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="relative flex flex-col px-6">
      <FeedWrapper>
        <Header title="Hệ Khuyến Nghị" />
        <div className="overflow-x-auto">
          <form onSubmit={handleSubmit}>
            {Object.keys(groupedSubjects).map((category) => (
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
                    {groupedSubjects[category].map((subject, subIndex) => (
                      <tr key={subject._id} className="border-b border-gray-100 hover:bg-gray-100">
                        <td className="py-3 px-6 text-left whitespace-nowrap">{subIndex + 1}</td>
                        <td className="py-3 px-6 text-left">{subject.tenMonHoc}</td>
                        <td className="py-3 px-6 text-left">{subject.TC}</td>
                        <td className="py-3 px-6 text-left">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={subject.diem.toString()}
                            onChange={(e) => handleInputChange(subject.tenMonHoc, e.target.value, subjects.findIndex(s => s._id === subject._id))}
                            className="w-20 p-2 border rounded"
                          />
                        </td>
                        <td className="py-3 px-6 text-left">
                          <select
                            value={subject.hk}
                            onChange={(e) => handleSemesterChange(e.target.value, subjects.findIndex(s => s._id === subject._id))}
                            className="w-20 p-2 border rounded"
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
            <div className="flex justify-center mt-4">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Gửi và Xem Khuyến Nghị
              </Button>
            </div>
          </form>
        </div>
  
        {/* Recommendation Dialog */}
        {recommendation && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl">Hệ Thống Khuyến Nghị :</DialogTitle>
                <DialogDescription className="text-lg mt-2">
                  Dựa vào điểm của bạn thì chuyên ngành khuyến nghị bạn nên chọn <span className="font-bold text-blue-600 text-lg">{recommendation}</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {/* Error Modal */}
        {error && <ErrorModal message={error} onClose={() => setError(null)} />}
  
        <ToastContainer />
      </FeedWrapper>
    </div>
  );
  
  
};

export default MainPage;
