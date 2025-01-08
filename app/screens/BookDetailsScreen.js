import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../apis/ApiClient";
import * as FileSystem from "expo-file-system";

export default function BookDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmark, setBookmark] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const renderBookmark = async (bookId) => {
    try {
      const storedBookmarks = await AsyncStorage.getItem("bookmark");
      const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];
      setBookmark(bookmarks.some((b) => b.id === bookId));
    } catch (error) {
      console.error("Error al cargar favoritos:", error.message);
    }
  };

  const saveBookmark = async (book) => {
    try {
      setIsDownloading(true);

      const storedBookmarks = await AsyncStorage.getItem("bookmark");
      const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];

      const exists = bookmarks.find((b) => b.id === book.id);
      if (!exists) {
        const newBookmark = {
          id: book.id,
          title: book.title,
          authors: book.authors.map((author) => author.name).join(", "),
          imageUrl: book.cover.url,
        };

        bookmarks.push(newBookmark);
        await AsyncStorage.setItem("bookmark", JSON.stringify(bookmarks));
        setBookmark(true);
        alert("Libro guardado en favoritos");

        // Llamada al endpoint para incrementar el contador de descargas
        await apiClient.patch(`/books/${book.id}/downloads`);

        const fileUri = FileSystem.documentDirectory + `book_${book.id}.txt`;
        console.log("Descargando contenido del libro...");
        await FileSystem.downloadAsync(book.content.url, fileUri);
        console.log(`Libro descargado en: ${fileUri}`);
      } else {
        alert("El libro ya está en favoritos.");
      }
    } catch (error) {
      console.error(
        "Error al guardar favorito o descargar contenido:",
        error.message
      );
      alert("Error al guardar favorito o descargar contenido.");
    } finally {
      setIsDownloading(false);
    }
  };

  const removeBookmark = async (bookId) => {
    try {
      const storedBookmarks = await AsyncStorage.getItem("bookmark");
      const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];
      const updatedBookmarks = bookmarks.filter((b) => b.id !== bookId);
      await AsyncStorage.setItem("bookmark", JSON.stringify(updatedBookmarks));
      setBookmark(false);
      alert("Libro eliminado de favoritos");

      const fileUri = FileSystem.documentDirectory + `book_${bookId}.txt`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
        console.log(`Archivo eliminado: ${fileUri}`);
        alert("Contenido del libro eliminado del disco.");
      } else {
        console.log("El archivo no existe, no se necesita eliminar.");
      }
    } catch (error) {
      console.error("Error al eliminar favorito:", error.message);
      alert("Error al intentar eliminar el contenido del libro.");
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

  useEffect(() => {
    if (!isLoading) {
      renderBookmark(id);
    }
  }, [isLoading, id]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (bookmark) {
              removeBookmark(id);
            } else {
              saveBookmark(book);
            }
          }}
        >
          <Ionicons
            name={bookmark ? "heart" : "heart-outline"}
            size={24}
            color={bookmark ? "red" : "black"}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, bookmark, id, book]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando detalles del libro...</Text>
      </View>
    );
  }

  if (isDownloading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>
          Descargando contenido del libro...
        </Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.container}>
        <Text>No se pudo cargar el libro</Text>
      </View>
    );
  }

  const handleDownload = () => {
    Alert.alert("Confirmación", "¿Deseas descargar este libro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Descargar", onPress: () => saveBookmark(book) },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.hiddenText}> </Text>
      <View
        style={[styles.cardContainer, { width: "75%", alignSelf: "center" }]}
      >
        {" "}
        {/* Reduce el tamaño de la tarjeta */}
        <Image
          source={{ uri: book.cover.url }}
          style={styles.bookImage}
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthors}>
            {book.authors.map((author) => author.name).join(", ")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
        >
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.downloadButtonText}>Descargar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12 /* Reduce el padding vertical */,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bookImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  textContainer: {
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  bookAuthors: {
    fontSize: 14,
    color: "#666",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
