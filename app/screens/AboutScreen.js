import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.aboutContainer}>
      {/* Logo de UNIR */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/unir-logo.png")} // Asegúrate de ajustar la ruta al logo
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.universityName}>
        Universidad Internacional de La Rioja
      </Text>
      <Text style={styles.facultyName}>
        Escuela Superior de Ingeniería y Tecnología
      </Text>
      <Text style={styles.masterName}>
        Máster Universitario en Ingeniería de Software y Sistemas Informáticos
      </Text>
      <Text style={styles.projectTitle}>
        E-Libro: Lector de Libros Digitales del Dominio Público para
        Dispositivos Móviles
      </Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>
          Trabajo fin de estudio presentado por:
        </Text>
        <Text style={styles.infoText}>Alfredo Ernesto Arias Corporan</Text>

        <Text style={styles.infoLabel}>Tipo de trabajo:</Text>
        <Text style={styles.infoText}>Desarrollo Práctico</Text>

        <Text style={styles.infoLabel}>Director/a:</Text>
        <Text style={styles.infoText}>Miguel Ángel Muñoz Alvarado</Text>

        <Text style={styles.infoLabel}>Fecha:</Text>
        <Text style={styles.infoText}>12-18-2024</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  aboutContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: "300",
    height: "100",
  },
  universityName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  facultyName: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  masterName: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  projectTitle: {
    fontSize: 18,
    color: "#007bff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: "flex-start",
    width: "100%",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
});
