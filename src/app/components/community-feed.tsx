import { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share2, MoreHorizontal, Camera, Trophy, Star, TrendingUp, Clock, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { User } from '../App';

interface CommunityFeedProps {
  user: User;
  onBack: () => void;
}

export function CommunityFeed({ user, onBack }: CommunityFeedProps) {
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  const feedPosts = [
    {
      id: 1,
      author: "Priya Sharma",
      college: "BITS Pilani",
      year: "3rd Year",
      avatar: "",
      timestamp: "2 hours ago",
      type: "milestone",
      content: "🎉 Just earned my first ₹10,000 on Workzy! Started with small logo design projects 3 months ago, and today I completed a major branding project worth ₹10K. The journey has been incredible - from learning design principles to understanding client requirements. Special thanks to the Design Club for all the support! 💪",
      images: ["/project-showcase-1.jpg", "/project-showcase-2.jpg"],
      likes: 89,
      comments: 23,
      shares: 12,
      isLiked: false,
      tags: ["milestone", "design", "branding"],
      projectDetails: {
        title: "Complete Brand Identity for Tech Startup",
        client: "TechFlow Solutions",
        duration: "2 weeks",
        skills: ["Logo Design", "Brand Guidelines", "Web Design"]
      }
    },
    {
      id: 2,
      author: "Arjun Kumar",
      college: "IIT Delhi", 
      year: "4th Year",
      avatar: "",
      timestamp: "5 hours ago",
      type: "project",
      content: "Just wrapped up an amazing full-stack e-commerce project! Built with React, Node.js, and MongoDB. The client was super happy with the payment integration and admin dashboard. Already got a referral for another project! 🚀",
      images: ["/ecommerce-project.jpg"],
      likes: 67,
      comments: 18,
      shares: 8,
      isLiked: true,
      tags: ["web-development", "full-stack", "ecommerce"],
      projectDetails: {
        title: "E-commerce Platform for Local Business",
        client: "Fashion Hub Delhi",
        duration: "3 weeks",
        skills: ["React", "Node.js", "MongoDB", "Stripe Integration"]
      }
    },
    {
      id: 3,
      author: "Sneha Reddy",
      college: "IIIT Hyderabad",
      year: "2nd Year",
      avatar: "",
      timestamp: "1 day ago",
      type: "achievement",
      content: "Won 2nd place in the Winter Hackathon! Our team built an AI-powered study buddy app that helps students with personalized learning paths. 48 hours of coding, debugging, and lots of coffee ☕. The ₹30,000 prize money is just the cherry on top - the learning experience was priceless!",
      images: ["/hackathon-team.jpg", "/app-demo.jpg"],
      likes: 134,
      comments: 31,
      shares: 24,
      isLiked: false,
      tags: ["hackathon", "ai", "mobile-app", "teamwork"],
      projectDetails: {
        title: "AI Study Buddy Mobile App",
        client: "Winter Hackathon 2024",
        duration: "48 hours",
        skills: ["Flutter", "Python", "Machine Learning", "Firebase"]
      }
    },
    {
      id: 4,
      author: "Rohit Mehta",
      college: "NIT Trichy",
      year: "4th Year",
      avatar: "",
      timestamp: "2 days ago",
      type: "tip",
      content: "Pro tip for fellow freelancers: Always ask for 50% payment upfront! Learned this the hard way after a client ghosted me. Also, use project management tools like Trello to keep clients updated on progress. Communication is key! 🔑",
      images: [],
      likes: 156,
      comments: 45,
      shares: 67,
      isLiked: true,
      tags: ["freelancing-tips", "client-management", "payment"],
      projectDetails: null
    },
    {
      id: 5,
      author: "Aisha Khan",
      college: "VIT Vellore",
      year: "3rd Year", 
      avatar: "",
      timestamp: "3 days ago",
      type: "collaboration",
      content: "Looking for a backend developer to collaborate on a fintech project! I've got the UI/UX ready and a potential client interested. Revenue sharing 60-40. Must know Node.js and have experience with payment gateways. DM me if interested! 🤝",
      images: ["/fintech-mockup.jpg"],
      likes: 43,
      comments: 29,
      shares: 15,
      isLiked: false,
      tags: ["collaboration", "fintech", "ui-ux", "backend"],
      projectDetails: {
        title: "Fintech Mobile App Design",
        client: "Potential client in talks",
        duration: "1 month estimated",
        skills: ["UI/UX Design", "Figma", "User Research"]
      }
    }
  ];

  const trendingTopics = [
    { tag: "freelancing-tips", posts: 45 },
    { tag: "web-development", posts: 38 },
    { tag: "ui-ux-design", posts: 32 },
    { tag: "milestone", posts: 28 },
    { tag: "collaboration", posts: 24 }
  ];

  const suggestedConnections = [
    { name: "Karan Joshi", college: "IIT Bombay", commonConnections: 5, skills: ["React", "Node.js"] },
    { name: "Pooja Singh", college: "DTU Delhi", commonConnections: 3, skills: ["UI/UX", "Figma"] },
    { name: "Vikram Sharma", college: "BITS Goa", commonConnections: 7, skills: ["Python", "Data Science"] }
  ];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'project':
        return <Star className="w-4 h-4 text-blue-500" />;
      case 'achievement':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'tip':
        return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'collaboration':
        return <Share2 className="w-4 h-4 text-orange-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const PostCard = ({ post }: { post: any }) => (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{post.author.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{post.author}</h4>
                  {getPostTypeIcon(post.type)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {post.year} • {post.college}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {post.timestamp}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Save Post</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Hide</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div>
            <p className="mb-3">{post.content}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Project Details */}
            {post.projectDetails && (
              <Card className="bg-muted/50 border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <h5 className="font-semibold mb-2">📋 {post.projectDetails.title}</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Client: </span>
                      <span>{post.projectDetails.client}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration: </span>
                      <span>{post.projectDetails.duration}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-muted-foreground text-sm">Skills: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.projectDetails.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images */}
            {post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {post.images.map((image: string, index: number) => (
                  <div key={index} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-6">
              <button className={`flex items-center gap-2 text-sm ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 transition-colors`}>
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </button>
              
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </button>
              
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>{post.shares}</span>
              </button>
            </div>
            
            <Button size="sm" variant="outline">Connect</Button>
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
            <h1 className="text-2xl font-bold">📱 Community Feed</h1>
            <p className="text-muted-foreground">Share your journey and celebrate with peers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Input 
                          placeholder="Share your freelancing journey..."
                          className="cursor-pointer"
                          readOnly
                        />
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New Post</DialogTitle>
                          <DialogDescription>
                            Share your projects, milestones, or tips with the community
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="What would you like to share?"
                            rows={4}
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                          />
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Camera className="w-4 h-4 mr-2" />
                              Add Photos
                            </Button>
                            <Button variant="outline" size="sm">
                              📋 Project Details
                            </Button>
                            <Button variant="outline" size="sm">
                              🏆 Achievement
                            </Button>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button>Share Post</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="my-college">My College</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {feedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="following" className="space-y-6">
                {feedPosts.filter(post => ['Priya Sharma', 'Arjun Kumar'].includes(post.author)).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="my-college" className="space-y-6">
                {feedPosts.filter(post => post.college === user.company || post.college.includes('IIT')).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="trending" className="space-y-6">
                {feedPosts.filter(post => post.likes > 100).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">#{topic.tag}</span>
                      <Badge variant="outline">{topic.posts} posts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestedConnections.map((connection, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {connection.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{connection.name}</p>
                          <p className="text-xs text-muted-foreground">{connection.college}</p>
                          <p className="text-xs text-muted-foreground">
                            {connection.commonConnections} mutual connections
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {connection.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button size="sm" variant="outline" className="w-full">
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Profile Views</span>
                    <span className="font-semibold">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Post Likes</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Connections</span>
                    <span className="font-semibold">43</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Posts Shared</span>
                    <span className="font-semibold">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}