import Link from 'next/link';

import { type FooterLinkGroup, footerLinkGroups } from './footerContent';

type FooterLinkColumnsProps = {
  groups?: FooterLinkGroup[];
};

const FooterLinkColumns = ({
  groups = footerLinkGroups,
}: FooterLinkColumnsProps) => {
  return (
    <nav
      aria-label="Footer navigation"
      className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
    >
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col">
          <h3 className="mb-2 font-semibold text-gray-800">{group.title}</h3>
          <ul className="space-y-1">
            {group.links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  target={link.openInNewTab ? '_blank' : undefined}
                  rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                  className="text-gray-600 leading-5 transition-colors hover:text-blue-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default FooterLinkColumns;
