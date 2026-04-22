import PresentaionIcon from "@/public/presentations.svg";
import Image from "next/image";

type Props = {
  value: number;
  total: number;
  title: string;
  icon: any;
};

export function ProfileCard({ value, total, title = "", icon }: Props) {
  const percentage = total ? (value / total) * 100 : 0;

  return (
    <div className="bg-[#1A1D23] rounded-[14px] px-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-6.5 h-6 bg-[#25282E] flex justify-center items-center rounded-xl">
            <Image src={icon} className="w-4 h-4" alt={title} />
          </div>
          <p className="text-[16px] font-semibold ml-2">{title}</p>
        </div>
        <p className="text-xs">
          <span className="font-bold">{value}</span> / {total}
        </p>
      </div>
      <div className="bg-[#3F3F3F] w-full h-2.5 rounded-full my-6 overflow-hidden">
        <div
          className="bg-[#68AD5C] h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
