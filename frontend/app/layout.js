// frontend/src/app/layout.js
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'DUNIA Parapharmacie | Clinical Luxury',
  description: 'Precision meets indulgence in every drop.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet" />
        {/* Material Symbols Outlined Icon Pack */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-body-md antialiased overflow-x-hidden selection:bg-primary-fixed selection:text-primary">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}