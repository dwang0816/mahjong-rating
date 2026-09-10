import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { LandingTiles } from "@/components/landing-tiles";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const next = typeof params.next === "string" ? params.next : "/dashboard";

  return (
    <main className="flex-1 grid lg:grid-cols-2">
      <section className="flex flex-col justify-center px-8 py-16 lg:px-20 gap-8">
        <div>
          <p className="text-jade font-mono text-sm tracking-widest uppercase">Tilebook</p>
          <h1 className="font-display text-5xl lg:text-6xl leading-[1.05] mt-3">
            Your mahjong record,
            <br />
            <span className="text-gold">table by table.</span>
          </h1>
          <p className="text-muted mt-5 max-w-md text-lg">
            Log every Taiwanese and Cantonese game you play, watch your rating move, see which
            stakes and venues pay, and find out who you should be sitting with.
          </p>
        </div>
        <LoginForm initialError={error} next={next} />
        <Link href="/demo" className="text-sm text-jade hover:underline -mt-4">
          See a sample profile first →
        </Link>
        <ul className="text-sm text-muted grid grid-cols-3 gap-4 max-w-md">
          <li>
            <span className="text-ivory font-semibold block">Elo rating</span>
            adjusted by who you beat
          </li>
          <li>
            <span className="text-ivory font-semibold block">Stakes and venues</span>
            where and how big you play
          </li>
          <li>
            <span className="text-ivory font-semibold block">Head to head</span>
            records against every opponent
          </li>
        </ul>
      </section>
      <section className="hidden lg:flex items-center justify-center bg-bg-2 border-l border-line relative overflow-hidden">
        <LandingTiles />
      </section>
    </main>
  );
}
