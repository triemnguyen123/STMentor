import Link from "next/link";
import { ArrowLeft, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClerkLoading, ClerkLoaded, UserButton, useUser } from "@clerk/nextjs";

type Props = {
  title: string;
};

export const Header = ({ title }: Props) => {
  const { user } = useUser();

  return (
    <div className="sticky top-0 bg-white pb-3 lg:pt-[28px] lg:mt-[-28px] flex items-center justify-between border-b-2 mb-5 text-neutral-400 lg:z-50">
      <Link href="/mainpage">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-5 w-5 stroke-2 text-neutral-400" />
        </Button>
      </Link>
      <h1 className="font-bold text-lg">
        {title}
      </h1>
      <div />
      <div className="p-4 flex items-center">
        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          {user ? (
            <span className="mr-4">{user.fullName || user.username}</span>
          ) : null}
          <UserButton afterSignOutUrl="/" />
        </ClerkLoaded>
      </div>
    </div>
  );
};
