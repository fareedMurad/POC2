"use client";

import { useState } from "react";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut } from "@/lib/apiServices";
import { useRouter } from "next/navigation";
import LogoutIcon from "@/public/log-out.svg";
import LogoutLightIcon from "@/public/logout-light.svg";
import HomeIcon from "@/public/home.svg";
import HomeLightIcon from "@/public/home-light.svg";

export default function HomeHeader(authToken: string) {
  const [open, setOpen] = useState(false);
  const [isProceesing, setIsProcessing] = useState(false);

  const router = useRouter();

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
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
    }
  };

  return (
    <header className="border-b border-background-border bg-background-default px-6 py-4 md:px-24 md:pt-7">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="focus:outline-none">
          <Image
            src={Logo}
            alt="Logo"
            className="w-40 h-12 md:w-47.5 md:h-13.75"
            priority
          />
        </Link>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center mt-3">
          {authToken?.authToken ? (
            <Link href={"/home"} className="ml-4 focus:outline-none">
              <button className="group w-full h-10 rounded-md border border-[#68AD5C] text-lg font-medium transition cursor-pointer hover:bg-[#68AD5C] disabled:opacity-50 flex items-center justify-center px-6 text-[#68AD5C] hover:text-white focus:outline-none">
                {/* Default Icon */}
                <Image
                  src={HomeIcon}
                  className="h-4.5 w-4.5 group-hover:hidden"
                  alt="icon"
                />

                {/* Hover Icon */}
                <Image
                  src={HomeLightIcon}
                  className="h-4.5 w-4.5 hidden group-hover:block"
                  alt="icon"
                />

                <span className="text-[16.5px] ml-1.5">Home</span>
              </button>
            </Link>
          ) : (
            <Link href={"/register"} className="focus:outline-none">
              <button className="h-10 w-43 rounded-md border border-[#68AD5C] text-[16px] font-medium transition cursor-pointer text-[#68AD5C] ml-6 hover:bg-[#68AD5C] hover:text-white focus:outline-none">
                Try Praktice Free
              </button>
            </Link>
          )}

          {authToken?.authToken ? (
            <button
              className="ml-4 group w-full h-10 rounded-md border font-medium transition cursor-pointer bg-[#68AD5C] text-white disabled:opacity-50 flex items-center justify-center px-4 hover:bg-[#008236] hover:text-white focus:outline-none"
              onClick={(e) => handleSignOut(e)}
              disabled={isProceesing}
            >
              {/* Hover Icon */}
              <Image src={LogoutLightIcon} className="h-4.6 w-4.5" alt="icon" />

              <span className="text-[16.5px] ml-2">Log out</span>
            </button>
          ) : (
            <Link href={"/login"} className="focus:outline-none">
              <button className="ml-4 h-10 rounded-md border px-4 bg-[#68AD5C] text-[16px] font-medium text-white hover:bg-[#008236] focus:outline-none">
                Log in
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden mt-4 flex flex-col gap-4 border-t pt-4">
          {authToken?.authToken ? (
            <Link href={"/home"} className="focus:outline-none">
              <button className="group w-full h-10 rounded-md border border-[#68AD5C] text-lg font-medium transition cursor-pointer hover:bg-[#68AD5C] disabled:opacity-50 flex items-center justify-center px-6 text-[#68AD5C] hover:text-white focus:outline-none">
                {/* Default Icon */}
                <Image
                  src={HomeIcon}
                  className="h-5 w-5 group-hover:hidden"
                  alt="icon"
                />

                {/* Hover Icon */}
                <Image
                  src={HomeLightIcon}
                  className="h-5 w-5 hidden group-hover:block"
                  alt="icon"
                />

                <span className="text-[16px] ml-1.5">Home</span>
              </button>
            </Link>
          ) : (
            <Link href={"/register"} className="focus:outline-none">
              <button className="w-full h-10 rounded-md border border-[#68AD5C] bg-[#68AD5C] hover:bg-[#008236] text-lg font-medium transition cursor-pointer text-white focus:outline-none">
                Try Praktice Free
              </button>
            </Link>
          )}
          {authToken?.authToken ? (
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
          ) : (
            <Link href={"/login"} className="focus:outline-none">
              <button className="w-full h-12 rounded-md border px-4 border-[#68AD5C] text-lg font-medium hover:bg-[#68AD5C] hover:text-white text-[#68AD5C] focus:outline-none">
                Log in
              </button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
