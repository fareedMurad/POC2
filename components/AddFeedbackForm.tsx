"use client";

import { useState, useRef, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { ChevronDown } from "lucide-react";
import * as Yup from "yup";

/* ------------------ Time Wheel ------------------ */
const TimeWheel = ({ value, onChange, range }: any) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 🔥 Auto scroll to selected value
  useEffect(() => {
    if (!containerRef.current) return;

    const itemHeight = 40; // h-10 = 40px
    const scrollPosition = value * itemHeight;

    containerRef.current.scrollTo({
      top: scrollPosition,
      behavior: "smooth",
    });
  }, [value]);

  return (
    <div className="relative h-32 w-20 overflow-hidden">
      <div className="absolute inset-y-1/2 -translate-y-1/2 h-10 w-full border-y border-slate-600 pointer-events-none" />

      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {range.map((item: number) => (
          <div
            key={item}
            onClick={() => onChange(item)}
            className={`h-10 snap-center flex items-center justify-center cursor-pointer
              ${item === value ? "text-white text-lg" : "text-slate-500"}
            `}
          >
            {String(item).padStart(2, "0")}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------ Validation ------------------ */
const feedbackSchema = Yup.object({
  startTime: Yup.string().required("Start time is required"),
  endTime: Yup.string()
    .required("End time is required")
    .test(
      "is-greater",
      "End time must be greater than start time",
      function (value) {
        const { startTime } = this.parent;
        if (!startTime || !value) return true;

        const [sM, sS] = startTime.split(":").map(Number);
        const [eM, eS] = value.split(":").map(Number);

        return eM * 60 + eS > sM * 60 + sS;
      }
    ),
  feedback: Yup.string()
    .required("Feedback is required")
    .min(5, "Feedback must be at least 5 characters"),
});

/* ------------------ Component ------------------ */
export default function AddFeedbackForm({
  onSubmit,
  isEditing = false,
  setEditingFeedback,
  initialValues = { startTime: "", endTime: "", feedback: "" },
  maxDuration = 3600,
}: any) {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(
    null
  );

  const pickerRef = useRef<HTMLDivElement | null>(null);

  const maxMinutes = Math.floor(maxDuration / 60);
  const maxStartMinutes = Math.floor((maxDuration - 1) / 60);
  const maxStartSeconds = (maxDuration - 1) % 60;

  /* -------- Outside Click Close -------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setActivePicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parseTime = (timeString: string) => {
    if (timeString?.includes(":")) {
      const [m, s] = timeString.split(":").map(Number);
      setMinutes(m || 0);
      setSeconds(s || 0);
    } else {
      setMinutes(0);
      setSeconds(0);
    }
  };

  const formatTime = (m: number, s: number) =>
    `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={feedbackSchema}
      enableReinitialize
      onSubmit={(values, actions) => {
        onSubmit(values);
        actions.resetForm();
      }}
    >
      {({
        errors,
        touched,
        setFieldValue,
        isSubmitting,
        values,
        resetForm,
      }) => {
        /* -------- Auto Apply On Change -------- */
        useEffect(() => {
          if (!activePicker) return;

          const formatted = formatTime(minutes, seconds);

          if (activePicker === "start") {
            setFieldValue("startTime", formatted);
          } else {
            setFieldValue("endTime", formatted);
          }
        }, [minutes, seconds]);

        /* -------- Cancel Edit -------- */
        const handleCancelEdit = () => {
          resetForm({
            values: {
              startTime: "",
              endTime: "",
              feedback: "",
            },
          });

          setActivePicker(null);
          setMinutes(0);
          setSeconds(0);

          if (setEditingFeedback) {
            setEditingFeedback(false);
          }
        };

        return (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* ---------------- Start Time ---------------- */}
              <div>
                <label className="block text-sm text-white mb-2">
                  Start Time
                </label>

                <div className="relative">
                  <div
                    className={`flex items-center gap-2 rounded-md border ${
                      errors.startTime && touched.startTime
                        ? "border-red-500"
                        : "border-slate-700"
                    } bg-[#24282e] px-4 py-2 text-white cursor-pointer`}
                    onClick={() => {
                      parseTime(values.startTime);
                      setActivePicker("start");
                    }}
                  >
                    <Field
                      name="startTime"
                      readOnly
                      placeholder="Pick"
                      className="bg-transparent w-full focus:outline-none"
                    />
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>

                  {activePicker === "start" && (
                    <div
                      ref={pickerRef}
                      className="absolute z-20 mt-2 w-full rounded-xl border border-slate-700 bg-[#1f2329] p-4 shadow-2xl"
                    >
                      <div className="flex justify-center items-center gap-3">
                        <TimeWheel
                          value={minutes}
                          onChange={setMinutes}
                          range={[...Array(maxStartMinutes + 1).keys()]}
                        />
                        <span className="text-white">:</span>
                        <TimeWheel
                          value={seconds}
                          onChange={(val: number) => {
                            const updatedSeconds = val;
                            setSeconds(updatedSeconds);

                            const formatted = `${String(minutes).padStart(
                              2,
                              "0"
                            )}:${String(updatedSeconds).padStart(2, "0")}`;

                            setFieldValue("startTime", formatted);
                            setActivePicker(null);
                          }}
                          range={
                            minutes === maxStartMinutes
                              ? [...Array(maxStartSeconds + 1).keys()]
                              : [...Array(60).keys()]
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {errors.startTime && touched.startTime && (
                  <p className="text-xs text-[#FF3B3B] mt-1">
                    {String(errors.startTime)}
                  </p>
                )}
              </div>

              {/* ---------------- End Time ---------------- */}
              <div>
                <label className="block text-sm text-white mb-2">
                  End Time
                </label>

                <div className="relative">
                  <div
                    className={`flex items-center gap-2 rounded-md border ${
                      errors.endTime && touched.endTime
                        ? "border-red-500"
                        : "border-slate-700"
                    } bg-[#24282e] px-4 py-2 text-white cursor-pointer`}
                    onClick={() => {
                      parseTime(values.endTime);
                      setActivePicker("end");
                    }}
                  >
                    <Field
                      name="endTime"
                      readOnly
                      placeholder="Pick"
                      className="bg-transparent w-full focus:outline-none"
                    />
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>

                  {activePicker === "end" && (
                    <div
                      ref={pickerRef}
                      className="absolute z-20 mt-2 w-full rounded-xl border border-slate-700 bg-[#1f2329] p-4 shadow-2xl"
                    >
                      <div className="flex justify-center items-center gap-3">
                        <TimeWheel
                          value={minutes}
                          onChange={setMinutes}
                          range={[...Array(maxMinutes + 1).keys()]}
                        />
                        <span className="text-white">:</span>
                        <TimeWheel
                          value={seconds}
                          onChange={(val: number) => {
                            const updatedSeconds = val;

                            setSeconds(updatedSeconds);
                            const formatted = `${String(minutes).padStart(
                              2,
                              "0"
                            )}:${String(updatedSeconds).padStart(2, "0")}`;

                            setFieldValue("endTime", formatted);
                            setActivePicker(null);
                          }}
                          range={
                            minutes === maxMinutes
                              ? [
                                  ...Array(
                                    Math.floor(maxDuration % 60) + 1
                                  ).keys(),
                                ]
                              : [...Array(60).keys()]
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {errors.endTime && touched.endTime && (
                  <p className="text-xs text-[#FF3B3B] mt-1">
                    {String(errors.endTime)}
                  </p>
                )}
              </div>
            </div>

            {/* ---------------- Feedback ---------------- */}
            <div>
              <label className="block text-sm text-white mb-2">Feedback</label>
              <Field
                as="textarea"
                name="feedback"
                rows={3}
                maxLength={500}
                placeholder="Describe the main point of presentation..."
                className={`w-full rounded-md border ${
                  errors.feedback && touched.feedback
                    ? "border-red-500"
                    : "border-slate-700"
                } bg-[#24282e] px-4 py-2 text-white outline-none`}
              />
              {errors.feedback && touched.feedback && (
                <p className="text-xs text-[#FF3B3B] mt-1">
                  {String(errors.feedback)}
                </p>
              )}
              <div className="text-xs text-slate-500 float-end">
                {values.feedback.length}/500
              </div>
            </div>

            {/* ---------------- Actions ---------------- */}
            <div className="flex justify-end gap-3 mt-8">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-md bg-slate-600 px-6 py-2 text-white hover:bg-slate-700"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-[#68AD5C] px-7 py-2 text-white hover:bg-green-700"
              >
                {isEditing ? "Update" : "Add"}
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
