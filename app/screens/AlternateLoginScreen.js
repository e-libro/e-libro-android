import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Icon, Input, Button } from "react-native-elements";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(true);
  const [error, setError] = useState(null);

  let keyboardSize = new Animated.Value(0);

  const login = () => {
    if (
      username.toLocaleLowerCase() == "admin" &&
      password.toLocaleLowerCase() == "admin"
    ) {
      navigation.navigate("Main", { title: "Projects" });
    } else {
      setError("E-mail and/or Password is wrong");
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.content}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 90,
        }}
      >
        <Icon
          style={{ marginBottom: 50 }}
          type="font-awesome-5"
          name="atom"
          size={60}
          color="#666"
        />
        <Input
          containerStyle={{ width: "75%" }}
          leftIconContainerStyle={{ marginRight: 10 }}
          style={{ color: "#aaa" }}
          placeholder="email@yourdomain.com"
          labelStyle={{ color: "#ccc", fontWeight: "200", fontSize: 11 }}
          label="Your E-mail address"
          leftIcon={
            <Icon
              type="font-awesome-5"
              name="envelope"
              size={20}
              color="#ddd"
            />
          }
          onChangeText={setUsername}
          value={username}
        />
        <Input
          containerStyle={{ width: "75%" }}
          leftIconContainerStyle={{ marginRight: 10 }}
          style={{ color: "#aaa" }}
          placeholder="Password is Admin"
          labelStyle={{ color: "#ccc", fontWeight: "200", fontSize: 11 }}
          label="Password"
          secureTextEntry={showPwd}
          leftIcon={
            <Icon type="font-awesome-5" name="unlock" size={20} color="#ddd" />
          }
          rightIcon={
            <Icon
              type="ionicon"
              name="eye"
              size={20}
              color="#ddd"
              onPress={() => setShowPwd(!showPwd)}
            />
          }
          onChangeText={setPassword}
          value={password}
        />
        {!error ? (
          <Button
            containerStyle={{ width: "60%" }}
            buttonStyle={{ backgroundColor: "#555" }}
            icon={
              <Icon
                type="font-awesome-5"
                name="sign-in-alt"
                size={15}
                color="white"
              />
            }
            iconLeft
            title="   Login"
            onPress={login}
          />
        ) : (
          <View
            style={{
              backgroundColor: "red",
              padding: 30,
              marginBottom: 50,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "white" }}>{error}</Text>
          </View>
        )}
        {/*       <Button title="Login" onPress={() => navigation.navigate('Main')}/> */}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: "column",
  },
  input: {
    width: "70%",
    height: 30,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 4,
    padding: 2,
  },
});

export { LoginScreen };
