"use client";

import { useState } from "react";
import { Play, Volume2, Eye, Zap } from "lucide-react";

interface VideoAnalysis {
  id: string;
  timestamp: string;
  title: string;
  feedback: string;
  severity: "positive" | "neutral" | "improvement";
  icon: string;
}

interface VideoFeedbackProps {
  presentationTitle: string;
}

export default function VideoFeedback({
  presentationTitle,
}: VideoFeedbackProps) {
  const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>(
    null
  );

  const videoAnalyses: VideoAnalysis[] = [
    {
      id: "1",
      timestamp: "0:15",
      title: "Strong Opening",
      feedback:
        "Excellent hook that captures attention immediately. The opening statement is clear and sets expectations well.",
      severity: "positive",
      icon: "✓",
    },
    {
      id: "2",
      timestamp: "1:30",
      title: "Pacing Could Improve",
      feedback:
        "Speaking rate is a bit fast here. Consider slowing down to allow key points to sink in.",
      severity: "improvement",
      icon: "!",
    },
    {
      id: "3",
      timestamp: "3:45",
      title: "Excellent Eye Contact",
      feedback:
        "Great job maintaining natural eye contact with the audience during this section.",
      severity: "positive",
      icon: "✓",
    },
    {
      id: "4",
      timestamp: "4:20",
      title: "Body Language Suggestion",
      feedback:
        "Consider using hand gestures to emphasize the key point being made here.",
      severity: "improvement",
      icon: "!",
    },
    {
      id: "5",
      timestamp: "5:00",
      title: "Effective Conclusion",
      feedback:
        "Strong conclusion that reinforces your main message. Good call to action!",
      severity: "positive",
      icon: "✓",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "positive":
        return "bg-green-500/10 border-green-500/30 text-green-400";
      case "improvement":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      default:
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="rounded-lg bg-[#24282e] border border-background-border overflow-hidden">
        <div className="aspect-video bg-[#1F1F1F] flex items-center justify-center">
          <button className="flex flex-col items-center gap-2 hover:opacity-80 transition">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
            <p className="text-sm text-slate-400">
              Click to play presentation video
            </p>
          </button>
        </div>
        <div className="p-4 border-t border-background-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">
              {presentationTitle}
            </p>
            <span className="text-xs text-slate-400">5:32</span>
          </div>
          <div className="h-1 bg-[#24282e] rounded-full overflow-hidden">
            <div className="h-full w-2/5 bg-green-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Analysis Timeline */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">
          Frame-by-Frame Analysis
        </h3>
        <div className="space-y-3">
          {videoAnalyses.map((analysis) => (
            <button
              key={analysis.id}
              onClick={() => setSelectedTimestamp(analysis.id)}
              className={`w-full text-left rounded-lg border p-4 transition ${
                selectedTimestamp === analysis.id
                  ? "bg-[#24282e] border-green-500"
                  : "border-background-border hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-green-500 bg-[#1F1F1F] px-2 py-1 rounded">
                      {analysis.timestamp}
                    </span>
                    <h4 className="font-medium text-white">{analysis.title}</h4>
                  </div>
                  <p className="text-sm text-slate-400">{analysis.feedback}</p>
                </div>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${getSeverityColor(
                    analysis.severity
                  )}`}
                >
                  {analysis.severity === "positive" ? "✓" : "!"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="rounded-lg bg-[#24282e] p-6 border border-background-border">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Engagement Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-slate-300 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Eye Contact
              </p>
              <span className="text-white font-medium">78%</span>
            </div>
            <div className="h-2 bg-[#24282e] rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-green-600"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-slate-300 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Vocal Variety
              </p>
              <span className="text-white font-medium">82%</span>
            </div>
            <div className="h-2 bg-[#24282e] rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-green-600"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-slate-300 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Energy Level
              </p>
              <span className="text-white font-medium">85%</span>
            </div>
            <div className="h-2 bg-[#24282e] rounded-full overflow-hidden">
              <div className="h-full w-5/6 bg-green-600"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-slate-300">Pacing</p>
              <span className="text-white font-medium">72%</span>
            </div>
            <div className="h-2 bg-[#24282e] rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-yellow-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
