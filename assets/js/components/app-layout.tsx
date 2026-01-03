import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle, ToastProvider } from "./ui";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const isSessionDetails = location.pathname.includes("/sessions/");

  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              {/* Brand and Navigation */}
              <div className="flex items-center space-x-6">
                <Link
                  to="/app"
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <WheelIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Food Captain
                  </h1>
                </Link>

                {/* Navigation breadcrumbs for session details */}
                {isSessionDetails && (
                  <nav className="hidden sm:flex items-center space-x-2 text-sm">
                    <Link
                      to="/app"
                      className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Sessions
                    </Link>
                    <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                      Session Details
                    </span>
                  </nav>
                )}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {title && (
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {title}
                </h2>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
      </div>
    </ToastProvider>
  );
};

const WheelIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg fillRule="evenodd" clipRule="evenOdd" fill="currentColor" className={className} viewBox="0 0 8487 8487" >
    <path d="M4532 1379v229c516 56 987 260 1370 568l171-171c65-138 172-289 311-430 327-330 711-481 857-336s-1 530-328 860c-144 146-300 256-441 322l-162 162c308 384 512 855 568 1370h241c144-52 326-83 524-84 465-2 842 163 843 368 1 206-375 374-840 376-205 1-393-31-539-84h-229c-56 516-260 987-568 1370l171 171c138 65 289 172 430 311 330 327 481 711 336 857s-530-1-860-328c-146-144-256-300-322-441l-162-162c-384 308-855 512-1370 568v241c52 144 83 326 84 524 2 465-163 842-368 843-206 1-374-375-376-840-1-205 31-393 84-539v-229c-516-56-987-260-1370-568l-171 171c-65 138-172 289-311 430-327 330-711 481-857 336s1-530 328-860c144-146 300-256 441-322l162-162c-308-384-512-855-568-1370h-241c-144 52-326 83-524 84-465 2-842-163-843-368-1-206 375-374 840-376 205-1 393 31 539 84h229c56-516 260-987 568-1370l-171-171c-138-65-289-172-430-311-330-327-481-711-336-857s530 1 860 328c146 144 256 300 322 441l162 162c384-308 855-512 1370-568v-241c-52-144-83-326-84-524-2-465 163-842 368-843 206-1 374 375 376 840 1 205-31 393-84 539m-289 359c1384 0 2506 1122 2506 2506S5627 6750 4243 6750 1737 5628 1737 4244s1122-2506 2506-2506m0 94c1332 0 2412 1080 2412 2412S5575 6656 4243 6656 1831 5576 1831 4244s1080-2412 2412-2412m289 543v903c67 20 131 46 191 79l638-638c-240-176-522-297-829-344m1237 752-638 638c33 60 59 124 79 191h903c-47-307-168-589-344-829m344 1406h-903c-20 67-46 131-79 191l638 638c176-240 297-522 344-829m-752 1237-638-638c-60 33-124 59-191 79v903c307-47 589-168 829-344m-1406 344v-903c-67-20-131-46-191-79l-638 638c240 176 522 297 829 344m-1237-752 638-638c-33-60-59-124-79-191h-903c47 307 168 589 344 829m-344-1406h903c20-67 46-131 79-191l-638-638c-176 240-297 522-344 829m752-1237 638 638c60-33 124-59 191-79v-903c-307 47-589 168-829 344m1117 760c423 0 766 343 766 766s-343 766-766 766-766-343-766-766 343-766 766-766m0 115c360 0 652 292 652 652s-292 652-652 652-652-292-652-652 292-652 652-652"/>
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);
