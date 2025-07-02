import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Room from './pages/Room';
import Main from './pages/Main';
import NotFound404 from './pages/NotFound404';
import Auth from './pages/auth';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/room/:id' component={Room} />
        <Route exact path='/' component={Main} />
        <Route exact path='/Auth' component={Auth} />
        <Route component={NotFound404} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
