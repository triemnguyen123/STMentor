'use client';
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation"; 
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

export const MobileSidebar = () => {
  const currentPath = usePathname() || ""; 

  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="text-white" />
      </SheetTrigger>
      <SheetContent className="p-0 z-[100]" side="left">
        <Sidebar currentPath={currentPath} /> 
      </SheetContent>
    </Sheet>
  );
};
