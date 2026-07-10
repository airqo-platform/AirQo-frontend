import { Database, Laptop, RadioTower } from 'lucide-react';

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
    <section className="bg-background px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {features.map(feature => {
          const Icon = feature.icon;

          return (
            <Card
              key={feature.title}
              padding="p-4 sm:p-5"
              className="min-h-0 sm:min-h-[200px]"
            >
              <div className="flex h-full flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-11 sm:w-11">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-normal text-heading sm:mt-5">
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
    </section>
  );
}
