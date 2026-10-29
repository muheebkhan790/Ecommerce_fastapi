import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ToastNotification from "./components/ui/ToastNotification";
import CartDrawer from "./components/ui/CartDrawer";

export const metadata = {
  title: "NEXSTORE | Modern Interactive E-Commerce Platform",
  description: "High-performance fullstack marketplace with rich interactive light & dark experiences powered by FastAPI and Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (saved === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-orange-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <div className="flex-1 flex flex-col">{children}</div>
              <Footer />
              <CartDrawer />
              <ToastNotification />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
