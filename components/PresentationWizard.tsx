"use client";

import { useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import { AlertCircle, Loader2 } from "lucide-react";
import * as Yup from "yup";
import WizardStep1 from "./WizardStep1";
import WizardStep2 from "./WizardStep2";
import { presentationSchema } from "@/lib/validationSchema";
import {
  savePresentationData,
  getPresentationData,
} from "@/lib/presentationStorage";
import WizardStep3 from "./WizardStep3";
import {
  createPresentation,
  updatePresentation,
  PresentationDTO,
} from "@/lib/apiServices";

export interface PresentationData {
  title: string;
  type: string;
  duration: number;
  purpose: string;
  audience: string;
  additionalNotes: string;
  otherType?: string;
  videoFile?: File | null;
  feedbackPreferences: {
    aiGenerated: boolean;
    peerFeedback: boolean;
  };
}

interface PresentationWizardProps {
  onComplete: (data: PresentationData, presentationId?: string) => void;
}

export default function PresentationWizard({
  onComplete,
}: PresentationWizardProps) {
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [presentationId, setPresentationId] = useState<string | null>(null);
  const [objectives, setObjectives] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: PresentationData = {
    title: "",
    type: "",
    duration: 1,
    purpose: "",
    audience: "",
    additionalNotes: "",
    videoFile: null,
    feedbackPreferences: {
      aiGenerated: true,
      peerFeedback: true,
    },
  };

  const handleSubmit = (
    values: PresentationData,
    { setSubmitting }: FormikHelpers<PresentationData>
  ) => {
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      onComplete(values);
    }, 500);
  };

  const validateStep = async (
    values: PresentationData,
    validateForm: () => Promise<any>,
    setTouched: (touched: any) => void
  ) => {
    try {
      // Validate using Formik's validation
      const formErrors = await validateForm();
      console.log("Form errors:", formErrors);

      if (step === 1) {
        // Mark all step 1 fields as touched to show validation errors
        setTouched({
          title: true,
          type: true,
          duration: true,
          purpose: true,
          audience: true,
          additionalNotes: true,
          otherType: values.type === "Other" ? true : false,
        });

        // Check if there are any errors for step 1 fields
        const step1Errors = [
          formErrors.title,
          formErrors.type,
          formErrors.duration,
          formErrors.purpose,
          formErrors.audience,
          values.type === "Other" ? formErrors.otherType : null,
        ].filter(Boolean);

        if (step1Errors.length > 0) {
          console.log("Step 1 validation failed with errors:", step1Errors);
          return false;
        }

        console.log("All validations passed for step 1");
        return true;
      } else if (step === 2) {
        // Step 2 is just review, no validation needed
        return true;
      } else if (step === 3) {
        // Validation for step 3 - video file is optional
        console.log("Validating step 3");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] py-8.75">
      <div className="mx-auto max-w-207.25 px-4">
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-semibold text-white ">
            Presentation Overview
          </h2>
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-14 rounded bg-linear-to-r from-[#221F21] to-[#D9D9D9] opacity-100" />
            <p className="text-center font-inter text-[15px] font-medium leading-none tracking-normal text-white">
              Step {step} of 3
            </p>
            {/* Right line (mirrored) */}
            <span className="h-px w-14 rounded bg-linear-to-l from-[#221F21] to-[#D9D9D9] opacity-100" />
          </div>
        </div>

        {serverError && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-900/20 p-4 text-[#FF3B3B] border border-red-900/30">
            <AlertCircle className="h-5 w-5" />
            <p>{serverError}</p>
            <button
              className="ml-auto text-sm hover:text-red-300"
              onClick={() => setServerError(null)}
            >
              ×
            </button>
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={presentationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            isSubmitting,
            validateForm,
            setFieldValue,
            setFieldTouched,
            setTouched,
          }) => (
            <Form className="rounded-lg bg-[#24282e] lg:p-8 p-4 relative">
              {/* Large Loading Spinner Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-[#24282e]/95 rounded-lg flex flex-col items-center justify-center z-50">
                  <Loader2 className="h-16 w-16 animate-spin text-[#68AD5C]" />
                  <p className="mt-4 text-white text-lg font-medium">
                    Processing your presentation...
                  </p>
                  <p className="mt-2 text-text-secondary text-sm">
                    This may take a few moments
                  </p>
                </div>
              )}

              {step === 1 && (
                <WizardStep1
                  errors={errors}
                  touched={touched}
                  values={values}
                  setFieldValue={setFieldValue}
                  setFieldTouched={setFieldTouched}
                />
              )}
              {step === 2 && <WizardStep2 values={values} />}
              {step === 3 && (
                <WizardStep3
                  values={values}
                  objectives={objectives}
                  isLoadingObjectives={isLoading}
                />
              )}

              <div className="mt-8 gap-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (step === 3) {
                      // Skip step 2 when going back from step 3
                      setStep(1);
                    } else if (step > 1) {
                      setStep(step - 1);
                    }
                  }}
                  disabled={step === 1}
                  className={` font-medium transition bg-[#30333D] rounded-md px-8 py-2 ${
                    step === 1
                      ? "cursor-not-allowed text-slate-600 hidden"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    // Clear any previous errors
                    setServerError(null);
                    if (step < 3) {
                      try {
                        console.log("Validating step...");
                        const isValid = await validateStep(
                          values,
                          validateForm,
                          setTouched
                        );
                        console.log("Validation result:", isValid);

                        if (isValid) {
                          // If moving from step 2 to step 3, call API
                          if (step === 2) {
                            setIsLoading(true);
                            try {
                              let result: PresentationDTO;

                              // Check if we already have a presentationId
                              if (presentationId) {
                                // Update existing presentation
                                console.log(
                                  "Updating presentation:",
                                  presentationId
                                );
                                result = await updatePresentation(
                                  presentationId,
                                  values
                                );
                                console.log("Update result:", result);

                                // IMPORTANT: Update objectives with the NEW objectives from updatePresentation
                                if (
                                  result.presentationObjectivesDTO?.objectives
                                ) {
                                  console.log(
                                    "Setting new objectives from update:",
                                    result.presentationObjectivesDTO.objectives
                                  );
                                  setObjectives(
                                    result.presentationObjectivesDTO.objectives
                                  );

                                  // Update localStorage with new objectives
                                  savePresentationData({
                                    ...values,
                                    objectives: [
                                      result.presentationObjectivesDTO
                                        .objectives,
                                    ],
                                  });
                                }
                              } else {
                                // Create new presentation
                                console.log("Creating new presentation");
                                result = await createPresentation(values);
                                console.log("Create result:", result);

                                // Store the presentation ID and objectives from nested presentationDTO
                                if (result.presentationDTO?.presentationId) {
                                  setPresentationId(
                                    result.presentationDTO.presentationId
                                  );
                                  console.log(
                                    "Setting initial objectives:",
                                    result.presentationDTO.objectives
                                  );
                                  setObjectives(
                                    result.presentationDTO.objectives || ""
                                  );

                                  // Save to localStorage
                                  savePresentationData({
                                    ...values,
                                    presentationId:
                                      result.presentationDTO.presentationId,
                                    objectives: result.presentationDTO
                                      .objectives
                                      ? [result.presentationDTO.objectives]
                                      : [],
                                  });
                                }
                              }

                              setIsLoading(false);
                              setStep(step + 1);
                            } catch (error: any) {
                              setIsLoading(false);
                              setServerError(
                                error.message || "Failed to save presentation"
                              );
                              console.error("API Error:", error);
                            }
                          } else {
                            // Move to next step without API call
                            setStep(step + 1);
                          }
                        } else {
                          console.log(
                            "Validation failed - errors shown under fields"
                          );
                        }
                      } catch (error) {
                        console.error("Error during validation:", error);
                        setServerError("An unexpected error occurred");
                      }
                    } else {
                      // Final step (step 3), submit the form
                      try {
                        console.log("Submitting form...");
                        const formErrors = await validateForm();
                        console.log("Form errors:", formErrors);

                        // Check if there are any errors other than videoFile
                        const nonVideoFileErrors = { ...formErrors };
                        delete nonVideoFileErrors.videoFile;

                        if (Object.keys(nonVideoFileErrors).length === 0) {
                          // Form is valid, submit
                          console.log(
                            "Form is valid, calling onComplete with values:",
                            values
                          );

                          // Ensure presentationId and objectives are saved before completing
                          if (presentationId) {
                            savePresentationData({
                              ...values,
                              presentationId: presentationId,
                              objectives: objectives ? [objectives] : [],
                            });
                          }

                          // Pass presentationId to onComplete for URL-based navigation
                          onComplete(values, presentationId || undefined);
                        } else {
                          console.log("Form has errors, showing error message");
                          setServerError(
                            "Please fix the errors before submitting"
                          );
                        }
                      } catch (error) {
                        console.error("Error during form submission:", error);
                        setServerError(
                          "An error occurred while submitting the form"
                        );
                      }
                    }
                  }}
                  disabled={isSubmitting || isLoading}
                  className="rounded-md bg-[#68AD5C] px-8 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-70 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
