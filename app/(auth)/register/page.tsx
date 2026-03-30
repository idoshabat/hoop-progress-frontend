"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../Context/AuthContext";
import api from "@/app/lib/axios";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<"choose" | "form">("choose");
  const [role, setRole] = useState<"PLAYER" | "COACH" | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [position, setPosition] = useState("PG");
  const [height, setHeight] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const body: {
        username: string;
        password: string;
        role: "PLAYER" | "COACH" | null;
        date_of_birth: string | null;
        position?: string;
        height_cm?: number | null;
      } = {
        username,
        password,
        role,
        date_of_birth: dateOfBirth || null,
      };

      if (role === "PLAYER") {
        body.position = position;
        body.height_cm = height ? Number(height) : null;
      }

      await api.post("/register/", body);
      await login(username, password);
      router.push("/");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-stone-100 shadow-lg shadow-black/30">
      <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>

      {step === "choose" && (
        <div className="flex flex-col gap-4">
          <p className="mb-4 text-center text-stone-400">
            Choose how you want to register
          </p>

          <button
            onClick={() => {
              setRole("PLAYER");
              setStep("form");
            }}
            className="rounded-xl border border-amber-500/40 bg-amber-500 p-4 text-lg font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            Sign up as Player
          </button>

          <button
            onClick={() => {
              setRole("COACH");
              setStep("form");
            }}
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-4 text-lg font-semibold text-amber-300 transition hover:bg-zinc-700"
          >
            Sign up as Coach
          </button>
        </div>
      )}

      {step === "form" && (
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setStep("choose")}
            className="mb-2 text-left text-sm text-stone-400 hover:text-amber-300"
          >
            Back
          </button>

          <p className="text-center text-sm text-stone-400">
            Registering as <span className="font-semibold">{role}</span>
          </p>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
          />

          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
          />

          {role === "PLAYER" && (
            <>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="rounded-md border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
              >
                <option value="PG">Point Guard</option>
                <option value="SG">Shooting Guard</option>
                <option value="SF">Small Forward</option>
                <option value="PF">Power Forward</option>
                <option value="C">Center</option>
              </select>

              <input
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="rounded-md border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
              />
            </>
          )}

          <button className="mt-2 rounded-md bg-amber-500 p-3 font-semibold text-zinc-950 transition hover:bg-amber-400">
            Create Account
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-center text-red-400">{error}</p>}
    </div>
  );
}
