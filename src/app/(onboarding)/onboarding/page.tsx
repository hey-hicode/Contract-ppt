"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Code,
  Users,
  TrendingUp,
  Check,
  ArrowRight,
  ArrowLeft,
  Shield,
  FileText,
  AlertCircle,
  Scale,
  Zap,
  Bell,
  BellOff,
  BellRing,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";



type RoleId = "founder" | "freelancer" | "employee" | "investor";
type GoalId =
  | "ip_protection"
  | "liability"
  | "flexibility"
  | "contract_review"
  | "compliance"
  | "equity";

type ContractTypeId =
  | "nda"
  | "saas"
  | "employment"
  | "contractor"
  | "investment"
  | "vendor";

type RiskToleranceId = "conservative" | "balanced" | "aggressive";

interface OnboardingData {
  role: RoleId | null;
  goals: GoalId[];
  contractTypes: ContractTypeId[];
  riskTolerance: RiskToleranceId | null;
}



const ROLES: OptionConfig<RoleId>[] = [
  {
    id: "founder",
    label: "Founder",
    description: "Building a company",
    icon: TrendingUp,
  },
  {
    id: "freelancer",
    label: "Freelancer",
    description: "Independent contractor",
    icon: Code,
  },
  {
    id: "employee",
    label: "Employee",
    description: "Working for a company",
    icon: Users,
  },
  {
    id: "investor",
    label: "Investor",
    description: "Managing investments",
    icon: Briefcase,
  },
];

const GOALS: OptionConfig<GoalId>[] = [
  {
    id: "ip_protection",
    label: "IP Protection",
    description: "Safeguard intellectual property",
    icon: Shield,
  },
  {
    id: "liability",
    label: "Liability Reduction",
    description: "Minimize legal exposure",
    icon: AlertCircle,
  },
  {
    id: "flexibility",
    label: "Flexibility",
    description: "Maintain operational freedom",
    icon: Zap,
  },
  {
    id: "contract_review",
    label: "Contract Review",
    description: "Vet agreements & terms",
    icon: FileText,
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "Stay regulation-ready",
    icon: Scale,
  },
  {
    id: "equity",
    label: "Equity & Stock",
    description: "Review compensation",
    icon: TrendingUp,
  },
];

const CONTRACT_TYPES: OptionConfig<ContractTypeId>[] = [
  { id: "nda", label: "NDA", description: "Non-disclosure agreements" },
  { id: "saas", label: "SaaS", description: "Software as a service contracts" },
  {
    id: "employment",
    label: "Employment",
    description: "Employment agreements",
  },
  {
    id: "contractor",
    label: "Contractor",
    description: "Freelance & contractor agreements",
  },
  {
    id: "investment",
    label: "Investment",
    description: "Term sheets & investment docs",
  },
  { id: "vendor", label: "Vendor", description: "Supplier & vendor contracts" },
];

const TOLERANCES: ToleranceConfig[] = [
  {
    id: "conservative",
    label: "Conservative",
    description: "Alert me to all potential risks",
    detail: "10–15 alerts per month",
    icon: BellRing,
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Focus on moderate to high risks",
    detail: "5–8 alerts per month",
    icon: Bell,
  },
  {
    id: "aggressive",
    label: "Aggressive",
    description: "Only critical risks matter",
    detail: "2–3 alerts per month",
    icon: BellOff,
  },
];

interface OptionConfig<T extends string> {
  id: T;
  label: string;
  description: string;
  icon?: LucideIcon;
}

interface ToleranceConfig extends OptionConfig<RiskToleranceId> {
  detail: string;
}

/* ============================================================================
   UI PRIMITIVES
============================================================================ */

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = (current / total) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span className="text-body text-sm font-medium">
          Step {current} of {total}
        </span>
        <span className="text-body text-sm font-medium">
          {Math.round(percent)}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SingleSelectCard<T extends string>({
  option,
  selected,
  onSelect,
}: {
  option: OptionConfig<T>;
  selected: boolean;
  onSelect: (id: T) => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={`relative p-4 w-full rounded-md border transition-all ${selected
        ? "border-primary bg-blue-50 shadow-md"
        : "border-gray-200 hover:border-gray-300"
        }`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`p-2 rounded rounded-br-xl absolute  top-0 left-0 ${selected ? "bg-primary" : "bg-gray-100"
              }`}
          >
            <Icon
              className={`w-3 h-3 ${selected ? "text-white" : "text-gray-600"}`}
            />
          </div>
        )}
        <div className="flex-1 text-left ml-3">
          <p className="font-semibold text-sm ">{option.label}</p>
          <p className="text-xs text-gray-600 mt-1">{option.description}</p>
        </div>
        {selected && <Check className="w-4 h-4 text-primary" />}
      </div>
    </button>
  );
}

function MultiSelectCard<T extends string>({
  option,
  selected,
  onToggle,
}: {
  option: OptionConfig<T>;
  selected: boolean;
  onToggle: (id: T) => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={() => onToggle(option.id)}
      className={`relative w-full p-4 rounded-lg border transition-all ${selected
        ? "border-primary bg-primary/10 shadow-md"
        : "border-gray-200 hover:border-gray-300"
        }`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`p-2 rounded rounded-br-xl absolute  top-0 left-0 ${selected ? "bg-primary" : "bg-gray-100"
              }`}
          >
            <Icon
              className={`w-3 h-3 ${selected ? "text-white" : "text-gray-600"}`}
            />
          </div>
        )}
        <div className="flex-1 text-left ml-3">
          <p className="font-semibold text-sm">{option.label}</p>
          <p className="text-xs text-gray-600 mt-1">{option.description}</p>
        </div>
        {selected && <Check className="w-4 h-4 text-blue-600" />}
      </div>
    </button>
  );
}

function StepRole({
  value,
  onChange,
}: {
  value: RoleId | null;
  onChange: (v: RoleId) => void;
}) {
  return (
    <>
      <h1 className="text-2xl font-medium mb-8">What best describes you?</h1>
      <div className=" grid grid-cols-1  gap-4 items-center">
        {ROLES.map((role) => (
          <SingleSelectCard
            key={role.id}
            option={role}
            selected={value === role.id}
            onSelect={onChange}
          />
        ))}
      </div>
    </>
  );
}

function StepGoals({
  values,
  onToggle,
}: {
  values: GoalId[];
  onToggle: (id: GoalId) => void;
}) {
  return (
    <>
      <h1 className="text-2xl font-medium mb-8">What are your main goals?</h1>
      {/* <p className="text-gray-600 mb-6">Select all that apply</p> */}
      <div className=" grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {GOALS.map((goal) => (
          <MultiSelectCard
            key={goal.id}
            option={goal}
            selected={values.includes(goal.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </>
  );
}

function StepContractTypes({
  values,
  onToggle,
}: {
  values: ContractTypeId[];
  onToggle: (id: ContractTypeId) => void;
}) {
  return (
    <>
      <h1 className="text-2xl font-medium mb-8">
        Which contract types do you work with?
      </h1>
      {/* <p className="text-gray-600 mb-6">Select all that apply</p> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {CONTRACT_TYPES.map((type) => (
          <MultiSelectCard
            key={type.id}
            option={type}
            selected={values.includes(type.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </>
  );
}

function StepRiskTolerance({
  value,
  onChange,
}: {
  value: RiskToleranceId | null;
  onChange: (v: RiskToleranceId) => void;
}) {
  return (
    <>
      <h1 className="text-2xl font-medium mb-8">How risk-averse are you?</h1>
      <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {TOLERANCES.map((t) => {
          const Icon = t.icon;
          const selected = value === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`relative w-full p-4 rounded-lg border transition-all text-left ${selected
                ? "border-primary bg-primary/10 shadow-md"
                : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center gap-4">
                {Icon && (
                  <div
                    className={`p-2 rounded rounded-br-xl absolute  top-0 left-0 ${selected ? "bg-primary" : "bg-gray-100"
                      }`}
                  >
                    <Icon
                      className={`w-3 h-3 ${selected ? "text-white" : "text-gray-600"
                        }`}
                    />
                  </div>
                )}
                <div className="flex-1 ml-3">
                  <p className="font-semibold text-sm ">{t.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{t.description}</p>
                  {/* <p className="text-sm text-gray-500 mt-3">{t.detail}</p> */}
                </div>
                {selected && <Check className="w-4 h-4 text-primary" />}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function SummarySection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 bg-white border border-gray-100 rounded-xl border p-6 shadow-none last:mb-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-primary cursor-pointer hover:text-primary/80 underline"
        >
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-normal text-gray-900 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <div className="text-xs text-gray-500 font-medium leading-relaxed">
        {value}
      </div>
    </div>
  );
}

function StepSummary({
  data,
  onEdit,
}: {
  data: OnboardingData;
  onEdit: (step: number) => void;
}) {
  const { user } = useUser();
  const roleLabel = ROLES.find((r) => r.id === data.role)?.label || "None";
  const goalLabels = data.goals
    .map((g) => GOALS.find((goal) => goal.id === g)?.label)
    .filter(Boolean)
    .join(", ");
  const contractLabels = data.contractTypes
    .map((c) => CONTRACT_TYPES.find((ct) => ct.id === c)?.label)
    .filter(Boolean)
    .join(", ");
  const tolerance = TOLERANCES.find((t) => t.id === data.riskTolerance);
  const toleranceLabel = tolerance?.label || "None";
  const toleranceDetail = tolerance?.description || "";

  return (
    <div className="max-w-2xl pt-[50px] mx-auto w-full relative">
      {/* Decorative Grid Background */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-64 opacity-[0.03] pointer-events-none z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
          Review Your Profile {user?.firstName}
        </h1>
        <p className="text-base text-gray-500 font-medium">
          Here is a summary of your profile information
        </p>
      </div>

      <div className="relative z-10 space-y-4">
        <SummarySection title="Company Profile" onEdit={() => onEdit(1)}>
          <SummaryItem label="Current Role" value={roleLabel} />
          <SummaryItem
            label="Industry focus"
            value="Legal Technology Agency"
          />
          <SummaryItem label="Profile Size" value="Standard Utility" />
        </SummarySection>

        <SummarySection title="Profile Preferences" onEdit={() => onEdit(2)}>
          <SummaryItem label="Primary Goals" value={goalLabels} />
          <SummaryItem
            label="Main focus"
            value={GOALS.find((g) => g.id === data.goals[0])?.description || ""}
          />
          <SummaryItem label="Complexity" value="Standard" />
        </SummarySection>

        <SummarySection title="Review Depth" onEdit={() => onEdit(3)}>
          <SummaryItem label="Contract Types" value={contractLabels} />
          <SummaryItem label="Analysis Type" value="Automated Risk Sweep" />
          <SummaryItem label="Deep Scan" value="Enabled" />
        </SummarySection>

        <SummarySection title="System Config" onEdit={() => onEdit(4)}>
          <SummaryItem label="Risk Tolerance" value={toleranceLabel} />
          <SummaryItem label="Alert Threshold" value={toleranceDetail} />
          <SummaryItem label="Notification" value="Real-time Alerts" />
        </SummarySection>
      </div>
    </div>
  );
}

const TOTAL_STEPS = 5;

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const raw = localStorage.getItem("onboarding_draft");
      if (raw) return JSON.parse(raw) as OnboardingData;
    } catch { }
    return {
      role: null,
      goals: [],
      contractTypes: [],
      riskTolerance: null,
    };
  });

  useEffect(() => {
    fetch("/api/onboarding/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.onboarding_complete) {
          router.replace("/dashboard");
        }
      });
  }, [router]);

  useEffect(() => {
    localStorage.setItem("onboarding_draft", JSON.stringify(data));
  }, [data]);

  const canContinue = () => {
    switch (step) {
      case 1:
        return data.role !== null;
      case 2:
        return data.goals.length > 0;
      case 3:
        return data.contractTypes.length > 0;
      case 4:
        return data.riskTolerance !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const next = async () => {
    if (!canContinue() || loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300)); // smooth feel
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
    setLoading(false);
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const finish = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: data.role,
          riskTolerance: data.riskTolerance,
          goals: data.goals,
          contractTypes: data.contractTypes,
        }),
      });

      if (!res.ok) {
        throw new Error("Onboarding failed");
      }

      localStorage.removeItem("onboarding_draft");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center py-20 px-6">
      <div
        className={`w-full max-w-4xl transition-all duration-500 ${step === TOTAL_STEPS ? "bg-transparent" : "bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100"
          }`}
      >
        {step < TOTAL_STEPS && (
          <ProgressBar current={step} total={TOTAL_STEPS} />
        )}

        <div className={step === TOTAL_STEPS ? "" : "min-h-96"}>
          {step === 1 && (
            <StepRole
              value={data.role}
              onChange={(v) => setData({ ...data, role: v })}
            />
          )}

          {step === 2 && (
            <StepGoals
              values={data.goals}
              onToggle={(id) =>
                setData({
                  ...data,
                  goals: data.goals.includes(id)
                    ? data.goals.filter((g) => g !== id)
                    : [...data.goals, id],
                })
              }
            />
          )}

          {step === 3 && (
            <StepContractTypes
              values={data.contractTypes}
              onToggle={(id) =>
                setData({
                  ...data,
                  contractTypes: data.contractTypes.includes(id)
                    ? data.contractTypes.filter((c) => c !== id)
                    : [...data.contractTypes, id],
                })
              }
            />
          )}

          {step === 4 && (
            <StepRiskTolerance
              value={data.riskTolerance}
              onChange={(v) => setData({ ...data, riskTolerance: v })}
            />
          )}

          {step === 5 && (
            <StepSummary data={data} onEdit={(s) => setStep(s)} />
          )}
        </div>

        <div
          className={`flex items-center mt-12 ${step === TOTAL_STEPS ? "justify-center" : "justify-between"
            }`}
        >
          {step < TOTAL_STEPS && (
            <button
              onClick={back}
              disabled={step === 1}
              className={`px-6 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 ${step === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}

          <button
            onClick={step === TOTAL_STEPS ? finish : next}
            disabled={!canContinue() || loading}
            className={`transition-all duration-300 flex items-center justify-center gap-2 font-bold ${step === TOTAL_STEPS
              ? "bg-primary hover:bg-primary/90 text-white px-12 py-3.5 rounded-xl shadow-lg shadow-primary/20"
              : "bg-primary text-white hover:bg-primary/90 px-8 py-2.5 rounded-xl shadow-md"
              } ${(!canContinue() || loading) && "opacity-50 cursor-not-allowed"}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : step === TOTAL_STEPS ? (
              "Submit Profile"
            ) : (
              "Continue"
            )}
            {step < TOTAL_STEPS && !loading && (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
