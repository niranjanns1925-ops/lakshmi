import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, Clock, ArrowRight, Activity, Users, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* 3D-like Background Elements */}
      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden -z-10 bg-background">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        
        {/* Isometric Grid overlay indicating an architectural depth */}
        <div 
          className="absolute inset-0 opacity-10 dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
            transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
            transformOrigin: 'top center',
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 inset-x-0 h-20 glass border-b border-border/50 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center">
            <Logo className="w-12 h-12" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground to-accent-foreground">
            E-Sevai Smart
          </span>
        </div>
        <div>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-full font-medium transition-all"
          >
            Sign In / Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Next-Generation Government Services 🏛️
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 text-foreground"
            >
              Smart, Fast & <br className="hidden lg:block"/> Secure <span className="text-primary">E-Services</span> 🚀
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-muted-foreground max-w-2xl mb-10"
            >
              Experience a beautiful, transparent, and seamless way to apply for your certificates. Real-time tracking ⏱️, intelligent document validation 📄, and instant notifications 🔔.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Access Portal <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 glass border border-border/50 text-foreground rounded-full font-bold text-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                View Services 📂
              </button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateY: -15, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:block relative perspective-1000"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-[3rem] filter blur-3xl transform -translate-x-4 translate-y-4"></div>
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
              alt="Abstract 3D Shape" 
              className="w-full h-auto max-h-[600px] object-cover rounded-[3rem] shadow-2xl border border-white/20 glass"
            />
            
            {/* Floating elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 glass p-5 rounded-2xl border border-white/40 shadow-xl"
            >
              <FileText className="text-primary" size={32} />
              <div className="mt-2 text-xs font-semibold">Approved ✨</div>
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 20, 0] }} 
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 glass p-5 rounded-2xl border border-white/40 shadow-xl"
            >
              <Logo className="w-8 h-8" />
              <div className="mt-2 text-xs font-semibold">Eco-Friendly 🌱</div>
            </motion.div>
          </motion.div>
        </div>

        {/* 3D Features Showcase */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: FileText, title: 'Smart Validation', desc: 'Auto-verification of document formats' },
            { icon: Activity, title: 'Real-time Tracking', desc: 'Watch your application progress live' },
            { icon: Clock, title: 'Quick Processing', desc: 'Minimal turnaround time for certificates' },
          ].map((feature, i) => (
            <div 
              key={i}
              className="glass p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border border-glass-border hover:shadow-2xl hover:shadow-primary/10"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-black/5 text-primary">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
