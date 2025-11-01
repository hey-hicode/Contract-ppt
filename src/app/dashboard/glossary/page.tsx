"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";

type GlossaryTerm = {
  title: string;
  category: string;
  description: string;
};

const TERMS: GlossaryTerm[] = [
  {
    title: "Indemnification",
    category: "Liability",
    description:
      "A clause that transfers risk between parties. One party agrees to compensate the other for certain damages, losses, or liabilities that may arise from the contract.",
  },
  {
    title: "Force Majeure",
    category: "Risk",
    description:
      "A contract provision that frees both parties from liability or obligation when an extraordinary event or circumstance beyond their control prevents them from fulfilling obligations.",
  },
  {
    title: "Material Breach",
    category: "Breach",
    description:
      "A significant violation of contract terms that goes to the heart of the agreement and may allow termination and damages.",
  },
  {
    title: "Cure Period",
    category: "Remedies",
    description:
      "A specified time period given to a party to fix or remedy a contract violation before termination or other penalties apply.",
  },
  {
    title: "Severability",
    category: "General",
    description:
      "Ensures that if one clause of the contract is found invalid, the remainder of the agreement continues to be enforceable.",
  },
  {
    title: "Liquidated Damages",
    category: "Damages",
    description:
      "Pre-agreed financial compensation for specific breaches where calculating actual damages would be difficult.",
  },
];

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(TERMS.map((t) => t.category)));
    return ["All", ...cats];
  }, []);

  const filteredTerms = useMemo(() => {
    return TERMS.filter((t) => {
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <div>
               <h1 className='text-2xl font-medium tracking-tight'>
Legal Glossary</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Common legal terms explained in plain language
      </p>

      {/* Search */}
      <div className="mt-8  mb-4 flex items-center gap-2 rounded-md border border-white/10 bg-white dark:bg-gray-dark px-3 py-2 shadow">
        <Search size={20} className="text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms..."
          className="w-full py-2 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`rounded-full border font-medium px-4 py-2  text-xs ${
              activeCategory === c
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-gray-dark border-white/10 text-slate-700 dark:text-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

  

      {/* Cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredTerms.map((t) => (
          <div key={t.title} className="rounded-md border border-white/10 bg-white dark:bg-gray-dark p-5 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <BookOpen size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{t.title}</h3>
                  <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {t.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}