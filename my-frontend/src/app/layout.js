
import "./globals.css";
import Navbar from './components/Navbar';


export const metadata = {
  title: "CervCare - AI Health System",
  description: "Advanced AI-powered health management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
