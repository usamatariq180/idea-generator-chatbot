import React, { useState, useEffect, useRef } from "react";
import { Message } from "../types";
import { Loader, Send, ChevronDown, ChevronUp } from "lucide-react";

export default function ChatInterfaceWithIdeas() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedIdea, setLastGeneratedIdea] = useState<string>("");
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedTopics] = useState([
    "Healthy meal planning",
    "Business startup ideas",
    "DIY home improvement projects",
    "Fitness workout routines",
    "Book recommendations",
    "Travel destinations",
  ]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedMessages = localStorage.getItem("chatHistory");
      const storedIdeas = localStorage.getItem("savedIdeas");
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedIdeas) setSavedIdeas(JSON.parse(storedIdeas));
    }
  }, [isClient]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem("chatHistory", JSON.stringify(messages));
        localStorage.setItem("savedIdeas", JSON.stringify(savedIdeas));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  }, [messages, savedIdeas, isClient]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | null,
    submittedInput?: string
  ) => {
    if (e) e.preventDefault();
    const inputToSubmit = submittedInput || input;
    if (!inputToSubmit.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputToSubmit };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMessage] }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      if (data.intent === "save" && lastGeneratedIdea) {
        setSavedIdeas((prevMessages) => [...prevMessages, lastGeneratedIdea]);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content:
              "I've saved that idea for you! Feel free to generate another one.",
          },
        ]);
        setLastGeneratedIdea("");
      } else {
        // Remove JSON.parse since the content is already a string
        setLastGeneratedIdea(data.content);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: data.content,
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setSavedIdeas([]);
    setLastGeneratedIdea("");
    if (isClient) {
      localStorage.removeItem("savedIdeas");
      localStorage.removeItem("chatHistory");
    }
  };

  const handleSuggestedTopic = (topic: string) => {
    setInput(topic);
    handleSubmit(null, topic);
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col h-screen bg-[#111111] text-[#e3e3e3] sm:mx-[8%] mx-[4%] font-mono">
      <div className="flex justify-between items-center py-4 px-6 mt-4 rounded-2xl bg-[#1a1a1a]">
        <h1 className="sm:text-2xl text-[16px] font-semibold">
          Idea Generator ChatBot
        </h1>
        <button
          onClick={handleReset}
          className="sm:px-8 px-4 sm:py-2 py-1 bg-[#d9a56b] font-semibold rounded-xl sm:text-lg text-sm text-[#111111] hover:bg-[#d89d5a]"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden gap-4 mt-4 mb-4">
        <div className="md:hidden w-full bg-[#1a1a1a] rounded-2xl">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-6 py-2 flex justify-between items-center text-[16px] font-semibold"
          >
            Saved Ideas ({savedIdeas.length})
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {isOpen && (
            <div className="p-4 space-y-2 overflow-y-auto sm:min-h-full min-h-[calc(100vh-23vh)]">
              {savedIdeas.map((idea, index) => (
                <div
                  key={index}
                  className="p-2 bg-[#372b1d] rounded-xl text-[12px]"
                >
                  {idea}
                </div>
              ))}
              {savedIdeas.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-[#9ca3af] sm:text-base text-[12px] text-center">
                    No saved ideas!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {!isOpen && (
          <div className="flex flex-col w-full md:w-2/3 bg-[#1a1a1a] rounded-2xl p-6 sm:min-h-full min-h-[calc(100vh-26vh)]">
            <div
              ref={chatWindowRef}
              className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {message.role === "user" ? (
                    <div className="inline-block p-3 rounded-xl sm:text-sm text-[12px] bg-[#313131] max-w-[90%] text-white">
                      {message.content}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {message.content.split("\n\n").map((idea, ideaIndex) => (
                        <div
                          key={ideaIndex}
                          className="flex items-start space-x-2 bg-[#372b1d] rounded-xl sm:max-w-[80%] max-w-[90%] sm:text-sm text-[12px] p-4"
                        >
                          <div className="flex-grow text-white">{idea}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {messages && messages.length === 0 && (
                <>
                  <div className=" h-[100%] flex flex-col  items-center justify-center">
                    <p className="mb-4 text-[#9ca3af] sm:text-base text-[12px] text-center">
                      Here are some prompts to get you started:
                    </p>
                    <div className="flex flex-wrap justify-center pb-2 gap-4">
                      {suggestedTopics.map((topic, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedTopic(topic)}
                          className="sm:py-3 py-2 sm:px-6 px-4 bg-[#372b1d] rounded-xl sm:text-sm text-[12px] hover:bg-[#4a3a2a] transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#2f2f2f] sm:text-sm text-[12px] rounded-xl"
                placeholder="Type to generate or save ideas..."
              />
              <button
                type="submit"
                className="sm:px-6 px-4 sm:py-2 py-1 bg-[#d9a56b] font-semibold text-[#111111] rounded-xl hover:bg-[#d89d5a] flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin" size={24} />
                ) : (
                  <Send size={24} className={`sm:p-[2px] p-1 rounded-md `} />
                )}
              </button>
            </form>
          </div>
        )}

        <div className="sm:flex flex-col w-full md:w-1/3 bg-[#1a1a1a] rounded-2xl p-6 hidden">
          <h2 className="sm:text-xl text-[18px] font-bold mb-4 text-center">
            Saved Ideas ({savedIdeas.length})
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {savedIdeas.map((idea, index) => (
              <div
                key={index}
                className="p-4 bg-[#372b1d] rounded-xl sm:text-sm text-[12px]"
              >
                {idea}
              </div>
            ))}
            {savedIdeas.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="mb-4 text-[#9ca3af] sm:text-base text-[12px] text-center">
                  No saved ideas!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
