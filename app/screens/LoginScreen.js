import { View, StyleSheet, Image, TextInput, Button } from "react-native";
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { onSignin } = useAuth();

  const signin = async () => {
    const response = await onSignin("a@a.a", "123456@aM");

    if (response && response.error) {
      console.log(response.message);
    }
  };

  // const signup = async () => {
  //   const result = await onSignup(email, password);

  //   if (result && result.error) {
  //     alert(result.error);
  //   } else {
  //     alert("Usuario registrado con éxito");
  //     login();
  //   }
  // };

  return (
    <View style={styles.container}>
      {/* <Image style={styles.logo} source={require("../assets/logo.png")} /> */}
      <Image
        source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
        style={styles.image}
      />
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
        />

        <Button title="Iniciar Sesión" onPress={signin} />
        {/* <Button title="Registrarse" onPress={signup} /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "50%",
    height: "50%",
    resizeMode: "contain",
  },
  form: {
    gap: 10,
    width: "60%",
  },
  input: {
    height: 44,
    borderWitdh: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
