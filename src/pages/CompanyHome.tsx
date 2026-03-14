import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Play, Loader2, ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchManuals } from '@/lib/api';
import { Manual } from '@/lib/types';

const CompanyHome = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { company, userRole, loading: companyLoading } = useCompany();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadManuals = async () => {
      try {
        const data = await fetchManuals();
        setManuals(data);
      } catch (err) {
        console.error('Failed to fetch manuals:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadManuals();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <CardTitle className="mb-4">Company Not Found</CardTitle>
          <p className="text-muted-foreground mb-6">
            The company "{companySlug}" does not exist.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const allQuizzes = manuals.flatMap(m => m.quizzes.map(q => ({ ...q, manualName: m.name })));

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      {company.banner_url && (
        <div
          className="h-32 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${company.banner_url})` }}
        />
      )}

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="h-9 w-auto object-contain" />
            ) : (
              <div className="p-2 rounded-lg bg-primary">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-foreground">{company.name}</h1>
              <p className="text-xs text-muted-foreground">Safety Training Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(userRole === 'company_admin' || userRole === 'super_admin') && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/${companySlug}/admin`)}>
                Admin Dashboard
              </Button>
            )}
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground">Available Quizzes</h2>
          <p className="text-muted-foreground mt-1">Complete your safety training quizzes below</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : allQuizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No quizzes available yet</h3>
            <p className="text-muted-foreground">Check back later when your admin has uploaded training materials.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-base mt-3">{quiz.name}</CardTitle>
                  <CardDescription>{quiz.manualName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {quiz.questions.length} questions
                    </span>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => navigate(`/${companySlug}/quiz/${quiz.id}`)}
                    >
                      <Play className="h-3 w-3" />
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyHome;
