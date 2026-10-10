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

  const feedPosts: {
    id: number;
    author: string;
    college: string;
    year: string;
    type: string;
    content: string;
    images: string[];
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    tags: string[];
    timestamp: string;
    projectDetails: Record<string, unknown> | null;
  }[] = [];

  const trendingTopics: { tag: string; posts: number }[] = [];
  const suggestedConnections: { name: string; college: string; commonConnections: number; skills: string[] }[] = [];

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

  const renderPostList = (posts: typeof feedPosts) => {
    if (posts.length === 0) {
      return (
        <p className="text-center py-12 text-muted-foreground">
          No posts yet. Be the first to share your freelancing journey!
        </p>
      );
    }
    return posts.map((post) => <PostCard key={post.id} post={post} />);
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
                {renderPostList(feedPosts)}
              </TabsContent>

              <TabsContent value="following" className="space-y-6">
                {renderPostList([])}
              </TabsContent>

              <TabsContent value="my-college" className="space-y-6">
                {renderPostList(
                  feedPosts.filter(
                    (post) =>
                      user.collegeName &&
                      post.college.toLowerCase() === user.collegeName.toLowerCase()
                  )
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-6">
                {renderPostList([...feedPosts].sort((a, b) => b.likes - a.likes))}
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
                {trendingTopics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Topics will appear as students post.</p>
                ) : (
                  <div className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">#{topic.tag}</span>
                        <Badge variant="outline">{topic.posts} posts</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggested Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Connections</CardTitle>
              </CardHeader>
              <CardContent>
                {suggestedConnections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Suggestions will appear as more students join your college hub.
                  </p>
                ) : (
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
                )}
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
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Post Likes</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Connections</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Posts Shared</span>
                    <span className="font-semibold">0</span>
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