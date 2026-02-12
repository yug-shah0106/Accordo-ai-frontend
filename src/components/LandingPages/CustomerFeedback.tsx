import image from "../../assets/Customer.png";

const feedbacks = [
  {
    name: "Floyd Miles",
    rating: 4,
    feedback:
      "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
    img: image, 
  },
  {
    name: "Ronald Richards",
    rating: 5,
    feedback:
      "ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
    img: image, 
  },
  {
    name: "Savannah Nguyen",
    rating: 4,
    feedback:
      "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
    img: image,
  },
];

const CustomerFeedback = () => {
  return (
    <section className="py-2 bg-[#FFF8EF]">
      <div className="sm:w-[55%] mx-auto pt-8 pb-0 px-4">
        <div className="w-full mx-auto pt-4 px-4 pb-0">
            <h2 className="text-3xl font-semibold text-black mb-4">Our Customer Feedback</h2>
            <p className="text-gray-500 mb-8">Don’t take our word for it. Trust our Customers</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {feedbacks.map((feedback, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded pt-6 px-6 pb-0 flex flex-col items-start max-w-sm"
            >
                <div className="flex justify-between w-full">
                    <img
                        src={feedback.img}
                        alt={feedback.name}
                        className="w-16 h-16  mb-4"
                    /> 
                    <div className="flex items-center mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            fill={i < feedback.rating ? "#F8A401" : "none"}
                            viewBox="0 0 24 24"
                            stroke="#F59E0B"
                            className="w-5 h-5"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.112 6.46a1 1 0 00.95.69h6.768c.969 0 1.371 1.24.588 1.81l-5.477 3.978a1 1 0 00-.364 1.118l2.112 6.46c.3.921-.755 1.688-1.54 1.118L12 17.77l-5.477 3.978c-.784.57-1.839-.197-1.54-1.118l2.112-6.46a1 1 0 00-.364-1.118L1.756 11.887c-.783-.57-.38-1.81.588-1.81h6.768a1 1 0 00.95-.69l2.112-6.46z"
                            />
                        </svg>
                        ))}
                    </div>
                </div>
             
              <h3 className="text-lg font-medium text-black mb-2">{feedback.name}</h3>

              <p className="text-gray-600 text-sm text-start">{feedback.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerFeedback;
