import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, Plus, Upload, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../App';
import { userAPI } from '../services/api';

function mapServerUserToClient(u: Record<string, unknown>): User {
  const roleRaw = String(u.role || '').toUpperCase();
  return {
    id: String(u.id),
    name: String(u.name || ''),
    email: String(u.email || ''),
    role: roleRaw === 'CLIENT' ? 'client' : 'freelancer',
    isProfileComplete: Boolean(u.isProfileComplete),
    avatar: (u.avatar as string) || undefined,
    skills: Array.isArray(u.skills) ? (u.skills as string[]) : [],
    hourlyRate: typeof u.hourlyRate === 'number' ? u.hourlyRate : undefined,
    company: (u.company as string) || undefined,
    collegeName: (u.collegeName as string) || undefined,
    isCollegeVerified: false,
  };
}

interface ProfileSetupProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

const skillOptions = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
  'Data Science', 'Machine Learning', 'Digital Marketing', 'Content Writing',
  'Video Editing', 'Photography', 'Accounting', 'Legal Consulting',
  'Project Management', 'Business Analysis', 'Cybersecurity', 'DevOps'
];

const experienceLevels = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' }
];

export function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [] as string[],
    hourlyRate: '',
    experience: '',
    portfolio: '',
    company: '',
    industry: '',
    teamSize: '',
    budget: '',
    avatar: '',
    // College verification fields
    collegeName: '',
    collegeEmail: ''
  });

  const totalSteps = user.role === 'freelancer' ? 4 : 2; // Added college verification step for freelancers
  const progress = (step / totalSteps) * 100;

  const handleSkillAdd = (skill: string) => {
    if (!formData.skills.includes(skill) && formData.skills.length < 10) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const handleSkillRemove = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = { name: user.name };

      if (user.role === 'freelancer') {
        const expLabel = experienceLevels.find((x) => x.value === formData.experience)?.label;
        if (formData.collegeName.trim()) payload.collegeName = formData.collegeName.trim();
        if (expLabel) payload.department = expLabel;

        let bio = (formData.bio || '').trim();
        if (formData.collegeEmail.trim()) {
          const line = `College email (pending verification): ${formData.collegeEmail.trim()}`;
          bio = bio ? `${bio}\n\n${line}` : line;
        }
        if (bio) payload.bio = bio;
        if (formData.skills.length > 0) payload.skills = formData.skills;

        const rate = parseFloat(formData.hourlyRate);
        if (!Number.isNaN(rate) && rate > 0) payload.hourlyRate = rate;

        const portfolioUrl = formData.portfolio.trim();
        if (portfolioUrl) payload.portfolioLinks = [portfolioUrl];

        const avatarUrl = formData.avatar.trim();
        if (avatarUrl) payload.avatar = avatarUrl;
      } else {
        if (formData.company.trim()) payload.company = formData.company.trim();
        const parts = [
          (formData.bio || '').trim(),
          formData.industry && `Industry: ${formData.industry}`,
          formData.teamSize && `Team size: ${formData.teamSize}`,
          formData.budget && `Typical project budget: ${formData.budget}`,
        ].filter(Boolean) as string[];
        if (parts.length > 0) payload.bio = parts.join('\n\n');
      }

      const response = await userAPI.updateProfile(payload);
      if (!response.user) {
        throw new Error('Profile could not be saved');
      }

      const updatedUser = mapServerUserToClient(response.user as Record<string, unknown>);
      toast.success(
        user.role === 'freelancer'
          ? 'Profile setup completed! Check your college email to verify your account.'
          : 'Profile setup completed!'
      );
      onComplete(updatedUser);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not save profile. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFreelancerStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl mb-2">Verify Your College</h2>
              <p className="text-gray-600">This helps build trust with clients</p>
              <Badge variant="secondary" className="mt-2">✓ Verification helps clients trust your profile</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="collegeName">College/University Name</Label>
                <Input
                  id="collegeName"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  placeholder="Your college or university"
                />
              </div>

              <div>
                <Label htmlFor="collegeEmail">College Email Address</Label>
                <Input
                  id="collegeEmail"
                  type="email"
                  value={formData.collegeEmail}
                  onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
                  placeholder="yourname@college.edu"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll send a verification link to confirm you're a student
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Why verify? Verification helps clients confirm your student status before hiring.
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">Help clients understand who you are</p>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback className="text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your experience, expertise, and what makes you unique..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl mb-2">Your skills & expertise</h2>
              <p className="text-gray-600">Add up to 10 skills to showcase your abilities</p>
            </div>

            <div>
              <Label>Select Skills</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {skillOptions.map(skill => (
                  <Button
                    key={skill}
                    type="button"
                    variant={formData.skills.includes(skill) ? "default" : "outline"}
                    size="sm"
                    onClick={() => formData.skills.includes(skill) ? handleSkillRemove(skill) : handleSkillAdd(skill)}
                    className="justify-start text-left h-auto py-2"
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            {formData.skills.length > 0 && (
              <div>
                <Label>Selected Skills ({formData.skills.length}/10)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        onClick={() => handleSkillRemove(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl mb-2">Set your rates & portfolio</h2>
              <p className="text-gray-600">Help clients understand your pricing and see your work</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  placeholder="25"
                  min="5"
                  max="500"
                />
              </div>

              <div>
                <Label htmlFor="portfolio">Portfolio Website (Optional)</Label>
                <Input
                  id="portfolio"
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderClientStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl mb-2">Tell us about your business</h2>
              <p className="text-gray-600">Help freelancers understand your needs</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company name"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="nonprofit">Non-profit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <Select value={formData.teamSize} onValueChange={(value) => setFormData({ ...formData, teamSize: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl mb-2">Project preferences</h2>
              <p className="text-gray-600">Set your typical project budget range</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="budget">Typical Project Budget (INR)</Label>
                <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                    <SelectItem value="10000-50000">₹10,000 - ₹50,000</SelectItem>
                    <SelectItem value="50000-100000">₹50,000 - ₹1,00,000</SelectItem>
                    <SelectItem value="100000+">₹1,00,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bio">Company Description</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell freelancers about your company and the types of projects you typically work on..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600 mt-2">
                Step {step} of {totalSteps}
              </p>
            </div>
            <CardTitle>Complete Your Profile</CardTitle>
          </CardHeader>

          <CardContent>
            {user.role === 'freelancer' ? renderFreelancerStep() : renderClientStep()}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1 || isSubmitting}
              >
                Back
              </Button>

              <Button
                onClick={() => void handleNext()}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {step === totalSteps ? 'Complete Setup' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
