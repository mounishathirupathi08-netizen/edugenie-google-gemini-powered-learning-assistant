import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Image as ImageIcon,
  X,
  RotateCcw,
  Copy,
  Check,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { ChatMessage, SubjectItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { AudioPlayerButton } from '../AudioPlayerButton';

interface TutorChatViewProps {
  profile: UserProfile;
  activeSubject: SubjectItem;
  onSolveDoubtRedirect?: (question: string) => void;
}

export const TutorChatView: React.FC<TutorChatViewProps> = ({
  profile,
  activeSubject,
  onSolveDoubtRedirect,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${profile.name}! 👋 I am **EduGenie**, your personal learning tutor powered by **Google Gemini**.

I'm currently primed for **${activeSubject.name}** at your **${profile.gradeLevel}** level in **${profile.preferredLanguage}**.

How can I help you today?
- Ask any conceptual question or paste homework questions
- Upload a diagram or handwritten problem photo 📷
- Toggle **Socratic Mode** below if you want guided hints instead of direct answers!`,
      timestamp: Date.now(),
      subject: activeSubject.name,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [socraticMode, setSocraticMode] = useState(false);
  const [conciseMode, setConciseMode] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if ((!messageText.trim() && !selectedImage) || loading) return;

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: messageText || (selectedImage ? '[Attached study image / problem]' : ''),
      timestamp: Date.now(),
      subject: activeSubject.name,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    const curImg = selectedImage;
    const curMime = imageMime;
    setSelectedImage(null);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const reply = await api.sendChat({
        message: messageText,
        history,
        subject: activeSubject.name,
        gradeLevel: profile.gradeLevel,
        learningStyle: profile.learningStyle,
        socraticMode,
        conciseMode,
        language: profile.preferredLanguage,
        imageBase64: curImg || undefined,
        imageMimeType: curMime,
      });

      const assistantMessage: ChatMessage = {
        id: 'reply_' + Date.now(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        subject: activeSubject.name,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      storage.recordActivity('doubt', messageText.slice(0, 40) || 'Tutoring conversation', 'Tutor Chat', activeSubject.name);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Error communicating with EduGenie:** ${err.message || 'Please check your connection and try again.'}`,
        timestamp: Date.now(),
        subject: activeSubject.name,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        content: `Fresh conversation started for **${activeSubject.name}**! Ask me anything or try one of the prompt starters below.`,
        timestamp: Date.now(),
        subject: activeSubject.name,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] max-w-5xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Bar with Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{activeSubject.name}</span>
          </div>
          <span className="text-xs text-slate-400">• {profile.gradeLevel}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Concise Mode Toggle */}
          <button
            type="button"
            onClick={() => setConciseMode(!conciseMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              conciseMode
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Concise mode delivers smart, punchy, high-yield answers without extra fluff"
          >
            <Zap className={`w-3.5 h-3.5 ${conciseMode ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Concise Mode: <strong>{conciseMode ? 'ON' : 'OFF'}</strong></span>
            <span className="sm:hidden">{conciseMode ? 'Concise' : 'Detailed'}</span>
          </button>

          {/* Socratic Mode Toggle */}
          <button
            type="button"
            onClick={() => setSocraticMode(!socraticMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              socraticMode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Socratic mode guides you with discovery questions rather than simply giving answers"
          >
            <BrainCircuit className={`w-3.5 h-3.5 ${socraticMode ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Socratic Mode: <strong>{socraticMode ? 'ON' : 'OFF'}</strong></span>
            <span className="sm:hidden">{socraticMode ? 'Socratic' : 'Direct'}</span>
          </button>

          {/* Reset Chat */}
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Clear Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                  : 'bg-gradient-to-tr from-amber-500 to-pink-500 text-white'
              }`}
            >
              {msg.role === 'user' ? profile.name.charAt(0) : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl p-4 text-sm leading-relaxed border shadow-md relative group ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white border-indigo-500/50'
                  : 'bg-slate-800/90 text-slate-100 border-slate-700/80'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-[13.5px]">
                {msg.content}
              </div>

              {/* Action buttons for assistant message */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-700/50">
                  <AudioPlayerButton text={msg.content} />

                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {onSolveDoubtRedirect && (
                    <button
                      onClick={() => onSolveDoubtRedirect(messages[messages.length - 2]?.content || '')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors ml-auto"
                      title="Open in Step-by-Step Doubt Solver"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Full Step Breakdown</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 mr-auto max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-2xl p-4 bg-slate-800/80 border border-slate-700/80 text-sm text-slate-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>EduGenie is thinking through the concept...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-800/60 flex flex-wrap gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Quick Starters:
          </span>
          {activeSubject.sampleQuestions.slice(0, 3).map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sq)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 border border-slate-700/60 transition-all text-left truncate max-w-xs"
            >
              {sq}
            </button>
          ))}
        </div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="px-4 py-2 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={selectedImage}
              alt="Uploaded problem"
              className="w-12 h-12 object-cover rounded-lg border border-slate-600"
            />
            <div className="text-xs">
              <span className="font-semibold text-indigo-300">Attached Study Image</span>
              <p className="text-[11px] text-slate-400">Gemini will analyze diagrams, formulas, or handwriting</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-indigo-300 border border-slate-700 transition-colors"
            title="Upload problem image, diagram or screenshot"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask EduGenie any question in ${activeSubject.name}...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || loading}
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
