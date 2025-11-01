import { FileText, AlertTriangle, CheckCircle2, Eye, Download, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";

const ContractTable = () => {
     const recentContracts = [
    {
      id: "1",
      name: "Freelance Service Agreement",
      date: "Oct 18, 2025",
      riskLevel: "Medium",
      riskColor: "bg-orange-100 text-orange-700 border-orange-200",
      flags: 3,
    },
    {
      id: "2",
      name: "Employment Contract - Tech Corp",
      date: "Oct 17, 2025",
      riskLevel: "Low",
      riskColor: "bg-green-100 text-green-700 border-green-200",
      flags: 1,
    },
    {
      id: "3",
      name: "NDA - Client Project",
      date: "Oct 15, 2025",
      riskLevel: "High",
      riskColor: "bg-red-100 text-red-700 border-red-200",
      flags: 5,
    },
    {
      id: "4",
      name: "Vendor Agreement",
      date: "Oct 14, 2025",
      riskLevel: "Low",
      riskColor: "bg-green-100 text-green-700 border-green-200",
      flags: 1,
    },
    {
      id: "5",
      name: "Lease Agreement",
      date: "Oct 12, 2025",
      riskLevel: "Medium",
      riskColor: "bg-orange-100 text-orange-700 border-orange-200",
      flags: 2,
    },
  ];
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
              {recentContracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
                        <img src="/images/folder.png" alt="Folder Icon" className="w-6 h-6" />
                      </div>
                      <span className="text-gray-900">{contract.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{contract.date}</TableCell>
                  <TableCell>
                    <span
                      className={`${contract.riskColor} inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium`}
                    >
                      {contract.riskLevel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {contract.flags > 0 ? (
                        <>
                          <img src="/images/red-flag.png" alt="Red Flag Icon" className="w-6 h-6 text-orange-500" />
                          <span className="text-gray-900">{contract.flags}</span>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
     
)
}
export default ContractTable;
