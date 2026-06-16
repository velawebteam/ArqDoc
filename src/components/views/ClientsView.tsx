import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  Search,
  ChevronRight,
  MoreVertical,
  X,
  Edit2
} from 'lucide-react';
import { Client, ProjectBaseData } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (name: string, details: Partial<Client>, baseData?: ProjectBaseData) => void;
  onUpdateClient: (id: string, updates: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
  onOpenQuestionnaire: (client: Client) => void;
}

const DeleteConfirmButton = ({ onDelete }: { onDelete: () => void }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <div className="relative group">
      <AnimatePresence mode="wait">
        {isConfirming ? (
          <motion.div 
            key="confirming"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-100 whitespace-nowrap"
          >
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
                setIsConfirming(false);
              }}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md text-[9px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-sm"
            >
              Apagar permanentemente
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsConfirming(false);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.button 
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsConfirming(true);
            }}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Eliminar Cliente"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ClientsView: React.FC<ClientsViewProps> = ({ 
  clients, 
  onAddClient, 
  onUpdateClient,
  onDeleteClient,
  onOpenQuestionnaire
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', nif: '', address: '' });

  const filteredClients = clients.filter(c => 
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) || 
    (c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    
    if (editingClient) {
      onUpdateClient(editingClient.id, newClient);
      setEditingClient(null);
    } else {
      onAddClient(newClient.name, newClient);
    }
    
    setNewClient({ name: '', email: '', phone: '', nif: '', address: '' });
    setIsAdding(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      nif: client.nif || '',
      address: client.address || ''
    });
    setIsAdding(true);
  };

  const handleClose = () => {
    setIsAdding(false);
    setEditingClient(null);
    setNewClient({ name: '', email: '', phone: '', nif: '', address: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-text-primary font-display">Clientes</h1>
          <p className="text-text-secondary text-lg">Gerencie a base de contactos e perfis programáticos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-accent text-canvas px-6 py-3 rounded-md hover:opacity-90 transition-all font-medium"
        >
          <Plus className="w-5 h-5" /> Adicionar Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input 
          type="text"
          placeholder="Pesquisar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-surface border border-border-main rounded-2xl focus:outline-none focus:ring-1 focus:ring-accent transition-all shadow-sm text-text-primary"
        />
      </div>

      <div className="bg-surface border border-border-main rounded-2xl shadow-sm overflow-hidden text-left transition-colors">
        <table className="w-full">
          <thead className="bg-surface-secondary border-b border-border-main transition-colors">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Cliente</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Contactos</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Registro</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Dados Base</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main/50 transition-colors">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary font-medium">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-surface-secondary transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-primary">{client.name}</div>
                    <div className="text-xs text-text-secondary/70 font-bold uppercase tracking-tighter mt-0.5">NIF: {client.nif || '---'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {client.email && (
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Mail className="w-3 h-3 text-text-secondary/60" /> {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Phone className="w-3 h-3 text-text-secondary/60" /> {client.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-text-secondary">{new Date(client.createdAt).toLocaleDateString('pt-PT')}</span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <span 
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        client.baseData 
                          ? 'text-green-600' 
                          : 'text-amber-600'
                      }`}
                    >
                      {client.baseData ? 'Preenchido' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => handleEdit(client)}
                        className="p-2 text-text-secondary/50 hover:text-blue-500 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <DeleteConfirmButton onDelete={() => onDeleteClient(client.id)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 transition-all">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-border-main"
            >
              <div className="p-8 border-b border-border-main flex justify-between items-center transition-colors">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
                    {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {editingClient ? 'Atualize os dados de identificação do cliente.' : 'Insira os dados de identificação para iniciar.'}
                  </p>
                </div>
                <button onClick={handleClose} className="text-text-secondary hover:text-text-primary transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Nome Completo</label>
                       <input 
                         required
                         type="text" 
                         value={newClient.name}
                         onChange={e => setNewClient({...newClient, name: e.target.value})}
                         className="w-full px-4 py-3 bg-canvas border border-transparent rounded-xl focus:bg-surface focus:border-accent transition-all text-text-primary"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">NIF</label>
                       <input 
                         type="text" 
                         value={newClient.nif}
                         onChange={e => setNewClient({...newClient, nif: e.target.value})}
                         className="w-full px-4 py-3 bg-canvas border border-transparent rounded-xl focus:bg-surface focus:border-accent transition-all text-text-primary"
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Morada</label>
                     <input 
                       type="text" 
                       value={newClient.address}
                       onChange={e => setNewClient({...newClient, address: e.target.value})}
                       className="w-full px-4 py-3 bg-canvas border border-transparent rounded-xl focus:bg-surface focus:border-accent transition-all text-text-primary"
                     />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Telefone</label>
                       <input 
                         type="text" 
                         value={newClient.phone}
                         onChange={e => setNewClient({...newClient, phone: e.target.value})}
                         className="w-full px-4 py-3 bg-canvas border border-transparent rounded-xl focus:bg-surface focus:border-accent transition-all text-text-primary"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Email</label>
                       <input 
                         type="email" 
                         value={newClient.email}
                         onChange={e => setNewClient({...newClient, email: e.target.value})}
                         className="w-full px-4 py-3 bg-canvas border border-transparent rounded-xl focus:bg-surface focus:border-accent transition-all text-text-primary"
                       />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-4 bg-surface-secondary text-text-secondary rounded-xl font-bold uppercase tracking-widest text-[10px] hover:opacity-80 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-3 bg-accent text-canvas px-6 py-4 rounded-xl hover:opacity-90 transition-all font-bold uppercase tracking-widest text-[10px]"
                  >
                    {editingClient ? 'Guardar Alterações' : 'Criar e Continuar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
