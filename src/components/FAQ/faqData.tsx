export interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        id: 1,
        question: "What is Counselr?",
        answer:
            "Counselr is an AI-powered platform that helps you analyze, track, and understand your contracts with ease. We use advanced LLMs to break down complex legal jargon into actionable insights.",
    },
    {
        id: 2,
        question: "Is Counselr a replacement for a lawyer or legal advice?",
        answer:
            "No, Counselr is not a replacement for a lawyer or legal advice. It is an AI-powered tool designed to help users better understand their contracts by summarizing key terms and highlighting potential risks and opportunities. However, it does not provide legal recommendations, draft contracts, or offer legal representation. We always recommend consulting a qualified legal professional for legal advice.",
    },
    {
        id: 3,
        question: "How does the Counselr work?",
        answer:
            "Counselt scans your uploaded documents to identify key terms, risks, and obligations. It provides a clear summary, identifies potentially predatory clauses, and suggests improvements to protect your interests.",
    },
    {
        id: 4,
        question: "Do I need legal knowledge to use Counselr?",
        answer:
            "No, Counselr is designed to be user-friendly and accessible to everyone, regardless of their legal background. It simplifies contract language so users can make informed decisions.",
    },
    {
        id: 5,
        question: "Is my data secure?",
        answer:
            "Yes, we take security seriously. Your documents are encrypted at rest and in transit. We use secure subprocessors and do not share your sensitive data with third parties or use it to train public models without your consent.",
    },
    {
        id: 6,
        question: "What file formats are supported?",
        answer:
            "We currently support PDF format for all users. Plus and Enterprise users also get support for Docx and other common document formats.",
    },
    {
        id: 7,
        question: "Can I use Counselr for free?",
        answer:
            "Yes, we offer a free plan that includes 3 contract analyses per month. This allows you to experience the power of Counselr before committing to a paid plan.",
    },
    {
        id: 8,
        question: "How long does a contract analysis take?",
        answer:
            "Most analyses are completed in under 60 seconds. Larger documents (50+ pages) may take up to 2 minutes as our AI performs a deep scan of every clause.",
    },
    {
        id: 9,
        question: "What should I do if Counselr finds a 'Red Flag'?",
        answer:
            "A 'Red Flag' indicates a clause that sits outside of industry standards or carries high risk. We recommend using our 'AI Chat' to ask specific questions about that clause or consulting with a legal professional before signing.",
    },
    {
        id: 10,
        question: "Does Counselr support multiple languages?",
        answer:
            "Currently, Counselr is optimized for English-language contracts. We are actively working on supporting Spanish, French, and German in the coming months.",
    },
];

export default faqData;
