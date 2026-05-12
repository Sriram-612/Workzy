import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Search, Filter, MapPin, Clock, IndianRupee, Heart,
  ChevronLeft, Star, Briefcase, Calendar, Loader2,
  Code, Video, Palette, Globe, Smartphone, PenTool,
  GraduationCap, Share2, Database, FileText, Presentation,
  Brush, Grid3X3, TrendingUp, Zap, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { toast } from 'sonner';
import type { User } from '../App';

interface BrowseJobsProps {
  user: User;
}

const jobCategories = [
  {
    id: 'development',
    title: 'Development',
    icon: Code,
    color: 'blue',
    subcategories: ['Web Development', 'App Development', 'Backend Development', 'Frontend Development', 'Full Stack'],
    description: 'Software and web development projects'
  },
  {
    id: 'design',
    title: 'Design',
    icon: Palette,
    color: 'purple',
    subcategories: ['UI/UX Design', 'Logo Design', 'Brand Identity', 'Graphic Design', 'Prototyping'],
    description: 'Visual design and user experience'
  },
  {
    id: 'video-editing',
    title: 'Video Editing',
    icon: Video,
    color: 'pink',
    subcategories: ['Video Editing', 'Motion Graphics', 'Animation', 'YouTube Videos', 'Social Media Videos'],
    description: 'Video production and editing services'
  },
  {
    id: 'ai-content',
    title: 'AI & Content',
    icon: PenTool,
    color: 'green',
    subcategories: ['AI Integration', 'Content Writing', 'Copywriting', 'SEO Writing', 'Technical Writing'],
    description: 'AI services and content creation'
  }
];

const budgetRanges = [
  'All Budgets',
  'Under ₹5,000',
  '₹5,000 - ₹15,000',
  '₹15,000 - ₹50,000',
  '₹50,000 - ₹1,50,000',
  'Over ₹1,50,000'
];

const trendingSkills = [
  { name: 'React', demand: 'Very High', icon: '⚛️' },
  { name: 'UI/UX Design', demand: 'Very High', icon: '🎨' },
  { name: 'Video Editing', demand: 'High', icon: '🎬' },
  { name: 'AI Integration', demand: 'Very High', icon: '🤖' },
  { name: 'Content Writing', demand: 'High', icon: '✍️' },
  { name: 'Full Stack', demand: 'High', icon: '💻' }
];

export function BrowseJobs({ user }: BrowseJobsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('All Budgets');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Load jobs from API
  useEffect(() => {
    if (selectedCategory) {
      const loadJobs = async () => {
        try {
          setLoading(true);
          const response = await jobsAPI.getAllJobs({
            query: searchQuery || undefined,
            category: selectedCategory,
            sortBy: sortBy === 'newest' ? 'createdAt' : 
                    sortBy === 'budget-high' ? 'budget' : 
                    sortBy === 'budget-low' ? 'budget' : 'createdAt',
            sortOrder: sortBy === 'budget-low' ? 'asc' : 'desc',
            page: '1',
            limit: '20'
          });
          
          setJobs(response.jobs || []);
        } catch (error: any) {
          console.error('Error loading jobs:', error);
          if (!error.message?.includes('401')) {
            toast.error('Failed to load jobs');
          }
          setJobs([]);
        } finally {
          setLoading(false);
        }
      };

      loadJobs();
    }
  }, [searchQuery, selectedCategory, sortBy]);

  // Load saved jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`savedJobs_${user.id}`);
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, [user.id]);

  const handleSaveJob = (jobId: string) => {
    const newSavedJobs = savedJobs.includes(jobId) 
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    
    setSavedJobs(newSavedJobs);
    localStorage.setItem(`savedJobs_${user.id}`, JSON.stringify(newSavedJobs));
    
    toast.success(savedJobs.includes(jobId) ? 'Job removed from saved' : 'Job saved!');
  };

  const filteredJobs = jobs.filter(job => {
    const jobBudget = job.budgetType === 'FIXED' ? job.fixedBudget : job.hourlyRate * 40 * 4;
    
    const matchesBudget = selectedBudget === 'All Budgets' || 
      (selectedBudget === 'Under ₹5,000' && jobBudget < 5000) ||
      (selectedBudget === '₹5,000 - ₹15,000' && jobBudget >= 5000 && jobBudget <= 15000) ||
      (selectedBudget === '₹15,000 - ₹50,000' && jobBudget > 15000 && jobBudget <= 50000) ||
      (selectedBudget === '₹50,000 - ₹1,50,000' && jobBudget > 50000 && jobBudget <= 150000) ||
      (selectedBudget === 'Over ₹1,50,000' && jobBudget > 150000);

    return matchesBudget;
  });

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Enhanced Background */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1758630737900-a28682c5aa69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBvZmZpY2V8ZW58MXx8fHwxNzU4ODk0MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080" 
            alt="Modern workspace for job browsing"
            className="w-full h-full object-cover opacity-8 dark:opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-purple-50/60 dark:from-blue-950/60 dark:to-purple-950/60"></div>
          <div className="absolute inset-0 backdrop-blur-[0.5px]"></div>
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
                <h1 className="text-xl text-foreground">Browse Jobs by Category</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl text-foreground mb-4">
              Find Your Perfect Freelance Opportunity
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Browse thousands of jobs across 13 specialized categories
            </p>
            
            {/* Quick Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search across all categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </div>
          </motion.div>

          {/* Trending Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/50 dark:to-yellow-950/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg text-foreground">🔥 Trending Skills</h3>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                    High Demand
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {trendingSkills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white dark:bg-card rounded-lg p-3 text-center border border-orange-200 dark:border-orange-800"
                    >
                      <div className="text-2xl mb-1">{skill.icon}</div>
                      <p className="text-sm text-foreground font-medium">{skill.name}</p>
                      <p className="text-xs text-muted-foreground">{skill.demand}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Categories Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl text-foreground mb-6">Choose Your Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {jobCategories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-${category.color}-200 bg-${category.color}-50/50 dark:bg-${category.color}-950/20 group`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-lg bg-${category.color}-100 dark:bg-${category.color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <IconComponent className={`w-6 h-6 text-${category.color}-600 dark:text-${category.color}-400`} />
                        </div>
                        <h3 className="text-base text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {category.subcategories.slice(0, 3).map((sub) => (
                            <Badge key={sub} variant="outline" className="text-xs">
                              {sub}
                            </Badge>
                          ))}
                          {category.subcategories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{category.subcategories.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Briefcase className="w-3 h-3" />
                            <span>50+ jobs</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <Zap className="w-3 h-3" />
                            <span>Active</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl text-blue-600 dark:text-blue-400 mb-1">2,500+</div>
                    <div className="text-sm text-muted-foreground">Active Jobs</div>
                  </div>
                  <div>
                    <div className="text-2xl text-green-600 dark:text-green-400 mb-1">15,000+</div>
                    <div className="text-sm text-muted-foreground">Freelancers</div>
                  </div>
                  <div>
                    <div className="text-2xl text-purple-600 dark:text-purple-400 mb-1">₹2.5Cr+</div>
                    <div className="text-sm text-muted-foreground">Earnings</div>
                  </div>
                  <div>
                    <div className="text-2xl text-orange-600 dark:text-orange-400 mb-1">4.8★</div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Jobs listing view for selected category
  const selectedCategoryData = jobCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1674291707242-84b519075308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVlbGFuY2VyJTIwcmVtb3RlJTIwd29ya3xlbnwxfHx8fDE3NTg5NzUzMjB8MA&ixlib=rb-4.1.0&q=80&w=1080" 
          alt="Professional freelancer workspace"
          className="w-full h-full object-cover opacity-8 dark:opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-purple-50/60 dark:from-blue-950/60 dark:to-purple-950/60"></div>
        <div className="absolute inset-0 backdrop-blur-[0.5px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-card/80 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="mr-4"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Categories
              </Button>
              <div className="flex items-center gap-3">
                {selectedCategoryData && (
                  <>
                    <div className={`w-8 h-8 rounded-lg bg-${selectedCategoryData.color}-100 dark:bg-${selectedCategoryData.color}-900/30 flex items-center justify-center`}>
                      <selectedCategoryData.icon className={`w-4 h-4 text-${selectedCategoryData.color}-600 dark:text-${selectedCategoryData.color}-400`} />
                    </div>
                    <h1 className="text-xl text-foreground">{selectedCategoryData.title}</h1>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={`Search ${selectedCategoryData?.title.toLowerCase()} jobs...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map(range => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="budget-high">Highest Budget</SelectItem>
                      <SelectItem value="budget-low">Lowest Budget</SelectItem>
                      <SelectItem value="proposals">Most Proposals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subcategory filters */}
              {selectedCategoryData && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Popular subcategories:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategoryData.subcategories.map((sub) => (
                      <Badge key={sub} variant="outline" className="cursor-pointer hover:bg-muted">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>50+ freelancers active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Job Listings */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              >
                <Card className={`hover:shadow-lg transition-shadow ${job.isFeatured ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {job.isFeatured && (
                            <Badge variant="default" className="text-xs">
                              Featured
                            </Badge>
                          )}
                          {job.isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {job.category}
                          </Badge>
                        </div>
                        
                        <Link to={`/job/${job.id}`}>
                          <h3 className="text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
                            {job.title}
                          </h3>
                        </Link>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills?.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {job.budgetType === 'FIXED' ? `₹${job.fixedBudget?.toLocaleString()}` : `₹${job.hourlyRate}/hr`}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job._count?.proposals || 0} proposals
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveJob(job.id)}
                          className="mb-2"
                        >
                          <Heart className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={job.client?.avatar} />
                            <AvatarFallback className="text-xs">
                              {job.client?.name?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-right">
                            <p className="text-sm text-foreground">{job.client?.name || 'Client'}</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">{job.client?.rating || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <MapPin className="w-3 h-3" />
                          {job.client?.location || 'Remote'}
                        </div>

                        <Link to={`/job/${job.id}`}>
                          <Button className="w-full">
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg text-foreground mb-2">No jobs found in this category</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check other categories.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBudget('All Budgets');
                  }}
                >
                  Clear Filters
                </Button>
                <Button onClick={() => setSelectedCategory(null)}>
                  Browse Categories
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}