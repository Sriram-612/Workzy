import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { 
  ChevronLeft, Send, Paperclip, Search, MoreVertical,
  Phone, Video, Star, Clock, Plus, MessageSquare, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '../App';

interface MessagingScreenProps {
  user: User;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  project: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file';
}

export function MessagingScreen({ user }: MessagingScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactProject, setNewContactProject] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: user.name,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), message]
    }));

    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: newMessage, timestamp: message.timestamp }
        : conv
    ));

    setNewMessage('');
  };

  const startNewConversation = () => {
    if (!newContactName.trim()) return;

    const newConversation: Conversation = {
      id: Date.now().toString(),
      name: newContactName,
      avatar: '',
      lastMessage: '',
      timestamp: '',
      unreadCount: 0,
      isOnline: Math.random() > 0.5, // Random online status
      project: newContactProject || 'General'
    };

    setConversations(prev => [newConversation, ...prev]);
    setMessages(prev => ({ ...prev, [newConversation.id]: [] }));
    setSelectedConversation(newConversation);
    setShowNewMessageDialog(false);
    setNewContactName('');
    setNewContactProject('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = selectedConversation ? messages[selectedConversation.id] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mr-6">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl text-foreground">Messages</h1>
            </div>
            <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                  <DialogDescription>
                    Enter the contact details to start a new conversation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-foreground">Contact Name</label>
                    <Input
                      placeholder="Enter contact name..."
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-foreground">Project (Optional)</label>
                    <Input
                      placeholder="Enter project name..."
                      value={newContactProject}
                      onChange={(e) => setNewContactProject(e.target.value)}
                    />
                  </div>
                  <Button onClick={startNewConversation} className="w-full">
                    Start Conversation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]"
        >
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardContent className="p-0">
              {/* Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Conversations */}
              <ScrollArea className="h-full">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg text-foreground mb-2">No Messages Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start a conversation with freelancers or clients to begin collaborating on projects.
                    </p>
                    <Button onClick={() => setShowNewMessageDialog(true)} size="sm">
                      Send your first message
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-accent border-r-2 border-r-primary' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={conversation.avatar} />
                              <AvatarFallback>
                                {conversation.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm text-foreground truncate">{conversation.name}</h4>
                              <div className="flex items-center gap-1">
                                {conversation.timestamp && (
                                  <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                                )}
                                {conversation.unreadCount > 0 && (
                                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-xs text-primary-foreground">{conversation.unreadCount}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-xs text-primary mb-1">{conversation.project}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {conversation.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedConversation.avatar} />
                        <AvatarFallback>
                          {selectedConversation.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm text-foreground">{selectedConversation.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{selectedConversation.project}</span>
                        {selectedConversation.isOnline && (
                          <Badge variant="secondary" className="text-xs">
                            Online
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {currentMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Avatar className="w-16 h-16 mb-4">
                        <AvatarImage src={selectedConversation.avatar} />
                        <AvatarFallback className="text-lg">
                          {selectedConversation.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg text-foreground mb-2">{selectedConversation.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{selectedConversation.project}</p>
                      <p className="text-xs text-muted-foreground">Start your conversation now</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${message.senderId === 'me' ? 'order-2' : 'order-1'}`}>
                            {message.senderId !== 'me' && (
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={selectedConversation.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {selectedConversation.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{message.senderName}</span>
                              </div>
                            )}
                            
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                message.senderId === 'me'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              {message.type === 'file' ? (
                                <div className="flex items-center gap-2">
                                  <Paperclip className="w-4 h-4" />
                                  <span className="text-sm underline cursor-pointer">{message.content}</span>
                                </div>
                              ) : (
                                <p className="text-sm">{message.content}</p>
                              )}
                            </div>
                            
                            <div className={`flex items-center gap-1 mt-1 ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="rounded-full pr-12"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                        className="absolute right-1 top-1 bottom-1 px-3 rounded-full"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Users className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg text-foreground mb-2">Select a Conversation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a conversation from the left to start messaging, or create a new conversation.
                </p>
                <Button onClick={() => setShowNewMessageDialog(true)} size="sm">
                  Start New Conversation
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}