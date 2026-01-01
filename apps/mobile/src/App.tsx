import React from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';

import Menu from './components/Menu';
import Home from './pages/Home';
import Updates from './pages/Updates';
import Settings from './pages/Settings';
import About from './pages/About';

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main" when="md">
          <Menu />
          <IonRouterOutlet id="main">
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/updates">
              <Updates />
            </Route>
            <Route exact path="/settings">
              <Settings />
            </Route>
            <Route exact path="/about">
              <About />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
