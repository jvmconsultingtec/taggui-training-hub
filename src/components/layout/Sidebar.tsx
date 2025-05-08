
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  BarChart, 
  VideoIcon, 
  UserCircle, 
  Settings, 
  Home, 
  Briefcase, 
  FileText,
  Menu, 
  X,
  ShieldCheck
} from "lucide-react";
import TagguiLogo from "./TagguiLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, isAdmin: authIsAdmin } = useAuth();
  
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Use the auth context's isAdmin value first
        if (authIsAdmin) {
          setIsAdmin(true);
          return;
        }
        
        // Fallback to direct check if needed
        if (user) {
          const { data, error } = await supabase.rpc('is_admin');
          
          if (error) throw error;
          
          console.log("Sidebar - Is user admin?", data);
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error("Erro ao verificar status de admin no Sidebar:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user, authIsAdmin]);
  
  // Force check if admin status changes
  useEffect(() => {
    setIsAdmin(authIsAdmin);
  }, [authIsAdmin]);

  console.log("Sidebar rendering - isAdmin:", isAdmin, "authIsAdmin:", authIsAdmin);
  
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
          isActive={isActive("/trainings") && !isActive("/admin")} 
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
          to="/collaborators" 
          icon={<UserCircle />} 
          label="Colaboradores" 
          isActive={isActive("/collaborators")} 
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
        
        {isAdmin && (
          <div className="mt-6 border-t pt-6 border-gray-200">
            <NavItem 
              to="/admin" 
              icon={<ShieldCheck className="text-blue-600" />} 
              label="Painel Admin" 
              isActive={isActive("/admin")} 
              isCollapsed={collapsed}
            />
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
