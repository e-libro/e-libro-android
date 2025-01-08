import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "react-native-vector-icons";

const BookshelfScreen = ({ navigation }) => {
  const [bookmarkItems, setBookmarkItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchBookmarks();
    }
  }, [isFocused]);

  const fetchBookmarks = async () => {
    try {
      setIsLoading(true);

      // Obtiene los favoritos desde AsyncStorage
      const storedBookmarks = await AsyncStorage.getItem("bookmark");
      const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];

      // Configura los datos obtenidos
      setBookmarkItems(bookmarks);
    } catch (error) {
      console.error("Error al cargar los libros guardados:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBookmark = async (bookId) => {
    try {
      const storedBookmarks = await AsyncStorage.getItem("bookmark");
      const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];

      const updatedBookmarks = bookmarks.filter((b) => b.id !== bookId);
      await AsyncStorage.setItem("bookmark", JSON.stringify(updatedBookmarks));
      setBookmarkItems(updatedBookmarks);
      alert("Libro eliminado del librero");
    } catch (error) {
      console.error("Error al eliminar el libro:", error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (bookmarkItems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No tienes libros guardados.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookmarkItems}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.bookItem}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("BookContentScreen", { bookId: item.id });
            }}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.author}>{item.authors}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeBookmark(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash" size={20} color="#ff0000" />
          </TouchableOpacity>
        </View>
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 16,
  },
  bookItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 8, // Reduce los márgenes en los lados
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  author: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});

export default BookshelfScreen;
