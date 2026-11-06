import type { Metadata } from "next";
import { Suspense } from "react";
import { TokenButton } from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Wypisz się - poznan.events",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage({
  searchParams,
}: PageProps<"/newsletter/wypisz">) {
  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <h1 className="text-2xl">Wypisz się</h1>
      <p>Kliknij, aby wypisać się z newslettera poznan.events.</p>
      <Suspense>
        <UnsubscribeButton searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function UnsubscribeButton({
  searchParams,
}: Pick<PageProps<"/newsletter/wypisz">, "searchParams">) {
  const { token } = await searchParams;
  return (
    <TokenButton
      kind="unsubscribe"
      token={typeof token === "string" ? token : ""}
      label="Wypisz się"
    />
  );
}
