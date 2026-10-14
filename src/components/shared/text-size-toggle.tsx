// "use client";

// import { useEffect, useState } from "react";
// import { useMe } from "@/features/auth/api";
// import { useUpdatePreferences } from "@/features/profile/api";
// import { useT } from "@/hooks/use-t";
// import { cn } from "@/lib/utils";

// const KEY = "sm-large-text";

// /** অ / অ+ switch for the large-text accessibility mode (saved to the profile when logged in). */
// export function TextSizeToggle({ className }: { className?: string }) {
//   const { t } = useT();
//   const { data: user } = useMe();
//   const update = useUpdatePreferences();
//   const [large, setLarge] = useState(false);

//   useEffect(() => {
//     const sync = () => setLarge(document.documentElement.classList.contains("large-text"));
//     sync();
//     const observer = new MutationObserver(sync);
//     observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
//     return () => observer.disconnect();
//   }, []);

//   const choose = (value: boolean) => {
//     document.documentElement.classList.toggle("large-text", value);
//     try {
//       localStorage.setItem(KEY, value ? "1" : "0");
//     } catch {
//       /* private mode */
//     }
//     if (user && user.largeFont !== value) update.mutate({ largeFont: value });
//   };

//   return (
//     <div role="radiogroup" aria-label={t("Text size", "লেখার আকার")} className={cn("inline-flex overflow-hidden rounded-full border bg-background/70", className)}>
//       {[
//         { value: false, label: "অ", name: t("Normal text", "সাধারণ লেখা") },
//         { value: true, label: "অ+", name: t("Large text", "বড় লেখা") },
//       ].map((o) => (
//         <button
//           key={o.label}
//           type="button"
//           role="radio"
//           aria-checked={large === o.value}
//           aria-label={o.name}
//           title={o.name}
//           onClick={() => choose(o.value)}
//           className={cn(
//             "min-w-9 px-2.5 py-1 text-sm font-semibold transition-colors",
//             large === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
//           )}
//         >
//           {o.label}
//         </button>
//       ))}
//     </div>
//   );
// }
