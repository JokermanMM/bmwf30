import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Gallery.css';

export default function Gallery({ session, onOpenAuth }) {
  const [selectedImg, setSelectedImg] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dbError, setDbError] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      if (import.meta.env.VITE_SUPABASE_URL === 'placeholder_url' || !import.meta.env.VITE_SUPABASE_URL) {
        throw new Error("Supabase missing");
      }

      const { data, error } = await supabase
        .from('gallery')
        .select('*');

      if (error) throw error;
      
      // Shuffle array randomly
      const shuffled = (data || []).sort(() => 0.5 - Math.random());
      setPhotos(shuffled);
    } catch (error) {
      console.warn('Supabase missing or gallery error:', error);
      setDbError(true);
      setPhotos([
        { id: '1', url: 'https://images.unsplash.com/photo-1555353540-64fd3b71c905?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Demo BMW' },
        { id: '2', url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Demo BMW 2' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !session) return;

    setUploading(true);
    try {
      if (dbError) throw new Error("DB Error on upload");

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('car-images').getPublicUrl(filePath);

      // Insert into gallery DB
      const photoData = {
        url: data.publicUrl,
        user_id: session.user.id,
      };

      const { error: dbInsertError } = await supabase
        .from('gallery')
        .insert([photoData]);

      if (dbInsertError) throw dbInsertError;

      fetchPhotos(); // Re-fetch to see new photo randomly placed
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Check console or make sure bucket is public.');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <section id="gallery" className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 className="section-title text-gradient" style={{ marginBottom: '1rem' }}>Global Gallery</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>Discover rides from the community. Mixed up fresh every time.</p>
          </div>
          
          <div>
            {session ? (
              <>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <button 
                  className="btn btn-primary" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {uploading ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </>
            ) : (
                <button 
                  className="btn btn-secondary" 
                  onClick={onOpenAuth}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Upload size={18} /> Login to Upload
                </button>
            )}
          </div>
        </div>
        
        {dbError && (
          <div className="db-alert">
            <AlertCircle size={20} />
            <div>
              <strong>Функция загрузки отключена в демо-режиме</strong>
              <p>Настройте базу данных Supabase и корзину (bucket) Storage для работы общей галереи.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <Loader2 className="spinner" size={32} style={{ margin: '0 auto 1rem auto' }} />
            <p>Loading community garage...</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {photos.map((photo, index) => (
              <motion.div 
                key={photo.id || index}
                className="gallery-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 5) * 0.1 }}
                onClick={() => setSelectedImg(photo)}
              >
                <img src={photo.url} alt={photo.alt || 'Car photo'} loading="lazy" />
                <div className="gallery-overlay">
                  <span>View</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

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
                src={selectedImg.url} 
                alt="Community car"
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
