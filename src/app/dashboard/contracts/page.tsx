"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Loader2,
  Plus,
  UploadCloud,
  LayoutGrid,
  Columns,
  ArrowUpDown,
  X,
  MoreVertical,
  Check
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
import ContractTable from "~/components/Dashboard/contract-table";

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
  dealParties?: string[];
  companiesInvolved?: string[];
  dealRoom?: string;
  playbook?: string;
}

const Contracts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [grouping, setGrouping] = useState<"none" | "status">("none");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    dealparties: true,
    companies: true,
    dealroom: true,
    playbook: true,
  });

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
      // Map status filter back to risk for API
      if (filterRisk !== "all") {
        let riskParam = "all";
        if (filterRisk === "Negotiating") riskParam = "high";
        if (filterRisk === "Reviewing") riskParam = "medium";
        if (filterRisk === "Signing") riskParam = "low";
        if (riskParam !== "all") params.append("risk", riskParam);
      }
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

  const filteredContracts = contracts
    .filter((contract) =>
      contract.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.riskLevel.localeCompare(b.riskLevel);
    });

  const handleViewContract = (id: string) => {
    router.push(`/dashboard/contracts/${id}`);
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

  // Map ContractItem to ContractTableItem
  const tableItems = filteredContracts.map(c => ({
    id: c.id,
    source_title: c.name,
    overall_risk: c.riskLevel.toLowerCase() as "low" | "medium" | "high" | null,
    summary: c.summary || null,
    red_flags: c.redFlags || null,
    recommendations: c.recommendations || null,
    created_at: c.date,
    dealParties: c.dealParties || [],
    companiesInvolved: c.companiesInvolved || [],
    dealRoom: c.dealRoom || "Legal",
    playbook: c.playbook || "General",
  }));

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 space-y-6" onClick={() => setShowColumnMenu(false)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">
          Showing {filteredContracts.length} of {contracts.length} Contracts
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-gray-200 text-gray-500 hover:text-gray-700">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-gray-200 text-gray-500 hover:text-gray-700">
            <UploadCloud className="h-4 w-4" />
          </Button>
          <Button
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium px-4 h-9 gap-2"
            onClick={() => router.push("/dashboard/analyze")}
          >
            <Plus className="h-4 w-4" />
            New contract
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search contracts.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-auto min-w-[120px] h-10 px-3 gap-2 text-gray-600 border-gray-200 bg-white hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filters" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Negotiating">Negotiating (High Risk)</SelectItem>
                <SelectItem value="Reviewing">Reviewing (Medium Risk)</SelectItem>
                <SelectItem value="Signing">Signing (Low Risk)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={`h-10 px-3 gap-2 border-gray-200 hover:bg-gray-50 ${grouping !== 'none' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600'}`}
              onClick={() => setGrouping(prev => prev === "none" ? "status" : "none")}
            >
              <LayoutGrid className="w-4 h-4" />
              Grouping
            </Button>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                className="h-10 px-3 gap-2 text-gray-600 border-gray-200 bg-white hover:bg-gray-50"
                onClick={() => setShowColumnMenu(!showColumnMenu)}
              >
                <Columns className="w-4 h-4" />
                Columns
              </Button>
              {showColumnMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 p-2 z-50">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">Toggle Columns</div>
                  {Object.keys(visibleColumns).map((key) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700 capitalize"
                      onClick={() => toggleColumn(key as keyof typeof visibleColumns)}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${visibleColumns[key as keyof typeof visibleColumns] ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                        {visibleColumns[key as keyof typeof visibleColumns] && <Check className="w-3 h-3" />}
                      </div>
                      {key}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className="h-10 px-3 gap-2 text-gray-600 border-gray-200 bg-white hover:bg-gray-50"
              onClick={() => setSortBy(prev => prev === "date" ? "status" : "date")}
            >
              Sort by <span className="font-medium text-gray-900 ml-1">{sortBy === "date" ? "Date" : "Status"}</span>
              <ArrowUpDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* Active Filters Mock */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterRisk !== 'all' && (
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200">
              Risk: {filterRisk} <X className="w-3 h-3 cursor-pointer hover:text-gray-900" onClick={() => setFilterRisk('all')} />
            </div>
          )}
          {searchQuery && (
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200">
              Search: {searchQuery} <X className="w-3 h-3 cursor-pointer hover:text-gray-900" onClick={() => setSearchQuery('')} />
            </div>
          )}

          {(filterRisk !== 'all' || searchQuery) && (
            <button
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 ml-2 uppercase tracking-wide"
              onClick={() => {
                setFilterRisk('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-500 font-medium">Loading contracts...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <ContractTable
          items={tableItems}
          onView={handleViewContract}
          visibleColumns={visibleColumns}
          grouping={grouping}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white p-6 rounded-xl shadow-xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete analysis?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the saved analysis. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContractToDelete(null)} className="rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConfirm()}
              className="bg-red-600 text-white hover:bg-red-700 rounded-lg"
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
