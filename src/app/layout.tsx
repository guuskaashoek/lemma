/**
 * Root layout: fonts, display preferences and global providers.
 */
import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Geist, Geist_Mono } from "next/font/google";
import { PrefsProvider } from "@/i18n/client";
import { ToolboxProvider } from "@/components/toolbox";
import { getPrefs } from "@/lib/prefs";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Dyslexia-friendly option (and the default for new users).
const atkinson = Atkinson_Hyperlegible({ variable: "--font-atkinson", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Lemma",
  description: "Wiskunde, stap voor stap. / Maths, step by step.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const prefs = await getPrefs();
  return (
    <html
      lang={prefs.locale}
      data-theme={prefs.theme}
      data-font={prefs.font}
      data-size={prefs.size}
      className={`${geistSans.variable} ${geistMono.variable} ${atkinson.variable} h-full`}
    >
      <body className="min-h-full">
        <PrefsProvider value={{ locale: prefs.locale, ttsEnabled: prefs.tts, ttsRate: prefs.ttsRate }}>
          <ToolboxProvider>{children}</ToolboxProvider>
        </PrefsProvider>
      </body>
    </html>
  );
}
