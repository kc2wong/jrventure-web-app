
import { useState } from 'react';

import { LoginPage } from './login-page';
import { SignupPage } from './signup-page';
  
  type Mode = 'login' | 'signup';
  export const AuthenticationContainer= () => {
    const [mode, setMode] = useState<Mode>('login');
    
    if (mode === 'login') {
      return <LoginPage onNavigateToSignup={() => setMode('signup')} />;
    }
    else {
      return <SignupPage onNavigateToLogin={() => setMode('login')} />;
    }
  };
  