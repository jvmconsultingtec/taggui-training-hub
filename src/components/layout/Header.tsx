
import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Desconectado com sucesso",
        description: "Você foi desconectado do sistema"
      });
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Obter as iniciais do nome do usuário
  const getUserInitials = () => {
    if (!user || !user.user_metadata?.name) return "U";
    
    const nameParts = user.user_metadata.name.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
          <span className="font-medium">{getUserInitials()}</span>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
          <button 
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setIsOpen(false);
              navigate("/profile");
            }}
          >
            Perfil
          </button>
          <button 
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-taggui-primary focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
