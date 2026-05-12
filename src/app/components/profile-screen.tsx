import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ChevronLeft, Edit, Upload, Plus, X, Star, 
  MapPin, Calendar, Award, ExternalLink
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { User } from '../App';

interface ProfileScreenProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const skillOptions = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
  'HTML/CSS', 'Vue.js', 'Angular', 'PHP', 'WordPress',
  'UI/UX Design', 'Graphic Design', 'Figma', 'Adobe Creative Suite',
  'Data Science', 'Machine Learning', 'SQL', 'MongoDB'
];

export function ProfileScreen({ user, onUpdate }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    bio: 'Passionate developer with 5+ years of experience building scalable web applications. I specialize in React, Node.js, and modern web technologies.',
    location: 'San Francisco, CA',
    website: 'https://portfolio.com',
    hourlyRate: user.hourlyRate || 50,
    skills: user.skills || ['React', 'Node.js', 'TypeScript'],
    experience: 'intermediate',
    portfolio: [
      {
        id: '1',
        title: 'E-commerce Platform',
        description: 'Built a full-featured e-commerce platform with React and Node.js',
        image: 'https://images.unsplash.com/photo-1755352425808-b8223a330f15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVlbGFuY2UlMjB3b3Jrc3BhY2UlMjBsYXB0b3B8ZW58MXx8fHwxNzU4MzgxNzY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        url: 'https://example.com'
      },
      {
        id: '2',
        title: 'Task Management App',
        description: 'Collaborative task management application with real-time updates',
        image: 'https://images.unsplash.com/photo-1739298061757-7a3339cee982?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHRlYW18ZW58MXx8fHwxNzU4MzczODI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        url: 'https://example.com'
      }
    ]
  });

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

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      name: formData.name,
      email: formData.email,
      skills: formData.skills,
      hourlyRate: formData.hourlyRate
    };

    onUpdate(updatedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const stats = {
    jobsCompleted: user.role === 'freelancer' ? 23 : 12,
    rating: 4.9,
    reviews: 45,
    responseTime: '1 hour',
    memberSince: 'March 2023'
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1670851050245-d861fd433d06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NTg0NDYwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
          alt="Professional collaboration"
          className="w-full h-full object-cover opacity-5 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/50 dark:to-purple-950/50"></div>
      </div>
      {/* Header */}
      <header className="relative z-10 bg-card/80 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mr-6">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl text-foreground">Profile</h1>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">
                      {formData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="City, Country"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://your-website.com"
                          />
                        </div>
                      </div>

                      {user.role === 'freelancer' && (
                        <div>
                          <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl mb-2">{formData.name}</h1>
                      <p className="text-gray-600 mb-3">
                        {user.role === 'freelancer' ? 'Freelancer' : 'Client'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {formData.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Member since {stats.memberSince}
                        </div>
                        {formData.website && (
                          <a href={formData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                            <ExternalLink className="w-4 h-4" />
                            Website
                          </a>
                        )}
                      </div>

                      {user.role === 'freelancer' && (
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{stats.rating} ({stats.reviews} reviews)</span>
                          </div>
                          <div className="text-lg">
                            <span className="text-gray-900">${formData.hourlyRate}</span>
                            <span className="text-gray-600">/hr</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl">{stats.jobsCompleted}</div>
                        <div className="text-xs text-gray-600">
                          {user.role === 'freelancer' ? 'Jobs Completed' : 'Jobs Posted'}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl text-green-600">${(stats.jobsCompleted * 1200).toLocaleString()}</div>
                        <div className="text-xs text-gray-600">
                          {user.role === 'freelancer' ? 'Total Earned' : 'Total Spent'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
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
                    <div>
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={5}
                        className="mt-1"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Add Skills</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
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
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map(skill => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Portfolio</CardTitle>
                    {isEditing && (
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.portfolio.map(project => (
                      <div key={project.id} className="border rounded-lg overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="mb-2">{project.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Project
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews & Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[1, 2, 3].map(review => (
                      <div key={review} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm">John Doe</h4>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">2 weeks ago</span>
                            </div>
                            <p className="text-sm text-gray-700">
                              Excellent work on the React project. Delivered on time and exceeded expectations. 
                              Great communication throughout the project.
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}