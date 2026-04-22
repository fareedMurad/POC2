"use client";

import { useState } from "react";
import { MessageSquare, ThumbsUp, Star } from "lucide-react";

interface Feedback {
  id: string;
  author: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
  helpful: number;
}

export default function PeerFeedback() {
  const [feedbackList] = useState<Feedback[]>([
    {
      id: "1",
      author: "Sarah Johnson",
      rating: 5,
      category: "Content",
      comment:
        "Amazing presentation! Your research was thorough and well-organized. The way you explained complex concepts was easy to follow.",
      timestamp: "2 hours ago",
      helpful: 12,
    },
    {
      id: "2",
      author: "Michael Chen",
      rating: 4,
      category: "Delivery",
      comment:
        "Great job overall! The content was strong, but I would suggest using more visual examples. Your voice was clear and engaging throughout.",
      timestamp: "4 hours ago",
      helpful: 8,
    },
    {
      id: "3",
      author: "Emma Wilson",
      rating: 5,
      category: "Engagement",
      comment:
        "You had great eye contact and your transitions between slides were smooth. The audience was clearly engaged the whole time!",
      timestamp: "6 hours ago",
      helpful: 15,
    },
    {
      id: "4",
      author: "Alex Martinez",
      rating: 4,
      category: "Structure",
      comment:
        "Good pacing and flow. Maybe consider a stronger opening hook to grab attention right from the start.",
      timestamp: "8 hours ago",
      helpful: 6,
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-[#24282e] p-6 border border-background-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Reviews</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {feedbackList.length}
              </p>
            </div>
            <MessageSquare className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="rounded-lg bg-[#24282e] p-6 border border-background-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Average Rating</p>
              <p className="mt-2 text-3xl font-bold text-white">4.5/5</p>
            </div>
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
        <div className="rounded-lg bg-[#24282e] p-6 border border-background-border">
          <div>
            <p className="text-sm text-slate-400">Top Feedback Category</p>
            <p className="mt-2 text-3xl font-bold text-white">Content</p>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Recent Feedback from Peers
        </h3>
        {feedbackList.map((feedback) => (
          <div
            key={feedback.id}
            className="rounded-lg bg-[#24282e] p-6 border border-background-border"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white">
                    {feedback.author}
                  </h4>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    {feedback.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {feedback.timestamp}
                </p>
              </div>
              <div className="flex gap-0.5">
                {[...Array(feedback.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-500 text-yellow-500"
                  />
                ))}
                {[...Array(5 - feedback.rating)].map((_, i) => (
                  <Star key={`empty-${i}`} className="h-4 w-4 text-slate-600" />
                ))}
              </div>
            </div>
            <p className="text-slate-300 mb-4">{feedback.comment}</p>
            <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-green-500 transition">
              <ThumbsUp className="h-4 w-4" />
              Helpful ({feedback.helpful})
            </button>
          </div>
        ))}
      </div>

      {/* Add Feedback Button */}
      <button className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700">
        Share Your Feedback
      </button>
    </div>
  );
}
