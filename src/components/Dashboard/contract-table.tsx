import { FileText, AlertTriangle, CheckCircle2, MoreVertical } from "lucide-react";
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

type ContractTableItem = {
  id: string;
  source_title: string | null;
  overall_risk: "low" | "medium" | "high" | null;
  summary: string | null;
  red_flags: unknown[] | null;
  recommendations: string[] | null;
  created_at: string;
};

interface ContractTableProps {
  items: ContractTableItem[];
}

const ContractTable = ({ items }: ContractTableProps) => {
  const getRiskDisplay = (risk: string | null) => {
    if (!risk)
      return {
        level: "Unknown",
        color: "bg-gray-100 text-gray-700 border-gray-200",
      };

    const riskLower = risk.toLowerCase();
    if (riskLower === "high") {
      return { level: "High", color: "bg-red-100 text-red-700 border-red-200" };
    }
    if (riskLower === "medium") {
      return {
        level: "Medium",
        color: "bg-orange-100 text-orange-700 border-orange-200",
      };
    }
    if (riskLower === "low") {
      return {
        level: "Low",
        color: "bg-green-100 text-green-700 border-green-200",
      };
    }
    return {
      level: "Unknown",
      color: "bg-gray-100 text-gray-700 border-gray-200",
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRedFlagsCount = (redFlags: unknown[] | null) => {
    if (!redFlags || !Array.isArray(redFlags)) return 0;
    return redFlags.length;
  };

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

  return (
    <Card className="border-none shadow-sm bg-white rounded-md">
      {/* Desktop / Tablet table view */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold px-4">File Name</TableHead>
              <TableHead className="font-semibold px-4">Date Uploaded</TableHead>
              <TableHead className="font-semibold px-4">Risk Level</TableHead>
              <TableHead className="font-semibold px-4">Red Flags</TableHead>
              <TableHead className="font-semibold text-right px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((contract) => {
              const riskDisplay = getRiskDisplay(contract.overall_risk);
              const redFlagsCount = getRedFlagsCount(contract.red_flags);

              return (
                <TableRow key={contract.id} className="hover:bg-gray-50 px-4">
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-[#E3F2FD] rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-900 truncate font-medium">
                        {contract.source_title || "Untitled Contract"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 whitespace-nowrap">
                    {formatDate(contract.created_at)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`${riskDisplay.color} inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium`}
                    >
                      {riskDisplay.level}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {redFlagsCount > 0 ? (
                        <>
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                          <span className="text-gray-900">{redFlagsCount}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-gray-900">None</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {/* Mobile card view */}
      <div className="block sm:hidden">
        <ul className="space-y-3 p-2">
          {items.map((contract) => {
            const riskDisplay = getRiskDisplay(contract.overall_risk);
            const redFlagsCount = getRedFlagsCount(contract.red_flags);
            const title = contract.source_title || "Untitled Contract";
            const date = formatDate(contract.created_at);
            const rightText = redFlagsCount > 0 ? `${redFlagsCount} flags` : "No issues";
            const rightColor = redFlagsCount > 0 ? "text-orange-600" : "text-green-600";

            return (
              <li key={contract.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 bg-[#E3F2FD] rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 md:w-full w-[150px] font-medium truncate">
                        {title}
                      </p>
                      <p className="text-xs text-gray-600">{date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`${riskDisplay.color} inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium`}
                      >
                        {riskDisplay.level}
                      </span>
                      <p className={`text-xs font-medium ${rightColor}`}>
                        {rightText}
                      </p>
                    </div>
                    {/* <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button> */}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
};

export default ContractTable;
