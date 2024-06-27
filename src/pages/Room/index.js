import { useParams } from 'react-router';
import useWebRTC, { LOCAL_VIDEO } from '../../hooks/useWebRTC';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import ToggleMuteButton from '../../hooks/ToggleMuteButton'
import './index.css'

function layout(clientsNumber = 1) {
   const pairs = Array.from({ length: clientsNumber })
      .reduce((acc, next, index, arr) => {
         if (index % 2 === 0) {
            acc.push(arr.slice(index, index + 2));
         }

         return acc;
      }, []);

   const rowsNumber = pairs.length;
   const height = `${100 / rowsNumber}%`;

   return pairs.map((row, index, arr) => {

      if (index === arr.length - 1 && row.length === 1) {
         return [{
            width: '100%',
            height,
         }];
      }

      return row.map(() => ({
         width: '50%',
         height,
      }));
   }).flat();
}

export default function Room() {
   const { id: roomID } = useParams();
   const { clients, provideMediaRef, localMediaStream } = useWebRTC(roomID);
   const videoLayout = layout(clients.length);
   const history = useHistory();
   const stream = localMediaStream.current;
   const [isMuted, setIsMuted] = useState(false);
   const [isVideoMuted, setIsVideoMuted] = useState(false);

   const toggleMute = () => {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(prevState => !prevState);
   };

   const toggleVideoMute = () => {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoMuted(prevState => !prevState);
   };



   return (
      <div className="main">
         <div className="main_left">
            <div className="main_videos">
               <div id="video-grid">
                  {clients.map((clientID, index) => {
                     return (
                        <div key={clientID} id={clientID}>
                           <video
                              width='100%'
                              height='100%'
                              ref={instance => {
                                 provideMediaRef(clientID, instance);
                              }}
                              autoPlay
                              playsInline
                              muted={clientID === LOCAL_VIDEO}
                              style={{ display: isVideoMuted && clientID === LOCAL_VIDEO ? 'none' : 'block' }}
                           />
                           {clientID === LOCAL_VIDEO && isVideoMuted && (
                              <img
                                 src="https://static-cdn.jtvnw.net/ttv-static/404_preview-320x180.jpg.png"
                                 width='100%'
                                 height='100%'
                                 alt="Avatar"
                                 className="avatar"
                              />
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>
            <div className="main_controls">
               <div className="main_controls_block">
                  <ToggleMuteButton
                     onClick={toggleMute}
                     isMuted={isMuted}
                     icon="fas fa-microphone"
                     text={isMuted ? 'Включить звук' : 'Заглушиться'}
                     className="main_mute_button audio-mute-button" // Add both class names
                  />
                  <ToggleMuteButton
                     onClick={toggleVideoMute}
                     isMuted={isVideoMuted}
                     icon="fas fa-video"
                     text={isVideoMuted ? 'Включить видео' : 'Остановить видео'}
                     className="main_video_button video-mute-button" // Add both class names
                  />
               </div>
               <div className="main_controls_block">
                  <div className="controls_button">
                     <i className="fas fa-shield-alt"></i>
                     <span>Администрирование</span>
                  </div>
                  <div className="controls_button">
                     <i className="fas fa-user-friends"></i>
                     <span>Участники</span>
                  </div>
                  <div className="controls_button" onClick={function () {
                     const chatbox = document.querySelector('.main_right');

                     chatbox.classList.toggle('shown');

                  }}>
                     <i className="fas fa-comment-alt"></i>
                     <span>Чат</span>
                  </div>
               </div>
               <div className="main_controls_block">
                  <div className="controls_button">
                     <span className="leave_meeting" onClick={function () {
                        history.goBack();
                     }}>Покинуть комнату</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="main_right">
            <div className="main_header">
               <h6>Чат</h6>
            </div>
            <div className="main_chat_window">
               <ul className="messages">

               </ul>

            </div>
            <div className="main_message_container">
               <input id="chat_message" type="text" placeholder="Напишите сообщение..." />
            </div>
         </div>
      </div>
   );
}