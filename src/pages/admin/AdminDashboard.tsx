import { useEffect, useState } from 'react';
import { Users, BookOpen, FileText, TrendingUp, Loader2, Medal, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { fetchManuals } from '@/lib/api';

interface AttemptRow {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total: number;
  completed_at: string;
  profiles: { display_name: string | null } | null;
}

const AdminDashboard = () => {
  const { company } = useCompany();
  const [stats, setStats] = useState({ employees: 0, quizzes: 0, materials: 0, attempts: 0 });
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [quizNames, setQuizNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!company) return;
      try {
        const [{ count: empCount }, { count: attemptCount }, manualsData, attemptsData] = await Promise.all([
          supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
          supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
          fetchManuals(),
          supabase
            .from('quiz_attempts')
            .select('id, user_id, quiz_id, score, total, completed_at, profiles(display_name)')
            .eq('company_id', company.id)
            .order('completed_at', { ascending: false })
            .limit(50),
        ]);

        const quizCount = manualsData.reduce((acc, m) => acc + m.quizzes.length, 0);
        const nameMap: Record<string, string> = {};
        manualsData.forEach(m => m.quizzes.forEach(q => { nameMap[q.id] = q.name; }));

        setStats({ employees: empCount || 0, quizzes: quizCount, materials: manualsData.length, attempts: attemptCount || 0 });
        setAttempts((attemptsData.data || []) as unknown as AttemptRow[]);
        setQuizNames(nameMap);
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

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((acc, a) => acc + (a.total > 0 ? (a.score / a.total) * 100 : 0), 0) / attempts.length)
    : null;

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
        <>
          {/* Stat cards */}
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

          {/* Average Score banner */}
          {avgScore !== null && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Medal className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Average quiz score across all completions</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
                      <Progress value={avgScore} className="flex-1 h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Completions */}
          {attempts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Completions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {attempts.slice(0, 20).map((attempt) => {
                    const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
                    const passed = pct >= 70;
                    return (
                      <div key={attempt.id} className="flex items-center gap-4 px-6 py-3">
                        <div className={`p-1.5 rounded-full ${passed ? 'bg-success/10' : 'bg-destructive/10'}`}>
                          <CheckCircle2 className={`h-4 w-4 ${passed ? 'text-success' : 'text-destructive'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {(attempt.profiles as any)?.display_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {quizNames[attempt.quiz_id] || attempt.quiz_id}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="w-20">
                            <Progress value={pct} className="h-1.5" />
                          </div>
                          <Badge variant={passed ? 'default' : 'destructive'} className="text-xs w-12 justify-center">
                            {pct}%
                          </Badge>
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {new Date(attempt.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          {company && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Company Info</CardTitle>
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
                      <div className="w-5 h-5 rounded border" style={{ backgroundColor: company.primary_color || '#2563eb' }} />
                      <span className="font-medium text-foreground font-mono">{company.primary_color}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
