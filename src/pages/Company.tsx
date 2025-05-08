
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchCurrentUser } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Loader } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface CompanyData {
  id: string;
  name: string;
  logo_url: string | null;
}

const Company = () => {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const user = await fetchCurrentUser();
        console.log("User data from fetchCurrentUser:", user);
        
        if (!user) {
          console.error("User not found");
          setError("Unable to get user information. Please check if you are logged in.");
          setLoading(false);
          return;
        }
        
        if (!user.company_id) {
          console.error("User without company_id:", user);
          setError("Unable to get company information. User is not associated with any company.");
          setLoading(false);
          return;
        }
        
        const companyId = user.company_id;
        console.log("Using company ID:", companyId);
        
        // With company_id, fetch company data directly (no RLS policies now)
        try {
          const { data: companyInfo, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .maybeSingle();
            
          if (companyError) {
            console.error("Error fetching company data:", companyError);
            setError("Error fetching company data: " + companyError.message);
            setLoading(false);
            return;
          }
          
          if (!companyInfo) {
            console.error("Company not found:", companyId);
            setError("Company not found. Please check your company ID.");
            setLoading(false);
            return;
          }
          
          console.log("Company data:", companyInfo);
          setCompanyData(companyInfo);
          if (companyInfo?.name) {
            setCompanyName(companyInfo.name);
          }
        } catch (companyErr) {
          console.error("Failed to query companies table:", companyErr);
          setError("Failed to retrieve company data. Please check your permissions.");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error loading company:", err);
        setError("An error occurred while loading company data: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompany();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyData) {
      toast({
        title: "Erro",
        description: "Dados da empresa não encontrados",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      let logoUrl = companyData.logo_url;
      
      // If there's a new logo, upload it first
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `company_logo_${companyData.id}_${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;
        
        const { data: buckets } = await supabase.storage.listBuckets();
        console.log("Available buckets:", buckets);
        
        try {
          // Use the bucket training_videos for now
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('training_videos')
            .upload(filePath, logoFile);
            
          if (uploadError) {
            console.error("Error uploading logo:", uploadError);
            throw uploadError;
          }
          
          console.log("Upload successful:", uploadData);
          
          const { data } = supabase.storage
            .from('training_videos')
            .getPublicUrl(filePath);
            
          logoUrl = data.publicUrl;
          console.log("New logo URL:", logoUrl);
        } catch (uploadErr: any) {
          console.error("Upload error details:", uploadErr);
          toast({
            title: "Erro no upload",
            description: uploadErr.message || "Não foi possível fazer o upload do logo",
            variant: "destructive"
          });
          setSubmitting(false);
          return;
        }
      }
      
      // Update company data
      const { error: updateError } = await supabase
        .from("companies")
        .update({
          name: companyName,
          logo_url: logoUrl
        })
        .eq("id", companyData.id);
        
      if (updateError) {
        console.error("Error updating company:", updateError);
        throw updateError;
      }
      
      toast({
        title: "Empresa atualizada",
        description: "As informações da empresa foram atualizadas com sucesso"
      });
      
      // Update local state
      setCompanyData({
        ...companyData,
        name: companyName,
        logo_url: logoUrl
      });
      
    } catch (err: any) {
      console.error("Erro ao atualizar empresa:", err);
      toast({
        title: "Erro ao atualizar empresa",
        description: err.message || "Ocorreu um erro ao salvar as informações da empresa",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    navigate('/dashboard'); // Redirect to dashboard
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sua Empresa</h1>
          <p className="text-muted-foreground">Gerencie as informações da sua empresa</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <div className="mt-4">
              <Button onClick={handleRetry} variant="outline">
                Voltar para Dashboard
              </Button>
            </div>
          </Alert>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Atualize o perfil da sua empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-logo">Logo da Empresa</Label>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        {(logoPreview || companyData?.logo_url) && (
                          <AvatarImage 
                            src={logoPreview || companyData?.logo_url || ''} 
                            alt={companyData?.name} 
                          />
                        )}
                        <AvatarFallback className="text-2xl">
                          {companyData?.name?.substring(0, 2).toUpperCase() || 'CO'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <Input
                          id="company-logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="max-w-sm"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Company;
