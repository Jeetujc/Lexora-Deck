// app/layout.jsx
// 'use client'
export const metadata = {
    title: 'API Backend',
    description: 'Next.js API',
  };
  
  export default function RootLayout({ children }) {
    return <html><body>{children}</body></html>;
  }
  