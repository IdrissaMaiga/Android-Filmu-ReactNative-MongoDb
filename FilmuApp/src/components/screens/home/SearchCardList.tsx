import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Card from "./Card"; // Assuming you already have the Card component
import { fetchDetails, fetchMoviesAndSeries } from "../../../function/MovieAndSerie";

interface Item {
  id: string;
  tmdb: string;
  type:string
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

const SearchCardList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [activePage, setActivePage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search input
  const [type, setType] = useState<"movie" | "serie" | "all">("all"); // Type selector
  const [pageSize, setPageSize] = useState<number>(24);
  const [chunkSize, setChunkSize] = useState<number>(3);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (screenWidth > 768) setChunkSize(6);
    else if (screenWidth > 480) setChunkSize(4);
    else setChunkSize(2);
  }, [screenWidth]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetchMoviesAndSeries({
          page: activePage,
          pageSize,
          search: searchQuery,
          type,
        });
  
        if (res.success) {
          const fetchedItems = res.response.items || [];
          
          // Fetch details for each item
          const detailedItems = await Promise.all(
            fetchedItems.map(async (item: Item) => {
              const details = await fetchDetails(item.tmdb, type.toLowerCase());
              return details
                ? {
                    ...item,
                    details: {
                      title: details.title || details.name || "N/A",
                      overview: details.overview || "No overview available.",
                      imagePath: details.poster_path
                        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                        : "https://via.placeholder.com/150",
                      rating: details.vote_average || 0,
                      releaseDate: details.release_date || details.first_air_date || "N/A",
                    },
                  }
                : null; // Return null if no valid details
            })
          );
  
          // Filter out null items
          const validItems = detailedItems.filter((item) => item !== null) as Item[];
  
          setItems(validItems);
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
  }, [activePage, searchQuery, type]);
  

  const handleTypeChange = (typet: "movie"|"serie"|"all") => {
    if (typet === type) {
      setType("all");
    } else {
      setType(typet);
      
      
    }
    setActivePage(1);
  };
  

  const handlePreviousPage = () => {
    if (activePage > 1) setActivePage(activePage - 1);
  };

  const handleNextPage = () => {
    if (activePage < totalPages) setActivePage(activePage + 1);
  };

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
            type={item.type}
          />
        ) : (
          <Text key={item.id}>Loading..</Text>
        )
      )}
    </View>
  );

  const itemChunks = chunkArray(items, chunkSize);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, type === "all" && styles.typeButtonActive]}
            onPress={() => setType("all")}
          >
            <Text style={styles.typeButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === "movie" && styles.typeButtonActive]}
            onPress={() => handleTypeChange("movie")}
          >
            <Text style={styles.typeButtonText}>Movies</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === "serie" && styles.typeButtonActive]}
            onPress={() => handleTypeChange("serie")}
          >
            <Text style={styles.typeButtonText}>Series</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  searchContainer: { padding: 10, backgroundColor: "#f8f8f8" },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  typeSelector: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  typeButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E3A8A",
    backgroundColor: "#f8f8f8",
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
   
  },
  typeButtonActive: {  borderColor: "#1E3A8A",
    backgroundColor: "#1E3A8A", },
  typeButtonText: { color: "#333" },
  chunkContainer: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    marginBottom:100
  },
  pageNumberText: { fontSize: 16, marginHorizontal: 10 },
});

export default SearchCardList;
