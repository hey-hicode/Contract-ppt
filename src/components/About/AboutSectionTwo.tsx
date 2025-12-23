import SectionTitle from "../shared/SectionTitle";

const AboutSectionTwo = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap ">
          <div className="w-full px-4 lg:w-1/2">
            <SectionTitle

              title="Legal Counsel Without Leaving Your Work.
"
              paragraph="Every stage is deterministic and auditable—from parsing logs to counsel-enriched analysis, all in one shared dashboard. "
            />
          </div>
          <div className="w-full px-4 lg:w-1/2">
            <div className="max-w-[470px]">
              <div className="mb-6 border py-6 px-6 rounded-2xl">
                <h3 className="mb-4 text-xl font-medium text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Upload Your Contract
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Securely upload your PDF, DOCX, or TXT legal document in seconds.
                </p>
              </div>
              <div className="mb-6 border py-6 px-6 rounded-2xl">
                <h3 className="mb-4 text-xl font-medium text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Counselr Analysis
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Your Counselr scans every clause, identifying potential risks and key terms.
                </p>
              </div>
              <div className="mb-6 border py-6 px-6 rounded-2xl">
                <h3 className="mb-4 text-xl font-medium text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Get Insights
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Receive a comprehensive report with red flags, summaries, and recommendations
                </p>
              </div>
              <div className="mb-6 border py-6 px-6 rounded-2xl">
                <h3 className="mb-4 text-xl font-medium text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Act with Confidence
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Use our actionable advice to negotiate better terms and finalize agreements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;
