import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, BookOpen, Users, BarChart3, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Upload Safety Manuals',
      description: 'Upload PDF manuals and automatically generate interactive quizzes using AI.',
    },
    {
      icon: Users,
      title: 'Manage Your Team',
      description: 'Invite employees, assign roles, and track who has completed their training.',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Monitor quiz scores, completion rates, and identify knowledge gaps.',
    },
    {
      icon: CheckCircle,
      title: 'Ensure Compliance',
      description: 'Keep detailed records of safety training for audits and compliance reporting.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Safety Quiz Manager</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
            ) : (
              <Button onClick={() => navigate('/login')}>Sign In</Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <ShieldCheck className="h-4 w-4" />
          Safety Training Platform
        </div>
        <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
          Turn safety manuals into<br />
          <span className="text-primary">engaging quizzes</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
          Upload your safety documentation, automatically generate interactive quizzes, and track your team's compliance — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="xl" onClick={() => navigate('/login')} className="gap-2">
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button size="xl" variant="outline" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Everything you need</h2>
          <p className="text-muted-foreground">A complete platform for safety training management</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl border bg-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="rounded-2xl bg-primary p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Join safety teams using our platform to keep their workforce trained and compliant.
          </p>
          <Button
            size="xl"
            variant="secondary"
            onClick={() => navigate('/login')}
            className="gap-2"
          >
            Start for Free
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Safety Quiz Manager
          </div>
          <span>© {new Date().getFullYear()} All rights reserved</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
