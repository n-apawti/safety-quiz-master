import { useEffect, useState } from 'react';
import { Users, BookOpen, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { fetchManuals } from '@/lib/api';

const AdminDashboard = () => {
  const { company } = useCompany();
  const [stats, setStats] = useState({
    employees: 0,
    quizzes: 0,
    materials: 0,
    attempts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!company) return;
      try {
        // Count employees
        const { count: empCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);

        // Count quiz attempts
        const { count: attemptCount } = await supabase
          .from('quiz_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);

        // Count manuals & quizzes from backend
        const manuals = await fetchManuals();
        const quizCount = manuals.reduce((acc, m) => acc + m.quizzes.length, 0);

        setStats({
          employees: empCount || 0,
          quizzes: quizCount,
          materials: manuals.length,
          attempts: attemptCount || 0,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [company]);

  const statCards = [
    { title: 'Employees', value: stats.employees, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Quizzes', value: stats.quizzes, icon: FileText, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Materials', value: stats.materials, icon: BookOpen, color: 'text-warning', bg: 'bg-warning/10' },
    { title: 'Completions', value: stats.attempts, icon: TrendingUp, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome to the {company?.name} admin panel</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Company Info */}
      {company && (
        <Card>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name</span>
                <p className="font-medium text-foreground">{company.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Slug / URL</span>
                <p className="font-medium text-foreground font-mono">/{company.slug}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Brand Color</span>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-5 h-5 rounded border"
                    style={{ backgroundColor: company.primary_color || '#2563eb' }}
                  />
                  <span className="font-medium text-foreground font-mono">{company.primary_color}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
