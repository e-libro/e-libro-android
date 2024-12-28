import { AuthProvider, useAuth } from "./app/contexts/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./app/screens/LoginScreen";
import HomeScreen from "./app/screens/HomeScreen";
import BookDetailsScreen from "./app/screens/BookDetailsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

export const Layout = () => {
  const { authState } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* {authState.authenticated ? (
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
        ) : (
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
        )} */}
        {authState.authenticated ? (
          <>
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={{ title: "Inicio" }} // Opcional: Cambiar el título del encabezado
            />
            <Stack.Screen
              name="BookDetailsScreen"
              component={BookDetailsScreen}
              options={{ title: "Detalles del Libro" }} // Opcional: Cambiar el título del encabezado
            />
          </>
        ) : (
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ title: "Iniciar Sesión" }} // Opcional
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
