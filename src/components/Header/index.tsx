"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton, SignUpButton } from "@clerk/nextjs";
import { Menu, X, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";

const Header = () => {
  const lenis = useLenis();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => setNavbarOpen(!navbarOpen);

  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    setSticky(window.scrollY >= 30);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    lenis?.scrollTo(`#${id.toLowerCase()}`, {
      offset: -100,
      duration: 1.5,
    });
    if (navbarOpen) setNavbarOpen(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => window.removeEventListener("scroll", handleStickyNavbar);
  }, []);

  const usePathName = usePathname();

  return (
    <>
      <header
        className={`header fixed top-6 left-1/2 -translate-x-1/2 w-[95%]  max-w-[1000px] z-50 transition-all duration-300 ${sticky
          ? "py-2"
          : "py-4"
          }`}
      >
        <div className={`mx-auto px-6 py-2 md:py-3 md:h-20 rounded-full transition-all backdrop-blur-sm duration-300 true-glass ${sticky ? "shadow-xl" : "shadow-lg"}`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <Image
                  src="/images/logo/Counselor.png"
                  alt="logo"
                  width={140}
                  height={40}
                  className=" "
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {["Features", "Pricing", "Testimonials"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => scrollToSection(e, item)}
                  scroll={false}
                  className="text-sm font-medium transition-all hover:text-primary text-dark dark:text-white/80"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center gap-6">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-2xl font-bold transition-all active:scale-95 text-sm shadow-md shadow-primary/20">
                    Get Started
                  </button>

                </SignUpButton>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "h-9 w-9 ring-2 ring-white dark:ring-white/10 shadow-md",
                    },
                  }}
                />
              </SignedOut>



            </div>

            {/* Mobile Toggle */}
            <button
              onClick={navbarToggleHandler}
              className="lg:hidden p-2 text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Side Drawer */}
      <AnimatePresence>
        {navbarOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={navbarToggleHandler}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 left-0 h-full w-[280px] bg-white dark:bg-dark shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-white/10 bg-white dark:bg-dark">
                <Link href="/" className="block">
                  <Image
                    src="/images/logo/Counselor.png"
                    alt="logo"
                    width={120}
                    height={30}
                    className=""
                  />
                </Link>
                <button
                  onClick={navbarToggleHandler}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-dark">

                <div className="space-y-1">
                  {["Features", "Video", "Brands", "About", "Testimonials"].map((item) => (
                    <Link
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      onClick={(e) => scrollToSection(e, item)}
                      scroll={false}
                      className="flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <span>{item}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#1d2430]">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                      Get Started
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-3xl">
                    <div className="flex items-center gap-3">
                      <UserButton />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold truncate max-w-[120px] dark:text-white">Account</span>
                        <span className="text-[10px] text-gray-500">Premium Plan</span>
                      </div>
                    </div>
                    <Link href="/dashboard" className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm hover:scale-105 transition-transform">
                      <LayoutGrid size={20} className="text-primary" />
                    </Link>
                  </div>
                </SignedIn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
