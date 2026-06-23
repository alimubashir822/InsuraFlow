'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/context';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  ArrowRight, 
  BrainCircuit, 
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'copilot';
  text: string;
  timestamp: Date;
  insightType?: 'success' | 'warning' | 'info';
}

export default function AICopilot() {
  const { patients, currentRole } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'copilot',
      text: "Hello! I am your InsuraFlow AI Billing Copilot. I analyze clinic queues, decode coverage plans, and inspect claims for rejection risk. How can I help you today?",
      timestamp: new Date(),
    }
  ]);

  const presetPrompts = [
    { label: "Is tomorrow's schedule ready?", query: "schedule" },
    { label: "Why did Robert's verification fail?", query: "robert" },
    { label: "Explain John Smith's out-of-pocket costs", query: "john" },
    { label: "Check implant claim rejection risk", query: "implant" },
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Generate response with slight delay
    setTimeout(() => {
      const response = generateAIResponse(text.toLowerCase());
      setMessages(prev => [...prev, response]);
    }, 600);
  };

  const generateAIResponse = (query: string): ChatMessage => {
    // 1. Check Tomorrow's Schedule
    if (query.includes('schedule') || query.includes('tomorrow') || query.includes('ready')) {
      const missingCount = patients.filter(p => p.insuranceStatus === 'Missing').length;
      const issuesCount = patients.filter(p => p.insuranceStatus === 'Issues').length;
      const pendingCount = patients.filter(p => p.insuranceStatus === 'Pending').length;

      let statusText = "Tomorrow's schedule is **Mostly Ready**.";
      let insightType: ChatMessage['insightType'] = 'success';
      let issuesDetails = '';

      if (missingCount > 0 || issuesCount > 0) {
        statusText = "Tomorrow's schedule has **High Denial Risks**.";
        insightType = 'warning';
        issuesDetails = `\n\n🚨 **Key Actions Required:**\n- **Emily Watson** is missing all insurance card details. Automated follow-ups are active, but front desk must collect details before scheduling.\n- **Robert Downey** has active coverage issues (Failed Member ID). Claim rejection probability is **High** if procedures are performed without fixing this.`;
      } else if (pendingCount > 0) {
        statusText = "Tomorrow's schedule is **Pending Approvals**.";
        insightType = 'info';
        issuesDetails = `\n\nℹ️ **Actions Required:**\n- There are ${pendingCount} verifications currently processing. Please run AI Eligibility checks.`;
      }

      return {
        sender: 'copilot',
        text: `📊 **Pre-Appointment Intelligence Report:**\n${statusText}${issuesDetails}\n\n*Running verification check now saves an estimated average of $320 per visit in potential billing write-offs.*`,
        timestamp: new Date(),
        insightType
      };
    }

    // 2. Robert Downey
    if (query.includes('robert') || query.includes('downey') || query.includes('fail')) {
      return {
        sender: 'copilot',
        text: `❌ **Denial Prevention Audit - Robert Downey:**\n\n**Issue:** Member ID \`CIGINVALID00\` failed validation against Cigna Payer Gateways.\n**Reason:** Expired subscriber policy or typographical error in subscriber field.\n\n**Copilot Recommendation:** Ask patient for card upload again. Call Cigna portal support at **800-244-6224** to confirm if policy was rolled over under a new Member ID suffix.`,
        timestamp: new Date(),
        insightType: 'warning'
      };
    }

    // 3. John Smith Costs
    if (query.includes('john') || query.includes('smith') || query.includes('cost') || query.includes('pocket')) {
      return {
        sender: 'copilot',
        text: `🔍 **Coverage Insight Decoded - John Smith:**\n\n**Active Plan:** Blue Cross Premium PPO\n- **Preventive Care:** 100% covered (No out-of-pocket copay).\n- **Diagnostic X-Rays:** 80% covered. Deductible is $500, with $350 already met ($150 remaining).\n\n**Cost breakdown example (D0220 X-Ray - $85):**\n- Patient pays: $15.00 remaining deductible + 10% coinsurance = **$22.00 estimated total**.\n- Insurance pays: **$63.00**.`,
        timestamp: new Date(),
        insightType: 'info'
      };
    }

    // 4. Implant Risk
    if (query.includes('implant') || query.includes('d6010') || query.includes('rejection')) {
      return {
        sender: 'copilot',
        text: `⚠️ **Denial Risk Warning - Dental Implant (Code D6010):**\n\nDental implants represent a **Medium-to-High Denial Category** across standard PPO/HMO providers.\n\n**Compliance Checklist Required:**\n1. **Pre-Authorization Code**: Blue Cross and UnitedHealthcare require pre-auth approval strings prior to surgical placement.\n2. **Diagnostic Evidence**: Must include high-resolution post-operative radiograph attachments in the claim file.\n3. **Waiting Periods**: Confirm the patient's plan has completed its 12-month major procedure waiting window. (John Smith's waiting window is **Completed**).`,
        timestamp: new Date(),
        insightType: 'warning'
      };
    }

    // Generic fallback
    return {
      sender: 'copilot',
      text: `I've analyzed your question. Regarding clinical billing rules, most claims are rejected due to three factors:\n1. Missing subscriber group codes (24% of rejections)\n2. Expired eligibility dates (18%)\n3. Lack of pre-authorization documentation for major surgeries (35%)\n\nTry asking me about **"schedule"**, **"John Smith"**, **"Robert Downey"** or **"implant claims"** for a localized dashboard audit.`,
      timestamp: new Date()
    };
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-xl shadow-cyan-100 hover:scale-105 active:scale-95 transition-all focus:outline-none cursor-pointer"
        title="Open AI Insurance Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 animate-pulse" />}
      </button>

      {/* Floating Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 w-auto sm:w-[400px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-8 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950 px-4.5 py-4 flex items-center justify-between text-white border-b border-cyan-900/20">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <BrainCircuit className="h-4.5 w-4.5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">InsuraFlow Copilot</h4>
                <span className="text-[10px] text-cyan-400 font-medium">AI Insurance & Denial Intelligence</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] whitespace-pre-line shadow-sm border ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white border-cyan-500'
                      : msg.insightType === 'warning'
                      ? 'bg-rose-50 text-slate-800 border-rose-100'
                      : msg.insightType === 'success'
                      ? 'bg-emerald-50 text-slate-800 border-emerald-100'
                      : 'bg-white text-slate-800 border-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
            {presetPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.label)}
                className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide whitespace-nowrap shrink-0 transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center shrink-0">
            <input
              type="text"
              placeholder="Ask about tomorrow, John, Robert, or implant..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-cyan-500"
            />
            <button
              onClick={() => handleSend(inputVal)}
              className="h-8.5 w-8.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl flex items-center justify-center transition shadow-md shadow-cyan-100 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Footer Disclaimer */}
          <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-[9px] text-slate-400 italic text-center shrink-0">
            Decoded details are recommendations. Not official legal/financial coverage guarantee.
          </div>

        </div>
      )}
    </>
  );
}
