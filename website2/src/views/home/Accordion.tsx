import type React from 'react';
import { useState } from 'react';

type AccordionItem = {
  title: string;
  content: string;
};

type AccordionProps = {
  items: AccordionItem[];
};

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openItem, setOpenItem] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenItem((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className={`${openItem === index ? 'bg-[#DFE8F9] rounded-xl' : ''} transition-all`}
        >
          <button
            onClick={() => toggleItem(index)}
            className={`w-full text-left text-lg font-semibold px-4 py-2 duration-300 ease-in-out outline-none border-none`}
          >
            {item.title}
          </button>
          <div
            className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
              openItem === index
                ? 'max-h-screen rounded-b-lg px-4 py-2'
                : 'max-h-0'
            }`}
          >
            {openItem === index && (
              <div className="text-gray-700">{item.content}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
