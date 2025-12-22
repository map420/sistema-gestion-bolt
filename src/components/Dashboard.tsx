import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  DollarSign,
  BookOpen,
  Users,
  Target,
  FolderKanban,
  TrendingUp,
  ArrowUp,
  ArrowDown,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vista general de tu sistema de gestión</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Finanzas"
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Ingresos mes:</span>
              <span className="text-sm font-semibold text-green-600">
                ${stats?.recentIncome.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-600">Gastos mes:</span>
              <span className="text-sm font-semibold text-red-600">
                ${stats?.recentExpenses.toFixed(2)}
              </span>
            </div>
          </div>
        </StatCard>

        <StatCard
          title="Aprendizaje"
          value={stats?.libraryItems || 0}
          subtitle="recursos"
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
        />

        <StatCard
          title="Networking"
          value={stats?.contacts || 0}
          subtitle="contactos"
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />

        <StatCard
          title="Objetivos"
          value={stats?.objectives || 0}
          subtitle="activos"
          icon={<Target className="w-6 h-6" />}
          color="red"
        />

        <StatCard
          title="Proyectos"
          value={stats?.activeProjects || 0}
          subtitle="en curso"
          icon={<FolderKanban className="w-6 h-6" />}
          color="orange"
        />

        <StatCard
          title="Tareas completadas"
          value={stats?.completedTasksToday || 0}
          subtitle="hoy"
          icon={<FolderKanban className="w-6 h-6" />}
          color="indigo"
        />
      </div>

      {/* Sección mejorada de Hábitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg shadow-sm border border-teal-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-teal-700">Hábitos Registrados</h3>
              <p className="text-xs text-teal-600 mt-1">Total de hábitos activos</p>
            </div>
            <div className="bg-teal-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-6">
            <div className="text-4xl font-bold text-teal-900">{stats?.activeHabits || 0}</div>
            <div className="flex items-center gap-2 mt-4">
              <div className="h-2 bg-teal-200 rounded-full flex-1"></div>
              <span className="text-xs font-medium text-teal-700">Activos</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg shadow-sm border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-emerald-700">Hábitos Cumplidos Hoy</h3>
              <p className="text-xs text-emerald-600 mt-1">Tasa de cumplimiento diario</p>
            </div>
            <div className="bg-emerald-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-end gap-4">
              <div>
                <div className="text-4xl font-bold text-emerald-900">
                  {stats?.completedHabitsToday || 0}
                </div>
                <div className="text-xs text-emerald-600 mt-1">de {stats?.activeHabits || 0}</div>
              </div>
              <div className="flex-1">
                <div className="text-right mb-2">
                  <span className="text-2xl font-bold text-emerald-700">
                    {stats?.habitCompletionRate || 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-emerald-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.habitCompletionRate || 0}%` }}
                  ></div>
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
