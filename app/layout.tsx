import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edge TTS - Text to Speech Service",
  description: "基于 Microsoft Edge TTS 的文本转语音服务",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
