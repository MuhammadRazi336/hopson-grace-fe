import React from 'react';
import LiveChat from './LiveChat';

// Example component showing different ways to use the LiveChat component
const LiveChatExample = () => {
  const handleChatStart = () => {
    console.log('Chat started successfully!');
  };

  const handleChatError = (errorMessage) => {
    console.error('Chat error:', errorMessage);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">LiveChat Component Examples</h2>
      
      {/* Default usage */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Default Usage:</h3>
        <LiveChat />
      </div>

      {/* Custom title */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Custom Title:</h3>
        <LiveChat 
          title="GET INSTANT HELP"
          buttonText="CHAT NOW" 
          loadingText="CONNECTING..."
        />
      </div>

      {/* Custom styling */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Custom Styling:</h3>
        <LiveChat 
          title="NEED SUPPORT?"
          buttonText="GET HELP"
          className="bg-blue-500 text-white hover:bg-blue-600"
        />
      </div>

      {/* Dark background styling */}
      <div className="mb-6 bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-white">Dark Background Styling:</h3>
        <LiveChat 
          title="LIVE SUPPORT"
          buttonText="START CHAT"
          className="bg-white text-gray-800 hover:bg-gray-100"
          titleClassName="text-2xl text-white lg:text-5xl text-center"
          descriptionClassName="text-sm lg:text-xl mt-4 mb-4 text-center text-white"
        />
      </div>

      {/* With callbacks */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">With Callbacks:</h3>
        <LiveChat 
          title="LIVE SUPPORT"
          buttonText="START CHAT"
          onChatStart={handleChatStart}
          onChatError={handleChatError}
        />
      </div>
    </div>
  );
};

export default LiveChatExample;
