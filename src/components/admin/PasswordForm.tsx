"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction, type PasswordState } from "@/lib/cms/actions";
import { Field, Notice, buttonClass, inputClass } from "./ui";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<PasswordState, FormData>(changePasswordAction, {
    ok: false,
    message: null,
  });
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);

  return (
    <form ref={form} action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice>}
      {/* Lets password managers attach the new password to the right account. */}
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      <Field label="New password" htmlFor="new-password" hint="At least 10 characters.">
        <input id="new-password" name="password" type="password" autoComplete="new-password" minLength={10} required className={inputClass} />
      </Field>
      <Field label="Repeat new password" htmlFor="confirm-password">
        <input id="confirm-password" name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={`${buttonClass("primary")} self-start`}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
