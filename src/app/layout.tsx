import Script from "next/script";
import ScrollToTop from "@/components/ScrollToTop";
import { Providers } from "./providers";
import HeaderFooter from "@/components/HeaderFooter";
import RecurringChargeRunner from "@/components/RecurringChargeRunner";
import "../styles/index.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link rel="icon" href="/images/logo/1.png" type="image/png" />
      </head>

      <body className="bg-[#FCFCFC] font-sans">
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
        <Providers>
          <RecurringChargeRunner />
          <div className="isolate">
            <HeaderFooter>{children}</HeaderFooter>
          </div>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

