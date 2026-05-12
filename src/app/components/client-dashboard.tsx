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
  ChevronRight, Calendar, TrendingUp, DollarSign,
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
  const [showNotifications, setShowNotifications] = useState(false);
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
        setStats({
          amountDue: `₹${statsResponse.stats.totalEarnings || 0}`,
          activeProjects: statsResponse.stats.activeProjects || 0,
          completedProjects: statsResponse.stats.completedProjects || 0,
          savedFreelancers: 0 // This would come from a separate API
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
                <Link to="/escrow" className="text-muted-foreground hover:text-primary">
                  Escrow
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-lg shadow-lg border border-border z-50">
                    <div className="p-4">
                      <h3 className="mb-3 text-foreground">Notifications</h3>
                      <div className="space-y-3">
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <div key={notification.id} className="flex items-start space-x-3 p-2 hover:bg-muted rounded">
                              <div className="flex-1">
                                <p className="text-sm text-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
                    activeProjects.map(project => (
                      <div key={project.id} className="p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-sm text-foreground mb-1">{project.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={project.freelancerAvatar} />
                                <AvatarFallback className="text-xs">
                                  {project.freelancer.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {project.freelancer}
                            </div>
                          </div>
                          <Badge variant={project.status === 'in-progress' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {project.budget}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {project.deadline}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground">Progress</span>
                            <span className="text-foreground">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      </div>
                    ))
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
                    postedJobs.map(job => (
                      <Link 
                        key={job.id} 
                        to={`/job/${job.id}`}
                        className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm text-foreground mb-1">{job.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              Posted: {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {job.status.toLowerCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {job.budgetType === 'FIXED' ? `₹${job.fixedBudget}` : `₹${job.hourlyRate}/hr`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {job._count?.proposals || 0} applicants
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </Link>
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
                <div className="space-y-3">
                  {/* Mock recommended freelancer */}
                  <div className="p-3 border border-border rounded-lg bg-white dark:bg-card">
                    <div className="flex items-center space-x-3 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                          AR
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-sm text-foreground">Arjun React</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          4.9 • Top Rated
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                        Available
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">React</Badge>
                      <Badge variant="outline" className="text-xs">Node.js</Badge>
                      <Badge variant="outline" className="text-xs">TypeScript</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">₹800/hr</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 text-xs">Save</Button>
                        <Button size="sm" className="h-6 text-xs">Hire</Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border border-border rounded-lg bg-white dark:bg-card">
                    <div className="flex items-center space-x-3 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                          PD
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-sm text-foreground">Priya Designer</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          4.8 • Rising Talent
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Busy
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">UI/UX</Badge>
                      <Badge variant="outline" className="text-xs">Figma</Badge>
                      <Badge variant="outline" className="text-xs">Branding</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">₹600/hr</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 text-xs">Save</Button>
                        <Button size="sm" variant="outline" className="h-6 text-xs">Contact</Button>
                      </div>
                    </div>
                  </div>

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
                    <span className="text-muted-foreground">Average hire time</span>
                    <span className="text-foreground">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success rate</span>
                    <span className="text-foreground">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saved freelancers</span>
                    <span className="text-foreground">0</span>
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
            <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Market Rates Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">React Development</span>
                    <span className="text-foreground">₹600-1500/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UI/UX Design</span>
                    <span className="text-foreground">₹400-1000/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Content Writing</span>
                    <span className="text-foreground">₹300-700/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Video Editing</span>
                    <span className="text-foreground">₹500-1200/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Entry</span>
                    <span className="text-foreground">₹150-400/hr</span>
                  </div>
                  <div className="text-center pt-2">
                    <Link to="/search-freelancers" className="text-primary hover:underline text-xs">
                      View detailed market analysis
                    </Link>
                  </div>
                </div>
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

            <Link to="/escrow">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-amber-50/50 dark:bg-amber-950/20 border-amber-200">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm text-foreground">Escrow</p>
                  <p className="text-xs text-muted-foreground">Secure payments</p>
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

        {/* Trending Categories & Hiring Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-foreground flex items-center gap-2">
              🔥 Trending Categories
              <Badge variant="secondary" className="text-xs">High Activity</Badge>
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
                  <p className="text-xs text-muted-foreground">₹600-1500/hr</p>
                  <Badge variant="outline" className="text-xs mt-1">250+ freelancers</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/post-job?category=ui-ux-design">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-purple-50/50 dark:bg-purple-950/20 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🎨</div>
                  <p className="text-sm text-foreground font-medium">UI/UX Design</p>
                  <p className="text-xs text-muted-foreground">₹400-1000/hr</p>
                  <Badge variant="outline" className="text-xs mt-1">180+ freelancers</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/post-job?category=content-writing">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-green-50/50 dark:bg-green-950/20 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">✍️</div>
                  <p className="text-sm text-foreground font-medium">Content Writing</p>
                  <p className="text-xs text-muted-foreground">₹300-700/hr</p>
                  <Badge variant="outline" className="text-xs mt-1">320+ freelancers</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/post-job?category=audio-video">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-orange-50/50 dark:bg-orange-950/20 border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🎬</div>
                  <p className="text-sm text-foreground font-medium">Video Editing</p>
                  <p className="text-xs text-muted-foreground">₹500-1200/hr</p>
                  <Badge variant="outline" className="text-xs mt-1">90+ freelancers</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/post-job?category=website-dev">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🌐</div>
                  <p className="text-sm text-foreground font-medium">Website Dev</p>
                  <p className="text-xs text-muted-foreground">₹500-1200/hr</p>
                  <Badge variant="outline" className="text-xs mt-1">200+ freelancers</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/post-job?category=tutoring">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🎓</div>
                  <p className="text-sm text-foreground font-medium">Tutoring</p>
                  <p className="text-xs text-muted-foreground">₹300-800/hr</p>
                  <Badge variant="outline" className="text-xs mt-1">150+ freelancers</Badge>
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
            <h2 className="text-lg text-foreground">✓ Hire Verified College Students</h2>
            <Link to="/search-freelancers" className="text-sm text-primary hover:underline">
              Browse all students
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Why Hire Students */}
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="text-3xl mb-3 text-center">🎓</div>
                <h3 className="text-sm font-medium text-foreground mb-2 text-center">Verified Students</h3>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  All students are verified with college emails from top universities
                </p>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• IIT, BITS, NIT & more</li>
                  <li>• Email-verified profiles</li>
                  <li>• Fresh, innovative talent</li>
                </ul>
              </CardContent>
            </Card>

            {/* Quality & Trust */}
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-6">
                <div className="text-3xl mb-3 text-center">✓</div>
                <h3 className="text-sm font-medium text-foreground mb-2 text-center">Quality Guaranteed</h3>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  Track record and performance metrics for every freelancer
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
                <h3 className="text-sm font-medium text-foreground mb-2 text-center">Secure Escrow</h3>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  Payment protection with milestone-based escrow system
                </p>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• Funds held in escrow</li>
                  <li>• Release on completion</li>
                  <li>• 9.9% platform fee</li>
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
                  <p className="text-xs text-muted-foreground">Post your first job and get proposals from verified students in 24 hours.</p>
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