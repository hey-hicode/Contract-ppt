"use client";

import { useMemo, useState } from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

type GlossaryTerm = {
  title: string;
  category: string;
  description: string;
};

const TERMS: GlossaryTerm[] = [
  // Legal Terms
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
  // Network/Security Terms from template
  {
    title: "*(star) Integrity Property",
    category: "Security",
    description:
      "An axiom of the Biba model that states that a subject at a specific classification level cannot write data.",
  },
  {
    title: "*(star) Security Property",
    category: "Security",
    description:
      "A property of the Bell-LaPadula model that states that a subject at a specific classification level cannot write data to a lower classification level. This is often shortened to \"no write down.\"",
  },
  {
    title: "1000Base-T",
    category: "Network",
    description:
      "A form of twisted-pair cable that supports 1000 Mbps or 1 Gbps throughput at 100 meter distances. Often called Gigabit Ethernet.",
  },
  {
    title: "100Base-TX",
    category: "Network",
    description:
      "A network that interconnects various computer networks and mainframe computers in an enterprise. The backbone provides the structure through which computers communicate.",
  },
  {
    title: "10Base-T",
    category: "Network",
    description:
      "A type of network cable that consists of four pairs of wires that are twisted around each other and then sheathed in a PVC insulator. Also called twisted-pair.",
  },
  {
    title: "10Base2",
    category: "Network",
    description:
      "A type of coaxial cable. Often used to connect systems to backbone trunks. 10Base2 has a maximum span of 185 meters with maximum throughput of 10 Mbps. Also called thinnet.",
  },
  {
    title: "10Base5",
    category: "Network",
    description:
      "A type of coaxial cable. Often used as a network's backbone. 10Base5 has a maximum span of 500 meters with maximum throughput of 10 Mbps. Also called thicknet.",
  },
  {
    title: "802.11",
    category: "Network",
    description:
      "Family of IEEE standards for wireless LANs first introduced in 1997. The first standard to be implemented, 802.11b, specifies from 1 to 11 Mbps in the unlicensed band using DSSS (direct sequence spread spectr...",
  },
  {
    title: "802.11i (WPA-2)",
    category: "Network",
    description:
      "An amendment to the 802.11 standard that defines a new authentication and encryption technique that is similar to IPsec. To date, no real-world attack has compromised a properly configured WPA-2 wireless netw...",
  },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string>("All");

  const filteredTerms = useMemo(() => {
    return TERMS.filter((t) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);

      const firstChar = t.title.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase();
      const isNumOrSpecial = !/[A-Z]/.test(firstChar);
      const matchesLetter =
        activeLetter === "All" ||
        (activeLetter === "#" ? isNumOrSpecial : firstChar === activeLetter);

      return matchesLetter && matchesQuery;
    });
  }, [activeLetter, query]);

  return (
    <div className="max-w-8xl mx-auto md:px-4 py-6">


      {/* Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">


        <div className="border-b border-stroke-stroke dark:border-stroke-dark  overflow-x-auto ">
          <div className="flex items-center gap-4 min-w-max px-2">
            {["All", ...ALPHABET].map((letter) => (
              <button
                key={letter}
                onClick={() => setActiveLetter(letter)}
                className={`text-sm cursor-pointer font-medium transition-colors hover:text-primary ${activeLetter === letter
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-body-color dark:text-body-color-dark"
                  }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>


        <div className="flex items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-3 pr-10 py-2 border border-stroke-stroke dark:border-stroke-dark rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-dark"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-r-md transition-colors">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Alphabet Filter */}


      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredTerms.map((t, i) => (
          <div
            key={i}
            className="bg-white dark:bg-dark border border-stroke-stroke dark:border-stroke-dark rounded-md p-6 shadow-none transition-shadow"
          >
            <h3 className="text-lg font-bold text-primary mb-3">{t.title}</h3>
            <p className="text-body-color dark:text-body-color-dark text-sm leading-relaxed">
              {t.description}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {/* <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-stroke-stroke dark:border-stroke-dark text-sm text-body-color">
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center gap-1">
            Prev
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${page === 1
                ? "border border-stroke-stroke dark:border-stroke-dark font-bold text-black dark:text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              {page}
            </button>
          ))}
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center gap-1">
            Next
          </button>
        </div>
        <div className="font-medium text-body-color dark:text-body-color-dark">
          Showing {filteredTerms.length} of {TERMS.length}
        </div>
      </div> */}
    </div>
  );
}