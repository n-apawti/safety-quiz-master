import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ManualCard } from '@/components/ManualCard';
import { fetchManuals } from '@/lib/api';
import { Manual } from '@/lib/types';

const Index = () => {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadManuals = async () => {
      try {
        const data = await fetchManuals();
        setManuals(data);
      } catch (error) {
        console.error('Failed to fetch manuals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadManuals();
  }, []);

  const handleManualUpdate = (updatedManual: Manual) => {
    setManuals(manuals.map(m => 
      m.id === updatedManual.id ? updatedManual : m
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary">
                <ShieldCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Safety Quiz Manager</h1>
                <p className="text-sm text-muted-foreground">Generate & manage safety training quizzes</p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => navigate('/upload')}
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              New Upload
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Uploaded Manuals</h2>
          <p className="text-muted-foreground mt-1">
            Select a manual to view and take its quizzes
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : manuals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <ShieldCheck className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No manuals uploaded yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Upload your first safety manual to generate interactive quizzes for your team.
            </p>
            <Button onClick={() => navigate('/upload')} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Upload Your First Manual
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {manuals.map((manual) => (
              <ManualCard 
                key={manual.id} 
                manual={manual} 
                onManualUpdate={handleManualUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
