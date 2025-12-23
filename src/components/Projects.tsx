import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, FolderKanban, AlertCircle, Trash2, CheckSquare } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  area: 'personal' | 'professional';
  type: 'work' | 'personal' | 'learning' | 'other' | null;
  status: 'backlog' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string | null;
  deadline: string | null;
  owner: string | null;
  stakeholders: string[] | null;
  expected_impact: string | null;
  risks: string | null;
  notes: string | null;
  created_at: string;
}

interface Task {
  id: string;
  project_id: string | null;
  task: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimation: number | null;
  sprint: string | null;
  assigned_to: string | null;
  deadline: string | null;
  tags: string[] | null;
  blockers: string | null;
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'projects' | 'kanban'>('projects');

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);

    const [{ data: projectsData }, { data: tasksData }] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    setProjects(projectsData || []);
    setTasks(tasksData || []);
    setLoading(false);
  }

  async function deleteProject(id: string) {
    await supabase.from('projects').delete().eq('id', id);
    loadData();
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
    loadData();
  }

  async function updateTaskStatus(taskId: string, newStatus: Task['status']) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    loadData();
  }

  const filteredTasks = selectedProject
    ? tasks.filter((t) => t.project_id === selectedProject)
    : tasks;

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  const stats = {
    total: projects.length,
    backlog: projects.filter((p) => p.status === 'backlog').length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    blocked: projects.filter((p) => p.status === 'blocked').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-600 mt-1">Gestión transversal de proyectos y tareas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProjectForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Nuevo proyecto
          </button>
          {view === 'kanban' && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              Nueva tarea
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Backlog</div>
          <div className="text-2xl font-bold text-gray-600">{stats.backlog}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">En curso</div>
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Bloqueados</div>
          <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Completados</div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setView('projects')}
              className={`px-6 py-3 font-medium transition ${
                view === 'projects'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vista de Proyectos
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-6 py-3 font-medium transition ${
                view === 'kanban'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Board Kanban
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : view === 'projects' ? (
            projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay proyectos. Crea tu primer proyecto.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => {
                  const projectTasks = tasks.filter((t) => t.project_id === project.id);
                  const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
                  const progress = projectTasks.length > 0
                    ? Math.round((completedTasks / projectTasks.length) * 100)
                    : 0;

                  return (
                    <div
                      key={project.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                project.area === 'personal'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {project.area}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span
                              className={`px-2 py-1 rounded-full ${
                                project.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : project.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-700'
                                  : project.status === 'blocked'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {project.status.replace('_', ' ')}
                            </span>
                            <span
                              className={`font-medium ${
                                project.priority === 'critical'
                                  ? 'text-red-600'
                                  : project.priority === 'high'
                                  ? 'text-orange-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {project.priority}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {project.deadline && (
                        <div className="text-sm text-gray-600 mb-3">
                          Deadline: {new Date(project.deadline).toLocaleDateString('es-ES')}
                        </div>
                      )}

                      {projectTasks.length > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Tareas</span>
                            <span className="font-medium text-gray-900">
                              {completedTasks}/{projectTasks.length} completadas ({progress}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setSelectedProject(project.id);
                          setView('kanban');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver tareas →
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div>
              {projects.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por proyecto
                  </label>
                  <select
                    value={selectedProject || ''}
                    onChange={(e) => setSelectedProject(e.target.value || null)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Todas las tareas</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KanbanColumn
                  title="Por hacer"
                  tasks={todoTasks}
                  onDelete={deleteTask}
                  onStatusChange={updateTaskStatus}
                />
                <KanbanColumn
                  title="En progreso"
                  tasks={inProgressTasks}
                  onDelete={deleteTask}
                  onStatusChange={updateTaskStatus}
                />
                <KanbanColumn
                  title="Hecho"
                  tasks={doneTasks}
                  onDelete={deleteTask}
                  onStatusChange={updateTaskStatus}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          onSuccess={() => {
            setShowProjectForm(false);
            loadData();
          }}
        />
      )}

      {showTaskForm && (
        <TaskForm
          projects={projects}
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function KanbanColumn({
  title,
  tasks,
  onDelete,
  onStatusChange,
}: {
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}) {
  const statusMap: Record<string, Task['status']> = {
    'Por hacer': 'todo',
    'En progreso': 'in_progress',
    'Hecho': 'done',
  };

  const nextStatusMap: Record<Task['status'], Task['status'] | null> = {
    todo: 'in_progress',
    in_progress: 'done',
    done: null,
  };

  const prevStatusMap: Record<Task['status'], Task['status'] | null> = {
    todo: null,
    in_progress: 'todo',
    done: 'in_progress',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No hay tareas</div>
        ) : (
          tasks.map((task) => {
            const nextStatus = nextStatusMap[task.status];
            const prevStatus = prevStatusMap[task.status];

            return (
              <div key={task.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm flex-1">{task.task}</h4>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {task.priority && (
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        task.priority === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}

                  {task.deadline && (
                    <div className="text-xs text-gray-600">
                      {new Date(task.deadline).toLocaleDateString('es-ES')}
                    </div>
                  )}

                  {task.blockers && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Bloqueada</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {prevStatus && (
                      <button
                        onClick={() => onStatusChange(task.id, prevStatus)}
                        className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition"
                      >
                        ← Atrás
                      </button>
                    )}
                    {nextStatus && (
                      <button
                        onClick={() => onStatusChange(task.id, nextStatus)}
                        className="flex-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
                      >
                        Siguiente →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ProjectForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    area: 'personal' as 'personal' | 'professional',
    type: 'personal' as Project['type'],
    status: 'backlog' as Project['status'],
    priority: 'medium' as Project['priority'],
    start_date: '',
    deadline: '',
    owner: '',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    await supabase.from('projects').insert([
      {
        user_id: user.id,
        name: formData.name,
        area: formData.area,
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date || null,
        deadline: formData.deadline || null,
        owner: formData.owner || null,
        notes: formData.notes || null,
      },
    ]);

    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Nuevo Proyecto</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Project['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="personal">Personal</option>
                <option value="work">Trabajo</option>
                <option value="learning">Aprendizaje</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="backlog">Backlog</option>
                <option value="in_progress">En progreso</option>
                <option value="blocked">Bloqueado</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Project['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dueño</label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskForm({
  projects,
  onClose,
  onSuccess,
}: {
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    task: '',
    project_id: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    estimation: '',
    deadline: '',
    blockers: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    await supabase.from('tasks').insert([
      {
        user_id: user.id,
        task: formData.task,
        project_id: formData.project_id || null,
        status: formData.status,
        priority: formData.priority,
        estimation: formData.estimation ? parseInt(formData.estimation) : null,
        deadline: formData.deadline || null,
        blockers: formData.blockers || null,
      },
    ]);

    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-xl w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Tarea</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarea</label>
            <input
              type="text"
              value={formData.task}
              onChange={(e) => setFormData({ ...formData, task: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Sin proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="todo">Por hacer</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Hecho</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimación (horas)</label>
              <input
                type="number"
                value={formData.estimation}
                onChange={(e) => setFormData({ ...formData, estimation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bloqueadores</label>
            <textarea
              value={formData.blockers}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={2}
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
