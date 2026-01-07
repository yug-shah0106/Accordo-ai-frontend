/**
 * ConversationDealPage
 * Alternate conversation view for deals with conversation mode
 * Integrates with existing hooks from src/hooks/chatbot
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { chatbotService } from '../../services/chatbot.service';
import { Message, Deal, Explainability, ConversationState } from '../../types';

export default function ConversationDealPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [_conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainability, setExplainability] = useState<Explainability | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (!dealId || startedRef.current) return;

    const initConversation = async () => {
      try {
        startedRef.current = true;
        setLoading(true);

        // Get the deal first
        const dealResponse = await chatbotService.getDeal(dealId);
        setDeal(dealResponse.data.deal);

        // Start the conversation (auto-sends greeting)
        const response = await chatbotService.startConversation(dealId);

        // Build messages array from conversation response
        const msgs: Message[] = [];
        if (response.data.vendorMessage) msgs.push(response.data.vendorMessage);
        if (response.data.accordoMessage) msgs.push(response.data.accordoMessage);

        setMessages(msgs);
        setConversationState(response.data.conversationState);
      } catch (error: any) {
        console.error('Error starting conversation:', error);
        toast.error(error.response?.data?.error || 'Failed to start conversation');
        navigate('/chatbot');
      } finally {
        setLoading(false);
      }
    };

    initConversation();
  }, [dealId, navigate]);

  // Send vendor message
  const handleSend = async () => {
    if (!input.trim() || !dealId || sending) return;

    const message = input.trim();
    setInput('');
    setSending(true);

    try {
      const response = await chatbotService.sendConversationMessage(dealId, message);

      // Add new messages to the list
      const newMessages: Message[] = [...messages];
      if (response.data.vendorMessage) newMessages.push(response.data.vendorMessage);
      if (response.data.accordoMessage) newMessages.push(response.data.accordoMessage);

      setMessages(newMessages);
      setConversationState(response.data.conversationState);

      // Refresh deal to get updated status
      const dealResponse = await chatbotService.getDeal(dealId);
      setDeal(dealResponse.data.deal);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Get explainability
  const handleExplain = async () => {
    if (!dealId) return;

    try {
      const response = await chatbotService.getConversationExplainability(dealId);
      setExplainability(response.data.explainability);
      setExplainOpen(true);
    } catch (error: any) {
      console.error('Error getting explainability:', error);
      toast.error('No explainability available yet');
    }
  };

  const canSend = deal?.status === 'NEGOTIATING' && !sending;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {deal?.title || 'Conversation'}
              </h1>
              <p className="text-sm text-gray-600">
                Status: <span className="font-medium">{deal?.status || '—'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExplain}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Explain Last Move
              </button>
              <button
                onClick={() => navigate('/chatbot')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Back to Deals
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-6 py-6 space-y-4">
          {messages.map((msg, idx) => (
            <MessageBubble key={msg.id || idx} message={msg} />
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4 max-w-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-6 py-4 pb-6 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={canSend ? 'Type as vendor...' : 'Deal is closed'}
              disabled={!canSend}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!canSend || !input.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Explainability Panel */}
      <div className="hidden lg:block w-96 bg-white border-l border-gray-200 overflow-y-auto max-h-screen">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Optional Explainability
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Hidden by default. Use "Explain last move" during internal review.
          </p>

          {explainOpen && explainability ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Decision</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Action:</span>
                    <span className="font-medium text-gray-900">
                      {explainability.decision.action}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utility:</span>
                    <span className="font-medium text-gray-900">
                      {explainability.utilities.total !== null
                        ? `${(explainability.utilities.total * 100).toFixed(1)}%`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Utilities</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-gray-900">
                      {explainability.utilities.priceUtility !== null
                        ? `${(explainability.utilities.priceUtility * 100).toFixed(1)}%`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terms:</span>
                    <span className="font-medium text-gray-900">
                      {explainability.utilities.termsUtility !== null
                        ? `${(explainability.utilities.termsUtility * 100).toFixed(1)}%`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Reasons</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  {explainability.decision.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setExplainOpen(false)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Hide Explainability
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm py-8">
              Click "Explain Last Move" to view negotiation insights
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  const isAccordo = message.role === 'ACCORDO';
  const isSystem = message.role === 'SYSTEM';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-200 text-gray-700 text-xs p-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAccordo ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-md rounded-lg p-4 ${
          isAccordo
            ? 'bg-white border border-gray-200'
            : 'bg-blue-600 text-white'
        }`}
      >
        <div className="text-xs font-medium mb-1 opacity-70">
          {isAccordo ? 'Riya (Procurement)' : 'Vendor'}
        </div>
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        {message.createdAt && (
          <div className="text-xs opacity-60 mt-2">
            {new Date(message.createdAt).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
