import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  logo: string;
  className?: string;
}

export default function Layout({ children, logo, className = "" }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <nav className="flex-shrink-0 bg-white pt-3 px-4 pb-3 drop-shadow-md">
        <div className="lg:max-w-screen-2xl max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="text-gray-800">
            <img src={logo} alt="Logo" className="w-10 mx-auto" />
          </div>
        </div>
      </nav>

      <main className={`flex-1 flex justify-center items-center overflow-y-auto bg-white`}>
        <div className={`w-full max-w-sm p-4 rounded-md ${className}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
