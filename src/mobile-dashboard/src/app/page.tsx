'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Survey, Question } from '@/types/survey';
import { surveyApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  AqPlus,
  AqTrash02,
  AqRefreshCw01,
  AqLogOut01,
  AqFile01,
  AqCheckCircle,
  AqCircle,
  AqSettings01,
  AqX,
  AqSave01,
  AqPlay
} from '@airqo/icons-react';
import Image from 'next/image';
import SignInPage from '@/components/SignInPage';
import Link from 'next/link';

const createBlankSurvey = (): Partial<Survey> => ({
  title: '',
  description: '',
  questions: [],
  isActive: true,
  createdBy: 'user',
});

export default function SurveyGenerator() {
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { showToast } = useToast();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [currentSurvey, setCurrentSurvey] = useState<Partial<Survey>>(createBlankSurvey);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [hasCreatedAtLeastOne, setHasCreatedAtLeastOne] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const originalRef = useRef<Partial<Survey>|null>(null);

  const cloneSurvey = (survey: Partial<Survey>) => JSON.parse(JSON.stringify(survey));

  const beginCreateSurvey = () => {
    const blankSurvey = createBlankSurvey();
    setCurrentSurvey(blankSurvey);
    originalRef.current = cloneSurvey(blankSurvey);
    setSelectedSurveyId(null);
    setShowCreateForm(true);
    setDirty(false);
  };

  // Helper functions for robust question mapping
  const mapType = (t: string): Question['type'] => {
    const v = (t || '').toLowerCase().replace('_','-');
    if (v === 'single-choice' || v === 'multiple-choice' || v === 'rating' || v === 'boolean') {
      return v as Question['type'];
    }
    return 'text';
  };

  const coerceQuestion = useCallback((q: Record<string, unknown>): Question => ({
    id: String(q.id ?? q._id ?? crypto.randomUUID()),
    type: mapType(String(q.type ?? q.kind ?? '')),
    text: String(q.text ?? q.prompt ?? q.label ?? q.question ?? '').trim(),
    required: !!(q.required ?? q.is_required),
    options: Array.isArray(q.options ?? q.choices) ? (q.options ?? q.choices) as string[] : [],
  }), []);

  const loadSurveys = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const surveysData = await surveyApi.getSurveys(token);
      setSurveys(surveysData);
    } catch (err) {
      console.error('Error loading surveys:', err);
      setError(err instanceof Error ? err.message : 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load hasCreatedAtLeastOne from localStorage on mount
  useEffect(() => {
    try {
      const flag = typeof window !== 'undefined' && localStorage.getItem('airqo_sg_hasCreatedAtLeastOne') === '1';
      setHasCreatedAtLeastOne(flag);
    } catch {
      setHasCreatedAtLeastOne(false);
    }
  }, []);

  // Load surveys on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      loadSurveys();
    }
  }, [loadSurveys, isAuthenticated, token]);

  // Auto-select most recent survey when surveys load
  useEffect(() => {
    if (surveys.length > 0 && !selectedSurveyId && !showCreateForm) {
      const mostRecent = [...surveys].sort((a, b) => 
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )[0];
      if (mostRecent) setSelectedSurveyId(mostRecent.id);
    }
  }, [surveys, selectedSurveyId, showCreateForm]);

  // Fetch full survey details when selectedSurveyId changes
  useEffect(() => {
    if (!selectedSurveyId || !token) return;
    let cancelled = false;
    (async () => {
      setSelectedLoading(true);
      setDirty(false);
      try {
        const full = await surveyApi.getSurvey(selectedSurveyId, token);
        if (cancelled) return;
        const normalizedSurvey: Partial<Survey> = {
          title: full.title ?? '',
          description: full.description ?? '',
          questions: Array.isArray(full.questions)
            ? (full.questions as unknown as Record<string, unknown>[]).map(coerceQuestion)
            : [],
          isActive: !!full.isActive,
          createdBy: full.createdBy ?? 'user',
          createdAt: full.createdAt,
          updatedAt: full.updatedAt,
        };
        originalRef.current = cloneSurvey(normalizedSurvey);
        setCurrentSurvey(normalizedSurvey);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load survey details');
      } finally {
        if (!cancelled) setSelectedLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedSurveyId, token, coerceQuestion]);

  // Live update question count in left panel
  useEffect(() => {
    if (!selectedSurveyId) return;
    const count = currentSurvey.questions?.length ?? 0;

    // optimistic count update for the selected survey row
    setSurveys(prev =>
      prev.map(s =>
        s.id === selectedSurveyId
          ? {
              ...s,
              // prefer explicit questionsCount if list items are summaries
              questionsCount: count,
              // Also update title and description if they've changed
              title: currentSurvey.title || s.title,
              description: currentSurvey.description || s.description,
              isActive: currentSurvey.isActive !== undefined ? currentSurvey.isActive : s.isActive,
            }
          : s
      )
    );
  }, [selectedSurveyId, currentSurvey.questions?.length, currentSurvey.title, currentSurvey.description, currentSurvey.isActive]);

  useEffect(() => {
    if (!originalRef.current || !selectedSurveyId) return;

    // More sophisticated dirty detection
    const original = originalRef.current;
    const current = currentSurvey;
    
    // Check if any meaningful fields have changed
    const hasChanged = 
      original.title !== current.title ||
      original.description !== current.description ||
      original.isActive !== current.isActive ||
      JSON.stringify(original.questions || []) !== JSON.stringify(current.questions || []);
    
    setDirty(hasChanged);
  }, [currentSurvey, selectedSurveyId]);

  // Show sign-in page if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--airqo-background-light)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-3 border-[var(--airqo-primary)] rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-[var(--airqo-text-secondary)] font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInPage />;
  }

  // Payload normalizer for AirQo API compatibility

  const normalizeQuestions = (qs: Question[]): Record<string, unknown>[] => {
    return qs.map((q) => {
      const rawPrompt =
        typeof q.text === 'string'
          ? q.text
          : typeof (q as unknown as Record<string, unknown>).question === 'string'
          ? ((q as unknown as Record<string, unknown>).question as string)
          : '';
      const prompt = rawPrompt.trim();
      const normalizedType = mapType(q.type);
      const base: Record<string, unknown> = {
        id: q.id,
        question: prompt,
        text: prompt,
        type: normalizedType,
        isRequired: !!q.required,
        required: !!q.required,
      };

      const isChoice = normalizedType.includes('choice');
      if (isChoice) {
        const opts = (q.options || []).map(o => (o || '').trim()).filter(Boolean);
        base.options = opts.length ? opts : ['Option 1'];
      }

      // Add rating range for rating questions
      if (normalizedType === 'rating') {
        base.minValue = 1;
        base.maxValue = 5;
      }

      return base;
    });
  };


  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      text: '',
      required: false,
      options: []
    };
    
    setCurrentSurvey(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setCurrentSurvey(prev => ({
      ...prev,
      questions: prev.questions?.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      ) || []
    }));
  };

  const removeQuestion = (questionId: string) => {
    setCurrentSurvey(prev => ({
      ...prev,
      questions: prev.questions?.filter(q => q.id !== questionId) || []
    }));
  };

  const isEditMode = !!selectedSurveyId && !showCreateForm;

  // Helper to check if survey has never been updated
  const hasNeverBeenUpdated = (createdAt?: string|number|Date, updatedAt?: string|number|Date) => {
    if (!createdAt) return false;
    if (!updatedAt) return true;
    const c = new Date(createdAt).getTime();
    const u = new Date(updatedAt).getTime();
    // treat "identical" or near-identical as never updated (within 5 seconds)
    return Math.abs(u - c) < 5000;
  };

  // Helper to format card timestamp with proper logic
  const formatCardTimestamp = (createdAt?: string | number | Date, updatedAt?: string | number | Date) => {
    if (!createdAt && !updatedAt) return null;
    const now = new Date();
    const created = createdAt ? new Date(createdAt) : null;
    const updated = updatedAt ? new Date(updatedAt) : null;

    // If never been updated, show created date
    if (hasNeverBeenUpdated(createdAt, updatedAt)) {
      const ddmmyy = created?.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'2-digit' });
      return `Created ${ddmmyy}`;
    }

    // If has been updated, show update info
    if (updated) {
      const diffMin = Math.floor((now.getTime() - updated.getTime()) / 60000);
      if (diffMin < 60) return `Updated ${diffMin}m ago`;
      if (updated.toDateString() === now.toDateString()) return `Updated today`;
      const ddmmyy = updated.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'2-digit' });
      return `Last updated ${ddmmyy}`;
    }

    return null;
  };

  // Helper to merge server response into surveys list
  const mergeListWithServer = (updated: Survey) => {
    setSurveys(prev => prev.map(s => {
      if (s.id === updated.id) {
        // Merge the updated survey with existing data to preserve fields not returned by API
        return {
          ...s,
          ...updated,
          // Ensure we have the latest question count and timestamps
          questionsCount: currentSurvey.questions?.length || 0,
          updatedAt: new Date().toISOString(),
          // Preserve other fields that might not be in the API response
          title: updated.title || s.title,
          description: updated.description || s.description,
          isActive: updated.isActive !== undefined ? updated.isActive : s.isActive,
        };
      }
      return s;
    }));
  };


  const handleSubmit = async () => {
    if (!currentSurvey.title || !currentSurvey.questions?.length || !token) return;
    
    // Validate choice questions have at least one option
    const invalidChoiceQuestions = currentSurvey.questions!.filter(q => 
      q.type.includes('choice') && (!q.options || q.options.length === 0)
    );
    
    if (invalidChoiceQuestions.length > 0) {
      setError('Choice questions must have at least one option');
      return;
    }
    
    const payload = {
      title: (currentSurvey.title || '').trim(),
      description: (currentSurvey.description || '').trim(),
      questions: normalizeQuestions(currentSurvey.questions!),
      trigger: {
        type: 'manual',
        conditions: {}
      },
      timeToComplete: 300, // Required field - 5 minutes default
      isActive: currentSurvey.isActive ?? true,
      createdBy: currentSurvey.createdBy || 'user',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    } as unknown as Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>;

    setLoading(true);
    setError(null);
    try {
      if (isEditMode) {
        console.debug('[SG] update payload:', JSON.stringify(payload, null, 2));
        const updated = await surveyApi.updateSurvey(selectedSurveyId!, payload, token);
        if (updated.id) {
          mergeListWithServer(updated as Survey);
        }
        
        // Also update the survey in the list with current survey data to ensure UI consistency
        setSurveys(prev => prev.map(s => {
          if (s.id === selectedSurveyId) {
            return {
              ...s,
              title: currentSurvey.title || s.title,
              description: currentSurvey.description || s.description,
              isActive: currentSurvey.isActive !== undefined ? currentSurvey.isActive : s.isActive,
              questionsCount: currentSurvey.questions?.length || 0,
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        }));
        
        setDirty(false); // Reset dirty state after successful update
        showToast(currentSurvey.isActive ? 'Changes published to users.' : 'Changes saved (survey is hidden).', 'success');
      } else {
        const created = await surveyApi.createSurvey(payload, token);
        setSurveys(prev => [created, ...prev]);
        setHasCreatedAtLeastOne(true);
        localStorage.setItem('airqo_sg_hasCreatedAtLeastOne', '1');
        // Switch into edit mode on the new survey
        setSelectedSurveyId(created.id);
        setShowCreateForm(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save survey');
    } finally {
      setLoading(false);
    }
  };

  const deleteSurvey = async (surveyId: string) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      await surveyApi.deleteSurvey(surveyId, token);
      setSurveys(prev => prev.filter(s => s.id !== surveyId));
      
      if (surveyId === selectedSurveyId) {
        const remaining = surveys.filter(s => s.id !== surveyId);
        if (remaining.length > 0) {
          const mostRecent = [...remaining].sort((a, b) => 
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
          )[0];
          setSelectedSurveyId(mostRecent.id);
        } else {
          if (hasCreatedAtLeastOne) {
            beginCreateSurvey();
          } else {
            const blankSurvey = createBlankSurvey();
            setCurrentSurvey(blankSurvey);
            originalRef.current = cloneSurvey(blankSurvey);
            setSelectedSurveyId(null);
            setShowCreateForm(false);
            setDirty(false);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete survey');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[var(--airqo-background-light)]">
      <div className="bg-white shadow-lg border border-gray-200 rounded-b-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/AirQo logo.svg"
                alt="AirQo Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-800">Survey Generator</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/research">
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:scale-105"
                >
                  Research Data
                </Button>
              </Link>
              <Button
                onClick={loadSurveys}
                disabled={loading}
                variant="outline"
                size="sm"
                className="transition-all duration-200 hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <AqRefreshCw01 size={16} className="animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <>
                    <AqRefreshCw01 size={16} className="mr-2" />
                    Refresh
                  </>
                )}
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
              >
                <AqLogOut01 size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-12">
          <h2 className="text-4xl font-medium text-gray-800">
            Welcome, {user?.email} 👋
          </h2>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-[var(--airqo-error-light)] border border-[var(--airqo-error)] rounded-lg">
            <div className="flex items-center gap-2">
              <AqX size={16} className="text-[var(--airqo-error)]" />
              <p className="text-[var(--airqo-error)] text-sm font-medium font-inter">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Survey List */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-gray-800">Your Surveys</CardTitle>
                      <Button 
                        onClick={beginCreateSurvey}
                        className="transform hover:scale-105 transition-all duration-200 shadow-lg"
                        size="sm"
                      >
                        <AqPlus size={16} className="mr-2" />
                        Create New
                      </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-12">
                      <AqRefreshCw01 size={32} className="animate-spin text-[var(--airqo-primary)] mx-auto mb-4" />
                      <p className="text-[var(--airqo-text-secondary)] font-inter">Loading your surveys...</p>
                    </div>
                  ) : surveys.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <AqFile01 size={64} className="text-[var(--airqo-text-placeholder)] mx-auto" />
                      <p className="text-[var(--airqo-text-secondary)] font-medium font-inter">No surveys yet</p>
                      <p className="text-sm text-[var(--airqo-text-placeholder)] font-inter">Create your first survey to get started</p>
                    </div>
                  ) : (
                    surveys.map(survey => (
                      <div 
                        key={survey.id} 
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedSurveyId(survey.id)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedSurveyId(survey.id)}
                        className={`group p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                          survey.id === selectedSurveyId
                            ? "border-[var(--airqo-primary)] bg-[var(--airqo-background-light)] shadow-md"
                            : "border-[var(--airqo-border)] hover:border-[var(--airqo-primary)] hover:shadow-md bg-[var(--airqo-background)] hover:bg-[var(--airqo-background-light)]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-[var(--airqo-text-primary)] group-hover:text-[var(--airqo-primary)] transition-colors font-inter">{survey.title}</h3>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSurvey(survey.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-[var(--airqo-text-placeholder)] hover:text-[var(--airqo-error)] hover:bg-[var(--airqo-error-light)] opacity-0 group-hover:opacity-100 transition-all duration-200"
                            disabled={loading}
                          >
                            <AqTrash02 size={16} />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{survey.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={survey.isActive ? 'success' : 'secondary'}>
                              {survey.isActive ? (
                                <><AqCheckCircle size={12} className="mr-1" /> Active</>
                              ) : (
                                <><AqCircle size={12} className="mr-1" /> Inactive</>
                              )}
                            </Badge>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {(survey.questions?.length ?? survey.questionCount ?? 0)} questions
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {formatCardTimestamp(survey.createdAt, survey.updatedAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Survey Builder */}
          <div className="lg:col-span-2">
            {(() => {
              const showEmpty = surveys.length === 0 && !hasCreatedAtLeastOne;
              const showCreate = showCreateForm;
              const showEdit = !showEmpty && !showCreate && !!selectedSurveyId;

              if (showEmpty) {
                return (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="text-center py-16">
                      <div className="space-y-6">
                        <div className="text-6xl mb-4">🎯</div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome to Survey Generator</h2>
                          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                            Create professional surveys with multiple question types, 
                            collect responses, and gain valuable insights from your audience.
                          </p>
                        </div>
                        <Button 
                          onClick={beginCreateSurvey}
                          className="transform hover:scale-105 transition-all duration-200 shadow-lg"
                          size="lg"
                        >
                          <AqPlay size={20} className="mr-2" />
                          Create Your First Survey
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              if (showCreate || showEdit) {
                if (selectedLoading) {
                  return (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="py-12 text-center">
                        <div className="space-y-4">
                          <AqRefreshCw01 size={32} className="animate-spin text-[var(--airqo-primary)] mx-auto" />
                          <p className="text-[var(--airqo-text-secondary)] font-inter">Loading survey details...</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                
                return (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-[var(--airqo-text-primary)] flex items-center gap-2 font-inter">
                      <AqFile01 size={24} className="text-[var(--airqo-primary)]" />
                      {isEditMode ? 'Edit Survey' : 'Create New Survey'}
                    </CardTitle>
                  </div>
                  {isEditMode && currentSurvey.isActive && dirty && (
                    <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                      You are editing a live survey. Changes go live when you click <b>Update Survey</b>.
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  
                  <div className="space-y-6 mb-8">
                    <Input
                      label="Survey Title"
                      value={currentSurvey.title || ''}
                      onChange={(e) => setCurrentSurvey(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Customer Satisfaction Survey"
                      size="lg"
                      className="font-medium"
                    />
                    
                    <Input
                      label="Description"
                      value={currentSurvey.description || ''}
                      onChange={(e) => setCurrentSurvey(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide a brief description of your survey's purpose..."
                      multiline
                      hint="This will help respondents understand what the survey is about"
                    />
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-[var(--airqo-text-primary)] flex items-center gap-2 font-inter">
                        <AqSettings01 size={20} className="text-[var(--airqo-primary)]" />
                        Questions
                        <span className="text-sm font-normal text-[var(--airqo-text-secondary)] bg-[var(--airqo-background-light)] px-2 py-1 rounded-full">
                          {currentSurvey.questions?.length || 0}
                        </span>
                      </h3>
                      <Button 
                        onClick={addQuestion} 
                        variant="outline"
                        className="hover:bg-[var(--airqo-primary-25)] hover:border-[var(--airqo-primary)] hover:text-[var(--airqo-primary)] transition-all duration-200"
                      >
                        <AqPlus size={16} className="mr-2" />
                        Add Question
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {currentSurvey.questions?.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-[var(--airqo-border)] rounded-xl">
                          <AqSettings01 size={48} className="text-[var(--airqo-text-placeholder)] mx-auto mb-3" />
                          <p className="text-[var(--airqo-text-secondary)] font-medium mb-2 font-inter">No questions yet</p>
                          <p className="text-sm text-[var(--airqo-text-placeholder)] mb-4 font-inter">Add your first question to get started</p>
                          <Button 
                            onClick={addQuestion}
                            className=""
                          >
                            <AqPlus size={16} className="mr-2" />
                            Add First Question
                          </Button>
                        </div>
                      ) : (
                        currentSurvey.questions?.map((question, index) => (
                          <div key={question.id} className="group p-6 border border-[var(--airqo-border)] rounded-xl hover:border-[var(--airqo-primary)] hover:shadow-lg transition-all duration-200 bg-[var(--airqo-background)] hover:bg-[var(--airqo-background-light)]">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[var(--airqo-primary)] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium text-gray-600">Question {index + 1}</span>
                              </div>
                              <Button
                                onClick={() => removeQuestion(question.id)}
                                variant="ghost"
                                size="sm"
                                className="text-[var(--airqo-text-placeholder)] hover:text-[var(--airqo-error)] hover:bg-[var(--airqo-error-light)] opacity-0 group-hover:opacity-100 transition-all duration-200"
                              >
                                <AqTrash02 size={16} className="mr-2" />
                                Remove
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              <Input
                                value={question.text}
                                onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                                placeholder="Enter your question here..."
                                size="lg"
                                className="font-medium"
                              />
                              
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                                  <select
                                    value={question.type}
                                    onChange={(e) => {
                                      const newType = e.target.value as Question['type'];
                                      updateQuestion(question.id, { 
                                        type: newType,
                                        options: newType.includes('choice') ? (question.options?.length ? question.options : ['Option 1', 'Option 2']) : undefined
                                      });
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                  >
                                    <option value="text">📝 Text Input</option>
                                    <option value="single-choice">🔘 Single Choice</option>
                                    <option value="multiple-choice">☑️ Multiple Choice</option>
                                    <option value="rating">⭐ Rating</option>
                                    <option value="boolean">✅ Yes/No</option>
                                  </select>
                                </div>
                                
                                <div className="flex items-end">
                                  <label className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={question.required}
                                      onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Required</span>
                                  </label>
                                </div>
                              </div>
                              
                              {question.type.includes('choice') && (
                                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                                  <label className="text-sm font-semibold text-[var(--airqo-text-primary)] flex items-center gap-2 font-inter">
                                    <AqSettings01 size={16} />
                                    Answer Options
                                  </label>
                                  {question.options?.map((option, optIndex) => (
                                    <div key={`${question.id}-option-${optIndex}`} className="flex gap-3 items-center">
                                      <div className="w-6 h-6 bg-[var(--airqo-primary)] text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                        {String.fromCharCode(65 + optIndex)}
                                      </div>
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...(question.options || [])];
                                          newOptions[optIndex] = e.target.value;
                                          updateQuestion(question.id, { options: newOptions });
                                        }}
                                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                        className="flex-1"
                                      />
                                      <Button
                                        onClick={() => {
                                          const newOptions = question.options?.filter((_, i) => i !== optIndex) || [];
                                          updateQuestion(question.id, { options: newOptions });
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="text-[var(--airqo-text-placeholder)] hover:text-[var(--airqo-error)] hover:bg-[var(--airqo-error-light)] flex-shrink-0"
                                      >
                                        <AqTrash02 size={16} />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    onClick={() => {
                                      const newOptions = [...(question.options || []), ''];
                                      updateQuestion(question.id, { options: newOptions });
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-dashed hover:bg-[var(--airqo-primary-25)] hover:border-[var(--airqo-primary)] hover:text-[var(--airqo-primary)] transition-all duration-200"
                                  >
                                    <AqPlus size={16} className="mr-2" />
                                    Add Option
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading || !currentSurvey.title || !currentSurvey.questions?.length}
                      className="flex-1 sm:flex-none transform hover:scale-105 transition-all duration-200 shadow-lg"
                      size="lg"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <AqRefreshCw01 size={16} className="animate-spin" />
                          {isEditMode ? 'Updating...' : 'Saving...'}
                        </div>
                      ) : (
                        <>
                          <AqSave01 size={16} className="mr-2" />
                          {isEditMode ? 'Update Survey' : 'Save Survey'}
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={() => {
                        if (isEditMode) {
                          // If editing, go back to the survey list without creating
                          setShowCreateForm(false);
                        } else {
                          // If creating, cancel the form
                          setShowCreateForm(false);
                        }
                      }} 
                      variant="outline"
                      disabled={loading}
                      size="lg"
                      className="flex-1 sm:flex-none hover:bg-gray-50"
                    >
                      {isEditMode ? 'Done' : 'Cancel'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
                );
              }

              // Fallback - should not reach here in normal operation
              return (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="text-center py-16">
                    <div className="space-y-6">
                      <div className="text-6xl mb-4">🎯</div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome to Survey Generator</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                          Create professional surveys with multiple question types, 
                          collect responses, and gain valuable insights from your audience.
                        </p>
                      </div>
                      <Button
                        onClick={beginCreateSurvey}
                        className="transform hover:scale-105 transition-all duration-200 shadow-lg"
                        size="lg"
                      >
                        <AqPlay size={20} className="mr-2" />
                        Create Your First Survey
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
