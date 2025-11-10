'use client';

import React from 'react';
import { Github, Linkedin, Mail, Globe, Code, Brain, Zap, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  const skills = [
    { icon: Brain, label: 'Deep Learning', color: 'text-purple-400' },
    { icon: Zap, label: 'Computer Vision', color: 'text-yellow-400' },
    { icon: Code, label: 'Full Stack', color: 'text-cyan-400' }
  ];

  const projects = [
    { 
      name: 'Custom Object Detection', 
      desc: 'Production-grade CV models',
      icon: '🎯'
    },
    { 
      name: 'NLP for Low-Resource Languages', 
      desc: 'Fine-tuned language models',
      icon: '🗣️'
    },
    { 
      name: 'End-to-End AI Pipelines', 
      desc: 'MLOps & deployment',
      icon: '⚙️'
    }
  ];

  return (
    <footer className="relative mt-20 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 border-t border-purple-500/20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse-slow" />
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          
          {/* About Developer */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Umair Ruman</h3>
                <p className="text-purple-300 text-sm">AI Engineer & Full Stack Developer</p>
              </div>
            </div>
            
            <p className="text-purple-200 text-sm leading-relaxed">
              Specialized in <span className="text-cyan-400 font-semibold">Deep Learning</span> & 
              <span className="text-pink-400 font-semibold"> Computer Vision</span> with 4+ years 
              building intelligent systems. From custom object detection to NLP solutions for 
              low-resource languages.
            </p>

            {/* Skills Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-1.5 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 hover:border-purple-400/50 transition-all group"
                >
                  <skill.icon className={`w-4 h-4 ${skill.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs text-purple-200 font-medium">{skill.label}</span>
                </div>
              ))}
            </div>

            {/* Contact Links */}
            <div className="flex gap-3 pt-4">
              <a 
                href="mailto:programmerumair29@gmail.com"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400 hover:bg-purple-500/20 flex items-center justify-center transition-all group"
                title="Email"
              >
                <Mail className="w-4 h-4 text-purple-300 group-hover:text-purple-400 group-hover:scale-110 transition-all" />
              </a>
              <a 
                href="https://linkedin.com/in/umair-ruman"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-all group"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-blue-300 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
              </a>
              <a 
                href="https://github.com/UmairRuman"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-slate-300 hover:bg-slate-500/20 flex items-center justify-center transition-all group"
                title="GitHub"
              >
                <Github className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:scale-110 transition-all" />
              </a>
              <a 
                href="https://umairrumanportfolio.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/20 flex items-center justify-center transition-all group"
                title="Portfolio"
              >
                <Globe className="w-4 h-4 text-cyan-300 group-hover:text-cyan-400 group-hover:scale-110 transition-all" />
              </a>
            </div>
          </div>

          {/* Tech Stack & Expertise */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-400" />
              Tech Stack & Expertise
            </h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-purple-300 mb-2 font-medium">🧠 AI & Deep Learning</p>
                <div className="flex flex-wrap gap-2">
                  {['PyTorch', 'TensorFlow', 'YOLO', 'CNNs', 'RNNs', 'Transformers'].map((tech, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 px-2 py-1 rounded text-purple-200 hover:border-purple-400 transition-all cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-cyan-300 mb-2 font-medium">💻 Full Stack Development</p>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'Flutter', 'Node.js', 'MongoDB', 'Android'].map((tech, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 px-2 py-1 rounded text-cyan-200 hover:border-cyan-400 transition-all cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-yellow-300 mb-2 font-medium">🚀 MLOps & Deployment</p>
                <div className="flex flex-wrap gap-2">
                  {['Docker', 'AWS', 'CI/CD', 'Model Optimization'].map((tech, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 px-2 py-1 rounded text-yellow-200 hover:border-yellow-400 transition-all cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Projects */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Featured AI Projects
            </h4>
            
            <div className="space-y-3">
              {projects.map((project, idx) => (
                <div 
                  key={idx}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:border-purple-400/50 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{project.icon}</span>
                    <div>
                      <h5 className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">
                        {project.name}
                      </h5>
                      <p className="text-purple-300 text-xs mt-0.5">{project.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://umairrumanportfolio.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors group"
            >
              <span>View Full Portfolio</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-purple-300 text-sm">
              Built with <Heart className="w-4 h-4 inline text-pink-400 animate-pulse" /> using 
              <span className="text-cyan-400 font-semibold"> Next.js</span>, 
              <span className="text-purple-400 font-semibold"> GSAP</span> & 
              <span className="text-pink-400 font-semibold"> Tailwind</span>
            </p>
            <p className="text-purple-400 text-xs mt-1">
              Inspired by "Attention is All You Need" (Vaswani et al., 2017)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-400/30 rounded-full px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-purple-200 font-medium">Open for Collaboration</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-6 border-t border-purple-500/10">
          <p className="text-purple-400 text-xs">
            © {new Date().getFullYear()} <span className="text-purple-300 font-semibold">Umair Ruman</span>. 
            All rights reserved. | AI Engineer specializing in Deep Learning & Computer Vision
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
}