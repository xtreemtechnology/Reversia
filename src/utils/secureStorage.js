import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isSecureAvailable = typeof SecureStore !== "undefined" && SecureStore.getItemAsync;

export async function getItem(key) {
  try {
    if (isSecureAvailable) {
      const v = await SecureStore.getItemAsync(key);
      if (v !== null && v !== undefined) return v;
    }
  } catch (e) {
    console.warn("secureStore get failed", e);
  }

  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.warn("asyncStorage get failed", e);
    return null;
  }
}

export async function setItem(key, value) {
  try {
    if (isSecureAvailable) {
      await SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
      return;
    }
  } catch (e) {
    console.warn("secureStore set failed", e);
  }

  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.warn("asyncStorage set failed", e);
  }
}

export async function removeItem(key) {
  try {
    if (isSecureAvailable) {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (e) {
    console.warn("secureStore delete failed", e);
  }

  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn("asyncStorage delete failed", e);
  }
}

// Migrate a set of keys from AsyncStorage into SecureStore when possible.
export async function migrateKeys(keys = []) {
  if (!isSecureAvailable) return;
  for (const key of keys) {
    try {
      const existingSecure = await SecureStore.getItemAsync(key);
      if (existingSecure != null) continue; // already migrated

      const existing = await AsyncStorage.getItem(key);
      if (existing != null) {
        await SecureStore.setItemAsync(key, existing, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
        // keep the old copy for fallback (optional): remove AsyncStorage entry
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.warn("migrate key failed", key, e);
    }
  }
}

export default { getItem, setItem, removeItem, migrateKeys };
