
import { useState } from "react";
import Layout from "../components/layout/Layout";
import { BarChart, Users, Video, CheckCheck, PlusCircle, FileSpreadsheet, Filter } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for admin dashboard
const stats = [
  { 
    label: "Total de treinamentos", 
    value: 24, 
    icon: <Video className="text-blue-500" />, 
    change: "+4 este mês" 
  },
  { 
    label: "Colaboradores ativos", 
    value: 156, 
    icon: <Users className="text-green-500" />, 
    change: "+12 este mês" 
  },
  { 
    label: "Taxa de conclusão", 
    value: "78%", 
    icon: <CheckCheck className="text-purple-500" />, 
    change: "+5% vs. mês anterior" 
  },
  { 
    label: "Média de tempo", 
    value: "24min", 
    icon: <BarChart className="text-orange-500" />, 
    change: "-2min vs. mês anterior" 
  },
];

// Mock training data
const recentTrainings = [
  {
    id: "1",
    title: "Onboarding: Conheça a Empresa",
    author: "RH",
    assigned: 38,
    completed: 22,
    completionRate: 58,
  },
  {
    id: "2",
    title: "Segurança da Informação",
    author: "TI",
    assigned: 156,
    completed: 130,
    completionRate: 83,
  },
  {
    id: "3",
    title: "Treinamento em Diversidade e Inclusão",
    author: "RH",
    assigned: 156,
    completed: 110,
    completionRate: 71,
  },
  {
    id: "4",
    title: "Comunicação Efetiva",
    author: "Comunicação",
    assigned: 45,
    completed: 29,
    completionRate: 64,
  },
  {
    id: "5",
    title: "Excel Avançado",
    author: "TI",
    assigned: 32,
    completed: 19,
    completionRate: 59,
  }
];

// Mock employee progress data
const employeeProgress = [
  {
    id: "1",
    name: "Ana Silva",
    role: "Designer de Produto",
    completed: 5,
    assigned: 5,
    avatar: null,
    completionRate: 100
  },
  {
    id: "2",
    name: "Carlos Mendes",
    role: "Desenvolvedor Frontend",
    completed: 4,
    assigned: 5,
    avatar: null,
    completionRate: 80
  },
  {
    id: "3",
    name: "Fernanda Costa",
    role: "Analista de Marketing",
    completed: 3,
    assigned: 6,
    avatar: null,
    completionRate: 50
  },
  {
    id: "4",
    name: "Roberto Alves",
    role: "Gerente de Projetos",
    completed: 7,
    assigned: 8,
    avatar: null,
    completionRate: 88
  },
  {
    id: "5",
    name: "Juliana Martins",
    role: "Analista de RH",
    completed: 6,
    assigned: 7,
    avatar: null,
    completionRate: 86
  }
];

const AdminDashboard = () => {
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
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="taggui-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Training Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Trainings */}
          <div className="taggui-card">
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
                    <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Atribuídos</th>
                    <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrainings.map((training) => (
                    <tr key={training.id} className="hover:bg-gray-50">
                      <td className="py-3 text-sm font-medium">
                        <Link to={`/trainings/${training.id}`} className="text-gray-900 hover:text-taggui-primary">
                          {training.title}
                        </Link>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{training.author}</td>
                      <td className="py-3 text-sm text-gray-600">{training.assigned}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                training.completionRate > 80 ? "bg-green-500" : 
                                training.completionRate > 50 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${training.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{training.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Employee Progress */}
          <div className="taggui-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Progresso dos colaboradores</h2>
              <Link 
                to="/progress" 
                className="text-sm text-taggui-primary hover:underline"
              >
                Ver todos
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Colaborador</th>
                    <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Concluídos</th>
                    <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Progresso</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeProgress.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                            {employee.avatar || employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-600">{employee.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{employee.completed}/{employee.assigned}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                employee.completionRate > 80 ? "bg-green-500" : 
                                employee.completionRate > 50 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${employee.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{employee.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
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
