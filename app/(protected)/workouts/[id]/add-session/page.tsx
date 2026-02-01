"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/axios";

export default function AddSessionPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = Number(params.id);

  const [date, setDate] = useState("");
//   const [attempts, setAttempts] = useState("");
  const [makes, setMakes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      router.push(`/workouts/${workoutId}`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to add session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Add Session</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
          required
        />

        {/* <input
          type="number"
          placeholder={"Attempts"} 
          value={attempts}
          onChange={(e) => setAttempts(e.target.value)}
          className="border p-2 rounded"
          required
          disabled={true}
        /> */}

        <input
          type="number"
          placeholder="Makes"
          value={makes}
          onChange={(e) => setMakes(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Session"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-3">{error}</p>}
    </div>
  );
}
