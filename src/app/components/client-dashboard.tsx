import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ThemeToggle } from './theme-toggle';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Plus, Bell, MessageSquare, Briefcase, IndianRupee, 
  Users, Clock, Star, Search, Menu, LogOut,
  Calendar, TrendingUp, DollarSign,
  FileText, Shield, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobsAPI, projectsAPI, notificationsAPI } from '../services/api';
import { toast } from 'sonner';
import type { User } from '../App';

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
}

export function ClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    amountDue: '₹0',
    activeProjects: 0,
    completedProjects: 0,
    savedFreelancers: 0
  });
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [topFreelancers, setTopFreelancers] = useState<any[]>([]);

  const getProjectFreelancerName = (project: any) =>
    project.freelancerName ||
    project.freelancer ||
    project.freelancer_name ||
    'Assigned freelancer';

  const getProjectBudget = (project: any) => {
    if (project.budget) return `₹${project.budget}`;
    if (project.fixedBudget) return `₹${project.fixedBudget}`;
    if (project.fixed_budget) return `₹${project.fixed_budget}`;
    return 'Budget pending';
  };

  const getProjectDeadline = (project: any) => {
    const rawDate = project.deadline || project.dueDate || project.due_date || project.created_at;
    if (!rawDate) return 'No deadline';

    const date = new Date(rawDate);
    return Number.isNaN(date.getTime()) ? String(rawDate) : date.toLocaleDateString();
  };

  const getProjectProgress = (project: any) => {
    const progress = Number(project.progress ?? 0);
    return Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 100) : 0;
  };

  const getProjectStatus = (project: any) => String(project.status || 'Pending');

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load posted jobs
        const jobsResponse = await jobsAPI.getUserPostedJobs();
        setPostedJobs(jobsResponse.jobs || []);

        // Load projects
        const projectsResponse = await projectsAPI.getUserProjects();
        setActiveProjects(projectsResponse.projects || []);

        // Load project stats
        const statsResponse = await projectsAPI.getProjectStats();
        const statsData = statsResponse.stats || {};
        const projectsList = projectsResponse.projects || [];
        const uniqueHired = statsData.hiredFreelancers ?? new Set(projectsList.map((p: any) => p.freelancer_id || p.freelancerId).filter(Boolean)).size;

        setStats({
          amountDue: `₹${Number(statsData.totalInvested ?? statsData.totalEarnings ?? 0).toLocaleString('en-IN')}`,
          activeProjects: Number(statsData.activeProjects || 0),
          completedProjects: Number(statsData.completedProjects || 0),
          savedFreelancers: uniqueHired
        });

        // Load notifications
        const notificationsResponse = await notificationsAPI.getNotifications(1, 5);
        setNotifications(notificationsResponse.notifications || []);

      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        // Don't show error toast for 401 errors (user not authenticated)
        if (error.message && !error.message.includes('401')) {
          toast.error('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1642522029691-029b5a432954?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU4OTA4NTAwfDA&ixlib=rb-4.1.0&q=80&w=1080" 
          alt="Professional business meeting environment"
          className="w-full h-full object-cover opacity-8 dark:opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 to-emerald-50/60 dark:from-green-950/60 dark:to-emerald-950/60"></div>
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
                <Link to="/search-freelancers" className="text-muted-foreground hover:text-primary">
                  Find Freelancers
                </Link>
                <Link to="/messages" className="text-muted-foreground hover:text-primary">
                  Messages
                </Link>
                <Link to="/agreements" className="text-muted-foreground hover:text-primary">
                  Agreements
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
                  <span className="relative inline-flex">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                    )}
                  </span>
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
                Ready to hire, {user.name}?
              </h1>
              <p className="text-muted-foreground">Find top talent, manage projects, and grow your business with skilled freelancers.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/post-job">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Post New Job
                </Button>
              </Link>
              <Link to="/payments">
                <Button variant="secondary" className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Pay Freelancer
                </Button>
              </Link>
              <Link to="/search-freelancers">
                <Button variant="outline" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Find Freelancers
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
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl text-foreground">{stats.amountDue}</p>
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
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl text-foreground">{stats.activeProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl text-foreground">{stats.completedProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Hired Freelancers</p>
                  <p className="text-2xl text-foreground">{stats.savedFreelancers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Active Projects
                  <Link to="/post-job" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeProjects.length > 0 ? (
                    activeProjects.map(project => {
                      const freelancerName = getProjectFreelancerName(project);
                      const progress = getProjectProgress(project);
                      const status = getProjectStatus(project).toLowerCase();
                      const needsPayment = !['active', 'paid_directly', 'submitted', 'completed', 'cancelled'].includes(status);

                      return (
                        <div key={project.id} className="p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-sm text-foreground mb-1">{project.title || 'Untitled project'}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={project.freelancerAvatar} />
                                <AvatarFallback className="text-xs">
                                  {freelancerName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {freelancerName}
                            </div>
                          </div>
                          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                            {status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {getProjectBudget(project)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {getProjectDeadline(project)}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground">Progress</span>
                            <span className="text-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        {needsPayment && (
                          <div className="mt-3">
                            <Link to={`/payments/${project.id}`}>
                              <Button size="sm" className="w-full gap-2">
                                <IndianRupee className="w-4 h-4" />
                                Pay Freelancer
                              </Button>
                            </Link>
                          </div>
                        )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="mb-2 text-foreground">No active projects yet</p>
                      <p className="text-sm">Post your first job to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Posted Jobs */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Posted Jobs
                  <Link to="/post-job" className="text-sm text-primary hover:underline">
                    Post new
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading jobs...</p>
                    </div>
                   ) : postedJobs.length > 0 ? (
                    postedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 border border-border rounded-lg hover:bg-muted transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/job/${job.id}`} className="block flex-1 min-w-0">
                            <h4 className="text-sm text-foreground mb-1">{job.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              Posted: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                            </p>
                          </Link>
                          <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {String(job.status || '').toLowerCase()}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {job.budgetType === 'FIXED' ? `₹${job.fixedBudget}` : `₹${job.hourlyRate}/hr`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {job.proposalCount ?? 0} applicants
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/job/${job.id}`}>View job</Link>
                          </Button>
                          <Button size="sm" variant="secondary" asChild>
                            <Link to={`/job/${job.id}/applicants`}>
                              <Users className="w-3 h-3 mr-1" />
                              Applicants
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Plus className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="mb-2 text-foreground">No jobs posted yet</p>
                      <p className="text-sm">Create your first job posting!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Talent Discovery & Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Recommended Freelancers */}
            <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Recommended Talent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Real student profiles appear here after students complete their Workzy profiles.</p>
                  <Link to="/search-freelancers" className="block">
                    <Button size="sm" variant="outline" className="w-full">Browse All Freelancers</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Hiring Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Hiring Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jobs posted</span>
                    <span className="text-foreground">{postedJobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active projects</span>
                    <span className="text-foreground">{stats.activeProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="text-foreground">{stats.completedProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hired freelancers</span>
                    <span className="text-foreground">{stats.savedFreelancers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Post Job */}
            <Card className="border-green-200 bg-green-50/30 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Quick Post Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Popular categories with high freelancer activity.
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/post-job?category=programming">
                      <Button size="sm" variant="outline" className="w-full text-xs flex items-center gap-1">
                        ⚛️ React Dev
                      </Button>
                    </Link>
                    <Link to="/post-job?category=ui-ux-design">
                      <Button size="sm" variant="outline" className="w-full text-xs flex items-center gap-1">
                        🎨 UI/UX
                      </Button>
                    </Link>
                    <Link to="/post-job?category=content-writing">
                      <Button size="sm" variant="outline" className="w-full text-xs flex items-center gap-1">
                        ✍️ Writing
                      </Button>
                    </Link>
                    <Link to="/post-job?category=audio-video">
                      <Button size="sm" variant="outline" className="w-full text-xs flex items-center gap-1">
                        🎬 Video Edit
                      </Button>
                    </Link>
                  </div>
                  <Link to="/post-job" className="block">
                    <Button size="sm" className="w-full">Browse All Categories</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Budget Helper */}
            {/* Budget Helper */}
            <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Budget Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Use the real bids you receive from students to compare project cost. Workzy does not show fake market rates.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-lg text-foreground mb-4">Client Management Hub</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/post-job">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-blue-50/50 dark:bg-blue-950/20 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Plus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-foreground">Post New Job</p>
                  <p className="text-xs text-muted-foreground">Hire top talent</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/search-freelancers">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-green-50/50 dark:bg-green-950/20 border-green-200">
                <CardContent className="p-6 text-center">
                  <Search className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-foreground">Find Freelancers</p>
                  <p className="text-xs text-muted-foreground">Browse talent pool</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/agreements">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-purple-50/50 dark:bg-purple-950/20 border-purple-200">
                <CardContent className="p-6 text-center">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-foreground">Contracts</p>
                  <p className="text-xs text-muted-foreground">Manage agreements</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/payments">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-amber-50/50 dark:bg-amber-950/20 border-amber-200">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm text-foreground">Payments</p>
                  <p className="text-xs text-muted-foreground">Pay directly</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Project Management Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">Project Management</h3>
                    <p className="text-xs text-muted-foreground">Track progress, manage deadlines, and communicate with your team effectively.</p>
                  </div>
                  <Link to="/messages">
                    <Button size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Messages
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">Business Analytics</h3>
                    <p className="text-xs text-muted-foreground">Monitor spending, project ROI, and hiring metrics to optimize your business.</p>
                  </div>
                  <Link to="/settings">
                    <Button size="sm" variant="outline">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

              Project Categories
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-foreground flex items-center gap-2">
              Project Categories
            </h2>
            <Link to="/browse-jobs" className="text-sm text-primary hover:underline">
              View all categories
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Link to="/post-job?category=programming">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-blue-50/50 dark:bg-blue-950/20 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">⚛️</div>
                  <p className="text-sm text-foreground font-medium">Programming</p>
                  <p className="text-xs text-muted-foreground">Post a real job</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/post-job?category=ui-ux-design">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-purple-50/50 dark:bg-purple-950/20 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🎨</div>
                  <p className="text-sm text-foreground font-medium">UI/UX Design</p>
                  <p className="text-xs text-muted-foreground">Post a real job</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/post-job?category=content-writing">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-green-50/50 dark:bg-green-950/20 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">✍️</div>
                  <p className="text-sm text-foreground font-medium">Content Writing</p>
                  <p className="text-xs text-muted-foreground">Post a real job</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/post-job?category=audio-video">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-orange-50/50 dark:bg-orange-950/20 border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🎬</div>
                  <p className="text-sm text-foreground font-medium">Video Editing</p>
                  <p className="text-xs text-muted-foreground">Post a real job</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/post-job?category=website-dev">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🌐</div>
                  <p className="text-sm text-foreground font-medium">Website Dev</p>
                  <p className="text-xs text-muted-foreground">Post a real job</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/post-job?category=tutoring">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🎓</div>
                  <p className="text-sm text-foreground font-medium">Tutoring</p>
                  <p className="text-xs text-muted-foreground">Post a real job</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Verified Student Talent Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-foreground">✓ Student Profiles</h2>
            <Link to="/search-freelancers" className="text-sm text-primary hover:underline">
              Browse all students
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Why Hire Students */}
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="text-3xl mb-3 text-center">🎓</div>
                <h3 className="text-sm font-medium text-foreground mb-2 text-center">Student Profiles</h3>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  Student details appear only from completed profiles.
                </p>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>Real profile details only</li>
                  <li>No fake student data</li>
                </ul>
              </CardContent>
            </Card>

            {/* Quality & Trust */}
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-6">
                <div className="text-3xl mb-3 text-center">✓</div>
                <h3 className="text-sm font-medium text-foreground mb-2 text-center">Profile Signals</h3>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  Show only metrics recorded by Workzy activity
                </p>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• Response rate tracking</li>
                  <li>• Completion rate visible</li>
                  <li>• Review & rating system</li>
                </ul>
              </CardContent>
            </Card>

            {/* Secure Payments */}
            <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
              <CardContent className="p-6">
                <div className="text-3xl mb-3 text-center">🔒</div>
                <h3 className="text-sm font-medium text-foreground mb-2 text-center">Direct UPI Payments</h3>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  Fast client-to-student payments with 0% Workzy commission
                </p>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• UPI-first checkout</li>
                  <li>• Razorpay verification</li>
                  <li>• 0% platform fee</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💡</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Ready to hire skilled college students?</p>
                  <p className="text-xs text-muted-foreground">Post your first job and receive proposals from real student profiles.</p>
                </div>
                <Link to="/post-job" className="ml-auto">
                  <Button size="sm">Post a Job</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

