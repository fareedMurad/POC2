import Image from "next/image";
import Logo from "@/public/logo.svg";
import Link from "next/link";
import HeaderButton from "./headerButton";
import HomeIcon from "@/public/home.svg";
import HomeLightIcon from "@/public/home-light.svg";
import RehearsalIcon from "@/public/Rehearse.svg";
import RehearsalLightIcon from "@/public/rehease-light.svg";
import UsersIcon from "@/public/user.svg";
import UserLightIcon from "@/public/user-light.svg";
import HelpIcon from "@/public/help-circle.svg";
import HelpLightIcon from "@/public/help-light.svg";
import LogoutIcon from "@/public/log-out.svg";
import LogoutLightIcon from "@/public/logout-light.svg";
import { signOut } from "@/lib/apiServices";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isProceesing, setIsProcessing] = useState(false);

  const handleSignOut = async (e: Event) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await signOut();
      console.log("Successfully signed Out!");
      localStorage.removeItem("authToken");
      document.cookie =
        "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push("/");
      setIsProcessing(false);
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
    }
  };

  const RehearseToolLink = process.env.NEXT_PUBLIC_REHEARSAL_TOOL_URL;
  const HelpToolLink = process.env.NEXT_PUBLIC_HELP_KNOWLEDGEBASE_URL;

  return (
    <header className="border-b border-background-border bg-background-default py-4 px-6 md:pt-7 md:px-10">
      <div className="flex items-center justify-between">
        <Link href={"/"} className="focus:outline-none">
          <Image
            src={Logo}
            alt="Logo"
            className="w-40 h-12 md:w-47.5 md:h-13.75"
          />
        </Link>
        <div className="hidden md:flex items-between">
          <div className="flex justify-end w-full mt-3">
            <HeaderButton
              link={"/home"}
              openInNewtab={false}
              icon={HomeIcon}
              lightIcon={HomeLightIcon}
              title="Home"
            />
            <HeaderButton
              link={"/profile"}
              openInNewtab={false}
              icon={UsersIcon}
              lightIcon={UserLightIcon}
              title="Profile"
            />
            <HeaderButton
              link={HelpToolLink}
              openInNewtab={true}
              icon={HelpIcon}
              lightIcon={HelpLightIcon}
              title="Help"
            />
            <div className="ml-4">
              <button
                className="group w-full h-10 rounded-md border border-[#68AD5C] text-lg font-medium transition cursor-pointer hover:bg-[#68AD5C] disabled:opacity-50 flex items-center justify-center px-4 text-[#68AD5C] hover:text-white focus:outline-none"
                onClick={(e) => handleSignOut(e)}
                disabled={isProceesing}
              >
                {/* Default Icon */}
                <Image
                  src={LogoutIcon}
                  className="h-6 w-6 group-hover:hidden"
                  alt="icon"
                />

                {/* Hover Icon */}
                <Image
                  src={LogoutLightIcon}
                  className="h-6 w-6 hidden group-hover:block"
                  alt="icon"
                />

                <span className="text-[17.5px] ml-2">Log out</span>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden flex flex-col gap-4 border-t pt-4">
          <div className="w-full">
            <HeaderButton
              link={"/home"}
              openInNewtab={false}
              icon={HomeIcon}
              lightIcon={HomeLightIcon}
              title="Home"
            />
            <HeaderButton
              link={RehearseToolLink}
              openInNewtab={true}
              icon={RehearsalIcon}
              lightIcon={RehearsalLightIcon}
              title="Rehearse"
            />
            <HeaderButton
              link={"/profile"}
              openInNewtab={false}
              icon={UsersIcon}
              lightIcon={UserLightIcon}
              title="Profile"
            />
            <HeaderButton
              link={HelpToolLink}
              openInNewtab={true}
              icon={HelpIcon}
              lightIcon={HelpLightIcon}
              title="Help"
            />
            {/* <div className=""> */}
            <button
              className="group w-full h-10 mt-4 rounded-md border border-[#68AD5C] font-medium transition cursor-pointer hover:bg-[#68AD5C] disabled:opacity-50 flex items-center justify-center px-4 text-[#68AD5C] hover:text-white focus:outline-none"
              onClick={(e) => handleSignOut(e)}
              disabled={isProceesing}
            >
              {/* Default Icon */}
              <Image
                src={LogoutIcon}
                className="h-5 w-5 group-hover:hidden"
                alt="icon"
              />

              {/* Hover Icon */}
              <Image
                src={LogoutLightIcon}
                className="h-5 w-5 hidden group-hover:block"
                alt="icon"
              />

              <span className="text-[16px] ml-2">Log out</span>
            </button>
            {/* </div> */}
          </div>
        </div>
      )}
    </header>
  );
}
