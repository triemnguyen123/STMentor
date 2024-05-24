// mainpage/page.tsx
'use client'
//import { useClient } from '@react-client'; // Import useClient from the @react-client package
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import React, { FormEvent, useState } from 'react';
import ErrorModal from './ErrorModal'; // Import ErrorModal component

import { Header } from "./header";

const MainPage = () => {
  const subjects = {
    'Cơ sở ngành': [
      { name: 'Kỹ thuật lập trình', credits: 3 },
      { name: 'Lập trình hướng đối tượng', credits: 4 },
      { name: 'Cấu trúc dữ liệu và giải thuật', credits: 3 },
      { name: 'Cơ sở dữ liệu', credits: 3 },
      { name: 'Nhập môn Mạng máy tính và điện toán đám mây', credits: 3 },
      { name: 'Các nền tảng phát triển phần mềm', credits: 3 },
    ],
    'Đại cương': [
      { name: 'Toán cao cấp và ứng dụng', credits: 4 },
      { name: 'Đại số tuyến tính và ứng dụng', credits: 3 },
      { name: 'Vật lý đại cương 1', credits: 2 },
      { name: 'Vật lý đại cương 2', credits: 2 },
      { name: 'Toán rời rạc', credits: 4 },
      { name: 'Nhập môn Công nghệ thông tin', credits: 3 },
      { name: 'Cơ sở lập trình', credits: 3 },
    ],
    'Công nghệ phần mềm': [
      { name: 'Nhập môn Công nghệ phần mềm', credits: 3 },
      { name: 'Kỹ thuật lấy yêu cầu', credits: 3 },
      { name: 'Kiểm thử phần mềm', credits: 3 },
      { name: 'Phân tích và thiết kế hệ thống theo Hướng đối tượng', credits: 3 },
      { name: 'Lập trình Web nâng cao', credits: 3 },
      { name: 'Quản lý dự án phần mềm', credits: 3 },
    ],
    'Công nghệ dữ liệu': [
      { name: 'Xác xuất thống kê ứng dụng', credits: 3 },
      { name: 'Nhập môn Trí tuệ nhân tạo', credits: 3 },
      { name: 'Nhập môn phân tích dữ liệu lớn', credits: 3 },
      { name: 'Nhập môn học máy', credits: 3 },
      { name: 'Các hệ hỗ trợ ra quyết định', credits: 3 },
      { name: 'Số hóa và quản trị thông tin số', credits: 3 },
      { name: 'Mã hóa và an toàn dữ liệu', credits: 3 },
    ],
    'An ninh mạng máy tính và IoT': [
      { name: 'Mạng máy tính nâng cao', credits: 3 },
      { name: 'Quản trị Mạng', credits: 3 },
      { name: 'An ninh Hạ tầng mạng', credits: 3 },
      { name: 'An ninh Ứng dụng Web', credits: 3 },
      { name: 'Lập trình Hệ thống nhúng và Internet vạn vật', credits: 3 },
      { name: 'Mã hóa và an toàn dữ liệu', credits: 3 },
    ],
  };

  const fieldsInitialState = [
    { id: 'subjectName', label: 'Các môn học :', type: 'text', value: '' },
    { id: 'score', label: 'Điểm :', type: 'number', min: '0', max: '10', value: '' },
  ];

  const [fields, setFields] = useState(fieldsInitialState);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
  
    const data = fields.reduce((acc: { [key: string]: any }, field) => {
      if (field.type === 'text') {
        const selectedOption = (document.getElementById(field.id) as HTMLSelectElement).selectedOptions[0];
        acc[field.id] = { name: selectedOption.value, credits: selectedOption.dataset.credits };
      } else {
        const value = (document.getElementById(field.id) as HTMLInputElement).value;
        acc[field.id] = field.type === 'number' ? Number(value) : value;
      }
      return acc;
    }, {});
  
    const isValid = Object.values(data).every(value => !!value); // Check if all fields have value
  
    if (!isValid) {
      setError('Vui lòng điền đầy đủ thông tin cho tất cả các trường');
      return;
    }
  
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        alert('Dữ liệu đã được gửi thành công');
      } else {
        const errorData = await response.text();
        setError(errorData || 'Có lỗi xảy ra khi gửi dữ liệu');
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
  
  

  const handleAddField = () => {
    setFields([
      ...fields,
      { id: `subjectName${fields.length}`, label: 'Các môn học :', type: 'text', value: '' },
      { id: `score${fields.length}`, label: 'Điểm :', type: 'number', min: '0', max: '10', value: '' },
    ]);
  };

  const handleInputChange = (id: string, value: string) => {
    const updatedFields = fields.map((field) => (field.id === id ? { ...field, value } : field));
    setFields(updatedFields);
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 2); // Remove 2 fields, subjectName and score
    setFields(updatedFields);
  };

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Chỗ điền điểm sinh viên" />
        <div className="mb-10">
          <form onSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <div key={field.id} className="flex justify-between items-center mb-4">
                <label htmlFor={field.id} className="mr-0">{field.label}</label>
                {field.type === 'text' ? (
                  <select
                    id={field.id}
                    name={field.id}
                    className="border p-2 rounded-md"
                    value={field.value}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  >
                    {Object.entries(subjects).map(([category, subjects]) => (
                      <optgroup key={category} label={category}>
                        {subjects.map((subject, index) => (
                          <option key={index} value={subject.name}>
                            {subject.name} - {subject.credits} TC
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    name={field.id}
                    min={field.min}
                    max={field.max}
                    className="border p-2 rounded-md"
                    value={field.value}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex justify-center mt-10">
              <div className="mr-4">
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Submit</button>
              </div>
              <div>
                <button onClick={handleAddField} className="px-4 py-2 bg-green-500 text-white rounded-md">Add Field</button>
              </div>
            </div>
          </form>
        </div>
      </FeedWrapper>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </div>
  );
};

export default MainPage;
