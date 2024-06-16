// components/sidebar-item.tsx

import Link from "next/link";
import Image from "next/image";
import React from "react";

type Props = {
  label: string;
  href: string;
  iconSrc: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void; // Thêm prop onClick để xử lý sự kiện click
};

export const SidebarItem = ({ label, href, iconSrc, className, onClick }: Props) => {
  return (
    <Link href={href}>
      <div onClick={onClick} className={`flex items-center gap-x-3 p-2 hover:bg-gray-100 ${className}`}>
        <Image src={iconSrc} height={24} width={24} alt={label} />
        <span className="text-xl font-semibold text-lg">{label}</span> {/* Thay đổi kiểu chữ */}
      </div>
    </Link>
  );
};