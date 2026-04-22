"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import checkCircle from "@/public/circle.svg";
import xCircel from "@/public/x-circle.svg";
import Header from "@/components/Header";
import { getAppInstallation, updateProfile } from "@/lib/apiServices";
import { useRouter } from "next/navigation";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/* -------------------- Validation -------------------- */
const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be between 3 and 30 characters")
    .max(30, "Name must be between 3 and 30 characters")
    .required("Name is required"),

  email: Yup.string()
    .matches(emailRegex, "Invalid Email Address")
    .min(5, "Email must be between 5 and 40 characters")
    .max(40, "Email must be between 5 and 40 characters")
    .required("Email is required"),

  password: Yup.string().test(
    "password-validation",
    "Password does not meet requirements",
    function (value) {
      if (!value) return true;

      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*\s).{8,16}$/;

      return passwordRegex.test(value);
    }
  ),
});

/* -------------------- Page -------------------- */
export default function EditProfilePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const token = localStorage.getItem("authToken");
  const fetchAppInstallation = async () => {
    try {
      const result = await getAppInstallation();

      const app = result?.appInstallation;

      if (app) {
        setProfile({
          name: app.name ?? "",
          email: app.email ?? "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) fetchAppInstallation();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex flex-col">
      <Header />

      <div className="flex flex-1 items-center justify-center px-3 md:px-4 py-5 md:py-10">
        <div className="w-full max-w-lg bg-[#25282E] rounded-xl px-4 md:px-8 py-8 md:py-16">
          <h1 className="text-white text-2xl font-semibold text-center mb-6">
            Edit Profile
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
            initialValues={profile}
            enableReinitialize
            validationSchema={ProfileSchema}
            onSubmit={async (values) => {
              setIsSubmitting(true);
              setServerError(null);

              try {
                await updateProfile(
                  values.email,
                  values.name,
                  values.password || ""
                );

                fetchAppInstallation();
                router.push("/profile");
              } catch (error) {
                setServerError(error?.message ?? "Something went wrong.");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {({ errors, touched, values, submitForm, resetForm }) => {
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
                  <div className="pt-2">
                    <label className="text-[15px] font-medium text-white mb-1 block">
                      Name
                    </label>
                    <Field
                      name="name"
                      className={`w-full h-11 rounded-md px-4 text-white bg-[#2D313A] focus:outline-none  ${
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
                  <div>
                    <label className="text-[15px] font-medium text-white mb-1 block">
                      Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      autoComplete="new-email"
                      className={`w-full h-11 rounded-md px-4 text-white bg-[#2D313A] focus:outline-none ${
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
                      <p className="text-[15px]">
                        Password{" "}
                        <span className="text-[#BBBBBB]">(Optional)</span>
                      </p>
                    </label>

                    <div className="relative">
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        maxLength={16}
                        className="w-full h-11 rounded-md px-4 pr-10 bg-[#2D313A] text-white border border-slate-700 focus:outline-none"
                        placeholder=""
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
                    <div className="space-y-2 text-sm font-medium mt-3">
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

                  {/* ✅ SINGLE BUTTON (Edit / Save) */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        submitForm(); // ✅ ONLY SAVE CALLS API
                      }}
                      className="w-full h-11 rounded-md bg-[#68AD5C] hover:bg-[#008236] text-white text-lg font-medium disabled:opacity-60 mt-10 focus:outline-none"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>

                    {/* ✅ Done */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        resetForm();
                        router.push("/profile");
                      }}
                      className="w-full h-11 rounded-md border border-[#68AD5C] text-[#68AD5C] hover:bg-[#68AD5C] hover:text-white text-lg font-medium disabled:opacity-60 mt-10 ml-4 focus:outline-none"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Rule Component -------------------- */
function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`flex items-center gap-3 ${
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
