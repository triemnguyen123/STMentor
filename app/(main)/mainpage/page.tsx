//import { Promo } from "@/components/promo"; button tham khao upgrade
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";

import { Header } from "./header";

const mainpage = () => {
  // Mảng chứa thông tin về các trường nhập liệu
  const fields = [
    { id: 'subjectName', label: 'Tên môn học:', type: 'text' },
    { id: 'score', label: 'Điểm:', type: 'number', min: '0', max: '10' },
    // thêm nhiều trường hơn ở đây
  ];

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Chỗ điền điểm sinh viên" /> {/* Placeholder data */}
        <div className="mb-10">
          {fields.map((field) => (
            <div key={field.id} className="flex justify-between items-center mb-4">
              <label htmlFor={field.id} className="mr-0">{field.label}</label>
              <input type={field.type} id={field.id} name={field.id} min={field.min} max={field.max} className="border p-2 rounded-md" />
            </div>
          ))}
          <button className="px-4 py-2 mt-4 bg-blue-500 text-white rounded-md">Submit</button>
        </div>
      </FeedWrapper>
    </div>
  );
};



export default mainpage;