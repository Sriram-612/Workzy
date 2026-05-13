import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChevronLeft, Edit, ExternalLink, IndianRupee, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { userAPI } from '../services/api';
import type { User } from '../App';

interface ProfileScreenProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

type FullUser = User & {
  bio?: string;
  companyDescription?: string;
  collegeName?: string;
  department?: string;
  portfolio?: string[];
  website?: string;
  createdAt?: string;
  rating?: number;
  totalProjects?: number;
  completionRate?: number;
};

const skillOptions = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
  'HTML/CSS', 'UI/UX Design', 'Graphic Design', 'Figma',
  'Data Science', 'Machine Learning', 'SQL', 'Video Editing', 'Content Writing'
];

export function ProfileScreen({ user, onUpdate }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<FullUser>(user as FullUser);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    bio: '',
    website: '',
    hourlyRate: user.hourlyRate || 0,
    skills: user.skills || [],
    company: user.company || '',
    companyDescription: '',
    collegeName: '',
    department: '',
    portfolioText: '',
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await userAPI.getUserProfile(user.id);
        const loaded = (response.user || user) as FullUser;
        if (cancelled) return;
        setProfile(loaded);
        setFormData({
          name: loaded.name || '',
          email: loaded.email || '',
          bio: loaded.bio || '',
          website: loaded.website || '',
          hourlyRate: loaded.hourlyRate || 0,
          skills: loaded.skills || [],
          company: loaded.company || '',
          companyDescription: loaded.companyDescription || '',
          collegeName: loaded.collegeName || '',
          department: loaded.department || '',
          portfolioText: (loaded.portfolio || []).join('\n'),
        });
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'Could not load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const isFreelancer = String(profile.role || user.role).toLowerCase() === 'freelancer';
  const isClient = String(profile.role || user.role).toLowerCase() === 'client';

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((item) => item !== skill) : [...prev.skills, skill],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const portfolioLinks = formData.portfolioText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
      const response = await userAPI.updateProfile({
        name: formData.name,
        bio: formData.bio,
        website: formData.website,
        hourlyRate: isFreelancer ? Number(formData.hourlyRate || 0) : undefined,
        skills: isFreelancer ? formData.skills : undefined,
        portfolioLinks: isFreelancer ? portfolioLinks : undefined,
        companyName: isClient ? formData.company : undefined,
        companyDescription: isClient ? formData.companyDescription : undefined,
        collegeName: isFreelancer ? formData.collegeName : undefined,
        department: isFreelancer ? formData.department : undefined,
      });
      const updated = response.user as FullUser;
      setProfile(updated);
      onUpdate({
        ...user,
        ...updated,
        role: String(updated.role || user.role).toLowerCase() as User['role'],
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const portfolioLinks = formData.portfolioText
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mr-6">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl text-foreground">Profile</h1>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl">{formData.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 w-full">
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" value={formData.email} disabled />
                        </div>
                        {isClient ? (
                          <>
                            <div>
                              <Label htmlFor="company">Company Name</Label>
                              <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                            </div>
                            <div>
                              <Label htmlFor="website">Website</Label>
                              <Input id="website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                            </div>
                          </>
                        ) : null}
                        {isFreelancer ? (
                          <>
                            <div>
                              <Label htmlFor="college">College</Label>
                              <Input id="college" value={formData.collegeName} onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })} />
                            </div>
                            <div>
                              <Label htmlFor="department">Department</Label>
                              <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                            </div>
                            <div>
                              <Label htmlFor="hourlyRate">Hourly Rate (INR)</Label>
                              <Input id="hourlyRate" type="number" value={formData.hourlyRate || ''} onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })} />
                            </div>
                          </>
                        ) : null}
                      </div>
                    ) : (
                      <div>
                        <h1 className="text-2xl mb-2">{profile.name}</h1>
                        <p className="text-muted-foreground mb-3">{isFreelancer ? 'Student freelancer' : 'Client'}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {isClient && profile.company ? <span>{profile.company}</span> : null}
                          {isFreelancer && profile.collegeName ? <span>{profile.collegeName}</span> : null}
                          {isFreelancer && profile.department ? <span>{profile.department}</span> : null}
                          {isFreelancer && profile.hourlyRate ? (
                            <span className="inline-flex items-center gap-1 text-foreground">
                              <IndianRupee className="w-4 h-4" />
                              {profile.hourlyRate.toLocaleString()}/hr
                            </span>
                          ) : null}
                          {profile.website ? (
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary">
                              <ExternalLink className="w-4 h-4" />
                              Website
                            </a>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={isClient ? formData.companyDescription : formData.bio}
                        onChange={(e) =>
                          isClient
                            ? setFormData({ ...formData, companyDescription: e.target.value })
                            : setFormData({ ...formData, bio: e.target.value })
                        }
                        rows={5}
                        placeholder={isClient ? 'Describe your company' : 'Describe your skills and experience'}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {(isClient ? profile.companyDescription : profile.bio) || 'No profile description provided yet.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing && isFreelancer ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {skillOptions.map((skill) => (
                            <Button
                              key={skill}
                              type="button"
                              variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleSkillToggle(skill)}
                            >
                              {skill}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : formData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                            {isEditing ? <X className="w-3 h-3 ml-1" /> : null}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No skills provided yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing && isFreelancer ? (
                      <Textarea
                        value={formData.portfolioText}
                        onChange={(e) => setFormData({ ...formData, portfolioText: e.target.value })}
                        rows={5}
                        placeholder="Add one real portfolio link per line"
                      />
                    ) : portfolioLinks.length > 0 ? (
                      <div className="space-y-2">
                        {portfolioLinks.map((link) => (
                          <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline break-all">
                            {link}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No portfolio links provided yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Reviews will appear here after completed projects.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
