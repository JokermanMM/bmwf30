import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { LogOut, User } from 'lucide-react';

export default function Header({ session, onOpenAuth }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-content">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="logo"
        >
          <div className="m-stripes">
            <div className="stripe light-blue"></div>
            <div className="stripe dark-blue"></div>
            <div className="stripe red"></div>
          </div>
          F30 PROJECT
        </motion.div>
        
        <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <a href="#hero" className="nav-link">Home</a>
          <a href="#roadmap" className="nav-link">Roadmap</a>
          <a href="#gallery" className="nav-link">Gallery</a>
          
          <div style={{ width: '1px', height: '20px', background: 'var(--border-light)' }}></div>
          
          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} />
                {session.user.email.split('@')[0]}
              </span>
              <button onClick={handleLogout} className="text-btn" style={{ color: 'var(--m-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogOut size={14} /> Exit
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
