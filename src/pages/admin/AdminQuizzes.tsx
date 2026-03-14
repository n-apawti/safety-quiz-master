import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Pencil, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchManuals } from '@/lib/api';
import { Manual } from '@/lib/types';

const AdminQuizzes = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchManuals();
        setManuals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const allQuizzes = manuals.flatMap(m =>
    m.quizzes.map(q => ({ ...q, manualId: m.id, manualName: m.name }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quizzes</h1>
        <p className="text-muted-foreground mt-1">View and manage all quizzes across your materials</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : allQuizzes.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No quizzes yet</h3>
              <p className="text-muted-foreground text-sm">Upload a manual to generate quizzes.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {allQuizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">{quiz.name}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{quiz.manualName}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{quiz.questions.length} questions</Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 h-8"
                      onClick={() => navigate(`/editor/${quiz.manualId}?quiz=${quiz.id}`)}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 h-8"
                      onClick={() => navigate(`/${companySlug}/quiz/${quiz.id}`)}
                    >
                      <Play className="h-3 w-3" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuizzes;
