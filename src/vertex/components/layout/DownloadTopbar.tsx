'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { vertexConfig } from '@/vertex.config';
import AppDropdown from './AppDropdown';
import { Button } from '@/components/ui/button';

export default function DownloadTopbar() {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Image
                        src={vertexConfig.org.logo}
                        alt={`${vertexConfig.org.name} logo`}
                        width={120}
                        height={32}
                        className="h-6 w-auto"
                        priority
                    />
                    <span className="text-lg font-medium tracking-tight text-foreground">
                        {vertexConfig.org.name}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/login')}
                    >
                        Sign in
                    </Button>
                    <AppDropdown />
                </div>
            </div>
        </header>
    );
}
