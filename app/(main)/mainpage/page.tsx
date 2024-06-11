'use client';


import { useState, useEffect } from 'react';
import { FeedWrapper } from '@/components/feed-wrapper';
import ErrorModal from './ErrorModal';
import { Header } from './header';
import { useAuth } from '@clerk/clerk-react'; 
import React from 'react';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const MainPage = () => {
  const { userId } = useAuth(); 
  const [subjects, setSubjects] = useState<{ _id: string; name: string; credits: number; }[]>([]);
  const [fields, setFields] = useState<{ id: string; label: string; type: string; value: string; min?: string; max?: string; semester: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>('HK1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setSubjects(data);
        setFields([
          { id: 'subjectName0', label: 'Các môn học :', type: 'text', value: '', semester: 'HK1' },
          { id: 'score0', label: 'Điểm :', type: 'number', min: '0', max: '10', value: '', semester: 'HK1' },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('userId:', userId);
    const data = fields.reduce((acc, field, index) => {
      if (index % 2 === 0) {
        const subjectField = fields[index];
        const scoreField = fields[index + 1];
        const selectedOption = document.querySelector(`#${subjectField.id} option[value="${subjectField.value}"]`) as HTMLOptionElement;
        if (subjectField && scoreField && selectedOption) {
          const subjectId = selectedOption.getAttribute('data-subject-id');
          const score = parseFloat(scoreField.value);
          // Kiểm tra xem cả subjectId và scoreField.value đều tồn tại trước khi thêm vào mảng subjects
          if (subjectId && !isNaN(score)) {
            acc.subjects.push({
              _id: subjectId, // Sử dụng _id thay vì id
              name: selectedOption.value,
              credits: parseInt(selectedOption.getAttribute('data-credits') || '0'),
              score,
              semester: field.semester,
            });
          }
        }
      }
      return acc;
    }, { subjects: [] } as { subjects: { _id: string, name: string, credits: number, score: number, semester: string }[] });
  
    const isValid = data.subjects.every(subject => subject._id && subject.name && !isNaN(subject.score));
    if (!isValid) {
      setError('Vui lòng điền đầy đủ thông tin cho tất cả các trường');
      return;
    }
  
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId || '',
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
      { id: `subjectName${fields.length / 2}`, label: 'Các môn học :', type: 'text', value: '', semester: selectedSemester },
      { id: `score${fields.length / 2}`, label: 'Điểm :', type: 'number', min: '0', max: '10', value: '', semester: selectedSemester },
    ]);
  };



  const handleInputChange = (id: string, value: string) => {
    const updatedFields = fields.map(field => {
      if (field.id === id) {
        return { ...field, value };
      }
      return field;
    });
    setFields(updatedFields);
  };

  const handleSemesterChange = (semester: string, index: number) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...fields[index], semester };
    setFields(updatedFields);
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 2);
    setFields(updatedFields);
  };

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Hệ Khuyến Nghị" />
        <div className="mb-10 justify-center">
          <form onSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-wrap items-center mb-4">
                <label htmlFor={field.id} className="mr-0">{field.label}</label>
                <div className="flex" style={{ width: '50%', margin: 'auto' }}>
                  {field.type === 'text' ? (
                    <React.Fragment>
                      {index % 2 === 0 && 
                        <select
                          value={field.semester}
                          onChange={(e) => handleSemesterChange(e.target.value, index)}
                          className="border p-2 rounded-md mr-2"
                        >
                          <option value="HK1">HK1</option>
                          <option value="HK2">HK2</option>
                          <option value="HK3">HK3</option>
                        </select>
                      }
                      <select
                        id={field.id}
                        name={field.id}
                        className="border p-2 rounded-md"
                        value={field.value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      >                        <option value="" disabled style={{ display: 'none' }}>Chọn môn học</option>
                      {subjects.map((subject) => (
                        <option
                          key={subject._id} // Sử dụng _id thay vì id
                          value={subject.name}
                          data-credits={subject.credits}
                          data-subject-id={subject._id} // Sử dụng _id thay vì id
                        >
                          {subject.name} - {subject.credits} TC
                        </option>
                      ))}
                    </select>
                  </React.Fragment>
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
              </div>
              {index % 2 === 0 && 
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Remove
                </button>
              }
            </div>
          ))}
          <div className="flex justify-center mt-10">
            <div className="mr-4">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Submit</button>
            </div>
            <div>
              <button type="button" onClick={handleAddField} className="px-4 py-2 bg-green-500 text-white rounded-md">Add Subject</button>
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



