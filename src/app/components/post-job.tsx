import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ChevronLeft, ArrowRight, DollarSign, Clock, 
  Plus, X, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { jobsAPI } from '../services/api';
import type { User } from '../App';

interface PostJobProps {
  user: User;
}

const skillOptions = [
  // Development
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'HTML/CSS',
  'Vue.js', 'Next.js', 'MongoDB', 'PostgreSQL', 'REST API', 'GraphQL',
  // Design
  'UI/UX Design', 'Figma', 'Adobe XD', 'Graphic Design', 'Logo Design', 'Prototyping',
  // Video Editing
  'Video Editing', 'Adobe Premiere', 'Final Cut Pro', 'After Effects', 'Motion Graphics',
  // AI & Content
  'ChatGPT', 'AI Integration', 'Content Writing', 'Copywriting', 'SEO Writing', 'Technical Writing'
];

const jobCategories = [
  {
    id: 'development',
    title: 'Development',
    description: 'Software and web development projects',
    subcategories: ['Web Development', 'App Development', 'Backend Development', 'Frontend Development', 'Full Stack']
  },
  {
    id: 'design',
    title: 'Design',
    description: 'Visual design and user experience',
    subcategories: ['UI/UX Design', 'Logo Design', 'Brand Identity', 'Graphic Design', 'Prototyping']
  },
  {
    id: 'video-editing',
    title: 'Video Editing',
    description: 'Video production and editing services',
    subcategories: ['Video Editing', 'Motion Graphics', 'Animation', 'YouTube Videos', 'Social Media Videos']
  },
  {
    id: 'ai-content',
    title: 'AI & Content',
    description: 'AI services and content creation',
    subcategories: ['AI Integration', 'Content Writing', 'Copywriting', 'SEO Writing', 'Technical Writing']
  }
];

export function PostJob({ user }: PostJobProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    requirements: '',
    skills: [] as string[],
    budgetType: 'fixed',
    fixedBudget: '',
    hourlyRate: '',
    duration: '',
    experienceLevel: '',
    isUrgent: false,
    attachments: [] as File[]
  });

  const totalSteps = 4;
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

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.title || !formData.category) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.description || !formData.requirements) {
          toast.error('Please provide job description and requirements');
          return false;
        }
        break;
      case 3:
        if (formData.skills.length === 0) {
          toast.error('Please select at least one skill');
          return false;
        }
        break;
      case 4:
        if (formData.budgetType === 'fixed' && !formData.fixedBudget) {
          toast.error('Please enter a fixed budget');
          return false;
        }
        if (formData.budgetType === 'hourly' && !formData.hourlyRate) {
          toast.error('Please enter an hourly rate');
          return false;
        }
        if (!formData.duration || !formData.experienceLevel) {
          toast.error('Please fill in all budget and timeline fields');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const selectedCategory = jobCategories.find(cat => cat.id === formData.category);
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        skills: formData.skills,
        category: selectedCategory?.title || formData.category,
        subcategory: formData.subcategory,
        budgetType: formData.budgetType.toUpperCase() as 'FIXED' | 'HOURLY',
        fixedBudget: formData.budgetType === 'fixed' ? parseFloat(formData.fixedBudget) : undefined,
        hourlyRate: formData.budgetType === 'hourly' ? parseFloat(formData.hourlyRate) : undefined,
        duration: formData.duration,
        experienceLevel: formData.experienceLevel.toUpperCase() as 'ENTRY' | 'INTERMEDIATE' | 'EXPERT',
        isUrgent: formData.isUrgent,
      };

      await jobsAPI.createJob(jobData);
      
      toast.success('Job posted successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Job posting error:', error);
      toast.error(error.message || 'Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl mb-2">Job Title & Category</h2>
              <p className="text-gray-600">Let's start with the basics of your project</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Job Title*</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Build a responsive e-commerce website"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A clear, descriptive title helps attract the right freelancers
                </p>
              </div>

              <div>
                <Label>Choose Category*</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {jobCategories.map((category) => (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.category === category.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                          : 'border-border hover:border-blue-300'
                      }`}
                      onClick={() => setFormData({ ...formData, category: category.id, subcategory: '' })}
                    >
                      <CardContent className="p-4">
                        <h4 className="text-sm font-medium text-foreground mb-1">
                          {category.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories.slice(0, 2).map((sub) => (
                            <Badge key={sub} variant="outline" className="text-xs px-1 py-0">
                              {sub}
                            </Badge>
                          ))}
                          {category.subcategories.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{category.subcategories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {formData.category && (
                <div>
                  <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories
                        .find(cat => cat.id === formData.category)
                        ?.subcategories.map(subcategory => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Help freelancers find your specific type of project
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl mb-2">Project Description</h2>
              <p className="text-gray-600">Describe what you need and your requirements</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Project Description*</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project in detail. What are you trying to accomplish? What does success look like?"
                  rows={5}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 50 characters. Be specific about what you want.
                </p>
              </div>

              <div>
                <Label htmlFor="requirements">Requirements & Qualifications*</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="What skills, experience, or qualifications should applicants have? Any specific tools or technologies?"
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl mb-2">Required Skills</h2>
              <p className="text-gray-600">Add skills to help freelancers find your project</p>
            </div>

            <div>
              <Label>Select Skills (up to 10)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
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
            <div className="text-center mb-6">
              <h2 className="text-xl mb-2">Budget & Timeline</h2>
              <p className="text-gray-600">Set your budget and project timeline</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Budget Type</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Button
                    type="button"
                    variant={formData.budgetType === 'fixed' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, budgetType: 'fixed' })}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Fixed Price</span>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.budgetType === 'hourly' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, budgetType: 'hourly' })}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Clock className="w-5 h-5" />
                    <span>Hourly Rate</span>
                  </Button>
                </div>
              </div>

              {formData.budgetType === 'fixed' ? (
                <div>
                  <Label htmlFor="fixedBudget">Fixed Budget (INR)*</Label>
                  <Input
                    id="fixedBudget"
                    type="number"
                    value={formData.fixedBudget}
                    onChange={(e) => setFormData({ ...formData, fixedBudget: e.target.value })}
                    placeholder="5000"
                    className="mt-1"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (INR)*</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="50"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="duration">Project Duration*</Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-week">Less than 1 week</SelectItem>
                    <SelectItem value="1-4-weeks">1-4 weeks</SelectItem>
                    <SelectItem value="1-3-months">1-3 months</SelectItem>
                    <SelectItem value="3-6-months">3-6 months</SelectItem>
                    <SelectItem value="6-months-plus">More than 6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experienceLevel">Experience Level*</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="urgent"
                  checked={formData.isUrgent}
                  onCheckedChange={(checked) => setFormData({ ...formData, isUrgent: checked as boolean })}
                />
                <Label htmlFor="urgent" className="text-sm">
                  This is an urgent project
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `linear-gradient(rgba(249, 250, 251, 0.92), rgba(243, 244, 246, 0.92)), url('https://images.unsplash.com/photo-1704440263700-e63c995b5dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwc3RhcnR1cCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NTg5MDg4MDV8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-6">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl text-gray-900">Post a Job</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="mb-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">
                  Step {step} of {totalSteps}
                </p>
              </div>
              <CardTitle>Post Your Job</CardTitle>
            </CardHeader>

            <CardContent>
              {renderStep()}

              <div className="flex justify-between pt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                >
                  Back
                </Button>

                <Button onClick={handleNext} className="flex items-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Posting Job...
                    </>
                  ) : (
                    <>
                      {step === totalSteps ? 'Post Job' : 'Next'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {step === totalSteps && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Job Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg">{formData.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {formData.category}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {formData.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {formData.skills.slice(0, 5).map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {formData.skills.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{formData.skills.length - 5} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formData.budgetType === 'fixed'
                          ? `₹${formData.fixedBudget}`
                          : `₹${formData.hourlyRate}/hr`
                        }
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formData.duration}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
