'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { BulkDeviceClaimResponse } from '@/app/types/devices';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BulkClaimResultsProps {
    results: BulkDeviceClaimResponse['data'];
}

export const BulkClaimResults: React.FC<BulkClaimResultsProps> = ({ results }) => {
    const [showSuccessful, setShowSuccessful] = React.useState(true);
    const [showFailed, setShowFailed] = React.useState(true);

    const { successful_claims, failed_claims } = results;

    const successful_count = successful_claims.length;
    const failed_count = failed_claims.length;
    const total_requested = successful_count + failed_count;

    return (
        <div className="space-y-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Requested</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{total_requested}</div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-600 dark:text-green-400">Successful</div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">{successful_count}</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">{failed_count}</div>
                </div>
            </div>

            {/* Successful Claims */}
            {successful_claims.length > 0 && (
                <Collapsible open={showSuccessful} onOpenChange={setShowSuccessful}>
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium text-green-700 dark:text-green-300">
                                    Successfully Claimed Devices ({successful_claims.length})
                                </span>
                            </div>
                            {showSuccessful ? (
                                <ChevronUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                            {successful_claims.map((result, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {result.device?.long_name || result.device_name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {result.device?.name || result.device_name}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-green-600 dark:text-green-400">Claimed</span>
                                </div>
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}

            {/* Failed Claims */}
            {failed_claims.length > 0 && (
                <Collapsible open={showFailed} onOpenChange={setShowFailed}>
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <span className="font-medium text-red-700 dark:text-red-300">
                                    Failed Claims ({failed_claims.length})
                                </span>
                            </div>
                            {showFailed ? (
                                <ChevronUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                            {failed_claims.map((result, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800"
                                >
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {result.device_name}
                                            </p>
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                {result.error || 'Unknown error occurred'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    );
};
