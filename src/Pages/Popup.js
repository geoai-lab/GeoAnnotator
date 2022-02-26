import React from 'react'
import "../CSS-files/Popup.css"


export const Popup = ({ children, trigger }) => {
  return (trigger)? (
    <div className="popup">
        <div className="popup-inner">
            <button className="close-btn">close</button>
            {children}
        </div>
    </div>
  ) : "";
}
