import React from "react";

const Card = ({ image, title, date, description }) => {
  return (
      <div className="w-[80%] mx-auto rounded-lg bg-[#1E293B] ">
        <img
          className="rounded-t-lg w-full  h-56 object-cover"
          src={image}
          alt={title}
        />
        <div className="p-5 text-center">
          <h5 className="mb-2 xl:text-2xl font-bold tracking-tight text-white ">
            {title}
          </h5>
          <p className="mb-3 font-normal text-[#9CA3AF] dark:text-gray-400">
            {date}
          </p>
          <p className="mb-3 font-normal  text-white dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
  );
};

export default Card;
