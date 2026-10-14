import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ChatPanel } from "@/features/ai/chat-panel";
import { T } from "@/components/shared/t";

export const metadata: Metadata = { title: "Health assistant" };

export default function AssistantPage() {
  return (
    <>
      <PageHeader title={<T en="Health assistant" bn="স্বাস্থ্য সহকারী" />} description={<T en="Ask in Bangla or English — answers use your medicine list as context." bn="বাংলা বা ইংরেজিতে জিজ্ঞাসা করুন — উত্তর আপনার ওষুধের তালিকা দেখে দেওয়া হয়।" />} />
      <ChatPanel />
    </>
  );
}
