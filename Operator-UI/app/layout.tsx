import "@/app/styles/global.css";
import { inter } from "@/app/styles/fonts";
import { ReactQueryProvider } from "@/app/providers"; // Import the provider

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
