import { useState } from 'react';
import { MdKeyboardArrowRight, MdOutlineKeyboardArrowDown } from 'react-icons/md';

const Accordion = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number | null) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const questions = [
    {
      title: 'How secure is the AI Negotiation Bot?',
      content:
        'We use advanced encryption and comply with international data security standards to ensure all your negotiations and contracts are secure.'
    },
    {
      title: 'Can I customize the bot\'s negotiation tactics?',
      content:
        'We use advanced encryption and comply with international data security standards to ensure all your negotiations and contracts are secure.'
    },
    {
      title: 'Can I customize the bot\'s negotiation tactics?',
      content:
        'We use advanced encryption and comply with international data security standards to ensure all your negotiations and contracts are secure.'
    },
    {
      title: 'Can I customize the bot\'s negotiation tactics?',
      content:
      'We use advanced encryption and comply with international data security standards to ensure all your negotiations and contracts are secure.'
    }
  ];

  return (
    <div className="bg-[#F7F7FB] rounded-lg shadow-md mt-8 w-[80%] mx-auto">
      <h2 className="xl:text-3xl text-xl font-bold text-center pt-6 mb-10">Frequently Asked Question</h2>
      <div className="space-y-2 ">
        {questions.map((question, index) => (
          <div key={index} className='bg-white w-full xl:w-[70%] shadow rounded-lg py-5 px-4 mx-auto'>
            <button
              className={`w-full text-left p-4 rounded-lg  transition-colors`}
              onClick={() => toggleAccordion(index)}
            >
              <h3 className="sm:text-lg text-sm font-medium flex justify-between items-center">
                {question.title}
                {activeIndex === index ? (
                  <MdOutlineKeyboardArrowDown className="rounded-full shadow text-white text-3xl bg-[#234BF3] font-semibold" />
                ) : (
                  <MdKeyboardArrowRight className="rounded-full shadow text-3xl text-[#234BF3] font-semibold" />
                )}
              </h3>
            </button>
            {activeIndex === index && (
              <div className="p-4 text-gray-600 ">{question.content}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accordion;
