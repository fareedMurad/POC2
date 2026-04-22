import * as Yup from "yup";

export const presentationSchema = Yup.object({
  // Step 1 validation
  title: Yup.string()
    .required("Title is required")
    .min(40, "Title must be at least 40 characters")
    .max(100, "Title must be less than 100 characters"),
  type: Yup.string()
    .required("Presentation type is required")
    .oneOf(
      [
        "Informative",
        "Persuasive",
        "Motivational",
        "Keynote",
        "Elevator Pitch",
        "Other",
      ],
      "Invalid presentation type"
    ),
  otherType: Yup.string().when("type", {
    is: "Other",
    then: (schema) => schema.required("Other Presentation Type is required").min(5, "Other Presentation Type must be at least 5 characters"),
    otherwise: (schema) => schema.notRequired(),
  }),
  duration: Yup.number()
    .required("Duration is required")
    .min(1, "Duration must be at least 1 minute")
    .max(120, "Duration must be less than 120 minutes"),
  purpose: Yup.string()
    .required("Purpose is required")
    .min(40, "Purpose must be at least 40 characters")
    .max(500, "Purpose cannot be more than 500 characters"),
  audience: Yup.string()
    .required("Audience is required")
    .min(10, "Audience must be at least 10 characters")
    .max(200, "Audience cannot be more than 200 characters"),
  additionalNotes: Yup.string().max(
    500,
    "Additional notes cannot be more than 500 characters"
  ),

  // Step 3 validation
  videoFile: Yup.mixed().nullable().optional(),
  feedbackPreferences: Yup.object({
    aiGenerated: Yup.boolean().default(true),
    peerFeedback: Yup.boolean().default(true),
  }),
});

export const feedbackSchema = Yup.object({
  startTime: Yup.string().required("Start time is required"),
  endTime: Yup.string().required("End time is required"),
  feedback: Yup.string()
    .required("Feedback is required")
    .min(5, "Feedback must be at least 5 characters"),
});
