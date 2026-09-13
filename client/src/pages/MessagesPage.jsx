import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Send,
  Search,
  MessageCircle,
  Smile,
  Check,
  CheckCheck,
  User,
  Loader2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const MessagesPage = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { userId: routeUserId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);

  // 1. Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations || []);
        // Auto select first partner or partner matching routeUserId
        if (routeUserId) {
          const match = res.data.conversations.find(
            (c) => c.partner?._id === routeUserId || c.partner?.username === routeUserId
          );
          if (match) setSelectedPartner(match.partner);
        } else if (res.data.conversations.length > 0 && !selectedPartner) {
          setSelectedPartner(res.data.conversations[0].partner);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, routeUserId]);

  // 2. Fetch messages when selected partner changes
  const fetchMessages = async (partnerId) => {
    if (!partnerId) return;
    try {
      setLoadingMessages(true);
      const res = await api.get(`/messages/${partnerId}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedPartner?._id) {
      fetchMessages(selectedPartner._id);
    }
  }, [selectedPartner]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPartner?._id) return;

    try {
      setSending(true);
      const content = messageText.trim();
      setMessageText('');

      const res = await api.post('/messages', {
        recipientId: selectedPartner._id,
        content,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.partner._id === selectedPartner._id
              ? { ...c, lastMessage: res.data.message }
              : c
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const addEmoji = (emoji) => {
    setMessageText((prev) => prev + emoji);
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c.partner?.fullName?.toLowerCase() || '';
    const username = c.partner?.username?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || username.includes(q);
  });

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex h-[calc(100vh-8.5rem)] min-h-[550px]">
      {/* LEFT SIDEBAR: Conversation List & Followers */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${
          selectedPartner ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* User Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">
              {currentUser?.username || 'Messages'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Direct Messages
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search followers or chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {loadingConversations ? (
            <div className="p-8 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-400">Loading messages...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((c) => {
              const partner = c.partner;
              const isSelected = selectedPartner?._id === partner?._id;
              const lastMsg = c.lastMessage;
              const timeStr = lastMsg?.createdAt
                ? formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false })
                : '';

              return (
                <button
                  key={partner?._id}
                  onClick={() => setSelectedPartner(partner)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-r-4 border-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={
                        partner?.avatar ||
                        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'
                      }
                      alt={partner?.fullName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    {c.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {partner?.fullName || 'Student'}
                      </p>
                      {timeStr && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {timeStr}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-blue-600 font-medium truncate">
                      @{partner?.username}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {lastMsg ? lastMsg.content : 'Tap to start conversation'}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <MessageCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No conversations found</p>
              <p className="text-[11px] text-slate-400">
                Follow other campus students to send them direct messages!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Active Chat Thread */}
      <div
        className={`flex-1 flex flex-col bg-slate-50/50 ${
          selectedPartner ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedPartner ? (
          <>
            {/* Chat Partner Header */}
            <div className="p-3.5 px-5 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <Link
                  to={`/profile/${selectedPartner.username}`}
                  className="relative shrink-0 group"
                >
                  <img
                    src={
                      selectedPartner.avatar ||
                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'
                    }
                    alt={selectedPartner.fullName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20 group-hover:scale-105 transition"
                  />
                </Link>

                <div>
                  <Link
                    to={`/profile/${selectedPartner.username}`}
                    className="text-xs font-bold text-slate-900 hover:text-blue-600 transition block leading-tight"
                  >
                    {selectedPartner.fullName}
                  </Link>
                  <span className="text-[10px] text-slate-500">
                    @{selectedPartner.username} • {selectedPartner.department || 'Student'}
                  </span>
                </div>
              </div>

              <Link
                to={`/profile/${selectedPartner.username}`}
                className="px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition"
              >
                View Profile
              </Link>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isMine =
                    msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
                  const time = msg.createdAt
                    ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })
                    : '';

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2 ${
                        isMine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isMine && (
                        <img
                          src={
                            selectedPartner.avatar ||
                            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'
                          }
                          alt="avatar"
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 mb-1"
                        />
                      )}

                      <div
                        className={`max-w-[75%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-none shadow-blue-500/10'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                            isMine ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          <span>{time}</span>
                          {isMine && <CheckCheck className="w-3 h-3 text-blue-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Say Hello to {selectedPartner.fullName}! 👋
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Collaborate on study projects, share campus news, or discuss tech topics.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200">
              {/* Quick emojis */}
              <div className="flex items-center gap-2 mb-2 px-1">
                {['❤️', '🔥', '👏', '🎓', '🙌', '👍'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="text-sm hover:scale-125 transition cursor-pointer p-0.5"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${selectedPartner.fullName}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-md shadow-blue-500/20 transition cursor-pointer"
                  title="Send message"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <MessageCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Campus Messages</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Send private messages, collaborate on projects, and connect directly with your college peers and followers.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
