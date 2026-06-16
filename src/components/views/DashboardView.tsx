import React from 'react';
import { 
  Users, 
  Briefcase, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  ChevronRight,
  Search
} from 'lucide-react';
import { Client, ProjectData } from '../../types';
import { motion } from 'motion/react';

interface DashboardViewProps {
  activeProjects: ProjectData[];
  totalClients: number;
  onCreateProject: () => void;
  onOpenProject: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  activeProjects, 
  totalClients,
  onCreateProject,
  onOpenProject
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-text-primary font-display">Dashboard</h1>
          <p className="text-text-secondary text-lg">Visão geral do seu gabinete.</p>
        </div>
        <button 
          onClick={onCreateProject}
          className="flex items-center gap-2 bg-accent text-canvas px-6 py-3 rounded-md hover:opacity-90 transition-all font-medium"
        >
          <Plus className="w-5 h-5" /> Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-border-main shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">Ativos</span>
          </div>
          <div>
            <p className="text-4xl font-light tracking-tight text-text-primary">{activeProjects.filter(p => p.status === 'active').length}</p>
            <p className="text-sm font-medium text-text-secondary mt-1">Projetos em Curso</p>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border-main shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-300">Total</span>
          </div>
          <div>
            <p className="text-4xl font-light tracking-tight text-text-primary">{totalClients}</p>
            <p className="text-sm font-medium text-text-secondary mt-1">Clientes Registrados</p>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border-main shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div>
            <p className="text-lg font-medium tracking-tight text-text-primary">Atividade Recente</p>
            <p className="text-xs text-text-secondary/70 mt-1 uppercase tracking-widest font-bold">Ultimos 7 dias</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">Projetos Ativos</h2>
          <button className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Ver todos</button>
        </div>
        
        {activeProjects.filter(p => p.status === 'active').length === 0 ? (
          <div className="bg-surface border border-dashed border-border-main rounded-2xl p-12 text-center space-y-3 transition-colors">
            <div className="bg-surface-secondary w-12 h-12 rounded-full flex items-center justify-center mx-auto transition-colors">
              <Briefcase className="w-6 h-6 text-text-secondary" />
            </div>
            <p className="text-text-secondary font-medium">Nenhum projeto ativo no momento.</p>
            <button onClick={onCreateProject} className="text-text-primary font-bold text-sm underline underline-offset-4">Criar o primeiro projeto</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.filter(p => p.status === 'active').slice(0, 4).map((project) => (
              <ProjectCard key={project.id} project={project} onClick={() => onOpenProject(project.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onClick }: { project: ProjectData, onClick: () => void }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="bg-surface p-6 rounded-2xl border border-border-main hover:border-accent transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <h3 className="font-bold text-lg leading-tight group-hover:text-text-primary text-text-primary">{project.name}</h3>
        <p className="text-sm text-text-secondary font-medium flex items-center gap-1.5 ring-offset-bg">
          <Users className="w-3.5 h-3.5" /> {project.clientName}
        </p>
      </div>
      <div className="bg-surface-secondary p-2 rounded-lg group-hover:bg-accent transition-colors">
        <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-canvas" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-border-main/20">
      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{project.location}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary bg-surface-secondary px-2 py-0.5 rounded">
        {project.base.interventionType}
      </span>
    </div>
  </motion.div>
);
