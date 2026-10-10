import { useState } from 'react';
import { ArrowLeft, Trophy, Crown, Star, Zap, Target, Award, Medal, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
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
    { id: 'gold-coder', name: 'Gold Coder', icon: '💻', requirement: '50+ coding projects', earned: false },
    { id: 'design-pro', name: 'Design Pro', icon: '🎨', requirement: '25+ design projects', earned: false },
    { id: 'speed-demon', name: 'Speed Demon', icon: '⚡', requirement: 'Avg delivery < 2 days', earned: false },
    { id: 'mentor', name: 'Mentor', icon: '👨‍🏫', requirement: 'Help 10+ students', earned: false },
    { id: 'innovator', name: 'Innovator', icon: '💡', requirement: 'Win 3+ challenges', earned: false },
    { id: 'collaborator', name: 'Team Player', icon: '🤝', requirement: '10+ team projects', earned: false }
  ];

  const weeklyLeaderboard: any[] = [];

  const monthlyLeaderboard: any[] = [];

  const skillLeaderboards = {
    coding: [] as any[],
    design: [] as any[]
  };

  const achievements = [
    {
      title: "First Milestone",
      description: "Complete your first paid project",
      icon: "🎯",
      progress: 0,
      requirement: "0/1 projects",
      reward: "Welcome Badge"
    },
    {
      title: "Rising Star",
      description: "Complete 10 projects",
      icon: "⭐",
      progress: 0,
      requirement: "0/10 projects",
      reward: "Star Badge + ₹500 bonus"
    },
    {
      title: "Speed Delivery",
      description: "Deliver 5 projects before their deadlines",
      icon: "⚡",
      progress: 0,
      requirement: "0/5 fast deliveries",
      reward: "Speed Demon Badge"
    },
    {
      title: "Perfect Rating",
      description: "Build a strong review history",
      icon: "💎",
      progress: 0,
      requirement: "0/20 reviewed projects",
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
                      {getCurrentLeaderboard().length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Weekly rankings will appear after real student earnings and completed projects are recorded.
                        </p>
                      ) : getCurrentLeaderboard().map((student, index) => (
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
                      {monthlyLeaderboard.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Monthly rankings will appear after real student earnings and completed projects are recorded.
                        </p>
                      ) : monthlyLeaderboard.map((student, index) => (
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
                        {skillLeaderboards.coding.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            Coding rankings will appear after real completed projects.
                          </p>
                        ) : skillLeaderboards.coding.map((student, index) => (
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
                        {skillLeaderboards.design.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            Design rankings will appear after real completed projects.
                          </p>
                        ) : skillLeaderboards.design.map((student, index) => (
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
                    <span className="text-xl font-bold">-</span>
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">Not ranked yet</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-green-600">₹0</p>
                      <p className="text-xs text-muted-foreground">Earned</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">0</p>
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
