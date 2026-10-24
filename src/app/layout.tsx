import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Funil de vendas · Nobre Brindes",
  description: "CRM interno para acompanhar o funil de vendas da Nobre Brindes.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const THEME_SCRIPT = `try{if(localStorage.getItem("nobre-crm:theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
