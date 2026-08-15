"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [type, setType] = useState("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, message }),
    });
    setSubmitted(true);
    setMessage("");
  }

  return (
    <div className="fade-in max-w-lg">
      <h1 className="font-display text-3xl font-medium">Feedback</h1>
      <p className="mt-1 text-sm text-gray-600">
        Tell us what to fix or build next. We review submissions to plan
        frequent updates.
      </p>

      {submitted && (
        <p className="mt-4 rounded bg-sage/20 p-3 text-sm text-ink">
          Thanks — your feedback was submitted.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded border p-2 text-sm"
        >
          <option value="general">General feedback</option>
          <option value="bug">Bug report</option>
          <option value="feature_request">Feature request</option>
        </select>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="What would make this better?"
          className="w-full rounded border p-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-brass px-6 py-2.5 text-sm font-medium text-ink hover:bg-brass-light"
        >
          Submit feedback
        </button>
      </form>
    </div>
  );
}
