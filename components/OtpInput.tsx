import { useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
};

export function OtpInput({ value = "", onChange, error }: Props) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  /* ---------------- CHANGE ---------------- */
  const handleChange = (val: string, index: number) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newValue =
      value.substring(0, index) +
      val +
      value.substring(index + 1).padEnd(5 - index, "");

    onChange(newValue);

    // move forward automatically
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /* ---------------- BACKSPACE ---------------- */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  /* ---------------- PASTE SUPPORT ⭐ ---------------- */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "") // keep digits only
      .slice(0, 6); // max 6 digits

    if (!pasted) return;

    onChange(pasted);

    // focus last filled input
    const lastIndex = pasted.length - 1;
    inputsRef.current[lastIndex]?.focus();
  };

  return (
    <div className="flex gap-5">
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          value={value[i] || ""}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          maxLength={1}
          inputMode="numeric"
          className={`w-15.75 h-18 text-center text-xl rounded-lg
          bg-[#2D313A] text-white focus:outline-none
          ${error ? "border border-red-500" : "border border-slate-700"}`}
        />
      ))}
    </div>
  );
}
