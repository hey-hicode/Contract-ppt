"use client";
import { FileText, MoreVertical, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import NoContract from "../ui/icons/no-contract";
import { Badge } from "../ui/badge";
import React from "react";

type ContractTableItem = {
  id: string;
  source_title: string | null;
  overall_risk: "low" | "medium" | "high" | null;
  summary: string | null;
  red_flags: unknown[] | null;
  recommendations: string[] | null;
  created_at: string;
  dealParties?: string[] | null;
  companiesInvolved?: string[] | null;
  dealRoom?: string | null;
  playbook?: string | null;
  clauses?: number | null;
  flags?: number | null;
};

interface ContractTableProps {
  items: ContractTableItem[];
  onView?: (id: string) => void;
  visibleColumns?: {
    dealparties: boolean;
    companies: boolean;
    dealroom: boolean;
    playbook: boolean;
  };
  grouping?: "none" | "status";
}

// Random color palette for avatars
const avatarColors = [
  "bg-blue-200 text-blue-700",
  "bg-purple-200 text-purple-700",
  "bg-pink-200 text-pink-700",
  "bg-green-200 text-green-700",
  "bg-yellow-200 text-yellow-700",
  "bg-indigo-200 text-indigo-700",
  "bg-red-200 text-red-700",
  "bg-teal-200 text-teal-700",
];

const getAvatarColor = (index: number) => {
  return avatarColors[index % avatarColors.length];
};

const ContractTable = ({ items, onView, visibleColumns = { dealparties: true, companies: true, dealroom: true, playbook: true }, grouping = "none" }: ContractTableProps) => {
  const router = useRouter();
  const totalColumns = 4 +
    (visibleColumns.dealparties ? 1 : 0) +
    (visibleColumns.companies ? 1 : 0) +
    (visibleColumns.dealroom ? 1 : 0) +
    (visibleColumns.playbook ? 1 : 0);


  const handleView = (id: string) => {
    if (onView) {
      onView(id);
    } else {
      router.push(`/dashboard/contracts/${id}`);
    }
  };

  const getStatusDisplay = (risk: string | null) => {
    if (!risk) return { label: "Drafting", className: "bg-blue-50 text-blue-700 border-blue-200" };

    const riskLower = risk.toLowerCase();
    if (riskLower === "high") return { label: "high", className: "bg-red-100 text-red-700 border-red-200" };
    if (riskLower === "medium") return { label: "medium", className: "bg-orange-100 text-orange-700 border-orange-200" };
    if (riskLower === "low") return { label: "low", className: "bg-green-100 text-green-700 border-green-200" };

    return { label: "Drafting", className: "bg-blue-50 text-blue-700 border-blue-200" };
  };

  // Grouping Logic
  const groupedItems = (() => {
    if (grouping === "status") {
      const groups: Record<string, ContractTableItem[]> = {};
      items.forEach(item => {
        const status = getStatusDisplay(item.overall_risk).label;
        if (!groups[status]) groups[status] = [];
        groups[status].push(item);
      });
      return groups;
    }
    return null;
  })();

  if (items.length === 0) {
    return (
      <Card className="border-none border border-gray-500 !shadow-none bg-white rounded-md p-12">
        <div className="text-center space-y-4">
          <div className="rounded-2xl flex items-center justify-center mx-auto">
            <NoContract />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-medium">No contracts yet</h3>
            <p className="text-gray-600">
              Upload your first contract to get started
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const renderRow = (contract: ContractTableItem) => {
    const status = getStatusDisplay(contract.overall_risk);
    return (
      <TableRow key={contract.id} className="hover:bg-gray-50/50  border-b border-gray-100 last:border-0 group transition-colors">
        <TableCell className="px-6 py-4">
          <div className="flex items-center justify-between gap-3 max-w-[300px]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center shrink-0 cursor-pointer" onClick={() => handleView(contract.id)}>
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-gray-900 font-medium truncate underline decoration-gray-300 underline-offset-4 cursor-pointer inline-block max-w-[150px] hover:decoration-gray-900 transition-all" onClick={() => handleView(contract.id)}>
                {contract.source_title || "Untitled Contract"}
              </span>
            </div>

          </div>
        </TableCell>
        <TableCell className="px-6 py-4">
          <Badge variant="outline" className={`${status.className} rounded-full px-3 py-0.5 font-normal border`}>
            {status.label}
          </Badge>
        </TableCell>
        <TableCell className="px-6 py-4">
          <span className="text-sm text-gray-600">{contract.clauses ?? 0}</span>
        </TableCell>
        <TableCell className="px-6 py-4">
          <span className="text-sm text-gray-600">{contract.flags ?? 0}</span>
        </TableCell>
        {visibleColumns.dealparties && (
          <TableCell className="px-6 py-4">
            <div className="flex flex-wrap gap-1.5">
              {contract.dealParties && contract.dealParties.length > 0 ? (
                <>
                  {contract.dealParties.map((party, i) => (
                    <div
                      key={i}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${getAvatarColor(i)}`}
                      title={party}
                    >
                      <div className="w-4 h-4 rounded-full bg-white/50 flex items-center justify-center text-[8px] font-bold">
                        {party.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[80px]">{party}</span>
                    </div>
                  ))}
                </>
              ) : (
                <span className="text-gray-400 text-xs">-</span>
              )}
            </div>
          </TableCell>
        )}
        {visibleColumns.companies && (
          <TableCell className="px-6 py-4">
            <span className="text-sm text-gray-600 truncate max-w-[120px] inline-block" title={contract.companiesInvolved?.join(", ")}>
              {contract.companiesInvolved?.[0] || "-"}
              {contract.companiesInvolved && contract.companiesInvolved.length > 1 && ` +${contract.companiesInvolved.length - 1}`}
            </span>
          </TableCell>
        )}
        {visibleColumns.dealroom && (
          <TableCell className="px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{contract.dealRoom || "Legal"}</span>
            </div>
          </TableCell>
        )}
        {visibleColumns.playbook && (
          <TableCell className="px-6 py-4">
            <span className="text-sm text-gray-600">{contract.playbook || "General"}</span>
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 ">
        {items.map((contract) => {
          const status = getStatusDisplay(contract.overall_risk);
          return (
            <Card key={contract.id} className="border border-gray-200 shadow-none mb-2 bg-white shadow-none p-4 cursor-pointer" onClick={() => handleView(contract.id)}>
              <div className="flex items-start justify-between ">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium max-w-[150px] text-gray-900 truncate">
                    {contract.source_title || "Untitled Contract"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(contract.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <Badge variant="outline" className={`${status.className} rounded-full px-2 py-0.5 text-xs font-normal border ml-2`}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-1.5">
                {contract.dealParties && contract.dealParties.length > 0 ? (
                  <>
                    {contract.dealParties.map((party, i) => (
                      <div
                        key={i}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${getAvatarColor(i)}`}
                        title={party}
                      >
                        <div className="w-4 h-4 rounded-full bg-white/50 flex items-center justify-center text-[8px] font-bold">
                          {party.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[80px]">{party}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block w-full max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <Table className="w-full table-fixed min-w-[1000px]">
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[15%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </colgroup>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              <TableHead className="px-6 py-4 h-auto text-xs font-semibold uppercase tracking-wider text-gray-500">
                Contract Name
              </TableHead>
              <TableHead className="px-6 py-4 h-auto text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 h-auto text-xs font-semibold uppercase tracking-wider text-gray-500">
                Clauses
              </TableHead>
              <TableHead className="px-6 py-4 h-auto text-xs font-semibold uppercase tracking-wider text-gray-500">
                Flags
              </TableHead>

              {visibleColumns.dealparties && (
                <TableHead className="px-6 py-4 h-auto text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Dealparties
                </TableHead>
              )}
              {visibleColumns.companies && (
                <TableHead className="px-6 py-4 h-auto text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Companies Involved
                </TableHead>
              )}
              {visibleColumns.dealroom && (
                <TableHead className="px-6 py-4 h-auto text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Dealroom
                </TableHead>
              )}
              {visibleColumns.playbook && (
                <TableHead className="px-6 py-4 h-auto text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Playbook
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {groupedItems
              ? Object.entries(groupedItems).map(([status, groupItems]) => (
                <React.Fragment key={status}>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableCell colSpan={totalColumns} className="px-6 py-2 text-sm font-medium text-gray-700">
                      {status} ({groupItems.length})
                    </TableCell>
                  </TableRow>

                  {groupItems.map(renderRow)}
                </React.Fragment>
              ))
              : items.map(renderRow)}
          </TableBody>
        </Table>
      </div>

    </>
  );
};

export default ContractTable;
