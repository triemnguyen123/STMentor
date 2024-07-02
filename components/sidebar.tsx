// components/sidebar.tsx

'use client';

import Link from "next/link";
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import Image from "next/image";
import { SidebarItem } from "./sidebar-item";

type Props = {
  className?: string;
  currentPath: string;
};

export const Sidebar = ({ className, currentPath }: Props) => {
  const { user } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={`flex h-full lg:w-[280px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col ${className}`}>
      <Link href="/">
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/VLU_Logo.png" height={100} width={100} alt="VLU_Logo" />
          <h1 className="text-2xl font-extrabold text-red-600 tracking-wide">
            STMentor
          </h1>
        </div>
      </Link>
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem
          label="Hệ Khuyến Nghị"
          href="/mainpage"
          iconSrc="/learn.svg"
          isActive={currentPath === "/mainpage"}
        />
        <SidebarItem
          label="Chương trình đào tạo"
          href="/chuongtrinh"
          iconSrc="/quests.svg"
          isActive={currentPath === "/chuongtrinh"}
        />
        <SidebarItem
          label="Kết quả học tập"
          href="/ketqua"
          iconSrc="/diemso.png"
          isActive={currentPath === "/ketqua"}
        />
        {user?.id === 'user_2fzgFfIT9yHq49f6pMK2lJMUTJR' && (
          <div className="relative">
            <SidebarItem 
              label="Quản trị viên"
              href="#"
              iconSrc="/admin.png"
              onClick={handleAdminClick}
              isActive={currentPath.startsWith("/admin")}
            />
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-lg border">
                <SidebarItem 
                  label="Quản lý CTDT"
                  href="/admin/CTDT"
                  iconSrc="/CTDT.png"
                  isActive={currentPath === "/admin/CTDT"}
                />
                <SidebarItem 
                  label="Quản lý KQHT"
                  href="/admin/KQHT"
                  iconSrc="/KQHT.png"
                  isActive={currentPath === "/admin/KQHT"}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
