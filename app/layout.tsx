import type { Metadata } from "next";
import { Cormorant_Garamond, Lora, Jost } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import AuthInitializer from "./components/AuthInitializer";
// import AuthInitializer from "@/components/AuthInitializer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Eleje Legacy — Nurturing Growth · Sustaining Legacies",
  description:
    "Eleje Legacy empowers mothers, protects children, and builds communities that thrive — not just today, but across generations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${lora.variable} ${jost.variable}`}
        style={{ fontFamily: "var(--font-jost), system-ui, sans-serif", fontWeight: 300 }}
      >
        {/* Silently re-hydrates the user on hard reload if previously authed */}
        {/* <AuthInitializer /> */}

        {/* Silently re-hydrates the user on hard reload if previously authed */}
        {/* <AuthInitializer /> */}
        <Nav />
        <main className="pt-[68px] min-h-[calc(80vh)]">{children}</main>
        <Footer />

        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          // Match your brand — swap for your emerald colour
          style={{ fontFamily: "var(--font-jost), system-ui, sans-serif" }}
        />
      </body>
    </html>
  );
}