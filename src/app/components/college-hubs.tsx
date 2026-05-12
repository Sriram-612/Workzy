import { useState } from 'react';
import { ArrowLeft, Search, Users, Trophy, TrendingUp, MapPin, Star, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { User } from '../App';

interface CollegeHubsProps {
  user: User;
  onBack: () => void;
}

export function CollegeHubs({ user, onBack }: CollegeHubsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<any>(null);

  const collegeHubs = [
    {
      id: 1,
      name: "Indian Institute of Technology Delhi",
      shortName: "IIT Delhi",
      location: "New Delhi",
      students: 1247,
      totalEarnings: 2456780,
      monthlyEarnings: 345670,
      rank: 1,
      badge: "🏆",
      verificationRequired: true,
      domains: ["iitd.ac.in"],
      topSkills: ["Web Development", "Machine Learning", "Mobile Apps"],
      recentAchievements: ["Won National Hackathon", "50+ Projects Completed", "₹10L+ Total Earnings"]
    },
    {
      id: 2,
      name: "Birla Institute of Technology and Science",
      shortName: "BITS Pilani",
      location: "Pilani, Rajasthan",
      students: 892,
      totalEarnings: 1893450,
      monthlyEarnings: 234580,
      rank: 2,
      badge: "🥈",
      verificationRequired: true,
      domains: ["pilani.bits-pilani.ac.in"],
      topSkills: ["Software Development", "Data Science", "UI/UX Design"],
      recentAchievements: ["Top Design Team", "100+ Successful Projects", "₹18L+ Total Earnings"]
    },
    {
      id: 3,
      name: "National Institute of Technology Trichy",
      shortName: "NIT Trichy",
      location: "Tiruchirappalli, Tamil Nadu",
      students: 756,
      totalEarnings: 1567890,
      monthlyEarnings: 198340,
      rank: 3,
      badge: "🥉",
      verificationRequired: true,
      domains: ["nitt.edu"],
      topSkills: ["Backend Development", "DevOps", "Cybersecurity"],
      recentAchievements: ["Security Challenge Winners", "₹15L+ Earnings", "Top Backend Hub"]
    },
    {
      id: 4,
      name: "International Institute of Information Technology",
      shortName: "IIIT Hyderabad",
      location: "Hyderabad, Telangana",
      students: 623,
      totalEarnings: 1234560,
      monthlyEarnings: 167890,
      rank: 4,
      badge: "⭐",
      verificationRequired: true,
      domains: ["iiit.ac.in"],
      topSkills: ["AI/ML", "Research", "Full Stack"],
      recentAchievements: ["AI Innovation Award", "Research Excellence", "₹12L+ Earnings"]
    },
    {
      id: 5,
      name: "Vellore Institute of Technology",
      shortName: "VIT Vellore",
      location: "Vellore, Tamil Nadu",
      students: 534,
      totalEarnings: 987650,
      monthlyEarnings: 145230,
      rank: 5,
      badge: "💎",
      verificationRequired: true,
      domains: ["vit.ac.in"],
      topSkills: ["Mobile Development", "Cloud Computing", "Game Development"],
      recentAchievements: ["Mobile App Contest", "Cloud Migration Expert", "₹9L+ Earnings"]
    }
  ];

  const topPerformers = [
    { name: "Arjun Kumar", year: "3rd Year", branch: "CSE", earnings: 45670, projects: 12, rating: 4.9 },
    { name: "Priya Sharma", year: "2nd Year", branch: "ECE", earnings: 38900, projects: 8, rating: 4.8 },
    { name: "Rohit Mehta", year: "4th Year", branch: "IT", earnings: 52340, projects: 15, rating: 4.9 },
    { name: "Sneha Reddy", year: "3rd Year", branch: "CSE", earnings: 41200, projects: 10, rating: 4.7 }
  ];

  const filteredColleges = collegeHubs.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedCollege) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCollege(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedCollege.badge}</span>
                <div>
                  <h1 className="text-2xl font-bold">{selectedCollege.shortName}</h1>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedCollege.location}
                  </p>
                </div>
              </div>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary">Rank #{selectedCollege.rank}</Badge>
            </div>
          </div>

          {/* College Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Students</p>
                    <p className="text-xl font-bold">{selectedCollege.students}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-xl font-bold">₹{(selectedCollege.totalEarnings / 100000).toFixed(1)}L</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                    <p className="text-xl font-bold">₹{(selectedCollege.monthlyEarnings / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hub Rank</p>
                    <p className="text-xl font-bold">#{selectedCollege.rank}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="join">Join Hub</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Skills</CardTitle>
                    <CardDescription>Most popular skills in this hub</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCollege.topSkills.map((skill: string, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{skill}</span>
                          <Badge variant="secondary">{Math.floor(Math.random() * 100) + 50}+ students</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Achievements</CardTitle>
                    <CardDescription>Hub milestones and awards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCollege.recentAchievements.map((achievement: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Leading students from {selectedCollege.shortName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            #{index + 1}
                          </div>
                          <Avatar>
                            <AvatarFallback>{performer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{performer.name}</p>
                            <p className="text-sm text-muted-foreground">{performer.year} • {performer.branch}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">₹{performer.earnings.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{performer.projects} projects • {performer.rating}⭐</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">🏆</div>
                    <h3 className="font-semibold mb-2">Top Earning Hub</h3>
                    <p className="text-sm text-muted-foreground">Highest monthly earnings among all college hubs</p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="font-semibold mb-2">Most Active Community</h3>
                    <p className="text-sm text-muted-foreground">Highest student participation rate</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">⚡</div>
                    <h3 className="font-semibold mb-2">Innovation Hub</h3>
                    <p className="text-sm text-muted-foreground">Most creative and innovative projects</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="join">
              <Card>
                <CardHeader>
                  <CardTitle>Join {selectedCollege.shortName} Hub</CardTitle>
                  <CardDescription>Connect with students from your college and start earning together</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Verification Required</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        To join this hub, you need to verify your college email address ending with:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCollege.domains.map((domain: string, index: number) => (
                          <Badge key={index} variant="secondary">@{domain}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="college-email" className="block text-sm font-medium mb-2">
                          College Email Address
                        </label>
                        <Input
                          id="college-email"
                          type="email"
                          placeholder="your.name@iitd.ac.in"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="student-id" className="block text-sm font-medium mb-2">
                          Student ID (Optional)
                        </label>
                        <Input
                          id="student-id"
                          type="text"
                          placeholder="2021CS10XXX"
                          className="w-full"
                        />
                      </div>

                      <Button className="w-full">
                        Send Verification Email
                      </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      <p>Once verified, you'll get access to:</p>
                      <ul className="mt-2 space-y-1">
                        <li>✅ College-specific job boards</li>
                        <li>✅ Peer collaboration opportunities</li>
                        <li>✅ Mentorship from seniors and alumni</li>
                        <li>✅ College leaderboards and competitions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">🏫 College Hubs</h1>
            <p className="text-muted-foreground">Connect with students from your college</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search colleges by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* College List */}
        <div className="space-y-4">
          {filteredColleges.map((college) => (
            <Card key={college.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCollege(college)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{college.badge}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{college.shortName}</h3>
                        <Badge variant="outline">Rank #{college.rank}</Badge>
                        {college.verificationRequired && (
                          <Badge variant="secondary">Verified Hub</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {college.location}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{college.name}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold">{college.students}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">₹{(college.monthlyEarnings / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted-foreground">Monthly</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600">₹{(college.totalEarnings / 100000).toFixed(1)}L</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredColleges.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No colleges found matching your search.</p>
            <Button variant="outline" className="mt-4" onClick={() => setSearchTerm('')}>
              Show All Colleges
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}