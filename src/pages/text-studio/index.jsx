import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    History,
    Copy,
    Save,
    Loader2,
    ChevronRight,
    MessageSquare,
    RefreshCw,
    CheckCircle,
} from 'lucide-react';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/AuthGuard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { cn } from '../../utils/cn';

// Redux Actions
import { generateAiText, fetchGenerationHistory } from '../../store/slices/textStudioSlice';

const TextStudio = () => {
    const dispatch = useDispatch();
    const { history, isGenerating, error } = useSelector((state) => state.textStudio);

    // Local state for output area
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('generate');

    // React Hook Form
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            prompt: '',
            model: 'gpt-4',
            tone: 'Professional',
            length: 'medium',
        },
    });

    const promptValue = watch('prompt');

    useEffect(() => {
        dispatch(fetchGenerationHistory());
    }, [dispatch]);

    const onSubmit = async (data) => {
        setOutput('');
        try {
            const resultAction = await dispatch(generateAiText(data));
            if (generateAiText.fulfilled.match(resultAction)) {
                setOutput(resultAction.payload.content);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadFromHistory = (item) => {
        setValue('prompt', item.prompt);
        setValue('tone', item.tone);
        setValue('model', item.model);
        setValue('length', item.length);
        setOutput(item.content);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AuthGuard>
            <Layout>
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center text-foreground">
                                <Sparkles className="w-8 h-8 mr-3 text-primary" />
                                Text Studio
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Generate high-quality content using advanced AI models.
                            </p>
                        </div>
                        {/* Desktop Tabs */}
                        <div className="hidden md:flex space-x-2 bg-card p-1 rounded-lg border border-border shadow-sm">
                            <button
                                onClick={() => setActiveTab('generate')}
                                className={cn(
                                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                                    activeTab === 'generate'
                                        ? 'bg-primary text-primary-foreground shadow'
                                        : 'text-muted-foreground hover:bg-accent/50'
                                )}
                            >
                                Generate
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={cn(
                                    'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                                    activeTab === 'history'
                                        ? 'bg-primary text-primary-foreground shadow'
                                        : 'text-muted-foreground hover:bg-accent/50'
                                )}
                            >
                                <History className="w-4 h-4 mr-2" />
                                History ({history.length})
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Main Area */}
                        <motion.div
                            layout
                            className={cn(
                                'col-span-1 md:col-span-8 flex flex-col space-y-6',
                                activeTab === 'history' && 'hidden md:flex' // Hide on mobile if history is active
                            )}
                        >
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6"
                            >
                                {/* Configuration Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Model
                                        </label>
                                        <Select
                                            {...register('model')}
                                            options={[
                                                { value: 'gpt-4', label: 'GPT-4 (OpenAI)' },
                                                { value: 'claude-3', label: 'Claude 3 (Anthropic)' },
                                                { value: 'gemini-pro', label: 'Gemini Pro (Google)' },
                                            ]}
                                            onChange={(val) => setValue('model', val)}
                                            value={watch('model')}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Tone
                                        </label>
                                        <Select
                                            {...register('tone')}
                                            options={[
                                                { value: 'Professional', label: 'Professional' },
                                                { value: 'Casual', label: 'Casual' },
                                                { value: 'Creative', label: 'Creative' },
                                                { value: 'Technical', label: 'Technical' },
                                            ]}
                                            onChange={(val) => setValue('tone', val)}
                                            value={watch('tone')}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Length
                                        </label>
                                        <Select
                                            {...register('length')}
                                            options={[
                                                { value: 'short', label: 'Short' },
                                                { value: 'medium', label: 'Medium' },
                                                { value: 'long', label: 'Long' },
                                            ]}
                                            onChange={(val) => setValue('length', val)}
                                            value={watch('length')}
                                        />
                                    </div>
                                </div>

                                {/* Prompt Row */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center justify-between">
                                        <span>What do you want to write about?</span>
                                        <span
                                            className={cn(
                                                'text-xs',
                                                promptValue?.length > 400
                                                    ? 'text-error'
                                                    : 'text-muted-foreground'
                                            )}
                                        >
                                            {promptValue?.length || 0} / 500
                                        </span>
                                    </label>
                                    <textarea
                                        {...register('prompt', {
                                            required: 'Please enter a prompt snippet.',
                                            maxLength: {
                                                value: 500,
                                                message: 'Prompt is too long (max 500 chars).',
                                            },
                                        })}
                                        rows={4}
                                        placeholder="E.g. Write a brief product description for a premium smart water bottle..."
                                        className={cn(
                                            'w-full bg-accent/30 border border-border rounded-lg p-4 text-foreground text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-all overflow-y-auto resize-y',
                                            errors.prompt && 'border-error focus:ring-error'
                                        )}
                                    />
                                    {errors.prompt && (
                                        <p className="text-sm text-error">{errors.prompt.message}</p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isGenerating || !promptValue?.trim()}
                                        className="w-full sm:w-auto min-w-[160px]"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Generate Content
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {error && (
                                    <p className="text-sm text-error text-center mt-2 bg-error/10 p-2 rounded-md">
                                        {error}
                                    </p>
                                )}
                            </form>

                            {/* Output Area */}
                            <AnimatePresence>
                                {(output || isGenerating) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-card p-6 rounded-xl border border-border flex flex-col min-h-[300px] shadow-sm relative group"
                                    >
                                        {/* Header Controls for Output */}
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                                            <h3 className="font-semibold text-lg flex items-center text-foreground">
                                                <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                                                Generated Result
                                            </h3>
                                            {!isGenerating && output && (
                                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        title="Copy to clipboard"
                                                        onClick={handleCopy}
                                                    >
                                                        {copied ? (
                                                            <CheckCircle className="w-4 h-4 text-success" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button variant="outline" size="sm" title="Save">
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-y-auto text-base text-muted-foreground/90 whitespace-pre-wrap leading-relaxed pr-2">
                                            {isGenerating ? (
                                                <div className="space-y-4 animate-pulse">
                                                    <div className="h-4 bg-accent rounded w-3/4"></div>
                                                    <div className="h-4 bg-accent rounded w-full"></div>
                                                    <div className="h-4 bg-accent rounded w-5/6"></div>
                                                    <div className="h-4 bg-accent rounded w-1/2"></div>
                                                </div>
                                            ) : (
                                                output
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* History Sidebar */}
                        <motion.div
                            layout
                            className={cn(
                                'col-span-1 md:col-span-4 flex flex-col',
                                activeTab === 'generate' && 'hidden md:flex' // Hide on mobile if generate is active
                            )}
                        >
                            <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-160px)] sticky top-24">
                                <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                                    <h3 className="font-semibold text-foreground flex items-center">
                                        <History className="w-5 h-5 mr-2 text-primary" />
                                        History
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        title="Refresh History"
                                        onClick={() => dispatch(fetchGenerationHistory())}
                                    >
                                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                    {history.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                                            <History className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="text-sm">No history yet.</p>
                                            <p className="text-xs mt-1">
                                                Your generated texts will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        history.map((item) => (
                                            <button
                                                key={item._id || item.id}
                                                onClick={() => loadFromHistory(item)}
                                                className="w-full text-left p-4 rounded-lg hover:bg-accent/60 transition-colors border border-transparent hover:border-border group focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                                                        {item.model}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground font-medium line-clamp-2 leading-relaxed mb-2">
                                                    {item.prompt}
                                                </p>
                                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                    <span className="capitalize">{item.tone} • {item.length}</span>
                                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Layout>
        </AuthGuard>
    );
};

export default TextStudio;
