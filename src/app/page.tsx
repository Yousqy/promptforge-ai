import Navbar from "@/components/Navbar";
import CompilerPlayground from "@/components/CompilerPlayground";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import BentoFeatures from "@/components/ui/bento-features";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const testimonials = [
  {
    quote:
      "PromptForge cut our prompt iteration cycle from hours to minutes. The multi-model compilation is genuinely useful — we ship optimized prompts for Midjourney and DALL-E 3 in a single workflow now.",
    name: "Elena Marchetti",
    designation: "Lead AI Engineer at Synthetix Labs",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop&crop=face",
  },
  {
    quote:
      "We integrated PromptForge into our content pipeline last quarter. The brand style tokens alone saved us from the prompt drift we kept fighting. Essential tool for any team serious about AI output quality.",
    name: "Marcus Chen",
    designation: "Founder at SaaSify",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=face",
  },
  {
    quote:
      "As a designer who works across tools daily, PromptForge is the one I keep open. The UI is clean, the compiler is fast, and the vision analysis feature has become my go-to for reverse-engineering visual styles.",
    name: "Aisha Patel",
    designation: "Product Designer at Meridian Studio",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop&crop=face",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="relative">
          <ShaderAnimation />
          <div className="relative z-10">
            <CompilerPlayground />
          </div>
        </div>
        <BentoFeatures />
        <Pricing />
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Loved by teams shipping AI products
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
                From solo founders to enterprise teams — hear how PromptForge
                transforms the way people write and scale AI prompts.
              </p>
            </div>
            <CircularTestimonials
              testimonials={testimonials}
              autoplay={true}
              colors={{
                name: "#f7f7ff",
                designation: "#a1a1aa",
                testimony: "#e4e4e7",
                arrowBackground: "#8b5cf6",
                arrowForeground: "#ffffff",
                arrowHoverBackground: "#7c3aed",
              }}
              fontSizes={{
                name: "24px",
                designation: "14px",
                quote: "16px",
              }}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
