import React from 'react';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { NavigationView } from '../types';

interface SidebarProps {
  currentView: NavigationView;
  onNavigate: (view: NavigationView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', id: 'dashboard' as NavigationView },
    { icon: Users, label: 'Clientes', id: 'clients' as NavigationView },
    { icon: Briefcase, label: 'Projetos', id: 'projects' as NavigationView },
    { icon: Settings, label: 'Configurações', id: 'settings' as NavigationView },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border-main flex flex-col h-screen sticky top-0 transition-colors">
      <div className="p-6 border-b border-border-main flex items-center gap-3">
        <div className="w-10 h-10 bg-accent text-canvas flex items-center justify-center rounded-sm font-bold tracking-tighter transition-all">
          AD
        </div>
        <div className="flex flex-col">
          <span className="font-semibold tracking-tight text-lg leading-none text-text-primary">ArqDoc</span>
          <span className="text-[10px] text-text-secondary uppercase tracking-widest mt-1 font-bold">Studio Platform</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
              currentView === item.id 
                ? 'bg-accent text-canvas shadow-lg shadow-accent/10' 
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-colors ${currentView === item.id ? (item.id === 'dashboard' ? 'text-blue-400' : 'text-canvas') : 'text-text-secondary group-hover:text-text-primary'}`} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border-main">
        <div className="bg-surface-secondary rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Versão Pro</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <p className="text-[11px] font-medium text-text-primary">Gabinete Ativo</p>
        </div>
      </div>
    </aside>
  );
};
