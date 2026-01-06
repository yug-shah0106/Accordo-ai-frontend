import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  logo: string;
  className?: string;
}

export default function Layout({ children, logo, className = "" }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white pt-4 px-4 pb-0 drop-shadow-[0_35px_35px_rgba(0,0,0,0.10)] shadow-lg">
        <div className="lg:max-w-screen-2xl max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="text-gray-800">
            <img src={logo} alt="Logo" className="w-10 mx-auto" />
          </div>
        </div>
      </nav>

      <main className={`flex-1 flex justify-center bg-white `}>
        <div className={`w-full max-w-sm p-6 rounded-md ${className}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
