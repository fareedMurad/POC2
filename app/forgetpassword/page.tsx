"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import { verifyEmailForPasswordReset } from "@/lib/apiServices";
import { useRouter } from "next/navigation";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/* -------------------- Validation -------------------- */
const ForgetPasswordSchema = Yup.object({
  email: Yup.string()
    .matches(emailRegex, "Invalid Email Address")
    .required("Email is required")
    .min(5, "Email must be at least 5 characters")
    .max(40, "Email must be at most 40 characters")
    .email("Invalid email format"),
});

/* -------------------- Page -------------------- */
export default function ForgetPasswordPage() {
  const [serverError, setServerError] = useState<string | null>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <h1 className="text-white text-2xl font-semibold text-center mb-5">
            Reset Your Password
          </h1>
          <p className="text-[13px] text-[#BBBBBB] text-center mb-8">
            We'll send a verification code to your email address
          </p>

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
              email: "",
            }}
            validationSchema={ForgetPasswordSchema}
            onSubmit={async (values) => {
              setIsSubmitting(true);
              setServerError(null);

              try {
                const result = await verifyEmailForPasswordReset(values.email);

                if (result?.verificationRequestId)
                  localStorage.setItem(
                    "verificationRequestId",
                    result?.verificationRequestId
                  );

                if (result?.operationSuccessful) {
                  // go to reset password page
                  router.push("/resetpassword");
                }
              } catch (e: any) {
                setServerError(
                  e?.message || "Something went wrong. Please try again."
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {({ errors, touched, values }) => {
              return (
                <Form autoComplete="off" className="space-y-5">
                  {/* Email */}
                  <div className="pb-5">
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

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-md bg-[#68AD5C] text-white cursor-pointer text-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center focus:outline-none"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </button>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
