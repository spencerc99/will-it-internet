import { Helmet } from "react-helmet-async";
import { CDPlayer } from "../components/CDPlayer";

export default function Page3() {
  return (
    <>
      <Helmet>
        <title>d2d</title>
        <link rel="icon" type="image/jpeg" href="/d2d-icon.jpg" />
        <link rel="apple-touch-icon" href="/d2d-icon.jpg" />
      </Helmet>
      <div className="h-[100dvh] bg-[#F5F5DC] flex items-center justify-center overflow-hidden fixed inset-0 p-4 sm:p-8">
        <CDPlayer />
      </div>
    </>
  );
}
