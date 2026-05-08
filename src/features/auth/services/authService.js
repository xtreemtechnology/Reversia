// src/features/auth/services/authService.js
/**
 * Auth Service - Handles all Firebase authentication operations
 */

import { auth, db } from '../../../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Sign in user with email and password
 */
export const signIn = async (email, password) => {
  if (!email || !password) throw new Error('Email and password are required');
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign up new user with email and password
 */
export const signUp = async (email, password, displayName = '') => {
  if (!email || !password) throw new Error('Email and password are required');
  
  try {
    // Check if email already exists
    const methods = await fetchSignInMethodsForEmail(auth, email.trim());
    if (methods && methods.length > 0) {
      throw new Error('EMAIL_EXISTS');
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    
    if (userCredential.user) {
      // Update display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Create user document in Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        email: email.trim(),
        displayName: displayName || '',
        createdAt: new Date().toISOString(),
        emailVerified: false,
        onboardingStep: 0,
      }, { merge: true });
    }
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
  if (!email) throw new Error('Email is required');
  
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    throw error;
  }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Check if user email is verified
 */
export const isEmailVerified = () => {
  return auth.currentUser?.emailVerified || false;
};

/**
 * Resend email verification
 */
export const resendEmailVerification = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  
  try {
    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    throw error;
  }
};
