import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollAnimation(0.5);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2000;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const stats = [
  { value: 5, suffix: '+', label: 'Years Experience' },
  { value: 50, suffix: '+', label: 'Projects Completed' },
  { value: 30, suffix: '+', label: 'Happy Clients' },
  { value: 99, suffix: '%', label: 'Satisfaction Rate' },
];

export default function About() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="about" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-purple-400 font-medium text-sm uppercase tracking-wider">About Me</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            Passionate about creating
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> digital magic</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600 to-cyan-600 p-[2px] animate-spin" style={{ animationDuration: '8s' }}>
                <div className="w-full h-full rounded-3xl bg-gray-900" />
              </div>
              {/* Content */}
              <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <div className="text-8xl mb-4">👨‍💻</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm">Available for work</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Based in San Francisco, CA<br />
                      Building the future, one pixel at a time
                    </p>
                  </div>
                </div>
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-8 right-8 text-3xl"
                >
                  ⚡
                </motion.div>
                <motion.div
                  animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute bottom-8 left-8 text-3xl"
                >
                  🚀
                </motion.div>
                <motion.div
                  animate={{ x: [-5, 5, -5], y: [-5, 5, -5] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute top-1/2 right-4 text-2xl"
                >
                  💡
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right - Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              Turning complex problems into elegant solutions
            </h3>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                With over 5 years of experience in web development, I specialize in building
                high-performance applications that are both beautiful and functional. My passion
                lies at the intersection of design and engineering.
              </p>
              <p>
                I believe great software is not just about writing code — it's about understanding
                people, solving real problems, and creating experiences that delight users.
                Every project is an opportunity to push boundaries and learn something new.
              </p>
              <p>
                When I'm not coding, you'll find me exploring new technologies, contributing
                to open source, or sharing knowledge through technical writing and mentoring.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-10">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
