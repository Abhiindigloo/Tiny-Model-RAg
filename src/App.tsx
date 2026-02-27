import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Globe, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from './types';
import { sendMessageStream } from './services/geminiService';
import { cn } from './utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = sendMessageStream([...messages, userMessage]);
      let fullText = '';
      
      // Add initial empty model message
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: fullText };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5] font-sans text-gray-900">
      {/* Sidebar / Context Panel */}
      <aside className="hidden lg:flex w-80 flex-col border-r border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">Indigloo AI Explorer</h1>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Context Source</h2>
            <div className="p-3 rounded-xl bg-gray-50 border border-black/5 flex items-center gap-3">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium truncate">indigloo.ai</span>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Capabilities</h2>
            <ul className="space-y-2">
              {['Product Features', 'Use Cases', 'Company Info', 'Technical Specs'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-auto pt-6 border-t border-black/5">
          <p className="text-xs text-gray-400 leading-relaxed">
            Powered by Gemini 3 Flash with URL Context. 
            Queries are grounded directly in indigloo.ai content.
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white lg:bg-transparent">
        <header className="lg:hidden p-4 border-b border-black/5 bg-white flex items-center justify-between">
          <h1 className="font-semibold">Indigloo AI Explorer</h1>
          <Globe className="w-5 h-5 text-gray-400" />
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mt-20 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-medium tracking-tight">How can I help you today?</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Ask anything about Indigloo AI. I have access to the latest content from their website.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                {[
                  "What does Indigloo AI do?",
                  "Tell me about their core products.",
                  "Who is Indigloo AI for?",
                  "How can I get started?"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="p-4 rounded-xl border border-black/5 bg-white hover:bg-gray-50 transition-colors text-left text-sm font-medium shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-3xl mx-auto",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  message.role === 'user' ? "bg-gray-100" : "bg-black"
                )}>
                  {message.role === 'user' ? <User className="w-4 h-4 text-gray-600" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                  message.role === 'user' 
                    ? "bg-gray-100 text-gray-800 rounded-tr-none" 
                    : "bg-white border border-black/5 text-gray-800 rounded-tl-none"
                )}>
                  <div className="markdown-body prose prose-sm max-w-none">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-8 bg-white lg:bg-transparent">
          <form 
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto relative group"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Indigloo AI..."
              className="w-full p-4 pr-12 rounded-2xl border border-black/10 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-medium">
            Indigloo AI Explorer • Powered by Gemini
          </p>
        </div>
      </main>
    </div>
  );
}
