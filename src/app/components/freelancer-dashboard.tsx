import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Bell, MessageSquare, Briefcase, IndianRupee, 
  TrendingUp, Clock, Star, Users, Menu, LogOut,
  ChevronRight, Calendar, Award, FileText, Shield, DollarSign,
  Heart, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '../App';
import { jobsAPI } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ThemeToggle } from './theme-toggle';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FreelancerDashboardProps {
  user: User;
  onLogout: () => void;
}

const recentJobs: any[] = [];

const recentProposals: any[] = [];

export function FreelancerDashboard({ user, onLogout }: FreelancerDashboardProps) {
  const [savedJobsList, setSavedJobsList] = useState<{ id: string; title?: string; category?: string }[]>([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(false);
  const profileSteps = [
    { label: 'Basic info added', complete: Boolean(user.name && user.email) },
    { label: 'Skills listed', complete: Boolean(user.skills?.length) },
    { label: 'Hourly rate added', complete: Boolean(user.hourlyRate) },
    { label: 'Profile photo uploaded', complete: Boolean(user.avatar) },
  ];
  const profileStrength = Math.round((profileSteps.filter((step) => step.complete).length / profileSteps.length) * 100);

  useEffect(() => {
    if (user.role !== 'freelancer') return;
    (async () => {
      setSavedJobsLoading(true);
      try {
        const res = (await jobsAPI.getSavedJobs()) as { jobs?: { id: string; title?: string; category?: string }[] };
        setSavedJobsList(res.jobs || []);
      } catch {
        setSavedJobsList([]);
      } finally {
        setSavedJobsLoading(false);
      }
    })();
  }, [user.role, user.id]);

  const stats = {
    earnings: '₹0',
    activeJobs: 0,
    completedJobs: 0,
    rating: 0
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1566915896913-549d796d2166?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBkZXZlbG9wZXIlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzU4ODc4OTE5fDA&ixlib=rb-4.1.0&q=80&w=1080" 
          alt="Developer coding workspace"
          className="w-full h-full object-cover opacity-8 dark:opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 dark:from-blue-950/60 dark:to-indigo-950/60"></div>
        <div className="absolute inset-0 backdrop-blur-[0.5px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-card/80 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl text-primary mr-8">Workzy</h1>
              <nav className="hidden md:flex space-x-8">
                <Link to="/dashboard" className="text-foreground hover:text-primary">
                  Dashboard
                </Link>
                <Link to="/browse-jobs" className="text-muted-foreground hover:text-primary">
                  Browse Jobs
                </Link>
                <Link to="/messages" className="text-muted-foreground hover:text-primary">
                  Messages
                </Link>
                <Link to="/profile" className="text-muted-foreground hover:text-primary">
                  Portfolio
                </Link>
                <Link to="/payments" className="text-muted-foreground hover:text-primary">
                  Payments
                </Link>
                <Link to="/notifications" className="text-muted-foreground hover:text-primary">
                  Notifications
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/notifications" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                </Link>
              </Button>

              <Link to="/profile">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>

              <ThemeToggle />

              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-foreground mb-2">
                Ready to earn, {user.name}?
              </h1>
              <p className="text-muted-foreground">Discover new opportunities and grow your freelancing career.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/browse-jobs">
                <Button className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Browse Jobs
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Update Profile
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl text-foreground">{stats.earnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl text-foreground">{stats.activeJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl text-foreground">{stats.completedJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl text-foreground">{stats.rating}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mb-8"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Saved jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedJobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : savedJobsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No saved jobs yet. Use &quot;Save for later&quot; on a job while browsing or on the job page.
                </p>
              ) : (
                <ul className="space-y-2">
                  {savedJobsList.map((j) => (
                    <li key={j.id}>
                      <Link
                        to={`/job/${j.id}`}
                        className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 hover:bg-muted text-sm"
                      >
                        <span className="font-medium text-foreground truncate">{j.title || 'Job'}</span>
                        {j.category ? (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {j.category}
                          </Badge>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommended Jobs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Browse Live Jobs
                  <Link to="/browse-jobs" className="text-sm text-primary hover:underline">
                    Browse all jobs
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="mb-2 text-foreground">No recommended jobs yet</p>
                  <p className="text-sm mb-4">Workzy will only show jobs posted by real clients.</p>
                  <Link to="/browse-jobs">
                    <Button variant="outline" className="flex items-center gap-2 mx-auto">
                      <Search className="w-4 h-4" />
                      Browse Live Jobs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your Active Projects
                  <Link to="/agreements" className="text-sm text-primary hover:underline">
                    View contracts
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.length > 0 ? (
                    recentJobs.map(job => (
                      <div key={job.id} className="p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm text-foreground mb-1">{job.title}</h4>
                            <p className="text-xs text-muted-foreground">Client: {job.client}</p>
                          </div>
                          <Badge variant={job.status === 'in-progress' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {job.budget}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {job.deadline}
                          </span>
                        </div>

                        {job.status === 'in-progress' && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-foreground">Progress</span>
                              <span className="text-foreground">{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="mb-2 text-foreground">No active projects yet</p>
                      <p className="text-sm">Apply to jobs to get your first project!</p>
                      <Link to="/browse-jobs" className="inline-block mt-3">
                        <Button size="sm">Browse Available Jobs</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar: Performance & Profile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Profile Completion */}
            <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Complete Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-foreground">Profile Strength</span>
                    <span className="text-foreground">{profileStrength}%</span>
                  </div>
                  <Progress value={profileStrength} className="h-2" />
                  <div className="space-y-2 text-xs">
                    {profileSteps.map((step) => (
                      <div key={step.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${step.complete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-muted-foreground">{step.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/profile" className="block mt-3">
                    <Button size="sm" className="w-full">Complete Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Proposal Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  Recent Proposals
                  <Link to="/browse-jobs" className="text-xs text-primary hover:underline">
                    Submit new
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProposals.length > 0 ? (
                    recentProposals.map(proposal => (
                      <div key={proposal.id} className="p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-xs text-foreground mb-1">{proposal.title}</h4>
                            <p className="text-xs text-muted-foreground">Submitted: {proposal.submittedAt}</p>
                          </div>
                          <Badge variant={proposal.status === 'accepted' ? 'default' : 'secondary'} className="text-xs">
                            {proposal.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {proposal.budget}
                          </span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="mb-1 text-xs text-foreground">No proposals yet</p>
                      <p className="text-xs">Submit your first proposal!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Build Trust */}
            <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Build Your Trust Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    {user.isCollegeVerified
                      ? "Complete your first project to unlock more profile signals"
                      : "Verify your college email to show clients your student status"}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={user.isCollegeVerified ? "text-green-600" : "text-muted-foreground"}>
                        {user.isCollegeVerified ? "✓" : "○"}
                      </span>
                      <span className="text-foreground">College Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={(user.totalProjects || 0) > 0 ? "text-green-600" : "text-muted-foreground"}>
                        {(user.totalProjects || 0) > 0 ? "✓" : "○"}
                      </span>
                      <span className="text-foreground">First Project Done</span>
                    </div>
                  </div>
                  <Link to={user.isCollegeVerified ? "/browse-jobs" : "/settings"} className="block">
                    <Button size="sm" variant="outline" className="w-full">
                      {user.isCollegeVerified ? "Find Jobs" : "Verify Now"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proposals sent</span>
                    <span className="text-foreground">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response rate</span>
                    <span className="text-foreground">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profile views</span>
                    <span className="text-foreground">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>



        {/* Trust & Performance Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-foreground">✓ Build Your Trust Profile</h2>
            <Link to="/profile" className="text-sm text-primary hover:underline">
              Improve your profile
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verification Status */}
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-foreground">Verification Status</h3>
                  </div>
                  <Badge variant={user.isCollegeVerified ? "default" : "secondary"}>
                    {user.isCollegeVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">College Email</span>
                    <span className="text-sm text-foreground">
                      {user.isCollegeVerified ? "✓ Verified" : "❌ Not verified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Portfolio</span>
                    <span className="text-sm text-foreground">
                      {user.isPortfolioVerified ? "✓ Verified" : "❌ Not verified"}
                    </span>
                  </div>
                  {user.collegeName && (
                    <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        🎓 {user.collegeName}
                      </p>
                    </div>
                  )}
                  {!user.isCollegeVerified && (
                    <Link to="/settings">
                      <Button size="sm" className="w-full mt-2" variant="outline">
                        Verify Now
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-foreground">Performance Metrics</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Response Rate</span>
                      <span className="text-sm font-medium text-foreground">
                        {user.responseRate || 0}%
                      </span>
                    </div>
                    <Progress value={user.responseRate || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="text-sm font-medium text-foreground">
                        {user.completionRate || 0}%
                      </span>
                    </div>
                    <Progress value={user.completionRate || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">On-Time Delivery</span>
                      <span className="text-sm font-medium text-foreground">
                        {user.onTimeDeliveryRate || 0}%
                      </span>
                    </div>
                    <Progress value={user.onTimeDeliveryRate || 0} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Projects</span>
                      <span className="text-lg font-semibold text-foreground">
                        {user.totalProjects || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Building Tips */}
          <Card className="mt-4 border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Why Trust Matters</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Verified student status helps clients evaluate your profile</li>
                    <li>• Higher response rates lead to better client relationships</li>
                    <li>• Complete your first 3 projects to unlock premium features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
