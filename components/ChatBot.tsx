"use client"
import React, { useState, useEffect, useRef } from "react";
import { Message, ChatResponse } from "../types";
import { Heart, Loader, Send} from "lucide-react";

export default function ChatInterfaceWithIdeas() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedMessages = localStorage.getItem("chatHistory");
      const storedIdeas = localStorage.getItem("savedIdeas");
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
      if (storedIdeas) {
        setSavedIdeas(JSON.parse(storedIdeas));
      }
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
        console.log("Saved messages to localStorage:", messages);
      } catch (error) {
        console.error("Error saving chat history to localStorage:", error);
      }
    }
  }, [messages, isClient]);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem("savedIdeas", JSON.stringify(savedIdeas));
        console.log("Saved ideas to localStorage:", savedIdeas);
      } catch (error) {
        console.error("Error saving ideas to localStorage:", error);
      }
    }
  }, [savedIdeas, isClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
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
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prevMessages => [
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
      const newIdeas = prevIdeas.includes(idea)
        ? prevIdeas.filter((savedIdea) => savedIdea !== idea)
        : [...prevIdeas, idea];
      return newIdeas;
    });
  };

  const handleReset = () => {
    setMessages([]);
    setSavedIdeas([]);
    if (isClient) {
      localStorage.removeItem("savedIdeas");
      localStorage.removeItem("chatHistory");
      console.log("Reset: Cleared messages and localStorage");
    }
  };

  if (!isClient) {
    return null; // or a loading indicator
  }

  return (
    <div className="flex flex-col h-screen bg-[#111111] text-[#e3e3e3] sm:mx-[8%] mx-[4%] font-mono">
      <div className="flex justify-between items-center py-4 px-6 mt-4 rounded-xl bg-[#1a1a1a]">
        <h1 className="sm:text-2xl text-[16px] font-semibold">Idea Generator ChatBot</h1>
        <button
          onClick={handleReset}
          className="sm:px-8 px-4 sm:py-2 py-1 bg-[#d9a56b] font-semibold rounded-lg sm:text-lg text-sm  text-[#111111] hover:bg-[#d89d5a]"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden gap-4 mt-4 mb-4">
        <div className="flex flex-col w-full md:w-2/3 bg-[#1a1a1a] rounded-xl p-6 sm:h-full h-screen">
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
                  <div className="inline-block p-2 rounded-lg sm:text-sm text-[12px] bg-[#313131] max-w-[90%] text-white">
                    {message.content}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {message.content.split("\n\n").map((idea, ideaIndex) => (
                      <div
                        key={ideaIndex}
                        className="flex items-start space-x-2 bg-[#372b1d] rounded-lg max-w-[90%] sm:text-sm text-[12px] p-2"
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
              className="flex-1 px-4 py-2 bg-[#2f2f2f] sm:text-sm text-[12px] rounded-lg"
              placeholder="Type to generate ideas..."
            />
            <button
              type="submit"
              className="sm:px-6 px-4 sm:py-2 py-1 bg-[#d9a56b] font-semibold text-[#111111] rounded-lg hover:bg-[#d89d5a] flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="animate-spin" size={24} />
              ) : (
                <Send size={24} className={`sm:p-[2px] p-1 rounded-md  `} />
              )}
            </button>
          </form>
        </div>
        <div className="sm:flex flex-col w-full md:w-1/3 bg-[#1a1a1a] rounded-xl p-6 hidden">
          <h2 className="sm:text-xl text-[18px] font-bold mb-4 text-center">Saved Ideas</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {savedIdeas.map((idea, index) => (
              <div key={index} className="p-2 bg-[#372b1d] rounded-lg sm:text-sm text-[12px]">
                {idea}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}