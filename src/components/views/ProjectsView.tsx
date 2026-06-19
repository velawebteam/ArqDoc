import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
  User,
  UserPlus,
  X,
  Mail,
  Phone
} from 'lucide-react';
import { ProjectData, Client } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectsViewProps {
  projects: ProjectData[];
  clients: Client[];
  onAddProject: (client?: Client) => void;
  onAddClient: (name: string, details: Partial<Client>) => Client;
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectItem = ({ project, onOpen, onDelete }: { project: ProjectData, onOpen: (id: string) => void, onDelete: (id: string) => void }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -4 }}
      onClick={() => !isConfirming && onOpen(project.id)}
      className="bg-surface p-6 rounded-3xl border border-border-main hover:border-accent transition-all cursor-pointer group shadow-sm flex flex-col h-full relative"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {project.status === 'active' ? (
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${project.status === 'active' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {project.status === 'active' ? 'Em Curso' : 'Finalizado'}
            </span>
          </div>
          <h3 className="font-bold text-xl leading-tight group-hover:text-text-primary text-text-primary">{project.name}</h3>
        </div>

        <div className="flex items-center gap-2 relative z-[100]">
          {isConfirming ? (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 bg-red-50 p-1 rounded-full border border-red-100"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirming(false);
                }}
                className="px-3 py-1 bg-white text-gray-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-gray-100 hover:text-gray-600 transition-colors"
              >
                X
              </button>
            </motion.div>
          ) : (
            <button 
               type="button"
               title="Eliminar projeto"
               onMouseDown={(e) => e.stopPropagation()}
               onClick={(e) => {
                 e.stopPropagation();
                 setIsConfirming(true);
               }}
               className="p-3 -m-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-2 p-3 bg-surface-secondary rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-[10px] font-bold border border-border-main">
            {(project.clientName || 'P').charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Cliente</span>
            <span className="text-xs font-semibold text-text-primary">{project.clientName || '---'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-secondary">
          <span>{project.location || 'Portugal'}</span>
          <span>{new Date(project.updatedAt).toLocaleDateString('pt-PT')}</span>
        </div>
      </div>
    </motion.div>
  );
};

export const ProjectsView: React.FC<ProjectsViewProps> = ({ 
  projects, 
  clients,
  onAddProject, 
  onAddClient,
  onOpenProject,
  onDeleteProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'finished'>('all');
  const [isSelectingClient, setIsSelectingClient] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', nif: '', address: '' });

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesFilter = filter === 'all' || (filter === 'active' && p.status === 'active') || (filter === 'finished' && p.status !== 'active');
    return matchesSearch && matchesFilter;
  });

  const filteredClients = clients.filter(c => 
    (c.name?.toLowerCase().includes(clientSearch.toLowerCase()) || false) || 
    (c.email?.toLowerCase().includes(clientSearch.toLowerCase()) || false)
  );

  const activeCount = projects.filter(p => p.status === 'active').length;
  const finishedCount = projects.filter(p => p.status !== 'active').length;

  const handleStartProject = (client?: Client) => {
    onAddProject(client);
    setIsSelectingClient(false);
    setIsCreatingClient(false);
  };

  const handleCreateAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    const client = onAddClient(newClient.name, newClient);
    handleStartProject(client);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-text-primary font-display">Projetos</h1>
          <p className="text-text-secondary text-lg">Central de documentação e acompanhamento.</p>
        </div>
        <button 
          onClick={() => setIsSelectingClient(true)}
          className="flex items-center gap-2 bg-accent text-canvas px-6 py-3 rounded-md hover:opacity-90 transition-all font-medium"
        >
          <Plus className="w-5 h-5" /> Novo Projeto
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input 
            type="text"
            placeholder="Pesquisar por projeto ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface border border-border-main rounded-2xl focus:outline-none focus:ring-1 focus:ring-accent transition-all shadow-sm text-text-primary"
          />
        </div>
        <div className="flex bg-surface p-1 rounded-2xl border border-border-main shadow-sm transition-colors">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-accent text-canvas' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Todos ({projects.length})
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'active' ? 'bg-accent text-canvas' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Ativos ({activeCount})
          </button>
          <button 
            onClick={() => setFilter('finished')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'finished' ? 'bg-accent text-canvas' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Terminados ({finishedCount})
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-[var(--surface-bg)] border border-dashed border-[var(--border-color)] rounded-3xl p-20 text-center space-y-4">
          <div className="bg-surface-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-border-main">
            <Briefcase className="w-8 h-8 text-text-secondary" />
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 font-medium text-lg">Nenhum projeto encontrado nesta categoria.</p>
            <p className="text-sm text-gray-400">Inicie um novo projeto para começar a gerar documentos.</p>
          </div>
          <button 
            onClick={() => setIsSelectingClient(true)}
            className="flex items-center justify-center gap-2 mx-auto bg-accent text-canvas px-8 py-3 rounded-xl hover:opacity-90 transition-all shadow-xl shadow-black/10 font-bold uppercase tracking-widest text-[10px]"
          >
            Criar Novo Projeto
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <ProjectItem 
                key={project.id} 
                project={project} 
                onOpen={onOpenProject} 
                onDelete={onDeleteProject} 
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Client Selection Modal */}
      <AnimatePresence>
        {isSelectingClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectingClient(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--canvas-bg)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-color)]">Associar Cliente</h2>
                  <p className="text-sm text-gray-500">Selecione um cliente existente ou crie um novo para este projeto.</p>
                </div>
                <button onClick={() => setIsSelectingClient(false)} className="text-gray-400 hover:text-[var(--text-color)]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {!isCreatingClient ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input 
                        type="text" 
                        placeholder="Procurar cliente..."
                        value={clientSearch}
                        onChange={e => setClientSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface border border-border-main rounded-xl focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Clientes Recentes</span>
                        <button 
                          onClick={() => setIsCreatingClient(true)}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Novo Cliente
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {filteredClients.map(client => (
                          <button
                            key={client.id}
                            onClick={() => handleStartProject(client)}
                            className="flex items-center justify-between p-4 bg-surface border border-border-main rounded-2xl hover:border-accent transition-all group text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-surface border border-border-main flex items-center justify-center text-xs font-bold text-text-secondary group-hover:bg-accent group-hover:text-canvas group-hover:border-accent transition-all">
                                {(client.name || 'C').charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-sm text-text-primary">{client.name}</span>
                                {client.email && <span className="text-xs text-text-secondary">{client.email}</span>}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreateAndStart} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nome do Cliente</label>
                        <input 
                          type="text" 
                          required
                          value={newClient.name}
                          onChange={e => setNewClient({...newClient, name: e.target.value})}
                          className="w-full px-4 py-3 bg-[var(--surface-bg)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] dark:focus:ring-white transition-all text-[var(--text-color)]"
                          placeholder="Ex: João Silva"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</label>
                          <input 
                            type="email" 
                            value={newClient.email}
                            onChange={e => setNewClient({...newClient, email: e.target.value})}
                            className="w-full px-4 py-3 bg-[var(--surface-bg)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] dark:focus:ring-white transition-all text-[var(--text-color)]"
                            placeholder="joao@exemplo.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Telefone</label>
                          <input 
                            type="tel" 
                            value={newClient.phone}
                            onChange={e => setNewClient({...newClient, phone: e.target.value})}
                            className="w-full px-4 py-3 bg-[var(--surface-bg)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] dark:focus:ring-white transition-all text-[var(--text-color)]"
                            placeholder="+351 ..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsCreatingClient(false)}
                        className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        Voltar
                      </button>
                      <button 
                        type="submit"
                        className="flex-3 bg-accent text-canvas px-6 py-4 rounded-xl hover:opacity-90 transition-all shadow-xl shadow-black/10 font-bold uppercase tracking-widest text-[10px]"
                      >
                        Criar Cliente e Iniciar Projeto
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
