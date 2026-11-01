"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

const field =
  "w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/50";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // AJAX submit — no page reload
    const form = e.currentTarget;
    setStatus("sending");
    setError("");
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatus("success");
        form.reset();
      } else {
        throw new Error(json.message || "Something went wrong.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
    >
      {/* Web3Forms public access key (designed to be embedded client-side).
          Messages are delivered to the address configured in the Web3Forms
          dashboard — no email address lives in this source code. */}
      <input type="hidden" name="access_key" value="f276f68b-387c-4825-877d-0289da239bc2" />
      <input type="hidden" name="subject" value="New message from the Ephemeral Reverie website" />
      {/* spam honeypot: real users never see or tick this */}
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <label htmlFor="name" className="font-tech mb-2 block text-[11px] uppercase tracking-[0.15em] text-white/60">
          Name
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor="email" className="font-tech mb-2 block text-[11px] uppercase tracking-[0.15em] text-white/60">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <div>
        <label htmlFor="message" className="font-tech mb-2 block text-[11px] uppercase tracking-[0.15em] text-white/60">
          Message
        </label>
        <textarea id="message" name="message" required rows={6} className={`${field} resize-y`} />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-white/85 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>

      <div aria-live="polite" className="min-h-6 text-center text-sm">
        {status === "success" && (
          <p className="text-emerald-300">Thank you — your message has been sent.</p>
        )}
        {status === "error" && <p className="text-red-300">{error}</p>}
      </div>
    </form>
  );
}
