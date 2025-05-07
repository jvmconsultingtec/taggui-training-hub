
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchCompanyUsers } from "@/services/api";
import { AlertCircle, Search, SortAsc, SortDesc, Filter, Loader } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "COLLABORATOR";
};

type SortField = "name" | "email" | "role";
type SortOrder = "asc" | "desc";

const Collaborators = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filterRole, setFilterRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCompanyUsers();
        console.log("Fetched users:", data);
        setUsers(data);
        setFilteredUsers(data);
      } catch (err: any) {
        console.error("Erro ao carregar colaboradores:", err);
        setError("Não foi possível carregar a lista de colaboradores. Por favor, tente novamente mais tarde.");
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de colaboradores",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
    
    // Apply role filter if set
    if (filterRole) {
      result = result.filter(user => user.role === filterRole);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== "") {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        user =>
          user.name.toLowerCase().includes(lowercaseQuery) ||
          user.email.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "email") {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === "role") {
        comparison = a.role.localeCompare(b.role);
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    setFilteredUsers(result);
  }, [searchQuery, users, sortField, sortOrder, filterRole]);

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

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      toggleSortOrder();
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortField("name");
    setSortOrder("asc");
    setFilterRole(null);
  };

  const showEmptyData = !loading && filteredUsers.length === 0;

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
            
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar colaborador por nome ou email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <SortAsc size={16} />
                      Ordenar por {sortField}
                      {sortOrder === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSortChange("name")}>
                      Nome {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("email")}>
                      Email {sortField === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("role")}>
                      Cargo {sortField === "role" && (sortOrder === "asc" ? "↑" : "↓")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Filter size={16} />
                      {filterRole ? `Filtro: ${filterRole}` : "Filtrar por cargo"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterRole("ADMIN")}>
                      Administradores
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterRole("MANAGER")}>
                      Gerentes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterRole("COLLABORATOR")}>
                      Colaboradores
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterRole(null)}>
                      Todos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {(searchQuery || filterRole || sortField !== "name" || sortOrder !== "asc") && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader className="h-6 w-6 text-gray-400 animate-spin mx-auto mb-2" />
                <p>Carregando colaboradores...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-4">
                <div className="hidden md:flex text-xs text-muted-foreground mb-2 px-4">
                  <div className="w-12"></div>
                  <div className="flex-1 grid grid-cols-2">
                    <div>NOME / EMAIL</div>
                    <div className="text-right">CARGO</div>
                  </div>
                </div>
                {filteredUsers.map((user) => (
                  <div key={user.id}>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 md:grid md:grid-cols-2">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        <div className="mt-2 md:mt-0 md:text-right">{getRoleBadge(user.role)}</div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}

                <div className="text-sm text-center text-muted-foreground">
                  Mostrando {filteredUsers.length} de {users.length} colaboradores
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">Nenhum colaborador encontrado</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery.trim() !== "" || filterRole
                    ? "Nenhum colaborador corresponde à sua busca"
                    : "Não há colaboradores registrados no sistema"}
                </p>
                {(searchQuery.trim() !== "" || filterRole) && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}
                {!searchQuery.trim() && !filterRole && showEmptyData && (
                  <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-md max-w-md mx-auto">
                    <p className="text-sm font-medium">
                      Não há colaboradores cadastrados nesta conta. Você precisa adicionar colaboradores primeiro.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Collaborators;
