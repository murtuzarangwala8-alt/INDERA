import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, PackageCheck, RotateCcw, ShieldCheck } from 'lucide-react';

const Returns: React.FC = () => {
  return (
    <main className="bg-obsidian text-ivory min-h-screen">
      <section className="pt-32 pb-20 px-6 lg:px-8 border-b border-ivory/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-gold-400 uppercase tracking-[0.35em] text-xs mb-5">Customer Care</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-wide mb-6">
            Returns & Refunds
          </h1>
          <p className="text-ivory/60 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
            Returns are available for eligible INDERA pieces. If your product arrives damaged,
            we offer a full 100% refund or a replacement after review.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            {
              icon: PackageCheck,
              title: 'Returns Available',
              body: 'Eligible jewelry can be returned if it is unused, unworn, and sent back with original packaging.',
            },
            {
              icon: ShieldCheck,
              title: 'Damaged Product Protection',
              body: 'If an item is damaged on arrival, we can offer a 100% refund or replacement once the issue is confirmed.',
            },
            {
              icon: RotateCcw,
              title: 'Replacement Option',
              body: 'When stock is available, you may choose a replacement instead of a refund for damaged products.',
            },
          ].map((item) => (
            <article key={item.title} className="border border-ivory/10 p-6 bg-ivory/[0.02]">
              <item.icon className="text-gold-400 mb-5" size={28} />
              <h2 className="font-serif text-2xl mb-3">{item.title}</h2>
              <p className="text-ivory/55 text-sm leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-3xl mb-4">Return Conditions</h2>
              <ul className="space-y-3 text-ivory/60 leading-relaxed">
                {[
                  'Contact us before sending any item back so we can approve the return.',
                  'Returned pieces must be unused, unworn, and in original packaging.',
                  'Custom, personalized, worn, or damaged-by-use items may not be eligible for return.',
                  'Return shipping instructions will be shared after your request is reviewed.',
                ].map((text) => (
                  <li key={text} className="flex gap-3">
                    <CheckCircle2 className="text-gold-400 shrink-0 mt-1" size={17} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-3xl mb-4">Damaged Products</h2>
              <p className="text-ivory/60 leading-relaxed">
                If your order arrives damaged, contact us as soon as possible with your order
                number and clear photos of the item, packaging, and shipping label. Once verified,
                INDERA can provide a 100% refund or arrange a replacement.
              </p>
            </div>
          </div>

          <aside className="border border-gold-400/30 p-8 bg-gold-400/[0.05] self-start">
            <h2 className="font-serif text-3xl mb-4">Need Help?</h2>
            <p className="text-ivory/60 leading-relaxed mb-6">
              Send us your order number and a short explanation. For damaged items, include photos
              so we can process your refund or replacement faster.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-gold-400 text-obsidian px-6 py-4 uppercase tracking-[0.2em] text-xs font-semibold hover:bg-gold-300 transition-colors"
            >
              Contact Support
              <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Returns;
