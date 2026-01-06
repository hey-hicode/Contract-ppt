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

/* ============================================================================
   DOMAIN TYPES
============================================================================ */

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

/* ============================================================================
   CONFIG
============================================================================ */

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
        <span>
          Step {current} of {total}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
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
      className={`relative p-4 w-full rounded-xl border-2 transition-all ${
        selected
          ? "border-blue-600 bg-blue-50 shadow-md"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`p-2 rounded rounded-br-xl absolute  top-0 left-0 ${
              selected ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Icon
              className={`w-3 h-3 ${selected ? "text-white" : "text-gray-600"}`}
            />
          </div>
        )}
        <div className="flex-1 text-left ml-3">
          <p className="font-semibold ">{option.label}</p>
          <p className="text-xs text-gray-600 mt-1">{option.description}</p>
        </div>
        {selected && <Check className="w-6 h-6 text-blue-600" />}
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
      className={`relative w-full p-4 rounded-xl border-2 transition-all ${
        selected
          ? "border-blue-600 bg-blue-50 shadow-md"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`p-2 rounded rounded-br-xl absolute  top-0 left-0 ${
              selected ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Icon
              className={`w-3 h-3 ${selected ? "text-white" : "text-gray-600"}`}
            />
          </div>
        )}
        <div className="flex-1 text-left ml-3">
          <p className="font-semibold">{option.label}</p>
          <p className="text-xs text-gray-600 mt-1">{option.description}</p>
        </div>
        {selected && <Check className="w-6 h-6 text-blue-600" />}
      </div>
    </button>
  );
}

/* ============================================================================
   STEP COMPONENTS
============================================================================ */

function StepRole({
  value,
  onChange,
}: {
  value: RoleId | null;
  onChange: (v: RoleId) => void;
}) {
  return (
    <>
      <h1 className="text-2xl font-bold mb-8">What best describes you?</h1>
      <div className=" grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
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
      <h1 className="text-2xl font-bold mb-8">What are your main goals?</h1>
      <p className="text-gray-600 mb-6">Select all that apply</p>
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
      <h1 className="text-2xl font-bold mb-8">
        Which contract types do you work with?
      </h1>
      <p className="text-gray-600 mb-6">Select all that apply</p>
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
      <h1 className="text-2xl font-bold mb-8">How risk-averse are you?</h1>
      <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {TOLERANCES.map((t) => {
          const Icon = t.icon;
          const selected = value === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`relative w-full p-4 rounded-xl border-2 transition-all text-left ${
                selected
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-4">
                {Icon && (
                  <div
                    className={`p-2 rounded rounded-br-xl absolute  top-0 left-0 ${
                      selected ? "bg-blue-600" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`w-3 h-3 ${
                        selected ? "text-white" : "text-gray-600"
                      }`}
                    />
                  </div>
                )}
                <div className="flex-1 ml-3">
                  <p className="font-semibold ">{t.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{t.description}</p>
                  {/* <p className="text-sm text-gray-500 mt-3">{t.detail}</p> */}
                </div>
                {selected && <Check className="w-6 h-6 text-blue-600" />}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepSummary({ data }: { data: OnboardingData }) {
  const roleLabel = ROLES.find((r) => r.id === data.role)?.label || "None";
  const goalLabels = data.goals
    .map((g) => GOALS.find((goal) => goal.id === g)?.label)
    .filter(Boolean);
  const contractLabels = data.contractTypes
    .map((c) => CONTRACT_TYPES.find((ct) => ct.id === c)?.label)
    .filter(Boolean);
  const toleranceLabel =
    TOLERANCES.find((t) => t.id === data.riskTolerance)?.label || "None";

  return (
    <>
      <div className="text-center mb-8">
        <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">All set!</h1>
        <p className="text-gray-600 mt-4">Here's what we learned about you:</p>
      </div>

      <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border">
        <div>
          <p className="font-semibold text-gray-700">Your Role</p>
          <p className="text-lg mt-2">{roleLabel}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Goals</p>
          <ul className="mt-2 space-y-1">
            {goalLabels.map((g) => (
              <li key={g} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                {g}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Contract Types</p>
          <ul className="mt-2 space-y-1">
            {contractLabels.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Risk Tolerance</p>
          <p className="text-lg mt-2">{toleranceLabel}</p>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-8">
        You can always update these preferences later in settings.
      </p>
    </>
  );
}

/* ============================================================================
   MAIN COMPONENT
============================================================================ */

const TOTAL_STEPS = 5;

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const raw = localStorage.getItem("onboarding_draft");
      if (raw) return JSON.parse(raw) as OnboardingData;
    } catch {}
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-20 p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-4 sm:p-10">
        {step < TOTAL_STEPS && (
          <ProgressBar current={step} total={TOTAL_STEPS} />
        )}

        <div className="min-h-96 overflow-y-scroll">
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

          {step === 5 && <StepSummary data={data} />}
        </div>

        <div className="flex justify-between mt-12">
          <button
            onClick={back}
            disabled={step === 1}
            className={`px-5 py-3 rounded-lg transition ${
              step === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="inline w-5 h-5 mr-2" />
            Back
          </button>

          <button
            onClick={step === TOTAL_STEPS ? finish : next}
            disabled={!canContinue() || loading}
            className={`px-8 py-3 rounded-lg font-medium transition ${
              canContinue() && !loading
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {step === TOTAL_STEPS ? "Complete Setup" : "Continue"}
            {step < TOTAL_STEPS && (
              <ArrowRight className="inline w-5 h-5 ml-2" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
