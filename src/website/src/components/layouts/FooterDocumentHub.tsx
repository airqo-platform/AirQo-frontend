import Link from 'next/link';
import { FaArrowRightLong } from 'react-icons/fa6';

import { type FooterDocument, footerDocuments } from './footerContent';

type FooterDocumentHubProps = {
  documents?: FooterDocument[];
};

const FooterDocumentHub = ({
  documents = footerDocuments,
}: FooterDocumentHubProps) => {
  return (
    <section
      aria-labelledby="footer-documents-heading"
      className="mt-10 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <h3
            id="footer-documents-heading"
            className="mt-0 text-2xl font-semibold leading-tight text-slate-900 sm:text-[2rem]"
          >
            Find the right AirQo guide quickly
          </h3>
          <div className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
            <p>
              Access to AirQo data is guided by our commitment to openness,
              responsible use, and impact.
            </p>
            <p>
              These documents provide guidance on how to access and use AirQo
              air quality data.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-200 bg-white">
          {documents.map((document, index) => (
            <Link
              key={document.title}
              href={document.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${document.title} PDF`}
              className="group flex items-start gap-3 px-5 py-4 transition-colors duration-200 hover:bg-slate-50 sm:items-center sm:px-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                0{index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <h4 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                  {document.title}
                </h4>
                <p className="mt-0.5 text-sm leading-4 text-slate-600">
                  {document.description}
                </p>
              </div>

              <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-blue-700">
                <span className="hidden sm:inline">Open</span>
                <FaArrowRightLong className="text-sm transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FooterDocumentHub;
