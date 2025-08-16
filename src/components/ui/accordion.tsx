import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  items: Array<{
    title: string;
    content: React.ReactNode;
  }>;
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <div key={index} className="border rounded-lg">
          <button
            className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            onClick={() => toggleItem(index)}
          >
            <span className="font-medium">{item.title}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                openIndex === index && "rotate-180"
              )}
            />
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
