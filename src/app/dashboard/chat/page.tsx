import { GeneralChat } from "~/components/Chat/GeneralChat";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-0 sm:px-6 lg:px-8 py-8">
        <GeneralChat />
      </div>
    </div>
  );
}
