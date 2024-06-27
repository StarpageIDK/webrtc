import React, {createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
//import "../../pages/auth/index.css";
//import { jwtDecode } from 'jwt-decode';
import styles from './Login.module.css';


const url = 'http://localhost:3000/login'

const Auth = () => {
 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();
  // Ивент на изменение инпутов
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  // ивент на нажатие кнопки
  const handleSubmit = async (event) => {
    event.preventDefault();
    // простая проверка на заполненость полей
    if (!username || !password) {
      setError('Please enter both username and password.');
    } else {
      setError('');
    try {
      const response = await axios.post(url, { username, password });
      console.log(response.data)
      //console.log('Authentication successful:', response.data);
      
      // Провека на то что токен нам пришел
      const { token } = response.data;
      console.log(token);
      if (token) {
        // складируем токен localStorage или sessionStorage <- не очищается при перезаходе в браузер
        //localStorage.setItem('token', token);
        console.log('dsadaAuthentication successful:', response.data);
        //const decodedToken = jwtDecode(token);
        console.log('Authentication successful:', response.data);
        history.goBack(); 
        
      }
     else {
      console.error('No token received');
    }
      } catch (error) {
        if (error.response) {
          // запрос отправлен, получен ответ с кодом состояния
          console.error('Server responded with status:', error.response.status);
          console.error('Response data:', error.response.data);
        } else if (error.request) {
          // запрос сделан, ответ не получен
          console.error('No response received:', error.request);
        } else {
          // Что то пошло не так и запрос не был отправлен
          console.error('Request failed:', error.message);
        }
      }
    }
  };
  // const handleTokenButtonClick = () => {
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     const decodedToken = jwtDecode(token);
  //     console.log('Decoded Token:', decodedToken);
  //   } else {
  //     console.log('No token found');
  //   }
  // }; я не знаю зачем но я оставил это
  

  return (
    <div className={styles.loginContainer}>
      <h2>Авторизация</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="username">Логин:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleInputChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleInputChange}
          />
        </div>
        <button className={styles.loginButton} type="submit">Войти</button>
      </form>
      {/* <button onClick={handleTokenButtonClick}>Show Token</button> */}
    </div>
  );
};

export default Auth;