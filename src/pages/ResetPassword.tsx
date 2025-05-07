
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import TagguiLogo from "@/components/layout/TagguiLogo";
import { Progress } from "@/components/ui/progress";
import { Check, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { updatePassword, loading } = useAuth();

  // Password strength criteria
  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
  
  // Calculate password strength (0-100)
  const calculateStrength = () => {
    let strength = 0;
    if (hasMinLength) strength += 25;
    if (hasUppercase) strength += 25;
    if (hasNumber) strength += 25;
    if (hasSpecialChar) strength += 25;
    return strength;
  };

  const passwordStrength = calculateStrength();
  
  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    try {
      await updatePassword(newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir a senha. Tente novamente.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <TagguiLogo />
          </div>
          <CardTitle className="text-2xl text-center">Redefinir Senha</CardTitle>
          <CardDescription className="text-center">
            Criar uma nova senha para sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Senha redefinida com sucesso. Você será redirecionado para a página de login.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full"
                />
                
                {newPassword.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Força da senha:</span>
                      <span className={passwordStrength >= 75 ? "text-green-600" : passwordStrength >= 50 ? "text-yellow-600" : "text-red-600"}>
                        {passwordStrength <= 25 ? "Fraca" : passwordStrength <= 50 ? "Média" : passwordStrength <= 75 ? "Boa" : "Forte"}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className={`h-2 ${getStrengthColor()}`} />
                    
                    <ul className="space-y-1 mt-2 text-sm">
                      <li className="flex items-center gap-2">
                        {hasMinLength ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                        <span>Pelo menos 6 caracteres</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {hasUppercase ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                        <span>Pelo menos uma letra maiúscula</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {hasNumber ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                        <span>Pelo menos um número</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {hasSpecialChar ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                        <span>Pelo menos um caractere especial</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirme a Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite novamente sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">As senhas não coincidem</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-taggui-primary hover:bg-taggui-primary-hover"
                disabled={loading}
              >
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-center text-sm mt-2">
            Sistema integrado TAGGUI Treinamentos e RH
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
