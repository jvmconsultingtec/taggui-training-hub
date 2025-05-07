
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Linkedin } from "lucide-react";
import TagguiLogo from "../components/layout/TagguiLogo";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      // For demo purposes, we'll just navigate to dashboard
      // In a real app, you'd validate credentials with Supabase
      if (email && password) {
        navigate("/dashboard");
      } else {
        toast.error("Por favor, preencha todos os campos.");
      }
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-10">
            <TagguiLogo />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Faça login</h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email ex: kelly@taggui.com.br"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-taggui-primary focus:border-taggui-primary"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-taggui-primary focus:border-taggui-primary"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-taggui-primary focus:ring-taggui-primary border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Lembrar-me por 30 dias
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-taggui-primary hover:text-taggui-primary-hover">
                  Esqueceu a senha?
                </a>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-taggui-primary hover:bg-taggui-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-taggui-primary"
              >
                {isLoading ? "Entrando..." : "Entrar no sistema"}
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>
            
            <div>
              <button
                type="button"
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-taggui-primary"
              >
                <Linkedin size={20} className="text-[#0077B5]" />
                Entre com sua conta LinkedIn
              </button>
            </div>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a href="#" className="font-medium text-taggui-primary hover:text-taggui-primary-hover">
                Cadastre-se
              </a>
            </p>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">© Taggui, 2025</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Testimonial */}
      <div className="hidden lg:flex lg:flex-1 bg-gray-100">
        <div className="flex flex-col justify-center px-12 w-full">
          <div className="max-w-xl mx-auto">
            <div className="mb-8">
              <p className="text-2xl font-medium text-gray-900">
                Poucas coisas me fazem sentir mais poderosa do que fazer entrevistas no{" "}
                <span className="text-taggui-primary font-semibold">Taggui</span> para tornar minha vida mais fácil e eficiente.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                J
              </div>
              <div>
                <p className="font-medium">Ailah Lane</p>
                <p className="text-sm text-gray-600">Founder, Layers.io</p>
              </div>
            </div>
            
            <div className="mt-4 flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star} 
                  className="h-5 w-5 text-yellow-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            
            <img 
              src="public/lovable-uploads/af26d35b-13eb-4f1c-aa82-a02e35c93e88.png" 
              alt="TAGGUI Dashboard" 
              className="mt-12 rounded-lg shadow-xl w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
