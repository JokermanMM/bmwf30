import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Gallery.css';

export default function Gallery({ session, onOpenAuth }) {
  const [selectedImg, setSelectedImg] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [dbError, setDbError] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPhotos();
  }, [session]);

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
        { id: '1', url: 'https://images.unsplash.com/photo-1555353540-64fd3b71c905?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Демо BMW', user_id: 'demo' },
        { id: '2', url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Демо BMW 2', user_id: 'demo' }
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
      alert('Ошибка при загрузке фото. Проверьте консоль или убедитесь, что корзина (bucket) публичная.');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (photo) => {
    if (!session || photo.user_id !== session.user.id) return;
    
    if (!window.confirm("Вы уверены, что хотите удалить это фото?")) return;

    setDeletingId(photo.id);
    
    try {
      // 1. Delete from database
      const { error: dbError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', photo.id)
        .eq('user_id', session.user.id);

      if (dbError) throw dbError;

      // 2. We could delete from storage here, but we need the filename from the URL.
      // Easiest is to extract it:
      const urlParts = photo.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      const { error: storageError } = await supabase.storage
        .from('car-images')
        .remove([fileName]);
        
      if (storageError) console.error("Storage delete error:", storageError);

      // 3. Update UI
      setPhotos(photos.filter(p => p.id !== photo.id));
      setSelectedImg(null); // Close lightbox
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Ошибка при удалении фото.');
    } finally {
      setDeletingId(null);
    }
  };

  // Ticker Logic
  const [baseVelocity, setBaseVelocity] = useState(0.4);
  const x = useRef(0);
  const trackRef = useRef(null);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;
    
    // Normalize distance from center: -1 to 1
    const normalized = (mouseX - centerX) / (rect.width / 2);
    // Speed: max 8px per frame, min -8px
    setBaseVelocity(normalized * 8);
  };

  const handleMouseLeave = () => {
    setBaseVelocity(1); // Resume slow default crawl
  };

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      if (trackRef.current && photos.length > 0) {
        x.current -= baseVelocity;
        
        // Loop logic: assuming photos are fixed width + gap
        // Each item is 400px + 1.5rem (24px) gap = 424px
        const itemWidth = 424; 
        const totalWidth = photos.length * itemWidth;
        
        if (x.current <= -totalWidth) {
          x.current += totalWidth;
        } else if (x.current > 0) {
          x.current -= totalWidth;
        }
        
        trackRef.current.style.transform = `translateX(${x.current}px)`;
      }
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [photos, baseVelocity]);

  return (
    <section id="gallery" className="section" style={{ overflowX: 'hidden' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 className="section-title text-gradient" style={{ marginBottom: '1rem' }}>Общая Галерея</h2>
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
                  {uploading ? 'Загрузка...' : 'Загрузить Фото'}
                </button>
              </>
            ) : (
                <button 
                  className="btn btn-secondary" 
                  onClick={onOpenAuth}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Upload size={18} /> Войти для загрузки
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
            <p>Загрузка гаража сообщества...</p>
          </div>
        ) : (
          <div 
            className="gallery-ticker-container" 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="gallery-ticker-track" ref={trackRef}>
              {/* Render photos twice for infinite loop */}
              {[...photos, ...photos, ...photos].map((photo, index) => (
                <motion.div 
                  key={`${photo.id || index}-${index}`}
                  className="gallery-item"
                  onClick={() => setSelectedImg(photo)}
                >
                  <img src={photo.url} alt={photo.alt || 'Car photo'} loading="lazy" />
                  <div className="gallery-overlay">
                    <span>Смотреть</span>
                  </div>
                </motion.div>
              ))}
            </div>
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
              <div className="lightbox-actions" onClick={(e) => e.stopPropagation()}>
                {session && session.user.id === selectedImg.user_id && (
                  <button 
                    className="icon-btn delete-btn" 
                    onClick={() => handleDelete(selectedImg)}
                    disabled={deletingId === selectedImg.id}
                    title="Delete your photo"
                  >
                    {deletingId === selectedImg.id ? <Loader2 className="spinner" size={20} /> : <Trash2 size={20} />}
                  </button>
                )}
                <button className="icon-btn" onClick={() => setSelectedImg(null)} title="Закрыть">
                  <X size={24} />
                </button>
              </div>
              
              <motion.img 
                src={selectedImg.url} 
                alt="Машина сообщества"
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
