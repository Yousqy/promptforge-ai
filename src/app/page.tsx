import Navbar from "@/components/Navbar";
import CompilerPlayground from "@/components/CompilerPlayground";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CompilerPlayground />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
