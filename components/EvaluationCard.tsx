import Clock from "@/public/clock.svg";
import CheckCircleOut from "@/public/check-circle-out.svg";
import Improvements from "@/public/improvements.svg";
import Image from "next/image";

const EvaluationCard = ({ item }: { item: any }) => {
  const splitBullets = (text?: string) => {
    if (!text || typeof text !== "string") return [];

    return text
      .split("|")
      .map((item) => item.trim())
      .filter((item) => item) // only remove empty values
      .map((item) => {
        if (item === "N/A" || item === "Not applicable") {
          return item; // keep as-is
        }
        return item; // normal values unchanged
      });
  };

  const assessment = splitBullets(item?.assessment);
  const strengths = splitBullets(item?.strengths);
  const improvements = splitBullets(item?.areas_for_improvement);

  console.log("assessment", assessment);

  return (
    <div className="bg-[#2D313A] rounded-lg p-6">
      {/* Title + Score */}
      <div className="flex justify-between items-start mb-6">
        <h4 className="text-white text-lg font-medium">
          {item?.objective_title || ""}
        </h4>

        {item?.score && (
          <span className="text-[#FF8C42] w-16.5 h-7.5 text-[16px] font-medium bg-[#3A2E2A] text-center px-2 py-1 rounded-full">
            {item.score}
          </span>
        )}
      </div>

      {/* Assessment */}
      {assessment.length > 0 && (
        <div className="mb-3">
          <p className="text-[16px] text-white font-medium my-4 flex items-center">
            <Image
              src={Improvements}
              className="mr-2 w-5.25 h-5.24"
              alt="Assessment"
            />{" "}
            Assessment:
          </p>
          <ul className="space-y-1 ml-6">
            {assessment.map((a: string, i: number) => {
              const formatted = a ? a.charAt(0).toUpperCase() + a.slice(1) : a;

              return (
                <li key={i} className="text-[#BBBBBB] text-lg flex">
                  <span className="w-1.75 h-1.75 bg-[#68AD5C] rounded-full mt-2 mr-2"></span>
                  {formatted}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mb-3">
          <p className="text-[16px] text-white font-medium my-4 flex items-center">
            <Image
              src={CheckCircleOut}
              className="mr-2 w-5.25 h-5.24"
              alt="Strengths"
            />
            Strengths:
          </p>
          <ul className="space-y-1 ml-6">
            {strengths.map((s: string, i: number) => {
              const formatted = s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

              return (
                <li key={i} className="text-[#BBBBBB] text-lg flex">
                  <span className="w-1.75 h-1.75 bg-[#68AD5C] rounded-full mt-2 mr-2"></span>
                  {formatted}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div>
          <p className="text-[16px] text-white font-medium my-4 flex items-center">
            <Image
              src={Clock}
              className="mr-2 w-5.25 h-5.24"
              alt="improvements"
            />{" "}
            Areas of improvements:
          </p>
          <ul className="space-y-1 ml-6">
            {improvements.map((imp: string, i: number) => {
              const formatted = imp
                ? imp.charAt(0).toUpperCase() + imp.slice(1)
                : imp;

              return (
                <li key={i} className="text-[#BBBBBB] text-lg flex">
                  <span className="w-1.75 h-1.75 bg-[#68AD5C] rounded-full mt-2 mr-2"></span>
                  {formatted}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EvaluationCard;
