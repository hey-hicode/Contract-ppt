"use client";
import React, { useMemo, useState } from "react";
import { Mail, Save, Lock, Bot } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
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
  role?: string | null;
}

interface ActionSheetsProps {
  chatEnabled: boolean;
  analysisId?: string | null;
  documentText?: string;
  emailData: EmailData;
  onSave?: () => void | Promise<void>;
  saving?: boolean;
}

function generateEmailContent(data: EmailData) {
  const { title, summary, redFlags = [], recommendations = [], role } = data;

  const toneConfig: Record<
    string,
    {
      intro: string;
      context: string;
      close: string;
    }
  > = {
    founder: {
      intro:
        "I’ve reviewed the contract below and want to make sure it supports how we run the business.",
      context:
        "From a company operations perspective, there are a few areas that could create risk or limit flexibility.",
      close:
        "If you’re open to it, I’d like to discuss a few adjustments so the terms align with how we operate.",
    },
    freelancer: {
      intro:
        "I reviewed the contract and wanted to confirm a few points that affect how I deliver and get paid.",
      context:
        "From a freelancer’s standpoint, a couple of terms feel one‑sided or unclear.",
      close:
        "If you’re available, I’d love to talk through a few edits so expectations are clear for both sides.",
    },
    employee: {
      intro:
        "I reviewed the contract and want to make sure I fully understand the expectations and protections.",
      context:
        "From an employee standpoint, a few sections could use clarification or balance.",
      close:
        "If possible, I’d appreciate a quick chat to clarify these items before moving forward.",
    },
    investor: {
      intro:
        "I reviewed the contract and would like to align on a few items that affect risk and returns.",
      context:
        "From an investor perspective, there are terms that could be tightened.",
      close:
        "If you’re open, I’d like to discuss a few changes to better align incentives and risk.",
    },
  };

  const tone = role ? toneConfig[role] : null;
  const introLine =
    tone?.intro ??
    "I’ve reviewed the contract and wanted to follow up on a few points before moving forward.";
  const contextLine =
    tone?.context ?? "There are a few areas that seem worth discussing.";
  const closeLine =
    tone?.close ??
    "If you’re available, I’d appreciate a quick conversation to walk through these.";

  const talkingPoints = redFlags
    .map(
      (f, i) =>
        `${i + 1}. ${f.title}${f.description ? ` — ${f.description}` : ""}`,
    )
    .join("\n");

  const nextSteps = recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n");

  return `Subject: Contract Review — ${title}

Hi,

${introLine}

${contextLine}

${summary ? `Here’s a brief overview from my review:\n${summary}\n\n` : ""}The main items I’d like to discuss are:

${talkingPoints || "- No major issues stood out, but I’d still like to align on a few details."}

${
  nextSteps
    ? `Based on this, a few potential next steps could be:\n${nextSteps}`
    : "I’m open to your thoughts on how best to proceed."
}

${closeLine}

Best regards,
`;
}

// function openMailClient(to: string, content: string) {
//   // Extract a subject line from the first line if prefixed by "Subject:" for better mailto UX
//   let subject = "Contract Review";
//   let body = content;
//   const firstLine = content.split("\n")[0];
//   if (firstLine.toLowerCase().startsWith("subject:")) {
//     subject = firstLine.replace(/^[Ss]ubject:\s*/, "").trim();
//     body = content.split("\n").slice(1).join("\n");
//   }
//   const mailtoLink = `mailto:${encodeURIComponent(
//     to,
//   )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
//   window.location.href = mailtoLink;
// }

export default function ActionSheets({
  chatEnabled,
  analysisId,
  documentText,
  emailData,
  onSave,
  saving,
}: ActionSheetsProps) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [savePromptOpen, setSavePromptOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const initialEmail = useMemo(
    () => generateEmailContent(emailData),
    [emailData],
  );

  // Keep content in sync when data changes
  React.useEffect(() => {
    setEmailContent(initialEmail);
  }, [initialEmail]);

  // const handleSendEmail = () => {
  //   trackFeatureUsage("email_sent");
  //   if (!recipientEmail) return;
  //   openMailClient(recipientEmail, emailContent || initialEmail);
  // };

  function extractSubject(content: string): string {
    if (!content) return "Contract Review";

    const lines = content.split("\n");
    const firstLine = lines[0]?.trim() || "";

    if (/^subject:/i.test(firstLine)) {
      return firstLine.replace(/^subject:\s*/i, "").trim() || "Contract Review";
    }

    // Fallback: derive from first non-empty line
    return "Contract Review";
  }

  function extractBody(content: string): string {
    if (!content) return "";

    const lines = content.split("\n");

    // Remove Subject line if present
    if (/^subject:/i.test(lines[0]?.trim())) {
      return lines.slice(1).join("\n").trim();
    }

    return content.trim();
  }

  const handleSendEmail = async () => {
    if (!recipientEmail || isSendingEmail) return;

    try {
      setIsSendingEmail(true);
      trackFeatureUsage("email_sent");

      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          subject: extractSubject(emailContent),
          body: extractBody(emailContent),
          analysisId,
        }),
      });

      if (!res.ok) {
        // toast error
        return;
      }

      // success feedback
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleChatClick = () => {
    if (!chatEnabled) {
      setSavePromptOpen(true);
    }
  };

  const handleSaveAndEnableChat = async () => {
    if (onSave) {
      await onSave();
      setSavePromptOpen(false);
    }
  };

  return (
    <div>
      {/* Floating action buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-3 z-40">
        {/* Chat button - ContractChat has its own Dialog wrapper when enabled */}
        {chatEnabled && analysisId ? (
          <ContractChat
            analysisId={String(analysisId)}
            documentText={documentText}
            savedId={analysisId ?? null}
            contractTitle={emailData.title}
            overallRisk={emailData.overallRisk}
          />
        ) : (
          <Button
            size="lg"
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl bg-black hover:bg-black/90 text-white grid place-items-center transition-transform hover:scale-105 p-0"
            onClick={handleChatClick}
            title="Chat about this contract"
          >
            <Bot />
          </Button>
        )}

        <Button
          size="lg"
          variant="secondary"
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full text-black shadow-lg p-0"
          onClick={() => setEmailOpen(true)}
          title="Draft email"
        >
          <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      {/* Save Required Modal */}
      <Dialog open={savePromptOpen} onOpenChange={setSavePromptOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <DialogTitle className="text-center font-semibold text-2xl">
              Save Analysis Required
            </DialogTitle>
            <DialogDescription className="text-center mx-auto my-3 text-base max-w-sm flex items-center justify-center text-slate-600">
              You need to save this analysis before you can start chatting with
              the AI about your contract.
            </DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 w-full sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setSavePromptOpen(false)}
              className="w-full h-12 sm:w-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAndEnableChat}
              disabled={saving}
              className="w-full sm:w-auto h-12 cursor-pointer bg-primary text-white"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save & Enable Chat
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email offcanvas */}
      <Sheet open={emailOpen} onOpenChange={setEmailOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex p-4 flex-col max-h-[100vh] overflow-hidden"
        >
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
              disabled={isSendingEmail}
              onChange={(e) => setEmailContent(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => setEmailContent(initialEmail)}
                variant="outline"
              >
                Regenerate
              </Button>
              <Button
                onClick={handleSendEmail}
                className="text-white"
                disabled={!recipientEmail || isSendingEmail}
              >
                {isSendingEmail ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send Email"
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
