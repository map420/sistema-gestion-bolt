import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  DollarSign,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Zap,
  Flame,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface Stats {
  transactions: number;
  recentIncome: number;
  recentExpenses: number;
  libraryItems: number;
  contacts: number;
  objectives: number;
  activeProjects: number;
  activeHabits: number;
  completedTasksToday: number;
  completedHabitsToday: number;
  habitCompletionRate: number;
  balance: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  async function loadStats() {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

      const [
        { count: transactionsCount },
        { data: incomeData },
        { data: expenseData },
        { count: libraryCount },
        { count: contactsCount },
        { count: objectivesCount },
        { count: projectsCount },
        { count: habitsCount },
        { count: tasksCount },
        { data: habitLogsData },
      ] = await Promise.all([
        supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'income')
          .gte('date', firstDayOfMonth),
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'expense')
          .gte('date', firstDayOfMonth),
        supabase
          .from('library_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('professional_contacts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('objectives')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['active', 'on_track', 'at_risk']),
        supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['in_progress', 'backlog']),
        supabase
          .from('habits')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('active', true),
        supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'done')
          .gte('created_at', today),
        supabase
          .from('habit_logs')
          .select('completed')
          .eq('user_id', user.id)
          .eq('log_date', today),
      ]);

      const totalIncome = incomeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpenses = expenseData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const completedHabitsCount = habitLogsData?.filter((log) => log.completed).length || 0;
      const habitCompletionRate =
        habitsCount && habitsCount > 0 ? Math.round((completedHabitsCount / habitsCount) * 100) : 0;
      const balance = totalIncome - totalExpenses;

      setStats({
        transactions: transactionsCount || 0,
        recentIncome: totalIncome,
        recentExpenses: totalExpenses,
        libraryItems: libraryCount || 0,
        contacts: contactsCount || 0,
        objectives: objectivesCount || 0,
        activeProjects: projectsCount || 0,
        activeHabits: habitsCount || 0,
        completedTasksToday: tasksCount || 0,
        completedHabitsToday: completedHabitsCount,
        habitCompletionRate,
        balance,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vista general de tu sistema de gestión</p>
      </div>

      {/* Primary Metrics - Finanzas (Full Width) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Finanzas</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance */}
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Balance mes</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${stats?.balance! >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${stats?.balance?.toFixed(2)}
                </span>
              </div>
            </div>
            {/* Income */}
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Ingresos mes</span>
              <div className="flex items-baseline gap-2">
                <ArrowUp className="w-4 h-4 text-emerald-600" />
                <span className="text-3xl font-bold text-gray-900">${stats?.recentIncome.toFixed(2)}</span>
              </div>
            </div>
            {/* Expenses */}
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Gastos mes</span>
              <div className="flex items-baseline gap-2">
                <ArrowDown className="w-4 h-4 text-red-600" />
                <span className="text-3xl font-bold text-gray-900">${stats?.recentExpenses.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics - Productividad (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hábitos y Rutinas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Hábitos & Rutinas</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hábitos activos</span>
                <span className="text-2xl font-bold text-teal-600">{stats?.activeHabits}</span>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Cumplimiento hoy</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.habitCompletionRate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.habitCompletionRate}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {stats?.completedHabitsToday} de {stats?.activeHabits} completados
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Objetivos Activos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Objetivos Activos</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total activos</span>
                <span className="text-2xl font-bold text-blue-600">{stats?.objectives}</span>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Proyectos en curso: <span className="font-bold text-orange-600">{stats?.activeProjects}</span></div>
                <div className="text-sm text-gray-600">Tareas completadas hoy: <span className="font-bold text-indigo-600">{stats?.completedTasksToday}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Momentum Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending Velocity */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-sm border border-red-200 overflow-hidden">
          <div className="p-6 border-b border-red-200">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Velocidad de Gasto</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Este mes</span>
                <span className="text-2xl font-bold text-red-600">${stats?.recentExpenses?.toFixed(2) || '0'}</span>
              </div>
              <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (stats?.recentExpenses || 0) / 100)}%` }}></div>
              </div>
              <div className="text-xs text-gray-500">Presupuesto recomendado: considera tu capacidad</div>
            </div>
          </div>
        </div>

        {/* Overall Momentum */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 overflow-hidden">
          <div className="p-6 border-b border-green-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Flame className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Momentum General</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Score de Actividad</span>
                <span className="text-2xl font-bold text-green-600">{stats?.habitCompletionRate || 0}%</span>
              </div>
              <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${stats?.habitCompletionRate || 0}%` }}></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                <div className="text-center">
                  <div className="font-bold text-green-600">{stats?.completedHabitsToday}</div>
                  <div className="text-gray-600">Hoy</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">{stats?.activeHabits}</div>
                  <div className="text-gray-600">Activos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">{stats?.completedTasksToday}</div>
                  <div className="text-gray-600">Tareas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value?: number;
  subtitle?: string;
  icon: ReactNode;
  color: string;
  children?: ReactNode;
}

function StatCard({ title, value, subtitle, icon, color, children }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      {children || (
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
        </div>
      )}
    </div>
  );
}
