import React from 'react';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import {
  homeOutline,
  homeSharp,
  newspaperOutline,
  newspaperSharp,
  settingsOutline,
  settingsSharp,
  informationCircleOutline,
  informationCircleSharp,
  sparklesOutline,
  sparklesSharp,
} from 'ionicons/icons';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
  badge?: number;
}

const appPages: AppPage[] = [
  {
    title: 'Home',
    url: '/home',
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: 'Updates',
    url: '/updates',
    iosIcon: newspaperOutline,
    mdIcon: newspaperSharp,
    badge: 3,
  },
  {
    title: 'AI Assistant',
    url: '/assistant',
    iosIcon: sparklesOutline,
    mdIcon: sparklesSharp,
  },
  {
    title: 'Settings',
    url: '/settings',
    iosIcon: settingsOutline,
    mdIcon: settingsSharp,
  },
  {
    title: 'About',
    url: '/about',
    iosIcon: informationCircleOutline,
    mdIcon: informationCircleSharp,
  },
];

const Menu: React.FC = () => {
  const location = useLocation();

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">OS</span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Outsmart</h2>
              <p className="text-blue-100 text-sm">Your AI companion</p>
            </div>
          </div>
        </div>

        <IonList className="py-2">
          <IonListHeader className="px-4 py-3">
            <IonLabel className="text-gray-500 font-medium text-sm uppercase tracking-wider">
              Navigation
            </IonLabel>
          </IonListHeader>

          {appPages.map((appPage, index) => {
            const isSelected = location.pathname === appPage.url;

            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={`mx-2 my-1 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
                  <IonIcon
                    slot="start"
                    ios={appPage.iosIcon}
                    md={appPage.mdIcon}
                    className={`mr-3 ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  />
                  <IonLabel
                    className={`font-medium ${
                      isSelected ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {appPage.title}
                  </IonLabel>
                  {appPage.badge && (
                    <IonNote
                      slot="end"
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center"
                    >
                      {appPage.badge}
                    </IonNote>
                  )}
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-gray-400 text-xs">
              Version 1.0.0
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Built with ❤️ by Outsmart Team
            </p>
          </div>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
