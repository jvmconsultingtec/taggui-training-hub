
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchCompanyUsers } from "@/services/api";
import { AlertCircle, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "COLLABORATOR";
};

const Collaborators = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCompanyUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err: any) {
        console.error("Erro ao carregar colaboradores:", err);
        setError("Não foi possível carregar a lista de colaboradores. Por favor, tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = users.filter(
      user =>
        user.name.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-500">Administrador</Badge>;
      case "MANAGER":
        return <Badge className="bg-blue-500">Gerente</Badge>;
      default:
        return <Badge variant="outline">Colaborador</Badge>;
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Colaboradores</h1>
          <p className="text-muted-foreground">Visualize todos os colaboradores da sua empresa</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Equipe</CardTitle>
            <CardDescription>Lista de todos os colaboradores da sua empresa</CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar colaborador por nome ou email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando colaboradores...</div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id}>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <div>{getRoleBadge(user.role)}</div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">Nenhum colaborador encontrado</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery.trim() !== ""
                    ? "Nenhum colaborador corresponde à sua busca"
                    : "Não há colaboradores registrados no sistema"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Collaborators;
