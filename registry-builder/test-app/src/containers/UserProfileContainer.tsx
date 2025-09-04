import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Lazy loaded components - common pattern in real apps
const UserProfileHeader = lazy(() => import('../components/user/UserProfileHeader'));
const UserProfileDetails = lazy(() => import('../components/user/UserProfileDetails'));
const UserActivityFeed = lazy(() => import('../components/user/UserActivityFeed'));
const UserSettings = lazy(() => import('../components/user/UserSettings'));

interface UserProfileContainerProps {
  userId: string;
  activeTab: 'profile' | 'activity' | 'settings';
}

export const UserProfileContainer: React.FC<UserProfileContainerProps> = ({ 
  userId, 
  activeTab 
}) => {
  return (
    <div className="user-profile-container" data-testid={`user-profile-${userId}`}>
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfileHeader userId={userId} />
      </Suspense>
      
      <div className="profile-content">
        {activeTab === 'profile' && (
          <Suspense fallback={<LoadingSpinner />}>
            <UserProfileDetails userId={userId} />
          </Suspense>
        )}
        
        {activeTab === 'activity' && (
          <Suspense fallback={<LoadingSpinner />}>
            <UserActivityFeed userId={userId} />
          </Suspense>
        )}
        
        {activeTab === 'settings' && (
          <Suspense fallback={<LoadingSpinner />}>
            <UserSettings userId={userId} />
          </Suspense>
        )}
      </div>
    </div>
  );
};