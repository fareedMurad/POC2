"use client";

import { useState } from "react";
import Image from "next/image";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import checkCircle from "@/public/circle.svg";
import checkIcon from "@/public/check.svg";
import xCircel from "@/public/x-circle.svg";
import Link from "next/link";
import TermsModal from "@/components/TermsModal";
import Logo from "@/public/logo.svg";
import { useRouter } from "next/navigation";
import {
  getLegalDocuments,
  registerUser as registerUserApi,
} from "@/lib/apiServices";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])[^\s]{8,16}$/;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const RegisterSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be 3–30 characters")
    .max(30, "Name must be 3–30 characters")
    .required("Name is required"),

  email: Yup.string()
    .matches(emailRegex, "Invalid Email Address")
    .min(5, "Email must be 5–40 characters")
    .max(40, "Email must be 5–40 characters")
    .required("Email is required"),

  password: Yup.string()
    .matches(passwordRegex, "Invalid password")
    .required("Password is required"),

  terms: Yup.boolean().oneOf([true], "You must accept Terms and Conditions"),
});

/* -------------------- Page -------------------- */
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState<string>("");

  const router = useRouter();

  const fetchLegalDocuments = async () => {
    setShowTermsModal(true);
    setIsLoading(true);
    try {
      const result = await getLegalDocuments();

      if (result?.legalDocuments) {
        setTermsContent(result?.legalDocuments?.TermsAndConditions);
      }
    } catch (error) {
      console.error("Error fetching AI feedback:", error);
      // setErrorAI("Failed to load AI feedback");
    } finally {
      setIsLoading(false);
    }
  };

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
            Create Your Account
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
              name: "",
              email: "",
              password: "",
              terms: false,
            }}
            validationSchema={RegisterSchema}
            onSubmit={async (values) => {
              setIsSubmitting(true);
              setServerError(null);

              try {
                const result = await registerUserApi(
                  values.email,
                  values.name,
                  values.password
                );

                if (!result?.operationSuccessful) {
                  setServerError(
                    result?.errorMessage || "Registration failed."
                  );
                  return;
                }

                // ✅ Save verification id (PDF flow requirement)
                localStorage.setItem(
                  "verificationRequestId",
                  result?.verificationRequestId
                );

                // ✅ Go to verification screen
                router.push("/emailverification");
              } catch (error) {
                console.log("error", error);
                setServerError(
                  error?.message || "Something went wrong. Please try again."
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
                  {/* Name */}
                  <div className="pb-5 pt-2">
                    <label className="text-[15px] font-medium text-white mb-1 block">
                      Name
                    </label>
                    <Field
                      name="name"
                      className={`w-full h-11 rounded-md px-4 text-white bg-[#2D313A] focus:outline-none placeholder:text-[#BBBBBB] ${
                        errors.name && touched.name
                          ? "border border-red-500"
                          : "border border-slate-700"
                      }`}
                    />
                    {errors.name && touched.name && (
                      <p className="mt-1 text-xs text-[#FF3B3B]">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="pb-5 pt-2">
                    <label className="text-[15px] font-medium text-white mb-1 block">
                      Email
                    </label>
                    <Field
                      name="email"
                      type="text"
                      autoComplete="new-email"
                      className={`w-full h-11 rounded-md px-4 text-white bg-[#2D313A] focus:outline-none placeholder:text-[#BBBBBB] ${
                        errors.email && touched.email
                          ? "border border-red-500"
                          : "border border-slate-700"
                      }`}
                    />
                    {errors.email && touched.email && (
                      <p className="mt-1 text-xs text-[#FF3B3B]">
                        {errors.email}
                      </p>
                    )}
                  </div>

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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBBBBB] cursor-pointer focus:outline-none"
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

                  {/* Terms */}
                  <label className="flex items-center gap-3 text-[15px] text-white mt-8 cursor-pointer select-none">
                    <Field type="checkbox" name="terms">
                      {({ field }: any) => (
                        <>
                          <input
                            {...field}
                            type="checkbox"
                            className="hidden peer"
                          />

                          <div className="w-6 h-6 rounded-md border-2 border-gray-400 flex items-center justify-center peer-checked:border-[#68AD5C]">
                            {field.value && (
                              <Image
                                src={checkIcon}
                                alt="check"
                                className="h-5 w-5"
                              />
                            )}
                          </div>
                        </>
                      )}
                    </Field>

                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        fetchLegalDocuments();
                      }}
                    >
                      I agree to{" "}
                      <span className="underline">terms and conditions</span>
                    </span>
                  </label>

                  {errors.terms && touched.terms && (
                    <p className="mt-1 text-xs text-[#FF3B3B]">
                      {errors.terms}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-md bg-[#68AD5C] text-white cursor-pointer text-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center focus:outline-none"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Register"
                    )}
                  </button>

                  <p className="text-center text-sm text-[#BBBBBB] mt-8">
                    Already have an account?{" "}
                    <Link
                      href={"/login"}
                      className="text-white cursor-pointer focus:outline-none"
                    >
                      Log in
                    </Link>
                  </p>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
      <TermsModal
        open={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        content={termsContent}
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
