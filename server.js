const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { version, validate } = require('uuid');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const {generateToken} = require('./authTokGen');
const secretKey = require(./secret)

const io = require('socket.io')(server, {
  connectionStateRecovery: {}
});

const SKey = secretKey
const ACTIONS = require('./src/socket/actions');
const PORT = process.env.PORT || 3000;

app.use(cors());

// PostgreSQL connection pool
const pool = new Pool({
  user: 'test',
  host: 'test',
  database: 'test',
  password: 'test',
  port: 5432,
});

function getClientRooms() {
  const { rooms } = io.sockets.adapter;

  return Array.from(rooms.keys()).filter(roomID => validate(roomID) && version(roomID) === 4);
}

app.use(bodyParser.json());


// маршрут по обработке запрос на авторизацию
app.post('/login', async (req, res) => {
  console.log('Received login request')
  const { username, password } = req.body;
  try {

    // Поиск внутри дб по имени + пароль
    const query = 'SELECT  * FROM test1 WHERE username = $1 AND password = $2';
    const { rows } = await pool.query(query, [username, password]);
    //const hashedPassword = await hashPassword(password);
    const result = await pool.query('SELECT hashed FROM test1 WHERE username = $1', [username]);
    const retrievedHashedPassword = result.rows[0].hashed;
    const passwordsMatchT = await comparePassword(password, retrievedHashedPassword);
    console.log('Passwords match:', passwordsMatchT);
    if (rows.length > 0 && passwordsMatchT == true) {
      const user = rows[0]; // Предпологаем что только 1 пользователь подходит под наши данные
      // Fetch the name separately
      // const nameQuery = 'SELECT "Name" FROM test1 WHERE username = $1';
      // const { rows: nameRows } = await pool.query(nameQuery, [username]);
      //const name = nameRows[0].name;
      //res.status(200).json({ message: 'Authentication successful' });
      //console.log('User Object:', user);
      const token = generateToken({
        id: user.id,
        Name: user.Name,
        secondname: user.secondname,
        group: user.group});
      console.log(token);
      //console.log(verifyToken(token));
      return res.json({ 
        message: 'Authentication successful',
        token });
    } else {
      res.status(401).json({ message: 'Authentication failed' });
      //return null;
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// функция потверждения и декодированя токена
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SKey);
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

async function comparePassword(password, hashedPassword) {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
}
// Фильтр для защиты маршрута
function protectRoute(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  // Add user_id to request object for subsequent middleware or route handlers
  req.user_id = decodedToken.user_id;
  next();
}
// Example usage of protected route (assuming Express.js route)
app.get('/protected-resource', protectRoute, (req, res) => {
  res.json({ message: 'Protected resource accessed successfully' });
});


function shareRoomsInfo() {
  io.emit(ACTIONS.SHARE_ROOMS, {
    rooms: getClientRooms()
  })
}

io.on('connection', socket => {
  shareRoomsInfo();

  socket.on(ACTIONS.JOIN, config => {
    const { room: roomID } = config;
    const { rooms: joinedRooms } = socket;

    if (Array.from(joinedRooms).includes(roomID)) {
      return console.warn(`Already joined to ${roomID}`);
    }

    const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

    clients.forEach(clientID => {
      io.to(clientID).emit(ACTIONS.ADD_PEER, {
        peerID: socket.id,
        createOffer: false
      });

      socket.emit(ACTIONS.ADD_PEER, {
        peerID: clientID,
        createOffer: true,
      });
    });

    socket.join(roomID);
    shareRoomsInfo();
  });

  function leaveRoom() {
    const { rooms } = socket;

    Array.from(rooms)
      // Покидает только созданную клиентом комнату
      .filter(roomID => validate(roomID) && version(roomID) === 4)
      .forEach(roomID => {

        const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

        clients
          .forEach(clientID => {
            io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
              peerID: socket.id,
            });

            socket.emit(ACTIONS.REMOVE_PEER, {
              peerID: clientID,
            });
          });

        socket.leave(roomID);
      });

    shareRoomsInfo();
  }

  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on('disconnecting', leaveRoom);

  socket.on(ACTIONS.RELAY_SDP, ({ peerID, sessionDescription }) => {
    io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerID: socket.id,
      sessionDescription,
    });
  });

  socket.on(ACTIONS.RELAY_ICE, ({ peerID, iceCandidate }) => {
    io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
      peerID: socket.id,
      iceCandidate,
    });
  });

});

const publicPath = path.join(__dirname, 'build');

app.use(express.static(publicPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`)
})