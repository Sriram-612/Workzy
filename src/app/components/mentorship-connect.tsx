import { useState } from 'react';
import { ArrowLeft, Users, Star, Clock, MessageCircle, BookOpen, Trophy, MapPin, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { User } from '../App';

interface MentorshipConnectProps {
  user: User;
  onBack: () => void;
}

export function MentorshipConnect({ user, onBack }: MentorshipConnectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [requestMessage, setRequestMessage] = useState('');

  const availableMentors: any[] = [];

  const myMentorships: any[] = [];

  const mentorRequests: any[] = [];

  const filteredMentors = availableMentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         mentor.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = skillFilter === 'all' || mentor.expertise.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()));
    const matchesCollege = collegeFilter === 'all' || mentor.college === collegeFilter;
    
    return matchesSearch && matchesSkill && matchesCollege;
  });

  const skillOptions = ['all'];
  const collegeOptions = ['all'];

  const MentorCard = ({ mentor }: { mentor: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg">{mentor.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{mentor.name}</h3>
                <Badge variant={mentor.currentRole === 'Alumni' ? 'default' : 'secondary'}>
                  {mentor.currentRole}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">{mentor.title} at {mentor.company}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {mentor.college} • Class of {mentor.graduationYear}
              </p>
              
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{mentor.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{mentor.mentees} mentees</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span>{mentor.responseTime}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-lg">₹{mentor.pricePerSession}</p>
              <p className="text-xs text-muted-foreground">per session</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{mentor.bio}</p>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise.map((skill: string, index: number) => (
                <Badge key={index} variant="outline">{skill}</Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Experience: </span>
              <span className="font-medium">{mentor.experience}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Availability: </span>
              <span className="font-medium">{mentor.availability}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1">Request Mentorship</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Mentorship from {mentor.name}</DialogTitle>
                  <DialogDescription>
                    Tell {mentor.name} why you'd like their mentorship and what you hope to learn.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Session Topic</label>
                    <Input placeholder="e.g., Career guidance, Interview preparation, Project review" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea
                      placeholder="Introduce yourself and explain what you're looking for..."
                      rows={4}
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Send Request</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline">View Profile</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">👨‍🏫 Mentorship Connect</h1>
            <p className="text-muted-foreground">Learn from seniors and alumni</p>
          </div>
        </div>

        <Tabs defaultValue="find-mentors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="find-mentors">Find Mentors</TabsTrigger>
            <TabsTrigger value="my-mentorships">My Mentorships</TabsTrigger>
            <TabsTrigger value="mentor-requests">Mentor Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="find-mentors" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Input
                      placeholder="Search mentors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-4"
                    />
                  </div>
                  
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillOptions.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill === 'all' ? 'All Skills' : skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by college" />
                    </SelectTrigger>
                    <SelectContent>
                      {collegeOptions.map((college) => (
                        <SelectItem key={college} value={college}>
                          {college === 'all' ? 'All Colleges' : college}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mentors List */}
            <div className="space-y-4">
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>

            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No mentors found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSearchTerm('');
                  setSkillFilter('all');
                  setCollegeFilter('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-mentorships" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myMentorships.map((mentorship, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Mentorship with {mentorship.mentor}
                    </CardTitle>
                    <CardDescription>
                      {mentorship.sessions} sessions completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Next Session</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>{mentorship.nextSession}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Topic: {mentorship.topic}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">Reschedule</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {myMentorships.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <p className="text-muted-foreground">You don't have any active mentorships yet.</p>
                  <Button className="mt-4">Find a Mentor</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mentor-requests" className="space-y-6">
            {user.role === 'freelancer' && (
              <Card>
                <CardHeader>
                  <CardTitle>Become a Mentor</CardTitle>
                  <CardDescription>
                    Share your knowledge and help junior students grow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      As an experienced freelancer, you can mentor other students and earn extra income while giving back to the community.
                    </p>
                    <Button>Apply to Become a Mentor</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {mentorRequests.map((request, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{request.mentee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{request.mentee}</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.year} • {request.college}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{request.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{request.requestedAt}</p>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-1">Topic: {request.topic}</h5>
                        <p className="text-sm text-muted-foreground">{request.message}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm">Accept</Button>
                        <Button size="sm" variant="outline">Decline</Button>
                        <Button size="sm" variant="ghost">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {mentorRequests.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No pending mentor requests.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
