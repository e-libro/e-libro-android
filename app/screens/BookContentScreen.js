import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BookContentScreen = ({ route, navigation }) => {
  const { bookId } = route.params; // Recibe solo el bookId
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookDetails, setBookDetails] = useState(null); // Almacena título y autores

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

  useEffect(() => {
    const loadBookDetails = async () => {
      try {
        const storedBookmarks = await AsyncStorage.getItem("bookmark");
        const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];
        const book = bookmarks.find((b) => b.id === bookId);

        if (book) {
          navigation.setOptions({ title: book.title });
          setBookDetails({
            title: book.title,
            authors: book.authors,
          });
        } else {
          navigation.setOptions({ title: "Libro no encontrado" });
        }
      } catch (error) {
        console.error("Error al obtener detalles del libro:", error.message);
        navigation.setOptions({ title: "Error" });
      }
    };

    loadBookDetails();
  }, [bookId, navigation]);

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

      {/* Muestra título y autores debajo del contenido */}
      {bookDetails && (
        <View style={styles.bookDetailsContainer}>
          <Text style={styles.bookTitle}>{bookDetails.title}</Text>
          <Text style={styles.bookAuthors}>{bookDetails.authors}</Text>
        </View>
      )}
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
    backgroundColor: "#F5F5F5", // Fondo gris claro recomendado
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333333", // Texto principal negro o gris oscuro
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333", // Texto principal negro o gris oscuro
  },
  bookDetailsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#DDD", // Línea de separación tenue
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333333", // Texto principal negro o gris oscuro
  },
  bookAuthors: {
    fontSize: 16,
    color: "#666666", // Metadatos en gris medio
    marginTop: 5,
  },
});

export default BookContentScreen;
