
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TagguiLogo from "@/components/layout/TagguiLogo";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center">
          <TagguiLogo />
        </div>
        
        <h1 className="text-2xl font-bold text-center">TAGGUI Treinamentos</h1>
        <p className="text-center text-gray-600">
          Plataforma de gerenciamento de treinamentos corporativos
        </p>
        
        <div className="space-y-4 pt-4">
          <Button asChild className="w-full bg-taggui-primary hover:bg-taggui-primary-hover">
            <Link to="/login">Entrar</Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/register">Cadastrar</Link>
          </Button>
        </div>
        
        <p className="text-center text-sm text-gray-500 pt-6">
          Sistema integrado TAGGUI Treinamentos e RH
        </p>
      </div>
    </div>
  );
};

export default Index;
