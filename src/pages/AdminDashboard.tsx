
import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Users, Video, CheckCheck, PlusCircle, FileSpreadsheet, Filter } from "lucide-react";
import { Link } from "react-router-dom";

// Dados dinâmicos (sem mocks)


const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ trainings: 0, users: 0, completionRate: 0 });
  const [recent, setRecent] = useState<Array<{ id: string; title: string; author: string | null; created_at: string }>>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Total trainings (RLS já limita por empresa)
        const { count: trainingsCount } = await supabase
          .from("trainings")
          .select("*", { count: "exact", head: true });

        // Users from same company via RPC segura
        const { data: companyUsers, error: usersError } = await supabase.rpc('fetch_company_users');
        if (usersError) console.error('Erro ao buscar usuários da empresa:', usersError);

        // Completion rate: concluidos / atribuicoes (ambos filtrados por RLS)
        const { count: totalAssignments } = await supabase
          .from("training_assignments")
          .select("*", { count: "exact", head: true });
        const { count: completed } = await supabase
          .from("training_progress")
          .select("*", { count: "exact", head: true })
          .not("completed_at", "is", null);

        const completionRate = totalAssignments && totalAssignments > 0
          ? Math.round(((completed || 0) / totalAssignments) * 100)
          : 0;

        setCounts({
          trainings: trainingsCount || 0,
          users: (companyUsers as any[])?.length || 0,
          completionRate,
        });

        // Recent trainings
        const { data: recentTrainings } = await supabase
          .from("trainings")
          .select("id,title,author,created_at")
          .order("created_at", { ascending: false })
          .limit(5);
        setRecent(recentTrainings || []);
      } catch (e) {
        console.error('Erro ao carregar métricas do admin:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <div className="flex gap-3">
            <Link to="/trainings/new" className="taggui-btn-primary flex items-center gap-2">
              <PlusCircle size={18} />
              <span>Novo Treinamento</span>
            </Link>
            <Link to="/reports" className="taggui-btn-outline flex items-center gap-2">
              <FileSpreadsheet size={18} />
              <span>Relatórios</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid - dados reais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="taggui-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de treinamentos</p>
                <p className="text-2xl font-bold mt-1">{counts.trainings}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Video className="text-blue-500" />
              </div>
            </div>
          </div>
          <div className="taggui-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Colaboradores (empresa)</p>
                <p className="text-2xl font-bold mt-1">{counts.users}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="text-green-500" />
              </div>
            </div>
          </div>
          <div className="taggui-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de conclusão</p>
                <p className="text-2xl font-bold mt-1">{counts.completionRate}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCheck className="text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Treinamentos recentes - dados reais */}
        <div className="taggui-card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Treinamentos recentes</h2>
            <Link 
              to="/trainings" 
              className="text-sm text-taggui-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Autor</th>
                  <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((training) => (
                  <tr key={training.id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm font-medium">
                      <Link to={`/trainings/${training.id}`} className="text-gray-900 hover:text-taggui-primary">
                        {training.title}
                      </Link>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{training.author || '-'}</td>
                    <td className="py-3 text-sm text-gray-600">{new Date(training.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
                {recent.length === 0 && !loading && (
                  <tr>
                    <td className="py-4 text-sm text-gray-500" colSpan={3}>Nenhum treinamento encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="taggui-card">
          <h2 className="text-lg font-semibold mb-4">Ações rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/trainings/new" className="p-4 border border-gray-200 rounded-lg hover:border-taggui-primary hover:bg-taggui-primary-light transition-colors flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-taggui-primary-light flex items-center justify-center text-taggui-primary">
                <PlusCircle size={20} />
              </div>
              <div>
                <p className="font-medium">Novo treinamento</p>
                <p className="text-xs text-gray-600">Adicionar conteúdo</p>
              </div>
            </Link>

            <Link to="/trainings/assign" className="p-4 border border-gray-200 rounded-lg hover:border-taggui-primary hover:bg-taggui-primary-light transition-colors flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-taggui-primary-light flex items-center justify-center text-taggui-primary">
                <Users size={20} />
              </div>
              <div>
                <p className="font-medium">Atribuir treinamento</p>
                <p className="text-xs text-gray-600">Designar aos colaboradores</p>
              </div>
            </Link>

            <Link to="/reports" className="p-4 border border-gray-200 rounded-lg hover:border-taggui-primary hover:bg-taggui-primary-light transition-colors flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-taggui-primary-light flex items-center justify-center text-taggui-primary">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <p className="font-medium">Gerar relatório</p>
                <p className="text-xs text-gray-600">Exportar dados</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
