"use client";

import {
  ChangeEvent,
  DragEvent,
  SubmitEvent,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { ImagePlus } from "lucide-react";
import {
  submitFacebookUrl,
  submitManualEvent,
  type SubmitState,
} from "@/app/dodaj-wydarzenie/actions";

const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function useSubmit(
  action: (state: SubmitState, formData: FormData) => Promise<SubmitState>,
) {
  const [state, dispatch, pending] = useActionState(action, null);
  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(() => dispatch(new FormData(form)));
  };
  return { state, pending, onSubmit };
}

function Status({ state }: { state: SubmitState }) {
  if (!state) return null;
  return (
    <div
      role="alert"
      className={`alert ${state.ok ? "alert-success" : "alert-error"} alert`}
    >
      {state.message}
    </div>
  );
}

// Required on both tabs; the server actions check it too (hasConsent).
function ConsentCheckbox() {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        name="consent"
        type="checkbox"
        required
        className="checkbox checkbox-sm"
      />
      <span>
        Zgadzam się na publikację wydarzenia na stronie poznan.events.
      </span>
    </label>
  );
}

function FacebookForm() {
  const { state, pending, onSubmit } = useSubmit(submitFacebookUrl);
  if (state?.ok) return <Status state={state} />;
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span>Link do wydarzenia na facebooku</span>
        <input
          name="url"
          type="url"
          required
          placeholder="https://www.facebook.com/events/…"
          className="input w-full"
        />
      </label>
      <p className="text-sm opacity-70">
        Zgłoszone wydarzenia pojawią się na stronie po weryfikacji.
      </p>
      <ConsentCheckbox />
      <Status state={state} />
      <button className="btn btn-neutral self-start" disabled={pending}>
        {pending ? "Wysyłanie…" : "Wyślij"}
      </button>
    </form>
  );
}

function ImageDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const select = (files: FileList | null) => {
    const input = inputRef.current;
    const file = files?.[0];
    if (!input) return;

    const problem = !file
      ? null
      : !IMAGE_TYPES.includes(file.type)
        ? "Dozwolone formaty: JPG, PNG, WebP."
        : file.size > MAX_IMAGE_BYTES
          ? "Grafika może mieć maksymalnie 3,5 MB."
          : null;

    if (files && input.files !== files) input.files = files;
    input.setCustomValidity(problem ?? "");
    setError(problem);
    setPreview(file && !problem ? URL.createObjectURL(file) : null);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    select(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-1">
      <span>Grafika</span>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-2 min-h-48 rounded-box border-(length:--border) border-solid cursor-pointer overflow-hidden transition-colors ${
          dragging
            ? "border-gray-400"
            : error
              ? "border-error"
              : "border-base-content/20"
        }`}
      >
        <input
          ref={inputRef}
          name="image"
          type="file"
          required
          accept={IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            select(e.currentTarget.files)
          }
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Podgląd grafiki"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <>
            <ImagePlus size={40} className="opacity-50 pointer-events-none" />
            <span className="text-sm opacity-70 text-center px-4 pointer-events-none">
              Dodaj grafikę 16:9
              <br />
              (jpg lub png / maks. 3.5 MB)
            </span>
          </>
        )}
      </label>
      {error ? <span className="text-error text-sm">{error}</span> : null}
    </div>
  );
}

function ManualForm() {
  const { state, pending, onSubmit } = useSubmit(submitManualEvent);

  if (state?.ok) return <Status state={state} />;
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <ImageDropzone />
      <label className="flex flex-col gap-1">
        <span>Tytuł</span>
        <input name="title" required maxLength={300} className="input w-full" />
      </label>
      <label className="flex flex-col gap-1">
        <span>Opis</span>
        <textarea
          name="description"
          rows={6}
          maxLength={10000}
          className="textarea w-full"
        />
      </label>
      <div className="flex gap-4 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span>Początek</span>
          <input
            name="startsAt"
            type="datetime-local"
            required
            className="input w-full"
          />
        </label>
        <label className="flex flex-col gap-1 flex-1">
          <span>Koniec</span>
          <input
            name="endsAt"
            type="datetime-local"
            required
            className="input w-full"
          />
        </label>
      </div>
      <div className="flex gap-4 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span>Nazwa miejsca</span>
          <input
            name="venueName"
            required
            maxLength={200}
            className="input w-full"
          />
        </label>
        <label className="flex flex-col gap-1 flex-1">
          <span>Adres</span>
          <input name="address" maxLength={300} className="input w-full" />
        </label>
      </div>
      <p className="text-sm opacity-70">
        Zgłoszone wydarzenia pojawią się na stronie po weryfikacji.
      </p>
      <ConsentCheckbox />
      <Status state={state} />
      <button className="btn btn-neutral self-start" disabled={pending}>
        {pending ? "Wysyłanie…" : "Wyślij"}
      </button>
    </form>
  );
}

const TABS = [
  { id: "manual", label: "Dodaj ręcznie" },
  { id: "facebook", label: "Importuj z FB" },
];

export default function AddEventForm() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("manual");
  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl mb-4">Dodaj wydarzenie</h1>
      <div role="tablist" className="tabs tabs-lift">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            type="button"
            className={`tab text-lg border-b-0 ${tab === id ? "tab-active shadow-sm [clip-path:inset(-12px_-12px_0_-12px)]" : ""}`}
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className={`bg-base-100 shadow-sm border-base-300 border rounded-box -mt-px p-6 max-sm:p-4 ${tab === "manual" ? "rounded-tl-none" : ""}`}
      >
        <div hidden={tab !== "facebook"}>
          <FacebookForm />
        </div>
        <div hidden={tab !== "manual"}>
          <ManualForm />
        </div>
      </div>
    </div>
  );
}
