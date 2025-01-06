import { AuthProvider, useAuth } from "./app/contexts/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import LoginScreen from "./app/screens/LoginScreen";
import BookDetailsScreen from "./app/screens/BookDetailsScreen";
import TabNavigator from "./app/screens/TabNavigator";
import { Ionicons } from "@expo/vector-icons";

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
        {authState.authenticated ? (
          <>
            <Stack.Screen
              name="Tabs"
              component={TabNavigator}
              options={{ headerShown: false }} // Ocultar encabezado del Stack para las pestañas
            />
            <Stack.Screen
              name="BookDetailsScreen"
              component={BookDetailsScreen}
              options={({ navigation }) => ({
                headerShown: true,
                headerLeft: () => (
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                  </TouchableOpacity>
                ),
                title: "",
              })}
            />
          </>
        ) : (
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
