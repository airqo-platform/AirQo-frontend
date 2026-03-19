'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import {
  AqRefreshCw01,
  AqLogOut01,
  AqDownload01,
  AqDatabase02,
  AqChevronDown,
  AqChevronUp,
} from '@airqo/icons-react';
import Image from 'next/image';
import SignInPage from '@/components/SignInPage';
import Link from 'next/link';

const POSTHOG_USER_MAPPING: Record<string, string> = {
  "6999bc7c1a4bb300134e0e9c": "0af7f27e-91b9-5fa6-92a1-00454a3aac51",
  "698c3a6ab58b8a001301697b": "0fad1ed4-1bc7-5aa9-b688-5f9f21482841",
  "68beb047582eea00130fb428": "b95ab10c-0b0e-52e3-ac58-e48d1fa6f493",
  "6995d63110b76a0013f77ae5": "ee6019ed-9b29-5c58-b95e-c1eddb9a9c5c",
  "63455f5046e0d30013fc7357": "4ec0f187-2c87-5243-834e-f9eb58ef0d72",
  "69949478d6bdba0014ead065": "ad314b94-6928-51d8-91df-16249a8b8679",
  "69969b91983ce30013ad7bae": "9768ea55-d63b-5635-bc50-cb65d0e9ee17",
};
// Keys are AirQo userIds. Values are PostHog UUIDs.
// 69981dce3586c00013c209f1 is unresolved — will show as "Unresolved".

const PILOT_START_DATE = new Date("2026-02-11");

interface SurveyResponse {
  _id: string;
  surveyId: string;
  userId?: string;
  deviceId?: string;
  isGuest: boolean;
  answers: Array<{
    questionId: string;
    answer: string | string[] | number | boolean;
  }>;
  status: string;
  timeToComplete?: number;
  createdAt: string;
}

interface Survey {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    text?: string;
    question?: string;
  }>;
}

export default function ResearchDataPage() {
  const { token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [allTime, setAllTime] = useState(false);
  const [expandedSurveys, setExpandedSurveys] = useState<Set<string>>(new Set());

  const loadResponses = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/responses', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch responses: ${response.statusText}`);
      }

      const data = await response.json();
      setResponses(data);
    } catch (err) {
      console.error('Error loading responses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const loadSurveys = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/surveys', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch surveys: ${response.statusText}`);
      }

      const data = await response.json();
      setSurveys(data);
    } catch (err) {
      console.error('Error loading surveys:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadResponses();
      loadSurveys();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  // Initialize all surveys as expanded when surveys or responses change
  useEffect(() => {
    const surveyIds = new Set(responses.map(r => r.surveyId));
    setExpandedSurveys(surveyIds);
  }, [responses]);

  // Filter responses by date range
  const filteredResponses = useMemo(() => {
    if (allTime || (!dateFrom && !dateTo)) return responses;

    return responses.filter(response => {
      const completedDate = new Date(response.createdAt);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      let toDate = dateTo ? new Date(dateTo) : null;
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
      }

      if (fromDate && completedDate < fromDate) return false;
      if (toDate && completedDate > toDate) return false;

      return true;
    });
  }, [responses, dateFrom, dateTo, allTime]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const total = filteredResponses.length;
    const pilotResponses = filteredResponses.filter(r => new Date(r.createdAt) >= PILOT_START_DATE).length;
    const prePilotResponses = filteredResponses.filter(r => new Date(r.createdAt) < PILOT_START_DATE).length;

    return { total, pilotResponses, prePilotResponses };
  }, [filteredResponses]);

  // Get question text from survey
  const getQuestionText = (questionId: string, surveyId: string): string => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return questionId;

    const question = survey.questions?.find(q => q.id === questionId);
    if (!question) return questionId;

    return question.text || question.question || questionId;
  };

  // Get survey title by ID
  const getSurveyTitle = (surveyId: string): string => {
    const survey = surveys.find(s => s.id === surveyId);
    return survey?.title || surveyId;
  };

  // Format time to complete
  const formatTimeToComplete = (seconds?: number): string => {
    if (!seconds) return '—';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Get participant ID using the new logic
  const getParticipantId = (response: SurveyResponse): string => {
    if (response.userId && POSTHOG_USER_MAPPING[response.userId]) {
      return POSTHOG_USER_MAPPING[response.userId];
    }

    if (response.deviceId && response.deviceId.trim() !== '') {
      return response.deviceId;
    }

    return 'Unresolved';
  };

  // Get period badge info based on createdAt
  const getPeriod = (createdAt: string): { label: string; color: string } => {
    const date = new Date(createdAt);
    if (date >= PILOT_START_DATE) {
      return { label: 'Pilot', color: 'blue' };
    }
    return { label: 'Pre-pilot', color: 'amber' };
  };

  // Group responses by survey
  const groupedResponses = useMemo(() => {
    const groups = new Map<string, SurveyResponse[]>();

    filteredResponses.forEach(response => {
      const surveyId = response.surveyId;
      if (!groups.has(surveyId)) {
        groups.set(surveyId, []);
      }
      groups.get(surveyId)!.push(response);
    });

    return groups;
  }, [filteredResponses]);

  // Get all unique question IDs for a specific survey
  const getQuestionIdsForSurvey = (surveyId: string): string[] => {
    const responses = groupedResponses.get(surveyId) || [];
    const questionIds = new Set<string>();
    responses.forEach(response => {
      if (response.answers && Array.isArray(response.answers)) {
        response.answers.forEach(answer => questionIds.add(answer.questionId));
      }
    });
    return Array.from(questionIds);
  };

  // Get all unique question IDs across all filtered responses (for CSV export)
  const allQuestionIds = useMemo(() => {
    const questionIds = new Set<string>();
    filteredResponses.forEach(response => {
      if (response.answers && Array.isArray(response.answers)) {
        response.answers.forEach(answer => questionIds.add(answer.questionId));
      }
    });
    return Array.from(questionIds);
  }, [filteredResponses]);

  // Toggle survey expansion
  const toggleSurvey = (surveyId: string) => {
    setExpandedSurveys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(surveyId)) {
        newSet.delete(surveyId);
      } else {
        newSet.add(surveyId);
      }
      return newSet;
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredResponses.length === 0) return;

    // Build CSV headers
    const headers = [
      'Survey Title',
      'Response ID',
      'Participant ID',
      'Device ID',
      'Period',
      'Time to Complete',
      'Completed At',
      ...allQuestionIds.map(qId => {
        const firstResponse = filteredResponses.find(r =>
          r.answers && r.answers.some(a => a.questionId === qId)
        );
        if (firstResponse) {
          return getQuestionText(qId, firstResponse.surveyId);
        }
        return qId;
      })
    ];

    // Build CSV rows
    const rows = filteredResponses.map(response => {
      const participantId = getParticipantId(response);
      const deviceId = response.deviceId || '—';
      const period = getPeriod(response.createdAt).label;

      const row = [
        getSurveyTitle(response.surveyId),
        response._id,
        participantId,
        deviceId,
        period,
        formatTimeToComplete(response.timeToComplete),
        new Date(response.createdAt).toLocaleString(),
      ];

      // Add answers for each question
      allQuestionIds.forEach(qId => {
        const answerObj = response.answers?.find(a => a.questionId === qId);
        const answer = answerObj?.answer;

        if (answer === undefined || answer === null) {
          row.push('');
        } else if (Array.isArray(answer)) {
          row.push(answer.join('; '));
        } else {
          row.push(String(answer));
        }
      });

      return row;
    });

    // Combine headers and rows
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `research-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

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
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:scale-105"
                >
                  Surveys
                </Button>
              </Link>
              <Button
                onClick={loadResponses}
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
        <div className="mb-8">
          <h2 className="text-4xl font-medium text-gray-800 mb-2">
            Research Data
          </h2>
          <p className="text-[var(--airqo-text-secondary)] font-inter">
            View and analyze survey responses
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--airqo-error-light)] border border-[var(--airqo-error)] rounded-lg">
            <p className="text-[var(--airqo-error)] text-sm font-medium font-inter">{error}</p>
          </div>
        )}

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[var(--airqo-text-primary)] flex items-center gap-2 font-inter">
              <AqDatabase02 size={24} className="text-[var(--airqo-primary)]" />
              Filters & Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Date Range Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="From Date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="Start date"
                  disabled={allTime}
                  className={allTime ? 'opacity-50 cursor-not-allowed' : ''}
                />
                <Input
                  label="To Date"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="End date"
                  disabled={allTime}
                  className={allTime ? 'opacity-50 cursor-not-allowed' : ''}
                />
              </div>

              {/* All Time Toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={allTime}
                      onChange={(e) => setAllTime(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${allTime ? 'bg-[var(--airqo-primary)]' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${allTime ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-[var(--airqo-text-primary)] font-inter">
                    All time
                  </span>
                </label>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="bg-[var(--airqo-background-light)] p-4 rounded-lg">
                  <p className="text-sm text-[var(--airqo-text-secondary)] font-inter mb-1">Total Responses</p>
                  <p className="text-3xl font-bold text-[var(--airqo-primary)] font-inter">{summary.total}</p>
                </div>
                <div className="bg-[var(--airqo-background-light)] p-4 rounded-lg">
                  <p className="text-sm text-[var(--airqo-text-secondary)] font-inter mb-1">Pilot Responses</p>
                  <p className="text-3xl font-bold text-blue-600 font-inter">{summary.pilotResponses}</p>
                </div>
                <div className="bg-[var(--airqo-background-light)] p-4 rounded-lg">
                  <p className="text-sm text-[var(--airqo-text-secondary)] font-inter mb-1">Pre-pilot Responses</p>
                  <p className="text-3xl font-bold text-amber-600 font-inter">{summary.prePilotResponses}</p>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={exportToCSV}
                  disabled={filteredResponses.length === 0}
                  className="transform hover:scale-105 transition-all duration-200"
                >
                  <AqDownload01 size={16} className="mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {loading ? (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent>
                <div className="text-center py-12">
                  <AqRefreshCw01 size={32} className="animate-spin text-[var(--airqo-primary)] mx-auto mb-4" />
                  <p className="text-[var(--airqo-text-secondary)] font-inter">Loading responses...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredResponses.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent>
                <div className="text-center py-12">
                  <AqDatabase02 size={64} className="text-[var(--airqo-text-placeholder)] mx-auto mb-4" />
                  <p className="text-[var(--airqo-text-secondary)] font-medium font-inter">No responses found</p>
                  <p className="text-sm text-[var(--airqo-text-placeholder)] font-inter mt-2">
                    {dateFrom || dateTo || allTime ? 'Try adjusting your date filters' : 'Responses will appear here once users complete surveys'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            Array.from(groupedResponses.entries()).map(([surveyId, surveyResponses]) => {
              const surveyTitle = getSurveyTitle(surveyId);
              const isExpanded = expandedSurveys.has(surveyId);
              const questionIds = getQuestionIdsForSurvey(surveyId);
              const displayTitle = surveyTitle === surveyId ? 'Unknown Survey' : surveyTitle;

              return (
                <Card key={surveyId} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader
                    className="cursor-pointer hover:bg-[var(--airqo-background-light)] transition-colors"
                    onClick={() => toggleSurvey(surveyId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <AqChevronUp size={20} className="text-[var(--airqo-primary)]" />
                        ) : (
                          <AqChevronDown size={20} className="text-[var(--airqo-primary)]" />
                        )}
                        <CardTitle className="text-xl text-[var(--airqo-text-primary)] font-inter font-semibold">
                          {displayTitle}
                        </CardTitle>
                      </div>
                      <div className="text-sm text-[var(--airqo-text-secondary)] font-inter">
                        {surveyResponses.length} {surveyResponses.length === 1 ? 'response' : 'responses'}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 bg-[var(--airqo-background-light)]">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--airqo-text-primary)] font-inter">
                                Participant ID
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--airqo-text-primary)] font-inter">
                                Device ID
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--airqo-text-primary)] font-inter">
                                Period
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--airqo-text-primary)] font-inter">
                                Time to Complete
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--airqo-text-primary)] font-inter">
                                Completed At
                              </th>
                              {questionIds.map(qId => {
                                const questionText = getQuestionText(qId, surveyId);
                                return (
                                  <th key={qId} className="px-4 py-3 text-left text-sm font-semibold text-[var(--airqo-text-primary)] font-inter">
                                    {questionText}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {surveyResponses.map((response, idx) => {
                              const participantId = getParticipantId(response);
                              const deviceId = response.deviceId || '—';
                              const period = getPeriod(response.createdAt);
                              const isUnresolved = participantId === 'Unresolved';

                              return (
                                <tr key={response._id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[var(--airqo-background)]'}`}>
                                  <td className="px-4 py-3 text-sm font-inter font-mono text-xs">
                                    {isUnresolved ? (
                                      <span className="text-[var(--airqo-text-placeholder)] italic">Unresolved</span>
                                    ) : (
                                      <span className="text-[var(--airqo-text-primary)]">{participantId}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-[var(--airqo-text-primary)] font-inter font-mono text-xs">
                                    {deviceId}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-inter">
                                    {period.color === 'blue' ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {period.label}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                        {period.label}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-[var(--airqo-text-secondary)] font-inter">
                                    {formatTimeToComplete(response.timeToComplete)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-[var(--airqo-text-primary)] font-inter">
                                    {new Date(response.createdAt).toLocaleString()}
                                  </td>
                                  {questionIds.map(qId => {
                                    const answerObj = response.answers?.find(a => a.questionId === qId);
                                    const answer = answerObj?.answer;
                                    let displayValue = '';

                                    if (answer === undefined || answer === null) {
                                      displayValue = '—';
                                    } else if (Array.isArray(answer)) {
                                      displayValue = answer.join(', ');
                                    } else {
                                      displayValue = String(answer);
                                    }

                                    return (
                                      <td key={qId} className="px-4 py-3 text-sm text-[var(--airqo-text-secondary)] font-inter">
                                        {displayValue}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
