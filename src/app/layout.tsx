import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hyperfocus Universe — The Living Hub',
  description:
    'Every repository is a world. Find your brightest active planet and the quest waiting on it.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a href="#universe" className="skip-link">
          Skip to worlds
        </a>
        <div
          className="starfield pointer-events-none fixed inset-0 -z-10 opacity-60"
          aria-hidden="true"
        />
        {children}
      </body>
    </html>
  );
}
