"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();
  const { isHebrew } = useLanguage();

  const text = isHebrew
    ? {
        title: "התחברות",
        username: "שם משתמש",
        password: "סיסמה",
        submit: "התחבר",
        failed: "ההתחברות נכשלה",
      }
    : {
        title: "Login",
        username: "Username",
        password: "Password",
        submit: "Login",
        failed: "Login failed",
      };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      router.push("/");
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof err.message === "string"
          ? err.message
          : text.failed;
      setError(message);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg shadow-black/30">
      <h1 className="mb-4 text-2xl font-semibold text-stone-100">{text.title}</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder={text.username}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
          required
        />
        <input
          type="password"
          placeholder={text.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
          required
        />
        <button
          type="submit"
          className="rounded bg-amber-500 p-2 font-medium text-zinc-950 hover:bg-amber-400"
        >
          {text.submit}
        </button>
      </form>
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  );
}
