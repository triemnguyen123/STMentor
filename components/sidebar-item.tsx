'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  iconSrc: string;
  href: string;
  onClick?: (e: React.MouseEvent) => void; // Thay đổi type của onClick
};

export const SidebarItem = ({
  label,
  iconSrc,
  href,
  onClick, // Thay đổi type của onClick
}: Props) => {
  const pathname = usePathname();
  const active = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault(); // Ngăn chặn hành động mặc định của thẻ <a> nếu có onClick
      onClick(e);
    }
  };

  return (
    <Button
      variant={active ? "sidebarOutline" : "sidebar"}
      className="justify-start h-[52px]"
      onClick={handleClick} // Gọi handleClick khi button được click
      asChild={!onClick} // Chỉ sử dụng asChild khi không có onClick
    >
      <Link href={href}>
        <Image
          src={iconSrc}
          alt={label}
          className="mr-5"
          height={32}
          width={32}
        />
        {label}
      </Link>
    </Button>
  );
};
