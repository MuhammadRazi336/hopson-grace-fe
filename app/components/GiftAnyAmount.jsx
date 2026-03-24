import Button from '~/components/Button.jsx';
import {useLoaderData} from '@remix-run/react';
import {useState, useEffect} from 'react';

function GiftAnyAmount() {
  // Get API base URL from loader data
  const { env } = useLoaderData() || {};
  const apiBaseUrl = 'https://api.theregistry.ca';
  
  // State management
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [registryData, setRegistryData] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  const maxLength = 500;

  // Fetch user and registry data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('@Token') || localStorage.getItem('@token');
      setUser(token);
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = parts[1];
            const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
            const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
            const tokenData = JSON.parse(decodedPayload);
            const tokenId = Number(tokenData.id);
            
            if (tokenId) {
              // Fetch user data
              fetch(`${apiBaseUrl}/api/users/${tokenId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })
              .then(res => res.json())
              .then(data => {
                if (data.code === 200 && data.data && data.data.user) {
                  setUserData(data.data.user);
                }
              })
              .catch(error => {
                console.error('Error fetching user data:', error);
              });

              // Fetch registry data
              fetch(`${apiBaseUrl}/api/registries/by-userId/${tokenId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })
              .then(res => res.json())
              .then(registryData => {
                if (registryData.code === 200 && registryData.data && registryData.data.length > 0) {
                  const registry = registryData.data[0];
                  setRegistryData(registry);
                  
                  // Set welcome message from event data
                  if (registry.events && registry.events.length > 0) {
                    setWelcomeMessage(registry.events[0].welcomeMessage || '');
                  }
                }
                setIsLoading(false);
              })
              .catch(error => {
                console.error('Error fetching registry data:', error);
                setIsLoading(false);
              });
            }
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          setIsLoading(false);
        }
      }
    }
  }, []);

  // Save welcome message
  const handleSavePreview = async () => {
    if (!user || !registryData?.events?.[0]?.id) {
      setAlertMessage('Please log in to save your message');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: registryData.events[0].id,
        welcomeMessage: welcomeMessage,
      };
      
      const response = await fetch(
        `${apiBaseUrl}/api/events/${payload.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user}`,
          },
          body: JSON.stringify(payload),
        }
      );
      
      if (response.ok) {
        setAlertMessage('Message updated successfully!');
        setAlertType('success');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        setAlertMessage('Failed to update message', response);
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (err) {
      console.error('Error updating message:', err);
      setAlertMessage('Error updating message');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mb-[12.865vw]">
      <div className="bg-[#446184] gap-[6.198vw] w-[81.354vw] py-[2.969vw] !pr-[5.885vw] !pl-[1.563vw] container mx-auto flex flex-col md:flex-row items-center justify-center">
        {/* Left: Image */}
        <div className="flex-shrink-0 flex items-center justify-center w-full md:w-5/12">
          <img
            src="/assets/Images/gift-any-amount.png"
            alt="Gift Any Amount Card"
            className=" w-full h-auto object-contain drop-shadow-lg"
          />
        </div>
        {/* Right: Content */}
        <div className="flex flex-col items-center justify-center w-full md:w-7/12">
          <h2 className="text-white text-3xl lg:text-[2.292vw] lg:leading-[1.875vw] prata font-normal mb-2 lg:mb-[1.1vw] text-center">
            gift any amount
          </h2>
          <img
            src="/assets/Images/gift-bdr.png"
            alt="Couple"
            className="max-w-[630px] mt-1 h-auto mx-auto"
          />
          <p className="text-white text-base lg:text-[1.25vw] lg:leading-[2.292vw] font-[500] my-[1.771vw] text-center tracking-wide">
            CONTRIBUTE TO OUR JOURNEY!
          </p>
          <textarea
            placeholder="Write a short caption to friends and family who are wanting to leave you a cash gift. (Optional)*"
            maxLength={maxLength}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            disabled={isLoading}
            className="w-full xl:h-40 md:h-32 h-[70px] lg:text-[1.25vw] lg:leading-[1.563vw] lg:h-[9.35vw] border border-gray-300 text-sm outline-none !p-[1.615vw] sm:p-3 bg-[#FAF9F6] resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
          />
          <div className="w-full flex justify-between items-center mt-2">
            <span className="text-sm italic text-white">
              {maxLength - welcomeMessage.length}/{maxLength} characters remaining
            </span>
            <button 
              onClick={handleSavePreview}
              disabled={isSaving || isLoading}
              className="text-white border-b pb-[0.469vw] cursor-pointer font-medium text-lg uppercase lg:text-[0.938vw] lg:leading-[0.938vw] mx-auto mt-[1.563vw] ml-auto mr-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save and Preview'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Alert Component */}
      {showAlert && (
        <div
          className={`fixed top-4 right-4 ${
            alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}
        >
          <div className="flex items-center">
            {alertType === 'success' && (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {alertType === 'error' && (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            <span>{alertMessage}</span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out;
        }
      `}</style>
    </section>
  );
}

export default GiftAnyAmount;
