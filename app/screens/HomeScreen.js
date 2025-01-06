import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../apis/ApiClient"; // Ajusta la ruta según tu estructura
import uuid from "react-native-uuid";
import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen() {
  const [books, setBooks] = useState([]); // Lista de libros
  const [page, setPage] = useState(1); // Página actual
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Si quedan más páginas por cargar
  const [totalPages, setTotalPages] = useState(1); // Total de páginas disponibles
  const [filter, setFilter] = useState(""); // Texto para filtrar (título/autor)

  const { onSignout } = useAuth();
  const navigation = useNavigation();

  // Cerrar sesión
  const signout = () => {
    onSignout();
  };

  /**
   * Aplica el filtro: reinicia la lista (books = []), regresa a la página 1,
   * habilita hasMore (por si la búsqueda tiene múltiples páginas),
   * y llama a la API para la primera página filtrada.
   */
  const applyFilter = async () => {
    setBooks([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(true);

    try {
      const response = await apiClient.get(
        `/books?page=1&limit=5&title=${filter}&author=${filter}`
      );
      const bookResponse = response.data;

      if (bookResponse?.data?.documents?.length) {
        const booksWithGUID = bookResponse.data.documents.map((b) => ({
          ...b,
          guid: uuid.v4(),
        }));
        setBooks(booksWithGUID);

        setTotalPages(bookResponse.data.totalPages);
        setPage(bookResponse.data.page);

        // Verificamos si hay más páginas
        if (bookResponse.data.page < bookResponse.data.totalPages) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } else {
        // Si no hay resultados, bloqueamos la carga infinita
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error al aplicar filtros:", error.message);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carga libros de la página indicada (currentPage).
   * Concatena con el estado anterior de 'books' para lograr efecto de scroll infinito.
   */
  const loadBooks = async (currentPage) => {
    if (isLoading || !hasMore) return; // Evita múltiples solicitudes simultáneas

    setIsLoading(true);

    try {
      const response = await apiClient.get(
        `/books?page=${currentPage}&limit=5&title=${filter}&author=${filter}`
      );
      const bookResponse = response.data;

      if (bookResponse?.data?.documents?.length) {
        const booksWithGUID = bookResponse.data.documents.map((b) => ({
          ...b,
          guid: uuid.v4(),
        }));

        // Concatena nuevos libros con los que ya existen en el estado
        setBooks((prevBooks) => [...prevBooks, ...booksWithGUID]);

        setTotalPages(bookResponse.data.totalPages);
        setPage(bookResponse.data.page);

        // Revisa si quedan más páginas
        if (bookResponse.data.page < bookResponse.data.totalPages) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error al cargar libros:", error.message);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cada vez que 'page' cambie, loadBooks() se ejecuta para cargar esa página.
   * De esta forma, un único lugar controla la lógica de cargar más libros.
   */
  useEffect(() => {
    loadBooks(page);
  }, [page]);

  /**
   * Manejador para FlatList: cuando se llega al final,
   * incrementa la página (si hay más páginas).
   */
  const handleLoadMore = () => {
    if (!isLoading && page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  /**
   * Renderiza cada libro como una tarjeta con portada, título y autores.
   */
  const renderBook = ({ item }) => {
    const { id, title, authors, cover } = item;
    const authorNames = authors?.length
      ? authors.map((author) => author.name).join(", ")
      : "Autor desconocido";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("BookDetailsScreen", { id })}
      >
        <Image
          source={{ uri: cover.url }}
          style={styles.cover}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.authors}>{authorNames}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con botón para cerrar sesión */}
      <View style={styles.view}>
        <TouchableOpacity onPress={signout}>
          <Text style={styles.text}>Cerrar</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={{ marginTop: 20, padding: 20 }}>
        <View style={styles.inputContainer}>
          <Feather
            name="search"
            size={20}
            color="#c6c6c6"
            style={styles.feather}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Buscar libros por autor o título..."
            placeholderTextColor="#c6c6c6"
            value={filter}
            onChangeText={(text) => setFilter(text)}
            onSubmitEditing={applyFilter}
          />
        </View>
      </View>

      {/* Lista de libros con scroll infinito */}
      <FlatList
        data={books}
        keyExtractor={(book) => book.guid}
        renderItem={renderBook}
        contentContainerStyle={styles.list}
        // Si no está cargando y la lista está vacía, muestra mensaje
        ListEmptyComponent={() =>
          !isLoading && books.length === 0 ? (
            <Text style={styles.emptyText}>
              No se encontraron libros con ese autor o título.
            </Text>
          ) : null
        }
        // Spinner cuando se está cargando
        ListFooterComponent={
          isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    padding: 10,
  },
  card: {
    flexDirection: "row",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  cover: {
    width: 100,
    height: 150,
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  authors: {
    fontSize: 14,
    color: "#555",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
  view: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  text: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c6c6c6",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  feather: {
    marginRight: 10,
  },
});
