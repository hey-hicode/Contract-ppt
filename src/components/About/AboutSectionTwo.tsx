"use client";
import SectionTitle from "../shared/SectionTitle";
import { motion } from "framer-motion";

const AboutSectionTwo = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap ">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full px-4 lg:w-1/2"
          >
            <SectionTitle
              title="Legal Counsel Without Leaving Your Work."
              paragraph="Every stage is deterministic and auditable—from parsing logs to counsel-enriched analysis, all in one shared dashboard. "
            />
          </motion.div>
          <div className="w-full px-4 lg:w-1/2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                  },
                },
              }}
              className="max-w-[470px]"
            >
              {[
                {
                  title: "Upload Your Contract",
                  text: "Securely upload your PDF, DOCX, or TXT legal document in seconds.",
                },
                {
                  title: "Counselr Analysis",
                  text: "Your Counselr scans every clause, identifying potential risks and key terms.",
                },
                {
                  title: "Get Insights",
                  text: "Receive a comprehensive report with red flags, summaries, and recommendations",
                },
                {
                  title: "Act with Confidence",
                  text: "Use our actionable advice to negotiate better terms and finalize agreements.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="mb-6 border py-6 px-6 rounded-2xl"
                >
                  <h3 className="mb-4 text-xl font-medium text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    {item.title}
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;
