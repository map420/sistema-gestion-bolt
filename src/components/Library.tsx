import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, BookOpen, Video, FileText, ExternalLink, Trash2, Filter, TrendingUp, CheckCircle2 } from 'lucide-react';

interface LibraryItem {
  id: string;
  title: string;
  type: 'article' | 'course' | 'book' | 'video' | 'note' | 'other';
  topic: string | null;
  source: string | null;
  link: string | null;
  tags: string[] | null;
  summary: string | null;
  insight: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  created_at: string;
}

const typeIcons = {
  article: FileText,
  course: BookOpen,
  book: BookOpen,
  video: Video,
  note: FileText,
  other: FileText,
};

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completado',
  archived: 'Archivado',
};

export default function Library() {
  const { user } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadItems();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [items, filterStatus, filterType]);

  async function loadItems() {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('library_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setItems(data || []);
    setLoading(false);
  }

  function applyFilters() {
    let filtered = items;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    setFilteredItems(filtered);
  }

  async function deleteItem(id: string) {
    await supabase.from('library_items').delete().eq('id', id);
    loadItems();
  }

  const stats = {
    total: items.length,
    pending: items.filter((i) => i.status === 'pending').length,
    inProgress: items.filter((i) => i.status === 'in_progress').length,
    completed: items.filter((i) => i.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Aprendizaje</h1>
          <p className="text-gray-600 mt-1">Gestiona tus recursos de aprendizaje</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo recurso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Pendientes</div>
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">En progreso</div>
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Completados</div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </div>
      </div>

      {/* Learning Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200">
          <div className="p-6 border-b border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Progreso de Aprendizaje</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tasa de Completión</span>
                  <span className="text-lg font-bold text-blue-600">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center p-2 bg-white rounded-lg border border-blue-200">
                  <div className="font-bold text-blue-600">{stats.completed}</div>
                  <div className="text-gray-600">Completados</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border border-blue-200">
                  <div className="font-bold text-orange-600">{stats.pending + stats.inProgress}</div>
                  <div className="text-gray-600">Por hacer</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Type Distribution */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200">
          <div className="p-6 border-b border-purple-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Distribución de Recursos</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {(() => {
                const typeDistribution = items.reduce((acc, item) => {
                  acc[item.type] = (acc[item.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                return Object.entries(typeDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 capitalize font-medium">{type}</span>
                        <span className="text-gray-900 font-bold">{count}</span>
                      </div>
                      <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${(count / Math.max(...Object.values(typeDistribution))) * 100}%` }}
                        />
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
              <option value="archived">Archivado</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Todos los tipos</option>
              <option value="article">Artículo</option>
              <option value="course">Curso</option>
              <option value="book">Libro</option>
              <option value="video">Video</option>
              <option value="note">Nota</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay recursos que coincidan con los filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const Icon = typeIcons[item.type];
                return (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="capitalize">{item.type}</span>
                            {item.topic && (
                              <>
                                <span>•</span>
                                <span>{item.topic}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowForm(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {item.summary && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.summary}</p>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : item.status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[item.status]}
                      </span>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          Abrir
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <LibraryItemForm
          editingItem={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingItem(null);
            loadItems();
          }}
        />
      )}
    </div>
  );
}

function LibraryItemForm({ editingItem, onClose, onSuccess }: { editingItem?: LibraryItem | null; onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: editingItem?.title || '',
    type: (editingItem?.type || 'article') as LibraryItem['type'],
    topic: editingItem?.topic || '',
    source: editingItem?.source || '',
    link: editingItem?.link || '',
    tags: editingItem?.tags?.join(', ') || '',
    summary: editingItem?.summary || '',
    insight: editingItem?.insight || '',
    status: (editingItem?.status || 'pending') as LibraryItem['status'],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    if (editingItem) {
      // Actualizar recurso
      await supabase
        .from('library_items')
        .update({
          title: formData.title,
          type: formData.type,
          topic: formData.topic || null,
          source: formData.source || null,
          link: formData.link || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          summary: formData.summary || null,
          insight: formData.insight || null,
          status: formData.status,
        })
        .eq('id', editingItem.id);
    } else {
      // Crear recurso
      await supabase.from('library_items').insert([
        {
          user_id: user.id,
          title: formData.title,
          type: formData.type,
          topic: formData.topic || null,
          source: formData.source || null,
          link: formData.link || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          summary: formData.summary || null,
          insight: formData.insight || null,
          status: formData.status,
        },
      ]);
    }

    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingItem ? 'Editar Recurso' : 'Nuevo Recurso'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as LibraryItem['type'] })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="article">Artículo</option>
                <option value="course">Curso</option>
                <option value="book">Libro</option>
                <option value="video">Video</option>
                <option value="note">Nota</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as LibraryItem['status'] })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enlace</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (separados por comas)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="javascript, react, frontend"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumen</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insight</label>
            <textarea
              value={formData.insight}
              onChange={(e) => setFormData({ ...formData, insight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={2}
              placeholder="¿Qué aprendiste de esto?"
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
              {editingItem ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
