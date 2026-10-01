import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';
import { NotificationBell } from '@/components/NotificationBell';
import ToastNotifications from '@/components/ToastNotifications';
import PushNotificationSetup from '@/components/PushNotificationSetup';
import Navbar from '@/components/Navbar';
import './globals.css';
import { UserSync } from '@/components/UserSync';
import type { Metadata } from 'next';
import AutoRefresh from '@/components/AutoRefresh';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'TheCode Academy - Learn to Code with AI',
  description: 'Join thousands of developers learning to code with AI-powered reviews, coding challenges, and squad collaboration.',
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
  openGraph: {
    title: 'TheCode Academy',
    description: 'Learn to code with AI-powered reviews and squad collaboration',
    type: 'website',
    locale: 'en_US',
    siteName: 'TheCode Academy',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-black text-white antialiased">
       <ClerkProvider>
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
    <Navbar />
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
    <NotificationBell />
    <UserSync />
    <ToastNotifications />
    <PushNotificationSetup />
    <AutoRefresh />
  </ThemeProvider>
</ClerkProvider>
      </body>
    </html>
  );
}