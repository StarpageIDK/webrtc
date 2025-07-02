import { useState, useEffect, useRef } from 'react';
import socket from '../../socket';
import ACTIONS from '../../socket/actions';
import { useHistory } from 'react-router';
import { v4 } from 'uuid';
import './index.css'
// import UserTooltip from './UserTooltip'
// import { useUser } from '../auth/UserContext';
//import './UserTooltip.css';
import { jwtDecode } from 'jwt-decode';

// const handleTokenButtonClick = () => {
//   // const token = localStorage.getItem('token');
//   // if (token) {
//   //   const decodedToken = jwtDecode(token);
//   //   console.log('Decoded Token:', decodedToken);
//   // } else {
//   //   console.log('No token found');
//   // }
//   history.push('/Auth');
// };


export default function Main() {
  const history = useHistory();
  const [rooms, updateRooms] = useState([]);
  const rootNode = useRef();
  var roomNumber = 1;
  const [userData, setUserData] = useState({});
  var i = 0;
  // const token = localStorage.getItem('token');
  // const decodedToken = jwtDecode(token);

  useEffect(() => {
    socket.on(ACTIONS.SHARE_ROOMS, ({ rooms = [] } = {}) => {
      if (rootNode.current) {
        updateRooms(rooms);
      }
    });
  }, []);

  // useEffect(() => {
  //   const storedUserData = localStorage.getItem('userData');
  //   if (storedUserData) {
  //     setUserData(JSON.parse(decodedToken));
  //   }
  // }, []);

  const handleTokenButtonClick = () => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   const decodedToken = jwtDecode(token);
    //   console.log('Decoded Token:', decodedToken);
    // } else {
    //   console.log('No token found');
    // }
    history.push('/Auth');
  };

  return (
    <div ref={rootNode}>
      <h1>Доступные комнаты</h1>
      {/* <div className='user-info-container'>
        <button className={"auth_Btn"} onClick={handleTokenButtonClick}>Авторизироваться</button>
        <div>
          <h2>Информация о пользователе:</h2>
          <p>Имя: {decodedToken.Name}</p>
          <p>Фамилия: {decodedToken.secondname}</p>
          <p>Группа: {decodedToken.group}</p>
        </div>
      </div> */}
      <div className='room_list'>
        <ul>
          {rooms.map(roomID => (
            <li key={roomID}>
              Комнта №{roomNumber + i++}
              <button onClick={() => {
                history.push(`/room/${roomID}`);
              }}>Присоединиться</button>
            </li>
          ))}
        </ul>
      </div>
      <div className='create_room_btn'>
        <button onClick={() => {
          history.push(`/room/${v4()}`);
        }}>Создать новую комнату</button>
      </div>
    </div>
  );
}