import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, TrendingUp, Calendar, Trash2, Check, X } from 'lucide-react';

interface Habit {
  id: string;
  habit: string;
  category: 'health' | 'language' | 'productivity' | 'learning' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly';
  trigger: string | null;
  action: string | null;
  reward: string | null;
  metric_type: 'boolean' | 'minutes' | 'repetitions' | 'count';
  active: boolean;
  consistency_score: number;
  created_at: string;
}

interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  value: number | null;
  note: string | null;
  energy_level: number | null;
}

export default function Habits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user, selectedDate]);

  async function loadData() {
    if (!user) return;
    setLoading(true);

    const [{ data: habitsData }, { data: logsData }] = await Promise.all([
      supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', selectedDate),
    ]);

    setHabits(habitsData || []);
    setLogs(logsData || []);
    setLoading(false);
  }

  async function deleteHabit(id: string) {
    await supabase.from('habits').delete().eq('id', id);
    loadData();
  }

  async function toggleHabitLog(habitId: string, completed: boolean) {
    const existingLog = logs.find((l) => l.habit_id === habitId);

    if (existingLog) {
      await supabase
        .from('habit_logs')
        .update({ completed, value: completed ? 1 : 0 })
        .eq('id', existingLog.id);
    } else {
      await supabase.from('habit_logs').insert([
        {
          user_id: user!.id,
          habit_id: habitId,
          log_date: selectedDate,
          completed,
          value: completed ? 1 : 0,
        },
      ]);
    }

    loadData();
  }

  async function updateHabitValue(habitId: string, value: number) {
    const existingLog = logs.find((l) => l.habit_id === habitId);

    if (existingLog) {
      await supabase
        .from('habit_logs')
        .update({ value, completed: value > 0 })
        .eq('id', existingLog.id);
    } else {
      await supabase.from('habit_logs').insert([
        {
          user_id: user!.id,
          habit_id: habitId,
          log_date: selectedDate,
          completed: value > 0,
          value,
        },
      ]);
    }

    loadData();
  }

  const getHabitLog = (habitId: string) => logs.find((l) => l.habit_id === habitId);

  const todayCompletionRate =
    habits.length > 0
      ? Math.round((logs.filter((l) => l.completed).length / habits.length) * 100)
      : 0;

  const categories = {
    health: habits.filter((h) => h.category === 'health').length,
    language: habits.filter((h) => h.category === 'language').length,
    productivity: habits.filter((h) => h.category === 'productivity').length,
    learning: habits.filter((h) => h.category === 'learning').length,
    other: habits.filter((h) => h.category === 'other').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hábitos y Rutinas</h1>
          <p className="text-gray-600 mt-1">Seguimiento diario de tus hábitos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo hábito
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Completado hoy</div>
              <div className="text-2xl font-bold text-gray-900">{todayCompletionRate}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${todayCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total de hábitos</div>
              <div className="text-2xl font-bold text-gray-900">{habits.length}</div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 text-xs">
            {Object.entries(categories).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="font-medium text-gray-900">{value}</div>
                <div className="text-gray-500 capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Seguimiento diario</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() - 1);
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ←
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={() => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() + 1);
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                →
              </button>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
              >
                Hoy
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : habits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay hábitos activos. Crea tu primer hábito.
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const log = getHabitLog(habit.id);
                const isCompleted = log?.completed || false;
                const value = log?.value || 0;

                return (
                  <div
                    key={habit.id}
                    className={`p-4 border rounded-lg transition ${
                      isCompleted
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {habit.metric_type === 'boolean' ? (
                          <button
                            onClick={() => toggleHabitLog(habit.id, !isCompleted)}
                            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition ${
                              isCompleted
                                ? 'border-green-600 bg-green-600 text-white'
                                : 'border-gray-300 hover:border-green-600'
                            }`}
                          >
                            {isCompleted && <Check className="w-6 h-6" />}
                          </button>
                        ) : (
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => updateHabitValue(habit.id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0"
                          />
                        )}

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{habit.habit}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                habit.category === 'health'
                                  ? 'bg-green-100 text-green-700'
                                  : habit.category === 'language'
                                  ? 'bg-blue-100 text-blue-700'
                                  : habit.category === 'productivity'
                                  ? 'bg-purple-100 text-purple-700'
                                  : habit.category === 'learning'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {habit.category}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">{habit.frequency}</span>
                            {habit.metric_type !== 'boolean' && (
                              <span className="text-xs text-gray-500">
                                {habit.metric_type}
                              </span>
                            )}
                          </div>
                          {habit.trigger && (
                            <div className="text-sm text-gray-600 mt-1">
                              Trigger: {habit.trigger}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingHabit(habit);
                            setShowForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <HabitForm
          editingHabit={editingHabit}
          onClose={() => {
            setShowForm(false);
            setEditingHabit(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingHabit(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function HabitForm({ editingHabit, onClose, onSuccess }: { editingHabit: Habit | null; onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    habit: editingHabit?.habit || '',
    category: (editingHabit?.category || 'health') as Habit['category'],
    frequency: (editingHabit?.frequency || 'daily') as Habit['frequency'],
    metric_type: (editingHabit?.metric_type || 'boolean') as Habit['metric_type'],
    trigger: editingHabit?.trigger || '',
    action: editingHabit?.action || '',
    reward: editingHabit?.reward || '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (editingHabit) {
      // Actualizar hábito existente
      await supabase
        .from('habits')
        .update({
          habit: formData.habit,
          category: formData.category,
          frequency: formData.frequency,
          metric_type: formData.metric_type,
          trigger: formData.trigger || null,
          action: formData.action || null,
          reward: formData.reward || null,
        })
        .eq('id', editingHabit.id);
    } else {
      // Crear nuevo hábito
      await supabase.from('habits').insert([
        {
          user_id: user.id,
          habit: formData.habit,
          category: formData.category,
          frequency: formData.frequency,
          metric_type: formData.metric_type,
          trigger: formData.trigger || null,
          action: formData.action || null,
          reward: formData.reward || null,
          active: true,
          consistency_score: 0,
        },
      ]);
    }

    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{editingHabit ? 'Editar Hábito' : 'Nuevo Hábito'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hábito</label>
            <input
              type="text"
              value={formData.habit}
              onChange={(e) => setFormData({ ...formData, habit: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Hacer ejercicio 30 minutos"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Habit['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="health">Salud</option>
                <option value="language">Idioma</option>
                <option value="productivity">Productividad</option>
                <option value="learning">Aprendizaje</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Habit['frequency'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de métrica</label>
              <select
                value={formData.metric_type}
                onChange={(e) => setFormData({ ...formData, metric_type: e.target.value as Habit['metric_type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="boolean">Sí/No</option>
                <option value="minutes">Minutos</option>
                <option value="repetitions">Repeticiones</option>
                <option value="count">Contador</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger (Disparador)
            </label>
            <input
              type="text"
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="¿Qué te recuerda hacer este hábito?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acción</label>
            <input
              type="text"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="¿Qué acción específica realizarás?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recompensa</label>
            <input
              type="text"
              value={formData.reward}
              onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="¿Cómo te recompensarás?"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {editingHabit ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
