"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
    targetDate: Date;
    title: string;
    message?: string;
}

export default function Countdown({ targetDate, title, message }: CountdownProps) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const diff = Math.max(0, targetDate.getTime() - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (diff <= 0) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded text-center mb-8">
                <p className="text-lg font-semibold text-red-700">{title}は終了しました。</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded text-center mb-8">
            <p className="text-lg font-semibold text-amber-900">{title}</p>
            {message && <p className="mt-1 text-amber-700 text-sm">{message}</p>}
            <div className="mt-3 flex justify-center gap-4">
                <div className="flex flex-col">
                    <span className="text-3xl font-mono font-bold text-amber-900">{days}</span>
                    <span className="text-xs text-amber-700">日</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-3xl font-mono font-bold text-amber-900">{String(hours).padStart(2, "0")}</span>
                    <span className="text-xs text-amber-700">時間</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-3xl font-mono font-bold text-amber-900">{String(minutes).padStart(2, "0")}</span>
                    <span className="text-xs text-amber-700">分</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-3xl font-mono font-bold text-amber-900">{String(seconds).padStart(2, "0")}</span>
                    <span className="text-xs text-amber-700">秒</span>
                </div>
            </div>
        </div>
    );
}
