import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Gallery from '@/components/ui/Gallery';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-sans overflow-x-hidden">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 w-full max-w-[100vw] mx-auto overflow-x-hidden">
            {children}
          </main>
          <Gallery />
          <Footer />
        </div>
      </body>
    </html>
  );
}