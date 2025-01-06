import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import apiClient from "../apis/ApiClient";

export default function BookDetailScreen({ route }) {
  const { id } = route.params; // Obtén el ID del libro desde los parámetros
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        console.log(id);
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
    <View style={styles.container}>
      <Image source={{ uri: book.cover.url }} style={styles.cover} />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.authors}>
        {book.authors.length
          ? book.authors.map((author) => author.name).join(", ")
          : "Autor desconocido"}
      </Text>
      <Text style={styles.description}>
        {book.description || "Sin descripción"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  cover: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  authors: {
    fontSize: 16,
    color: "#777",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
