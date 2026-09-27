import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const socials = [
  { name: 'GitHub', icon: '🐙', link: '#', color: 'hover:text-white' },
  { name: 'LinkedIn', icon: '💼', link: '#', color: 'hover:text-blue-400' },
  { name: 'Twitter', icon: '🐦', link: '#', color: 'hover:text-sky-400' },
  { name: 'Dribbble', icon: '🏀', link: '#', color: 'hover:text-pink-400' },
];

export default function Contact() {
  const { ref, isVisible } = useScrollAnimation();
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <section id="contact" className="relative py-32 px-6">
      {/* Background accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-purple-400 font-medium text-sm uppercase tracking-wider">Contact</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            Let's work
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> together</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Have a project in mind? Let's create something extraordinary.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Get in touch</h3>
              <p className="text-gray-400 leading-relaxed">
                I'm always open to discussing new projects, creative ideas, or opportunities
                to be part of your vision. Feel free to reach out through any channel.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-2xl">📧</span>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-gray-300">alex@example.com</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="text-gray-300">San Francisco, CA</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-2xl">⏰</span>
                <div>
                  <div className="text-sm text-gray-500">Response Time</div>
                  <div className="text-gray-300">Within 24 hours</div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Find me on</h4>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.link}
                    whileHover={{ scale: 1.2, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl transition-colors ${social.color}`}
                    title={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center p-8 rounded-2xl bg-white/[0.02] border border-green-500/20">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      className="text-6xl mb-4"
                    >
                      ✅
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-400">I'll get back to you within 24 hours.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {[
                    { name: 'name', label: 'Name', type: 'text', placeholder: 'John Doe' },
                    { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
                  ].map((field) => (
                    <div key={field.name} className="relative">
                      <label className="text-sm text-gray-400 mb-2 block">{field.label}</label>
                      <div className="relative">
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formState[field.name as keyof typeof formState]}
                          onChange={(e) => setFormState({ ...formState, [field.name]: e.target.value })}
                          onFocus={() => setFocused(field.name)}
                          onBlur={() => setFocused('')}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all"
                          required
                        />
                        <motion.div
                          animate={focused === field.name ? { scaleX: 1 } : { scaleX: 0 }}
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full origin-left"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="relative">
                    <label className="text-sm text-gray-400 mb-2 block">Message</label>
                    <div className="relative">
                      <textarea
                        placeholder="Tell me about your project..."
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        onFocus={() => setFocused('message')}
                        onBlur={() => setFocused('')}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all resize-none"
                        required
                      />
                      <motion.div
                        animate={focused === 'message' ? { scaleX: 1 } : { scaleX: 0 }}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full origin-left"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-semibold text-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-shadow"
                  >
                    Send Message ✨
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
