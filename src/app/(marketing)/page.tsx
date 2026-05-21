import Link from "next/link";
import Image from "next/image";
import { HomeHeroSlideshow } from "@/components/marketing/home-hero-slideshow";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[#d8d8d8] bg-[#030811]">
        <HomeHeroSlideshow />

        <div className="absolute inset-0 flex items-center px-6 sm:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-black/25 px-5 py-7 text-left backdrop-blur-sm sm:max-w-2xl sm:px-6 sm:py-9">
              <p className="font-jakarta text-xs font-semibold uppercase tracking-[0.2em] text-[#8fe3ff]">
                Novecy CP KZN
              </p>
              <h1 className="font-nunito mt-2 text-2xl font-extrabold leading-tight !text-white drop-shadow sm:text-4xl">
                Setting a higher standard for pharmaceutical compounding.
              </h1>
              <p className="font-jakarta mt-3 max-w-xl text-xs leading-relaxed text-white/90 sm:text-sm">
                Precision compounding support for healthcare professionals, grounded in quality,
                clinical responsibility, and reliable turnaround.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-[#e0dedf] bg-gradient-to-br from-[#f4faf8] via-white to-[#eef6fd]">
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#bee597]/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#67a5be]/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-[#234467]/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <p className="font-jakarta text-xs font-bold uppercase tracking-[0.22em] text-[#00a4e4]">
            Novecy CP KZN
          </p>
          <div className="font-jakarta mx-auto mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-[#6d6e71]">
            <p>
              Novecy CP KZN partners with healthcare professionals to provide <strong>customised</strong>
              {" "}compounded medicines for patient-specific treatment requirements where standard
              manufactured options may not be suitable.
            </p>
            <p>
              Built on clinical expertise, professional pharmacy practice and a commitment to
              quality-controlled compounding, <strong>Novecy CP KZN offers a trusted, modern approach
              to pharmaceutical compounding.</strong>
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="font-jakarta inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#00a4e4] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0090c8]">
              Contact our team
            </Link>
            <Link href="/auth/login" className="font-jakarta inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-[#7dac4a]/45 bg-white px-6 py-3 text-sm font-semibold text-[#335d1f] transition-colors hover:border-[#5f8f37] hover:bg-[#f6fbe9] hover:text-[#335d1f]">
              Healthcare professional access
            </Link>
          </div>
          <p className="font-jakarta mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-[#00a4e4]">
            Public website for information and enquiries. Practitioner-only resources, pricing
            and ordering access are restricted to approved healthcare professionals.
          </p>
          <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-2xl border border-[#dbeaf2] bg-white/85 p-4">
              <p className="font-jakarta text-xs font-semibold uppercase tracking-wide text-[#00a4e4]">
                Clinical focus
              </p>
              <p className="mt-1 font-jakarta text-sm text-[#4a4a4a]">
                Patient-specific treatment support for prescribers and care teams.
              </p>
            </div>
            <div className="rounded-2xl border border-[#dce9c9] bg-[#fbfdf6]/95 p-4">
              <p className="font-jakarta text-xs font-semibold uppercase tracking-wide text-[#5f8f37]">
                Quality first
              </p>
              <p className="mt-1 font-jakarta text-sm text-[#4a4a4a]">
                Structured compounding processes with strong quality control oversight.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d6deea] bg-[#f8faff]/95 p-4">
              <p className="font-jakarta text-xs font-semibold uppercase tracking-wide text-[#234467]">
                Professional access
              </p>
              <p className="mt-1 font-jakarta text-sm text-[#4a4a4a]">
                Secure professional portal for approved healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e0dedf] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-nunito text-center text-2xl font-bold leading-tight !text-[#234467] sm:text-4xl">
            Where standard medicine stops,
            <br />
            <span className="text-[#5f8f37]">compounding begins.</span>
          </h2>

          <div className="mt-10 grid items-center gap-8 lg:grid-cols-[340px_1fr]">
            <div className="relative h-[280px] overflow-hidden rounded-[18px] border border-[#d7d7d7] shadow-sm">
              <Image
                src="/lab.png"
                alt="Novecy laboratory"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 340px"
              />
            </div>

            <div className="font-jakarta space-y-6 text-left text-base leading-relaxed text-[#3a3a3a] sm:text-lg">
              <p>
                Pharmaceutical compounding creates space for a <strong>more precise</strong> and responsive
                approach to treatment when standard manufactured medicines do not fully meet
                clinical requirements.
              </p>
              <p>
                It gives healthcare professionals greater flexibility in how care is tailored —
                whether that means adjusting strength, refining dosage form, combining ingredients
                more purposefully or supporting treatment where commercially available options fall
                short.
              </p>
              <p>
                In a healthcare landscape that increasingly demands individualised care,
                compounding remains an <strong>essential</strong> part of modern pharmaceutical practice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
