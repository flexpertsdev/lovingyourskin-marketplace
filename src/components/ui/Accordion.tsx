
import { FunctionComponent, useState } from "react";

interface AccordionProps {
  items: {
    title: string;
    content: string;
  }[];
}

export const Accordion: FunctionComponent<AccordionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="border-b">
          <button
            onClick={() => toggle(index)}
            className="w-full text-left py-4 focus:outline-none"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{item.title}</span>
              <span>{openIndex === index ? "-" : "+"}</span>
            </div>
          </button>
          {openIndex === index && (
            <div className="py-4">
              <p>{item.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
