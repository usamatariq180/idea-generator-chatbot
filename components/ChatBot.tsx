import React, { useState, useEffect, useRef } from "react";
import { Message, ChatResponse } from "../types";
import { Heart, Loader, Send} from "lucide-react";

export default function ChatInterfaceWithIdeas() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const storedIdeas = localStorage.getItem("savedIdeas");
    if (storedIdeas) {
      setSavedIdeas(JSON.parse(storedIdeas));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [userMessage] }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data: ChatResponse = await response.json();
      const ideas: string[] = JSON.parse(data.response);

      const assistantMessage: Message = {
        role: "assistant",
        content: ideas.join("\n\n"),
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
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

  const toggleSaveIdea = (idea: string) => {
    setSavedIdeas((prevIdeas) => {
      let newIdeas;
      if (prevIdeas.includes(idea)) {
        newIdeas = prevIdeas.filter((savedIdea) => savedIdea !== idea);
      } else {
        newIdeas = [...prevIdeas, idea];
      }
      localStorage.setItem("savedIdeas", JSON.stringify(newIdeas));
      return newIdeas;
    });
  };

  const handleReset = () => {
    setMessages([]);
    setSavedIdeas([]);
    localStorage.removeItem("savedIdeas");
  };

  return (
    <div className="flex flex-col h-screen bg-[#111111] text-[#e3e3e3] mx-[8%] font-mono">
      <div className="flex justify-between items-center py-4 px-6 mt-4 rounded-xl bg-[#1a1a1a]">
        <h1 className="text-2xl font-semibold">Idea Generator ChatBot</h1>
        <button
          onClick={handleReset}
          className="px-8 py-2 bg-[#d9a56b] font-semibold rounded-lg text-[#111111] hover:bg-[#d89d5a]"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden gap-4 mt-4 mb-4">
        <div className="flex flex-col w-full md:w-2/3 bg-[#1a1a1a] rounded-xl p-6">
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
                  <div className="inline-block p-2 rounded-lg text-sm bg-[#313131] max-w-[90%] text-white">
                    {message.content}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {message.content.split("\n\n").map((idea, ideaIndex) => (
                      <div
                        key={ideaIndex}
                        className="flex items-start space-x-2 bg-[#372b1d] rounded-lg max-w-[90%] text-sm p-2"
                      >
                        <div className="flex-grow text-white">{idea}</div>
                        <button
                          onClick={() => toggleSaveIdea(idea)}
                          className="focus:outline-none"
                        >
                          {idea !==
                            "Please write something specific to get some great ideas!" &&
                            idea !==
                              "Sorry, I encountered an error. Please try again." && (
                              <Heart
                                size={24}
                                className={`p-[6px] rounded-md bg-[#444444] ${
                                  savedIdeas.includes(idea)
                                    ? "fill-red-500 text-red-500"
                                    : "text-white"
                                }`}
                              />
                            )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 bg-[#2f2f2f] text-sm rounded-lg"
              placeholder="Type to generate ideas..."
            />
            <button
              type="submit"
              className="px-6 py-2 bg-[#d9a56b] font-semibold text-[#111111] rounded-lg hover:bg-[#d89d5a] flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="animate-spin" size={24} />
              ) : (
                <Send size={24} className={`p-[2px] rounded-md  `} />
              )}
            </button>
          </form>
        </div>
        <div className="flex flex-col w-full md:w-1/3 bg-[#1a1a1a] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Saved Ideas</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {savedIdeas.map((idea, index) => (
              <div key={index} className="p-2 bg-[#372b1d] rounded-lg text-sm">
                {idea}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
