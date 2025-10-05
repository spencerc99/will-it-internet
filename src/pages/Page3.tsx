import { CDPlayer } from "../components/CDPlayer";

export default function Page3() {
  return (
    <div className="min-h-screen bg-[#F5F5DC] flex flex-col items-center p-4 sm:p-8">
      <h1 className="text-5xl sm:text-7xl font-serif mb-6 sm:mb-12 text-black mt-4">
        S<sup className="text-3xl sm:text-5xl">2</sup> voices
      </h1>

      <CDPlayer />
    </div>
  );
}
