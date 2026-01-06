
const ReviewModal = ({ show, rating, setRating, review, setReview, onClose, onSubmit }) => {
    if (!show) return null;
    const handleBackdropClick = (e) => {
        if (e.target.id === "modal-backdrop") {
            onClose(); 
        }
    };

    return (
        <div id="modal-backdrop" onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white  rounded-lg w-96 shadow-lg">
                <div className="p-6">

                    <h2 className=" font-semibold text-[28px] text-center font-Montserrat">Write a Review</h2>

                    <div className="flex justify-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`cursor-pointer text-2xl transition-colors ${rating >= star ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>

                    <p className="text-center text-gray-500 text-sm mt-1">Tap to star to Rate</p>

                </div>
                <hr className="mt-3" />
                <div className="px-2 pb-0">

                    <textarea
                        className="w-full  rounded-lg pt-2 px-2 pb-0  text-gray-700"
                        placeholder="Leave a review (optional)"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    ></textarea>

                    <div className="flex justify-center gap-5 mt-4">
                        <button className="px-4 pt-2 pb-0 border border-[#18100E] rounded-md text-[#18100E] hover:bg-gray-200" onClick={onClose}>
                            Dismiss
                        </button>
                        <button className="px-4 pt-2 pb-0 bg-[#234BF3] text-white rounded-md hover:bg-blue-700" onClick={onSubmit}>
                            Submit
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReviewModal;
