
const VideoSection = () => {
  return (
      <div className="mx-auto px-8 xl:w-[95%] md:w-full hidden sm:block">
        <div className="">
          <div className="relative xl:h-[90vh] h-[60vh]">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Video"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe> 
          </div>
        </div>
      </div>
  );
};

export default VideoSection;
