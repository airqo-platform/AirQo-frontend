import { CheckCircle2, Database, Laptop, RadioTower } from 'lucide-react';

import Card from '@/components/shared/card/CardWrapper';

const features = [
  {
    icon: Laptop,
    title: 'Focused desktop workspace',
    description:
      'Keep device deployment, claiming, and network operations in a dedicated Vertex window.',
  },
  {
    icon: RadioTower,
    title: 'Field-ready device workflows',
    description:
      'Move through device rollout tasks with the same Vertex controls used by AirQo teams.',
  },
  {
    icon: Database,
    title: 'Data sharing continuity',
    description:
      'Stay close to the workflows that help devices publish trusted air quality data.',
  },
];

export default function PlatformInfo() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Windows support
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-heading">
              Built for the supported Vertex Desktop platform
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Vertex Desktop is currently available for Windows. The installer
              opens the same AirQo device management experience in a desktop
              environment for teams deploying and managing devices.
            </p>
            <div className="mt-6 rounded-lg border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-heading">
                    Windows is supported now
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Other operating systems are not presented on this page until
                    official installers are available.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map(feature => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  padding="p-5"
                  className="min-h-[220px]"
                >
                  <div className="flex h-full flex-col">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-normal text-heading">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
