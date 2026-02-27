import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, Copy, Check, AlertCircle, Wand2, Lightbulb, GraduationCap, Save } from 'lucide-react';
import { generatePrompt, PromptMode } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

export default function PromptArchitect() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<PromptMode>('improve');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedInput = localStorage.getItem('pa_input');
    const savedOutput = localStorage.getItem('pa_output');
    const savedMode = localStorage.getItem('pa_mode');
    
    if (savedInput) setInput(savedInput);
    if (savedOutput) setOutput(savedOutput);
    if (savedMode) setMode(savedMode as PromptMode);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const saveToStorage = () => {
      setIsSaving(true);
      localStorage.setItem('pa_input', input);
      localStorage.setItem('pa_output', output);
      localStorage.setItem('pa_mode', mode);
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 800);
    };

    const timeoutId = setTimeout(saveToStorage, 1000);
    return () => clearTimeout(timeoutId);
  }, [input, output, mode]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter a prompt or idea.');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const result = await generatePrompt(input, mode);
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const modes = [
    {
      id: 'improve',
      label: 'Improve Prompt',
      icon: Wand2,
      description: 'Refine existing prompts for clarity and specificity.'
    },
    {
      id: 'idea',
      label: 'Generate from Idea',
      icon: Lightbulb,
      description: 'Expand vague ideas into full, detailed prompts.'
    },
    {
      id: 'expert',
      label: 'Expert-Level',
      icon: GraduationCap,
      description: 'Create highly advanced, structured prompts with reasoning.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 relative">
           {/* Auto-save Indicator */}
           <div className="absolute top-0 right-0 hidden sm:flex items-center space-x-2 text-xs text-slate-400">
            {isSaving ? (
              <span className="flex items-center animate-pulse">
                <Save className="w-3 h-3 mr-1" /> Saving...
              </span>
            ) : lastSaved ? (
              <span className="flex items-center">
                <Check className="w-3 h-3 mr-1" /> Saved
              </span>
            ) : null}
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-emerald-600 rounded-2xl shadow-lg mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
          >
            Prompt Architect
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Transform vague ideas into powerful, structured AI prompts.
          </motion.p>
        </div>

        {/* Main Input Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        >
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Mode Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {modes.map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as PromptMode)}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900' 
                        : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-sm">{m.label}</span>
                    <span className="text-xs text-center mt-1 opacity-80 hidden sm:block">{m.description}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="active-mode"
                        className="absolute inset-0 border-2 border-emerald-600 rounded-xl pointer-events-none"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Text Area */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="prompt-input" className="block text-sm font-medium text-slate-700">
                  Describe your idea or paste your prompt
                </label>
                {/* Mobile Auto-save Indicator */}
                <div className="sm:hidden text-xs text-slate-400">
                  {isSaving ? 'Saving...' : lastSaved ? 'Saved' : ''}
                </div>
              </div>
              <textarea
                id="prompt-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'improve' ? "Paste your existing prompt here..." :
                  mode === 'idea' ? "e.g., Build a finance app for tracking expenses..." :
                  "Describe the complex task you need an expert prompt for..."
                }
                className="w-full h-40 p-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none text-slate-800 placeholder:text-slate-400 font-sans text-base"
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center p-4 text-red-800 bg-red-50 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="w-full flex items-center justify-center py-4 px-6 rounded-xl bg-emerald-600 text-white font-semibold text-lg shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Architecting Prompt...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  Generate
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Output Section */}
        <AnimatePresence>
          {output && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-emerald-600" />
                  Generated Prompt
                </h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-emerald-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 sm:p-8 bg-slate-50/30">
                <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-pre:bg-slate-900 prose-pre:text-slate-50 rounded-xl">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </div>
              </div>
              <div className="bg-emerald-50 px-6 py-3 border-t border-emerald-100">
                <p className="text-sm text-emerald-800 text-center font-medium">
                  Is this correct? If not, tell me what to adjust.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
