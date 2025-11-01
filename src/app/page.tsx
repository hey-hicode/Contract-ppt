
import { Metadata } from "next";
import AboutSectionTwo from "~/components/About/AboutSectionTwo";
import Blog from "~/components/Blog";
import Brands from "~/components/Brands";
import Contact from "~/components/Contact";
import Features from "~/components/Features";
import Hero from "~/components/Hero";
import Pricing from "~/components/Pricing";
import ScrollUp from "~/components/shared/ScrollUp";
import Testimonials from "~/components/Testimonials";
import Video from "~/components/Video";

export const metadata: Metadata = {
  title: "Free Next.js Template for Startup and SaaS",
  description: "This is Home for Startup Nextjs Template",
  // other metadata
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <Video />
      <Brands />
      <AboutSectionTwo />
      <Testimonials />
      <Pricing />
      <Blog />
      <Contact />
    </>
  );
}
