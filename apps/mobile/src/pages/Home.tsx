import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/react';
import { home, settings } from 'ionicons/icons';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Outsmart Mobile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div style={{ padding: '16px' }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Welcome to Outsmart</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              This is the mobile application for Outsmart platform.
            </IonCardContent>
          </IonCard>

          <IonButton expand="block" fill="solid" style={{ marginTop: '16px' }}>
            <IonIcon icon={home} slot="start" />
            Get Started
          </IonButton>

          <IonButton expand="block" fill="outline" style={{ marginTop: '8px' }}>
            <IonIcon icon={settings} slot="start" />
            Settings
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
