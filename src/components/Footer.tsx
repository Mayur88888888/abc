import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            {'<AC />'}
          </motion.div>

          <div className="flex items-center gap-8 text-sm text-gray-500">
            <span>Built with React + Tailwind + Framer Motion</span>
          </div>

          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Alex Chen. All rights reserved.
          </div>
        </div>

        {/* Decorative line */}
        <div className="mt-8 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            Crafted with ❤️ and lots of ☕
          </p>
        </div>
      </div>
    </footer>
  );
}
