"use client";

import React, { useMemo } from "react";
import { Player } from "@remotion/player";
import { ContractSummary } from "../../remotion/ContractSummary/Main";

interface RedFlag {
    type: "critical" | "warning" | "minor";
    title: string;
    description: string;
}

interface AnalysisResult {
    redFlags: RedFlag[];
    overallRisk: "low" | "medium" | "high";
    summary: string;
    recommendations: string[];
}

interface VideoSummaryProps {
    analysis: AnalysisResult;
    title: string;
}

export const VideoSummary: React.FC<VideoSummaryProps> = ({ analysis, title }) => {
    const inputProps = useMemo(() => ({
        title: title || "Contract Analysis",
        summary: analysis.summary || "No summary available.",
        overallRisk: analysis.overallRisk || "low",
        redFlags: analysis.redFlags || [],
        recommendations: analysis.recommendations || [],
    }), [analysis, title]);

    return (
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black border-4 border-slate-200">
            <Player
                component={ContractSummary}
                inputProps={inputProps}
                durationInFrames={660}
                fps={30}
                compositionWidth={1280}
                compositionHeight={720}
                style={{
                    width: "100%",
                    height: "100%",
                }}
                controls
                autoPlay
                loop
            />
        </div>
    );
};
