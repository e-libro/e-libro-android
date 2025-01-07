import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../apis/ApiClient";
import * as FileSystem from "expo-file-system";

export default function BookDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmark, setBookmark] = useState(false);

  const renderBookmark = async (bookId) => {
    try {
      const storedBookmarks = await AsyncStorage.getItem("bookmark");
      const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];
      setBookmark(bookmarks.includes(bookId));
    } catch (error) {
      console.error("Error al cargar favoritos:", error.message);
    }
  };

  const saveBookmark = async (bookId) => {
    try {
      const storedBookmarks = await AsyncStorage.getItem("bookmark");
      const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];

      if (!bookmarks.includes(bookId)) {
        bookmarks.push(bookId);
        await AsyncStorage.setItem("bookmark", JSON.stringify(bookmarks));
        setBookmark(true);
        alert("Libro guardado en favoritos");

        if (book && book.content && book.content.url) {
          console.log("Descargando contenido del libro...");
          const fileUri = FileSystem.documentDirectory + `book_${bookId}.txt`;

          try {
            await FileSystem.downloadAsync(book.content.url, fileUri);
            console.log(`Libro descargado en: ${fileUri}`);

            const fileInfo = await FileSystem.getInfoAsync(fileUri);

            if (fileInfo.exists) {
              console.log("El archivo fue guardado correctamente.");
              alert("Contenido del libro descargado y validado.");
            } else {
              console.error("El archivo no se guardó correctamente.");
              alert("Error: El contenido del libro no se guardó.");
            }
          } catch (error) {
            console.error(
              "Error al descargar el contenido del libro:",
              error.message
            );
            alert("Error al descargar el contenido del libro.");
          }
        }
      }
    } catch (error) {
      console.error("Error al guardar favorito:", error.message);
    }
  };

  const removeBookmark = async (bookId) => {
    try {
      const storedBookmarks = await AsyncStorage.getItem("bookmark");
      const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];
      const updatedBookmarks = bookmarks.filter((v) => v !== bookId);
      await AsyncStorage.setItem("bookmark", JSON.stringify(updatedBookmarks));
      setBookmark(false);
      alert("Libro eliminado de favoritos");

      const fileUri = FileSystem.documentDirectory + `book_${bookId}.txt`;

      try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri);
          console.log(`Archivo eliminado: ${fileUri}`);
          alert("Contenido del libro eliminado del disco.");
        } else {
          console.log("El archivo no existe, no se necesita eliminar.");
          alert("No se encontró contenido para eliminar.");
        }
      } catch (error) {
        console.error("Error al eliminar el archivo del libro:", error.message);
        alert("Error al intentar eliminar el contenido del libro.");
      }
    } catch (error) {
      console.error("Error al eliminar favorito:", error.message);
    }
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const bookResponse = await apiClient.get(`/books/${id}`);
        const response = bookResponse.data;
        setBook(response.data);
      } catch (error) {
        console.error("Error al cargar detalles del libro:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  // Inicializar estado de favorito al cargar
  useEffect(() => {
    if (!isLoading) {
      renderBookmark(id);
    }
  }, [isLoading, id]);

  // Configurar el ícono de favoritos en el encabezado
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => (bookmark ? removeBookmark(id) : saveBookmark(id))}
        >
          <Ionicons
            name={bookmark ? "heart" : "heart-outline"}
            size={24}
            color={bookmark ? "red" : "black"}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, bookmark, id]);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!book) {
    return (
      <View style={styles.container}>
        <Text>No se pudo cargar el libro</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>{book.title}</Text>
      <View>
        <Text style={styles.newsInfo}>
          {book.authors.length
            ? book.authors.map((author) => author.name).join(", ")
            : "Autor desconocido"}
        </Text>
      </View>
      <Image
        source={{ uri: book.cover.url }}
        style={styles.newsImg}
        resizeMode="cover"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginVertical: 20,
    letterSpacing: 0.6,
  },
  newsImg: {
    width: "100%",
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
});
