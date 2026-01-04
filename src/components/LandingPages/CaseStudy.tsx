import Card from '../Card';
import { IoArrowForwardCircleOutline } from 'react-icons/io5';

import case1 from "../../assets/case1.png";
import case3 from "../../assets/case3.png";
import case2 from "../../assets/case2.png";

const CaseStudy = () => {
  const cardData = [
    {
      image: case3,
      title: 'Lorem ipsum dolor',
      date: 'April 03, 2024 - 4 min read',
      description: 'Nunc non posuere consectetur, justo erat semper enim, non hendrerit dui odio id enim.'
    },
    {
      image:case2,
      title: 'Lorem ipsum dolor',
      date: 'April 03, 2024 - 4 min read',
      description: 'Nunc non posuere consectetur, justo erat semper enim, non hendrerit dui odio id enim.'
    },
    {
      image: case1,
      title: 'Lorem ipsum dolor',
      date: 'April 03, 2024 - 4 min read',
      description: 'Nunc non posuere consectetur, justo erat semper enim, non hendrerit dui odio id enim.'
    }
  ];

  return (
    <div className='w-full sm:w-[80%] lg:w-[70%] mx-auto'>
      <div className="flex justify-between w-[80%] xl:w-full mx-auto items-center">
        <h1 className="text-lg lg:text-3xl font-bold">Case Study</h1>
        <p className="cursor-pointer font-semibold text-md xl:text-xl flex items-center gap-2">View all <IoArrowForwardCircleOutline className='text-3xl' /></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2  my-8">
        {cardData.map((card, index) => (
          <Card
            key={index}
            image={card.image}
            title={card.title}
            date={card.date}
            description={card.description}
          />
        ))}
      </div>
    </div>
  );
}

export default CaseStudy;
