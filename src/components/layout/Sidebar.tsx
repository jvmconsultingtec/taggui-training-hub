
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  BarChart, 
  VideoIcon, 
  UserCircle, 
  Settings, 
  Home, 
  Briefcase, 
  FileText,
  Menu, 
  X 
} from "lucide-react";
import TagguiLogo from "./TagguiLogo";

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
};

const NavItem = ({ to, icon, label, isActive, isCollapsed }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? "bg-taggui-primary-light text-taggui-primary font-medium" 
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <div className="text-lg">{icon}</div>
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  return (
    <div 
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && <TagguiLogo />}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-md hover:bg-gray-100"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 py-4 px-2 space-y-1">
        <NavItem 
          to="/dashboard" 
          icon={<Home />} 
          label="Dashboard" 
          isActive={isActive("/dashboard")} 
          isCollapsed={collapsed}
        />
        <NavItem 
          to="/trainings" 
          icon={<VideoIcon />} 
          label="Treinamentos" 
          isActive={isActive("/trainings")} 
          isCollapsed={collapsed}
        />
        <NavItem 
          to="/progress" 
          icon={<BarChart />} 
          label="Progresso" 
          isActive={isActive("/progress")} 
          isCollapsed={collapsed}
        />
        <NavItem 
          to="/users" 
          icon={<UserCircle />} 
          label="Colaboradores" 
          isActive={isActive("/users")} 
          isCollapsed={collapsed}
        />
        <NavItem 
          to="/reports" 
          icon={<FileText />} 
          label="Relatórios" 
          isActive={isActive("/reports")} 
          isCollapsed={collapsed}
        />
        <NavItem 
          to="/company" 
          icon={<Briefcase />} 
          label="Empresa" 
          isActive={isActive("/company")} 
          isCollapsed={collapsed}
        />
        <NavItem 
          to="/settings" 
          icon={<Settings />} 
          label="Configurações" 
          isActive={isActive("/settings")} 
          isCollapsed={collapsed}
        />
      </nav>
    </div>
  );
};

export default Sidebar;
