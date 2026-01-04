import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
// import { FaCheck } from 'react-icons/fa';

const SuccessMessage = () => {
  return (
    <div className="h-screen flex flex-col">
     
      <nav className="bg-white p-4">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="text-white">
            <img src={logo} alt="Logo" className="w-10 mx-auto" />
          </div>
        </div>
      </nav>
     
      <div className="flex-grow flex justify-center items-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full sm:w-96">
         
          <div className="text-green-500 text-6xl mb-4">
            {/* <FaCheck /> */}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
          <p className="text-sm text-gray-600 mb-6">You have successfully completed the process.</p>
          <Link
            to="/"
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
