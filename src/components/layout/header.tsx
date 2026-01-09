// import Logo from "@/assets/logosaas.png"

import Logo from "../../../public/icons/logo";

export const Header = () => {
  return (
    <header className="sticky top-0  bg-[#FFFFFF]/20 backdrop-blur-sm z-[9999]">


      <div className="py-5 container mx-auto">
        <div className="container">
          <div className="flex items-center justify-between">
            {/* <MenuIcon className="h-5 w-5 md:hidden" /> */}
            <nav className="hidden md:flex gap-16 text-white items-center ">

              <Logo />
              <div className="inline-flex gap-8">
                <a href="#">About</a>
                <a href="#">Feature</a>
                <a href="#">Customer</a>
                <a href="#">Update</a>
                <a href="#">Help</a>
              </div>
            </nav>
            <nav className="hidden md:flex gap-6 text-black/60  items-center ">

              <button className="bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex items-center  tracking-tight ">Get For Free</button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
};