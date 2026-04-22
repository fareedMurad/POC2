import Image from "next/image";
import Link from "next/link";

interface buttonTypes {
  link: string;
  icon: any;
  lightIcon: any;
  title: string;
  openInNewtab?: boolean;
}

const HeaderButton = ({
  link,
  icon,
  lightIcon,
  title,
  openInNewtab,
}: buttonTypes) => {
  return (
    <Link
      href={link}
      target={openInNewtab ? "_blank" : "_self"}
      className="ml-4 focus:outline-none"
    >
      <button className="group w-full h-10 rounded-md border border-[#68AD5C] font-medium transition cursor-pointer hover:bg-[#68AD5C] disabled:opacity-50 flex items-center justify-center px-4 text-[#68AD5C] hover:text-white focus:outline-none">
        {/* Default Icon */}
        <Image src={icon} className="h-5 w-5 group-hover:hidden" alt="icon" />

        {/* Hover Icon */}
        <Image
          src={lightIcon}
          className="h-5 w-5 hidden group-hover:block"
          alt="icon"
        />

        <span className="text-[16px] ml-1.5">{title}</span>
      </button>
    </Link>
  );
};

export default HeaderButton;
