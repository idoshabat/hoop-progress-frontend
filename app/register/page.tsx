"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../Context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("PG");
  const [height, setHeight] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          position,
          height_cm: height ? Number(height) : null,
        }),
      });

      // auto-login after register
      await login(username, password);
      router.push("/");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl mb-4">Register</h1>

      <form onSubmit={handleRegister} className="flex flex-col gap-2">
        <input
          placeholder="Username (email)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
        />

        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="border p-2"
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
          className="border p-2"
        />

        <button className="bg-green-600 text-white p-2">
          Create Account
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
