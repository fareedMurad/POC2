"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import checkCircle from "@/public/circle.svg";
import xCircel from "@/public/x-circle.svg";
import TermsModal from "@/components/TermsModal";
import Logo from "@/public/logo.svg";
import { resetPassword } from "@/lib/apiServices";
import { useRouter } from "next/navigation";

/* -------------------- Validation -------------------- */
const NewPasswordSchema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be 8–16 characters")
    .max(16, "Password must be 8–16 characters")
    .matches(/^\S*$/, "Password Password cannot contain spaces")
    .matches(/[A-Z]/, "Must contain at least 1 uppercase letter")
    .matches(/[0-9]/, "Must contain at least 1 number")
    .matches(
      /[!@#$%^&*()\-_=+\[\]{}|;:'",.<>/?]/,
      "Must contain at least 1 special character"
    ),

  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

/* -------------------- Page -------------------- */
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [serverError, setServerError] = useState<string | null>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex flex-col">
      <header className="border-b border-background-border bg-background-default px-6 py-4 md:px-12 md:pt-7">
        <Link href="/" className="focus:outline-none">
          <Image
            src={Logo}
            alt="Logo"
            className="w-40 h-12 md:w-47.5 md:h-13.75"
            priority
          />
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-3 md:px-4 py-5 md:py-10">
        <div className="w-full max-w-lg bg-[#25282E] rounded-xl px-4 md:px-8 py-8 md:py-16">
          <h1 className="text-white text-2xl font-semibold text-center mb-6">
            Set New Password
          </h1>

          {serverError && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-red-900/20 p-3 text-[#FF3B3B] border border-red-900/40">
              <AlertCircle className="h-4 w-4" />
              <p className="text-[15px] flex-1">{serverError}</p>
              <button
                onClick={() => setServerError(null)}
                className="text-sm hover:text-red-300"
              >
                ×
              </button>
            </div>
          )}

          <Formik
            initialValues={{
              password: "",
              confirmPassword: "",
            }}
            validationSchema={NewPasswordSchema}
            onSubmit={async (values) => {
              setIsSubmitting(true);
              setServerError(null);

              try {
                const verificationRequestId = localStorage.getItem(
                  "verificationRequestId"
                );

                if (!verificationRequestId) {
                  setServerError(
                    "Verification session expired. Please register again."
                  );
                  return;
                }
                await resetPassword(verificationRequestId, values.password);

                // success → go login
                router.push("/login");
              } catch (e: any) {
                setServerError(
                  e?.message || "Failed to reset password. Try again."
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {({ errors, touched, values }) => {
              /* -------- Password Checks -------- */
              const hasInput = values.password.length > 0;

              const passwordChecks = {
                length:
                  hasInput &&
                  values.password.length >= 8 &&
                  values.password.length <= 16,
                uppercase: hasInput && /[A-Z]/.test(values.password),
                lowercase: hasInput && /[a-z]/.test(values.password),
                number: hasInput && /\d/.test(values.password),
                special:
                  hasInput &&
                  /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(values.password),
                noSpaces: hasInput && !/\s/.test(values.password),
              };

              return (
                <Form autoComplete="off" className="space-y-5">
                  {/* Password */}
                  <div>
                    <label className="text-[15px] font-medium text-white mb-1 block">
                      Password
                    </label>

                    <div className="relative">
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        maxLength={16}
                        className="w-full h-11 rounded-md px-4 pr-10 bg-[#2D313A] text-white border border-slate-700 focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 focus:outline-none"
                      >
                        {showPassword ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Bars */}
                    <div className="flex gap-3 mt-3 mb-4">
                      {Object.keys(passwordChecks).map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 max-w-17.5 flex-1 rounded-full transition-all duration-300 ${
                            index <
                            Object.values(passwordChecks).filter(Boolean).length
                              ? "bg-[#78A780]"
                              : "bg-[#3A3F47]"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Password Rules */}
                    <div className="space-y-2 text-sm font-medium">
                      <Rule ok={passwordChecks.length}>
                        Password must be 8 - 16 characters
                      </Rule>
                      <Rule ok={passwordChecks.uppercase}>
                        Password must contain an uppercase letter
                      </Rule>
                      <Rule ok={passwordChecks.lowercase}>
                        Password must contain a lowercase letter
                      </Rule>
                      <Rule ok={passwordChecks.number}>
                        Password must contain a number
                      </Rule>
                      <Rule ok={passwordChecks.special}>
                        Password must contain a special character
                      </Rule>
                      <Rule ok={passwordChecks.noSpaces}>
                        Password cannot contain spaces
                      </Rule>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mt-6">
                    <label className="text-[15px] font-medium text-white mb-1 block">
                      Confirm Password
                    </label>

                    <div className="relative">
                      <Field
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        maxLength={16}
                        className={`w-full h-11 rounded-md px-4 pr-10 bg-[#2D313A] text-white focus:outline-none ${
                          errors.confirmPassword && touched.confirmPassword
                            ? "border border-red-500"
                            : "border border-slate-700"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="mt-1 text-xs text-[#FF3B3B]">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-md bg-[#68AD5C] text-white cursor-pointer text-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center focus:outline-none"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Done"
                    )}
                  </button>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
      <TermsModal
        open={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
}

/* -------------------- Rule Component -------------------- */
function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`flex items-center gap-3 transition-colors ${
        ok ? "text-[#78A780]" : "text-[#FF3B3B]"
      }`}
    >
      {ok ? (
        <Image src={checkCircle} alt="check" width={24} height={24} />
      ) : (
        <Image src={xCircel} alt="check" width={24} height={24} />
      )}
      <span>{children}</span>
    </div>
  );
}
