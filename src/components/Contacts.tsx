import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Users, Mail, Phone, Briefcase, Calendar, Trash2, AlertCircle, Clock, TrendingUp } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  last_contact: string | null;
  next_contact: string | null;
  notes: string | null;
  industry: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export default function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, [user]);

  async function loadContacts() {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('professional_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    setContacts(data || []);

    const today = new Date().toISOString().split('T')[0];
    const upcoming = (data || []).filter(
      (c) => c.next_contact && c.next_contact >= today
    );
    setUpcomingFollowUps(upcoming.sort((a, b) =>
      (a.next_contact || '').localeCompare(b.next_contact || '')
    ));

    setLoading(false);
  }

  async function deleteContact(id: string) {
    await supabase.from('professional_contacts').delete().eq('id', id);
    loadContacts();
  }

  const industries = Array.from(
    new Set(contacts.map((c) => c.industry).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Networking Profesional</h1>
          <p className="text-gray-600 mt-1">Gestiona tus contactos y seguimientos</p>
        </div>
        <button
          onClick={() => {
            setEditingContact(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo contacto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total contactos</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{contacts.length}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Próximos seguimientos</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{upcomingFollowUps.length}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Industrias</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{industries.length}</div>
        </div>
      </div>

      {upcomingFollowUps.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Próximos seguimientos
          </h3>
          <div className="space-y-2">
            {upcomingFollowUps.slice(0, 5).map((contact) => (
              <div key={contact.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-900 font-medium">{contact.name}</span>
                <span className="text-gray-600">
                  {contact.next_contact &&
                    new Date(contact.next_contact).toLocaleDateString('es-ES')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay contactos. Agrega tu primer contacto profesional.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact) => {
                const isUpcoming =
                  contact.next_contact &&
                  contact.next_contact >= new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={contact.id}
                    className={`p-4 border rounded-lg transition ${
                      isUpcoming
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        {contact.company && (
                          <p className="text-sm text-gray-600">{contact.company}</p>
                        )}
                        {contact.role && (
                          <p className="text-sm text-gray-500">{contact.role}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingContact(contact);
                            setShowForm(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          ✎
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteContact(contact.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.industry && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{contact.industry}</span>
                        </div>
                      )}
                      {contact.next_contact && (
                        <div
                          className={`flex items-center gap-2 ${
                            isUpcoming ? 'text-orange-700 font-medium' : 'text-gray-600'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          <span>
                            Próximo contacto:{' '}
                            {new Date(contact.next_contact).toLocaleDateString('es-ES')}
                          </span>
                        </div>
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
        <ContactForm
          editingContact={editingContact}
          onClose={() => {
            setShowForm(false);
            setEditingContact(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingContact(null);
            loadContacts();
          }}
        />
      )}
    </div>
  );
}

function ContactForm({
  editingContact,
  onClose,
  onSuccess,
}: {
  editingContact?: Contact | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: editingContact?.name || '',
    company: editingContact?.company || '',
    role: editingContact?.role || '',
    email: editingContact?.email || '',
    phone: editingContact?.phone || '',
    industry: editingContact?.industry || '',
    last_contact: editingContact?.last_contact || '',
    next_contact: editingContact?.next_contact || '',
    notes: editingContact?.notes || '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const data = {
      user_id: user.id,
      name: formData.name,
      company: formData.company || null,
      role: formData.role || null,
      email: formData.email || null,
      phone: formData.phone || null,
      industry: formData.industry || null,
      last_contact: formData.last_contact || null,
      next_contact: formData.next_contact || null,
      notes: formData.notes || null,
    };

    if (editingContact) {
      await supabase
        .from('professional_contacts')
        .update(data)
        .eq('id', editingContact.id);
    } else {
      await supabase.from('professional_contacts').insert([data]);
    }

    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
        </h2>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industria</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Último contacto
              </label>
              <input
                type="date"
                value={formData.last_contact}
                onChange={(e) => setFormData({ ...formData, last_contact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próximo contacto
              </label>
              <input
                type="date"
                value={formData.next_contact}
                onChange={(e) => setFormData({ ...formData, next_contact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
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
              {editingContact ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
