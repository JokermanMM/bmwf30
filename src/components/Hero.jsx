import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-bg">
        <div className="glow-orb blue"></div>
        <div className="glow-orb red"></div>
      </div>
      
      <div className="container hero-container">
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-badge glass"
          >
            <Terminal size={14} /> System Online // F30.v1.0
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-title"
          >
            THE ULTIMATE <br />
            <span className="text-gradient">DRIVING MACHINE</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-subtitle"
          >
            BMW F30 PROJECT · BAVARIAN ENGINEERING MEETS CODE
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hero-btn-group"
          >
            <a href="#roadmap" className="btn btn-primary">View Roadmap</a>
            <a href="#gallery" className="btn btn-secondary">Gallery</a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
