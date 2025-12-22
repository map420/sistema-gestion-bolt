import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Target, TrendingUp, AlertTriangle, CheckCircle, Trash2, Zap } from 'lucide-react';

interface Objective {
  id: string;
  objective: string;
  area: 'personal' | 'professional';
  period: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'on_track' | 'at_risk' | 'completed' | 'cancelled';
  description: string | null;
  created_at: string;
}

interface KeyResult {
  id: string;
  objective_id: string;
  key_result: string;
  metric: string;
  baseline: number;
  target: number;
  current_value: number;
  target_date: string | null;
  progress_percentage: number;
}

export default function Objectives() {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [keyResults, setKeyResults] = useState<Record<string, KeyResult[]>>({});
  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [showKRForm, setShowKRForm] = useState<string | null>(null);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);

    const { data: objectivesData } = await supabase
      .from('objectives')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setObjectives(objectivesData || []);

    if (objectivesData && objectivesData.length > 0) {
      const { data: krsData } = await supabase
        .from('key_results')
        .select('*')
        .eq('user_id', user.id)
        .in('objective_id', objectivesData.map((o) => o.id));

      const groupedKRs = (krsData || []).reduce((acc, kr) => {
        if (!acc[kr.objective_id]) {
          acc[kr.objective_id] = [];
        }
        acc[kr.objective_id].push(kr);
        return acc;
      }, {} as Record<string, KeyResult[]>);

      setKeyResults(groupedKRs);
    }

    setLoading(false);
  }

  async function deleteObjective(id: string) {
    await supabase.from('objectives').delete().eq('id', id);
    loadData();
  }

  async function deleteKeyResult(id: string) {
    await supabase.from('key_results').delete().eq('id', id);
    loadData();
  }

  async function updateKRProgress(kr: KeyResult, newValue: number) {
    const progress = Math.round(((newValue - kr.baseline) / (kr.target - kr.baseline)) * 100);
    await supabase
      .from('key_results')
      .update({ current_value: newValue, progress_percentage: Math.max(0, Math.min(100, progress)) })
      .eq('id', kr.id);
    loadData();
  }

  const stats = {
    total: objectives.length,
    personal: objectives.filter((o) => o.area === 'personal').length,
    professional: objectives.filter((o) => o.area === 'professional').length,
    onTrack: objectives.filter((o) => o.status === 'on_track').length,
    atRisk: objectives.filter((o) => o.status === 'at_risk').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Objetivos (OKR)</h1>
          <p className="text-gray-600 mt-1">Define y monitorea tus objetivos estratégicos</p>
        </div>
        <button
          onClick={() => {
            setEditingObjective(null);
            setShowObjectiveForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo objetivo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Personal</div>
          <div className="text-2xl font-bold text-blue-600">{stats.personal}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Profesional</div>
          <div className="text-2xl font-bold text-purple-600">{stats.professional}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">En camino</div>
          <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">En riesgo</div>
          <div className="text-2xl font-bold text-red-600">{stats.atRisk}</div>
        </div>
      </div>

      {/* At-Risk Objectives Alert */}
      {objectives.some((o) => o.status === 'at_risk') && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-sm border border-red-200">
          <div className="p-6 border-b border-red-200">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Objetivos en Riesgo</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {objectives
                .filter((o) => o.status === 'at_risk')
                .map((objective) => (
                  <div key={objective.id} className="p-3 bg-white border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{objective.objective}</div>
                        <div className="text-sm text-red-600 mt-1">Requiere ajustes en KRs</div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        {objective.priority}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : objectives.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            No hay objetivos. Crea tu primer objetivo estratégico.
          </div>
        ) : (
          objectives.map((objective) => {
            const krs = keyResults[objective.id] || [];
            const avgProgress =
              krs.length > 0
                ? Math.round(
                    krs.reduce((sum, kr) => sum + kr.progress_percentage, 0) / krs.length
                  )
                : 0;

            return (
              <div key={objective.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            objective.area === 'personal'
                              ? 'bg-blue-100'
                              : 'bg-purple-100'
                          }`}
                        >
                          <Target
                            className={`w-5 h-5 ${
                              objective.area === 'personal'
                                ? 'text-blue-600'
                                : 'text-purple-600'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900">{objective.objective}</h2>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500 capitalize">{objective.area}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{objective.period}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span
                              className={`text-sm font-medium capitalize ${
                                objective.priority === 'critical'
                                  ? 'text-red-600'
                                  : objective.priority === 'high'
                                  ? 'text-orange-600'
                                  : objective.priority === 'medium'
                                  ? 'text-blue-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {objective.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      {objective.description && (
                        <p className="text-gray-600 text-sm ml-14">{objective.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          objective.status === 'on_track'
                            ? 'bg-green-100 text-green-700'
                            : objective.status === 'at_risk'
                            ? 'bg-red-100 text-red-700'
                            : objective.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {objective.status === 'on_track' && <CheckCircle className="w-4 h-4" />}
                        {objective.status === 'at_risk' && <AlertTriangle className="w-4 h-4" />}
                        <span className="capitalize">{objective.status.replace('_', ' ')}</span>
                      </div>
                      <button
                        onClick={() => {
                          setEditingObjective(objective);
                          setShowObjectiveForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteObjective(objective.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="ml-14">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progreso general</span>
                      <span className="font-medium text-gray-900">{avgProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          avgProgress >= 75
                            ? 'bg-green-500'
                            : avgProgress >= 50
                            ? 'bg-blue-500'
                            : avgProgress >= 25
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${avgProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Resultados Clave ({krs.length})
                    </h3>
                    <button
                      onClick={() => setShowKRForm(objective.id)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Agregar KR
                    </button>
                  </div>

                  {krs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No hay resultados clave. Agrega el primero.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {krs.map((kr) => (
                        <div key={kr.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{kr.key_result}</h4>
                              <div className="text-sm text-gray-600">
                                Métrica: {kr.metric} • Línea base: {kr.baseline} • Meta: {kr.target}
                                {kr.target_date && ` • ${new Date(kr.target_date).toLocaleDateString('es-ES')}`}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteKeyResult(kr.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={kr.current_value}
                              onChange={(e) => updateKRProgress(kr, parseFloat(e.target.value))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Progreso</span>
                                <span className="font-medium text-gray-900">{kr.progress_percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${kr.progress_percentage}%` }}
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
            );
          })
        )}
      </div>

      {showObjectiveForm && (
        <ObjectiveForm
          editingObjective={editingObjective}
          onClose={() => {
            setShowObjectiveForm(false);
            setEditingObjective(null);
          }}
          onSuccess={() => {
            setShowObjectiveForm(false);
            setEditingObjective(null);
            loadData();
          }}
        />
      )}

      {showKRForm && (
        <KeyResultForm
          objectiveId={showKRForm}
          onClose={() => setShowKRForm(null)}
          onSuccess={() => {
            setShowKRForm(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function ObjectiveForm({
  editingObjective,
  onClose,
  onSuccess,
}: {
  editingObjective?: Objective | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    objective: editingObjective?.objective || '',
    area: (editingObjective?.area || 'personal') as 'personal' | 'professional',
    period: editingObjective?.period || '',
    priority: (editingObjective?.priority || 'medium') as 'low' | 'medium' | 'high' | 'critical',
    status: (editingObjective?.status || 'active') as Objective['status'],
    description: editingObjective?.description || '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const data = {
      user_id: user.id,
      objective: formData.objective,
      area: formData.area,
      period: formData.period,
      priority: formData.priority,
      status: formData.status,
      description: formData.description || null,
    };

    if (editingObjective) {
      await supabase
        .from('objectives')
        .update(data)
        .eq('id', editingObjective.id);
    } else {
      await supabase.from('objectives').insert([data]);
    }

    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingObjective ? 'Editar Objetivo' : 'Nuevo Objetivo'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
            <input
              type="text"
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Aumentar mi nivel de inglés a C1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value as 'personal' | 'professional' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="personal">Personal</option>
                <option value="professional">Profesional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Q1 2024, Anual 2024"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Objective['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Objective['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="active">Activo</option>
                <option value="on_track">En camino</option>
                <option value="at_risk">En riesgo</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
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
              {editingObjective ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function KeyResultForm({
  objectiveId,
  onClose,
  onSuccess,
}: {
  objectiveId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    key_result: '',
    metric: '',
    baseline: '0',
    target: '',
    current_value: '0',
    target_date: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const baseline = parseFloat(formData.baseline);
    const target = parseFloat(formData.target);
    const currentValue = parseFloat(formData.current_value);
    const progress = Math.round(((currentValue - baseline) / (target - baseline)) * 100);

    await supabase.from('key_results').insert([
      {
        user_id: user.id,
        objective_id: objectiveId,
        key_result: formData.key_result,
        metric: formData.metric,
        baseline,
        target,
        current_value: currentValue,
        target_date: formData.target_date || null,
        progress_percentage: Math.max(0, Math.min(100, progress)),
      },
    ]);

    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-xl w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Nuevo Resultado Clave</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resultado Clave</label>
            <input
              type="text"
              value={formData.key_result}
              onChange={(e) => setFormData({ ...formData, key_result: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Completar 50 horas de estudio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Métrica</label>
            <input
              type="text"
              value={formData.metric}
              onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: horas, puntos, unidades"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Línea base</label>
              <input
                type="number"
                step="0.01"
                value={formData.baseline}
                onChange={(e) => setFormData({ ...formData, baseline: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta</label>
              <input
                type="number"
                step="0.01"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor actual</label>
              <input
                type="number"
                step="0.01"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha meta</label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
