const Card = ({ title, description, imgUrl, onClick, artist }) => {
  return (
    <div
      className="bg-black bg-opacity-40 p-4 rounded-lg cursor-pointer transform w-60 transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
      onClick={onClick} // Thêm sự kiện onClick để gọi hàm phát nhạc
    >
      <div className="pb-4 pt-2 relative">
        <img
          className="w-full h-60 object-cover rounded-md"
          src={imgUrl}
          alt={title}
        />
      </div>
      <div className="text-white font-semibold py-3 text-xl hover:underline">
        {title}
      </div>
      <div className="text-gray-500 font-semibold py-3 text-sm hover:underline">
        {artist}
      </div>
      <div className="text-gray-300 text-sm hover:underline">{description}</div>
    </div>
  );
};

export default Card;
