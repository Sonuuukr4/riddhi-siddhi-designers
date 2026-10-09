"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { signInAction, type SignInState } from "@/lib/cms/actions";
import { Field, Notice, buttonClass, inputClass } from "./ui";

export function LoginForm({ mode }: { mode: "supabase" | "local" }) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(signInAction, { error: null });
  const [reveal, setReveal] = useState(false);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5" noValidate>
      {state.error && <Notice tone="error">{state.error}</Notice>}

      {mode === "supabase" && (
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            required
            defaultValue={state.email}
            className={inputClass}
          />
        </Field>
      )}

      <Field label="Password" htmlFor="password">
        <div className="relative">
          <input
            id="password"
            name="password"
            type={reveal ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink/50 hover:text-ink"
            aria-label={reveal ? "Hide password" : "Show password"}
            aria-pressed={reveal}
          >
            {reveal ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
          </button>
        </div>
      </Field>

      <button type="submit" disabled={pending} className={`${buttonClass("primary")} mt-2 w-full`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
