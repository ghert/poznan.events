"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  confirm,
  subscribe,
  unsubscribe,
  type NewsletterState,
} from "@/app/newsletter/actions";

function Status({ state }: { state: NewsletterState }) {
  if (!state) return null;
  return (
    <div
      role="alert"
      className={`alert ${state.ok ? "alert-success" : "alert-error"}`}
    >
      {state.message}
    </div>
  );
}

export function SubscribeForm() {
  const [state, action, pending] = useActionState(subscribe, null);
  if (state?.ok) return <Status state={state} />;
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span>Adres e-mail</span>
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          className="input w-full"
        />
      </label>
      <p className="text-sm opacity-70">
        Lista wydarzeń na twoim e-mailu w każdy poniedziałek. Zero spamu.
        <br />
        Szczegóły w{" "}
        <Link className="underline" href="/polityka-prywatnosci">
          polityce prywatności
        </Link>
        .
      </p>
      <Status state={state} />
      <button className="btn btn-neutral self-start" disabled={pending}>
        {pending ? "Wysyłanie…" : "Zapisz się"}
      </button>
    </form>
  );
}

// The bordered card around the signup form, shared by /newsletter and the
// homepage's NewsletterSection.
export function NewsletterCard() {
  return (
    <div className="bg-base-100 border-surface-300 border rounded-box p-6 max-sm:p-4">
      <h3 className="text-2xl mb-4">Newsletter</h3>
      <SubscribeForm />
    </div>
  );
}

export function NewsletterSection() {
  return (
    <section className="mt-4">
      <NewsletterCard />
    </section>
  );
}

const TOKEN_ACTIONS = { confirm, unsubscribe };

export function TokenButton({
  kind,
  token,
  label,
}: {
  kind: keyof typeof TOKEN_ACTIONS;
  token: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(TOKEN_ACTIONS[kind], null);
  if (state) return <Status state={state} />;
  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      <button className="btn btn-neutral" disabled={pending}>
        {label}
      </button>
    </form>
  );
}
