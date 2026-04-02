import { useRef, useEffect } from "react";
import Sidebar from "../components/SideBar/SideBar";
import { Outlet, useLocation } from "react-router-dom";

interface DashBoardLayoutProps {
  logo: string;
}

const DashBoardLayout = ({ logo }: DashBoardLayoutProps) => {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // Reset ALL scroll positions on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [pathname]);

  const layoutRef = useRef<HTMLDivElement>(null);

  // Prevent the overflow-hidden layout div from being programmatically scrolled
  useEffect(() => {
    const layoutEl = layoutRef.current;
    if (!layoutEl) return;
    const preventScroll = () => {
      if (layoutEl.scrollTop !== 0) {
        layoutEl.scrollTop = 0;
      }
      if (layoutEl.scrollLeft !== 0) {
        layoutEl.scrollLeft = 0;
      }
    };
    layoutEl.addEventListener('scroll', preventScroll);
    return () => layoutEl.removeEventListener('scroll', preventScroll);
  }, []);

  return (
    <div ref={layoutRef} className="flex h-screen pt-4 px-4 pb-0 bg-[#F5F6F8] dark:bg-dark-bg overflow-hidden">
      <Sidebar logo={logo} />
      <main ref={mainRef} className="flex-1 bg-white dark:bg-dark-surface ms-4 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 min-w-0 max-w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default DashBoardLayout;
