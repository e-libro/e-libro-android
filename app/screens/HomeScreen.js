import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  Image,
  Button,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../apis/ApiClient";
import uuid from "react-native-uuid";
import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen() {
  const [books, setBooks] = useState([]); // Libros cargados
  const [page, setPage] = useState(1); // Página actual
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [hasMore, setHasMore] = useState(true); // Indica si hay más libros por cargar
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const [filter, setFilter] = useState(""); // Filtro por autor

  const { onSignout } = useAuth(); // Función para cerrar sesión

  const navigation = useNavigation();

  // Cierra la sesión del usuario
  const signout = () => {
    onSignout();
  };

  // Aplica los filtros de búsqueda
  const applyFilter = async () => {
    setBooks([]); // Reinicia la lista de libros
    setPage(1); // Reinicia la página
    setHasMore(false); // Habilita la carga de más libros

    try {
      const response = await apiClient.get(
        `/books?page=1&limit=5&title=${filter}&authors=${filter}`
      );

      console.log(JSON.stringify(response.data, null, 2));

      if (response.data && response.data.books) {
        const booksWithGUID = response.data.books.map((b) => ({
          ...b,
          guid: uuid.v4(),
        }));

        setBooks(booksWithGUID);
        setTotalPages(response.data.totalPages);
        setPage(response.data.page);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error al aplicar filtros:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga libros según la página actual
  const loadBooks = async (currentPage) => {
    if (isLoading || !hasMore) return; // Evita múltiples solicitudes
    setIsLoading(true); // Inicia el estado de carga

    try {
      const response = await apiClient.get(
        `/books?page=${currentPage}&limit=5&title=${filter}&authors=${filter}`
      );
      // const response = await apiClient.get(books?page=${currentPage});

      if (response.data && response.data.books) {
        const booksWithGUID = response.data.books.map((b) => ({
          ...b,
          guid: uuid.v4(), // Genera un UUID único para cada libro
        }));

        setBooks((prevBooks) => [...prevBooks, ...booksWithGUID]); // Agrega nuevos libros
        setTotalPages(response.data.totalPages); // Actualiza el total de páginas
        setPage(response.data.page); // Actualiza la página actual
        console.log("Libros cargados:", books.length);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      setHasMore(false);

      if (error.response) {
        console.error(
          // No hay más datos
          `Error en la solicitud (status ${error.response.status}):`,
          error.response.data
        );
      } else if (error.request) {
        console.error(
          "Error en la solicitud, sin respuesta del servidor:",
          error.request
        );
      } else {
        console.error("Error al configurar la solicitud:", error.message);
      }
    } finally {
      setIsLoading(false); // Termina el estado de carga
    }
  };

  //   Actualiza libros al cambiar de página
  useEffect(() => {
    loadBooks(page);
  }, [page]);

  // Manejador para cargar más libros
  const handleLoadMore = () => {
    if (page < totalPages && !isLoading) {
      setPage((prevPage) => prevPage + 1);
      loadBooks(page + 1);
    }
  };

  // // Renderiza cada libro como una tarjeta
  const renderBook = ({ item }) => {
    const { id, title, authors, cover } = item;
    const authorNames = authors.length
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
      <View style={styles.view}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Text style={styles.text}>Hola Alfredo Arias</Text>
        </TouchableOpacity>
      </View>

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
            onChangeText={(text) => setFilter(text)}
            onSubmitEditing={applyFilter}
          />
        </View>
      </View>

      <FlatList
        data={books} // Asegúrate de que sea un array
        keyExtractor={(book) => book.guid} // Usa GUID como clave única
        renderItem={renderBook}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() =>
          !isLoading && books && books.length === 0 ? (
            <Text style={styles.emptyText}>
              No se encontraron libros con ese autor o título.
            </Text>
          ) : null
        }
        ListFooterComponent={
          isLoading && <ActivityIndicator size="large" color="#0000ff" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Carga más cuando alcanza el 50% del final
      />
    </View>
  );
}

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
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  filterButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center", // Alinea verticalmente el icono y el TextInput
    borderWidth: 1,
    borderColor: "#c6c6c6",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40, // Define la altura del contenedor
    marginBottom: 20,
  },
  textInput: {
    flex: 1, // Ocupa el espacio restante
    fontSize: 16,
    color: "#000",
  },
  feather: {
    marginRight: 10,
  },

  view: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "space-between",
  },
});
