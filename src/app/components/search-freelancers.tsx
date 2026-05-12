import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Search, Filter, MapPin, Star, Heart, MessageSquare,
  ChevronLeft, DollarSign, CheckCircle, Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '../App';

interface SearchFreelancersProps {
  user: User;
}

const freelancers = [
  {
    id: '1',
    name: 'Arjun Sharma',
    title: 'Full Stack Developer',
    avatar: '',
    rating: 4.9,
    reviewsCount: 45,
    hourlyRate: 2500,
    location: 'Mumbai, India',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
    bio: 'Experienced full-stack developer with 5+ years building scalable web applications. Specialized in React, Node.js, and cloud architecture.',
    completedJobs: 23,
    successRate: 98,
    responseTime: '1 hour',
    isTopRated: true,
    isVerified: true,
    portfolio: [
      { title: 'E-commerce Platform', image: '' },
      { title: 'Task Management App', image: '' }
    ]
  },
  {
    id: '2',
    name: 'Priya Patel',
    title: 'UI/UX Designer',
    avatar: '',
    rating: 4.8,
    reviewsCount: 32,
    hourlyRate: 1800,
    location: 'Bangalore, India',
    skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    bio: 'Creative UI/UX designer passionate about creating intuitive and beautiful user experiences. Expert in design systems and user research.',
    completedJobs: 18,
    successRate: 95,
    responseTime: '2 hours',
    isTopRated: false,
    isVerified: true,
    portfolio: [
      { title: 'Mobile Banking App', image: '' },
      { title: 'SaaS Dashboard', image: '' }
    ]
  },
  {
    id: '3',
    name: 'Rahul Kumar',
    title: 'Data Scientist',
    avatar: '',
    rating: 4.7,
    reviewsCount: 28,
    hourlyRate: 2200,
    location: 'Remote',
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'SQL'],
    bio: 'Data scientist with expertise in machine learning and statistical analysis. Helping businesses make data-driven decisions.',
    completedJobs: 15,
    successRate: 92,
    responseTime: '3 hours',
    isTopRated: false,
    isVerified: false,
    portfolio: [
      { title: 'Predictive Analytics Model', image: '' },
      { title: 'Customer Segmentation', image: '' }
    ]
  },
  {
    id: '4',
    name: 'Sneha Singh',
    title: 'Mobile App Developer',
    avatar: '',
    rating: 4.9,
    reviewsCount: 38,
    hourlyRate: 2350,
    location: 'Delhi, India',
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
    bio: 'Mobile app developer specializing in cross-platform development. Built 50+ apps with millions of downloads.',
    completedJobs: 31,
    successRate: 97,
    responseTime: '1 hour',
    isTopRated: true,
    isVerified: true,
    portfolio: [
      { title: 'Fitness Tracking App', image: '' },
      { title: 'Food Delivery App', image: '' }
    ]
  }
];

const categories = [
  'All Categories',
  'Web Development',
  'Mobile Development',
  'Design',
  'Data Science',
  'Digital Marketing',
  'Writing',
  'Video & Animation'
];

const hourlyRates = [
  'All Rates',
  'Under ₹1,000',
  '₹1,000 - ₹2,000',
  '₹2,000 - ₹3,000',
  '₹3,000 - ₹4,000',
  'Over ₹4,000'
];

export function SearchFreelancers({ user }: SearchFreelancersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedRate, setSelectedRate] = useState('All Rates');
  const [savedFreelancers, setSavedFreelancers] = useState<string[]>([]);

  const handleSaveFreelancer = (freelancerId: string) => {
    setSavedFreelancers(prev => 
      prev.includes(freelancerId) 
        ? prev.filter(id => id !== freelancerId)
        : [...prev, freelancerId]
    );
  };

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRate = selectedRate === 'All Rates' || 
      (selectedRate === 'Under ₹1,000' && freelancer.hourlyRate < 1000) ||
      (selectedRate === '₹1,000 - ₹2,000' && freelancer.hourlyRate >= 1000 && freelancer.hourlyRate <= 2000) ||
      (selectedRate === '₹2,000 - ₹3,000' && freelancer.hourlyRate > 2000 && freelancer.hourlyRate <= 3000) ||
      (selectedRate === '₹3,000 - ₹4,000' && freelancer.hourlyRate > 3000 && freelancer.hourlyRate <= 4000) ||
      (selectedRate === 'Over ₹4,000' && freelancer.hourlyRate > 4000);

    return matchesSearch && matchesRate;
  });

  return (
    <div className="min-h-screen bg-background relative">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1670851050245-d861fd433d06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NTg0NDYwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
          alt="Professional team collaboration"
          className="w-full h-full object-cover opacity-5 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
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
              <h1 className="text-xl text-foreground">Find Freelancers</h1>
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by name, skills, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={selectedRate} onValueChange={setSelectedRate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hourly Rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {hourlyRates.map(rate => (
                        <SelectItem key={rate} value={rate}>
                          {rate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
              Found {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select defaultValue="rating">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="rate-low">Rate: Low to High</SelectItem>
                  <SelectItem value="rate-high">Rate: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Freelancer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((freelancer, index) => (
            <motion.div
              key={freelancer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={freelancer.avatar} />
                        <AvatarFallback>
                          {freelancer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{freelancer.name}</h3>
                          {freelancer.isVerified && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                          {freelancer.isTopRated && (
                            <Trophy className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{freelancer.title}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveFreelancer(freelancer.id)}
                    >
                      <Heart className={`w-4 h-4 ${savedFreelancers.includes(freelancer.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-foreground">{freelancer.rating}</span>
                      <span className="text-muted-foreground">({freelancer.reviewsCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {freelancer.location}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {freelancer.bio}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {freelancer.skills.slice(0, 4).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {freelancer.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{freelancer.skills.length - 4}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div>
                      <span className="block text-muted-foreground">Jobs completed</span>
                      <span className="text-foreground">{freelancer.completedJobs}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground">Success rate</span>
                      <span className="text-foreground">{freelancer.successRate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg">
                      <span className="text-foreground">₹{freelancer.hourlyRate}</span>
                      <span className="text-sm text-muted-foreground">/hr</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button size="sm">
                        Hire
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredFreelancers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg text-foreground mb-2">No freelancers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse different categories.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Categories');
                setSelectedRate('All Rates');
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}