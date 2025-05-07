
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações da sua conta e da plataforma</p>
        </div>

        <Tabs defaultValue="account" className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Minha Conta</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Minha Conta</CardTitle>
                <CardDescription>Gerencie suas informações pessoais e credenciais de acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Nome Completo</Label>
                      <Input id="userName" defaultValue="João Vitor" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email</Label>
                      <Input id="userEmail" type="email" defaultValue="joao@empresa.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userPhone">Telefone</Label>
                      <Input id="userPhone" defaultValue="(11) 98765-4321" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userDepartment">Departamento</Label>
                      <Input id="userDepartment" defaultValue="Tecnologia" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Salvar Informações</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alterar Senha</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Alterar Senha</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sessões Ativas</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Navegador Chrome - Windows</p>
                        <p className="text-sm text-muted-foreground">São Paulo, Brasil · Ativo agora</p>
                      </div>
                      <Button variant="outline" size="sm">Encerrar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure como deseja receber notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Treinamentos</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="newTraining">Novos Treinamentos</Label>
                        <p className="text-sm text-muted-foreground">Receba notificações quando novos treinamentos forem atribuídos a você</p>
                      </div>
                      <Switch id="newTraining" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="trainingReminder">Lembretes de Treinamento</Label>
                        <p className="text-sm text-muted-foreground">Receba lembretes sobre treinamentos não concluídos</p>
                      </div>
                      <Switch id="trainingReminder" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="trainingComplete">Conclusão de Treinamento</Label>
                        <p className="text-sm text-muted-foreground">Receba notificações quando completar um treinamento</p>
                      </div>
                      <Switch id="trainingComplete" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sistema</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="systemUpdates">Atualizações do Sistema</Label>
                        <p className="text-sm text-muted-foreground">Receba notificações sobre novas funcionalidades e atualizações</p>
                      </div>
                      <Switch id="systemUpdates" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing">Conteúdo de Marketing</Label>
                        <p className="text-sm text-muted-foreground">Receba informações sobre novos produtos e serviços</p>
                      </div>
                      <Switch id="marketing" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Canais de Notificação</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotif">Email</Label>
                        <p className="text-sm text-muted-foreground">Receba notificações por email</p>
                      </div>
                      <Switch id="emailNotif" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushNotif">Push Web</Label>
                        <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                      </div>
                      <Switch id="pushNotif" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize a aparência da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tema</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 cursor-pointer bg-white flex flex-col items-center">
                      <div className="h-20 w-full rounded bg-white border mb-2"></div>
                      <p className="text-sm font-medium">Claro</p>
                    </div>
                    <div className="border rounded-lg p-4 cursor-pointer flex flex-col items-center">
                      <div className="h-20 w-full rounded bg-gray-900 border border-gray-700 mb-2"></div>
                      <p className="text-sm font-medium">Escuro</p>
                    </div>
                    <div className="border rounded-lg p-4 cursor-pointer flex flex-col items-center">
                      <div className="h-20 w-full rounded bg-gradient-to-b from-white to-gray-900 border mb-2"></div>
                      <p className="text-sm font-medium">Sistema</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Densidade</h3>
                  <div className="flex items-center space-x-4">
                    <Select defaultValue="default">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione a densidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compacta</SelectItem>
                        <SelectItem value="default">Padrão</SelectItem>
                        <SelectItem value="comfortable">Confortável</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Ajusta o espaçamento entre os elementos</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Fonte</h3>
                  <div className="flex items-center space-x-4">
                    <Select defaultValue="inter">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione a fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="opensans">Open Sans</SelectItem>
                        <SelectItem value="lato">Lato</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Define a família de fontes usada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>Configure opções avançadas do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Performance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="animations">Animações</Label>
                        <p className="text-sm text-muted-foreground">Ativa ou desativa animações na interface</p>
                      </div>
                      <Switch id="animations" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="prefetch">Pré-carregamento</Label>
                        <p className="text-sm text-muted-foreground">Pré-carrega conteúdos para melhor performance</p>
                      </div>
                      <Switch id="prefetch" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Idioma</h3>
                  <div className="flex items-center space-x-4">
                    <Select defaultValue="pt-BR">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione o idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Define o idioma da interface</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-red-600">Zona de Perigo</h3>
                  <div className="space-y-3">
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <h4 className="font-medium mb-2">Exportar Dados</h4>
                      <p className="text-sm text-muted-foreground mb-4">Baixe todos os seus dados pessoais da plataforma</p>
                      <Button variant="outline" size="sm">Exportar Dados</Button>
                    </div>
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <h4 className="font-medium mb-2">Excluir Conta</h4>
                      <p className="text-sm text-muted-foreground mb-4">Exclua permanentemente sua conta e todos os seus dados</p>
                      <Button variant="destructive" size="sm">Excluir Minha Conta</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
