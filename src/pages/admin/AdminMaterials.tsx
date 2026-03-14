import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Upload, BookOpen, Pencil, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchManuals } from '@/lib/api';
import { Manual } from '@/lib/types';

const AdminMaterials = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const { company } = useCompany();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchManuals();
        setManuals(data);
      } catch (err) {
        console.error('Failed to load manuals:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materials</h1>
          <p className="text-muted-foreground mt-1">Manage your safety manuals and their quizzes</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/upload')}>
          <Upload className="h-4 w-4" />
          Upload Manual
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : manuals.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No materials yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Upload your first safety manual to generate quizzes for your team.
              </p>
            </div>
            <Button className="gap-2" onClick={() => navigate('/upload')}>
              <Upload className="h-4 w-4" />
              Upload Your First Manual
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {manuals.map((manual) => (
            <Card key={manual.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{manual.name}</CardTitle>
                      <CardDescription className="mt-0.5">
                        {manual.filename} • Uploaded {new Date(manual.uploadedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary">{manual.quizzes.length} quiz{manual.quizzes.length !== 1 ? 'zes' : ''}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => navigate(`/editor/${manual.id}`)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {manual.quizzes.length > 0 && (
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {manual.quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"
                      >
                        <span className="font-medium text-foreground truncate mr-2">{quiz.name}</span>
                        <span className="text-muted-foreground shrink-0">{quiz.questions.length}q</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMaterials;
