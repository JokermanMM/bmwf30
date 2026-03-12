import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './Gallery.css';

// Placeholder array. You'll add actual paths here later
const INITIAL_PHOTOS = [
  { id: 1, src: 'https://images.unsplash.com/photo-1555353540-64fd3b71c905?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'BMW F30 Side View' },
  { id: 2, src: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'BMW M-Sport Front' },
  { id: 3, src: 'https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'BMW Interior' },
  { id: 4, src: 'https://images.unsplash.com/photo-1618843475267-31d7e2e3fddd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Headlights Detail' },
];

export default function Gallery() {
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <section id="gallery" className="section">
      <div className="container">
        <h2 className="section-title text-gradient">Gallery</h2>
        <p className="section-subtitle">Visual timeline of the F30 project.</p>
        
        <div className="gallery-grid">
          {INITIAL_PHOTOS.map((photo, index) => (
            <motion.div 
              key={photo.id}
              className="gallery-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedImg(photo)}
            >
              <img src={photo.src} alt={photo.alt} loading="lazy" />
              <div className="gallery-overlay">
                <span>View</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImg && (
            <motion.div 
              className="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImg(null)}
            >
              <button className="close-btn" onClick={() => setSelectedImg(null)}>
                <X size={24} />
              </button>
              <motion.img 
                src={selectedImg.src} 
                alt={selectedImg.alt}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
