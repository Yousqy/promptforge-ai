import React from 'react'
import { Sparkles, Terminal, Cpu, Layers } from 'lucide-react'

export default function BentoFeatures() {
  return (
    <section id="features" className="py-24 bg-zinc-950 text-zinc-100 border-t border-zinc-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="max-w-2xl mx-auto text-center mb-20">
          <h2 className="text-base font-semibold leading-7 text-orange-500 tracking-wide uppercase">
            Core Engine
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Engineered for cross-model scale
          </p>
          <p className="mt-4 text-base text-zinc-400">
            A premium architectural look into our processing stack. Zero bloat, maximum performance parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
          
          {/* Card 1: Large Highlight Block */}
          <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-zinc-900/40 border border-zinc-900 p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/15 transition-all duration-500" />
            
            <div className="max-w-md space-y-4 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Terminal className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Multi-Model Token Compilation</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Our parsing pipeline translates system constraints instantly across distinct tokenizer behaviors. Get targeted, high-fidelity prompt context outputs without losing architectural prompt intent.
              </p>
            </div>
            
            <div className="mt-6 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 font-mono text-[11px] text-zinc-500 space-y-1 select-none">
              <span className="text-orange-400">const</span> compiler = new <span className="text-amber-400">PromptCompiler</span>();<br />
              <span className="text-orange-400">await</span> compiler.<span className="text-blue-400">compile</span>(&#123; target: <span className="text-green-400">&quot;all_models&quot;</span> &#125;);
            </div>
          </div>

          {/* Card 2: Small Compact Block */}
          <div className="rounded-3xl bg-zinc-900/40 border border-zinc-900 p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="h-10 w-10 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Low-Latency Pipeline</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">Sub-millisecond prompt transformations across active framework APIs.</p>
            </div>
          </div>

          {/* Card 3: Small Compact Block */}
          <div className="rounded-3xl bg-zinc-900/40 border border-zinc-900 p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="h-10 w-10 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center">
              <Layers className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Context Anchoring</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">Locks prompt parameters across variables seamlessly without tokens drifting.</p>
            </div>
          </div>

          {/* Card 4: Horizontal Banner Block */}
          <div className="md:col-span-3 rounded-3xl bg-zinc-900/20 border border-zinc-900 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-orange-500 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Next-Gen Capabilities
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Adaptive Optimization Infrastructure</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Built to scale seamlessly as new model endpoints open up. Your baseline prompt rules translate smoothly into future LLM models right away.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
