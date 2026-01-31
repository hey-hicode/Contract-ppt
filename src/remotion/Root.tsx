import { Composition } from "remotion";
import { ContractSummary } from "./ContractSummary/Main";
import "./style.css";

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="ContractSummary"
                component={ContractSummary as any}
                durationInFrames={450} // 15 seconds at 30 fps
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
