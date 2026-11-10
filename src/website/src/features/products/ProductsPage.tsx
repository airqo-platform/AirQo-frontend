import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';

import {
  getProductsByFamily,
  type Product,
  PRODUCT_FAMILIES,
  PRODUCT_FAMILY_ORDER,
} from '@/config/products.config';
import mainConfig from '@/config/site.config';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

const familyById = new Map(
  PRODUCT_FAMILIES.map((family) => [family.id, family]),
);

const HERO_IMAGE = optimizeCloudinaryUrl(
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1743546958/website/photos/OurProducts/Monitor/Two_members_in_field_knwffk.jpg',
  { width: 1200 },
);

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <article className="group flex flex-col overflow-hidden rounded-md border border-line bg-white">
    <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
      <Image
        src={product.image}
        alt={product.imageAlt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
      />
    </div>
    <div className="flex flex-1 flex-col p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
        {product.category}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-ink">{product.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
        {product.description}
      </p>
      <Link
        href={product.href}
        className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {product.cta}
        <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </Link>
    </div>
  </article>
);

const ProductsPage = () => (
  <div className="w-full bg-white text-ink">
    {/* Hero */}
    <section className="border-b border-line bg-white">
      <div
        className={`${mainConfig.containerClass} px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24`}
      >
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
              AirQo product system
            </p>
            <h1 className="mt-4 max-w-2xl text-balance text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-[56px]">
              From a monitor on a wall to a decision in city hall.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
              Eight tools that measure air quality, make sense of it, and help
              people act.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="https://ai.airqo.net/map"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="See live air quality map (opens in a new tab)"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                See live air quality
                <FiArrowUpRight aria-hidden="true" />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-ink bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Talk to the team
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface-muted">
              <Image
                src={HERO_IMAGE}
                alt="AirQo field engineers installing a Binos monitor"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              AirQo field engineers installing a Binos monitor in Kampala,
              Uganda.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Anchor nav */}
    <nav
      aria-label="Product families"
      className="border-b border-line bg-white"
    >
      <div
        className={`${mainConfig.containerClass} flex flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6 lg:px-8`}
      >
        {PRODUCT_FAMILY_ORDER.map((family) => {
          const info = familyById.get(family);
          return (
            <a
              key={family}
              href={`#${family}`}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="text-slate-500">{info?.number}</span>
              {' · '}
              {info?.label}
            </a>
          );
        })}
      </div>
    </nav>

    {/* Family sections */}
    {PRODUCT_FAMILY_ORDER.map((family) => {
      const info = familyById.get(family);
      const products = getProductsByFamily(family);

      return (
        <section
          key={family}
          id={family}
          aria-labelledby={`${family}-heading`}
          className="scroll-mt-32 border-b border-line py-14 sm:py-16"
        >
          <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  {info?.number}
                </p>
                <h2
                  id={`${family}-heading`}
                  className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
                >
                  {info?.title}
                </h2>
                <p className="mt-3 max-w-2xl text-lg leading-7 text-gray-600">
                  {info?.description}
                </p>
              </div>
              <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">
                {products.length} tools
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      );
    })}

    {/* Final CTA */}
    <section className="border-y border-brand-100 bg-brand-50 text-ink">
      <div
        className={`${mainConfig.containerClass} flex flex-col gap-6 px-4 py-14 sm:px-6 lg:px-8 lg:py-16`}
      >
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-700">
            Work with AirQo
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Bring the AirQo system to your city or project.
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-700">
            Whether you need a monitoring network, a data partnership, or a
            public air quality tool, the AirQo team can help you choose the
            right combination.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Contact us
            <FiArrowRight aria-hidden="true" />
          </Link>
          <a
            href="https://ai.airqo.net/map"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open live map (opens in a new tab)"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-ink bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Open live map
            <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  </div>
);

export default ProductsPage;
