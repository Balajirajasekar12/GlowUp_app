import Link from "next/link";

export default function HomePage() {
  return (
    <div className="fade-in flex flex-col items-center text-center">
      <div className="mirror-frame flex h-56 w-56 items-center justify-center bg-ink">
        <span className="font-display text-lg text-porcelain/70">
          your photo
          <br />
          goes here
        </span>
      </div>

      <div className="vanity-lights">
        <span></span><span></span><span></span><span></span><span></span>
      </div>

      <h1 className="max-w-2xl font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
        Step up to the mirror.
      </h1>
      <p className="mx-auto mt-4 max-w-lg font-body text-gray-600">
        Upload a photo and get AI skin, hair, and outfit suggestions —
        matched to real products at three budget levels, with a simulated
        preview of the look before you buy anything.
      </p>
      <Link
        href="/upload"
        className="mt-8 rounded-full bg-brass px-8 py-3 font-body text-sm font-medium text-ink hover:bg-brass-light"
      >
        Get started
      </Link>
      <p className="mt-3 font-mono text-xs uppercase tracking-wide text-gray-400">
        general suggestions — not professional advice
      </p>
    </div>
  );
}
