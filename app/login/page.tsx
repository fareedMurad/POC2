"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import { signIn } from "@/lib/apiServices";
import { useRouter, useSearchParams } from "next/navigation";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/* -------------------- Validation -------------------- */
const LoginSchema = Yup.object({
  email: Yup.string()
    .matches(emailRegex, "Invalid Email Address")
    .required("Email is required")
    .email("Invalid email address")
    .min(5, "Email must be between 5 and 40 characters")
    .max(40, "Email must be between 5 and 40 characters"),

  password: Yup.string()
    .required("Password is required")
    .required("Password is required")
    .matches(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{}|;:<>.,?])\S{8,16}$/,
      "Invalid password"
    ),
});

/* -------------------- Page -------------------- */
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const redirectPath = searchParams.get("redirect");

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
            Welcome back
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
              email: "",
              password: "",
            }}
            validationSchema={LoginSchema}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={async (values) => {
              setIsSubmitting(true);
              setServerError(null);

              try {
                const result = await signIn(values.email, values.password);

                // ✅ success
                console.log("Login success:", result);

                // example: save token if exists
                if (result.authToken) {
                  localStorage.setItem("authToken", result.authToken);
                  localStorage.setItem("hasVisitedBefore", "true");
                  document.cookie = `authToken=${
                    result.authToken
                  }; path=/; max-age=${60 * 60 * 24 * 7}`;
                } else {
                  localStorage.setItem(
                    "verificationRequestId",
                    result?.verificationRequestId
                  );
                  router.push("/emailverification");
                }

                if (result?.verificationRequestId) {
                  router.push("/emailverification");
                } else {
                  if (result.operationSuccessful)
                    if (redirectPath) {
                      router.push(redirectPath);
                    } else {
                      router.push("/home");
                    }
                }
              } catch (error: any) {
                setServerError(error?.message || "Invalid email or password.");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {({ errors, touched, values }) => {
              return (
                <Form autoComplete="off" noValidate className="space-y-5">
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
                    <label className="text-[15px] font-medium text-white block">
                      Password
                    </label>

                    <div className="relative">
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`w-full h-11 rounded-md px-4 pr-10 bg-[#2D313A] text-white border focus:outline-none ${
                          errors.password && touched.password
                            ? "border border-red-500"
                            : "border border-slate-700"
                        }`}
                        maxLength={16}
                        validateOnChange={false}
                      />
                      {errors.password && touched.password && (
                        <p className="mt-1 text-xs text-[#FF3B3B]">
                          {errors.password}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 ${
                          errors.password && touched.password
                            ? "top-1/3"
                            : "top-1/2"
                        }  -translate-y-1/2 text-[#BBBBBB] focus:outline-none`}
                      >
                        {showPassword ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* forget password */}
                  <label className="flex items-center mt-0 text-[15px] text-white float-end focus:outline-none">
                    <Link
                      href={"/forgetpassword"}
                      className="cursor-pointer focus:outline-none"
                    >
                      Forget Password?
                    </Link>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-md bg-[#68AD5C] text-white cursor-pointer text-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center focus:outline-none"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Log in"
                    )}
                  </button>

                  <p className="text-center text-sm text-[#BBBBBB] mt-8">
                    Don’t have an account?{" "}
                    <Link
                      href={"/register"}
                      className="text-white cursor-pointer focus:outline-none"
                    >
                      Create Account
                    </Link>
                  </p>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
