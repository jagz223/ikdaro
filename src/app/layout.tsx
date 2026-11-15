import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR, Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";
import { LANGUAGE_KEY, THEME_KEY } from "@/features/preferences/keys";
import { es } from "@/i18n/es";
import { SiteFooter } from "@/ui/components/site-footer";
import { SiteHeader } from "@/ui/components/site-header";
import "./globals.css";

const gothic = Zen_Kaku_Gothic_New({
  variable: "--font-gothic",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const mincho = Shippori_Mincho_B1({
  variable: "--font-mincho",
  weight: ["500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const serifKorean = Noto_Serif_KR({
  variable: "--font-serif-kr",
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "Ikdaro 읽다로", template: "%s · Ikdaro 읽다로" },
  description: es.meta.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e0d0c" },
    { media: "(prefers-color-scheme: light)", color: "#ede6d6" },
  ],
};

const preferencesScript = `try{var d=document.documentElement,t=localStorage.getItem("${THEME_KEY}"),l=localStorage.getItem("${LANGUAGE_KEY}");d.dataset.theme=t==="light"||t==="dark"?t:matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";d.lang=l==="es"||l==="en"?l:navigator.language.toLowerCase().indexOf("es")===0?"es":"en"}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning className={`${gothic.variable} ${mincho.variable} ${serifKorean.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
