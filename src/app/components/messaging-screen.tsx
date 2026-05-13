import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  ChevronLeft,
  Send,
  Paperclip,
  Search,
  MessageSquare,
  Users,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { User } from '../App';
import { messagesAPI, userAPI } from '../services/api';

interface MessagingScreenProps {
  user: User;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string | null;
  role?: string;
  email?: string;
}

interface Conversation {
  id: string;
  otherUserId: string;
  name: string;
  email: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file';
}

function parseParticipants(raw: unknown): Participant[] {
  if (Array.isArray(raw)) return raw as Participant[];
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapConversationRow(row: Record<string, unknown>, currentUserId: string): Conversation | null {
  const parts = parseParticipants(row.participants).filter((p) => p.id !== currentUserId);
  const other = parts[0];
  if (!other?.id) return null;
  const lastAt = row.last_message_at ? new Date(String(row.last_message_at)) : null;
  return {
    id: String(row.id),
    otherUserId: other.id,
    name: other.name || 'Unknown',
    email: other.email || '',
    avatar: other.avatar || '',
    lastMessage: row.last_message ? String(row.last_message) : '',
    timestamp: lastAt && !Number.isNaN(lastAt.getTime()) ? format(lastAt, 'MMM d, p') : '',
    unreadCount: Number(row.unread_count ?? 0),
  };
}

export function MessagingScreen({ user }: MessagingScreenProps) {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [verifiedProfileName, setVerifiedProfileName] = useState<string | null>(null);

  const loadConversations = useCallback(async (): Promise<Conversation[]> => {
    setListLoading(true);
    try {
      const res = await messagesAPI.getConversations();
      const rows = (res as { conversations?: Record<string, unknown>[] }).conversations || [];
      const mapped = rows
        .map((r) => mapConversationRow(r, user.id))
        .filter((c): c is Conversation => c !== null);
      setConversations(mapped);
      return mapped;
    } catch (e) {
      console.error(e);
      toast.error('Could not load conversations. Is the server running?');
      setConversations([]);
      return [];
    } finally {
      setListLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    if (!email) return;
    setNewRecipientEmail(decodeURIComponent(email));
    if (name) setNewRecipientName(decodeURIComponent(name));
    setShowNewMessageDialog(true);
  }, [searchParams]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setMessagesLoading(true);
      try {
        const res = await messagesAPI.getConversationMessages(conversationId);
        const rows = (res as { messages?: Record<string, unknown>[] }).messages || [];
        const mapped: Message[] = rows.map((m) => ({
          id: String(m.id),
          senderId: String(m.sender_id) === String(user.id) ? 'me' : String(m.sender_id),
          senderName: String(m.sender_name || 'User'),
          content: String(m.content || ''),
          timestamp:
            m.created_at && !Number.isNaN(new Date(String(m.created_at)).getTime())
              ? format(new Date(String(m.created_at)), 'p')
              : '',
          type: 'text',
        }));
        setMessages(mapped);
      } catch (e) {
        console.error(e);
        toast.error('Could not load messages for this conversation.');
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    [user.id]
  );

  useEffect(() => {
    if (selectedConversation) {
      void loadMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, loadMessages]);

  const handleVerifyRecipient = async () => {
    const email = newRecipientEmail.trim();
    if (!email) {
      toast.error('Enter the recipient email first.');
      return;
    }
    setLookupBusy(true);
    setVerifiedProfileName(null);
    try {
      const res = (await userAPI.lookupByEmail(email)) as { user?: { name?: string } };
      const name = res.user?.name;
      if (!name) throw new Error('Unexpected response');
      setVerifiedProfileName(name);
      setNewRecipientName((prev) => (prev.trim() ? prev : name));
      toast.success(`Found: ${name}. Enter this exact full name in the field below to send.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lookup failed';
      toast.error(msg);
    } finally {
      setLookupBusy(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSendBusy(true);
    try {
      await messagesAPI.sendMessage({
        receiverId: selectedConversation.otherUserId,
        content: newMessage.trim(),
      });
      setNewMessage('');
      await loadMessages(selectedConversation.id);
      await loadConversations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send';
      toast.error(msg);
    } finally {
      setSendBusy(false);
    }
  };

  const startNewConversation = async () => {
    const email = newRecipientEmail.trim();
    const name = newRecipientName.trim();
    const body = firstMessage.trim();
    if (!email || !name) {
      toast.error('Recipient email and full name are required.');
      return;
    }
    if (!body) {
      toast.error('Enter a message to send.');
      return;
    }
    const content = newTopic.trim() ? `Topic: ${newTopic.trim()}\n\n${body}` : body;
    setSendBusy(true);
    try {
      const res = await messagesAPI.sendMessage({
        receiverEmail: email,
        recipientName: name,
        content,
      });
      const data = (res as { data?: { conversation_id?: string } }).data;
      const convId = data?.conversation_id ? String(data.conversation_id) : null;
      setShowNewMessageDialog(false);
      setNewRecipientEmail('');
      setNewRecipientName('');
      setNewTopic('');
      setFirstMessage('');
      setVerifiedProfileName(null);
      toast.success('Message sent.');
      const mapped = await loadConversations();
      if (convId) {
        const sel = mapped.find((c) => c.id === convId);
        if (sel) setSelectedConversation(sel);
        else if (mapped.length > 0) setSelectedConversation(mapped[0]);
      } else if (mapped.length > 0) {
        setSelectedConversation(mapped[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send';
      toast.error(msg);
    } finally {
      setSendBusy(false);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card shadow-sm border-b border-border shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0">
              <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mr-6 shrink-0">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </Link>
              <h1 className="text-xl text-foreground truncate">Messages</h1>
            </div>
            <Dialog
              open={showNewMessageDialog}
              onOpenChange={(open) => {
                setShowNewMessageDialog(open);
                if (!open) {
                  setVerifiedProfileName(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                  New message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Message someone on Workzy</DialogTitle>
                  <DialogDescription>
                    Enter their registered email and the full name on their profile. They will see this in their
                    Messages inbox.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recv-email">Recipient email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="recv-email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={newRecipientEmail}
                        onChange={(e) => {
                          setNewRecipientEmail(e.target.value);
                          setVerifiedProfileName(null);
                        }}
                      />
                      <Button type="button" variant="secondary" disabled={lookupBusy} onClick={() => void handleVerifyRecipient()}>
                        {lookupBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                    </div>
                    {verifiedProfileName && (
                      <p className="text-xs text-muted-foreground">
                        Profile name on file: <span className="font-medium text-foreground">{verifiedProfileName}</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recv-name">Recipient full name (must match their profile)</Label>
                    <Input
                      id="recv-name"
                      placeholder="Exact name shown on their Workzy account"
                      value={newRecipientName}
                      onChange={(e) => setNewRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic (optional)</Label>
                    <Input
                      id="topic"
                      placeholder="e.g. Website redesign"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="first-msg">Message</Label>
                    <Textarea
                      id="first-msg"
                      rows={4}
                      placeholder="Write your message…"
                      value={firstMessage}
                      onChange={(e) => setFirstMessage(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => void startNewConversation()} className="w-full" disabled={sendBusy}>
                    {sendBusy ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      'Send message'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col min-h-0 w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 lg:h-[calc(100vh-10rem)]"
        >
          <Card className="lg:col-span-1 flex flex-col min-h-[280px] lg:min-h-0 overflow-hidden">
            <CardContent className="p-0 flex flex-col flex-1 min-h-0">
              <div className="p-4 border-b border-border shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name or email…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1 min-h-0">
                {listLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg text-foreground mb-2">No conversations yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send a message using the recipient&apos;s Workzy email and profile name. They will see it here when
                      they sign in.
                    </p>
                    <Button onClick={() => setShowNewMessageDialog(true)} size="sm">
                      New message
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredConversations.map((conversation) => (
                      <button
                        type="button"
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-accent border-l-2 border-l-primary' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>{conversation.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h4 className="text-sm font-medium text-foreground truncate">{conversation.name}</h4>
                              {conversation.timestamp && (
                                <span className="text-xs text-muted-foreground shrink-0">{conversation.timestamp}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mb-1">{conversation.email}</p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                                {conversation.lastMessage || 'No messages yet'}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="default" className="shrink-0 h-5 min-w-5 px-1.5 text-[10px]">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 flex flex-col min-h-[360px] lg:min-h-0 overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-border flex items-center gap-3 shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback>{selectedConversation.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground truncate">{selectedConversation.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{selectedConversation.email}</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0 p-4">
                  {messagesLoading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground text-sm">
                      No messages in this thread yet.
                    </div>
                  ) : (
                    <div className="space-y-4 pr-2">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] sm:max-w-md ${message.senderId === 'me' ? 'order-2' : 'order-1'}`}>
                            {message.senderId !== 'me' && (
                              <div className="flex items-center gap-2 mb-1">
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
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                            <p
                              className={`text-xs text-muted-foreground mt-1 ${
                                message.senderId === 'me' ? 'text-right' : ''
                              }`}
                            >
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t border-border shrink-0">
                  <div className="flex items-end gap-2">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0" disabled title="Coming soon">
                      <Paperclip className="w-4 h-4 opacity-50" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message…"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void handleSendMessage();
                          }
                        }}
                        disabled={sendBusy}
                        className="pr-12"
                      />
                      <Button
                        type="button"
                        onClick={() => void handleSendMessage()}
                        disabled={!newMessage.trim() || sendBusy}
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      >
                        {sendBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center p-8 text-muted-foreground">
                <Users className="w-14 h-14 mb-4 opacity-60" />
                <h3 className="text-lg text-foreground mb-2">Select a conversation</h3>
                <p className="text-sm max-w-sm mb-4">
                  Choose a thread on the left, or start a new message with someone&apos;s Workzy email and profile name.
                </p>
                <Button onClick={() => setShowNewMessageDialog(true)} size="sm" variant="secondary">
                  New message
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
