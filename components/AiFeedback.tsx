import { Zap, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AiFeedback() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-[#24282e] p-6 border border-background-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Overall Score</p>
              <p className="mt-2 text-3xl font-bold text-white">8.5/10</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="rounded-lg bg-[#24282e] p-6 border border-background-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Clarity</p>
              <p className="mt-2 text-3xl font-bold text-white">9/10</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="rounded-lg bg-[#24282e] p-6 border border-background-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Engagement</p>
              <p className="mt-2 text-3xl font-bold text-white">7.5/10</p>
            </div>
            <Zap className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="rounded-lg bg-[#24282e] p-6 border border-background-border">
        <h3 className="mb-4 text-lg font-semibold text-white">Strengths</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Excellent Structure</p>
              <p className="text-sm text-slate-400">
                Your presentation has a clear beginning, middle, and end with
                smooth transitions between topics.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Strong Vocal Delivery</p>
              <p className="text-sm text-slate-400">
                Good pacing and tone variation helps maintain audience interest
                throughout the presentation.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Relevant Examples</p>
              <p className="text-sm text-slate-400">
                You provide concrete examples that support your main points
                effectively.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-[#24282e] p-6 border border-background-border">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Areas for Improvement
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Engagement with Audience</p>
              <p className="text-sm text-slate-400">
                Consider adding interactive elements or rhetorical questions to
                further engage your audience.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Visual Aid Quality</p>
              <p className="text-sm text-slate-400">
                Some slides could use more compelling visuals or reduced text
                density for better impact.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-[#24282e] p-6 border border-background-border">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Recommendations
        </h3>
        <ul className="space-y-2 text-slate-300">
          <li className="flex gap-2">
            <span className="text-green-500">→</span>
            Practice more gestures and body language to complement your verbal
            message
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">→</span>
            Reduce the amount of text on slides—aim for no more than 5 bullet
            points per slide
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">→</span>
            Include a memorable closing statement that reinforces your key
            message
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">→</span>
            Vary your vocal tone more to emphasize important concepts
          </li>
        </ul>
      </div>
    </div>
  );
}
