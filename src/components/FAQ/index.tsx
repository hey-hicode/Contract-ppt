"use client";
import { useState } from "react";
import SectionTitle from "../shared/SectionTitle";
import faqData from "./faqData";
import { motion, AnimatePresence } from "framer-motion";

const SingleFAQ = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className=" w-full rounded-sm bg-white p-4 shadow-none border-b border-gray-200 dark:bg-dark dark:shadow-none sm:p-8 lg:px-6 xl:px-8">
            <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-sm font-medium text-black dark:text-white sm:text-2xl l xl:text-2xl">
                    {question}
                </h3>
                <span
                    className={`ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-primary text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                >
                    <svg
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10.59 0.589844L6 5.16984L1.41 0.589844L0 1.99984L6 7.99984L12 1.99984L10.59 0.589844Z"
                            fill="currentColor"
                        />
                    </svg>
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="mt-4 text-base font-medium leading-relaxed text-body-color dark:text-body-color-dark">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    return (
        <section id="faq" className="relative z-10 py-16 md:py-20 lg:py-28">
            <div className="container">
                <SectionTitle
                    title="Frequently Asked Questions"
                    paragraph="Find answers to common questions about Counselr and how we can help you navigate your contracts."
                    center
                    width="665px"
                />

                <div className="mx-auto max-w-[1000px]">
                    {faqData.map((faq) => (
                        <SingleFAQ key={faq.id} {...faq} />
                    ))}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 z-[-1] opacity-30 dark:opacity-10">
                <svg
                    width="239"
                    height="601"
                    viewBox="0 0 239 601"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        opacity="0.3"
                        x="-184.451"
                        y="600.973"
                        width="196"
                        height="541.607"
                        rx="2"
                        transform="rotate(-128.7 -184.451 600.973)"
                        fill="url(#paint0_linear_faq)"
                    />
                    <defs>
                        <linearGradient
                            id="paint0_linear_faq"
                            x1="-90.1184"
                            y1="420.414"
                            x2="-90.1184"
                            y2="1131.65"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#4A6CF7" />
                            <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </section>
    );
};

export default FAQ;
