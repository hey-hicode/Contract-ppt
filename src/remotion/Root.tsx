import { Composition } from "remotion";
import { ContractSummary } from "./ContractSummary/Main";
import "./style.css";

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="ContractSummary"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                component={ContractSummary as any}
                durationInFrames={660}
                fps={30}
                width={1280}
                height={720}
                defaultProps={{
                    title: "Contract Analysis",
                    summary: "Summary of the contract analysis will appear here.",
                    overallRisk: "low" as const,
                    redFlags: [],
                    recommendations: [],
                }}
            />
        </>
    );
};
