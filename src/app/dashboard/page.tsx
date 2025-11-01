import { Badge } from "lucide-react";
import { redirect } from "next/navigation";
import ContractTable from "~/components/Dashboard/contract-table";
import QuickAction from "~/components/Dashboard/quick-action";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardDescription, CardTitle, CardAction, CardFooter } from "~/components/ui/card";
export default function DashboardPage() {
return(
  <div>
    <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-medium tracking-tight'>
            Hi, Welcome back 👋
          </h2>
   
        </div>
   <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card pt-4 !px-0 grid grid-cols-1 gap-4  *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 md:grid-cols-2 lg:grid-cols-4'>
              <Card className='@container/card '>
                <CardHeader>
                  <CardDescription>Contracts Analyzed</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                   24
                  </CardTitle>

                </CardHeader>

              </Card>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>Red Flags Found</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    12
                  </CardTitle>
           
                </CardHeader>
             
              </Card>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>Safe Contracts</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                   12
                  </CardTitle>
      
                </CardHeader>
     
              </Card>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>Average Risk Score</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    4.5%
                  </CardTitle>
               
                </CardHeader>
           
              </Card>
            </div>
                    <div className="py-6">
          <div className="flex items-center pb-6  justify-between">
            <div>
                 <h2 className='text-2xl font-medium tracking-tight'>Recent Contracts</h2>
              <p className="text-sm text-gray-500 mt-1">Your latest contract analyses</p>
            </div>
          <h2 className='text-base font-semibold tracking-tight'>
            
              View All
            </h2>
          </div>
            <ContractTable  />

        </div>

            <QuickAction />
      </div>
  </div>
)
}