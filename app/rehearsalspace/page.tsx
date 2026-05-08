import Image from "next/image";
import RehearsalImg from "@/public/thumbnail.png";
import RehearsalLightIcon from "@/public/rehease-light.svg";
import { ArrowLeft, ArrowRight, Info, LogOutIcon } from "lucide-react";

export default function RehearsalsSpace() {
  return (
    <div className="relative">
      <Image
        src={RehearsalImg}
        className="w-full h-screen"
        alt="RehearsalImg"
      />
      <div className="absolute top-5 left-5 w-34 h-14 bg-[#54545466] rounded-xl flex justify-center items-center">
        <p className="text-2xl font-semibold text-white">00:00</p>
      </div>
      <div className="absolute top-5 right-5 w-39 h-14 bg-[#FF2424] rounded-xl flex justify-center items-center">
        <p className="text-2xl font-semibold text-white">Record</p>
      </div>
      <div className="absolute bottom-5 right-5 flex items-center">
        <div className="bg-[#54545466] rounded-[6px] px-3 py-3">
          <Info className="text-2xl font-semibold text-white" />
        </div>
        <div className="bg-[#54545466] rounded-[6px] px-3 py-3 ml-2">
          <Image
            src={RehearsalLightIcon}
            alt="Rehearsal Light"
            className="text-2xl font-semibold text-white"
          />
        </div>
        <div className="bg-[#54545466] rounded-[6px] px-3 py-3 ml-2">
          <ArrowLeft className="text-2xl font-semibold text-white" />
        </div>
        <div className="bg-[#54545466] rounded-[6px] px-3 py-3 ml-2">
          <ArrowRight className="text-2xl font-semibold text-white" />
        </div>
        <div className="bg-[#54545466] rounded-[6px] px-3 py-3 ml-2">
          <LogOutIcon className="text-2xl font-semibold text-white" />
        </div>
      </div>
    </div>
  );
}
