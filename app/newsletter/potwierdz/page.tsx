import type { Metadata } from "next";
import { Suspense } from "react";
import { TokenButton } from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Potwierdź zapis - poznan.events",
  robots: { index: false, follow: false },
};

export default function ConfirmPage({
  searchParams,
}: PageProps<"/newsletter/potwierdz">) {
  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <h1 className="text-2xl">Potwierdź zapis</h1>
      <p>Kliknij, aby potwierdzić zapis na newsletter poznan.events.</p>
      <Suspense>
        <ConfirmButton searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ConfirmButton({
  searchParams,
}: Pick<PageProps<"/newsletter/potwierdz">, "searchParams">) {
  const { token } = await searchParams;
  return (
    <TokenButton
      kind="confirm"
      token={typeof token === "string" ? token : ""}
      label="Potwierdź zapis"
    />
  );
}
