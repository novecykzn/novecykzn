import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="font-jakarta text-center text-xs font-bold uppercase tracking-[0.22em] text-[#5f8f37]">
        Novecy CP KZN
      </p>
      <h1 className="font-nunito mt-3 text-center text-4xl font-extrabold !text-[#234467] sm:text-5xl">
        About Us
      </h1>

      <div className="mt-10 grid items-center justify-items-center gap-8 lg:grid-cols-[340px_1fr] lg:justify-items-stretch">
        <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-[28px] border border-[#d7d7d7] shadow-sm lg:justify-self-start">
          <Image
            src="/aboutimage.png"
            alt="Novecy CP KZN"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 320px"
            priority
          />
        </div>

        <div className="text-center lg:text-left">
          <h2 className="font-nunito text-2xl font-bold leading-tight !text-[#00a4e4] sm:text-4xl">
            Led by experience.
            <br />
            Built for modern practice.
          </h2>
          <div className="font-jakarta mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-[#3a3a3a] lg:mx-0">
            <p>
              Novecy CP KZN is guided by an <strong>experienced</strong> pharmacist with a
              longstanding presence in the industry, bringing trusted insight, professional
              credibility and a strong understanding of modern pharmaceutical practice.
            </p>
          </div>
        </div>
      </div>

      <section className="relative left-1/2 mt-12 w-screen -translate-x-1/2 bg-[#f8fafc] px-6 py-16 sm:px-10 sm:py-20">
        <p className="font-nunito mx-auto max-w-5xl text-center text-lg font-extrabold leading-tight !text-[#234467] sm:text-2xl">
          Supported by the wider Novecy network, the branch
          <br />
          reflects a quality-led approach to compounding designed
          <br />
          to support healthcare professionals with confidence.
        </p>
      </section>

      <section className="relative left-1/2 mt-14 w-screen -translate-x-1/2 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-nunito text-center text-2xl font-extrabold leading-[1.1] !text-[#234467] sm:text-4xl">
            Quality, compliance &amp;
            <br />
            <span className="text-[#5f8f37]">professional oversight at every level.</span>
          </h2>

          <p className="font-jakarta mx-auto mt-8 max-w-4xl text-center text-lg leading-relaxed text-[#2f2f2f]">
            Novecy CP KZN operates within a quality-controlled compounding environment shaped by
            recognised professional standards, regulatory alignment and careful pharmacy oversight.
          </p>

          <h3 className="font-nunito mt-12 text-center text-2xl font-extrabold leading-tight !text-[#00a4e4] sm:text-3xl">
            Our approach to compounding is supported by
          </h3>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {[
              "SAPC & NDoH-registered and Licenced Facility",
              "Raw Materials Sourced from SAHPRA-approved, cGWP-licensed Suppliers",
              "Pharmacopeial-grade Ingredients Supported by Certificates of Analysis",
            ].map((item) => (
              <div
                key={item}
                className="font-jakarta flex min-h-[112px] items-center justify-center rounded-[30px] border border-[#dce9c9] bg-[#f7fbe9] px-6 py-5 text-center text-base font-bold leading-snug text-[#234467] sm:text-lg"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {[
              "Validated ISO-classified Environments & Certified Cleanroom Infrastructure",
              "Pharmacist-led Quality Assurance & Quality Control Processes",
            ].map((item) => (
              <div
                key={item}
                className="font-jakarta flex min-h-[112px] items-center justify-center rounded-[30px] border border-[#dce9c9] bg-[#f7fbe9] px-6 py-5 text-center text-base font-bold leading-snug text-[#234467] sm:text-lg"
              >
                {item}
              </div>
            ))}
          </div>

          <p className="font-nunito mx-auto mt-12 max-w-5xl text-center text-2xl font-extrabold leading-tight !text-[#234467] sm:text-3xl">
            This commitment to quality and governance underpins
            <br />
            every formulation prepared through the pharmacy.
          </p>
        </div>
      </section>

      <section className="relative left-1/2 mt-10 w-screen -translate-x-1/2 bg-gradient-to-r from-[#f4faf8] via-white to-[#eef6fd] px-6 py-12 sm:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center">
          <h3 className="font-nunito text-center text-3xl font-extrabold leading-tight !text-[#00a4e4] sm:text-4xl">
            Get In Touch With
            <br />
            Our Team Of Experts
          </h3>

          <a
            href="/contact"
            className="font-jakarta mt-6 inline-flex min-h-[52px] min-w-[190px] items-center justify-center rounded-full bg-[#00a4e4] px-8 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-[#0090c8]"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
