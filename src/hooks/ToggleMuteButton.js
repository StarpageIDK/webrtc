import React from 'react';

const ToggleMuteButton = ({ onClick, isMuted, icon, text, className }) => {
  return (
    <div className={`controls_button ${className} ${isMuted ? 'muted' : ''}`} onClick={onClick}>
      <i className={`${icon} ${isMuted ? 'muted-icon' : ''}`}></i>
      <span>{text}</span> {/* рендер текста кнопки */}
    </div>
  );
};

export default ToggleMuteButton;
