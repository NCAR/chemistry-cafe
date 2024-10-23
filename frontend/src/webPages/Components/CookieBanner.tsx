import React, { useEffect, useState } from 'react';
import '../RoutingRenders/App.css'; // Assuming you're adding the CSS here

const CookieBanner: React.FC = () => {
  // State to manage whether the banner is visible
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);

  // UseEffect to check if the banner has already been accepted
  useEffect(() => {
    const bannerAccepted = localStorage.getItem('bannerAccepted');
    if (bannerAccepted) {
      setIsBannerVisible(false);
    }
  }, []);

  // Function to handle the acceptance of the banner
  const handleAccept = () => {
    setIsBannerVisible(false);
    localStorage.setItem('bannerAccepted', 'true');
  };

  // Render the banner conditionally
  return (
    <>
      {isBannerVisible && (
        <div className="banner">
            <p>
                UCAR uses cookies to make our website function; however, UCAR cookies do not collect personal information about you. When using our website, you may encounter embedded content, such as YouTube videos and other social media links, that use their own cookies. 
            </p>
            <p>
                To learn more about third-party cookies on this website, and to set your cookie preferences, click here.
            </p>
            <p>  
                <a href="https://www.ucar.edu/cookie-other-tracking-technologies-notice">Learn more</a>
            </p>
            <button onClick={handleAccept} className="acceptBtn">
                Accept
            </button>
        </div>
      )}
    </>
  );
};

export default CookieBanner;
