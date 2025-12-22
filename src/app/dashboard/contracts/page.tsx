"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "~/components/ui/alert-dialog";
import NoContract from "~/components/ui/icons/no-contract";



interface RedFlag {
  type: "critical" | "warning" | "minor";
  title: string;
  clause?: string;
  description?: string;
  recommendation?: string;
}

interface ContractItem {
  id: string;
  name: string;
  date: string;
  riskLevel: string;
  riskColor: string;
  flags: number;
  clauses: number;
  summary?: string;
  recommendations?: string[];
  redFlags?: RedFlag[];
  sourceTitle?: string;
  createdAt?: string;
  raw?: unknown;
}

const Contracts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterRisk !== "all") params.append("risk", filterRisk.toLowerCase());
      params.append("limit", "50");

      const res = await fetch(`/api/analysis/history?${params.toString()}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to fetch contracts");
      }

      const data = (await res.json()) as ContractItem[];
      setContracts(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [filterRisk]);

  useEffect(() => {
    void fetchContracts();
  }, [fetchContracts]);

  const filteredContracts = contracts.filter((contract) =>
    contract.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewContract = (contract: ContractItem) => {
    router.push(`/dashboard/contracts/${contract.id}`);
  };

  const handleDeleteClick = (id: string) => {
    setContractToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/analysis/${contractToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || "Delete failed");
      }

      await fetchContracts();

      /*
      if (selectedContract?.id === contractToDelete) {
        setDialogOpen(false);
        setSelectedContract(null);
      }
      */

      setDeleteDialogOpen(false);
      setContractToDelete(null);
    } catch (err: unknown) {
      console.error("Delete error:", err);
      const message = err instanceof Error ? err.message : "Failed to delete";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  const renderRiskBadge = (contract: ContractItem) => (
    <Badge className={`${contract.riskColor} w-full justify-center py-2`}>
      {contract.riskLevel} Risk
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="md:text-2xl text-[20px] mb-2 font-medium tracking-tight">
            My Contracts
          </h1>
          <p className="text-[#535354] text-base">{contracts.length} contracts analyzed</p>
        </div>
      </div>

      <Card className="p-4 border-none shadow-sm bg-white rounded-2xl">
        <div className="flex gap-4">
          <div className="flex-1 bg-gray-100 rounded-lg relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-5"
            />
          </div>
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="md:w-40 rounded-lg">
              <Filter className="w-4 hidden md:block h-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading contracts...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map((contract) => (
          <Card
            key={contract.id}
            className="p-6 border-none shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-[#E3F2FD] rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              <div>
                <h4 className="text-gray-900 mb-2 line-clamp-2">
                  {contract.name}
                </h4>
                <p className="text-sm text-gray-500">{contract.date}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Clauses: </span>
                  <span className="text-gray-900">{contract.clauses}</span>
                </div>
                <div>
                  <span className="text-gray-500">Flags: </span>
                  <span className="text-gray-900">{contract.flags}</span>
                </div>
              </div>

              {renderRiskBadge(contract)}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewContract(contract)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>

                {/* <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    window.alert("Download PDF will be implemented next")
                  }
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </Button> */}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteClick(contract.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredContracts.length === 0 && !loading && (
        <Card className="border-none border border-gray-500 !shadow-none bg-white rounded-md p-12">
          <div className="text-center space-y-4">
            <div className="  rounded-2xl flex items-center justify-center mx-auto">
              <NoContract />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-medium">No contracts found</h3>
              <p className="text-gray-600 ">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Detail modal removed; view now navigates to the slug page */}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white p-6 rounded-md shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete analysis?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the saved analysis. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContractToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConfirm()}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Contracts;
