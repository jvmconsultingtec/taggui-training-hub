
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Jan', concluidos: 12, iniciados: 19 },
  { name: 'Fev', concluidos: 15, iniciados: 21 },
  { name: 'Mar', concluidos: 18, iniciados: 25 },
  { name: 'Abr', concluidos: 14, iniciados: 20 },
  { name: 'Mai', concluidos: 22, iniciados: 28 },
  { name: 'Jun', concluidos: 19, iniciados: 23 },
];

const mockCompletionData = [
  { name: 'Onboarding', taxa: 95 },
  { name: 'Segurança', taxa: 85 },
  { name: 'Excel', taxa: 65 },
  { name: 'Comunicação', taxa: 75 },
  { name: 'Diversidade', taxa: 80 },
  { name: 'Marketing', taxa: 60 },
];

const Reports = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Visualize estatísticas e relatórios dos treinamentos</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="completion">Taxa de Conclusão</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Progresso Mensal</CardTitle>
                <CardDescription>Treinamentos concluídos e iniciados por mês</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="concluidos" name="Treinamentos Concluídos" fill="#0088FE" />
                      <Bar dataKey="iniciados" name="Treinamentos Iniciados" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completion">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conclusão por Treinamento</CardTitle>
                <CardDescription>Porcentagem de colaboradores que concluíram cada treinamento</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={mockCompletionData}
                      margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Conclusão']} />
                      <Legend />
                      <Bar dataKey="taxa" name="Taxa de Conclusão (%)" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Engajamento</CardTitle>
                <CardDescription>Métricas de engajamento dos colaboradores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Tempo Médio de Conclusão
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3.2 dias</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        5% mais rápido que o mês anterior
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Taxa de Conclusão
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">78%</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        2% maior que o mês anterior
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Colaboradores Ativos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">132</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        8 novos colaboradores este mês
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
