
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import TagguiLogo from "@/components/layout/TagguiLogo";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, resetPassword, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (forgotPasswordMode) {
      await resetPassword(email);
      setResetSent(true);
    } else {
      await signIn(email, password);
    }
  };

  const toggleMode = () => {
    setForgotPasswordMode(!forgotPasswordMode);
    setResetSent(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <TagguiLogo />
          </div>
          <CardTitle className="text-2xl text-center">TAGGUI Treinamentos</CardTitle>
          <CardDescription className="text-center">
            {forgotPasswordMode 
              ? "Informe seu email para receber instruções de redefinição de senha" 
              : "Entre com suas credenciais para acessar o sistema"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetSent && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Um email foi enviado com instruções para redefinir sua senha.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {!forgotPasswordMode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-taggui-primary hover:bg-taggui-primary-hover"
              disabled={loading}
            >
              {loading 
                ? forgotPasswordMode ? "Enviando..." : "Entrando..." 
                : forgotPasswordMode ? "Enviar email" : "Entrar"
              }
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button 
            variant="link" 
            onClick={toggleMode}
            className="text-taggui-primary"
          >
            {forgotPasswordMode ? "Voltar para login" : "Esqueceu a senha?"}
          </Button>
          <p className="text-center text-sm mt-2">
            Sistema integrado TAGGUI Treinamentos e RH
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
