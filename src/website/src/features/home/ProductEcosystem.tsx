import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

import {
  getProductsByFamily,
  type Product,
  PRODUCT_FAMILIES,
  PRODUCT_FAMILY_ORDER,
} from '@/config/products.config';

const getRepresentativeProduct = (products: Product[]): Product | undefined =>
  products.find((product) => product.featured) ?? products[0];

const ProductEcosystem = () => (
  <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
            The AirQo system
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Measure. Understand. Act.
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-7 text-gray-600">
            Eight tools that measure air quality, make sense of it, and help
            people act.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-sm text-sm font-semibold text-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Explore all products
          <FiArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-8">
        {PRODUCT_FAMILY_ORDER.map((familyId) => {
          const family = PRODUCT_FAMILIES.find((item) => item.id === familyId);
          const products = getProductsByFamily(familyId);
          const representative = getRepresentativeProduct(products);
          if (!family) return null;

          return (
            <div key={familyId} className="min-w-0 border-t border-line pt-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface-muted">
                <Image
                  src={representative?.image ?? ''}
                  alt={representative?.imageAlt ?? family.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-mono text-xs text-slate-600">
                  {family.number}
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {family.label}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {family.shortDescription}
              </p>

              <ul className="mt-5 divide-y divide-line border-y border-line">
                {products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={product.href}
                      className="group flex items-center gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-semibold text-ink transition-colors group-hover:text-brand">
                          {product.name}
                        </span>
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">
                          {product.category}
                        </span>
                      </span>
                      <FiArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default ProductEcosystem;
