import { AbsoluteFill, Series, interpolate, useCurrentFrame, useVideoConfig, spring, Sequence } from "remotion";
import React from "react";
import { loadFont } from "@remotion/google-fonts/Outfit";

const { fontFamily } = loadFont();

interface RedFlag {
    type: "critical" | "warning" | "minor";
    title: string;
    description: string;
}

interface Props {
    title: string;
    summary: string;
    overallRisk: "low" | "medium" | "high";
    redFlags: RedFlag[];
    recommendations: string[];
}

const Slide: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    const scale = spring({
        frame,
        fps,
        config: {
            damping: 15,
            stiffness: 100,
        },
    });

    return (
        <AbsoluteFill
            style={{
                opacity,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 100px",
                fontFamily,
                background: bg || "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "white"
            }}
        >
            <div style={{ transform: `scale(${scale})`, width: "100%", textAlign: "center" }}>
                {children}
            </div>
        </AbsoluteFill>
    );
};

const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => {
    const colors = {
        high: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444" },
        medium: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b" },
        low: { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "#10b981" },
    };
    const c = colors[risk as keyof typeof colors] || colors.low;

    return (
        <div style={{
            display: "inline-block",
            padding: "10px 30px",
            borderRadius: "10px",
            backgroundColor: c.bg,
            color: c.color,
            border: `2px solid ${c.border}`,
            fontSize: "28px",
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: "4px",
            backdropFilter: "blur(10px)",
        }}>
            {risk} Risk
        </div>
    );
};

// Sonner-style toast notification for red flags
const SonnerCard: React.FC<{ flag: RedFlag; delay: number }> = ({ flag, delay }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const slideIn = spring({
        frame: frame - delay,
        fps,
        config: {
            damping: 20,
            stiffness: 200,
        },
    });

    const typeColors = {
        critical: { icon: "🔴", bg: "rgba(239, 68, 68, 0.1)", border: "#ef4444", text: "#fecaca" },
        warning: { icon: "⚠️", bg: "rgba(245, 158, 11, 0.1)", border: "#f59e0b", text: "#fde68a" },
        minor: { icon: "ℹ️", bg: "rgba(59, 130, 246, 0.1)", border: "#3b82f6", text: "#93c5fd" },
    };

    const colors = typeColors[flag.type] || typeColors.minor;

    return (
        <div style={{
            transform: `translateX(${(1 - slideIn) * 100}px)`,
            opacity: slideIn,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            padding: "24px 28px",
            borderRadius: "16px",
            border: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "flex-start",
            gap: "20px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            marginBottom: "16px",
            width: "100%",
        }}>
            <div style={{
                fontSize: "32px",
                flexShrink: 0,
                marginTop: "2px"
            }}>
                {colors.icon}
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px"
                }}>
                    <h3 style={{
                        fontSize: "26px",
                        fontWeight: "700",
                        color: "white",
                        margin: 0,
                        lineHeight: "1.2"
                    }}>
                        {flag.title}
                    </h3>
                    <span style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: colors.text,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`
                    }}>
                        {flag.type}
                    </span>
                </div>
                <p style={{
                    fontSize: "20px",
                    color: "#94a3b8",
                    margin: 0,
                    lineHeight: "1.5"
                }}>
                    {flag.description}
                </p>
            </div>
        </div>
    );
};

// Sonner-style recommendation card
const RecommendationCard: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const slideIn = spring({
        frame: frame - delay,
        fps,
        config: {
            damping: 20,
            stiffness: 200,
        },
    });

    return (
        <div style={{
            transform: `translateX(${(1 - slideIn) * 100}px)`,
            opacity: slideIn,
            backgroundColor: "rgba(74, 108, 247, 0.1)",
            backdropFilter: "blur(12px)",
            padding: "24px 28px",
            borderRadius: "16px",
            border: "1px solid #4a6cf7",
            display: "flex",
            alignItems: "flex-start",
            gap: "20px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            marginBottom: "16px",
            width: "100%",
        }}>
            <div style={{
                fontSize: "32px",
                flexShrink: 0,
                marginTop: "2px"
            }}>
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
                <p style={{
                    fontSize: "24px",
                    color: "#e2e8f0",
                    margin: 0,
                    lineHeight: "1.5",
                    fontWeight: "600"
                }}>
                    {text}
                </p>
            </div>
        </div>
    );
};

export const ContractSummary: React.FC<Props> = ({
    title,
    summary,
    overallRisk,
    redFlags = [],
    recommendations = [],
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: "#020617", fontFamily }}>
            {/* Elegant Background Animation */}
            <AbsoluteFill>
                <div style={{
                    position: "absolute",
                    top: "-20%",
                    right: "-10%",
                    width: "800px",
                    height: "800px",
                    background: "radial-gradient(circle, rgba(74, 108, 247, 0.1) 0%, transparent 70%)",
                    filter: "blur(80px)",
                    transform: `translateY(${Math.sin(frame / 50) * 20}px)`,
                }} />
                <div style={{
                    position: "absolute",
                    bottom: "-20%",
                    left: "-10%",
                    width: "700px",
                    height: "700px",
                    background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)",
                    filter: "blur(80px)",
                    transform: `translateY(${Math.cos(frame / 40) * 25}px)`,
                }} />
            </AbsoluteFill>

            {/* Subtle Progress Bar */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "6px",
                background: "linear-gradient(90deg, #4a6cf7, #0ea5e9)",
                width: `${(frame / durationInFrames) * 100}%`,
                zIndex: 100,
            }} />

            <Series>
                {/* Intro Slide - 120 frames (4 seconds) */}
                <Series.Sequence durationInFrames={120}>
                    <Slide>
                        <div style={{ marginBottom: "20px" }}>
                            <span style={{ fontSize: "24px", color: "#4a6cf7", fontWeight: "bold", letterSpacing: "8px", textTransform: "uppercase" }}>Analysis Report</span>
                        </div>
                        <h1 style={{
                            fontSize: "60px",
                            fontWeight: "900",
                            color: "white",
                            marginBottom: "50px",
                            lineHeight: "1.2",
                            maxWidth: "1000px",
                            margin: ""
                        }}>
                            {title}
                        </h1>

                    </Slide>
                </Series.Sequence>

                {/* Executive Summary - 150 frames (5 seconds) */}
                <Series.Sequence durationInFrames={150}>
                    <Slide bg="linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)">
                        <div style={{ textAlign: "left", width: "100%" }}>
                            <h2 style={{ fontSize: "24px", color: "#4a6cf7", fontWeight: "900", marginBottom: "40px", letterSpacing: "4px", textTransform: "uppercase" }}>Executive Summary</h2>
                            <p style={{
                                fontSize: "38px",
                                color: "#e2e8f0",
                                lineHeight: "1.4",
                                fontWeight: "500",
                                borderLeft: "8px solid #4a6cf7",
                                paddingLeft: "40px"
                            }}>
                                {summary}
                            </p>
                        </div>
                    </Slide>
                </Series.Sequence>

                {/* Key Risks Slide - 210 frames (7 seconds) */}
                <Series.Sequence durationInFrames={210}>
                    <Slide bg="linear-gradient(135deg, #020617 0%, #0f172a 100%)">
                        <div style={{ width: "100%", textAlign: "left" }}>
                            <h2 style={{ fontSize: "32px", color: "white", marginBottom: "50px", fontWeight: "900" }}>Critical Insights</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                                {(redFlags.length > 0 ? redFlags : [
                                    { type: "minor" as const, title: "No critical red flags", description: "This contract segment appears standard." }
                                ]).slice(0, 2).map((flag, i) => (
                                    <SonnerCard key={i} flag={flag} delay={i * 25} />
                                ))}
                            </div>
                        </div>
                    </Slide>
                </Series.Sequence>

                {/* Recommendations Slide - 180 frames (6 seconds) */}
                <Series.Sequence durationInFrames={180}>
                    <Slide bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)">
                        <div style={{ width: "100%", textAlign: "left" }}>
                            <h2 style={{ fontSize: "32px", color: "white", marginBottom: "50px", fontWeight: "900" }}>Recommended Actions</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                                {(recommendations.length > 0 ? recommendations : ["Professional review advised"]).slice(0, 3).map((rec, i) => (
                                    <RecommendationCard key={i} text={rec} delay={i * 20} />
                                ))}
                            </div>
                        </div>
                    </Slide>
                </Series.Sequence>
            </Series>

            {/* Counselr Branding */}
            <div style={{
                position: "absolute",
                bottom: "40px",
                right: "40px",
                opacity: 0.8,
                display: "flex",
                alignItems: "center",
                gap: "10px"
            }}>
                <div style={{ width: "30px", height: "30px", backgroundColor: "#4a6cf7", borderRadius: "8px" }} />
                <span style={{ color: "white", fontSize: "22px", fontWeight: "900", letterSpacing: "2px" }}>COUNSELR</span>
            </div>
        </AbsoluteFill>
    );
};
