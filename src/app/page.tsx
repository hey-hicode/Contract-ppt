
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import AboutSectionTwo from "~/components/About/AboutSectionTwo";
import Brands from "~/components/Brands";
import FAQ from "~/components/FAQ";
import Features from "~/components/Features";
import Hero from "~/components/Hero";
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

import ScrollReveal from "~/components/shared/ScrollReveal";

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

      <ScrollReveal>
        <Features />
      </ScrollReveal>

      <ScrollReveal>
        <Video />
      </ScrollReveal>

      <ScrollReveal>
        <Brands />
      </ScrollReveal>

      <ScrollReveal>
        <AboutSectionTwo />
      </ScrollReveal>

      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>

      <FAQ />
      <PricingClient currentPlan={currentPlan} />
    </>
  );
}
