import { useState } from 'react';
import { ArrowLeft, Calendar, Trophy, Users, Clock, Gift, Star, Target, Zap, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { User } from '../App';

interface EventsChallengesProps {
  user: User;
  onBack: () => void;
}

export function EventsChallenges({ user, onBack }: EventsChallengesProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const ongoingEvents = [
    {
      id: 1,
      title: "Winter Hackathon 2024",
      type: "hackathon",
      description: "Build innovative solutions for real-world problems in 48 hours",
      startDate: "Dec 15, 2024",
      endDate: "Dec 17, 2024",
      participants: 1247,
      maxParticipants: 2000,
      prizes: ["₹50,000", "₹30,000", "₹20,000"],
      skills: ["Web Development", "Mobile Apps", "AI/ML"],
      status: "ongoing",
      timeLeft: "2 days 14 hours",
      organizer: "Workzy Community",
      difficulty: "Advanced",
      teamSize: "2-4 members",
      registrationDeadline: "Dec 14, 2024"
    },
    {
      id: 2,
      title: "Logo Design Sprint",
      type: "design-contest",
      description: "Create stunning logos for startup brands in 7 days",
      startDate: "Dec 10, 2024",
      endDate: "Dec 17, 2024",
      participants: 456,
      maxParticipants: 1000,
      prizes: ["₹15,000", "₹10,000", "₹5,000"],
      skills: ["Logo Design", "Branding", "Adobe Illustrator"],
      status: "ongoing",
      timeLeft: "5 days 8 hours",
      organizer: "Design Club",
      difficulty: "Intermediate",
      teamSize: "Individual",
      registrationDeadline: "Dec 12, 2024"
    }
  ];

  const upcomingEvents = [
    {
      id: 3,
      title: "New Year Coding Challenge",
      type: "coding-contest",
      description: "Solve algorithmic problems and compete with the best coders",
      startDate: "Jan 1, 2025",
      endDate: "Jan 3, 2025",
      participants: 0,
      maxParticipants: 5000,
      prizes: ["₹1,00,000", "₹60,000", "₹40,000"],
      skills: ["Data Structures", "Algorithms", "Problem Solving"],
      status: "upcoming",
      timeLeft: "16 days",
      organizer: "Coding Club",
      difficulty: "Expert",
      teamSize: "Individual",
      registrationDeadline: "Dec 30, 2024"
    },
    {
      id: 4,
      title: "UI/UX Innovation Week",
      type: "design-challenge",
      description: "Redesign popular apps with innovative user experiences",
      startDate: "Jan 15, 2025",
      endDate: "Jan 22, 2025",
      participants: 0,
      maxParticipants: 1500,
      prizes: ["₹35,000", "₹25,000", "₹15,000"],
      skills: ["UI Design", "UX Research", "Prototyping"],
      status: "upcoming",
      timeLeft: "30 days",
      organizer: "UX Guild",
      difficulty: "Intermediate",
      teamSize: "1-2 members",
      registrationDeadline: "Jan 10, 2025"
    }
  ];

  const pastEvents = [
    {
      id: 5,
      title: "Autumn Code Fest",
      type: "hackathon",
      description: "Mobile app development competition",
      startDate: "Nov 10, 2024",
      endDate: "Nov 12, 2024",
      participants: 2145,
      winners: [
        { name: "Team Phoenix", members: ["Arjun K.", "Priya S.", "Rohit M."], prize: "₹75,000" },
        { name: "Code Warriors", members: ["Sneha R.", "Vikram S."], prize: "₹50,000" },
        { name: "Digital Innovators", members: ["Karan J.", "Aisha K.", "Ravi P."], prize: "₹25,000" }
      ],
      status: "completed"
    }
  ];

  const weeklyMissions = [
    {
      id: 1,
      title: "First Client Success",
      description: "Complete your first project with 5-star rating",
      progress: 75,
      reward: "₹500 bonus + Success Badge",
      difficulty: "Beginner",
      timeLeft: "3 days",
      requirement: "1 project with 5-star rating"
    },
    {
      id: 2,
      title: "Speed Demon",
      description: "Deliver 3 projects within 24 hours each",
      progress: 33,
      reward: "₹1,000 bonus + Speed Badge",
      difficulty: "Intermediate", 
      timeLeft: "5 days",
      requirement: "1/3 fast deliveries completed"
    },
    {
      id: 3,
      title: "Community Helper",
      description: "Help 5 students in discussion forum",
      progress: 60,
      reward: "₹300 bonus + Mentor Badge",
      difficulty: "Easy",
      timeLeft: "4 days",
      requirement: "3/5 helpful answers"
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hackathon':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'design-contest':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'coding-contest':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'design-challenge':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const EventCard = ({ event, showJoinButton = true }: { event: any, showJoinButton?: boolean }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedEvent(event)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getEventTypeColor(event.type)}>
                  {event.type.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline" className={getDifficultyColor(event.difficulty)}>
                  {event.difficulty}
                </Badge>
                {event.status === 'ongoing' && (
                  <Badge variant="destructive">LIVE</Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{event.startDate}</p>
                <p className="text-muted-foreground text-xs">Start Date</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{event.participants.toLocaleString()}</p>
                <p className="text-muted-foreground text-xs">Participants</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{event.prizes[0]}</p>
                <p className="text-muted-foreground text-xs">First Prize</p>
              </div>
            </div>
            
            {event.timeLeft && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{event.timeLeft}</p>
                  <p className="text-muted-foreground text-xs">Time Left</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {event.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))}
          </div>

          {showJoinButton && (
            <div className="flex gap-2">
              <Button className="flex-1">
                {event.status === 'ongoing' ? 'Join Now' : 'Register'}
              </Button>
              <Button variant="outline">Learn More</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedEvent.title}</h1>
              <p className="text-muted-foreground">Event Details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{selectedEvent.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Event Type</h4>
                      <Badge className={getEventTypeColor(selectedEvent.type)}>
                        {selectedEvent.type.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Difficulty</h4>
                      <Badge className={getDifficultyColor(selectedEvent.difficulty)}>
                        {selectedEvent.difficulty}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Team Size</h4>
                      <p>{selectedEvent.teamSize}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Organizer</h4>
                      <p>{selectedEvent.organizer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prize Pool</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedEvent.prizes.map((prize: string, index: number) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl mb-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <p className="font-bold text-lg">{prize}</p>
                        <p className="text-sm text-muted-foreground">
                          {index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold">Registration Deadline</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.registrationDeadline}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Start Date</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.startDate}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">End Date</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.endDate}</p>
                  </div>
                  
                  {selectedEvent.timeLeft && (
                    <div>
                      <p className="font-semibold">Time Remaining</p>
                      <p className="text-lg font-bold text-primary">{selectedEvent.timeLeft}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Participation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Participants</span>
                      <span className="text-sm">{selectedEvent.participants}/{selectedEvent.maxParticipants}</span>
                    </div>
                    <Progress value={(selectedEvent.participants / selectedEvent.maxParticipants) * 100} />
                  </div>
                  
                  <Button className="w-full" size="lg">
                    {selectedEvent.status === 'ongoing' ? 'Join Now' : 'Register'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">🎯 Events & Challenges</h1>
            <p className="text-muted-foreground">Compete, learn, and win amazing prizes</p>
          </div>
        </div>

        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ongoing">Live Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="missions">Weekly Missions</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ongoingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="missions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weeklyMissions.map((mission) => (
                <Card key={mission.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <Badge className={getDifficultyColor(mission.difficulty)}>
                          {mission.difficulty}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">{mission.title}</h3>
                        <p className="text-sm text-muted-foreground">{mission.description}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{mission.progress}%</span>
                        </div>
                        <Progress value={mission.progress} />
                        <p className="text-xs text-muted-foreground">{mission.requirement}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Reward</span>
                        </div>
                        <p className="text-sm text-green-600">{mission.reward}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {mission.timeLeft} left
                        </div>
                        <Button size="sm">Continue</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {event.title}
                  </CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {event.startDate} - {event.endDate}
                      </span>
                      <Badge variant="secondary">{event.participants.toLocaleString()} participants</Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">🏆 Winners</h4>
                      <div className="space-y-2">
                        {event.winners.map((winner: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </span>
                              <div>
                                <p className="font-medium">{winner.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {winner.members.join(', ')}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-green-600">
                              {winner.prize}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}