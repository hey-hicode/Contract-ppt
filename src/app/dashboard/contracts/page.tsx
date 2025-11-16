"use client";
import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
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
import { downloadElementAsPdfSimple } from "~/helper/exportPdf";
import NoContract from "~/components/ui/icons/no-contract";

interface MyContractsProps {
  onNavigate: (page: string, contractId?: string) => void;
}

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
  raw?: any;
}

const Contracts = ({ onNavigate }: MyContractsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(
    null
  );
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const fetchContracts = async () => {
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchContracts();
  }, [filterRisk]);

  const filteredContracts = contracts.filter((contract) =>
    contract.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchFullAnalysis = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/analysis/${id}`);
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || "Failed to fetch analysis");
      }
      const data = await res.json();

      const riskLevel = data.overallRisk
        ? data.overallRisk.charAt(0).toUpperCase() + data.overallRisk.slice(1)
        : "Unknown";

      const mapped: ContractItem = {
        id: data.id,
        name: data.sourceTitle ?? "Untitled Contract",
        date: new Date(data.createdAt).toLocaleString(),
        riskLevel,
        riskColor:
          data.overallRisk === "high"
            ? "bg-red-100 text-red-700 border-red-200"
            : data.overallRisk === "medium"
            ? "bg-orange-100 text-orange-700 border-orange-200"
            : "bg-green-100 text-green-700 border-green-200",
        flags: (data.redFlags ?? data.red_flags ?? []).length ?? 0,
        clauses: (data.redFlags ?? data.red_flags ?? []).length ?? 0,
        summary: data.summary ?? "",
        recommendations: data.recommendations ?? [],
        redFlags: data.redFlags ?? data.red_flags ?? [],
        sourceTitle: data.sourceTitle ?? data.source_title ?? null,
        createdAt: data.createdAt ?? data.created_at,
        raw: data.raw ?? null,
      };

      setSelectedContract(mapped);
    } catch (err: any) {
      console.error("fetchFullAnalysis error:", err);
      setError(err.message ?? "Failed to load analysis");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewContract = async (contract: ContractItem) => {
    setDialogOpen(true);
    setSelectedContract(null);
    await fetchFullAnalysis(contract.id);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setSelectedContract(null), 200);
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

      if (selectedContract?.id === contractToDelete) {
        setDialogOpen(false);
        setSelectedContract(null);
      }

      setDeleteDialogOpen(false);
      setContractToDelete(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message ?? "Failed to delete");
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
          <h1 className="text-2xl mb-2 font-medium tracking-tight">
            My Contracts
          </h1>
          <p className="text-gray-600">{contracts.length} contracts analyzed</p>
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
            <SelectTrigger className="w-40 rounded-lg">
              <Filter className="w-4 h-4" />
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
                  onClick={() => void handleViewContract(contract)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="!max-w-4xl max-h-[90vh] bg-white overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold">
                  {loadingDetails
                    ? "Loading..."
                    : selectedContract?.name ?? "Contract Summary"}
                </DialogTitle>
                {selectedContract && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedContract.date}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    if (!contentRef.current) return;
                    downloadElementAsPdfSimple(
                      contentRef.current,
                      `${selectedContract?.name ?? "contract-summary"}.pdf`
                    );
                  }}
                >
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">
                Loading contract details...
              </span>
            </div>
          ) : selectedContract ? (
            <div ref={contentRef} className="modal-body mt-6 space-y-6">
              <section className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold mb-3">
                  Executive Summary
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedContract.summary || "No summary available."}
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold mb-4">Red Flags</h4>
                {selectedContract.redFlags &&
                selectedContract.redFlags.length > 0 ? (
                  <div className="space-y-4">
                    {selectedContract.redFlags.map((flag, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${
                          flag.type === "critical"
                            ? "border-red-200 bg-red-50"
                            : flag.type === "warning"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">
                              {flag.title}
                            </h5>
                            {flag.clause && (
                              <p className="text-sm italic text-gray-700 mt-2">
                                "{flag.clause}"
                              </p>
                            )}
                            {flag.description && (
                              <p className="mt-2 text-gray-700">
                                {flag.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              flag.type === "critical"
                                ? "bg-red-600 text-white"
                                : flag.type === "warning"
                                ? "bg-yellow-600 text-white"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {flag.type}
                          </span>
                        </div>

                        {flag.recommendation && (
                          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                            <strong className="text-sm text-gray-800">
                              Recommendation:
                            </strong>
                            <p className="text-sm text-gray-700 mt-1">
                              {flag.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No red flags detected.
                  </p>
                )}
              </section>

              <section>
                <h4 className="text-lg font-semibold mb-4">Recommendations</h4>
                {selectedContract.recommendations &&
                selectedContract.recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedContract.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-2 text-gray-700">
                        <span className="text-gray-400 font-semibold">
                          {idx + 1}.
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recommendations available.
                  </p>
                )}
              </section>
            </div>
          ) : null}

          <DialogFooter className="mt-6 border-t pt-4">
            <div className="w-full flex justify-between items-center">
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick(selectedContract?.id ?? "")}
                disabled={!selectedContract || loadingDetails}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>

              <DialogClose asChild>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Close
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
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
              className="bg-red-600 hover:bg-red-700"
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
