// components/formComponent.tsx
import React, { FormEvent } from 'react';

interface Field {
  id: string;
  label: string;
  type: string;
  options?: string[];
  min?: string;
  max?: string;
}

interface FormComponentProps {
  fields: Field[];
  handleSubmit: (event: FormEvent) => void;
}

const formComponent: React.FC<FormComponentProps> = ({ fields }) => {
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const data = fields.reduce((acc: { [key: string]: string }, field) => {
      acc[field.id] = (document.getElementById(field.id) as HTMLInputElement).value;
      return acc;
    }, {});

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
      alert('Có lỗi xảy ra khi gửi dữ liệu');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.id} className="flex justify-between items-center mb-4">
          <label htmlFor={field.id} className="mr-0">{field.label}</label>
          {field.type === 'select' && field.options ? (
            <select id={field.id} name={field.id} className="border p-2 rounded-md">
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input type={field.type} id={field.id} name={field.id} min={field.min} max={field.max} className="border p-2 rounded-md" />
          )}
        </div>
      ))}
      <button type="submit" className="px-4 py-2 mt-4 bg-blue-500 text-white rounded-md">Submit</button>
    </form>
  );
};

export default formComponent;
