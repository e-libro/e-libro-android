import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../apis/ApiClient";
import { useIsFocused } from "@react-navigation/native";

const BookshelfScreen = () => {
  const [bookmarkItems, setBookmarkItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchBookmark();
    }
  }, [isFocused]);

  const fetchBookmark = async () => {
    try {
      setIsLoading(true);
      const storedBookmarks = await AsyncStorage.getItem("bookmark");
      const bookmarkedIds = storedBookmarks ? JSON.parse(storedBookmarks) : [];

      if (bookmarkedIds.length === 0) {
        setBookmarkItems([]);
        setIsLoading(false);
        return;
      }

      const fetchBooks = await Promise.all(
        bookmarkedIds.map(async (id) => {
          const response = await apiClient.get(`/books/${id}`);
          return response.data.data;
        })
      );

      setBookmarkItems(fetchBooks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error.message);
    } finally {
      setIsLoading(false);
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
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.author}>
            {item.authors.map((author) => author.name).join(", ")}
          </Text>
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
    marginBottom: 16,
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
});

export default BookshelfScreen;
