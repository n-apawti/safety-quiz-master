import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Settings,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadManualAndGenerateQuizzes } from '@/lib/api';
import { GenerateQuizConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

const UploadWizard = () => {
  const navigate = useNavigate();
  const { companySlug } = useParams<{ companySlug: string }>();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [config, setConfig] = useState<GenerateQuizConfig>({
    manualName: '',
    numQuizzes: 2,
    questionsPerQuiz: 10,
    file: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setConfig((prev) => ({ ...prev, file }));
      setErrors((prev) => ({ ...prev, file: '' }));
    } else {
      setErrors((prev) => ({ ...prev, file: 'Please upload a PDF file' }));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setConfig((prev) => ({ ...prev, file }));
      setErrors((prev) => ({ ...prev, file: '' }));
    } else if (file) {
      setErrors((prev) => ({ ...prev, file: 'Please upload a PDF file' }));
    }
  };

  const validateStep1 = () => {
    if (!config.file) {
      setErrors((prev) => ({ ...prev, file: 'Please upload a PDF file' }));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!config.manualName.trim()) {
      newErrors.manualName = 'Quiz set name is required';
    }
    
    if (config.numQuizzes < 1 || config.numQuizzes > 4) {
      newErrors.numQuizzes = 'Number of quizzes must be between 1 and 4';
    }
    
    if (config.questionsPerQuiz < 5 || config.questionsPerQuiz > 20) {
      newErrors.questionsPerQuiz = 'Questions per quiz must be between 5 and 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleGenerate = async () => {
    if (!validateStep2()) return;

    setIsGenerating(true);
    try {
      const { manual } = await uploadManualAndGenerateQuizzes(config);
      navigate(`/${companySlug}/editor/${manual.id}`);
    } catch (error) {
      console.error('Failed to generate quizzes:', error);
      setErrors({ general: 'Failed to generate quizzes. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    { number: 1, title: 'Upload File', icon: Upload },
    { number: 2, title: 'Configure', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Upload Manual</h1>
              <p className="text-sm text-muted-foreground">Create quizzes from your safety manual</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center gap-4">
              <div
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                  step >= s.number
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step > s.number ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
                <span className="font-medium text-sm">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 rounded',
                    step > s.number ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Upload Safety Manual</CardTitle>
              <CardDescription>
                Upload a PDF file of your safety manual to generate quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer',
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : config.file
                    ? 'border-success bg-success/5'
                    : errors.file
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {config.file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-success/10">
                      <FileText className="h-8 w-8 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{config.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(config.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Drop your PDF here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports PDF files up to 50MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {errors.file && (
                <p className="flex items-center gap-2 mt-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.file}
                </p>
              )}

              <div className="flex justify-end mt-6">
                <Button onClick={handleNext} disabled={!config.file} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Configure Quiz Generation</CardTitle>
              <CardDescription>
                Set up how many quizzes and questions to generate from your manual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="manualName">Quiz Set Name</Label>
                <Input
                  id="manualName"
                  value={config.manualName}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, manualName: e.target.value }))
                  }
                  placeholder="e.g., Workplace Safety Guidelines"
                />
                {errors.manualName && (
                  <p className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.manualName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numQuizzes">Number of Quizzes</Label>
                  <Input
                    id="numQuizzes"
                    type="number"
                    min={1}
                    max={4}
                    value={config.numQuizzes}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        numQuizzes: parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Min: 1, Max: 4</p>
                  {errors.numQuizzes && (
                    <p className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.numQuizzes}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionsPerQuiz">Questions per Quiz</Label>
                  <Input
                    id="questionsPerQuiz"
                    type="number"
                    min={5}
                    max={20}
                    value={config.questionsPerQuiz}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        questionsPerQuiz: parseInt(e.target.value) || 5,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Min: 5, Max: 20</p>
                  {errors.questionsPerQuiz && (
                    <p className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.questionsPerQuiz}
                    </p>
                  )}
                </div>
              </div>

              {errors.general && (
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.general}
                </p>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Quizzes
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default UploadWizard;
