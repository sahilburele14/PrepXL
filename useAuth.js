// WebSite/src/hooks/useAuth.js
// Enhanced authentication hook with better error handling

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { setUser, clearUser, fetchUserProfile, createUserProfile } from '../../store/authSlice';
import logger from '../utils/logger';

let authListenerInitialized = false;

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, profile, loading, profileLoading } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // prevent multiple listeners
    if (authListenerInitialized) {
      return;
    }

    authListenerInitialized = true;
    logger.log('Initializing auth listener...');

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            logger.log('User authenticated:', firebaseUser.email);

            // set user in redux
            dispatch(setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'User',
              photoURL: firebaseUser.photoURL || null,
            }));

            // fetch or create profile
            try {
              await dispatch(fetchUserProfile()).unwrap();
              logger.log('Profile loaded successfully');
            } catch (profileError) {
              // profile doesn't exist - create it
              if (profileError.includes('404') || profileError.includes('not found')) {
                logger.log('Profile not found, creating new profile...');
                
                try {
                  await dispatch(createUserProfile({
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || 'User',
                    photoUrl: firebaseUser.photoURL || null,
                  })).unwrap();
                  
                  logger.log('Profile created successfully');
                } catch (createError) {
                  logger.error('Failed to create profile:', createError);
                  setError('Failed to create user profile. Please try again.');
                }
              } else {
                logger.error('Failed to fetch profile:', profileError);
                setError('Failed to load user profile.');
              }
            }
          } else {
            logger.log('No user authenticated');
            dispatch(clearUser());
          }
        } catch (err) {
          logger.error('Auth state change error:', err);
          setError('Authentication error occurred.');
        } finally {
          setAuthChecked(true);
        }
      },
      (error) => {
        logger.error('Auth listener error:', error);
        setError('Authentication service error.');
        setAuthChecked(true);
      }
    );

    return () => {
      if (authListenerInitialized) {
        unsubscribe();
        authListenerInitialized = false;
      }
    };
  }, [dispatch]);

  return {
    user,
    profile,
    loading: loading || !authChecked,
    profileLoading,
    isAuthenticated: !!user,
    error,
    clearError: () => setError(null),
  };
};

// helper to get current user's token
export const getCurrentUserToken = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user');
  }
  
  try {
    return await currentUser.getIdToken(false); // false = use cached token
  } catch (err) {
    logger.error('Failed to get user token:', err);
    // try to force refresh
    try {
      return await currentUser.getIdToken(true);
    } catch (refreshErr) {
      logger.error('Failed to refresh token:', refreshErr);
      throw new Error('Authentication token expired. Please log in again.');
    }
  }
};

// helper for logout
export const useLogout = () => {
  const dispatch = useDispatch();
  
  return async () => {
    try {
      await auth.signOut();
      dispatch(clearUser());
      logger.log('User logged out successfully');
      return true;
    } catch (err) {
      logger.error('Logout failed:', err);
      return false;
    }
  };
};