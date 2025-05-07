
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

const Company = () => {
  const [companyName, setCompanyName] = useState("TAGGUI Treinamentos");
  const [companyLogo, setCompanyLogo] = useState("/placeholder.svg");

  // Mock data - em uma implementação real, isso viria do backend
  const companyInfo = {
    name: "TAGGUI Treinamentos",
    logo: "/placeholder.svg",
    createdAt: "2023-01-15",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    phone: "(11) 3456-7890",
    email: "contato@tagguitreinamentos.com",
    website: "www.tagguitreinamentos.com",
    subscriptionPlan: "Enterprise",
    subscriptionStatus: "Ativo",
    nextBillingDate: "2025-06-07",
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Empresa</h1>
          <p className="text-muted-foreground">Gerencie as informações da sua empresa</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Perfil da Empresa</TabsTrigger>
            <TabsTrigger value="billing">Cobrança</TabsTrigger>
            <TabsTrigger value="branding">Personalização</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Atualize os dados da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Nome da Empresa</Label>
                      <Input 
                        id="companyName" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Email de Contato</Label>
                      <Input 
                        id="companyEmail" 
                        type="email"
                        value={companyInfo.email}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Telefone</Label>
                      <Input 
                        id="companyPhone" 
                        value={companyInfo.phone}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Website</Label>
                      <Input 
                        id="companyWebsite" 
                        value={companyInfo.website}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">Endereço</Label>
                      <Input 
                        id="companyAddress" 
                        value={companyInfo.address}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex-shrink-0">
                    <div className="space-y-2">
                      <Label>Logo da Empresa</Label>
                      <div className="flex flex-col items-center justify-center">
                        <Avatar className="h-32 w-32">
                          <AvatarImage src={companyLogo} alt={companyName} />
                          <AvatarFallback>{companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" className="mt-4">
                          <Upload className="h-4 w-4 mr-2" />
                          Atualizar Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-taggui-primary hover:bg-taggui-primary-hover">
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Cobrança</CardTitle>
                <CardDescription>Gerencie seu plano e pagamentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-sm text-muted-foreground">Plano Atual</h3>
                    <p className="text-xl font-bold">{companyInfo.subscriptionPlan}</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                    <p className="text-xl font-bold">{companyInfo.subscriptionStatus}</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-sm text-muted-foreground">Próxima Cobrança</h3>
                    <p className="text-xl font-bold">{companyInfo.nextBillingDate}</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Método de Pagamento</h3>
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-2 rounded">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H21C22.1046 19 23 18.1046 23 17V7C23 5.89543 22.1046 5 21 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Cartão de Crédito</p>
                      <p className="text-sm text-muted-foreground">**** **** **** 1234 - Validade: 12/27</p>
                    </div>
                    <div className="ml-auto">
                      <Button variant="outline" size="sm">Atualizar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Histórico de Pagamentos</Button>
                <Button className="bg-taggui-primary hover:bg-taggui-primary-hover">
                  Alterar Plano
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Personalização</CardTitle>
                <CardDescription>Personalize a aparência da plataforma para sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input type="color" id="primaryColor" className="w-16 h-10" defaultValue="#FF4700" />
                    <Input defaultValue="#FF4700" className="flex-1" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input type="color" id="secondaryColor" className="w-16 h-10" defaultValue="#0070F3" />
                    <Input defaultValue="#0070F3" className="flex-1" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Estilo de Navegação</Label>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="border rounded-lg p-4 flex flex-col items-center cursor-pointer bg-gray-50">
                      <div className="w-full h-32 border border-dashed flex items-center justify-center mb-2 bg-white">
                        <span>Sidebar</span>
                      </div>
                      <p className="text-sm font-medium">Lateral (Atual)</p>
                    </div>
                    <div className="border rounded-lg p-4 flex flex-col items-center cursor-pointer">
                      <div className="w-full h-32 border border-dashed flex items-center justify-center mb-2 bg-white">
                        <span>TopBar</span>
                      </div>
                      <p className="text-sm font-medium">Superior</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-taggui-primary hover:bg-taggui-primary-hover">
                  Salvar Personalização
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Company;
