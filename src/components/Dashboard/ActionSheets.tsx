"use client";
import React, { useMemo, useState } from "react";
import { Mail, MessageCircle } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { trackFeatureUsage } from "~/lib/analytics";
import { ContractChat } from "../Chat/ContractChat";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface RedFlagLite {
  type: string;
  title: string;
  description?: string;
  clause?: string;
}

interface EmailData {
  title: string;
  summary?: string;
  overallRisk?: string;
  redFlags?: RedFlagLite[];
  recommendations?: string[];
}

interface ActionSheetsProps {
  chatEnabled: boolean;
  analysisId?: string | null;
  documentText?: string;
  emailData: EmailData;
}

function generateEmailContent(data: EmailData) {
  const { title, summary, redFlags = [], recommendations = [] } = data;
  const talkingPoints = redFlags
    .map((f, i) => `${i + 1}. ${f.title}${f.description ? ` — ${f.description}` : ""}`)
    .join("\n");
  const nextSteps = recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n");
  return `Subject: Contract Review Discussion: ${title}

Hi,

I’ve reviewed my contract "${title}" and I’d love to discuss a few points.

${summary ? `Quick summary:\n${summary}\n\n` : ""}Talking points:\n${talkingPoints || "- No specific issues noted"}

Possible next steps:\n${nextSteps || "- Open to your suggestions"}

If you’re available, I’d appreciate a brief call to walk through these.

Thanks,`;
}

function openMailClient(to: string, content: string) {
  // Extract a subject line from the first line if prefixed by "Subject:" for better mailto UX
  let subject = "Contract Review";
  let body = content;
  const firstLine = content.split("\n")[0];
  if (firstLine.toLowerCase().startsWith("subject:")) {
    subject = firstLine.replace(/^[Ss]ubject:\s*/, "").trim();
    body = content.split("\n").slice(1).join("\n");
  }
  const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
}

export default function ActionSheets({ chatEnabled, analysisId, documentText, emailData }: ActionSheetsProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailContent, setEmailContent] = useState("");

  const initialEmail = useMemo(() => generateEmailContent(emailData), [emailData]);

  // Keep content in sync when data changes
  React.useEffect(() => {
    setEmailContent(initialEmail);
  }, [initialEmail]);

  const handleSendEmail = () => {
    trackFeatureUsage("email_sent");
    if (!recipientEmail) return;
    openMailClient(recipientEmail, emailContent || initialEmail);
  };

  return (
    <div>
      {/* Floating action buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-primary text-white hover:bg-primary/90"
          onClick={() => setChatOpen(true)}
          disabled={!chatEnabled}
          title={chatEnabled ? "Chat about this contract" : "Save analysis to enable chat"}
        >
          <MessageCircle className="h-5 w-5 mr-2 animate-bounce" />
          Chat
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="rounded-full text-black shadow-lg"
          onClick={() => setEmailOpen(true)}
          title="Draft email"
        >
          <Mail className="h-5 w-5 mr-2 animate-bounce" />
          Email
        </Button>
      </div>

      {/* Chat offcanvas */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col max-h-[100vh] overflow-hidden">
          <SheetHeader>
            <SheetTitle>Contract Chat</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex-1 overflow-y-auto">
            {chatEnabled && analysisId ? (
              <ContractChat analysisId={String(analysisId)} documentText={documentText} />
            ) : (
              <div className="text-sm text-muted-foreground">
                Save the analysis first to enable chat.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Email offcanvas */}
      <Sheet open={emailOpen} onOpenChange={setEmailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg flex p-4 flex-col max-h-[100vh] overflow-hidden">
          <SheetHeader>
            <SheetTitle>Draft Email</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 flex-1 overflow-y-auto">
            <Input
              placeholder="Recipient email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <Textarea
              rows={12}
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={() => setEmailContent(initialEmail)} variant="outline">Regenerate</Button>
              <Button onClick={handleSendEmail} className="text-white" disabled={!recipientEmail}>Open in Mail App</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}