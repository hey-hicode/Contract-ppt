"use client";
import { FileText, MoreVertical, Eye, Plus } from "lucide-react";
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

type ContractTableItem = {
  id: string;
  source_title: string | null;
  overall_risk: "low" | "medium" | "high" | null;
  summary: string | null;
  red_flags: unknown[] | null;
  recommendations: string[] | null;

  // ✅ NEW
  deal_parties: string[] | null;
  companies_involved: string[] | null;
  deal_room: string | null;
  playbook: string | null;

  created_at: string;
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

const ContractTable = ({
  items,
  onView,
  visibleColumns = {
    dealparties: true,
    companies: true,
    dealroom: true,
    playbook: true,
  },
  grouping = "none",
}: ContractTableProps) => {
  const router = useRouter();

  const handleView = (id: string) => {
    if (onView) {
      onView(id);
    } else {
      router.push(`/dashboard/contracts/${id}`);
    }
  };

  const getStatusDisplay = (risk: string | null) => {
    if (!risk)
      return {
        label: "Drafting",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };

    const riskLower = risk.toLowerCase();
    if (riskLower === "high")
      return {
        label: "Negotiating",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      }; // Mapped High -> Negotiating
    if (riskLower === "medium")
      return {
        label: "Reviewing",
        className: "bg-purple-50 text-purple-700 border-purple-200",
      }; // Mapped Medium -> Reviewing
    if (riskLower === "low")
      return {
        label: "Signing",
        className: "bg-green-50 text-green-700 border-green-200",
      }; // Mapped Low -> Signing

    return {
      label: "Drafting",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  };

  // Grouping Logic
  const groupedItems = (() => {
    if (grouping === "status") {
      const groups: Record<string, ContractTableItem[]> = {};
      items.forEach((item) => {
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
          <div className="  rounded-2xl flex items-center justify-center mx-auto">
            <NoContract />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-medium">No contracts yet</h3>
            <p className="text-gray-600 ">
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
      <TableRow
        key={contract.id}
        className="hover:bg-gray-50/50 border-b border-gray-100 last:border-0 group transition-colors"
      >
        <TableCell className="px-6 py-4">
          <div className="flex items-center justify-between gap-3 max-w-[300px]">
            <div className="flex items-center gap-3 overflow-hidden">
              <Eye
                className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-gray-600 cursor-pointer"
                onClick={() => handleView(contract.id)}
              />
              <span
                className="text-gray-900 font-medium truncate underline decoration-gray-300 underline-offset-4 cursor-pointer hover:decoration-gray-900 transition-all"
                onClick={() => handleView(contract.id)}
              >
                {contract.source_title || "Untitled Contract"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </TableCell>
        <TableCell className="px-6 py-4">
          <Badge
            variant="outline"
            className={`${status.className} rounded-full px-3 py-0.5 font-normal border`}
          >
            {status.label}
          </Badge>
        </TableCell>
        {visibleColumns.dealparties && (
          <TableCell className="px-6 py-4">
            <div className="flex -space-x-2 overflow-hidden">
              {contract.deal_parties && contract.deal_parties.length > 0 ? (
                <>
                  {contract.deal_parties.slice(0, 2).map((party, i) => (
                    <div
                      key={i}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600"
                      title={party}
                    >
                      {party.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {contract.deal_parties.length > 2 && (
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">
                      +{contract.deal_parties.length - 2}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-gray-400 text-xs">-</span>
              )}
            </div>
          </TableCell>
        )}
        {visibleColumns.companies && (
          <TableCell className="px-6 py-4">
            <span
              className="text-sm text-gray-600 truncate max-w-[150px] block"
              title={contract.companies_involved?.join(", ")}
            >
              {contract.companies_involved?.[0] || "-"}
              {contract.companies_involved &&
                contract.companies_involved.length > 1 &&
                ` +${contract.companies_involved.length - 1}`}
            </span>
          </TableCell>
        )}
        {visibleColumns.dealroom && (
          <TableCell className="px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{contract.deal_room || "Legal"}</span>
            </div>
          </TableCell>
        )}
        {visibleColumns.playbook && (
          <TableCell className="px-6 py-4">
            <span className="text-sm text-gray-600">
              {contract.playbook || "General"}
            </span>
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent border-b border-gray-200">
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4 h-auto">
              Contract Name
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4 h-auto">
              Status
            </TableHead>
            {visibleColumns.dealparties && (
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4 h-auto">
                Dealparties
              </TableHead>
            )}
            {visibleColumns.companies && (
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4 h-auto">
                Companies Involved
              </TableHead>
            )}
            {visibleColumns.dealroom && (
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4 h-auto">
                Dealroom
              </TableHead>
            )}
            {visibleColumns.playbook && (
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4 h-auto">
                Playbook
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedItems
            ? Object.entries(groupedItems).map(([status, groupItems]) => (
                <>
                  <TableRow
                    key={`group-${status}`}
                    className="bg-gray-50/80 hover:bg-gray-50/80"
                  >
                    <TableCell
                      colSpan={
                        2 + Object.values(visibleColumns).filter(Boolean).length
                      }
                      className="px-6 py-2 font-medium text-sm text-gray-700"
                    >
                      {status} ({groupItems.length})
                    </TableCell>
                  </TableRow>
                  {groupItems.map(renderRow)}
                </>
              ))
            : items.map(renderRow)}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractTable;
