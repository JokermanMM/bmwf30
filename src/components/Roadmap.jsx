import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Roadmap.css';

const INITIAL_GOALS = [
  { id: '1', title: 'Замена передней подвески', completed: false, completed_at: null },
  { id: '2', title: 'Пофиксить лкп-косячки', completed: false, completed_at: null },
  { id: '3', title: 'Тонировка', completed: false, completed_at: null },
  { id: '4', title: 'Стейдж', completed: false, completed_at: null },
  { id: '5', title: 'Полировка + бронирование фар', completed: false, completed_at: null }
];

export default function Roadmap() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      if (import.meta.env.VITE_SUPABASE_URL === 'placeholder_url' || !import.meta.env.VITE_SUPABASE_URL) {
        throw new Error("Supabase credentials missing");
      }
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setGoals(data);
      } else {
        setGoals(INITIAL_GOALS);
      }
    } catch (error) {
      console.warn('Supabase not connected. Using local fallback.');
      setDbError(true);
      setGoals(INITIAL_GOALS);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    const goalData = {
      title: newGoal,
      completed: false,
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

  const toggleGoal = async (id, currentStatus) => {
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
        .eq('id', id);
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
        <p className="section-subtitle">Планы, мечты и техническое обслуживание на этот год.</p>

        {dbError && (
          <div className="db-alert">
            <AlertCircle size={20} />
            <div>
              <strong>Демо-режим базы данных</strong>
              <p>Supabase пока не подключена. Изменения не сохранятся после обновления страницы. Инструкции по настройке есть в README.</p>
            </div>
          </div>
        )}

        <div className="roadmap-container glass">
          <ul className="goals-list">
            {goals.map((goal, index) => (
              <motion.li 
                key={goal.id} 
                className={`goal-item ${goal.completed ? 'completed' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button 
                  className="goal-checkbox"
                  onClick={() => toggleGoal(goal.id, goal.completed)}
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
            ))}
          </ul>

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
        </div>
      </div>
    </section>
  );
}
