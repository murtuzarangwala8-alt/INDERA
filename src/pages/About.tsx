import React from 'react';
import { motion } from 'framer-motion';
import Artisan from '../components/Artisan';
import Newsletter from '../components/Newsletter';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory pt-20">
      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1600&q=80"
          alt="INDÉRA artisan jewelry craftsmanship"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-obsidian/60" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-gold-400 text-[10px] tracking-[0.4em] uppercase font-sans mb-4">Our Story</p>
            <h1 className="font-serif text-ivory text-5xl lg:text-6xl font-light">
              Modern Indian Heritage
              <br />
              Reimagined for Europe
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Story */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="font-serif text-obsidian text-2xl font-light leading-relaxed mb-8">
              "We believe India's 5,000-year jewelry tradition deserves a place in the world's most
              discerning wardrobes — not as ethnic novelty, but as genuine luxury."
            </p>
            <div className="section-divider mb-8" />
            <p className="text-obsidian/60 font-sans font-light text-base leading-relaxed mb-6">
              INDÉRA was founded by a team of designers and entrepreneurs who grew up between two worlds —
              the rich visual culture of India and the refined minimalism of European fashion capitals.
              We saw a gap: beautiful Indian jewelry was either sold as cheap ethnic fashion or locked
              behind the doors of traditional jewellers with no digital presence.
            </p>
            <p className="text-obsidian/60 font-sans font-light text-base leading-relaxed mb-6">
              We set out to change that. Working directly with master craftsmen in Jaipur, Delhi, Mumbai,
              and Surat, we co-design pieces that honour traditional techniques — Kundan, Meenakari, Polki,
              pearl-setting — while stripping away everything that feels dated or heavy.
            </p>
            <p className="text-obsidian/60 font-sans font-light text-base leading-relaxed">
              The result is jewelry that a woman in Milan, Amsterdam, or London can wear to a gallery
              opening, a board meeting, or a wedding — and feel completely herself.
            </p>
          </motion.div>
        </div>
      </section>

      <Artisan />

      {/* Values */}
      <section className="py-24 px-6 bg-ivory">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-4">What We Stand For</p>
            <h2 className="font-serif text-obsidian text-4xl font-light">Our Values</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Fair Artisan Wages', desc: 'We pay 40% above market rate to every artisan family we work with. Their skill is irreplaceable.' },
              { title: 'Ethical Sourcing', desc: 'All gemstones are ethically sourced. We trace every stone back to its origin and verify working conditions.' },
              { title: 'Slow Fashion', desc: 'We release two collections per year. No fast fashion, no overproduction. Every piece is made to last a lifetime.' },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 border border-obsidian/8"
              >
                <h3 className="font-serif text-obsidian text-2xl font-light mb-4">{v.title}</h3>
                <p className="text-obsidian/50 font-sans font-light text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
};

export default About;
