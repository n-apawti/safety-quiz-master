import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Users, Loader2, ShieldCheck, LogOut,
  ChevronRight, Palette, Edit2, Check, X, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Company = Database['public']['Tables']['companies']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface CompanyWithStats extends Company {
  employeeCount: number;
}

interface AdminCandidate {
  user_id: string;
  display_name: string | null;
  email?: string;
}

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#dc2626',
  '#ea580c', '#16a34a', '#0891b2', '#0f172a',
];

const SuperAdmin = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create company modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newColor, setNewColor] = useState('#2563eb');
  const [isCreating, setIsCreating] = useState(false);

  // Assign admin modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [admins, setAdmins] = useState<AdminCandidate[]>([]);
  const [assignEmail, setAssignEmail] = useState('');
  const [assignRole, setAssignRole] = useState<AppRole>('company_admin');
  const [isAssigning, setIsAssigning] = useState(false);
  const [companyAdmins, setCompanyAdmins] = useState<{ user_id: string; role: AppRole; display_name: string | null }[]>([]);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      // Get employee counts
      const withStats = await Promise.all((data || []).map(async (c) => {
        const { count } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', c.id);
        return { ...c, employeeCount: count || 0 };
      }));
      setCompanies(withStats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCompanies(); }, []);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setNewName(name);
    setNewSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { error } = await supabase.from('companies').insert({
        name: newName,
        slug: newSlug,
        primary_color: newColor,
      });
      if (error) throw error;
      toast({ title: 'Company created!', description: `/${newSlug} is ready.` });
      setCreateOpen(false);
      setNewName(''); setNewSlug(''); setNewColor('#2563eb');
      loadCompanies();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const openAssignModal = async (company: Company) => {
    setSelectedCompany(company);
    setAssignOpen(true);
    // Load current admins for this company
    const { data } = await supabase
      .from('user_roles')
      .select('user_id, role, profiles(display_name)')
      .eq('company_id', company.id)
      .in('role', ['company_admin', 'employee']);
    setCompanyAdmins(
      (data || []).map((r: any) => ({
        user_id: r.user_id,
        role: r.role,
        display_name: r.profiles?.display_name || null,
      }))
    );
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setIsAssigning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('invite-employee', {
        body: { email: assignEmail, role: assignRole, company_id: selectedCompany.id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      toast({ title: 'Invite sent!', description: `${assignEmail} invited as ${assignRole.replace('_', ' ')}.` });
      setAssignEmail('');
      openAssignModal(selectedCompany); // Refresh list
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed', variant: 'destructive' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveRole = async (userId: string, companyId: string) => {
    if (!confirm('Remove this person from the company?')) return;
    await supabase.from('user_roles').delete().eq('user_id', userId).eq('company_id', companyId);
    if (selectedCompany) openAssignModal(selectedCompany);
  };

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Super Admin</h1>
              <p className="text-xs text-muted-foreground">Platform Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Badge variant="default" className="text-xs">Super Admin</Badge>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* Page title + create button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Companies</h2>
            <p className="text-muted-foreground mt-1">Create and manage all companies on the platform</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Company</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCompany} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    placeholder="Acme Corp"
                    value={newName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">site.com/</span>
                    <Input
                      placeholder="acme-corp"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      required
                      className="font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Employees will sign up at /{newSlug}</p>
                </div>
                <div className="space-y-3">
                  <Label>Brand Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg border" style={{ backgroundColor: newColor }} />
                    <Input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-14 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="font-mono w-28"
                      maxLength={7}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        className="w-7 h-7 rounded-md border-2 transition-all hover:scale-110"
                        style={{ backgroundColor: c, borderColor: newColor === c ? 'hsl(var(--foreground))' : 'transparent' }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={isCreating}>
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Company'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Companies grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : companies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No companies yet</h3>
              <p className="text-muted-foreground mb-6">Create your first company to get started.</p>
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create Company
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Card key={company.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: company.primary_color || '#2563eb' }}
                      >
                        {company.name[0].toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base">{company.name}</CardTitle>
                        <code className="text-xs text-muted-foreground">/{company.slug}</code>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7"
                        onClick={() => window.open(`/${company.slug}`, '_blank')}
                        title="Open company portal"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{company.employeeCount} members</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline" size="sm" className="flex-1 gap-2"
                      onClick={() => openAssignModal(company)}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Manage Users
                    </Button>
                    <Button
                      variant="outline" size="sm" className="flex-1 gap-2"
                      onClick={() => navigate(`/${company.slug}/admin`)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                      Admin Panel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Assign Users Modal */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Users — {selectedCompany?.name}</DialogTitle>
          </DialogHeader>

          {/* Invite form */}
          <form onSubmit={handleAssignAdmin} className="space-y-3 border-b pb-4">
            <p className="text-sm font-medium text-foreground">Invite or assign a user</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="user@company.com"
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Select value={assignRole} onValueChange={(v) => setAssignRole(v as AppRole)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="company_admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={isAssigning}>
              {isAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isAssigning ? 'Sending…' : 'Send Invite'}
            </Button>
          </form>

          {/* Current members */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-sm font-medium text-foreground">Current members ({companyAdmins.length})</p>
            {companyAdmins.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No members yet</p>
            ) : (
              <div className="divide-y">
                {companyAdmins.map((a) => (
                  <div key={a.user_id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.display_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{a.user_id.slice(0, 8)}…</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.role === 'company_admin' ? 'default' : 'secondary'} className="text-xs capitalize">
                        {a.role.replace('_', ' ')}
                      </Badge>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveRole(a.user_id, selectedCompany!.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdmin;
