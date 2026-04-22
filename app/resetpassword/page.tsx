"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { OtpInput } from "@/components/OtpInput";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import loaderImg from "@/public/loader.svg";
import {
  resendVerificationCode,
  validateVerificationCode,
} from "@/lib/apiServices";
import { useRouter } from "next/navigation";

/* -------------------- Validation -------------------- */
const ResetPasswordSchema = Yup.object({
  code: Yup.string()
    .length(6, "Invalid verification code")
    .matches(/^[0-9]+$/, "Invalid verification code")
    .required("Verification code is required"),
});

/* -------------------- Page -------------------- */
export default function ResetPasswordPage() {
  const [serverError, setServerError] = useState<string | null>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setSendingCode] = useState(false);
  const [isCodeSent, setCodeSent] = useState(false);

  const router = useRouter();

  const handleResednVerificationCode = async (e: Event) => {
    e.preventDefault();
    setSendingCode(true);

    try {
      const verificationRequestId = localStorage.getItem(
        "verificationRequestId"
      );

      if (!verificationRequestId) {
        setServerError("Verification session expired. Please register again.");
        return;
      }

      const result = await resendVerificationCode(verificationRequestId);

      if (!result?.operationSuccessful) {
        setServerError(result?.errorMessage || "Failed to resend code.");
        return;
      }

      // ✅ Save NEW verificationRequestId
      if (result?.verificationRequestId)
        localStorage.setItem(
          "verificationRequestId",
          result?.verificationRequestId
        );
      setCodeSent(true);
      console.log("New verificationRequestId saved");
    } catch (error: any) {
      // setServerError(error.message || "Something went wrong.");
    } finally {
      setSendingCode(false);
      setServerError(null);
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
        <div className="w-full max-w-137.5 bg-[#25282E] rounded-xl px-4 md:px-8 py-8 md:py-16">
          <h1 className="text-white text-2xl font-semibold text-center mb-5">
            Reset Your Password
          </h1>
          <p className="text-[13px] text-[#BBBBBB] text-center mb-8">
            A single-use passcode has been sent to your email. The code will
            expire in 30 minutes. Please check both your inbox and spam folder.
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
              code: "",
            }}
            validationSchema={ResetPasswordSchema}
            onSubmit={async (values) => {
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

                const verificationCode = values.code;

                // ✅ Call API ONLY after validation passes
                const result = await validateVerificationCode(
                  verificationRequestId,
                  verificationCode // make sure your API accepts code
                );

                if (!result?.operationSuccessful) {
                  setServerError(
                    result?.errorMessage ||
                      "Invalid or expired verification code."
                  );
                  return;
                }

                if (result?.resultCode === "0") {
                  setServerError(
                    result?.validationMessage ||
                      "Invalid or expired verification code."
                  );
                } else {
                  // ✅ Success → redirect
                  router.push("/newpassword");
                }
              } catch (error) {
                setServerError("Invalid or expired verification code.");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {({ errors, touched, values, setFieldValue }) => {
              return (
                <Form autoComplete="off" className="space-y-5">
                  {/* Code */}
                  <div className="pb-5 pt-2">
                    <label className="text-[15px] font-medium text-white mb-3 block">
                      Code
                    </label>

                    <OtpInput
                      value={values.code}
                      onChange={(val) => setFieldValue("code", val)}
                      error={!!(errors.code && touched.code)}
                    />

                    {errors.code && touched.code && (
                      <p className="mt-3 text-xs text-[#FF3B3B]">
                        {errors.code}
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
                      "Verify Now"
                    )}
                  </button>
                  {isSendingCode ? (
                    <div className="flex justify-center items-center py-12">
                      <Image
                        src={loaderImg}
                        alt="loader"
                        className="w-4 h-4 animate-spin"
                      />
                      <p className="text-sm font-medium ml-1 text-slate-400">
                        Sending new verification code
                      </p>
                    </div>
                  ) : isCodeSent ? (
                    <>
                      <p className="text-center text-sm text-slate-400 mt-6">
                        Sent the verification code again. Please check your
                        email.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-center text-sm text-slate-400 mt-6">
                        Have not received code yet?{" "}
                        <button
                          type="button"
                          className="text-white underline cursor-pointer focus:outline-none"
                          onClick={(e) => handleResednVerificationCode(e)}
                        >
                          Resend Code
                        </button>
                      </p>
                    </>
                  )}
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
