"use client";

import { Field, FormikErrors, FormikTouched } from "formik";
import { AlertCircle } from "lucide-react";
import { PresentationData } from "./PresentationWizard";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface WizardStep1Props {
  values: PresentationData;
  errors: FormikErrors<PresentationData>;
  touched: FormikTouched<PresentationData>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PresentationData>>;
  setFieldTouched: (
    field: string,
    isTouched?: boolean,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PresentationData>>;
}

export default function WizardStep1({
  values,
  errors,
  touched,
  setFieldValue,
  setFieldTouched,
}: WizardStep1Props) {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [showHelper, setShowHelper] = useState(false);

  const sampleTitles = [
    "How Artificial Intelligence Is Transforming Healthcare Diagnosis",
    "Blockchain Technology Explained: Beyond Cryptocurrency",
    "The Gig Economy: How Work Is Changing in the 21st Century",
    "The Case for Universal Basic Income",
    "Why Facial Recognition Technology Should Be Banned",
    "Fashionista: Sustainable Fashion at Fast Fashion Prices",
    "PinkCabbage: Personal Finance Coaching in Your Pocket",
  ];

  const purposeTitles = [
    "To explain how artificial intelligence is revolutionizing the way doctors diagnose diseases, making healthcare faster, more accurate, and more accessible.",
    "To demystify blockchain technology and show how it's being applied far beyond Bitcoin and cryptocurrency to transform industries like supply chain management, healthcare, and digital identity verification.",
    "To explore how the gig economy is fundamentally reshaping the nature of work, from the rise of platforms like Uber and Upwork to the millions of workers choosing freelance careers over traditional employment.",
    "To present the case for universal basic income—a policy where every citizen receives a regular, unconditional cash payment from the government—and explain why it's gaining support from economists, tech leaders, and policymakers across the political spectrum.",
    "To convince you that the threats facial recognition technology poses to privacy, civil liberties, and social equality are severe enough to warrant a complete ban on public use.",
    "To introduce Fashionista, a business that makes sustainable clothing affordable by reimagining the supply chain to match fast fashion prices. By the end of this pitch, you'll understand our cost-reduction strategy, how we compete with industry giants, and why conscious consumers are ready to switch. My goal is to convince you that Fashionista is both planet-friendly and a massive market opportunity in a $100 billion industry.",
    "To introduce PinkCabbage, a mobile app delivering personalized financial coaching at a fraction of traditional advisor costs through AI and human expert support. By the end of this pitch, you'll understand how we make financial literacy accessible to young professionals, our daily micro-coaching approach to building money habits, and why our freemium model serves an underserved market profitably.",
  ];

  const audenceTitles = [
    "Nurses, Doctors, Medical Students, Healthcare Administrators",
    "College Students",
    "General public",
    "Policy Makers, Legislators",
    "Public Policy Students, Lawyers, Civil Liberties Advocates and Activists",
    "Fashion Buyers, Designers, Brand Managers",
    "Angel Investors, Venture Capitalists",
  ];

  const additionalNotesTitles = [
    "This is a research-based speech that requires the speaker to include outside source information within the context of their speech. The speaker will gather a minimum of three different types of supporting material from a variety of credible sources (e.g. books, reference works, magazines, newspapers, etc.) and orally cite each source within their speech. Visual Aid is required",
    "Use direct, non-abstract language; understand the knowledge and interest level of the listener and adjust accordingly; explain the problem or opportunity before explaining the solution; describe the benefits, impact, or potential upside; engage the listener in a conversation rather than delivering a speech.",
  ];

  const handleSlashDetection = (field: string, value: string) => {
    if (value.includes("/")) {
      setActiveField(field);
      setShowHelper(true);
    } else {
      setShowHelper(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowHelper(false); // 👈 close dropdown
      }
    };

    if (showHelper) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showHelper]);

  return (
    <div className="space-y-6 ">
      <div className="relative">
        <label className="block text-[15px] font-medium text-white mb-4">
          Presentation Title
        </label>
        {!values.title && (
          <div className="absolute top-13 left-4 right-2 text-[#BBBBBB] text-[15px] pointer-events-none">
            Enter a descriptive title for your presentation. Press{" "}
            <span className="bg-[#444953] text-[#BBBBBB] px-1.5 py-0.5 text-[13px] rounded">
              /
            </span>{" "}
            for examples.
          </div>
        )}
        <Field
          type="text"
          name="title"
          maxLength={100}
          className={`w-full rounded-md ${
            errors.title && touched.title
              ? "border-red-500 focus:border-red-500"
              : "border-slate-700 focus:border-green-500"
          } bg-input-background px-4 h-12 text-white text-[15px] placeholder-[#BBBBBB] focus:outline-none`}
          onBlur={() => setFieldTouched("title", true)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setFieldValue("title", newValue);
            handleSlashDetection("title", newValue);
          }}
          value={values.title}
        />
        {errors.title && touched.title ? (
          <div className="flex items-center gap-1 text-xs text-[#FF3B3B] mt-1.5">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.title}</span>
          </div>
        ) : (
          <div></div>
        )}
        <div className="text-xs text-slate-500 float-end">
          {values.title.length}/100
        </div>
        {showHelper && activeField === "title" && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 w-190 bg-[#3A3C41] border border-slate-700 rounded-lg shadow-xl z-50 pt-4 max-h-60 overflow-y-auto">
            <div className="text-sm font-normal text-[#68AD5C] mb-3 px-4">
              Examples
            </div>

            <div className="space-y-1">
              {sampleTitles.map((title, index) => (
                <div
                  key={index}
                  className="text-sm text-white py-2 hover:bg-[#4F5258] px-4"
                >
                  {title}
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 flex bg-[#3A3C41] justify-between items-center px-4 py-0.5">
              <div className="text-xs text-[#BBBBBB]">
                <i>Examples are for guidance only. Type or paste to use</i>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowHelper(false)}
                  className="mt-3 px-3 py-2 text-sm text-[#BBBBBB] bg-[#2D313A] rounded-md hover:bg-[#4A4F57] transition"
                >
                  Esc
                </button>
                <div className="text-sm text-[#BBBBBB] mt-3 ml-4">to close</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-[15px] font-medium text-white mb-4">
            Presentation Type
          </label>

          <div className="relative">
            <Select.Root
              value={values.type}
              onValueChange={(value) => {
                setFieldValue("type", value);
                // Clear otherType field when type is changed to anything other than "Other"
                if (value !== "Other") {
                  setFieldValue("otherType", "");
                }
              }}
            >
              <Select.Trigger
                className={`w-full h-10 rounded-md 
      ${
        errors.type && touched.type && !values.type
          ? "border-red-500 focus:border-red-500"
          : "border-slate-700 focus:border-green-500"
      }
      bg-input-background px-3 pr-8 text-white text-[15px]
      focus:outline-none cursor-pointer
      flex items-center justify-between`}
              >
                <Select.Value placeholder="Select" />
                <Select.Icon className="text-slate-400">
                  <ChevronDown className="h-4 w-4 text-white" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content
                  position="popper"
                  sideOffset={4}
                  className="bg-[#181818] text-white rounded-lg shadow-lg z-50
                 w-(--radix-select-trigger-width)"
                >
                  <Select.Viewport className="p-1">
                    {[
                      "Informative",
                      "Persuasive",
                      "Motivational",
                      "Keynote",
                      "Elevator Pitch",
                      "Other",
                    ].map((item) => (
                      <Select.Item
                        key={item}
                        value={item}
                        className="px-3 py-2 rounded-md text-sm
                       cursor-pointer select-none
                       hover:bg-input-background outline-none text-[15px]"
                      >
                        <Select.ItemText>{item}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
          {errors.type && touched.type && !values.type && (
            <div className="mt-1 flex items-center gap-1 text-xs text-[#FF3B3B]">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.type}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-[15px] font-medium text-white mb-4">
            Max Duration
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center h-10 rounded-md overflow-hidden ">
              <Field
                type="number"
                name="duration"
                min={1}
                max={10}
                disabled
                className="w-16 h-full bg-input-background px-3 text-white text-[15px] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-none"
              />
              <div className="h-full w-8 flex flex-col border-l border-slate-700 bg-[#444953]">
                <button
                  type="button"
                  onClick={() => {
                    const newValue = Math.min(10, (values.duration || 0) + 1);
                    setFieldValue("duration", newValue);
                  }}
                  className="flex-1 flex items-center justify-center text-white hover:bg-[#5A5F6A] transition"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <div className="h-px bg-slate-700"></div>
                <button
                  type="button"
                  onClick={() => {
                    const newValue = Math.max(1, (values.duration || 0) - 1);
                    setFieldValue("duration", newValue);
                  }}
                  className="flex-1 flex items-center justify-center text-white hover:bg-[#5A5F6A] transition"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <span className="text-white text-[15px] font-medium">minutes</span>
          </div>
          {errors.duration && touched.duration && (
            <div className="mt-1 flex items-center gap-1 text-xs text-[#FF3B3B]">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.duration}</span>
            </div>
          )}
        </div>
      </div>

      {values.type === "Other" && (
        <div>
          <label className="block text-[15px] font-medium text-white mb-4">
            Other Presentation Type
          </label>
          <Field
            as="textarea"
            name="otherType"
            placeholder="Describe about the other type of presentation."
            rows={1}
            maxLength={50}
            className={`w-full md:w-[65%] rounded-md resize-none ${
              errors.otherType && touched.otherType
                ? "border-red-500 focus:border-red-500"
                : "border-slate-700 focus:border-green-500"
            } bg-input-background px-4 py-3 text-white text-[15px] placeholder-[#BBBBBB] focus:outline-none`}
            onBlur={() => setFieldTouched("otherType", true)}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              const newValue = e.target.value;
              if (newValue.length <= 50) {
                setFieldValue("otherType", newValue);
              }
            }}
            value={values.otherType || ""}
          />
          {errors.otherType && touched.otherType ? (
            <div className="mt-1 flex items-center gap-1 text-xs text-[#FF3B3B]">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.otherType}</span>
            </div>
          ) : (
            <div></div>
          )}
          <div className="text-xs text-slate-500 float-end w-full md:w-[40%]">
            {(values.otherType || "").length}/50
          </div>
        </div>
      )}

      <div className="mt-6 relative">
        <label className="block text-[15px] font-medium text-white mb-4">
          Purpose
        </label>
        {!values.purpose && (
          <div className="absolute top-12 left-4 right-2 text-[#BBBBBB] text-[15px] pointer-events-none">
            Describe the main goal of your presentation. Press{" "}
            <span className="bg-[#444953] text-[#BBBBBB] px-1.5 py-0.5 text-[13px] rounded">
              /
            </span>{" "}
            for examples.
          </div>
        )}
        <Field
          as="textarea"
          name="purpose"
          rows={5}
          maxLength={500}
          className={`w-full rounded-md resize-none   [scrollbar-width:thin]
    [scrollbar-color:#55575B_transparent]
    [&::-webkit-scrollbar]:w-1
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#55575B]
    [&::-webkit-scrollbar-thumb]:rounded-lg" ${
      errors.purpose && touched.purpose
        ? "border-red-500 focus:border-red-500"
        : "border-slate-700 focus:border-green-500"
    } bg-input-background px-4 py-3 text-white text-[15px] placeholder-[#BBBBBB] focus:outline-none`}
          onBlur={() => setFieldTouched("purpose", true)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            if (newValue.length <= 500) {
              setFieldValue("purpose", newValue);
            }
            handleSlashDetection("purpose", newValue);
          }}
          value={values.purpose}
        />
        {errors.purpose && touched.purpose ? (
          <div className="flex items-center gap-1 text-xs text-[#FF3B3B]">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.purpose}</span>
          </div>
        ) : (
          <div></div>
        )}
        <div className="text-xs text-slate-500 float-end">
          {values.purpose.length}/500
        </div>

        {showHelper && activeField === "purpose" && (
          <div className="absolute top-52 left-1/2 -translate-x-1/2 w-190 bg-[#3A3C41] border border-slate-700 rounded-lg shadow-xl z-50 pt-4 max-h-80 overflow-y-auto">
            <div className="text-sm font-normal text-[#68AD5C] mb-3 px-4">
              Examples
            </div>

            <div className="space-y-1">
              {purposeTitles.map((title, index) => (
                <div
                  key={index}
                  className="text-sm text-white py-2 hover:bg-[#4F5258] px-4"
                >
                  {title}
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-[#3A3C41] flex justify-between items-center px-4 py-2">
              <div className="text-xs text-[#BBBBBB] mt-2 pt-2">
                <i>Examples are for guidance only. Type or paste to use</i>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowHelper(false)}
                  className="mt-3 px-3 py-2 text-sm text-[#BBBBBB] bg-[#2D313A] rounded-md hover:bg-[#4A4F57] transition"
                >
                  Esc
                </button>
                <div className="text-sm text-[#BBBBBB] mt-3 ml-4">to close</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <label className="block text-[15px] font-medium text-white mb-4">
          Audience
        </label>
        {!values.audience && (
          <div className="absolute top-12 left-4 right-2 text-[#BBBBBB] text-[15px] pointer-events-none">
            Describe your audience. Press{" "}
            <span className="bg-[#444953] text-[#BBBBBB] px-1.5 py-0.5 text-[13px] rounded">
              /
            </span>{" "}
            for examples.
          </div>
        )}
        <Field
          as="textarea"
          name="audience"
          rows={2}
          maxLength={200}
          className={`w-full rounded-md resize-none   [scrollbar-width:thin]
    [scrollbar-color:#55575B_transparent]
    [&::-webkit-scrollbar]:w-1
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#55575B]
    [&::-webkit-scrollbar-thumb]:rounded-lg" ${
      errors.audience && touched.audience
        ? "border-red-500 focus:border-red-500"
        : "border-slate-700 focus:border-green-500"
    } bg-input-background px-4 py-3 text-white text-[15px] placeholder-[#BBBBBB] focus:outline-none`}
          onBlur={() => setFieldTouched("audience", true)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            if (newValue.length <= 200) {
              setFieldValue("audience", newValue);
            }
            handleSlashDetection("audience", newValue);
          }}
          value={values.audience}
        />
        {errors.audience && touched.audience ? (
          <div className="flex items-center gap-1 text-xs text-[#FF3B3B]">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.audience}</span>
          </div>
        ) : (
          <div></div>
        )}
        <div className="text-xs text-slate-500 float-end">
          {values.audience.length}/200
        </div>

        {showHelper && activeField === "audience" && (
          <div className="absolute top-34 left-1/2 -translate-x-1/2 w-190 bg-[#3A3C41] border border-slate-700 rounded-lg shadow-xl z-50 pt-4 max-h-60 overflow-y-auto">
            <div className="text-sm font-semibold text-[#68AD5C] mb-3 px-4">
              Examples
            </div>

            <div className="space-y-2">
              {audenceTitles.map((title, index) => (
                <div
                  key={index}
                  className="text-sm text-white py-1 hover:bg-[#4F5258] px-4"
                >
                  {title}
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-[#3A3C41] flex justify-between items-center px-4 py-0.5">
              <div className="text-xs text-[#BBBBBB] mt-2 pt-2">
                <i>Examples are for guidance only. Type or paste to use</i>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowHelper(false)}
                  className="mt-3 px-3 py-2 text-sm text-[#BBBBBB] bg-[#2D313A] rounded-md hover:bg-[#4A4F57] transition"
                >
                  Esc
                </button>
                <div className="text-sm text-[#BBBBBB] mt-3 ml-4">to close</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <label className="block text-[15px] font-medium text-white mb-4">
          Additional Notes{" "}
          <span className="text-text-muted text-xs">{"(Optional)"}</span>
        </label>
        {!values.additionalNotes && (
          <div className="absolute top-12 left-4 right-2 text-[#BBBBBB] text-[15px] pointer-events-none">
            Add additional context such as grading rubrics, required structure,
            or special requirements. Press{" "}
            <span className="bg-[#444953] text-[#BBBBBB] px-1.5 py-0.5 text-[13px] rounded">
              /
            </span>{" "}
            for examples.
          </div>
        )}
        <Field
          as="textarea"
          name="additionalNotes"
          rows={5}
          maxLength={500}
          className={`w-full rounded-md resize-none ${
            errors.additionalNotes && touched.additionalNotes
              ? "border-red-500 focus:border-red-500"
              : "border-slate-700 focus:border-green-500"
          } bg-input-background px-4 py-3 text-white text-[15px] placeholder-[#BBBBBB] focus:outline-none outline-none"

    [scrollbar-width:thin]
    [scrollbar-color:#55575B_transparent]
    [&::-webkit-scrollbar]:w-1
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#55575B]
    [&::-webkit-scrollbar-thumb]:rounded-lg`}
          onBlur={() => setFieldTouched("additionalNotes", true)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            if (newValue.length <= 500) {
              setFieldValue("additionalNotes", newValue);
            }
            handleSlashDetection("additionalNotes", newValue);
          }}
          value={values.additionalNotes}
        />
        <div className="mt-2 flex items-center justify-between">
          {errors.additionalNotes && touched.additionalNotes ? (
            <div className="flex items-center gap-1 text-xs text-[#FF3B3B]">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.additionalNotes}</span>
            </div>
          ) : (
            <div></div>
          )}
          <div className="text-xs text-slate-500">
            {values.additionalNotes.length}/500
          </div>
        </div>
        {showHelper && activeField === "additionalNotes" && (
          <div className="absolute top-45 left-1/2 -translate-x-1/2 w-190 bg-[#3A3C41] border border-slate-700 rounded-lg shadow-xl z-50 py-4 max-h-95 overflow-y-auto">
            <div className="text-sm font-normal text-[#68AD5C] mb-3 px-4">
              Examples
            </div>

            <div className="space-y-2">
              {additionalNotesTitles.map((title, index) => (
                <div
                  key={index}
                  className="text-sm text-white py-2 hover:bg-[#4F5258] px-4"
                >
                  {title}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center px-4">
              <div className="text-xs text-[#BBBBBB] mt-2 pt-2">
                <i>Examples are for guidance only. Type or paste to use</i>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowHelper(false)}
                  className="mt-3 px-3 py-2 text-sm text-[#BBBBBB] bg-[#2D313A] rounded-md hover:bg-[#4A4F57] transition"
                >
                  Esc
                </button>
                <div className="text-sm text-[#BBBBBB] mt-3 ml-4">to close</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
