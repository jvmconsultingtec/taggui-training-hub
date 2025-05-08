
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsProps {
  total: number;
  completed: number;
  inProgress: number;
  overdue?: number;
}

export function TrainingStats({ total, completed, inProgress, overdue = 0 }: StatsProps) {
  // Ensure total is accurate and consistent
  const realTotal = Math.max(total, completed + inProgress + overdue);
  
  const completionPercentage = realTotal > 0 ? (completed / realTotal) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Meu Progresso</CardTitle>
        <CardDescription>Acompanhe seus treinamentos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progresso geral</span>
            <span className="text-sm font-medium">{completionPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={completionPercentage} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1 text-center p-2 bg-taggui-primary-light rounded-lg">
            <span className="text-xl font-semibold">{completed}</span>
            <p className="text-xs text-muted-foreground">Completados</p>
          </div>
          <div className="space-y-1 text-center p-2 bg-blue-50 rounded-lg">
            <span className="text-xl font-semibold">{inProgress}</span>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </div>
          {overdue > 0 ? (
            <div className="space-y-1 text-center p-2 bg-red-50 rounded-lg">
              <span className="text-xl font-semibold">{overdue}</span>
              <p className="text-xs text-muted-foreground">Atrasados</p>
            </div>
          ) : (
            <div className="space-y-1 text-center p-2 bg-gray-50 rounded-lg">
              <span className="text-xl font-semibold">{realTotal}</span>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
