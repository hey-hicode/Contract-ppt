"use client";

import { motion } from "framer-motion";

export function DashboardMotionWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
        >
            {children}
        </motion.div>
    );
}
