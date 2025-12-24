"use client";
import { Eye, MoreVertical, FileText, UploadCloud, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import NoContract from "../ui/icons/no-contract";

type ContractKanbanItem = {
    id: string;
    source_title: string | null;
    overall_risk: "low" | "medium" | "high" | null;
    summary: string | null;
    recommendations: string[] | null;
    created_at: string;
    dealParties?: string[] | null;
    companiesInvolved?: string[] | null;
    dealRoom?: string | null;
    playbook?: string | null;
    clauses?: number | null;
    flags?: number | null;
};

interface ContractKanbanProps {
    items: ContractKanbanItem[];
    onView?: (id: string) => void;
    onDelete?: (id: string) => void;
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

const ContractKanban = ({ items, onView, onDelete }: ContractKanbanProps) => {
    const router = useRouter();

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
        if (riskLower === "high") return { label: "High Risk", className: " bg-red-100 text-red-700 border-red-200  " };
        if (riskLower === "medium") return { label: "Medium Risk", className: "bg-orange-100 text-orange-700 border-orange-200" };
        if (riskLower === "low") return { label: "Low Risk", className: "bg-green-100 text-green-700 border-green-200" };

        return { label: "Medium Risk", className: "bg-amber-50 text-amber-700 border-amber-200" };
    };

    // Group items by status
    const columns = ["high", "medium", "low"];
    const groupedItems: Record<string, ContractKanbanItem[]> = {
        high: [],
        medium: [],
        low: [],
    };

    items.forEach((item) => {
        const riskLower = item.overall_risk?.toLowerCase();
        if (riskLower === "high") groupedItems.high.push(item);
        else if (riskLower === "medium") groupedItems.medium.push(item);
        else if (riskLower === "low") groupedItems.low.push(item);
    });

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

    return (
        <div className="grid grid-cols-1 bg-white  p-3 md:p-6 md:grid-cols-3 gap-6">
            {columns.map((column) => (
                <div key={column} className="flex flex-col gap-4">
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-sm text-gray-700 capitalize">{column} Risk</h3>
                        <Badge variant="outline" className="bg-white">
                            {groupedItems[column]?.length || 0}
                        </Badge>
                    </div>

                    {/* Column Cards */}
                    <div className="flex flex-col gap-3">
                        {groupedItems[column]?.map((contract) => {
                            const status = getStatusDisplay(contract.overall_risk);

                            return (
                                <Card
                                    key={contract.id}
                                    className="group hover:shadow-none cursor-pointer  transition-all border border-gray-200 !shadow-none bg-white"
                                >
                                    <CardContent className="p-4 space-y-3">
                                        {/* Header with Icon and Menu */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex  flex-col  gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                                                    <FileText className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base font-medium text-gray-900 truncate">
                                                        {contract.source_title || "Untitled Contract"}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {new Date(contract.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </Button>
                                        </div>

                                        {/* Deal Parties with Colored Avatars */}
                                        {contract.dealParties && contract.dealParties.length > 0 && (
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-medium text-gray-500">Deal Parties</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {contract.dealParties.map((party, i) => (
                                                        <div
                                                            key={i}
                                                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${getAvatarColor(i)}`}
                                                        >
                                                            <div className="w-5 h-5 rounded-full bg-white/50 flex items-center justify-center text-[10px] font-bold">
                                                                {party.slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="truncate max-w-[120px]">{party}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Companies Involved */}
                                        {contract.companiesInvolved && contract.companiesInvolved.length > 0 && (
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-medium text-gray-500">Companies</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {contract.companiesInvolved.map((company, i) => (
                                                        <span key={i} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            {company}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Deal Room */}
                                        {contract.dealRoom && (
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="text-gray-500">Deal Room:</span>
                                                <span className="font-medium text-gray-900">{contract.dealRoom}</span>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>Clauses: {contract.clauses || 0}</span>
                                            <span>Flags: {contract.flags || 0}</span>
                                        </div>

                                        {/* Risk Badge */}
                                        <div className="pt-2">
                                            <Badge
                                                variant="outline"
                                                className={`${status.className} rounded px-3 py-2 text-xs font-normal border w-full justify-center`}
                                            >
                                                {status.label}
                                            </Badge>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 cursor-pointer h-10 text-xs gap-1.5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleView(contract.id);
                                                }}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <UploadCloud className="w-4 h-4 text-gray-400" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10  cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onDelete) {
                                                        onDelete(contract.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-gray-400" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Empty State for Column */}
                        {(!groupedItems[column] || groupedItems[column].length === 0) && (
                            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-base text-gray-400">No contracts</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ContractKanban;
