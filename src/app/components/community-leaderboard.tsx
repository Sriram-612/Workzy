import { useState } from 'react';
import { ArrowLeft, Trophy, Crown, Star, Zap, Target, Award, Medal, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { User } from '../App';

interface CommunityLeaderboardProps {
  user: User;
  onBack: () => void;
}

export function CommunityLeaderboard({ user, onBack }: CommunityLeaderboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  const badges = [
    { id: 'gold-coder', name: 'Gold Coder', icon: '💻', requirement: '50+ coding projects', earned: true },
    { id: 'design-pro', name: 'Design Pro', icon: '🎨', requirement: '25+ design projects', earned: true },
    { id: 'speed-demon', name: 'Speed Demon', icon: '⚡', requirement: 'Avg delivery < 2 days', earned: false },
    { id: 'mentor', name: 'Mentor', icon: '👨‍🏫', requirement: 'Help 10+ students', earned: false },
    { id: 'innovator', name: 'Innovator', icon: '💡', requirement: 'Win 3+ challenges', earned: true },
    { id: 'collaborator', name: 'Team Player', icon: '🤝', requirement: '10+ team projects', earned: false }
  ];

  const weeklyLeaderboard = [
    {
      rank: 1,
      name: "Arjun Kumar",
      college: "IIT Delhi",
      earnings: 15670,
      projects: 8,
      rating: 4.9,
      trend: "up",
      badges: ["gold-coder", "speed-demon"],
      speciality: "Full Stack Development"
    },
    {
      rank: 2,
      name: "Priya Sharma",
      college: "BITS Pilani",
      earnings: 12450,
      projects: 6,
      rating: 4.8,
      trend: "up",
      badges: ["design-pro", "innovator"],
      speciality: "UI/UX Design"
    },
    {
      rank: 3,
      name: "Rohit Mehta",
      college: "NIT Trichy",
      earnings: 11230,
      projects: 7,
      rating: 4.9,
      trend: "down",
      badges: ["gold-coder", "mentor"],
      speciality: "Backend Development"
    },
    {
      rank: 4,
      name: "Sneha Reddy",
      college: "IIIT Hyderabad",
      earnings: 9890,
      projects: 5,
      rating: 4.7,
      trend: "up",
      badges: ["design-pro"],
      speciality: "Mobile App Design"
    },
    {
      rank: 5,
      name: "Vikram Singh",
      college: "VIT Vellore",
      earnings: 8750,
      projects: 4,
      rating: 4.6,
      trend: "same",
      badges: ["collaborator"],
      speciality: "Data Science"
    }
  ];

  const monthlyLeaderboard = [
    {
      rank: 1,
      name: "Priya Sharma",
      college: "BITS Pilani",
      earnings: 45670,
      projects: 22,
      rating: 4.8,
      trend: "up",
      badges: ["design-pro", "innovator", "speed-demon"],
      speciality: "UI/UX Design"
    },
    {
      rank: 2,
      name: "Arjun Kumar",
      college: "IIT Delhi",
      earnings: 43210,
      projects: 28,
      rating: 4.9,
      trend: "down",
      badges: ["gold-coder", "speed-demon", "mentor"],
      speciality: "Full Stack Development"
    },
    {
      rank: 3,
      name: "Rohit Mehta",
      college: "NIT Trichy",
      earnings: 38950,
      projects: 25,
      rating: 4.9,
      trend: "up",
      badges: ["gold-coder", "mentor", "collaborator"],
      speciality: "Backend Development"
    }
  ];

  const skillLeaderboards = {
    coding: [
      { rank: 1, name: "Arjun Kumar", college: "IIT Delhi", projects: 28, rating: 4.9, earnings: 43210 },
      { rank: 2, name: "Rohit Mehta", college: "NIT Trichy", projects: 25, rating: 4.9, earnings: 38950 },
      { rank: 3, name: "Karan Joshi", college: "IIT Bombay", projects: 22, rating: 4.8, earnings: 35670 }
    ],
    design: [
      { rank: 1, name: "Priya Sharma", college: "BITS Pilani", projects: 22, rating: 4.8, earnings: 45670 },
      { rank: 2, name: "Sneha Reddy", college: "IIIT Hyderabad", projects: 18, rating: 4.7, earnings: 32450 },
      { rank: 3, name: "Aisha Khan", college: "NID Ahmedabad", projects: 16, rating: 4.9, earnings: 29800 }
    ]
  };

  const achievements = [
    {
      title: "First Milestone",
      description: "Earned your first ₹500",
      icon: "🎯",
      progress: 100,
      requirement: "₹500",
      reward: "Welcome Badge"
    },
    {
      title: "Rising Star",
      description: "Complete 10 projects",
      icon: "⭐",
      progress: 80,
      requirement: "8/10 projects",
      reward: "Star Badge + ₹500 bonus"
    },
    {
      title: "Speed Delivery",
      description: "Deliver 5 projects in 24 hours",
      icon: "⚡",
      progress: 60,
      requirement: "3/5 fast deliveries",
      reward: "Speed Demon Badge"
    },
    {
      title: "Perfect Rating",
      description: "Maintain 4.8+ rating for 20 projects",
      icon: "💎",
      progress: 45,
      requirement: "9/20 projects with 4.8+",
      reward: "Diamond Badge + Premium features"
    }
  ];

  const getCurrentLeaderboard = () => {
    return selectedPeriod === 'weekly' ? weeklyLeaderboard : monthlyLeaderboard;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ChevronUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ChevronDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-bold">{rank}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">🏆 Community Leaderboard</h1>
            <p className="text-muted-foreground">Rankings, achievements, and recognition</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly">This Week</TabsTrigger>
                <TabsTrigger value="monthly">This Month</TabsTrigger>
                <TabsTrigger value="skills">By Skills</TabsTrigger>
              </TabsList>

              <TabsContent value="weekly" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Weekly Top Performers
                    </CardTitle>
                    <CardDescription>Students who earned the most this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getCurrentLeaderboard().map((student, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${student.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {getRankIcon(student.rank)}
                                {getTrendIcon(student.trend)}
                              </div>
                              
                              <Avatar className="w-12 h-12">
                                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{student.name}</h4>
                                  {student.badges.map((badge, badgeIndex) => (
                                    <Badge key={badgeIndex} variant="secondary" className="text-xs">
                                      {badges.find(b => b.id === badge)?.icon}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground">{student.college}</p>
                                <p className="text-xs text-muted-foreground">{student.speciality}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-bold text-green-600">₹{student.earnings.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">{student.projects} projects</p>
                              <p className="text-sm flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                {student.rating}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Monthly Champions
                    </CardTitle>
                    <CardDescription>Top performers this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyLeaderboard.map((student, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${student.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {getRankIcon(student.rank)}
                                {getTrendIcon(student.trend)}
                              </div>
                              
                              <Avatar className="w-12 h-12">
                                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{student.name}</h4>
                                  {student.badges.map((badge, badgeIndex) => (
                                    <Badge key={badgeIndex} variant="secondary" className="text-xs">
                                      {badges.find(b => b.id === badge)?.icon}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground">{student.college}</p>
                                <p className="text-xs text-muted-foreground">{student.speciality}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-bold text-green-600">₹{student.earnings.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">{student.projects} projects</p>
                              <p className="text-sm flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                {student.rating}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        💻 Top Coders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {skillLeaderboards.coding.map((student, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${getRankColor(student.rank)}`}>#{student.rank}</span>
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.college}</p>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-semibold text-green-600">₹{(student.earnings / 1000).toFixed(0)}K</p>
                              <p className="text-xs text-muted-foreground">{student.projects} projects</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🎨 Top Designers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {skillLeaderboards.design.map((student, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${getRankColor(student.rank)}`}>#{student.rank}</span>
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.college}</p>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-semibold text-green-600">₹{(student.earnings / 1000).toFixed(0)}K</p>
                              <p className="text-xs text-muted-foreground">{student.projects} projects</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Rank */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Your Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold">#23</span>
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">Weekly Rank</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-green-600">₹4,560</p>
                      <p className="text-xs text-muted-foreground">Earned</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">3</p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-center ${
                        badge.earned
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200'
                          : 'bg-muted/50 opacity-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <p className="text-xs font-medium">{badge.name}</p>
                      {!badge.earned && (
                        <p className="text-xs text-muted-foreground mt-1">{badge.requirement}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Achievement Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{achievement.icon}</span>
                          <div>
                            <p className="text-sm font-medium">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{achievement.requirement}</span>
                        <span>{achievement.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}