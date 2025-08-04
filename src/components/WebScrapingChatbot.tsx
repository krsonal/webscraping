import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Globe, Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

type ScrapingStatus = 'idle' | 'scraping' | 'ready' | 'error';

export const WebScrapingChatbot = () => {
  const [url, setUrl] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>('ready');
  const [isLoading, setIsLoading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const { toast } = useToast();

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleScrapeWebsite = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setScrapingStatus('scraping');

    const API_BASE_URL = import.meta.env.API_BASE_URL;
    
    try {
      // TODO: Replace with your actual scraping API endpoint
      const response = await fetch(`http://localhost:8000/api/v1/scrape/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        setScrapingStatus('ready');
        setMessages([]);
        addMessage(`✅ Successfully scraped data from: ${url}`, 'bot');
        addMessage("You can now ask me questions about the content I found on this website!", 'bot');
        toast({
          title: "Success",
          description: "Website scraped successfully! You can now ask questions.",
        });
      } else {
        throw new Error('Failed to scrape website');
      }
    } catch (error) {
      setScrapingStatus('error');
      toast({
        title: "Error",
        description: "Failed to scrape the website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim()) return;
    

    const question = currentQuestion;
    setCurrentQuestion('');
    addMessage(question, 'user');
    setIsAsking(true);
    const API_BASE_URL = import.meta.env.API_BASE_URL;

    try {
      // TODO: Replace with your actual QnA API endpoint
      const response = await fetch(`http://localhost:8000/api/v1/ask/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (response.ok) {
        const data = await response.json();
        addMessage(data.answer || "I couldn't find an answer to your question.", 'bot');
      } else {
        throw new Error('Failed to get answer');
      }
    } catch (error) {
      addMessage("Sorry, I encountered an error while processing your question. Please try again.", 'bot');
      toast({
        title: "Error",
        description: "Failed to get answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAsking(false);
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      idle: { text: 'Ready for questions', variant: 'secondary' as const },
      scraping: { text: 'Scraping...', variant: 'default' as const },
      ready: { text: 'Ready for questions', variant: 'default' as const },
      error: { text: 'Error occurred', variant: 'destructive' as const },
    };

    const config = statusConfig[scrapingStatus];
    return (
      <Badge 
        variant={config.variant}
        className={cn(
          "transition-all duration-200",
          scrapingStatus === 'scraping' && "bg-status-scraping text-foreground",
          scrapingStatus === 'ready' && "bg-status-ready text-foreground",
          scrapingStatus === 'error' && "bg-status-error text-foreground"
        )}
      >
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Web Scraping Chatbot</h1>
          <p className="text-muted-foreground">Enter a website URL to scrape its content, then ask questions about it</p>
        </div>

        {/* URL Input Section */}
        <Card className="p-6 border border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Website Scraper
              </h2>
              {getStatusBadge()}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="https://www.example.com/"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-chat-input text-chat-input-foreground border-border"
                disabled={isLoading}
              />
              <Button 
                onClick={handleScrapeWebsite}
                disabled={isLoading || !url.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  'Scrape Website'
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Chat Interface */}
        <Card className="border border-border">
          <div className="h-96 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Ask me questions about stored data or scrape a new website!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 items-start",
                        message.type === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.type === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-chat-bubble-bot flex items-center justify-center">
                          <Bot className="w-4 h-4 text-chat-bubble-bot-foreground" />
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-2",
                          message.type === 'user'
                            ? "bg-chat-bubble-user text-chat-bubble-user-foreground"
                            : "bg-chat-bubble-bot text-chat-bubble-bot-foreground border border-border"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      {message.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-chat-bubble-user flex items-center justify-center">
                          <User className="w-4 h-4 text-chat-bubble-user-foreground" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {isAsking && (
                  <div className="flex gap-3 items-start justify-start">
                    <div className="w-8 h-8 rounded-full bg-chat-bubble-bot flex items-center justify-center">
                      <Bot className="w-4 h-4 text-chat-bubble-bot-foreground" />
                    </div>
                    <div className="bg-chat-bubble-bot text-chat-bubble-bot-foreground border border-border rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question about the scraped content..."
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                  className="flex-1 bg-chat-input text-chat-input-foreground border-border"
                  disabled={isAsking}
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={!currentQuestion.trim() || isAsking}
                  size="icon"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};