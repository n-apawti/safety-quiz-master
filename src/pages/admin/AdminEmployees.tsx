import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Loader2, Mail, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface EmployeeRow {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  profiles: {
    display_name: string | null;
    id: string;
  } | null;
}

const roleBadgeVariant: Record<AppRole, 'default' | 'secondary' | 'outline'> = {
  super_admin: 'default',
  company_admin: 'default',
  employee: 'secondary',
};

const AdminEmployees = () => {
  const { company } = useCompany();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('employee');
  const [isInviting, setIsInviting] = useState(false);

  const loadEmployees = async () => {
    if (!company) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles (
            id,
            display_name
          )
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees((data || []) as unknown as EmployeeRow[]);
    } catch (err) {
      console.error('Failed to load employees:', err);
      toast({ title: 'Error', description: 'Failed to load employees', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [company]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setIsInviting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('invite-employee', {
        body: { email: inviteEmail, role: inviteRole, company_id: company.id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res.error) throw res.error;

      toast({ title: 'Invite sent!', description: `${inviteEmail} will receive an invitation email.` });
      setInviteEmail('');
      setIsDialogOpen(false);
      loadEmployees();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to send invite', variant: 'destructive' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveEmployee = async (roleId: string) => {
    if (!confirm('Remove this employee from the company?')) return;
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
      toast({ title: 'Employee removed' });
      loadEmployees();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to remove employee', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage your team members and their roles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="employee@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="company_admin">Company Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={isInviting}>
                  {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Send Invite
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Team Members {!isLoading && <span className="font-normal text-muted-foreground">({employees.length})</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No employees yet. Invite your first team member!</p>
            </div>
          ) : (
            <div className="divide-y">
              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {emp.profiles?.display_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{emp.user_id.slice(0, 8)}…</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={roleBadgeVariant[emp.role]} className="capitalize">
                      {emp.role.replace('_', ' ')}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => handleRemoveEmployee(emp.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEmployees;
