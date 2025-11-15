import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Download,
  MoreVertical,
} from "lucide-react";
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

type ContractTableItem = {
  id: string;
  source_title: string | null;
  overall_risk: "low" | "medium" | "high" | null;
  summary: string | null;
  red_flags: any[] | null;
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

  const getRedFlagsCount = (redFlags: any[] | null) => {
    if (!redFlags || !Array.isArray(redFlags)) return 0;
    return redFlags.length;
  };

  if (items.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white rounded-md p-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">No contracts yet</h3>
            <p className="text-gray-600">
              Upload your first contract to get started
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white rounded-md">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">File Name</TableHead>
              <TableHead className="font-semibold">Date Uploaded</TableHead>
              <TableHead className="font-semibold">Risk Level</TableHead>
              <TableHead className="font-semibold">Red Flags</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((contract) => {
              const riskDisplay = getRiskDisplay(contract.overall_risk);
              const redFlagsCount = getRedFlagsCount(contract.red_flags);

              return (
                <TableRow key={contract.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-900">
                        {contract.source_title || "Untitled Contract"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
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
                  <TableCell className="text-left">
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
    </Card>
  );
};

export default ContractTable;
