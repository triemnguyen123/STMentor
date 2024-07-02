// components/sidebar-item.tsx

import Link from "next/link";
import Image from "next/image";
import React, { useEffect } from "react";

type Props = {
  label: string;
  href: string;
  iconSrc: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  isActive?: boolean;
};

export const SidebarItem = ({ label, href, iconSrc, className, onClick, isActive }: Props) => {
  useEffect(() => {
    console.log(`SidebarItem - ${label}: isActive = ${isActive}`);
  }, [isActive]);

  return (
    <Link href={href}>
      <div onClick={onClick} className={`flex items-center gap-x-3 p-2 hover:bg-gray-100 ${isActive ? 'bg-gray-500' : ''} ${className}`}>
        <Image src={iconSrc} height={24} width={24} alt={label} />
        <span className="text-xl font-semibold text-lg">{label}</span>
      </div>
    </Link>
  );
};
