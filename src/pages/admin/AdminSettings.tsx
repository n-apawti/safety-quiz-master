import { useState } from 'react';
import { Loader2, Save, Upload, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#dc2626',
  '#ea580c', '#d97706', '#16a34a', '#0891b2',
  '#0f172a', '#374151',
];

const AdminSettings = () => {
  const { company } = useCompany();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(company?.name || '');
  const [primaryColor, setPrimaryColor] = useState(company?.primary_color || '#2563eb');
  const [logoUrl, setLogoUrl] = useState(company?.logo_url || '');
  const [bannerUrl, setBannerUrl] = useState(company?.banner_url || '');

  const handleSave = async () => {
    if (!company) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ name, primary_color: primaryColor, logo_url: logoUrl || null, banner_url: bannerUrl || null })
        .eq('id', company.id);

      if (error) throw error;

      toast({ title: 'Settings saved', description: 'Company branding has been updated.' });

      // Apply color live
      const hsl = hexToHsl(primaryColor);
      if (hsl) {
        document.documentElement.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        document.documentElement.style.setProperty('--ring', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your company branding and details</p>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Basic company information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corp"
            />
          </div>
          <div className="space-y-2">
            <Label>URL Slug</Label>
            <Input value={company?.slug || ''} disabled className="font-mono opacity-60" />
            <p className="text-xs text-muted-foreground">Slug cannot be changed after creation</p>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </CardTitle>
          <CardDescription>Customize colors and images for your portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color picker */}
          <div className="space-y-3">
            <Label>Primary Brand Color</Label>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border-2 border-border shadow-inner"
                style={{ backgroundColor: primaryColor }}
              />
              <Input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#2563eb"
                className="font-mono w-32"
                maxLength={7}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setPrimaryColor(color)}
                  className="w-7 h-7 rounded-md border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: primaryColor === color ? 'hsl(var(--foreground))' : 'transparent',
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input
              id="logo-url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo preview"
                className="h-12 object-contain rounded border bg-muted p-1"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>

          {/* Banner URL */}
          <div className="space-y-2">
            <Label htmlFor="banner-url">Banner Image URL</Label>
            <Input
              id="banner-url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
            />
            {bannerUrl && (
              <div
                className="h-24 w-full rounded-lg border bg-cover bg-center"
                style={{ backgroundImage: `url(${bannerUrl})` }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </Button>
    </div>
  );
};

// Hex to HSL helper (same as CompanyContext)
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default AdminSettings;
