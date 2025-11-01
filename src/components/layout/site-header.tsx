import MenuIcon from "../../../public/icons/menu.svg"
import Logo from "../../../public/icons/logo";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
export const SiteHeader = () => {
  return (
<header className="sticky top-0 backdrop-blur-sm bg-white/20  z-[9999]">


<div className="py-5">
  <div className="container mx-auto">
<div className="flex items-center justify-between">
<Image src={'/images/logosaas.png'} alt="sass Logo" height={40} width={40} />
<Image src={'/icons/menu.svg'} alt="menu" width={20} height={20} className="md:hidden" />
<nav className="hidden md:flex gap-6 text-black/60  items-center ">
  <a href="#">About</a>
  <a href="#">Feature</a>
  <a href="#">Customer</a>
  <a href="#">Update</a>
  <a href="#">Help</a>
  <button className="bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex items-center  tracking-tight ">Get For Free</button>
</nav>
</div>
  </div>
</div>
</header>
  )
};