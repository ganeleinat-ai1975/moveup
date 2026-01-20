import React, { useEffect } from 'react';

const AliceAndBotWidget = () => {
  useEffect(() => {
    // Check if script already exists
    if (document.getElementById('alice-and-bot-script')) return;

    // Define widget params
    const widgetParams = {
      participants: ["MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlTSHc37GdIH4WhF0rIsUonZXEe61zkRbPEZTQ3R7lUs0SXS+C2Qkq7iI06YQv7Odc3r3vwplkQsS1cqybA5OwrX9uqLJEr7xQkAdW1uhmxTF7RZ+J+0OFrsgxi6tVd4ZK04X5ql4veMXKBUxXvQbK+KaUWw0WoZ27Hoy5IelKNESKa+mbZtkE1WuZF/fJmtuIkTFX5NWBB9gSO5WWULFaMWrIxrkZHyz9WUYZ0xopD9JazKG0Ij7wjcuCj/y2wVvdg9fHturtv1HabsD/NAgpwp6z/AWkb3o8HPLskIfW8Xq1AWV03BI3X5Gau5TqAf/MQHCzcaVP1SCWunqoCA+wQIDAQAB"],
      colorScheme: {
        light: {
          buttonColor: "#005E6C"
        }
      },
      startOpen: false
    };

    // Create the script element
    const script = document.createElement('script');
    script.id = 'alice-and-bot-script';
    script.src = "https://storage.googleapis.com/alice-and-bot/widget/dist/widget.iife.js";
    script.async = true;
    
    // Define the onload handler
    script.onload = () => {
      if (window.aliceAndBot && window.aliceAndBot.loadChatWidget) {
        window.aliceAndBot.loadChatWidget(widgetParams);
        
        // Try to apply custom styles after load if possible
        // Note: Many widgets use Shadow DOM which makes external CSS hard to apply
        // We will try to apply global CSS for the button position relative to cookies
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup if needed, though usually chat widgets persist
    };
  }, []);

  return null; // This component renders nothing visual itself
};

export default AliceAndBotWidget;