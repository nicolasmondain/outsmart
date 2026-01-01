import React from 'react';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

const App: React.FC = () => {
  return (
    <IonApp>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Outsmart Mobile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>Hello World!</h1>
          <p>Welcome to Outsmart Mobile App</p>
          <p>🚀 The setup is working correctly!</p>
        </div>
      </IonContent>
    </IonApp>
  );
};

export default App;
