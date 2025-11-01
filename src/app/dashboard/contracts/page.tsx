'use client'
import { useState } from "react";


import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

interface MyContractsProps {
  onNavigate: (page: string, contractId?: string) => void;
}

const Contracts = ({ onNavigate }: MyContractsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");

  const contracts = [
    {
      id: "1",
      name: "Freelance Service Agreement",
      date: "Oct 18, 2025",
      riskLevel: "Medium",
      riskColor: "bg-orange-100 text-orange-700 border-orange-200",
      flags: 3,
      clauses: 14,
    },
    {
      id: "2",
      name: "Employment Contract - Tech Corp",
      date: "Oct 17, 2025",
      riskLevel: "Low",
      riskColor: "bg-green-100 text-green-700 border-green-200",
      flags: 1,
      clauses: 18,
    },
    {
      id: "3",
      name: "NDA - Client Project Alpha",
      date: "Oct 15, 2025",
      riskLevel: "High",
      riskColor: "bg-red-100 text-red-700 border-red-200",
      flags: 5,
      clauses: 8,
    },
    {
      id: "4",
      name: "Vendor Agreement - Software License",
      date: "Oct 14, 2025",
      riskLevel: "Low",
      riskColor: "bg-green-100 text-green-700 border-green-200",
      flags: 0,
      clauses: 12,
    },
    {
      id: "5",
      name: "Commercial Lease Agreement",
      date: "Oct 12, 2025",
      riskLevel: "Medium",
      riskColor: "bg-orange-100 text-orange-700 border-orange-200",
      flags: 2,
      clauses: 22,
    },
    {
      id: "6",
      name: "Partnership Agreement",
      date: "Oct 10, 2025",
      riskLevel: "High",
      riskColor: "bg-red-100 text-red-700 border-red-200",
      flags: 4,
      clauses: 16,
    },
    {
      id: "7",
      name: "Service Level Agreement (SLA)",
      date: "Oct 8, 2025",
      riskLevel: "Low",
      riskColor: "bg-green-100 text-green-700 border-green-200",
      flags: 1,
      clauses: 10,
    },
    {
      id: "8",
      name: "Consulting Agreement",
      date: "Oct 5, 2025",
      riskLevel: "Medium",
      riskColor: "bg-orange-100 text-orange-700 border-orange-200",
      flags: 3,
      clauses: 15,
    },
  ];

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRisk =
      filterRisk === "all" || contract.riskLevel.toLowerCase() === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
                 <h1 className='text-2xl mb-2 font-medium tracking-tight'>
My Contracts</h1>
          <p className="text-gray-600">
            {contracts.length} contracts analyzed
          </p>
        </div>

      </div>

      {/* Filters */}
      <Card className="p-4 border-none shadow-sm bg-white rounded-2xl">
        <div className="flex gap-4">
          <div className="flex-1 bg-gray-100 rounded-lg relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-5 "
            />
          </div>
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-40 rounded-lg">
              <Filter className="w-4 h-4 " />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All </SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Contracts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts.map((contract) => (
          <Card
            key={contract.id}
            className="p-6 border-none shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-[#E3F2FD] rounded-xl flex items-center justify-center">
                  <img src="/images/folder.png" alt="Contract Icon" className="w-6 h-6" />
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div>
                <h4 className="text-gray-900 mb-2 line-clamp-2">
                  {contract.name}
                </h4>
                <p className="text-sm text-gray-500">{contract.date}</p>
              </div>

              {/* Stats */}
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

              {/* Risk Badge */}
              <Badge className={`${contract.riskColor} w-full justify-center py-2`}>
                {contract.riskLevel} Risk
              </Badge>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onNavigate("analysis", contract.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredContracts.length === 0 && (
        <Card className="p-12 border-2 border-dashed border-gray-300 rounded-3xl">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">No contracts found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
export default Contracts