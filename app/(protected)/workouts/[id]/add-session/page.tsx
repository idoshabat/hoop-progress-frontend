"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSuccessFeedback } from "@/app/Context/SuccessFeedbackContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import api from "@/app/lib/axios";

export default function AddSessionPage() {
  const router = useRouter();
  const { showSuccess } = useSuccessFeedback();
  const { isHebrew } = useLanguage();
  const params = useParams();
  const workoutId = Number(params.id);

  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });
//   const [attempts, setAttempts] = useState("");
  const [makes, setMakes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const text = isHebrew
    ? {
        successTitle: "הסשן נוסף",
        successMessage: "הסשן תועד בהצלחה.",
        failed: "הוספת הסשן נכשלה",
        title: "הוספת סשן",
        makes: "קליעות",
        saving: "שומר...",
        submit: "הוסף סשן",
      }
    : {
        successTitle: "Session Added",
        successMessage: "The session was logged successfully.",
        failed: "Failed to add session",
        title: "Add Session",
        makes: "Makes",
        saving: "Saving...",
        submit: "Add Session",
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // if (Number(makes) > Number(attempts)) {
    //   setError("Makes cannot exceed attempts");
    //   return;
    // }

    try {
      setLoading(true);

      await api.post("sessions/", {
        workout: workoutId,
        date,
        // attempts: Number(attempts),
        makes: Number(makes),
      });

      showSuccess({
        title: text.successTitle,
        message: text.successMessage,
      });
      router.push(`/workouts/${workoutId}`);
    } catch (err: unknown) {
      console.error(err);
      setError(text.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg shadow-black/30">
      <h1 className="text-2xl font-semibold mb-4">{text.title}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
          required
        />

        {/* <input
          type="number"
          placeholder={"Attempts"} 
          value={attempts}
          onChange={(e) => setAttempts(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
          required
          disabled={true}
        /> */}

        <input
          type="number"
          placeholder={text.makes}
          value={makes}
          onChange={(e) => setMakes(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-amber-500 p-2 text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? text.saving : text.submit}
        </button>
      </form>

      {error && <p className="text-red-500 mt-3">{error}</p>}
    </div>
  );
}
