import React from "react";
import { View, StyleSheet, Image, TextInput, Button, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "../contexts/AuthContext";

const schema = yup.object().shape({
  fullname: yup.string().required("El nombre completo es obligatorio"),
  email: yup
    .string()
    .email("Debe ser un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
});

export default function SignupScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { onSignup } = useAuth();

  const signup = async (data) => {
    const { fullname, email, password } = data;

    const result = await onSignup(fullname, email, password);

    if (result && result.error) {
      alert(result.error);
    } else {
      alert("Usuario registrado con éxito");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
        style={styles.image}
      />
      <View style={styles.form}>
        {/* Full Name */}
        <Controller
          control={control}
          name="fullname"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.fullname ? styles.inputError : null]}
              placeholder="Nombre Completo"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.fullname && (
          <Text style={styles.errorText}>{errors.fullname.message}</Text>
        )}

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Correo Electrónico"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}

        {/* Password */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Contraseña"
              secureTextEntry={true}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}

        <Button title="Registrarse" onPress={handleSubmit(signup)} />
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
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  inputError: {
    borderColor: "red",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: -8,
    marginBottom: 8,
  },
});
