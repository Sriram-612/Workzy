import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy, BookOpen, Calendar, MessageSquare, Star, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { User } from '../App';

interface CommunityHubProps {
  user: User;
  onBack: () => void;
  onNavigate: (section: string) => void;
}

export function CommunityHub({ user, onBack, onNavigate }: CommunityHubProps) {
  const [stats, setStats] = useState({
    totalStudents: 12453,
    activeColleges: 847,
    skillClubs: 24,
    weeklyEarnings: 2847500,
    completedProjects: 3421
  });

  const topColleges = [
    { name: "IIT Delhi", students: 1247, earnings: 345670, badge: "🏆" },
    { name: "BITS Pilani", students: 892, earnings: 234580, badge: "🥈" },
    { name: "NIT Trichy", students: 756, earnings: 198340, badge: "🥉" },
    { name: "IIIT Hyderabad", students: 623, earnings: 167890, badge: "⭐" },
    { name: "VIT Vellore", students: 534, earnings: 145230, badge: "💎" }
  ];

  const featuredSkillClubs = [
    { name: "Coding Club", members: 3421, color: "bg-blue-500", icon: "💻" },
    { name: "Design Club", members: 1876, color: "bg-purple-500", icon: "🎨" },
    { name: "Marketing Club", members: 1234, color: "bg-green-500", icon: "📊" },
    { name: "Tutoring Club", members: 2145, color: "bg-orange-500", icon: "📚" }
  ];

  const recentActivity = [
    { user: "Arjun K.", college: "IIT Delhi", action: "Won Design Challenge", amount: "₹15,000", time: "2 hours ago" },
    { user: "Priya S.", college: "BITS Pilani", action: "Completed Tutoring Session", amount: "₹800", time: "4 hours ago" },
    { user: "Rohit M.", college: "NIT Trichy", action: "Delivered Web Project", amount: "₹12,500", time: "6 hours ago" },
    { user: "Sneha R.", college: "IIIT Hyderabad", action: "First Earning Milestone", amount: "₹500", time: "1 day ago" }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1693011142814-aa33d7d1535c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU4OTc1NDM5fDA&ixlib=rb-4.1.0&q=80&w=1080" 
          alt="University campus community"
          className="w-full h-full object-cover opacity-6 dark:opacity-12"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/70 to-blue-50/70 dark:from-purple-950/70 dark:to-blue-950/70"></div>
        <div className="absolute inset-0 backdrop-blur-[0.5px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">🏫 Student Community</h1>
              <p className="text-muted-foreground">Learn, Connect, and Earn Together</p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {stats.totalStudents.toLocaleString()} Active Students
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-lg font-semibold">{stats.totalStudents.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Colleges</p>
                  <p className="text-lg font-semibold">{stats.activeColleges}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Skill Clubs</p>
                  <p className="text-lg font-semibold">{stats.skillClubs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                  <p className="text-lg font-semibold">{stats.completedProjects.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Earnings</p>
                  <p className="text-lg font-semibold">₹{(stats.weeklyEarnings / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="colleges">College Hubs</TabsTrigger>
            <TabsTrigger value="clubs">Skill Clubs</TabsTrigger>
            <TabsTrigger value="activity">Live Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('colleges')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    🏫
                  </div>
                  <h3 className="font-semibold mb-2">College Hubs</h3>
                  <p className="text-sm text-muted-foreground">Join your college community</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('forum')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    💬
                  </div>
                  <h3 className="font-semibold mb-2">Discussion Forum</h3>
                  <p className="text-sm text-muted-foreground">Ask questions & share tips</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('leaderboard')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    🏆
                  </div>
                  <h3 className="font-semibold mb-2">Leaderboards</h3>
                  <p className="text-sm text-muted-foreground">See top performers</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('events')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    🎯
                  </div>
                  <h3 className="font-semibold mb-2">Events & Challenges</h3>
                  <p className="text-sm text-muted-foreground">Compete and win rewards</p>
                </CardContent>
              </Card>
            </div>

            {/* Featured Skill Clubs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Featured Skill Clubs
                </CardTitle>
                <CardDescription>Join clubs based on your interests and skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredSkillClubs.map((club, index) => (
                    <div key={index} className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{club.icon}</div>
                        <div>
                          <h4 className="font-semibold">{club.name}</h4>
                          <p className="text-sm text-muted-foreground">{club.members.toLocaleString()} members</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">Join Club</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colleges">
            <Card>
              <CardHeader>
                <CardTitle>🏆 Top College Hubs</CardTitle>
                <CardDescription>Leading colleges by student participation and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topColleges.map((college, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{college.badge}</div>
                        <div>
                          <h4 className="font-semibold">{college.name}</h4>
                          <p className="text-sm text-muted-foreground">{college.students.toLocaleString()} active students</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{college.earnings.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total earnings</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button className="w-full" onClick={() => onNavigate('colleges')}>
                    View All College Hubs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clubs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredSkillClubs.map((club, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="text-2xl">{club.icon}</div>
                      {club.name}
                    </CardTitle>
                    <CardDescription>{club.members.toLocaleString()} active members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Active Projects</span>
                        <span className="font-semibold">{Math.floor(club.members * 0.1)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. Weekly Earnings</span>
                        <span className="font-semibold text-green-600">₹{(club.members * 2.5).toLocaleString()}</span>
                      </div>
                      <Button className="w-full">Join {club.name}</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Live Community Activity
                </CardTitle>
                <CardDescription>Real-time updates from the student community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{activity.user}</p>
                          <p className="text-sm text-muted-foreground">{activity.college}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm">{activity.action}</p>
                        <p className="font-semibold text-green-600">{activity.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}