import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  ChevronLeft, Star, MapPin, Clock, DollarSign, 
  Heart, Flag, Share2, Send, Calendar, Briefcase,
  CheckCircle, Users
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { User } from '../App';

interface JobDetailsProps {
  user: User;
}

// Mock job data
const jobData = {
  id: '1',
  title: 'Full Stack React Developer Needed',
  description: `We are looking for an experienced Full Stack React Developer to build a modern e-commerce platform. This project involves creating a responsive web application with a clean, intuitive user interface and robust backend functionality.

Key features to implement:
- User authentication and authorization
- Product catalog with search and filtering
- Shopping cart and checkout process
- Payment integration (Stripe/PayPal)
- Admin dashboard for inventory management
- Order tracking and history
- Email notifications
- Mobile-responsive design

The ideal candidate should have:
- 3+ years of experience with React and Node.js
- Strong knowledge of TypeScript
- Experience with PostgreSQL or similar databases
- Familiarity with AWS or other cloud platforms
- Understanding of e-commerce best practices
- Excellent communication skills

This is a great opportunity to work on a challenging project with a growing startup. We value clean code, attention to detail, and timely communication.`,
  client: {
    name: 'TechStart Inc.',
    avatar: '',
    rating: 4.8,
    reviewsCount: 24,
    location: 'San Francisco, CA',
    memberSince: 'March 2023',
    jobsPosted: 12,
    hireRate: 89,
    isVerified: true
  },
  budget: {
    type: 'fixed',
    amount: 5000,
    display: '$5,000'
  },
  duration: '2-3 months',
  experienceLevel: 'Intermediate',
  postedAt: '2 hours ago',
  proposals: 8,
  skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
  category: 'Web Development',
  isUrgent: false,
  isFeatured: true,
  attachments: [
    { name: 'requirements.pdf', size: '2.4 MB' },
    { name: 'wireframes.fig', size: '1.8 MB' }
  ]
};

export function JobDetails({ user }: JobDetailsProps) {
  const { id } = useParams();
  const [proposal, setProposal] = useState({
    coverLetter: '',
    proposedBudget: '',
    timeline: '',
    attachments: [] as File[]
  });
  const [isApplying, setIsApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleApply = () => {
    if (!proposal.coverLetter || !proposal.proposedBudget || !proposal.timeline) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Mock application submission
    toast.success('Proposal submitted successfully!');
    setIsApplying(false);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Job removed from saved list' : 'Job saved for later');
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1716703432455-3045789de738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1ODUyNzUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
          alt="Business meeting technology"
          className="w-full h-full object-cover opacity-5 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-950/50 dark:to-blue-950/50"></div>
      </div>
      {/* Header */}
      <header className="relative z-10 bg-card/80 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/browse-jobs" className="flex items-center text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Jobs
            </Link>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {jobData.isFeatured && (
                          <Badge variant="default" className="text-xs">
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {jobData.category}
                        </Badge>
                      </div>
                      
                      <h1 className="text-2xl mb-2">{jobData.title}</h1>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Posted {jobData.postedAt}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {jobData.client.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {jobData.proposals} proposals
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-lg">{jobData.budget.display}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {jobData.duration}
                        </div>
                        <Badge variant="secondary">
                          {jobData.experienceLevel} Level
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {jobData.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Job Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {jobData.description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {jobData.attachments.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="mb-3">Attachments</h4>
                      <div className="space-y-2">
                        {jobData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Apply Section */}
            {user.role === 'freelancer' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Submit a Proposal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!isApplying ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                          Ready to apply for this project? Submit your best proposal to stand out.
                        </p>
                        <Button onClick={() => setIsApplying(true)} size="lg">
                          Apply Now
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="coverLetter">Cover Letter*</Label>
                          <Textarea
                            id="coverLetter"
                            value={proposal.coverLetter}
                            onChange={(e) => setProposal({ ...proposal, coverLetter: e.target.value })}
                            placeholder="Introduce yourself and explain why you're the best fit for this project..."
                            rows={6}
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="budget">Your Bid (USD)*</Label>
                            <Input
                              id="budget"
                              type="number"
                              value={proposal.proposedBudget}
                              onChange={(e) => setProposal({ ...proposal, proposedBudget: e.target.value })}
                              placeholder="5000"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="timeline">Timeline*</Label>
                            <Input
                              id="timeline"
                              value={proposal.timeline}
                              onChange={(e) => setProposal({ ...proposal, timeline: e.target.value })}
                              placeholder="e.g., 8 weeks"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button onClick={handleApply} className="flex-1">
                            <Send className="w-4 h-4 mr-2" />
                            Send Proposal
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsApplying(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={jobData.client.avatar} />
                        <AvatarFallback>
                          {jobData.client.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{jobData.client.name}</h3>
                          {jobData.client.isVerified && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {jobData.client.rating} ({jobData.client.reviewsCount} reviews)
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member since</span>
                        <span>{jobData.client.memberSince}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jobs posted</span>
                        <span>{jobData.client.jobsPosted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hire rate</span>
                        <span>{jobData.client.hireRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location</span>
                        <span>{jobData.client.location}</span>
                      </div>
                    </div>

                    {user.role === 'freelancer' && (
                      <Button variant="outline" className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Project Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget</span>
                      <span className="text-green-600">{jobData.budget.display}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span>{jobData.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience</span>
                      <span>{jobData.experienceLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Proposals</span>
                      <span>{jobData.proposals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category</span>
                      <span>{jobData.category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Related Jobs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2].map((item) => (
                      <div key={item} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <h4 className="text-sm mb-1">React Frontend Developer</h4>
                        <p className="text-xs text-gray-600 mb-2">$3,000 - $4,000</p>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">React</Badge>
                          <Badge variant="outline" className="text-xs">CSS</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}