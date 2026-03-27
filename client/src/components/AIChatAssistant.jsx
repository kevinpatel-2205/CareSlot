import { useState, useEffect, useRef } from "react";
import { Bot, Send, X, MessageSquare, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessageToAI } from "../store/ai";

// This component now only renders the WINDOW.
// The button is handled in your DashboardLayout header.
function AIChatAssistant({ open, setOpen }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const dispatch = useDispatch();
  const { messages, loading } = useSelector((state) => state.ai);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch(sendMessageToAI(input));
    setInput("");
  };

  if (!open) return null;

  return (
    <>
      {/* CHAT WINDOW */}
      <div
        className={`fixed z-[110] bg-white flex flex-col transition-all duration-500 shadow-[0_10px_50px_rgba(0,0,0,0.2)]
          /* Mobile View */
          inset-x-0 bottom-0 w-full h-[85vh] rounded-t-[2.5rem]
          sm:inset-auto sm:right-8 sm:bottom-8 sm:w-[400px] sm:h-[600px] sm:rounded-3xl
          animate-in slide-in-from-bottom-10 duration-300
        `}
      >
        {/* HEADER */}
        <div className="bg-[#2e7df2] p-5 text-white flex items-center justify-between shrink-0 rounded-t-[2.5rem] sm:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">CareSlot AI</h3>
              <p className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Healthcare Assistant
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* MESSAGES */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8fafc]"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 transform -rotate-6">
                <Sparkles size={32} />
              </div>
              <h4 className="text-gray-800 font-bold text-lg">
                Hello, {user?.name || "there"}!
              </h4>
              <p className="text-sm text-gray-500 mt-2">
                Ask me about your appointments, doctors, or health records.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 text-sm shadow-sm leading-relaxed
                ${
                  msg.role === "user"
                    ? "bg-[#2e7df2] text-white rounded-2xl rounded-tr-none"
                    : "bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="p-5 bg-white border-t border-gray-100 sm:rounded-b-3xl">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-2 py-1.5 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask CareSlot AI..."
              className="flex-1 bg-transparent border-none text-sm outline-none py-2"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 bg-[#2e7df2] text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-30 flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY (Mobile) */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[105] sm:hidden"
        onClick={() => setOpen(false)}
      />
    </>
  );
}

export default AIChatAssistant;
