import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// Importar telas
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AgendaScreen from './screens/AgendaScreen';
import EventosScreen from './screens/EventosScreen';
import CultosScreen from './screens/CultosScreen';
import CursosScreen from './screens/CursosScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import RegisterScreen from './screens/RegisterScreen'; // Importar a tela de cadastro

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitorar estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    // Você pode adicionar uma tela de loading aqui
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'Home' : 'Login'}
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          // Usuário autenticado - telas do app
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Agenda" component={AgendaScreen} />
            <Stack.Screen name="Eventos" component={EventosScreen} />
            <Stack.Screen name="Cultos" component={CultosScreen} />
            <Stack.Screen name="Cursos" component={CursosScreen} />
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          </>
        ) : (
          // Usuário não autenticado - tela de login e cadastro
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

