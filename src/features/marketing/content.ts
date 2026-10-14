import {
  BellRing,
  Bot,
  CalendarClock,
  Camera,
  CloudUpload,
  FileHeart,
  HeartHandshake,
  Languages,
  LineChart,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

/** Marketing copy in both languages. Each pair is [English, Bangla]. */
export type Pair = readonly [string, string];

export interface Feature {
  icon: LucideIcon;
  title: Pair;
  description: Pair;
  ai?: boolean;
}

export const FEATURES: Feature[] = [
  {
    icon: Camera,
    title: ["AI prescription reader", "এআই প্রেসক্রিপশন রিডার"],
    description: [
      "Snap a photo of a handwritten prescription. AI (OCR + LLM) extracts every medicine, dose and duration and shows it in big, clear letters.",
      "হাতে লেখা প্রেসক্রিপশনের ছবি তুলুন। এআই (OCR + LLM) প্রতিটি ওষুধ, ডোজ ও কতদিন খাবেন তা বের করে বড় অক্ষরে দেখায়।",
    ],
    ai: true,
  },
  {
    icon: Languages,
    title: ["Bangla voice reminders", "বাংলায় ভয়েস রিমাইন্ডার"],
    description: [
      "At dose time the browser speaks: “Grandpa, it's time to take Napa Extend after your meal.” Instructions can be read aloud anytime.",
      "ওষুধের সময় হলে ব্রাউজার নিজেই বলবে: “দাদু, এখন আপনার ভরা পেটে নাপা এক্সটেন্ড খাওয়ার সময় হয়েছে।”",
    ],
  },
  {
    icon: ScanLine,
    title: ["Smart expiry scanner", "মেয়াদ শেষের সতর্কতা"],
    description: [
      "Scan a medicine strip — AI reads the tiny expiry date. You get an alert 7 days before it expires.",
      "ওষুধের পাতা স্ক্যান করুন — এআই ছোট অক্ষরের মেয়াদ পড়ে নেয়। মেয়াদ শেষের ৭ দিন আগে সতর্ক করে।",
    ],
    ai: true,
  },
  {
    icon: HeartHandshake,
    title: ["Caregiver dashboard", "দূর থেকে পরিবারের খেয়াল"],
    description: [
      "Children living far away see whether parents took today's doses and get an action alert by email when a dose is missed.",
      "দূরে থাকা সন্তানরা দেখতে পারেন বাবা-মা আজ ওষুধ খেয়েছেন কিনা, ওষুধ বাদ পড়লে ইমেইলে সতর্কবার্তা পান।",
    ],
  },
  {
    icon: CloudUpload,
    title: ["Cloud medical history", "ডিজিটাল প্রেসক্রিপশন হিস্ট্রি"],
    description: [
      "Every prescription is stored securely and sorted by date — never lose a paper prescription again.",
      "সব প্রেসক্রিপশন তারিখ অনুযায়ী নিরাপদে সংরক্ষিত থাকে — কাগজ হারানোর ভয় আর নেই।",
    ],
  },
  {
    icon: FileHeart,
    title: ["Doctor share link", "ডাক্তারের জন্য শেয়ার লিংক"],
    description: [
      "Show a new doctor your complete history with one time-limited, read-only link.",
      "নতুন ডাক্তারকে একটি নির্দিষ্ট মেয়াদের লিংকে পুরো চিকিৎসার ইতিহাস দেখান।",
    ],
  },
  {
    icon: Stethoscope,
    title: ["Drug interaction checker", "ওষুধের পারস্পরিক প্রতিক্রিয়া"],
    description: [
      "AI checks your current medicines against each other, your allergies and conditions.",
      "এআই আপনার ওষুধগুলো একে অপরের সাথে, আপনার অ্যালার্জি ও রোগের সাথে মিলিয়ে দেখে।",
    ],
    ai: true,
  },
  {
    icon: Bot,
    title: ["AI health assistant", "এআই স্বাস্থ্য সহকারী"],
    description: [
      "Ask questions about your medicines in Bangla or English. Answers use your own medicine list as context.",
      "বাংলা বা ইংরেজিতে ওষুধ নিয়ে প্রশ্ন করুন। উত্তর দেওয়া হয় আপনার নিজের ওষুধের তালিকা দেখে।",
    ],
    ai: true,
  },
  {
    icon: LineChart,
    title: ["Adherence insights", "ওষুধ খাওয়ার রিপোর্ট"],
    description: [
      "Charts of taken vs missed doses plus AI tips on which time of day needs attention.",
      "খাওয়া বনাম বাদ পড়া ডোজের চার্ট, আর কোন সময়ে বেশি খেয়াল দরকার তা নিয়ে এআই পরামর্শ।",
    ],
    ai: true,
  },
  {
    icon: CalendarClock,
    title: ["Flexible schedules", "সহজ সময়সূচি"],
    description: [
      "Bangladeshi dose patterns like 1+0+1 become reminders automatically; edit times, days and quantity.",
      "১+০+১ এর মতো নিয়ম থেকে নিজে নিজেই রিমাইন্ডার তৈরি হয়; সময়, দিন ও পরিমাণ বদলানো যায়।",
    ],
  },
  {
    icon: BellRing,
    title: ["Browser & push alerts", "নোটিফিকেশন"],
    description: [
      "Reminders arrive as browser notifications even when SmartMed is in the background.",
      "স্মার্টমেড বন্ধ বা অন্য ট্যাবে থাকলেও ব্রাউজার নোটিফিকেশনে রিমাইন্ডার আসে।",
    ],
  },
  {
    icon: ShieldCheck,
    title: ["Private & secure", "নিরাপদ ও গোপনীয়"],
    description: [
      "Email OTP verification, account lockout protection and role-based access keep health data safe.",
      "ইমেইল OTP যাচাই, লগইন সুরক্ষা ও রোল-ভিত্তিক অ্যাক্সেস দিয়ে স্বাস্থ্য তথ্য নিরাপদ রাখা হয়।",
    ],
  },
];

export const PROBLEMS: { problem: Pair; fix: Pair }[] = [
  {
    problem: ["Doctors' handwriting is hard to read — wrong medicines get bought or taken.", "ডাক্তারের অস্পষ্ট লেখার কারণে ভুল ওষুধ কেনা বা খাওয়া হয়।"],
    fix: ["AI reads the prescription and shows medicine names and doses in large text.", "এআই প্রেসক্রিপশন পড়ে ওষুধের নাম ও ডোজ বড় অক্ষরে দেখায়।"],
  },
  {
    problem: ["Elderly users struggle with app stores, updates and low phone storage.", "বয়স্করা অ্যাপ ডাউনলোড, আপডেট বা ফোনের মেমোরি নিয়ে সমস্যায় পড়েন।"],
    fix: ["A website you can bookmark. Large-font mode and a very simple interface.", "বুকমার্ক করে রাখার মতো ওয়েবসাইট। বড় লেখা আর খুব সহজ ব্যবহার।"],
  },
  {
    problem: ["Text notifications are hard to read and remember.", "শুধু লেখা নোটিফিকেশন পড়া ও মনে রাখা কঠিন।"],
    fix: ["Spoken Bangla reminders through the Web Speech API.", "Web Speech API দিয়ে বাংলায় মুখে বলে মনে করিয়ে দেয়।"],
  },
  {
    problem: ["Expiry dates on strips are tiny; expired medicine can harm the liver or kidneys.", "পাতার মেয়াদ এত ছোট লেখা যে পড়া যায় না; মেয়াদোত্তীর্ণ ওষুধ লিভার-কিডনির ক্ষতি করে।"],
    fix: ["Scan the strip once; get an alert 7 days before it expires.", "একবার স্ক্যান করুন; মেয়াদ শেষের ৭ দিন আগে সতর্কবার্তা পাবেন।"],
  },
  {
    problem: ["Children abroad cannot know whether parents took their medicine.", "প্রবাসে থাকা সন্তানরা জানতে পারেন না বাবা-মা ওষুধ খেয়েছেন কিনা।"],
    fix: ["A caregiver dashboard with missed-dose action alerts by email.", "কেয়ারগিভার ড্যাশবোর্ড আর ওষুধ বাদ পড়লে ইমেইলে সতর্কবার্তা।"],
  },
  {
    problem: ["Paper prescriptions get lost, torn or faded.", "কাগজের প্রেসক্রিপশন হারিয়ে যায়, ছিঁড়ে যায় বা লেখা মুছে যায়।"],
    fix: ["Secure cloud history sorted by date, shareable with any doctor.", "তারিখ অনুযায়ী নিরাপদ ক্লাউড হিস্ট্রি, যেকোনো ডাক্তারকে দেখানো যায়।"],
  },
];
