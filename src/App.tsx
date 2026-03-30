/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Target, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Calendar, 
  Sparkles,
  Loader2,
  ChevronRight,
  ExternalLink,
  Github,
  Youtube,
  Globe
} from "lucide-react";
import { analyzeSkills, type SkillAnalysis } from "./services/gemini";
import { cn } from "./lib/utils";
import { generatePDF } from "./lib/pdf";

const AGENT_MESSAGES = [
  "Initializing SkillSense AI Agent...",
  "Parsing resume and extracting core competencies...",
  "Scanning target role requirements...",
  "Performing semantic gap analysis...",
  "Reasoning about missing skill sets...",
  "Optimizing personalized learning roadmap...",
  "Curating high-quality learning resources...",
  "Finalizing your career growth plan..."
];

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [agentStep, setAgentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setAgentStep((prev) => (prev + 1) % AGENT_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText || !targetRole) return;

    setIsAnalyzing(true);
    setError(null);
    setAgentStep(0);

    try {
      const result = await analyzeSkills(resumeText, targetRole);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze skills. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-orange-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight">SkillSense <span className="text-orange-500">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-white transition-colors">How it works</a>
            <a href="#" className="hover:text-white transition-colors">Resources</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <button className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-orange-500 hover:text-white transition-all">
            Get Started
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {!analysis && !isAnalyzing ? (
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                AI-Powered Career Agent
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9]">
                BRIDGE THE GAP TO YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">DREAM CAREER.</span>
              </h1>
              <p className="text-lg text-white/50 max-w-xl mx-auto">
                SkillSense AI analyzes your current skills, detects gaps for your target role, and builds a custom 4-week roadmap to mastery.
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleAnalyze}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 text-left"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <BookOpen className="w-3 h-3" />
                  Your Current Skills / Resume
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume or list your skills (e.g., HTML, CSS, JavaScript, React basics...)"
                  className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  Target Role
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Senior Frontend Developer, Data Scientist..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-orange-500 text-black font-bold rounded-2xl hover:bg-orange-400 transition-all flex items-center justify-center gap-2 group"
              >
                Analyze Skill Gaps
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.form>
          </div>
        ) : isAnalyzing ? (
          <div className="max-w-xl mx-auto py-24 text-center space-y-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-t-orange-500 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="w-8 h-8 text-orange-500 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Agent is Thinking...</h2>
              <AnimatePresence mode="wait">
                <motion.p
                  key={agentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-orange-500/80 font-mono text-sm"
                >
                  {AGENT_MESSAGES[agentStep]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <button
                  onClick={() => setAnalysis(null)}
                  className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2 transition-colors mb-4"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  Back to Input
                </button>
                <h2 className="text-4xl font-bold tracking-tight">Analysis for {targetRole}</h2>
                <p className="text-white/50">Our AI agent has mapped your path to success.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-500">{analysis.matchPercentage}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Skill Match</div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => analysis && generatePDF(analysis, targetRole)}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    Download PDF
                  </button>
                  <button className="px-6 py-3 bg-orange-500 text-black rounded-xl text-sm font-bold hover:bg-orange-400 transition-all flex items-center gap-2">
                    Share Roadmap
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Skills & Gaps */}
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Current Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.currentSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      Detected Gaps
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Agent Reasoning</h3>
                  <p className="text-sm text-white/70 leading-relaxed italic">
                    "{analysis.gapAnalysis}"
                  </p>
                </div>
              </div>

              {/* Right Column: Roadmap */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2 px-4">
                  <Calendar className="w-4 h-4" />
                  Mastery Roadmap (4 Weeks)
                </h3>
                <div className="space-y-4">
                  {analysis.roadmap.map((step, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i}
                      className="group bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-32 flex-shrink-0">
                          <div className="text-3xl font-bold text-orange-500 leading-none">{step.week}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Timeline</div>
                        </div>
                        <div className="flex-grow space-y-4">
                          <div>
                            <h4 className="text-xl font-bold tracking-tight mb-1">{step.topic}</h4>
                            <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {step.resources.map((res, j) => (
                              <a
                                key={j}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors border border-white/5"
                              >
                                {res.url.includes("youtube") ? <Youtube className="w-3 h-3 text-red-500" /> : 
                                 res.url.includes("github") ? <Github className="w-3 h-3" /> : 
                                 <Globe className="w-3 h-3 text-blue-400" />}
                                {res.title}
                                <ExternalLink className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {error && (
          <div className="max-w-md mx-auto mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/10 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Cpu className="w-5 h-5" />
            <span className="font-bold text-lg tracking-tight">SkillSense AI</span>
          </div>
          <p className="text-sm text-white/30">© 2026 SkillSense AI. Built for the Hackathon.</p>
          <div className="flex gap-6 text-white/30">
            <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
