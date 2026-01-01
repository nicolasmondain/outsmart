import React from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonBadge,
  IonChip,
  IonAvatar,
} from '@ionic/react';
import {
  sparklesOutline,
  timeOutline,
  trendingUpOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
  addOutline,
} from 'ionicons/icons';

interface UpdateItem {
  id: string;
  type: 'feature' | 'improvement' | 'bugfix' | 'announcement';
  title: string;
  description: string;
  date: string;
  version?: string;
  tags: string[];
}

const updates: UpdateItem[] = [
  {
    id: '1',
    type: 'feature',
    title: 'AI Assistant Integration',
    description: 'Introducing our new AI-powered assistant to help you be more productive. Ask questions, get insights, and automate your workflow.',
    date: '2024-01-01',
    version: '1.2.0',
    tags: ['AI', 'Productivity', 'New'],
  },
  {
    id: '2',
    type: 'improvement',
    title: 'Enhanced Performance',
    description: 'App loading times improved by 40% with optimized caching and better resource management.',
    date: '2023-12-28',
    version: '1.1.5',
    tags: ['Performance', 'Optimization'],
  },
  {
    id: '3',
    type: 'bugfix',
    title: 'Fixed Navigation Issues',
    description: 'Resolved several navigation bugs that could cause the app to freeze on certain devices.',
    date: '2023-12-25',
    version: '1.1.4',
    tags: ['Bug Fix', 'Navigation'],
  },
  {
    id: '4',
    type: 'announcement',
    title: 'Holiday Update',
    description: 'Wishing everyone happy holidays! Our team has been working hard to bring you the best experience.',
    date: '2023-12-20',
    tags: ['Announcement', 'Team'],
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return sparklesOutline;
    case 'improvement':
      return trendingUpOutline;
    case 'bugfix':
      return checkmarkCircleOutline;
    case 'announcement':
      return informationCircleOutline;
    default:
      return informationCircleOutline;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'improvement':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'bugfix':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'announcement':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'feature':
      return 'New Feature';
    case 'improvement':
      return 'Improvement';
    case 'bugfix':
      return 'Bug Fix';
    case 'announcement':
      return 'Announcement';
    default:
      return 'Update';
  }
};

const Home: React.FC = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-white border-b border-gray-200">
          <IonButtons slot="start">
            <IonMenuButton className="text-gray-600" />
          </IonButtons>
          <IonTitle className="text-gray-900 font-semibold">
            What's New
          </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" className="text-blue-600">
              <IonIcon icon={addOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-6 py-12 text-white">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-6">
              <IonIcon icon={sparklesOutline} className="text-3xl" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              Stay Updated
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Discover the latest features, improvements, and announcements from the Outsmart team.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 -mt-8 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Updates</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">8</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Features</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">4</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Bug Fixes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Updates Timeline */}
        <div className="px-4 pb-20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Updates</h2>
            <p className="text-gray-600">Building in public, one update at a time</p>
          </div>

          <div className="space-y-6">
            {updates.map((update, index) => (
              <IonCard key={update.id} className="shadow-soft border border-gray-200 rounded-xl overflow-hidden">
                <IonCardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${getTypeColor(update.type)} flex items-center justify-center`}>
                        <IonIcon icon={getTypeIcon(update.type)} className="text-lg" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(update.type)} border`}>
                            {getTypeLabel(update.type)}
                          </span>
                          {update.version && (
                            <IonBadge color="medium" className="text-xs">
                              v{update.version}
                            </IonBadge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <IonIcon icon={timeOutline} className="mr-1 text-xs" />
                          {formatDate(update.date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <IonCardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                    {update.title}
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent className="pt-0">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {update.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {update.tags.map((tag, tagIndex) => (
                      <IonChip
                        key={tagIndex}
                        className="bg-gray-100 text-gray-700 text-xs"
                        outline={false}
                      >
                        {tag}
                      </IonChip>
                    ))}
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-8">
            <IonButton
              fill="outline"
              className="rounded-lg font-medium"
              color="primary"
            >
              Load More Updates
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
