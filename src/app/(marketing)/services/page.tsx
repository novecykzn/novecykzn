import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services",
};

export default function ServicesPage() {
  const dosageForms = [
    { name: "Capsules", icon: "capsules" },
    { name: "Oral Liquids", icon: "dropper" },
    { name: "Topical Preparations", icon: "jar" },
    { name: "Implants & Transdermal Preparations", icon: "patch" },
    { name: "Sterile & Non-Sterile Injectables", icon: "syringe" },
    { name: "Sublingual, Buccal & Rectal Dosage Forms", icon: "lips" },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="font-nunito text-center text-4xl font-extrabold !text-[#234467] sm:text-5xl">
        Services
      </h1>

      <div className="mt-10 grid items-center justify-items-center gap-8 lg:grid-cols-[340px_1fr] lg:justify-items-stretch">
        <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-[28px] border border-[#d7d7d7] shadow-sm lg:justify-self-start">
          <Image
            src="/servicesimage.png"
            alt="Novecy compounding services"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 320px"
            priority
          />
        </div>

        <div className="text-center lg:text-left">
          <h2 className="font-nunito text-2xl font-bold leading-tight !text-[#234467] sm:text-4xl">
            A broad scope of
            <br />
            <span className="text-[#5f8f37]">compounding services</span>
          </h2>
          <p className="font-jakarta mt-6 max-w-2xl text-lg leading-relaxed text-[#3a3a3a]">
            Novecy CP KZN supports healthcare professionals across a wide range of compounded
            dosage forms and treatment applications.
          </p>
        </div>
      </div>

      <section className="relative left-1/2 mt-16 w-screen -translate-x-1/2 bg-[#f8fafc] px-6 py-10 sm:px-10">
        <h3 className="font-nunito text-center text-3xl font-extrabold !text-[#234467] sm:text-4xl">
          Dosage forms include
        </h3>

        <div className="mx-auto mt-14 grid max-w-7xl gap-y-12 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-28 lg:gap-y-20">
          {dosageForms.map((item) => (
            <div key={item.name} className="flex min-h-[132px] flex-col items-center justify-start text-center">
              <FormIcon kind={item.icon} />
              <p className="font-jakarta mt-3 max-w-[230px] text-[1.15rem] font-extrabold leading-snug text-[#234467]">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-16">
        <h3 className="font-nunito text-center text-2xl font-extrabold !text-[#234467] sm:text-4xl">
          Areas of application may include
        </h3>
        <div className="font-jakarta mx-auto mt-8 grid max-w-5xl auto-rows-fr gap-5 text-center text-lg font-semibold text-[#3a3a3a] sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Hormone Optimisation",
            "Dermatology",
            "Nutritional Therapy",
            "Integrative & Functional Medicine",
            "Pain Management",
            "Weight Management",
          ].map((t) => (
            <p
              key={t}
              className="flex h-full min-h-[124px] items-center justify-center rounded-[44px] border border-[#dce9c9] bg-[#f7fbe9] px-6 py-5 text-center text-base font-bold leading-snug text-[#234467] sm:text-lg"
            >
              {t}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormIcon({ kind }: { kind: "capsules" | "dropper" | "jar" | "patch" | "syringe" | "lips" }) {
  const common = "h-10 w-10 text-[#1f1f1f]";
  switch (kind) {
    case "capsules":
      return (
        <Image
          src="/capsule-icon.png"
          alt="Capsules icon"
          width={44}
          height={44}
          className="h-11 w-11 rounded-md object-contain"
        />
      );
    case "dropper":
      return (
        <Image
          src="/flavored-syrup.png"
          alt="Oral liquids icon"
          width={52}
          height={52}
          className="h-[52px] w-[52px] rounded-md object-contain"
        />
      );
    case "jar":
      return (
        <Image
          src="/cream.png"
          alt="Topical preparations icon"
          width={44}
          height={44}
          className="h-11 w-11 rounded-md object-contain"
        />
      );
    case "patch":
      return (
        <Image
          src="/patch.png"
          alt="Implants and transdermal preparations icon"
          width={44}
          height={44}
          className="h-11 w-11 rounded-md object-contain"
        />
      );
    case "syringe":
      return (
        <Image
          src="/syringe.png"
          alt="Sterile and non-sterile injectables icon"
          width={44}
          height={44}
          className="h-11 w-11 rounded-md object-contain"
        />
      );
    default:
      return (
        <Image
          src="/lips.png"
          alt="Sublingual, buccal and rectal dosage forms icon"
          width={44}
          height={44}
          className="h-11 w-11 rounded-md object-contain"
        />
      );
  }
}
