import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";

import Icon from "react-native-vector-icons/Ionicons";
import { fetchDetails, getItem } from "../../../function/MovieAndSerie";
import { minutesToHours, ratingToPercentage, resolveRatingColor } from "../../../function/helpers";
import { RootStackParamList } from "../../AppNavigator";
import { streamingserverurl } from "../../../function/server";
import { useAuth } from "../../../hooks/useAuthContext";

import { Genre, Movie } from "../../../function/MovieAndSerie";
import VideoPlayer from "../../videoplayers/VideoPlayer";

type MovieDetailRouteProp = RouteProp<RootStackParamList, "MovieDetail">;

const MovieDetail = () => {
  const route = useRoute<MovieDetailRouteProp>();
  const { tmdb, id} = route.params;
  const {user}=useAuth();

  const [details, setDetails] = useState<any>(null);
  const [items, setItems] = useState<Movie | null>(null);
  const [indexers, setIndexers] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [watchingListVisible, setWatchingListVisible] = useState(false);
  const [url, setUrl] = useState("");
 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const detailsData = await fetchDetails(tmdb, "movie");
        const itemData = await getItem(id, "movie");

        if (detailsData && itemData.success) {
          setDetails(detailsData);
          setItems(itemData?.response || null);
          setIndexers(itemData.response.indexer || []);
        } else {
          console.error("Invalid data format for movie details");
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, tmdb]);

  const handleWatchingItemPressed = (streamUrl: string) => {
    console.log(streamUrl)
    setUrl(streamUrl);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ff0000" />
      </View>
    );
  }

  const backdropPath =
    details?.backdrop_path
      ? `https://image.tmdb.org/t/p/w500${details.backdrop_path}`
      : "https://via.placeholder.com/500x200?text=No+Image+Available";

  const title = details?.title || details?.name || "Untitled";
  const releaseDate = details?.release_date || details?.first_air_date || "";
  const runtime = minutesToHours(details?.runtime || 0);
  const voteAverage = ratingToPercentage(details?.vote_average || 0);
  const tagline = details?.tagline || "No tagline available";
  const overview = details?.overview || "No overview available";

  return (
    <ScrollView style={styles.container}>
      <Image style={styles.bannerImage} source={{ uri: backdropPath }} />
      <View style={styles.content}>
        <Text style={styles.title}>
          {title}{" "}
          <Text style={styles.year}>
            ({new Date(releaseDate).getFullYear()})
          </Text>
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            <Icon name="calendar" size={16} color="#ffd700" />{" "}
            {new Date(releaseDate).toLocaleDateString()}
          </Text>
          <Text style={styles.metaText}>
            <Icon name="time" size={16} color="#ffd700" /> {runtime}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <View
            style={[
              styles.ratingCircle,
              { backgroundColor: resolveRatingColor(details?.vote_average) },
            ]}
          >
            <Text style={styles.ratingText}>{voteAverage}%</Text>
          </View>
        </View>
       {tagline&&<Text style={styles.tagline}>{tagline}</Text>} 
        <Text style={styles.heading}>Overview</Text>
          {overview&& <Text style={styles.overview}>{overview}</Text>} 
        <View style={styles.genres}>
          {details?.genres?.map((genre: Genre) => (
            <Text key={genre.id} style={styles.genreBadge}>
              {genre.name}
            </Text>
          ))}
        </View>

        {watchingListVisible && !indexers && (
          <Text style={{ color: "red" }}>No server found</Text>
        )}

        {watchingListVisible &&
          indexers &&
          <View>
            <Text style={styles.serverText}>Servers</Text>
          {indexers.map((item: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.indexerButton}
              onPress={() =>
                handleWatchingItemPressed(`${streamingserverurl}/movie/${user.ipTvUsername}/${user.ipTvPassword}/${item}.${items?.extension[index]}`)
              }
            >
              <Text style={styles.indexerText}>{index+1}</Text>
            </TouchableOpacity>
            
          ))}
          </View>}

        {!watchingListVisible && (
          <TouchableOpacity
            style={styles.watchButton}
            onPress={() => setWatchingListVisible(true)}
          >
            <Text style={styles.watchButtonText}>Regarder</Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <VideoPlayer
          source={{ uri: url }}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}
        >
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  bannerImage: { width: "100%", height: 200 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  year: { fontWeight: "normal", color: "#ffd700" },
  meta: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  metaText: { fontSize: 14, color: "#ddd" },
  ratingContainer: {  marginVertical: 16 },
  ratingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  tagline: { fontSize: 14, color: "#aaa", fontStyle: "italic", marginVertical: 8 },
  heading: { fontSize: 18, fontWeight: "bold", color: "#fff", marginVertical: 8 },
  overview: { fontSize: 16, color: "#ddd", marginBottom: 16 },
  genres: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  genreBadge: {
    backgroundColor: "#444",
    color: "#fff",
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  watchButton: {
    backgroundColor: "#ffd700",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  watchButtonText: { color: "#000", fontWeight: "bold" },
  videoPlayer: { flex: 1 },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
  },
  indexerButton: {
    backgroundColor: "#333",
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  indexerText: { color: "#fff" ,textAlign: "center"},
  serverText: { color: "#fff" ,textAlign: "center",marginBottom:10,backgroundColor: "rgba(147, 141, 230, 0.5)", borderRadius: 4,},
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
});

export default MovieDetail;
