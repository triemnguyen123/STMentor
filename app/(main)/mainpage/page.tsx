'use client'
import { useState } from 'react';
import { FeedWrapper } from '@/components/feed-wrapper';
import ErrorModal from './ErrorModal';
import { Header } from './header';
import { useAuth } from '@clerk/clerk-react'; 





const MainPage = () => {
  const { userId } = useAuth(); 
  
  const subjects = {
    'Cơ sở ngành': [
      { id: 'subject1', name: 'Kỹ thuật lập trình', credits: 3 },
      { id: 'subject2', name: 'Lập trình hướng đối tượng', credits: 4 },
      { id: 'subject3', name: 'Cấu trúc dữ liệu và giải thuật', credits: 3 },
      { id: 'subject4', name: 'Cơ sở dữ liệu', credits: 3 },
      { id: 'subject5', name: 'Nhập môn Mạng máy tính và điện toán đám mây', credits: 3 },
      { id: 'subject6', name: 'Các nền tảng phát triển phần mềm', credits: 3 },
    ],
    'Đại cương': [
      { id: 'subject7', name: 'Toán cao cấp và ứng dụng', credits: 4 },
      { id: 'subject8', name: 'Đại số tuyến tính và ứng dụng', credits: 3 },
      { id: 'subject9', name: 'Vật lý đại cương 1', credits: 2 },
      { id: 'subject10', name: 'Vật lý đại cương 2', credits: 2 },
      { id: 'subject11', name: 'Toán rời rạc', credits: 4 },
      { id: 'subject12', name: 'Nhập môn Công nghệ thông tin', credits: 3 },
      { id: 'subject13', name: 'Cơ sở lập trình', credits: 3 },
    ],
    'Công nghệ phần mềm': [
      { id: 'subject14', name: 'Nhập môn Công nghệ phần mềm', credits: 3 },
      { id: 'subject15', name: 'Kỹ thuật lấy yêu cầu', credits: 3 },
      { id: 'subject16', name: 'Kiểm thử phần mềm', credits: 3 },
      { id: 'subject17', name: 'Phân tích và thiết kế hệ thống theo Hướng đối tượng', credits: 3 },
      { id: 'subject18', name: 'Lập trình Web nâng cao', credits: 3 },
      { id: 'subject19', name: 'Quản lý dự án phần mềm', credits: 3 },
    ],
    'Công nghệ dữ liệu': [
      { id: 'subject20', name: 'Xác xuất thống kê ứng dụng', credits: 3 },
      { id: 'subject21', name: 'Nhập môn Trí tuệ nhân tạo', credits: 3 },
      { id: 'subject22', name: 'Nhập môn phân tích dữ liệu lớn', credits: 3 },
      { id: 'subject23', name: 'Nhập môn học máy', credits: 3 },
      { id: 'subject24', name: 'Các hệ hỗ trợ ra quyết định', credits: 3 },
      { id: 'subject25', name: 'Số hóa và quản trị thông tin số', credits: 3 },
      { id: 'subject26', name: 'Mã hóa và an toàn dữ liệu', credits: 3 },
    ],
    'An ninh mạng máy tính và IoT': [
      { id: 'subject27', name: 'Mạng máy tính nâng cao', credits: 3 },
      { id: 'subject28', name: 'Quản trị Mạng', credits: 3 },
      { id: 'subject29', name: 'An ninh Hạ tầng mạng', credits: 3 },
      { id: 'subject30', name: 'An ninh Ứng dụng Web', credits: 3 },
      { id: 'subject31', name: 'Lập trình Hệ thống nhúng và Internet vạn vật', credits: 3 },
      { id: 'subject32', name: 'Mã hóa và an toàn dữ liệu', credits: 3 },
    ],
  };
  
  type Field = {
    id: string;
    label: string;
    type: string;
    value: string;
    min?: string;
    max?: string;
    semester: string;
  };
  
  const fieldsInitialState = [
    { id: 'subjectName', label: 'Các môn học :', type: 'text', value: '', semester: 'HK1' },
    { id: 'score', label: 'Điểm :', type: 'number', min: '0', max: '10', value: '', semester: 'HK1' },
  ];
  

  const [fields, setFields] = useState(fieldsInitialState);
  const [error, setError] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>('HK1');

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
          acc.subjects.push({
            id: subjectId,
            name: selectedOption.value,
            credits: parseInt(selectedOption.getAttribute('data-credits') || '0'),
            score: parseFloat(scoreField.value),
            semester: field.semester
          });
        }
      }
      return acc;
    }, { subjects: [] } as { subjects: { id: string | null, name: string, credits: number, score: number, semester: string }[] });
  
    const isValid = data.subjects.every(subject => subject.id && subject.name && !isNaN(subject.score));
  
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
      { 
        id: `subjectName${fields.length / 2}`, 
        label: 'Các môn học :', 
        type: 'text', 
        value: '', 
        semester: selectedSemester 
      },
      { 
        id: `score${fields.length / 2}`, 
        label: 'Điểm :', 
        type: 'number', 
        min: '0', 
        max: '10', 
        value: '', 
        semester: selectedSemester 
      },
    ]);
  };
  
  const handleInputChange = (id: string, value: string) => {
    const index = fields.findIndex(field => field.id === id);
    if (index !== -1) {
      const updatedFields = [...fields];
      updatedFields[index] = { ...fields[index], value };
      setFields(updatedFields);
    }
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
                    <>
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
                      >
                          <option value="" disabled hidden>Chọn môn học</option>
                          {Object.entries(subjects).map(([category, subjects]) => (
                              <optgroup key={category} label={category}>
                                  {subjects.map((subject, subIndex) => (
                                      <option
                                          key={`${category}-${subIndex}`}
                                          value={subject.name}
                                          data-credits={subject.credits}
                                          data-subject-id={subject.id}
                                      >
                                          {subject.name} - {subject.credits} TC
                                      </option>
                                  ))}
                              </optgroup>
                          ))}
                      </select>




                    </>
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