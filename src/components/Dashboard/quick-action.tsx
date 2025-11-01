import { Button } from "../ui/button"
import { Card } from "../ui/card"

const QuickAction = () => {
  return (
   <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 !shadow-0  bg-gray-light rounded-md">
         <div>
             <h3 className="text-gray-900 mb-2">Need help understanding a clause?</h3>
          <p className="text-gray-600 mb-4">Ask our AI assistant any questions about your contracts</p>
         </div>
          <Button className="text-white" >
            Start AI Chat
          </Button>
        </Card>
        <Card className="p-6 !shadow-0 border-gray-200 bg-white !rounded-md">
    <div>
                  <h3 className="text-gray-900 mb-2">Learn legal terminology</h3>
          <p className="text-gray-600 mb-4">Browse our glossary of common contract terms</p>
    </div>
          <Button variant="secondary" className="text-primary border">
            View Glossary
          </Button>
        </Card>
      </div>
  )
}

export default QuickAction