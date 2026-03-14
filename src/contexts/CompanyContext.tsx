import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Company = Database['public']['Tables']['companies']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface CompanyContextType {
  company: Company | null;
  userRole: AppRole | null;
  loading: boolean;
  error: string | null;
}

// Exported so components can do optional useContext(CompanyContext) without throwing
export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  slug: string;
  children: ReactNode;
}

export const CompanyProvider = ({ slug, children }: CompanyProviderProps) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('slug', slug)
          .single();

        if (companyError || !companyData) {
          setError('Company not found');
          setLoading(false);
          return;
        }

        setCompany(companyData);

        // Apply branding color
        if (companyData.primary_color) {
          applyBrandColor(companyData.primary_color);
        }

        // Get user's role in this company
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('company_id', companyData.id)
            .single();

          if (roleData) {
            setUserRole(roleData.role);
          }
        }
      } catch (err) {
        setError('Failed to load company');
      } finally {
        setLoading(false);
      }
    };

    loadCompany();

    // Clean up custom color on unmount
    return () => {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--ring');
    };
  }, [slug]);

  return (
    <CompanyContext.Provider value={{ company, userRole, loading, error }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('useCompany must be used within CompanyProvider');
  return context;
};

/**
 * Convert a hex color to HSL and inject it as CSS variable override.
 * This allows per-company primary color branding.
 */
function applyBrandColor(hex: string) {
  try {
    const hsl = hexToHsl(hex);
    if (hsl) {
      document.documentElement.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      document.documentElement.style.setProperty('--ring', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  } catch {
    // Ignore color parse errors
  }
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
