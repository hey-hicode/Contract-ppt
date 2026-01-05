
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import AboutSectionTwo from "~/components/About/AboutSectionTwo";
import Blog from "~/components/Blog";
import Brands from "~/components/Brands";
import Contact from "~/components/Contact";
import Features from "~/components/Features";
import Hero from "~/components/Hero";
import Pricing from "~/components/Pricing";
import PricingClient from "~/components/Pricing/PricingClient";
import ScrollUp from "~/components/shared/ScrollUp";
import Testimonials from "~/components/Testimonials";
import Video from "~/components/Video";
import { supabase } from "~/lib/supabaseClient";

// export const metadata: Metadata = {
//   title: "Counselr",
//   description: "Counselr is a platform that helps creators, freelancers, and influencers analyze their contracts with AI.",
//   // other metadata
// };

export default async function Home() {
  const { userId } = await auth();

  let currentPlan: "free" | "premium" | "enterprise" = "free";

  if (userId) {
    const { data } = await supabase
      .from("user_plans")
      .select("plan")
      .eq("clerk_user_id", userId)
      .single();

    if (data?.plan) currentPlan = data.plan;
  }
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <Video />
      <Brands />
      <AboutSectionTwo />
      <Testimonials />
      <PricingClient currentPlan={currentPlan} />
      {/* <Pricing /> */}
      {/* <Blog /> */}
      {/* <Contact /> */}
    </>
  );
}
