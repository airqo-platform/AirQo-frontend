'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    AqDotsGrid,
    AqCalibration,
    AqGlobe02Maps_Travel,
    AqBookOpen01,
    AqPhone01,
    AqArrowNarrowLeft,
    AqCpuChip01,
    AqServer03,
    AqBarChartSquarePlus,
} from '@airqo/icons-react';
import { Smartphone } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/components/ui/dropdown-menu';

interface App {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    type?: 'qr';
    color: string;
}

interface AppDropdownProps {
    className?: string;
}

const AppDropdown: React.FC<AppDropdownProps> = ({ className = '' }) => {
    const [showQRCode, setShowQRCode] = useState(false);
    const isProduction = process.env.NODE_ENV === 'production';

    const getUrl = (baseUrl: string): string => {
        if (isProduction) return baseUrl;
        try {
            const url = new URL(baseUrl);
            url.hostname = `staging-${url.hostname}`;
            return url.toString();
        } catch {
            return baseUrl;
        }
    };

    const apps: App[] = [
        {
            name: 'Analytics',
            icon: AqBarChartSquarePlus,
            href: getUrl('https://analytics.airqo.net/'),
            color: 'bg-green-500',
        },
        {
            name: 'Calibrate',
            icon: AqCalibration,
            href: getUrl('https://airqalibrate.airqo.net/'),
            color: 'bg-blue-500',
        },
        {
            name: 'Website',
            icon: AqGlobe02Maps_Travel,
            href: 'https://airqo.net/',
            color: 'bg-purple-500',
        },
        {
            name: 'Vertex',
            icon: AqServer03,
            href: getUrl('https://vertex.airqo.net/'),
            color: 'bg-yellow-600',
        },
        {
            name: 'API Docs',
            icon: AqBookOpen01,
            href: 'https://docs.airqo.net/airqo-rest-api-documentation/',
            color: 'bg-orange-500',
        },
        {
            name: 'Mobile App',
            icon: AqPhone01,
            type: 'qr',
            color: 'bg-indigo-500',
        },
        {
            name: 'AI platform',
            icon: AqCpuChip01,
            href: 'https://ai.airqo.net',
            color: 'bg-pink-500',
        },
    ];

    const handleAppClick = (app: App): void => {
        if (app.type === 'qr') {
            setShowQRCode(true);
        } else if (app.href) {
            window.open(app.href, '_blank', 'noopener,noreferrer');
        }
    };

    const handleBackClick = (): void => {
        setShowQRCode(false);
    };

    const openAppStore = (url: string): void => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={`p-2.5 rounded-full transition hover:bg-muted focus:outline-none ${className}`}
                aria-label="Applications"
            >
                <AqDotsGrid className="w-6 h-6 text-muted-foreground" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-auto border-none shadow-lg z-[10000]"
                align="end"
            >
                {!showQRCode ? (
                    <div className="p-2 grid grid-cols-3 gap-3">
                        {apps.map(app => {
                            const Icon = app.icon;
                            return (
                                <button
                                    key={app.name}
                                    type="button"
                                    title={app.name}
                                    onClick={() => handleAppClick(app)}
                                    className="flex flex-col items-center gap-3 p-3 rounded-md hover:bg-muted focus:outline-none transition-colors"
                                    aria-label={app.name}
                                >
                                    <div
                                        className={`w-12 h-12 ${app.color} rounded-md flex items-center justify-center shadow-sm`}
                                    >
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-center leading-tight">
                                        {app.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-2">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={handleBackClick}
                                className="p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                                aria-label="Back to apps"
                            >
                                <AqArrowNarrowLeft className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <h3 className="text-lg ">Get AirQo Mobile App</h3>
                            <div className="w-9" aria-hidden="true" />
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="w-56 h-56 bg-white overflow-hidden rounded-2xl border-2 border-primary shadow-sm flex items-center justify-center relative">
                                <Image
                                    src="/images/QR/AQR.jpeg"
                                    alt="AirQo Mobile App QR Code"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        <p className="text-center text-base font-medium mb-2">
                            Scan with your phone camera
                        </p>
                        <p className="text-center text-sm text-muted-foreground mb-6">
                            Or search &quot;AirQo&quot; in your app store
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() =>
                                    openAppStore(
                                        'https://play.google.com/store/apps/details?id=com.airqo.app'
                                    )
                                }
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                                aria-label="Download on Google Play"
                            >
                                <Smartphone className="w-4 h-4" />
                                <span>Google Play</span>
                            </button>
                            <button
                                onClick={() =>
                                    openAppStore(
                                        'https://apps.apple.com/ug/app/airqo-air-quality/id1337573091'
                                    )
                                }
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                                aria-label="Download on App Store"
                            >
                                <Smartphone className="w-4 h-4" />
                                <span>App Store</span>
                            </button>
                        </div>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default AppDropdown;
