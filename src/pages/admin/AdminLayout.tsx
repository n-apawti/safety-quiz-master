import { useNavigate, useParams, Outlet, NavLink } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Users, BookOpen, FileText, LogOut, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { cn } from '@/lib/utils';

const AdminLayout = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { company } = useCompany();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: `/${companySlug}/admin`, icon: LayoutDashboard, label: 'Overview', end: true },
    { to: `/${companySlug}/admin/employees`, icon: Users, label: 'Employees' },
    { to: `/${companySlug}/admin/materials`, icon: BookOpen, label: 'Materials' },
    { to: `/${companySlug}/admin/quizzes`, icon: FileText, label: 'Quizzes' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex-shrink-0 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="h-8 w-auto object-contain" />
            ) : (
              <div className="p-1.5 rounded-lg bg-primary">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <div>
              <p className="font-semibold text-sm text-foreground">{company?.name || companySlug}</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Breadcrumb bar */}
        <div className="border-b bg-card/50 px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{company?.name || companySlug}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Admin</span>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
