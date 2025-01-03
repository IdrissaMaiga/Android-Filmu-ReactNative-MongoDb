





import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Card from "./Card";
import { fetchDetails, fetchGenre, fetchMoviesOrSeries } from "../../../function/MovieAndSerie";

interface CardListProps {
  type: "movie" | "serie";
}

interface Genre {
  id: number;
  name: string;
}

interface Item {
  id: string;
  tmdb: string;
  details?: {
    title: string;
    overview: string;
    imagePath: string;
    rating: number;
    releaseDate?: string;
  };
}

const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const CardList: React.FC<CardListProps> = ({ type }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [activePage, setActivePage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(24);
  const [chunkSize, setChunkSize] = useState<number>(3);

  const screenWidth = Dimensions.get("window").width;

  const handleGenreChange = (genre: Genre) => {
    if (genre.name === selectedGenre) {
      setSelectedGenre("All");
    } else {
      setSelectedGenre(genre.name);
      
      
    }
    setActivePage(1);
  };
  
  
  useEffect(() => {
    if (screenWidth > 768) setChunkSize(6);
    else if (screenWidth > 480) setChunkSize(4);
    else setChunkSize(2);
  }, [screenWidth,type]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetchMoviesOrSeries(activePage, pageSize, type, selectedGenre);
        if (res.success) {
          const fetchedItems = res.response.items || [];
          const detailedItems = await Promise.all(
            fetchedItems.map(async (item: Item) => {
              const details = await fetchDetails(item.tmdb, type);
              return {
                ...item,
                details: details
                  ? {
                      title: details.title || details.name || "N/A",
                      overview: details.overview || "No overview available.",
                      imagePath: details.poster_path
                        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                        : "https://via.placeholder.com/150",
                      rating: details.vote_average || 0,
                      releaseDate: details.release_date || details.first_air_date || "N/A",
                    }
                  : null,
              };
            })
          );
          setItems(detailedItems);
          setTotalPages(Math.ceil(res.response.totalItem / res.response.pageSize));
        } else {
          console.error("Failed to fetch data:", res.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activePage, selectedGenre, type]);

  useEffect(() => {
    fetchGenre(type)
      .then((data) => {
        const processedGenres: Genre[] = data.genres
          .flatMap((genre: Genre): Genre[] =>
            genre.name.includes("&")
              ? genre.name.split("&").map((name: string) => ({
                  id: genre.id,
                  name: name.trim(),
                })) // Split and clean names
              : [genre] // Return as-is if no "&"
          )
          .map((genre: Genre, index: number): Genre => ({
            id: index + 1,
            name: genre.name,
          })) // Generate new unique IDs
          .filter(
            (genre: Genre, index: number, self: Genre[]): boolean =>
              self.findIndex((g) => g.name === genre.name) === index // Ensure unique genres
          );
  
        // Add a new genre at the beginning
        const newGenre: Genre = { id: processedGenres.length + 1, name: "All" };
        processedGenres.unshift(newGenre); // Add the new genre at the beginning
  
        setGenres(processedGenres || []);
      })
      .catch((err) => {
        console.error("Error fetching genres:", err);
        setGenres([]);
      });
  }, [type]);
  
  const renderChunk = (chunk: Item[]) => (
    <View style={styles.chunkContainer} key={chunk[0]?.id || Math.random().toString()}>
      {chunk.map((item) =>
        item.details ? (
          <Card
            key={item.id}
            item={{
              id: item.id,
              title: item.details.title,
              overview: item.details.overview,
              imagePath: item.details.imagePath,
              rating: item.details.rating,
              releaseDate: item.details.releaseDate,
              tmdb:item.tmdb
            }}
            type={type}
          />
        ) : (
          <Text key={item.id}>Loading..</Text>
        )
      )}
    </View>
  );

  const handlePreviousPage = () => {
    if (activePage > 1) setActivePage(activePage - 1);
  };

  const handleNextPage = () => {
    if (activePage < totalPages) setActivePage(activePage + 1);
  };

  const itemChunks = chunkArray(items, chunkSize);

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal style={styles.genreScrollContainer}>
        <View style={styles.genreContainer}>
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              style={[
                styles.genreButton,
                selectedGenre === genre.name && styles.selectedGenreButton,
              ]}
              onPress={() => {
               handleGenreChange(genre)
              }}
            >
              <Text
                style={[
                  styles.genreText,
                  selectedGenre === genre.name && styles.selectedGenreText,
                ]}
              >
                {genre.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator size="large" color="#ff6347" />
      ) : (
        itemChunks.map(renderChunk)
      )}

<View style={styles.paginationContainer}>
        <TouchableOpacity onPress={handlePreviousPage} disabled={activePage === 1}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={activePage === 1 ? "#ccc" : "#333"}
          />
        </TouchableOpacity>

        <Text style={styles.pageNumberText}>{`${activePage} / ${totalPages}`}</Text>

        <TouchableOpacity onPress={handleNextPage} disabled={activePage === totalPages}>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color={activePage === totalPages ? "#ccc" : "#333"}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
     
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chunkContainer: { flexDirection: "row", justifyContent: "space-between" },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    marginBottom:100
  },
  pageNumberText: { fontSize: 16, marginHorizontal: 10 },
  genreScrollContainer: { margin: 10 },
  genreContainer: { flexDirection: "row" },
  genreButton: {
    padding: 10,
    margin: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E3A8A",
    backgroundColor: "#fff",
  },
  selectedGenreButton: { backgroundColor: "#1E3A8A", borderColor: "#1E3A8A" },
  genreText: { fontSize: 14, color: "#1E3A8A" },
  selectedGenreText: { color: "#fff" },
});

export default CardList;
















