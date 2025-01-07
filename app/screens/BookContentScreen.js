import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as FileSystem from "expo-file-system";

const BookContentScreen = ({ route }) => {
  const { bookId } = route.params; // Recibe solo el bookId
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      const fileUri = FileSystem.documentDirectory + `book_${bookId}.txt`;

      try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists) {
          const fileContent = await FileSystem.readAsStringAsync(fileUri);
          setContent(fileContent);
        } else {
          setContent("El contenido del libro no está disponible.");
        }
      } catch (error) {
        console.error("Error al leer el archivo:", error.message);
        setContent("Hubo un error al cargar el contenido del libro.");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [bookId]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Contenido del libro</Text>
      <Text style={styles.content}>{content}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default BookContentScreen;
