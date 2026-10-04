import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Polityka prywatności - poznan.events",
  description:
    "Jakie dane przetwarza poznan.events, w jakim celu i jakie masz prawa.",
};

const UPDATED_AT = "4 października 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 flex flex-col gap-2">{children}</ul>;
}

const linkClass = "underline hover:opacity-50";

export default function PrivacyPolicyPage() {
  return (
    <article className="w-full max-w-3xl flex flex-col gap-8 leading-relaxed">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl">Polityka prywatności</h1>
        <p className="opacity-70">Ostatnia aktualizacja: {UPDATED_AT}</p>
      </header>

      <p>
        Ta strona wyjaśnia, jakie dane przetwarza serwis poznan.events (dalej
        „Serwis”), w jakim celu, na jakiej podstawie i jakie prawa Ci
        przysługują. Serwis jest bezpłatnym, niekomercyjnym kalendarzem wydarzeń
        w Poznaniu. Nie wymaga zakładania konta i nie prosi o imię, nazwisko ani
        adres e-mail.
      </p>

      <Section title="1. Administrator danych">
        <p>
          Administratorem danych jest Filip Przydryga, twórca Serwisu. W
          sprawach dotyczących danych osobowych możesz skontaktować się przez
          e-mail{" "}
          <Link className={linkClass} href="mailto:przydryga.filip@gmail.com">
            przydryga.filip@gmail.com
          </Link>
          .
        </p>
      </Section>

      <Section title="2. Jakie dane przetwarzamy">
        <p>
          <strong>Przeglądanie Serwisu.</strong> Jak każda strona internetowa,
          Serwis otrzymuje techniczne dane o połączeniu: adres IP, typ
          przeglądarki i systemu, adres odwiedzanej podstrony, adres strony, z
          której przychodzisz, oraz datę i godzinę wizyty.
        </p>
        <p>
          <strong>Statystyki odwiedzin.</strong> Korzystamy z Vercel Web
          Analytics i Umami. Oba narzędzia zbierają zagregowane, anonimowe
          statystyki (np. liczbę odwiedzin podstron, kraj, typ urządzenia), nie
          używają plików cookie i nie tworzą profili umożliwiających śledzenie
          Cię między stronami.
        </p>
        <p>
          <strong>Zgłaszanie wydarzeń.</strong> Formularz „dodaj wydarzenie”
          przyjmuje link do wydarzenia na Facebooku albo dane wydarzenia:
          grafikę, tytuł, opis, daty, nazwę i adres miejsca. Nie zbieramy danych
          o osobie zgłaszającej. Zgłoszone treści mogą jednak zawierać dane
          osobowe, np. wizerunek na grafice lub nazwiska artystów w opisie.
          Prosimy, aby zgłaszać tylko treści, do których publikacji masz prawo.
        </p>
        <p>
          <strong>Ochrona przed botami.</strong> Formularz chroni Vercel BotID.
          Podczas wysyłania zgłoszenia przeglądarka wykonuje niewidoczny test,
          który analizuje techniczne cechy przeglądarki i urządzenia, aby
          odróżnić ludzi od automatów.
        </p>
        <p>
          <strong>Wydarzenia z Facebooka.</strong> Informacje o wydarzeniach
          (tytuł, opis, daty, miejsce, grafika) pobieramy z publicznych stron
          wydarzeń na Facebooku. Mogą one zawierać dane osób, które je
          opublikowały lub w nich występują.
        </p>
      </Section>

      <Section title="3. Cele i podstawy prawne">
        <List>
          <li>
            udostępnianie Serwisu i zapewnienie jego bezpieczeństwa (dane
            techniczne, BotID): prawnie uzasadniony interes administratora, art.
            6 ust. 1 lit. f RODO;
          </li>
          <li>
            prowadzenie anonimowych statystyk w celu ulepszania Serwisu: prawnie
            uzasadniony interes, art. 6 ust. 1 lit. f RODO;
          </li>
          <li>
            przyjmowanie, weryfikacja i publikacja zgłoszonych wydarzeń: prawnie
            uzasadniony interes polegający na prowadzeniu kalendarza wydarzeń
            kulturalnych, art. 6 ust. 1 lit. f RODO;
          </li>
          <li>
            publikowanie informacji o wydarzeniach pobranych z publicznych stron
            Facebooka: prawnie uzasadniony interes polegający na informowaniu o
            wydarzeniach w Poznaniu, art. 6 ust. 1 lit. f RODO.
          </li>
        </List>
      </Section>

      <Section title="4. Komu przekazujemy dane">
        <p>
          Dane przetwarzają w naszym imieniu dostawcy usług, z których korzysta
          Serwis:
        </p>
        <List>
          <li>Vercel Inc.: hosting, statystyki odwiedzin i ochrona BotID;</li>
          <li>Neon Inc.: baza danych z informacjami o wydarzeniach;</li>
          <li>
            Cloudflare, Inc.: przechowywanie grafik dodanych przez formularz
            (Cloudflare R2);
          </li>
          <li>Umami Software, Inc.: statystyki odwiedzin.</li>
        </List>
        <p>
          Zatwierdzone wydarzenia, wraz z grafiką i opisem, są publicznie
          widoczne w Serwisie. Nie sprzedajemy danych i nie udostępniamy ich w
          celach marketingowych.
        </p>
      </Section>

      <Section title="5. Przekazywanie danych poza EOG">
        <p>
          Część dostawców ma siedzibę lub serwery poza Europejskim Obszarem
          Gospodarczym, m.in. w Stanach Zjednoczonych i Izraelu. W takich
          przypadkach dane są przekazywane na podstawie decyzji Komisji
          Europejskiej stwierdzającej odpowiedni stopień ochrony (w tym EU-US
          Data Privacy Framework) lub standardowych klauzul umownych
          zatwierdzonych przez Komisję Europejską.
        </p>
      </Section>

      <Section title="6. Jak długo przechowujemy dane">
        <List>
          <li>
            dane techniczne w logach serwera: zgodnie z ustawieniami dostawcy
            hostingu, zwykle nie dłużej niż kilka tygodni;
          </li>
          <li>
            statystyki odwiedzin: w formie zagregowanej, bez możliwości
            powiązania z konkretną osobą;
          </li>
          <li>
            zgłoszone i pobrane wydarzenia oraz grafiki: przez czas działania
            Serwisu lub do czasu ich usunięcia, np. na Twoją prośbę.
            Niezatwierdzone zgłoszenia nie są publikowane.
          </li>
        </List>
      </Section>

      <Section title="7. Twoje prawa">
        <p>Na zasadach określonych w RODO masz prawo do:</p>
        <List>
          <li>dostępu do swoich danych i otrzymania ich kopii;</li>
          <li>sprostowania danych;</li>
          <li>usunięcia danych;</li>
          <li>ograniczenia przetwarzania;</li>
          <li>
            wniesienia sprzeciwu wobec przetwarzania opartego na prawnie
            uzasadnionym interesie;
          </li>
          <li>
            wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul.
            Stawki 2, 00-193 Warszawa,{" "}
            <Link className={linkClass} href="https://uodo.gov.pl">
              uodo.gov.pl
            </Link>
            ).
          </li>
        </List>
        <p>
          Jeśli wydarzenie w Serwisie zawiera Twoje dane lub wizerunek i chcesz
          je usunąć albo poprawić, napisz przez{" "}
          <Link className={linkClass} href="https://filipprzydryga.xyz">
            stronę kontaktową
          </Link>
          .
        </p>
      </Section>

      <Section title="8. Pliki cookie i pamięć przeglądarki">
        <p>
          Serwis nie używa plików cookie do śledzenia ani reklam. W pamięci
          przeglądarki (localStorage) zapisujemy tylko wybrany motyw (jasny lub
          ciemny), aby zapamiętać go przy kolejnej wizycie. Ta informacja nie
          jest wysyłana na serwer i możesz ją w każdej chwili usunąć w
          ustawieniach przeglądarki. Mechanizm ochrony BotID może tymczasowo
          zapisywać w przeglądarce dane niezbędne do działania zabezpieczenia.
        </p>
      </Section>

      <Section title="9. Linki zewnętrzne">
        <p>
          Serwis zawiera linki do Facebooka, Instagrama i innych stron. Po ich
          otwarciu obowiązują zasady prywatności tych serwisów.
        </p>
      </Section>

      <Section title="10. Zmiany polityki">
        <p>
          Możemy aktualizować tę politykę, np. po dodaniu nowych funkcji.
          Aktualna wersja jest zawsze dostępna na tej stronie, a data ostatniej
          zmiany znajduje się na górze.
        </p>
      </Section>
    </article>
  );
}
