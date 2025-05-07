
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchCompanyUsers, fetchCurrentUser } from "@/services/api";
import { AlertCircle, Building, Users, FileText, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CompanyData = {
  id: string;
  name: string;
  logo_url: string | null;
  totalUsers: number;
  admins: number;
  managers: number;
  collaborators: number;
};

const Company = () => {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obter o usuário atual para acessar dados da empresa
        const currentUser = await fetchCurrentUser();
        if (!currentUser) {
          setError("Não foi possível carregar os dados do usuário atual.");
          return;
        }
        
        // Buscar todos os usuários da empresa
        const users = await fetchCompanyUsers();
        
        // Calcular estatísticas
        const admins = users.filter(user => user.role === 'ADMIN').length;
        const managers = users.filter(user => user.role === 'MANAGER').length;
        const collaborators = users.filter(user => user.role === 'COLLABORATOR').length;
        
        // Como estamos usando o mesmo ID de empresa para todos os usuários,
        // podemos usar o company_id do usuário atual
        setCompanyData({
          id: currentUser.company_id,
          name: "TAGGUI Ltda.", // Normalmente viria da tabela de empresas
          logo_url: null,
          totalUsers: users.length,
          admins,
          managers,
          collaborators
        });
      } catch (err: any) {
        console.error("Erro ao carregar dados da empresa:", err);
        setError("Não foi possível carregar os dados da empresa. Por favor, tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="text-center py-12">Carregando dados da empresa...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Empresa</h1>
          <p className="text-muted-foreground">Informações sobre sua empresa e licença</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="license">Licença</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>Informações cadastrais da empresa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                      {companyData?.logo_url ? (
                        <AvatarImage src={companyData.logo_url} />
                      ) : (
                        <AvatarFallback className="text-2xl">
                          <Building />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-medium">{companyData?.name}</h3>
                      <Badge variant="outline">Plano Empresarial</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">CNPJ</h4>
                      <p>00.000.000/0001-00</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Razão Social</h4>
                      <p>{companyData?.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Email Corporativo</h4>
                      <p>contato@taggui.com.br</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Telefone</h4>
                      <p>(11) 9999-9999</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Endereço</h4>
                      <p>Av. Paulista, 1000 - São Paulo, SP</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Site</h4>
                      <p>www.taggui.com.br</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline">Editar Dados</Button>
                </CardFooter>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Users size={18} />
                      <CardTitle className="text-base">Colaboradores</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{companyData?.totalUsers}</div>
                    <p className="text-sm text-muted-foreground">Total de colaboradores</p>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center p-2 bg-gray-50 rounded-md">
                        <div className="font-medium">{companyData?.admins}</div>
                        <p className="text-xs text-muted-foreground">Admins</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-md">
                        <div className="font-medium">{companyData?.managers}</div>
                        <p className="text-xs text-muted-foreground">Gerentes</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-md">
                        <div className="font-medium">{companyData?.collaborators}</div>
                        <p className="text-xs text-muted-foreground">Colaboradores</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Info size={18} />
                      <CardTitle className="text-base">Status</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Ativo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Sua empresa está com a licença ativa e todos os serviços disponíveis.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="license">
            <Card>
              <CardHeader>
                <CardTitle>Licença</CardTitle>
                <CardDescription>Detalhes da licença e plano</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Plano</h4>
                      <p className="font-medium">Empresarial</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                      <p className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Ativo
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Data de Início</h4>
                      <p>01/01/2025</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Data de Renovação</h4>
                      <p>01/01/2026</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Usuários Permitidos</h4>
                      <p>Ilimitado</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Usuários Ativos</h4>
                      <p>{companyData?.totalUsers || 0}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Recursos Incluídos</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        Gerenciamento de treinamentos
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        Relatórios avançados
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        Integração com RH
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        Armazenamento ilimitado
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        Suporte prioritário
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="outline">Ver Fatura</Button>
                <Button>Gerenciar Plano</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documentos</CardTitle>
                <CardDescription>Documentos da empresa e contratos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium">Contrato de Licença</p>
                        <p className="text-sm text-muted-foreground">PDF - 1.2MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium">Termos de Uso</p>
                        <p className="text-sm text-muted-foreground">PDF - 0.8MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium">Política de Privacidade</p>
                        <p className="text-sm text-muted-foreground">PDF - 0.5MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium">Certificado Digital</p>
                        <p className="text-sm text-muted-foreground">PDF - 0.3MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline">Enviar Documento</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Company;
