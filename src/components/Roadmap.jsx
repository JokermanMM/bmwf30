import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Clock, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Roadmap.css';

export default function Roadmap({ session, onOpenAuth }) {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [session]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      if (import.meta.env.VITE_SUPABASE_URL === 'placeholder_url' || !import.meta.env.VITE_SUPABASE_URL) {
        throw new Error("Supabase credentials missing");
      }
      
      let query = supabase.from('goals').select('*').order('id', { ascending: true });
      
      // If logged in, only fetch their goals
      if (session) {
        query = query.eq('user_id', session.user.id);
      } else {
        // If not logged in, we might either show nothing or global goals. Let's just show global goals (all public ones if any exist for guest view)
        // Let's limit it so it doesn't crash if thousands exist
        query = query.limit(10);
      }

      const { data, error } = await query;
        
      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.warn('Supabase error:', error.message);
      setDbError(true);
      // Fallback local data if DB not connected
      if (!session) {
        setGoals([
          { id: '1', title: 'Start modifying the F30', completed: true, completed_at: new Date().toISOString() },
          { id: '2', title: 'Login to add your own goals', completed: false, completed_at: null }
        ]);
      } else {
        setGoals([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim() || !session) return;

    const goalData = {
      title: newGoal,
      completed: false,
      user_id: session.user.id
    };

    const tempId = Date.now().toString();
    setGoals([...goals, { id: tempId, ...goalData }]);
    setNewGoal('');

    try {
      if (dbError) return;
      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select();
        
      if (error) throw error;
      if (data) {
        setGoals(prev => prev.map(g => g.id === tempId ? data[0] : g));
      }
    } catch (error) {
      console.error('Error adding goal', error);
    }
  };

  const toggleGoal = async (id, currentStatus, userId) => {
    if (!session || session.user.id !== userId) return;

    const newStatus = !currentStatus;
    const completedAt = newStatus ? new Date().toISOString() : null;

    setGoals(goals.map(g => 
      g.id === id ? { ...g, completed: newStatus, completed_at: completedAt } : g
    ));

    try {
      if (dbError) return;
      await supabase
        .from('goals')
        .update({ completed: newStatus, completed_at: completedAt })
        .eq('id', id)
        .eq('user_id', session.user.id);
    } catch (error) {
      console.error('Error toggling goal', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', month: 'long', year: 'numeric' 
    });
  };

  return (
    <section id="roadmap" className="section bg-secondary">
      <div className="container">
        <h2 className="section-title text-gradient">Roadmap</h2>
        <p className="section-subtitle">
          {session ? "Планы, мечты и техническое обслуживание на этот год." : "Sign in to track your personal F30 project goals."}
        </p>

        {dbError && (
          <div className="db-alert">
            <AlertCircle size={20} />
            <div>
              <strong>База данных не подключена</strong>
              <p>Ожидается подключение Supabase. Пока работает демо-режим.</p>
            </div>
          </div>
        )}

        <div className="roadmap-container glass">
          <ul className="goals-list">
            {goals.map((goal, index) => {
              const takesAction = session && session.user.id === goal.user_id;
              return (
                <motion.li 
                  key={goal.id} 
                  className={`goal-item ${goal.completed ? 'completed' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button 
                    className="goal-checkbox"
                    onClick={() => toggleGoal(goal.id, goal.completed, goal.user_id)}
                    style={{ cursor: takesAction ? 'pointer' : 'default', opacity: takesAction ? 1 : 0.5 }}
                    disabled={!takesAction}
                  >
                    {goal.completed && <Check size={16} />}
                  </button>
                  
                  <div className="goal-content">
                    <span className="goal-title">{goal.title}</span>
                    {goal.completed && goal.completed_at && (
                      <span className="goal-date tooltip" data-tooltip={`Выполнено: ${formatDate(goal.completed_at)}`}>
                        <Clock size={14} />
                      </span>
                    )}
                  </div>
                </motion.li>
              );
            })}
            
            {!loading && goals.length === 0 && session && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '2rem 0' }}>
                Пока нет целей. Начните планировать!
              </p>
            )}
          </ul>

          {session ? (
            <form onSubmit={addGoal} className="add-goal-form">
              <input 
                type="text" 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Добавить новую цель..."
                className="goal-input"
              />
              <button type="submit" className="add-btn" disabled={!newGoal.trim()}>
                <Plus size={20} />
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <button onClick={onOpenAuth} className="btn btn-secondary" style={{ display: 'inline-flex', gap: '8px' }}>
                <Lock size={16} /> Login to manage your Roadmap
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
