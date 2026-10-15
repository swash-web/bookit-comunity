import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "BOOKIT — Services, products & rentals.",
  description: "Discover trusted local services, products for sale, and useful items to rent in Buea, Cameroon."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header />{children}<Footer /></body></html>;
}
