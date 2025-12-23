import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, TrendingUp, TrendingDown, Target, Trash2 } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  method: string | null;
  note: string | null;
}

interface FinancialGoal {
  id: string;
  objective: string;
  target_amount: number;
  target_date: string | null;
  status: string;
  progress_percentage: number;
  notes: string | null;
}

export default function Finances() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'transactions' | 'goals'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user, activeTab]);

  async function loadData() {
    if (!user) return;
    setLoading(true);

    if (activeTab === 'transactions') {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      setTransactions(data || []);
    } else {
      const { data } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setGoals(data || []);
    }

    setLoading(false);
  }

  async function deleteTransaction(id: string) {
    await supabase.from('transactions').delete().eq('id', id);
    loadData();
  }

  async function deleteGoal(id: string) {
    await supabase.from('financial_goals').delete().eq('id', id);
    loadData();
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finanzas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus transacciones y metas financieras</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'transactions' ? 'Nueva transacción' : 'Nueva meta'}
        </button>
      </div>

      {activeTab === 'transactions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Ingresos</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${totalIncome.toFixed(2)}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Gastos</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Balance</span>
            </div>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'transactions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Transacciones
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'goals'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Metas Financieras
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : activeTab === 'transactions' ? (
            transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay transacciones. Crea tu primera transacción.
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{transaction.category}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('es-ES')}
                          {transaction.note && ` • ${transaction.note}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-lg font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                      </div>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay metas financieras. Crea tu primera meta.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{goal.objective}</h3>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Meta:</span>
                      <span className="font-medium text-gray-900">
                        ${Number(goal.target_amount).toFixed(2)}
                      </span>
                    </div>
                    {goal.target_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="text-gray-900">
                          {new Date(goal.target_date).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progreso</span>
                        <span className="font-medium text-gray-900">{goal.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${goal.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <FormModal
          type={activeTab}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function FormModal({
  type,
  onClose,
  onSuccess,
}: {
  type: 'transactions' | 'goals';
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    amount: '',
    category: '',
    method: '',
    note: '',
    objective: '',
    target_amount: '',
    target_date: '',
    progress_percentage: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (type === 'transactions') {
      await supabase.from('transactions').insert([
        {
          user_id: user.id,
          date: formData.date,
          amount: parseFloat(formData.amount),
          type: formData.type,
          category: formData.category,
          method: formData.method || null,
          note: formData.note || null,
        },
      ]);
    } else {
      await supabase.from('financial_goals').insert([
        {
          user_id: user.id,
          objective: formData.objective,
          target_amount: parseFloat(formData.target_amount),
          target_date: formData.target_date || null,
          progress_percentage: parseInt(formData.progress_percentage) || 0,
          notes: formData.note || null,
        },
      ]);
    }

    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {type === 'transactions' ? 'Nueva Transacción' : 'Nueva Meta Financiera'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'transactions' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                <input
                  type="text"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Efectivo, Tarjeta, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                <input
                  type="text"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto objetivo</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha objetivo</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progreso actual (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress_percentage}
                  onChange={(e) => setFormData({ ...formData, progress_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>
            </>
          )}

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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
