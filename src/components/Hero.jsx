import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-bg">
        <div className="glow-orb blue"></div>
        <div className="glow-orb green"></div>
      </div>
      
      <div className="container hero-container">
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-title"
          >
            КЛУБНЫЙ ГАРАЖ <br />
            <span className="text-gradient">ДЛЯ ДРУЗЕЙ И ФАНАТОВ</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-subtitle"
          >
            ПРОЕКТ BMW F30 · БАВАРСКАЯ ИНЖЕНЕРИЯ И КОД
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hero-btn-group"
          >
            <a href="#roadmap" className="btn btn-primary">Мои планы</a>
            <a href="#gallery" className="btn btn-secondary">Галерея</a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
