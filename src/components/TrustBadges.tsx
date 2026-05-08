import React from 'react';
import { motion } from 'framer-motion';
import { Gem, Globe, Award, Leaf } from 'lucide-react';

const pillars = [
  {
    icon: Gem,
    title: 'Artisan Crafted',
    desc: 'Every piece handcrafted by master artisans in Jaipur, Delhi, Mumbai, and Surat.',
  },
  {
    icon: Globe,
    title: 'Indo-European Design',
    desc: 'Heritage aesthetics refined through a European minimalist lens.',
  },
  {
    icon: Award,
    title: 'Certified Materials',
    desc: '22K gold plating, sterling silver, and ethically sourced gemstones.',
  },
  {
    icon: Leaf,
    title: 'Conscious Luxury',
    desc: 'Sustainable practices, fair wages, and direct artisan partnerships.',
  },
];

const TrustBadges: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-charcoal">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-full border border-gold-400/30 flex items-center justify-center mx-auto mb-4">
                <p.icon size={20} className="text-gold-400" />
              </div>
              <h4 className="font-serif text-ivory text-lg font-light mb-2">{p.title}</h4>
              <p className="text-ivory/40 text-xs font-sans leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
