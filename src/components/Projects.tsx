import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Project {
  title: string;
  description: string;
  tags: string[];
  gradient: string;
  emoji: string;
  link: string;
}

const projects: Project[] = [
  {
    title: 'NeuralCanvas',
    description: 'AI-powered design tool that generates UI components from natural language descriptions. Built with React, OpenAI API, and Figma plugin SDK.',
    tags: ['React', 'OpenAI', 'Figma SDK', 'TypeScript'],
    gradient: 'from-purple-600 to-pink-600',
    emoji: '🧠',
    link: '#',
  },
  {
    title: 'StreamSync',
    description: 'Real-time collaborative workspace with live cursors, shared editing, and video chat. Handles 10k+ concurrent users with WebSocket architecture.',
    tags: ['Next.js', 'WebSocket', 'Redis', 'WebRTC'],
    gradient: 'from-cyan-600 to-blue-600',
    emoji: '🔄',
    link: '#',
  },
  {
    title: 'EcoTrack',
    description: 'Carbon footprint tracking app with gamification elements. Features data visualization, social challenges, and integration with smart home devices.',
    tags: ['React Native', 'D3.js', 'Node.js', 'MongoDB'],
    gradient: 'from-green-600 to-emerald-600',
    emoji: '🌱',
    link: '#',
  },
  {
    title: 'SoundScape',
    description: '3D audio visualization platform using Web Audio API and Three.js. Creates immersive musical experiences with real-time frequency analysis.',
    tags: ['Three.js', 'Web Audio', 'GLSL', 'React'],
    gradient: 'from-orange-600 to-red-600',
    emoji: '🎵',
    link: '#',
  },
  {
    title: 'CryptoVault',
    description: 'Decentralized finance dashboard with portfolio tracking, yield farming analytics, and real-time market data from multiple blockchain networks.',
    tags: ['Web3.js', 'Ethereum', 'GraphQL', 'Chart.js'],
    gradient: 'from-yellow-600 to-amber-600',
    emoji: '🔐',
    link: '#',
  },
  {
    title: 'DevFlow',
    description: 'Developer productivity tool with AI code review, automated testing, and deployment pipelines. Reduces CI/CD time by 60%.',
    tags: ['Go', 'Docker', 'GitHub API', 'ML'],
    gradient: 'from-indigo-600 to-violet-600',
    emoji: '⚡',
    link: '#',
  },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 10);
    setRotateY((centerX - x) / 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        }}
        className="group relative h-full"
      >
        <div className="relative h-full p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all overflow-hidden">
          {/* Gradient overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
          />

          {/* Shine effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at ${50 + rotateY * 2}% ${50 - rotateX * 2}%, rgba(255,255,255,0.1) 0%, transparent 60%)`,
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <motion.span
                animate={isHovered ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                className="text-4xl"
              >
                {project.emoji}
              </motion.span>
              <motion.div
                animate={isHovered ? { x: 5, y: -5 } : { x: 0, y: 0 }}
                className="text-gray-500 group-hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </motion.div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">
              {project.title}
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-md bg-white/5 text-gray-400 border border-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="projects" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-purple-400 font-medium text-sm uppercase tracking-wider">Projects</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            Featured
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> work</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            A selection of projects that showcase my skills and passion for building great products.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
