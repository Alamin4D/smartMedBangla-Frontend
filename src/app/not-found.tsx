import { Home, SearchX } from "lucide-react";
import Link from "next/link";
import { T } from "@/components/shared/t";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <SearchX className="mx-auto size-14 text-primary" />
        <h1 className="mt-4 text-3xl font-bold">
          <T en="Page not found" bn="পেজটি পাওয়া যায়নি" />
        </h1>
        <p className="mt-2 text-muted-foreground">
          <T en="The page you are looking for does not exist or was moved." bn="আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরানো হয়েছে।" />
        </p>
        <Button className="mt-6" asChild>
          <Link href="/">
            <Home /> <T en="Back to home" bn="হোমে ফিরে যান" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
