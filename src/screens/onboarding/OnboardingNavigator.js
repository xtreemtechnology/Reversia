import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Onboarding & Intro
import SplashScreen from './SplashScreen';
import Onboarding1 from './Onboarding1';
import Onboarding2 from './Onboarding2';
import Onboarding3 from './Onboarding3';
import OnboardingStartScreen from './OnboardingStartScreen';

// 2. Auth Screens
import LoginScreen from '../auth/LoginScreen';
import ForgotPasswordScreen from '../auth/ForgotPasswordScreen';
import SignUpScreen from '../auth/SignUpScreen';
import OTPVerificationScreen from '../auth/LinkVerificationScreen';
import VerifyEmail from '../auth/VerifyEmail';
import EmailVerificationSuccess from '../auth/EmailVerificationSuccess';
import ResetPasswordSuccessScreen from '../auth/ResetPasswordSuccessScreen';

// 3. Account Setup (The 8 Steps)
import AccountSetupName from './AccountSetupName';
import AccountSetupGender from './AccountSetupGender';
import AccountSetupAge from './AccountSetupAge';
import AccountSetupWeight from './AccountSetupWeight';
import AccountSetupHeight from './AccountSetupHeight';
import AccountSetupGoal from './AccountSetupGoal';
import AccountSetupHealthStatus from './AccountSetupHealthStatus';
import AccountSetupReadiness from './AccountSetupReadiness';
import SetupGenerating from './SetupGenerating';
import AccountSetupComplete from './AccountSetupComplete';

// 4. Main App Navigation
import AppStackNavigator from '../../navigation/AppStackNavigator';
import SetupEntry from '../setup/SetupEntry';
import SetupAlias from '../setup/SetupAlias';
import { auth } from '../../config/firebase';

const Stack = createNativeStackNavigator();

function ProtectedMainApp({ navigation }) {
  useEffect(() => {
    if (!auth.currentUser) {
      navigation.replace('Login');
    }
  }, [navigation]);

  return <AppStackNavigator />;
}

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Splash" 
      screenOptions={{ headerShown: false }}
    >
      {/* --- INITIAL LOAD --- */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      
      {/* --- INTRO ONBOARDING --- */}
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />
      
      {/* --- AUTHENTICATION --- */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
      <Stack.Screen name="EmailVerificationSuccess" component={EmailVerificationSuccess} />
      <Stack.Screen name="ResetPasswordSuccess" component={ResetPasswordSuccessScreen} />

      {/* --- ACCOUNT SETUP (STEP-BY-STEP) --- */}
      <Stack.Screen name="OnboardingStart" component={OnboardingStartScreen} />
      <Stack.Screen name="AccountSetupName" component={AccountSetupName} />
      <Stack.Screen name="AccountSetupGender" component={AccountSetupGender} />
      <Stack.Screen name="AccountSetupAge" component={AccountSetupAge} />
      <Stack.Screen name="AccountSetupWeight" component={AccountSetupWeight} />
      <Stack.Screen name="AccountSetupHeight" component={AccountSetupHeight} />
      <Stack.Screen name="AccountSetupGoal" component={AccountSetupGoal} />
      <Stack.Screen name="AccountSetupHealthStatus" component={AccountSetupHealthStatus} />
      <Stack.Screen name="AccountSetupReadiness" component={AccountSetupReadiness} />
      <Stack.Screen name="SetupGenerating" component={SetupGenerating} />
      <Stack.Screen name="AccountSetupComplete" component={AccountSetupComplete} />
      <Stack.Screen name="setupIntro" component={SetupAlias} />
      <Stack.Screen name="setupCountry" component={SetupAlias} />
      <Stack.Screen name="setupName" component={SetupAlias} />
      <Stack.Screen name="setupGender" component={SetupAlias} />
      <Stack.Screen name="setupAge" component={SetupAlias} />
      <Stack.Screen name="setupWeight" component={SetupAlias} />
      <Stack.Screen name="setupHeight" component={SetupAlias} />
      <Stack.Screen name="setupComplete" component={SetupAlias} />
      <Stack.Screen name="Setup" component={SetupEntry} />
      
      {/* --- MAIN APP SECTION --- */}
      {/* AppStackNavigator handles MainTabs + all detail screens */}
      <Stack.Screen 
        name="MainApp" 
        component={ProtectedMainApp} 
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}