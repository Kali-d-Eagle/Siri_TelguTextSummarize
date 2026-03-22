import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Copy, 
  Download, 
  RotateCcw, 
  Sun, 
  Moon, 
  Settings, 
  Sparkles, 
  FileText, 
  BarChart3, 
  ChevronRight,
  Languages,
  Type,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { summarize, type SummarizationResult, type Language } from './summarizer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [summaryRatio, setSummaryRatio] = useState(0.3);
  const [result, setResult] = useState<SummarizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect language as user types
  const detectedLang = useMemo(() => {
    if (!inputText.trim()) return null;
    const teluguRegex = /[\u0C00-\u0C7F]/;
    const englishRegex = /[a-zA-Z]/;
    const hasTelugu = teluguRegex.test(inputText);
    const hasEnglish = englishRegex.test(inputText);
    if (hasTelugu && hasEnglish) return 'Mixed';
    if (hasTelugu) return 'Telugu';
    return 'English';
  }, [inputText]);

  const handleSummarize = () => {
    if (!inputText.trim()) {
      setError('Please enter some text to summarize.');
      return;
    }
    if (inputText.trim().length < 50) {
      setError('Text is too short for a meaningful summary. Please enter at least 50 characters.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const summaryResult = summarize(inputText, summaryRatio);
      setResult(summaryResult);
      setIsProcessing(false);
    }, 800);
  };

  const handleReset = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  const handleCopy = () => {
    if (result?.summary) {
      navigator.clipboard.writeText(result.summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result?.summary) return;
    const element = document.createElement("a");
    const file = new Blob([result.summary], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "summary.txt";
    document.body.appendChild(element);
    element.click();
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 flex",
      isDarkMode ? "bg-[#0E0E10] text-gray-100" : "bg-gray-50 text-gray-900"
    )}>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={cn(
              "w-72 border-r flex flex-col z-20",
              isDarkMode ? "bg-[#18181B] border-white/10" : "bg-white border-gray-200"
            )}
          >
            <div className="p-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-lg tracking-tight">AI Summarizer</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
              {/* Settings Section */}
              <section>
                <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider opacity-50">
                  <Settings className="w-3 h-3" />
                  <span>Configuration</span>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Summary Length</label>
                      <span className="text-xs opacity-60">{Math.round(summaryRatio * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="0.8" 
                      step="0.1"
                      value={summaryRatio}
                      onChange={(e) => setSummaryRatio(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-indigo-600/20 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between mt-2 text-[10px] opacity-40">
                      <span>Short</span>
                      <span>Medium</span>
                      <span>Long</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Appearance</label>
                    <button 
                      onClick={toggleDarkMode}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                        isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        <span className="text-sm">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                      </div>
                      <div className={cn(
                        "w-8 h-4 rounded-full relative transition-colors",
                        isDarkMode ? "bg-indigo-600" : "bg-gray-300"
                      )}>
                        <div className={cn(
                          "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                          isDarkMode ? "left-4.5" : "left-0.5"
                        )} />
                      </div>
                    </button>
                  </div>
                </div>
              </section>

              {/* Stats Section */}
              {result && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider opacity-50">
                    <BarChart3 className="w-3 h-3" />
                    <span>Insights</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={cn(
                      "p-3 rounded-xl",
                      isDarkMode ? "bg-white/5" : "bg-gray-100"
                    )}>
                      <p className="text-[10px] opacity-50 uppercase">Sentences</p>
                      <p className="text-lg font-bold">{result.originalSentences.length}</p>
                    </div>
                    <div className={cn(
                      "p-3 rounded-xl",
                      isDarkMode ? "bg-white/5" : "bg-gray-100"
                    )}>
                      <p className="text-[10px] opacity-50 uppercase">Language</p>
                      <p className="text-lg font-bold capitalize">{result.language}</p>
                    </div>
                  </div>
                </motion.section>
              )}
            </div>

            <div className="p-6 border-t border-white/5">
              <div className="flex items-center gap-3 opacity-40">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-widest">System Ready</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className={cn(
          "h-16 flex items-center justify-between px-6 border-b",
          isDarkMode ? "bg-[#0E0E10]/80 border-white/5" : "bg-white/80 border-gray-200",
          "backdrop-blur-md z-10"
        )}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"
              )}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium opacity-60">Multilingual Summarizer</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {detectedLang && (
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                isDarkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-700"
              )}>
                {detectedLang} Detected
              </div>
            )}
            <button 
              onClick={handleReset}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"
              )}
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-10">
            {/* Hero Section */}
            {!result && !isProcessing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 py-10"
              >
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  AI Powered <span className="text-indigo-500">Multilingual</span><br />
                  Text Summarizer
                </h2>
                <p className="text-lg opacity-60 max-w-2xl mx-auto">
                  Transform long Telugu or English articles into concise, meaningful summaries using advanced extractive NLP algorithms.
                </p>
              </motion.div>
            )}

            {/* Input Section */}
            <div className="grid grid-cols-1 gap-8">
              <motion.div 
                layout
                className={cn(
                  "rounded-3xl p-1 transition-all duration-500",
                  isDarkMode ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "rounded-[22px] overflow-hidden flex flex-col",
                  isDarkMode ? "bg-[#18181B]" : "bg-white"
                )}>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-semibold">Source Text</span>
                    </div>
                    <span className="text-[10px] opacity-40 uppercase font-bold">{inputText.length} characters</span>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your Telugu or English text here..."
                    className={cn(
                      "w-full h-64 md:h-80 p-6 resize-none focus:outline-none text-lg leading-relaxed",
                      isDarkMode ? "bg-transparent text-gray-300" : "bg-transparent text-gray-700"
                    )}
                  />
                  <div className="p-4 bg-black/5 flex justify-end">
                    <button
                      onClick={handleSummarize}
                      disabled={isProcessing || !inputText.trim()}
                      className={cn(
                        "px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
                        isProcessing || !inputText.trim() 
                          ? "bg-gray-500/20 text-gray-500 cursor-not-allowed" 
                          : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95"
                      )}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Summarize
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              {/* Result Section */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-8"
                  >
                    {/* Summary Card */}
                    <div className={cn(
                      "rounded-3xl overflow-hidden border",
                      isDarkMode ? "bg-[#18181B] border-white/5" : "bg-white border-gray-200"
                    )}>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-semibold">AI Summary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={handleCopy}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100",
                              copySuccess && "text-green-500"
                            )}
                          >
                            {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={handleDownload}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"
                            )}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-8">
                        <p className={cn(
                          "text-xl leading-relaxed font-medium",
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        )}>
                          {result.summary}
                        </p>
                      </div>
                    </div>

                    {/* Visualization & Keywords */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Chart */}
                      <div className={cn(
                        "rounded-3xl p-6 border",
                        isDarkMode ? "bg-[#18181B] border-white/5" : "bg-white border-gray-200"
                      )}>
                        <h3 className="text-sm font-bold mb-6 flex items-center gap-2 opacity-60">
                          <BarChart3 className="w-4 h-4" />
                          Word Frequency Analysis
                        </h3>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.wordFrequencies} layout="vertical">
                              <XAxis type="number" hide />
                              <YAxis 
                                dataKey="word" 
                                type="category" 
                                width={80} 
                                tick={{ fontSize: 10, fill: isDarkMode ? '#888' : '#444' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip 
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ 
                                  backgroundColor: isDarkMode ? '#18181B' : '#fff',
                                  borderColor: isDarkMode ? '#333' : '#eee',
                                  borderRadius: '12px',
                                  fontSize: '12px'
                                }}
                              />
                              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {result.wordFrequencies.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#6366f144'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Keywords */}
                      <div className={cn(
                        "rounded-3xl p-6 border",
                        isDarkMode ? "bg-[#18181B] border-white/5" : "bg-white border-gray-200"
                      )}>
                        <h3 className="text-sm font-bold mb-6 flex items-center gap-2 opacity-60">
                          <Type className="w-4 h-4" />
                          Top Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.map((kw, i) => (
                            <motion.span
                              key={kw.word}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              )}
                            >
                              {kw.word}
                              <span className="ml-2 text-[10px] opacity-40">{kw.count}</span>
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={cn(
          "py-6 px-10 border-t text-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-30",
          isDarkMode ? "border-white/5" : "border-gray-200"
        )}>
          Telugu Text Summarization Project • Extractive Method • 2026
        </footer>
      </main>
    </div>
  );
}
