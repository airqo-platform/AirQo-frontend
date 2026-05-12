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
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {features.map(feature => {
          const Icon = feature.icon;

          return (
            <Card key={feature.title} padding="p-5" className="min-h-[200px]">
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
    </section>
  );
}
