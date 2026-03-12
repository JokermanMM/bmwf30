import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Plus, Check, Clock, AlertCircle, Lock, GripVertical } from 'lucide-react';
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
    
    // If not logged in, show demo data only
    if (!session) {
      setGoals([
        { id: 'd1', title: 'Установить М-зеркала', completed: true, completed_at: new Date().toISOString(), position: 0 },
        { id: 'd2', title: 'Сделать детейлинг', completed: false, completed_at: null, position: 1 },
        { id: 'd3', title: 'Новый выхлоп', completed: false, completed_at: null, position: 2 },
        { id: 'f1', title: '🎣 Найти новое место для рыбалки', completed: false, completed_at: null, position: 3 }
      ]);
      setLoading(false);
      return;
    }

    try {
      if (import.meta.env.VITE_SUPABASE_URL === 'placeholder_url' || !import.meta.env.VITE_SUPABASE_URL) {
        throw new Error("Supabase credentials missing");
      }
      
      const { data, error } = await supabase.from('goals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      const userGoals = data || [];
      // Persistent Easter Egg for all users
      setGoals([
        ...userGoals,
        { id: 'f_persistent', title: '🎣 Найти новое место для рыбалки', completed: false, completed_at: null, position: userGoals.length + 100 }
      ]);
    } catch (error) {
      console.warn('Supabase error:', error.message);
      setDbError(true);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim() || !session) return;

    const newPosition = goals.length;
    const goalData = {
      title: newGoal,
      completed: false,
      user_id: session.user.id,
      position: newPosition
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

  const handleReorder = async (newOrder) => {
    if (!session) return;
    setGoals(newOrder); // Optimistic UI update

    try {
      if (dbError) return;
      // Fire individual updates to save the new order indices
      const updatePromises = newOrder.map((goal, index) => {
        return supabase
          .from('goals')
          .update({ position: index })
          .eq('id', goal.id)
          .eq('user_id', session.user.id);
      });
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error saving new order', error);
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
          {session ? "Планы, мечты и техническое обслуживание на этот год." : "Войдите, чтобы отслеживать свои планы по проекту F30."}
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
          <Reorder.Group 
            axis="y" 
            values={goals} 
            onReorder={handleReorder} 
            className="goals-list"
          >
            {goals.map((goal) => {
              const takesAction = session && session.user.id === goal.user_id;
              return (
                <Reorder.Item 
                  key={goal.id}
                  value={goal}
                  className={`goal-item ${goal.completed ? 'completed' : ''}`}
                  dragListener={takesAction} // Only allow dragging if it's the user's item
                >
                  {takesAction && (
                    <div className="drag-handle" title="Drag to reorder">
                      <GripVertical size={18} />
                    </div>
                  )}

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
                </Reorder.Item>
              );
            })}
            
            {!loading && goals.length === 0 && session && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '2rem 0' }}>
                Пока нет целей. Начните планировать!
              </p>
            )}
          </Reorder.Group>

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
                <Lock size={16} /> Войти, чтобы управлять планами
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
