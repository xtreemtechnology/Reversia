# Auth Feature Hooks Documentation

## Overview

The auth feature demonstrates a **clean separation of concerns** using hooks:

- **`useAuth.js`** — App-level auth state (current user, authentication methods)
- **`useLoginForm.js`** — Login UI state and validation
- **`useSignUpForm.js`** — Signup UI state and validation
- **`usePasswordReset.js`** — Password reset flow

## Why This Pattern?

### 1. **UI State vs. Business Logic**
- Form state (`useLoginForm`) is isolated from auth state (`useAuth`)
- Screens are pure UI — they don't handle logic
- Hooks handle logic — they're reusable and testable

### 2. **Composability**
```javascript
// A screen can use multiple hooks for different concerns
export default function LoginScreen() {
  const form = useLoginForm();
  const { signIn, isLoading, error } = useAuth();
  
  // UI logic only
  const handlePress = async () => {
    if (form.validateForm()) {
      await signIn(form.email, form.password);
    }
  };
}
```

### 3. **Reusability**
- `useLoginForm` can be used in a modal, drawer, or full screen
- `useAuth` is used app-wide for auth state
- Each hook focuses on one responsibility

---

## Hook Reference

### useAuth()
**Manages authentication state and user session**

```javascript
const {
  user,              // Current Firebase user object
  isLoading,         // Loading state during auth operations
  error,             // Last error message
  isAuthenticated,   // Boolean: !!user
  signIn,            // (email, password) => Promise<user>
  signUp,            // (email, password, displayName) => Promise<user>
  signOut,           // () => Promise<void>
  sendPasswordReset, // (email) => Promise<{success, message}>
} = useAuth();
```

**Example:**
```javascript
export default function AuthenticatedApp() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <AuthStack />;

  return (
    <View>
      <Text>Welcome, {user.displayName}</Text>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  );
}
```

---

### useLoginForm()
**Manages login form state and validation**

```javascript
const {
  email,        // Current email value
  password,     // Current password value
  errors,       // Object: { email?: string, password?: string }
  setEmail,     // (value) => void
  setPassword,  // (value) => void
  isValid,      // Boolean: all fields valid and no errors
  validateForm, // () => boolean (runs all validations)
  reset,        // () => void (clears form and errors)
} = useLoginForm();
```

**Example:**
```javascript
export default function LoginScreen() {
  const form = useLoginForm();
  const { signIn, isLoading, error: authError } = useAuth();

  const handleLogin = async () => {
    if (!form.validateForm()) return;
    try {
      await signIn(form.email, form.password);
    } catch (err) {
      // Error already set in useAuth
    }
  };

  return (
    <View>
      <TextInput
        value={form.email}
        onChangeText={form.setEmail}
        placeholder="Email"
      />
      {form.errors.email && <Text>{form.errors.email}</Text>}

      <TextInput
        value={form.password}
        onChangeText={form.setPassword}
        placeholder="Password"
        secureTextEntry
      />
      {form.errors.password && <Text>{form.errors.password}</Text>}

      {authError && <Text>{authError}</Text>}

      <Button
        disabled={!form.isValid || isLoading}
        onPress={handleLogin}
        title={isLoading ? 'Signing in...' : 'Sign In'}
      />
    </View>
  );
}
```

---

### useSignUpForm()
**Manages signup form state and validation**

```javascript
const {
  email,              // Email input value
  password,           // Password input value
  confirmPassword,    // Password confirmation value
  displayName,        // Display name input value
  agreedToTerms,      // Boolean: terms agreement checkbox
  errors,             // Validation error messages
  setEmail,           // (value) => void
  setPassword,        // (value) => void
  setConfirmPassword, // (value) => void
  setDisplayName,     // (value) => void
  setAgreedToTerms,   // (value) => void
  isValid,            // Boolean: all fields valid, terms agreed
  validateForm,       // () => boolean
  reset,              // () => void
} = useSignUpForm();
```

**Validations included:**
- Email: required, valid format
- Display Name: required, 2+ characters
- Password: required, 8+ characters, uppercase letter, number
- Password Confirmation: must match password
- Terms: must be agreed

---

### usePasswordReset()
**Manages password reset flow**

```javascript
const {
  email,        // Email input value
  setEmail,     // (value) => void
  isLoading,    // Loading state during send
  error,        // Error message if failed
  success,      // Boolean: email sent successfully
  resetPassword,// () => Promise<boolean>
  reset,        // () => void (clear form)
} = usePasswordReset();
```

**Example:**
```javascript
export default function ForgotPasswordScreen() {
  const { email, setEmail, isLoading, error, success, resetPassword } = usePasswordReset();

  const handleReset = async () => {
    const success = await resetPassword();
    if (success) {
      // Show success message
    }
  };

  return (
    <View>
      {success && <Text>Check your email for reset link</Text>}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      <Button
        disabled={isLoading}
        onPress={handleReset}
        title={isLoading ? 'Sending...' : 'Send Reset Email'}
      />
    </View>
  );
}
```

---

## Pattern for Other Features

Apply this same pattern to **Meals**, **Glucose**, **Activity**, etc.:

### Structure
```
features/<feature>/
├── hooks/
│   ├── use<Feature>.js         (main logic hook, like useAuth)
│   ├── use<Feature>Form.js     (form state, like useLoginForm)
│   ├── use<Action>.js          (specific actions)
│   └── index.js                (barrel export)
├── services/
│   ├── <feature>Service.js     (API/storage calls)
│   └── index.js
├── screens/
│   ├── <Screen1>.js            (pure UI)
│   ├── <Screen2>.js            (pure UI)
│   └── index.js
└── index.js                    (barrel: export all)
```

### Hook Rules

1. **One responsibility per hook**
   - ❌ `useMeals()` with fetching + filtering + sorting + deleting
   - ✅ `useMeals()`, `useMealFilter()`, `useMealDelete()` separately

2. **Screens are pure UI**
   - ❌ Screens with API calls
   - ✅ Screens use hooks for logic

3. **Services handle external calls**
   - ❌ Firebase calls in hooks
   - ✅ Hooks call services, services call Firebase

4. **Form hooks manage UI state**
   - ❌ Form state scattered across screen
   - ✅ All form state in dedicated hook

---

## Testing Hooks

Each hook is independent and testable:

```javascript
import { renderHook, act } from '@testing-library/react-native';
import { useLoginForm } from './useLoginForm';

test('validates email format', () => {
  const { result } = renderHook(() => useLoginForm());

  act(() => {
    result.current.setEmail('invalid-email');
  });

  act(() => {
    result.current.validateForm();
  });

  expect(result.current.errors.email).toBeDefined();
});
```

---

## Best Practices

### ✅ Do's
- Use hooks for all business logic
- Keep screens as pure UI renderers
- Extract validation into form hooks
- Use barrel exports for clean imports
- Separate concerns: form state vs. app state vs. services

### ❌ Don'ts
- Don't put API calls directly in screens
- Don't mix form state with business logic
- Don't create giant "god hooks" doing everything
- Don't use Redux/Context for simple form state
- Don't duplicate validation logic

---

## Migration Checklist

When migrating a new feature, ensure:

- [ ] Feature folder has `hooks/`, `services/`, `screens/`
- [ ] Main logic hook created (`use<Feature>.js`)
- [ ] Form hook created if needed (`use<Feature>Form.js`)
- [ ] Services extracted from screens (`<feature>Service.js`)
- [ ] All hooks barrel exported (`hooks/index.js`)
- [ ] All screens barrel exported (`screens/index.js`)
- [ ] Feature index exports all submodules
- [ ] Screens use hooks, not direct API calls
- [ ] No circular dependencies between features
- [ ] Hooks are tested independently
