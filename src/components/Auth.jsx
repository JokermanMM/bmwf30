import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle, Loader2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Auth.css';

export default function Auth({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (import.meta.env.VITE_SUPABASE_URL === 'placeholder_url' || !import.meta.env.VITE_SUPABASE_URL) {
          throw new Error("Supabase is not configured. Setup environment variables first.");
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nickname: nickname
            }
          }
        });
        if (error) throw error;
        alert('Проверьте почту для подтверждения или войдите, если подтверждение отключено.');
        setIsLogin(true); // Switch to login view
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="auth-overlay">
          <motion.div 
            className="auth-modal glass"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <button className="close-btn auth-close" onClick={onClose}>
              <X size={20} />
            </button>
            
            <div className="auth-header">
              <h2>{isLogin ? 'С Возвращением' : 'Присоединяйтесь'}</h2>
              <p>{isLogin ? 'Войдите, чтобы открыть свой гараж.' : 'Создайте аккаунт, чтобы отслеживать планы по F30 и загружать фото.'}</p>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="input-group">
                  <User className="input-icon" size={18} />
                  <input 
                    type="text" 
                    placeholder="Ваш никнейм" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  placeholder="Email адрес" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  placeholder="Пароль" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? <Loader2 className="spinner" size={18} /> : (isLogin ? 'Войти' : 'Зарегистрироваться')}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                <button 
                  className="text-btn text-gradient" 
                  onClick={() => { setIsLogin(!isLogin); setError(null); }}
                  type="button"
                >
                  {isLogin ? 'Зарегистрироваться' : 'Войти'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
