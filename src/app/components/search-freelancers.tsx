import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, ChevronLeft, IndianRupee, Loader2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import type { User } from '../App';

interface SearchFreelancersProps {
  user: User;
}

type FreelancerProfile = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  skills?: string[];
  hourlyRate?: number;
  bio?: string;
  collegeName?: string;
  department?: string;
  rating?: number;
  totalProjects?: number;
  completionRate?: number;
};

const rateFilters = [
  'All Rates',
  'Under ₹1,000',
  '₹1,000 - ₹2,000',
  '₹2,000 - ₹3,000',
  '₹3,000 - ₹4,000',
  'Over ₹4,000',
];

function matchesRate(freelancer: FreelancerProfile, selectedRate: string) {
  if (selectedRate === 'All Rates') return true;
  const rate = Number(freelancer.hourlyRate || 0);
  if (!rate) return false;
  if (selectedRate === 'Under ₹1,000') return rate < 1000;
  if (selectedRate === '₹1,000 - ₹2,000') return rate >= 1000 && rate <= 2000;
  if (selectedRate === '₹2,000 - ₹3,000') return rate > 2000 && rate <= 3000;
  if (selectedRate === '₹3,000 - ₹4,000') return rate > 3000 && rate <= 4000;
  return rate > 4000;
}

export function SearchFreelancers({ user }: SearchFreelancersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRate, setSelectedRate] = useState('All Rates');
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await userAPI.searchFreelancers({
          query: searchQuery,
          page: '1',
          limit: '50',
        });
        if (!cancelled) setFreelancers((response.freelancers || []) as FreelancerProfile[]);
      } catch (err) {
        if (!cancelled) {
          setFreelancers([]);
          setError(err instanceof Error ? err.message : 'Could not load student profiles');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const timer = window.setTimeout(load, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const visibleFreelancers = useMemo(
    () => freelancers.filter((freelancer) => matchesRate(freelancer, selectedRate)),
    [freelancers, selectedRate]
  );

  const messageHref = (freelancer: FreelancerProfile) => {
    const email = encodeURIComponent(freelancer.email || '');
    const name = encodeURIComponent(freelancer.name || '');
    return `/messages?email=${email}&name=${name}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mr-6">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl text-foreground">Find Students</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search real student profiles by name, bio, or skills..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedRate} onValueChange={setSelectedRate}>
                <SelectTrigger>
                  <SelectValue placeholder="Hourly Rate" />
                </SelectTrigger>
                <SelectContent>
                  {rateFilters.map((rate) => (
                    <SelectItem key={rate} value={rate}>
                      {rate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {loading ? 'Loading real student profiles...' : `${visibleFreelancers.length} student profile${visibleFreelancers.length === 1 ? '' : 's'} found`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">{error}</CardContent>
          </Card>
        ) : visibleFreelancers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg text-foreground mb-2">No real student profiles found</h3>
              <p className="text-muted-foreground">Students will appear here only after they sign up and complete profile details.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleFreelancers.map((freelancer, index) => (
              <motion.div
                key={freelancer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.03 * index }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={freelancer.avatar} />
                        <AvatarFallback>{freelancer.name?.charAt(0)?.toUpperCase() || 'S'}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground truncate">{freelancer.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {[freelancer.collegeName, freelancer.department].filter(Boolean).join(' • ') || 'Student'}
                        </p>
                      </div>
                    </div>

                    {freelancer.bio ? <p className="text-sm text-muted-foreground line-clamp-3">{freelancer.bio}</p> : null}

                    {freelancer.skills && freelancer.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-muted-foreground">
                        {freelancer.hourlyRate ? (
                          <span className="inline-flex items-center gap-1 text-foreground">
                            <IndianRupee className="w-4 h-4" />
                            {freelancer.hourlyRate.toLocaleString()}/hr
                          </span>
                        ) : (
                          'Rate not provided'
                        )}
                      </div>
                      {freelancer.email ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link to={messageHref(freelancer)}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
