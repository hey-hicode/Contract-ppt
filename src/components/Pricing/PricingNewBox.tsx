import { Loader2 } from "lucide-react";

type PricingNewBoxProps = {
  price?: string;
  duration?: string;
  packageName?: string;
  subtitle?: string;
  custom?: boolean;
  loading?: boolean;
  actionState: "current" | "upgrade" | "downgrade";
  onSelect: () => void;
  children?: React.ReactNode;
};

const PricingNewBox = ({
  price,
  duration,
  packageName,
  subtitle,
  custom,
  onSelect,
  actionState,
  loading = false,
  children,
}: PricingNewBoxProps) => {
  const isDisabled = actionState !== "upgrade" || loading;

  return (
    <div className="w-full">
      <div className="shadow-three h-[600px] rounded-xs bg-white px-8 py-10 relative">
        {actionState === "current" && (
          <span className="absolute top-4 right-4 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Current
          </span>
        )}

        <div className="flex items-center justify-between">
          {custom ? (
            <h3 className="text-[32px] font-bold">Custom</h3>
          ) : (
            <h3 className="text-[32px] font-bold">
              ${price}
              <span className="text-lg font-medium">/{duration}</span>
            </h3>
          )}
          <h4 className="text-xl font-medium">{packageName}</h4>
        </div>

        <p className="mb-7 text-base text-slate-600">{subtitle}</p>

        <div className="mb-8 border-b pb-8">
          <button
            disabled={isDisabled}
            onClick={onSelect}
            className={`
              w-full rounded-xs p-3 font-semibold transition
              flex items-center justify-center gap-2
              ${
                actionState === "current"
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : actionState === "downgrade"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : loading
                  ? "bg-primary/70 text-white cursor-wait"
                  : "bg-primary text-white hover:opacity-90"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting…
              </>
            ) : actionState === "current" ? (
              "Current Plan"
            ) : actionState === "downgrade" ? (
              "Not Available"
            ) : (
              "Upgrade"
            )}
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default PricingNewBox;
