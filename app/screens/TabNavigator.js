import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "react-native-vector-icons";
import { TouchableOpacity, Text, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import HomeScreen from "./HomeScreen";
import BookShelfScreen from "./BookShelfScreen";
import AboutScreen from "./AboutScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { onSignout } = useAuth();

  const handleSignout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", onPress: () => onSignout() },
    ]);
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Bookshelf") {
            iconName = focused ? "library" : "library-outline";
          } else if (route.name === "Info") {
            iconName = focused
              ? "information-circle"
              : "information-circle-outline";
          } else if (route.name === "Logout") {
            iconName = focused ? "exit" : "exit-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false, title: "Inicio" }}
      />
      <Tab.Screen
        name="Bookshelf"
        component={BookShelfScreen}
        options={({ navigation }) => ({
          title: "Mis libros",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen
        name="Info"
        component={AboutScreen}
        options={{
          title: "Acerca de",
        }}
      />
      <Tab.Screen
        name="Logout"
        component={View} // Vista vacía ya que es un botón funcional
        options={{
          title: "Cerrar sesión",
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={handleSignout}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="exit-outline"
                size={24}
                color="tomato"
                style={{ marginBottom: 2 }}
              />
              <Text style={{ color: "gray", fontSize: 12 }}>Cerrar sesión</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
