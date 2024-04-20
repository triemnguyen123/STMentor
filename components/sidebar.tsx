import Link from "next/link";
import Image from "next/image";
import {
  ClerkLoading,
  ClerkLoaded,
  UserButton,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";

import { cn } from "@/lib/utils";

import { SidebarItem } from "./sidebar-item";

type Props = {
  className?: string;
};

export const Sidebar = ({ className }: Props) => {
  return (
    <div className={cn(
      "flex h-full lg:w-[280px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col",
      className,
    )}>
      <Link href="/mainpage">
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/VLU_Logo.png" height={100} width={100} alt="VLU_Logo" />
          <h1 className="text-2xl font-extrabold text-red-600 tracking-wide">
            STMentor
          </h1>
        </div>
      </Link>
      <div className="flex flex-col gap-y-2 flex-1 ">
        <SidebarItem
          label="Hệ Khuyến Nghị"
          href="/"
          iconSrc="/learn.svg"
        />
        <SidebarItem
          label="Chương trình đào tạo"
          href="/"
          iconSrc="/quests.svg"
        />
        <SidebarItem
          label="Bảng Xếp hạng"
          href="/leaderboard"
          iconSrc="/leaderboard.svg"
        />
        <SidebarItem
          label="Theo dõi điểm số"
          href="/"
          iconSrc="/diemso.png"
        />
        <SidebarItem
          label="Học phần rớt"
          href="/"
          iconSrc="/robot.svg"
        />
      </div>
      <div className="p-4">
        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <UserButton afterSignOutUrl="/" />
        </ClerkLoaded>
      </div>
    </div>
  );
};
