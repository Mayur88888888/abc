import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Skill {
  name: string;
  level: number;
  icon: string;
  color: string;
}

const skillCategories = [
  {
    title: 'Frontend',
    icon: '🎨',
    skills: [
      { name: 'React / Next.js', level: 95, icon: '⚛️', color: 'from-blue-400 to-cyan-400' },
      { name: 'TypeScript', level: 92, icon: '📘', color: 'from-blue-500 to-blue-400' },
      { name: 'Tailwind CSS', level: 90, icon: '🎨', color: 'from-cyan-400 to-teal-400' },
      { name: 'Three.js / WebGL', level: 75, icon: '🌐', color: 'from-purple-400 to-pink-400' },
    ] as Skill[],
  },
  {
    title: 'Backend',
    icon: '⚙️',
    skills: [
      { name: 'Node.js', level: 90, icon: '🟢', color: 'from-green-400 to-emerald-400' },
      { name: 'Python', level: 85, icon: '🐍', color: 'from-yellow-400 to-green-400' },
      { name: 'PostgreSQL', level: 82, icon: '🐘', color: 'from-blue-400 to-indigo-400' },
      { name: 'GraphQL', level: 80, icon: '◈', color: 'from-pink-400 to-rose-400' },
    ] as Skill[],
  },
  {
    title: 'Tools & DevOps',
    icon: '🛠️',
    skills: [
      { name: 'Docker / K8s', level: 80, icon: '🐳', color: 'from-blue-400 to-blue-600' },
      { name: 'AWS / GCP', level: 78, icon: '☁️', color: 'from-orange-400 to-yellow-400' },
      { name: 'Git / CI/CD', level: 92, icon: '🔀', color: 'from-red-400 to-orange-400' },
      { name: 'Figma / Design', level: 85, icon: '🎯', color: 'from-purple-400 to-violet-400' },
    ] as Skill[],
  },
];

function SkillBar({ skill, delay, isVisible }: { skill: Skill; delay: number; isVisible: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.span
            animate={hovered ? { scale: 1.3, rotate: 10 } : { scale: 1, rotate: 0 }}
            className="text-lg"
          >
            {skill.icon}
          </motion.span>
          <span className="text-gray-300 font-medium text-sm">{skill.name}</span>
        </div>
        <motion.span
          animate={hovered ? { scale: 1.1 } : { scale: 1 }}
          className="text-xs text-gray-500 font-mono"
        >
          {skill.level}%
        </motion.span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isVisible ? { width: `${skill.level}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: delay + 0.2, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${skill.color} relative`}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" style={{ animationDuration: '2s' }} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Skills() {
  const { ref, isVisible } = useScrollAnimation();
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <section id="skills" className="relative py-32 px-6">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-purple-400 font-medium text-sm uppercase tracking-wider">Skills</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            My technical
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> arsenal</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Constantly learning and evolving. Here are the technologies I work with daily.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {skillCategories.map((cat, i) => (
            <motion.button
              key={cat.title}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(i)}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeCategory === i
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.title}
            </motion.button>
          ))}
        </div>

        {/* Skills Grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {skillCategories[activeCategory].skills.map((skill, i) => (
            <div key={skill.name} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-colors">
              <SkillBar skill={skill} delay={i * 0.1} isVisible={isVisible} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
