import React, { useState } from 'react';
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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonChip,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/react';
import {
  sparklesOutline,
  timeOutline,
  trendingUpOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
  filterOutline,
  searchOutline,
} from 'ionicons/icons';

interface UpdateItem {
  id: string;
  type: 'feature' | 'improvement' | 'bugfix' | 'announcement';
  title: string;
  description: string;
  date: string;
  version?: string;
  tags: string[];
  isNew?: boolean;
}

const allUpdates: UpdateItem[] = [
  {
    id: '1',
    type: 'feature',
    title: 'AI Assistant Integration',
    description: 'Introducing our new AI-powered assistant to help you be more productive. Ask questions, get insights, and automate your workflow with natural language commands.',
    date: '2024-01-01',
    version: '1.2.0',
    tags: ['AI', 'Productivity', 'New'],
    isNew: true,
  },
  {
    id: '2',
    type: 'improvement',
    title: 'Enhanced Performance',
    description: 'App loading times improved by 40% with optimized caching and better resource management. Memory usage reduced by 25%.',
    date: '2023-12-28',
    version: '1.1.5',
    tags: ['Performance', 'Optimization'],
  },
  {
    id: '3',
    type: 'bugfix',
    title: 'Fixed Navigation Issues',
    description: 'Resolved several navigation bugs that could cause the app to freeze on certain Android devices running Android 12+.',
    date: '2023-12-25',
    version: '1.1.4',
    tags: ['Bug Fix', 'Navigation', 'Android'],
  },
  {
    id: '4',
    type: 'announcement',
    title: 'Holiday Update',
    description: 'Wishing everyone happy holidays! Our team has been working hard to bring you the best experience possible.',
    date: '2023-12-20',
    tags: ['Announcement', 'Team'],
  },
  {
    id: '5',
    type: 'feature',
    title: 'Dark Mode Support',
    description: 'Added system-wide dark mode support with automatic switching based on device settings and manual override option.',
    date: '2023-12-15',
    version: '1.1.3',
    tags: ['UI', 'Theme', 'Accessibility'],
  },
  {
    id: '6',
    type: 'improvement',
    title: 'Offline Mode',
    description: 'Improved offline functionality with local data caching and sync when connection is restored.',
    date: '2023-12-10',
    version: '1.1.2',
    tags: ['Offline', 'Sync', 'Data'],
  },
  {
    id: '7',
    type: 'bugfix',
    title: 'iOS 17 Compatibility',
    description: 'Fixed compatibility issues with iOS 17, including keyboard appearance and safe area handling.',
    date: '2023-12-05',
    version: '1.1.1',
    tags: ['Bug Fix', 'iOS', 'Compatibility'],
  },
  {
    id: '8',
    type: 'feature',
    title: 'Push Notifications',
    description: 'Added smart push notifications with customizable categories and do-not-disturb scheduling.',
    date: '2023-12-01',
    version: '1.1.0',
    tags: ['Notifications', 'Communication'],
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

const Updates: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [displayedUpdates, setDisplayedUpdates] = useState<UpdateItem[]>(allUpdates.slice(0, 5));
  const [hasMore, setHasMore] = useState<boolean>(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getFilteredUpdates = () => {
    let filtered = allUpdates;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(update => update.type === selectedFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(update =>
        update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const handleRefresh = (event: CustomEvent) => {
    setTimeout(() => {
      setDisplayedUpdates(getFilteredUpdates().slice(0, 5));
      setHasMore(true);
      event.detail.complete();
    }, 1000);
  };

  const loadMoreUpdates = (event: CustomEvent) => {
    setTimeout(() => {
      const filtered = getFilteredUpdates();
      const currentLength = displayedUpdates.length;
      const newUpdates = filtered.slice(currentLength, currentLength + 3);

      setDisplayedUpdates([...displayedUpdates, ...newUpdates]);

      if (currentLength + newUpdates.length >= filtered.length) {
        setHasMore(false);
      }

      event.detail.complete();
    }, 500);
  };

  const filteredUpdates = getFilteredUpdates();

  React.useEffect(() => {
    setDisplayedUpdates(filteredUpdates.slice(0, 5));
    setHasMore(filteredUpdates.length > 5);
  }, [selectedFilter, searchQuery]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-white border-b border-gray-200">
          <IonButtons slot="start">
            <IonMenuButton className="text-gray-600" />
          </IonButtons>
          <IonTitle className="text-gray-900 font-semibold">
            Updates
          </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" className="text-gray-600">
              <IonIcon icon={filterOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-gray-50">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-gray-200">
          <IonSearchbar
            value={searchQuery}
            onIonInput={(e) => setSearchQuery(e.detail.value!)}
            placeholder="Search updates..."
            className="bg-gray-50 rounded-lg"
            searchIcon={searchOutline}
          />
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b border-gray-200">
          <IonSegment
            value={selectedFilter}
            onIonChange={(e) => setSelectedFilter(e.detail.value as string)}
            className="px-4 py-2"
          >
            <IonSegmentButton value="all" className="text-sm">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="feature" className="text-sm">
              <IonLabel>Features</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="improvement" className="text-sm">
              <IonLabel>Improvements</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="bugfix" className="text-sm">
              <IonLabel>Bug Fixes</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="announcement" className="text-sm">
              <IonLabel>News</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Updates List */}
        <div className="px-4 py-6">
          {displayedUpdates.length === 0 ? (
            <div className="text-center py-16">
              <IonIcon icon={searchOutline} className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No updates found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedUpdates.map((update, index) => (
                <IonCard key={update.id} className="shadow-soft border border-gray-200 rounded-xl overflow-hidden">
                  <IonCardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg ${getTypeColor(update.type)} flex items-center justify-center flex-shrink-0`}>
                          <IonIcon icon={getTypeIcon(update.type)} className="text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1 flex-wrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(update.type)} border`}>
                              {getTypeLabel(update.type)}
                            </span>
                            {update.version && (
                              <IonBadge color="medium" className="text-xs">
                                v{update.version}
                              </IonBadge>
                            )}
                            {update.isNew && (
                              <IonBadge color="danger" className="text-xs animate-pulse">
                                New
                              </IonBadge>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <IonIcon icon={timeOutline} className="mr-1 text-xs" />
                            <span className="truncate">
                              {getRelativeTime(update.date)} • {formatDate(update.date)}
                            </span>
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
          )}

          <IonInfiniteScroll
            onIonInfinite={loadMoreUpdates}
            threshold="100px"
            disabled={!hasMore}
          >
            <IonInfiniteScrollContent
              loadingText="Loading more updates..."
              loadingSpinner="bubbles"
            />
          </IonInfiniteScroll>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Updates;
