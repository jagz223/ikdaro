import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-[1440px] flex-col items-start justify-center gap-6 px-4 sm:px-8">
      <p lang="ko" className="font-myeongjo text-[clamp(5rem,16vw,12rem)] leading-none font-extrabold text-lacquer">미아</p>
      <h1 className="text-3xl font-black">404</h1>
      <Link href="/" className="font-bold underline-offset-4 hover:text-lacquer hover:underline">
        Ikdaro ←
      </Link>
    </section>
  );
}
