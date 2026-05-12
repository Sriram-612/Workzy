import { useState } from 'react';
import { ArrowLeft, Plus, Search, MessageCircle, ThumbsUp, ThumbsDown, Pin, Star, TrendingUp, Clock, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User } from '../App';

interface DiscussionForumProps {
  user: User;
  onBack: () => void;
}

export function DiscussionForum({ user, onBack }: DiscussionForumProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');

  const categories = [
    { id: 'all', name: 'All Topics', count: 245, color: 'bg-gray-500' },
    { id: 'freelancing-tips', name: 'Freelancing Tips', count: 67, color: 'bg-blue-500' },
    { id: 'project-help', name: 'Project Help', count: 54, color: 'bg-green-500' },
    { id: 'skill-development', name: 'Skill Development', count: 43, color: 'bg-purple-500' },
    { id: 'career-advice', name: 'Career Advice', count: 38, color: 'bg-orange-500' },
    { id: 'success-stories', name: 'Success Stories', count: 25, color: 'bg-yellow-500' },
    { id: 'college-specific', name: 'College Specific', count: 18, color: 'bg-pink-500' }
  ];

  const discussions = [
    {
      id: 1,
      title: "How to price your first freelance project?",
      content: "I'm a 2nd year CSE student and got my first potential client. They want a simple e-commerce website. How should I price it?",
      author: "Rahul Kumar",
      college: "IIT Delhi",
      category: "freelancing-tips",
      createdAt: "2 hours ago",
      replies: 12,
      upvotes: 24,
      views: 156,
      isPinned: false,
      isSolved: false,
      tags: ["pricing", "web-development", "beginner"]
    },
    {
      id: 2,
      title: "🎉 Just earned my first ₹10,000 on Workzy!",
      content: "Started with small logo design projects 3 months ago. Today I completed a major branding project worth ₹10K. Here's my journey...",
      author: "Priya Sharma",
      college: "BITS Pilani",
      category: "success-stories",
      createdAt: "4 hours ago",
      replies: 28,
      upvotes: 89,
      views: 423,
      isPinned: true,
      isSolved: false,
      tags: ["milestone", "design", "success"]
    },
    {
      id: 3,
      title: "Looking for React.js mentor - willing to share earnings",
      content: "I'm working on a complex React project for a client. Need guidance on state management and API integration. Happy to share 20% of project earnings.",
      author: "Arjun Patel",
      college: "NIT Trichy",
      category: "project-help",
      createdAt: "6 hours ago",
      replies: 8,
      upvotes: 15,
      views: 92,
      isPinned: false,
      isSolved: true,
      tags: ["react", "mentorship", "collaboration"]
    },
    {
      id: 4,
      title: "Which skills are most in-demand for college students?",
      content: "Planning to learn new skills during summer break. What skills should I focus on to get more freelance opportunities?",
      author: "Sneha Reddy",
      college: "IIIT Hyderabad",
      category: "skill-development",
      createdAt: "8 hours ago",
      replies: 34,
      upvotes: 67,
      views: 289,
      isPinned: false,
      isSolved: false,
      tags: ["skills", "learning", "career"]
    },
    {
      id: 5,
      title: "VIT Vellore - Coding Club Hackathon winners announced!",
      content: "Congratulations to all winners of our internal hackathon. Top 3 teams get direct access to premium client projects!",
      author: "Rohit Mehta",
      college: "VIT Vellore",
      category: "college-specific",
      createdAt: "1 day ago",
      replies: 19,
      upvotes: 45,
      views: 167,
      isPinned: false,
      isSolved: false,
      tags: ["hackathon", "vit", "announcement"]
    }
  ];

  const trendingTopics = [
    { tag: "web-development", posts: 34 },
    { tag: "ui-ux-design", posts: 28 },
    { tag: "pricing", posts: 22 },
    { tag: "freelancing-tips", posts: 19 },
    { tag: "client-communication", posts: 15 }
  ];

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = () => {
    // Handle post creation logic here
    console.log('Creating post:', { title: newPostTitle, content: newPostContent, category: newPostCategory });
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostCategory('');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">💬 Discussion Forum</h1>
              <p className="text-muted-foreground">Ask questions, share tips, and connect with peers</p>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Discussion</DialogTitle>
                <DialogDescription>
                  Share your question, tip, or experience with the community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="post-title" className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    id="post-title"
                    placeholder="What's your question or topic?"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="post-category" className="block text-sm font-medium mb-2">Category</label>
                  <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat.id !== 'all').map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="post-content" className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    id="post-content"
                    placeholder="Describe your question or share your experience..."
                    rows={6}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <Button onClick={handleCreatePost}>Post Discussion</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary">{category.count}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">#{topic.tag}</span>
                      <Badge variant="outline">{topic.posts}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Discussions */}
            <Tabs defaultValue="recent" className="w-full">
              <TabsList>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4">
                {filteredDiscussions.map((discussion) => (
                  <Card key={discussion.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {discussion.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                              {discussion.isSolved && <Star className="w-4 h-4 text-green-500" />}
                              <h3 className="font-semibold hover:text-primary transition-colors">
                                {discussion.title}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {discussion.content}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {discussion.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {discussion.author.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm">
                                <span className="font-medium">{discussion.author}</span>
                                <span className="text-muted-foreground"> from {discussion.college}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {discussion.createdAt}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {discussion.views}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {discussion.replies}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {discussion.upvotes}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="popular" className="space-y-4">
                {filteredDiscussions
                  .sort((a, b) => b.upvotes - a.upvotes)
                  .map((discussion) => (
                    <Card key={discussion.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {discussion.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                                {discussion.isSolved && <Star className="w-4 h-4 text-green-500" />}
                                <h3 className="font-semibold hover:text-primary transition-colors">
                                  {discussion.title}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {discussion.content}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {discussion.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {discussion.author.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                  <span className="font-medium">{discussion.author}</span>
                                  <span className="text-muted-foreground"> from {discussion.college}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {discussion.createdAt}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {discussion.views}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {discussion.replies}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                {discussion.upvotes}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="unanswered" className="space-y-4">
                {filteredDiscussions
                  .filter(discussion => !discussion.isSolved && discussion.replies === 0)
                  .map((discussion) => (
                    <Card key={discussion.id} className="cursor-pointer hover:shadow-md transition-shadow border-orange-200">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="destructive" className="text-xs">Needs Help</Badge>
                                <h3 className="font-semibold hover:text-primary transition-colors">
                                  {discussion.title}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {discussion.content}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {discussion.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {discussion.author.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                  <span className="font-medium">{discussion.author}</span>
                                  <span className="text-muted-foreground"> from {discussion.college}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {discussion.createdAt}
                              </div>
                            </div>

                            <Button size="sm">Help Answer</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}