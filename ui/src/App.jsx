import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Code, FileJson, Copy, Check, ArrowRight, Loader2, LayoutDashboard, PlusCircle, AlertCircle, Sun, Moon, Trash2, Activity, X, Settings, Save, TestTube } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
    const [view, setView] = useState('new'); // 'new', 'dashboard', 'settings'
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [step, setStep] = useState(0);
    const [copied, setCopied] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [selectedTrace, setSelectedTrace] = useState(null);
    const [context, setContext] = useState('');
    const [savingContext, setSavingContext] = useState(false);

    // Theme State
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        if (view === 'dashboard') {
            fetchTickets();
        } else if (view === 'settings') {
            fetchContext();
        }
    }, [view]);

    const fetchTickets = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/tickets');
            const data = await response.json();
            setTickets(data);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        }
    };

    const fetchContext = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/context');
            const data = await response.json();
            setContext(data.content);
        } catch (error) {
            console.error("Failed to fetch context", error);
        }
    };

    const saveContext = async () => {
        setSavingContext(true);
        try {
            await fetch('http://localhost:8000/api/context', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: context }),
            });
            alert('Settings saved!');
        } catch (error) {
            console.error("Failed to save context", error);
            alert('Failed to save settings.');
        } finally {
            setSavingContext(false);
        }
    };

    const handleDelete = async (summary, e) => {
        e.stopPropagation(); // Prevent card expansion
        if (!confirm('Are you sure you want to delete this ticket?')) return;

        try {
            const response = await fetch(`http://localhost:8000/api/tickets/${encodeURIComponent(summary)}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setTickets(prev => prev.filter(t => t.summary !== summary));
            } else {
                alert('Failed to delete ticket');
            }
        } catch (error) {
            console.error("Error deleting ticket", error);
        }
    };

    const handleViewTrace = async (summary, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(`http://localhost:8000/api/traces/${encodeURIComponent(summary)}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedTrace(data);
            } else {
                alert('Trace not found for this ticket.');
            }
        } catch (error) {
            console.error("Error fetching trace", error);
        }
    };

    const handleGenerate = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setResult(null);
        setStep(1);

        try {
            const progressInterval = setInterval(() => {
                setStep((prev) => (prev < 3 ? prev + 1 : prev));
            }, 2000);

            const response = await fetch('http://localhost:8000/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brain_dump: input }),
            });

            clearInterval(progressInterval);

            if (!response.ok) throw new Error('Failed to generate ticket');

            const data = await response.json();
            setResult(data);
            setStep(4);
        } catch (error) {
            console.error(error);
            setStep(0);
            alert('Error generating ticket. Please check the backend console.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background text-text p-8 font-sans selection:bg-primary selection:text-white transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header & Nav */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-surface rounded-2xl border border-text-muted/10 shadow-lg shadow-primary/10">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                Agile Sprint Guardian
                            </h1>
                            <p className="text-text-muted text-sm">AI-Powered Ticket Generator</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-surface p-1 rounded-xl border border-text-muted/10">
                            <button
                                onClick={() => setView('new')}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'new' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                New Ticket
                            </button>
                            <button
                                onClick={() => setView('dashboard')}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Dashboard
                            </button>
                            <button
                                onClick={() => setView('settings')}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'settings' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </button>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-3 bg-surface rounded-xl border border-text-muted/10 text-text-muted hover:text-primary transition-colors"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {view === 'new' ? (
                        <motion.div
                            key="new"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto space-y-12"
                        >
                            {/* Input Section */}
                            <div className="bg-surface rounded-3xl p-1 border border-text-muted/10 shadow-xl transition-colors duration-300">
                                <div className="bg-background/50 rounded-[20px] p-6">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Describe your feature request here... (e.g., 'As a user, I want a dark mode...')"
                                        className="w-full h-40 bg-transparent text-lg text-text placeholder:text-text-muted focus:outline-none resize-none"
                                        disabled={loading}
                                    />
                                    <div className="flex justify-between items-center mt-4 border-t border-text-muted/10 pt-4">
                                        <span className="text-sm text-text-muted">
                                            {input.length} characters
                                        </span>
                                        <button
                                            onClick={handleGenerate}
                                            disabled={loading || !input.trim()}
                                            className={`
                        flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300
                        ${loading || !input.trim()
                                                    ? 'bg-surface text-text-muted cursor-not-allowed'
                                                    : 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95'}
                      `}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    Generate Ticket
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Steps */}
                            <AnimatePresence>
                                {loading && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="grid grid-cols-3 gap-4"
                                    >
                                        <StepCard active={step >= 1} icon={FileJson} title="Product Owner" desc="Refining Requirements" color="text-blue-400" />
                                        <StepCard active={step >= 2} icon={Code} title="Specialists" desc="Tech, Sec & QA" color="text-violet-400" />
                                        <StepCard active={step >= 3} icon={Shield} title="Gatekeeper" desc="Finalizing Ticket" color="text-emerald-400" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Result Section */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-surface rounded-3xl border border-text-muted/10 overflow-hidden shadow-2xl transition-colors duration-300"
                                    >
                                        <div className="p-6 border-b border-text-muted/10 flex justify-between items-center bg-text-muted/5">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                    <Check className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-text">Ticket Generated</h3>
                                                    <p className="text-sm text-text-muted">{result.summary}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                                                className="p-2 hover:bg-text-muted/10 rounded-lg transition-colors text-text-muted hover:text-text"
                                                title="Copy JSON"
                                            >
                                                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>

                                        <div className="relative group">
                                            <SyntaxHighlighter
                                                language="json"
                                                style={theme === 'dark' ? vscDarkPlus : prism}
                                                customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '0.9rem' }}
                                            >
                                                {JSON.stringify(result, null, 2)}
                                            </SyntaxHighlighter>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : view === 'dashboard' ? (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {tickets.length === 0 ? (
                                <div className="col-span-full text-center py-20 text-text-muted">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No tickets found yet. Create one!</p>
                                </div>
                            ) : (
                                tickets.map((ticket, idx) => (
                                    <TicketCard
                                        key={idx}
                                        ticket={ticket}
                                        onDelete={handleDelete}
                                        onViewTrace={handleViewTrace}
                                    />
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-surface rounded-3xl border border-text-muted/10 overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-text-muted/10">
                                    <h2 className="text-xl font-bold text-text">Project Context</h2>
                                    <p className="text-text-muted text-sm mt-1">
                                        Define your project's tech stack, coding style, and requirements.
                                        This context will be provided to the AI agents for every new ticket.
                                    </p>
                                </div>
                                <div className="p-6">
                                    <textarea
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                        className="w-full h-64 bg-background/50 rounded-xl p-4 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                                        placeholder="e.g., Tech Stack: React, Tailwind, Python..."
                                    />
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={saveContext}
                                            disabled={savingContext}
                                            className="flex items-center px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/25"
                                        >
                                            {savingContext ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Settings
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Trace Modal */}
                <AnimatePresence>
                    {selectedTrace && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                            onClick={() => setSelectedTrace(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-surface w-full max-w-5xl h-[80vh] rounded-3xl border border-text-muted/10 shadow-2xl overflow-hidden flex flex-col"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-text-muted/10 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-6 h-6 text-primary" />
                                        <h2 className="text-xl font-bold text-text">Agent Trace</h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTrace(null)}
                                        className="p-2 hover:bg-text-muted/10 rounded-lg text-text-muted hover:text-text transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                    <TraceSection title="1. Brain Dump (User)" content={selectedTrace.brain_dump} color="text-slate-400" />
                                    <TraceSection title="2. User Story (PO Agent)" content={selectedTrace.user_story} color="text-blue-400" isJson />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <TraceSection title="3a. Tech Estimate (Tech Lead)" content={selectedTrace.tech_estimate} color="text-violet-400" isJson />
                                        <TraceSection title="3b. Security Review (SecOps)" content={selectedTrace.security_review} color="text-red-400" isJson />
                                    </div>
                                    <TraceSection title="3c. Test Plan (QA Agent)" content={selectedTrace.test_plan} color="text-pink-400" isJson />
                                    <TraceSection title="4. Final Ticket (Gatekeeper)" content={selectedTrace.final_ticket} color="text-emerald-400" isJson />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

function TraceSection({ title, content, color, isJson }) {
    return (
        <div className="space-y-2">
            <h3 className={`font-semibold ${color}`}>{title}</h3>
            <div className="bg-background/50 rounded-xl border border-text-muted/10 overflow-hidden">
                {isJson ? (
                    <SyntaxHighlighter
                        language="json"
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.85rem' }}
                    >
                        {JSON.stringify(content, null, 2)}
                    </SyntaxHighlighter>
                ) : (
                    <div className="p-4 text-text-muted text-sm whitespace-pre-wrap font-mono">
                        {content}
                    </div>
                )}
            </div>
        </div>
    );
}

function StepCard({ active, icon: Icon, title, desc, color }) {
    return (
        <div className={`
      p-4 rounded-2xl border transition-all duration-500
      ${active
                ? 'bg-surface border-text-muted/10 opacity-100 scale-100'
                : 'bg-transparent border-transparent opacity-30 scale-95'}
    `}>
            <div className="flex items-center space-x-3 mb-2">
                <Icon className={`w-5 h-5 ${active ? color : 'text-text-muted'}`} />
                <span className={`font-medium ${active ? 'text-text' : 'text-text-muted'}`}>{title}</span>
            </div>
            <p className="text-xs text-text-muted pl-8">{desc}</p>
            {active && (
                <motion.div
                    layoutId="active-glow"
                    className={`h-1 w-full mt-3 rounded-full bg-gradient-to-r from-transparent via-${color.split('-')[1]}-500 to-transparent opacity-50`}
                />
            )}
        </div>
    );
}

function TicketCard({ ticket, onDelete, onViewTrace }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            layout
            onClick={() => setExpanded(!expanded)}
            className={`bg-surface rounded-2xl border border-text-muted/10 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors ${expanded ? 'col-span-full' : ''}`}
        >
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg leading-tight text-text">{ticket.summary}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {ticket.priority}
                        </span>
                        <button
                            onClick={(e) => onViewTrace(ticket.summary, e)}
                            className="p-1.5 hover:bg-primary/10 rounded-lg text-text-muted hover:text-primary transition-colors"
                            title="View Trace"
                        >
                            <Activity className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => onDelete(ticket.summary, e)}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500 transition-colors"
                            title="Delete Ticket"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-text-muted">
                    <span className="flex items-center"><Code className="w-4 h-4 mr-1" /> {ticket.story_points} pts</span>
                    <div className="flex gap-2">
                        {ticket.labels.slice(0, 3).map(label => (
                            <span key={label} className="bg-text-muted/10 px-2 py-0.5 rounded text-xs">{label}</span>
                        ))}
                    </div>
                </div>

                {expanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-4 border-t border-text-muted/10 text-sm text-text-muted space-y-4"
                    >
                        <div>
                            <h4 className="font-semibold text-text mb-1">Description</h4>
                            <p className="whitespace-pre-wrap">{ticket.description}</p>
                        </div>

                        {ticket.test_plan && (
                            <div className="bg-pink-500/5 rounded-xl p-4 border border-pink-500/10">
                                <div className="flex items-center gap-2 mb-2 text-pink-400">
                                    <TestTube className="w-4 h-4" />
                                    <h4 className="font-semibold">Test Plan</h4>
                                </div>
                                <div className="space-y-2">
                                    {ticket.test_plan.scenarios.map((scenario, i) => (
                                        <div key={i} className="text-xs font-mono bg-background/50 p-2 rounded border border-text-muted/10">
                                            {scenario}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default App;
