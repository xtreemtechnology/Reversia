import React, { createContext, useContext, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Dimensions 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Setup from './SetupScreens.js';

const { width } = Dimensions.get('window');
const Stack = createNativeStackNavigator();
const SetupContext = createContext(null);

function useSetupFlow() {
  return useContext(SetupContext);
}

// ─── UPGRADED INTRO SCREEN (Matching your Image) ──────────────────────────────
function SetupIntro({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.introContainer}>
      {/* Top Illustration Area */}
      <View style={styles.illustrationArea}>
        <Image 
          source={require('../../../assets/account setup.png')} 
          style={styles.mainImage}
          resizeMode="contain"
        />
      </View>

      {/* Purple Info Card */}
      <View style={[styles.purpleCard, { paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.textGroup}>
          <Text style={styles.introTitle}>Prepare your personal{"\n"}information</Text>
          <Text style={styles.introSubtitle}>
            Please give some true answers for{"\n"}following question
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.whiteBtn} 
          onPress={() => navigation.navigate('setupCountry')}
        >
          <Text style={styles.whiteBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={22} color="#825CFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── ROUTE WRAPPERS ───────────────────────────────────────────────────────────
// These connect your navigation to the shared state in SetupContext

function CountryRoute(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.SetupCountry {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function NameRoute(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.SetupName {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function GenderRoute(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.SetupGender {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function AgeRoute(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.SetupAge {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function WeightRoute(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.SetupWeight {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function HeightRoute(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.SetupHeight {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function DiabIntroRoute(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.DiabetesIntro {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function Diab1Route(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.Diabetes1 {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function Diab2Route(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.Diabetes2 {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function Diab3Route(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.Diabetes3 {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function Setup8Route(props) {
  const { setupData, setSetupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.Setup8 {...props} go={go} setupData={setupData} setSetupData={setSetupData} />;
}

function GeneratingRoute(props) {
  const go = (to) => props.navigation.navigate(to);
  return <Setup.SetupGenerating {...props} go={go} />;
}

function GeneratingCompleteRoute(props) {
  const { setupData } = useSetupFlow();
  const go = (to) => props.navigation.navigate(to);
  return <Setup.SetupGeneratingComplete {...props} go={go} setupData={setupData} />;
}

// ─── MAIN ENTRY POINT ─────────────────────────────────────────────────────────
export default function SetupEntry({ navigation, route }) {
  const [setupData, setSetupData] = useState({ 
    region: '', 
    name: '', 
    gender: '', 
    age: 27, 
    weight: 45, 
    weightUnit: 'kg',
    height: 175,
    heightUnit: 'cm'
  });

  const contextValue = useMemo(() => ({ setupData, setSetupData }), [setupData]);
  const initialNested = route?.params?.screen || 'setupIntro';
  return (
    <SetupContext.Provider value={contextValue}>
      <Stack.Navigator initialRouteName={initialNested} screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="setupIntro" component={SetupIntro} />
        <Stack.Screen name="setupCountry" component={CountryRoute} />
        <Stack.Screen name="setupName" component={NameRoute} />
        <Stack.Screen name="setupGender" component={GenderRoute} />
          <Stack.Screen name="setupAge" component={AgeRoute} />
          <Stack.Screen name="setupWeight" component={WeightRoute} />
          <Stack.Screen name="setupHeight" component={HeightRoute} />
          <Stack.Screen name="diab0" component={DiabIntroRoute} />
          <Stack.Screen name="diab1" component={Diab1Route} />
          <Stack.Screen name="diab2" component={Diab2Route} />
          <Stack.Screen name="diab3" component={Diab3Route} />
          <Stack.Screen name="setup8" component={Setup8Route} />
          <Stack.Screen name="setupgen" component={GeneratingRoute} />
          <Stack.Screen name="setupgenComplete" component={GeneratingCompleteRoute} />
      </Stack.Navigator>
    </SetupContext.Provider>
  );
}



// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  illustrationArea: {
    flex: 0.55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: width * 0.85,
    height: width * 0.85,
  },
  purpleCard: {
    flex: 0.45,
    backgroundColor: '#825CFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 45,
    justifyContent: 'space-between',
    // Adding minor shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  textGroup: {
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 38,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#E0D7FF',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
    opacity: 0.9,
  },
  whiteBtn: {
    backgroundColor: '#FFFFFF',
    height: 65,
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 10,
  },
  whiteBtnText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
});