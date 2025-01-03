import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { fetchDetails, Genre, getItem, processSerieData} from "../../../function/MovieAndSerie";
import { ratingToPercentage, resolveRatingColor } from "../../../function/helpers";
import { RootStackParamList } from "../../AppNavigator";

import {Season} from "../../../function/MovieAndSerie";
import { useAuth } from "../../../hooks/useAuthContext";
import VideoPlayer from "../../videoplayers/VideoPlayer";
import Icon  from "react-native-vector-icons/FontAwesome";
import { streamingserverurl } from "../../../function/server";




type DetailRouteProp = RouteProp<RootStackParamList, "SerieDetail">;

const SerieDetail = () => {
  const route = useRoute<DetailRouteProp>();
  const { tmdb, id } = route.params;
  const {user}= useAuth()
  const [details, setDetails] = useState<any| undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [expandedSeasonId, setExpandedSeasonId] = useState<number | null>(null);
  const [data, setData] = useState<any>(null);
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
   const [modalVisible, setModalVisible] = useState(false);
   const [url, setUrl] = useState<string>("");

const handleEpisodevalueClicked = (surl: string) => {
  console.log(surl);
  setUrl(surl);
  setModalVisible(true);
};

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const detailsData = await fetchDetails(tmdb, "tv");
        const detailItem = await getItem(id, "serie");
        if (detailsData && detailItem?.success) {
          
          setDetails(detailsData);
          const serieData=await processSerieData(detailItem.response.serieId,{
            username: user.ipTvUsername,
            password: user.ipTvPassword,
          })
          setData(serieData);
         
        } else {
          console.error("Details not found.");
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tmdb, id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ff0000" />
      </View>
    );
  }

  const filteredSeasons = details?.seasons.filter((season:Season) => season.name.startsWith("Saison"));

  const toggleSeason = (seasonId: number) => {
    setExpandedSeasonId((prevId) => (prevId === seasonId ? null : seasonId));
  };
  

  const handleEpisodeClick = (key: string) => {
    if (expandedEpisode === key) {
      setExpandedEpisode(null); // Collapse if the same episode is clicked
    } else {
      setExpandedEpisode(key); // Expand the clicked episode
    }
    setSelectedEpisode(key); // Set the clicked episode as selected
  };

  const renderSeason = ({ item }: { item: Season }) => {
    const seasonNumber = item.name.split(" ")[1];
    const episodes = data?.[seasonNumber];
    
    if (!episodes) return<></>
    return(
    <View>
      <TouchableOpacity style={styles.seasonContainer} onPress={() => toggleSeason(item.id)}>
        <View style={styles.seasonInfo}>
          <Text style={styles.seasonTitle}>{item.name}</Text>
          <Text style={styles.seasonEpisodes}>{data?.[seasonNumber]?.length||0} episodes</Text>
        </View>
      </TouchableOpacity>
      {expandedSeasonId === item.id && (
        <View style={styles.episodeList}>
          {item.poster_path && (
            <Image
              style={styles.seasonPoster}
              source={{
                uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
              }}
            />
          )}
          {item?.overview && (
            <Text style={styles.overview}>
              {item?.overview.length > 100 ? `${item?.overview.substring(0, 100)}...` : item?.overview}
            </Text>
          )}
           <View>
           {episodes ? (
  Object.keys(episodes).map((key,index) => (
    <View key={key} style={{ marginBottom: 10 }}>
      {/* Episode title with selection indicator */}
      <TouchableOpacity onPress={() => handleEpisodeClick(key)}>
      <Text
  style={{
    fontSize: 18, // Slightly smaller for a clean look
    fontWeight: "500", // Softer weight for a modern feel
    color: selectedEpisode === key ? "#4CAF50" : "#2196F3", // Subtle green and blue shades
    paddingVertical: 8, // Vertical padding for better spacing
    paddingHorizontal: 12, // Horizontal padding for a modern button-like feel
    borderWidth: 1, // Lighter border for a clean aesthetic
    borderColor: selectedEpisode === key ? "#A5D6A7" : "#BBDEFB", // Subtle border colors
    borderRadius: 12, // Slightly rounded corners for a modern look
    textAlign: "center", // Centers the text
    backgroundColor: selectedEpisode === key ? "#F1F8E9" : "#E3F2FD", // Soft, muted background colors
    marginVertical: 6, // Balanced vertical spacing
    shadowColor: "#000", // Subtle shadow for depth
    shadowOffset: { width: 0, height: 2 }, // Shadow positioning
    shadowOpacity: 0.1, // Light shadow opacity
    shadowRadius: 4, // Smooth shadow edges
    elevation: 2, // Adds subtle elevation for Android
  }}
>
  Episode {index+1}
</Text>

      </TouchableOpacity>

      {/* Expanded episode details */}
      {selectedEpisode === key && (
        <FlatList
          data={episodes[index][index+1]}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ marginTop: 10, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 8 }}
            onPress={() => { 
            handleEpisodevalueClicked(`${streamingserverurl}/series/${user.ipTvUsername}/${user.ipTvPassword}/${item.id}.${item?.container_extension}`)
           }}
            >
          
              <Text>
                <Text style={{ fontWeight: "bold", color: "#000" }}>Episode Number:</Text> {item.episode_num}
              </Text>
              <Text>
                <Text style={{ fontWeight: "bold", color: "#000" }}>File Extension:</Text> {item.container_extension}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  ))
) : (
  <Text style={{ fontSize: 16, color: "gray", textAlign: "center" }}>
    No episodes available for this season.
  </Text>
)}

    </View>
        </View>
      )}
    </View>)
  };

  const renderGenres = () => {
    if (!details?.genres || details.genres.length === 0) {
      return <Text style={styles.noGenres}>No genres available.</Text>;
    }
    return (
      <View style={styles.genreContainer}>
        {details.genres.map((genre:Genre) => (
          <View key={genre.id} style={styles.genreBadge}>
            <Text style={styles.genreText}>{genre.name}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={[{}]}
      renderItem={null}
      ListHeaderComponent={
        <View>
          <Image
            style={styles.banner}
            source={{
              uri: details?.backdrop_path
                ? `https://image.tmdb.org/t/p/w500${details.backdrop_path}`
                : "https://via.placeholder.com/500x200?text=No+Image+Available",
            }}
          />
          <View style={styles.content}>
            <Text style={styles.title}>{details?.name}</Text>
            <View style={styles.ratingContainer}>
              <View
                style={[
                  styles.ratingBadge,
                  { backgroundColor: resolveRatingColor(details?.vote_average || 0) },
                ]}
              >
                <Text style={styles.ratingText}>
                  {ratingToPercentage(details?.vote_average || 0)}%
                </Text>
              </View>
            </View>
            {details?.tagline && <Text style={styles.tagline}>{details?.tagline}</Text>}
            {renderGenres()}
            {details?.overview && <Text style={styles.overview}>{details?.overview}</Text>}
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
        </View>
      }
      ListFooterComponent={
        filteredSeasons && (
          <FlatList
            data={filteredSeasons}
            renderItem={renderSeason}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={<Text style={styles.seasonHeading}>Seasons</Text>}
          />
        )
      }
    />
  );
};



// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  banner: { width: "100%", height: 200 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  ratingContainer: { marginVertical: 16 },
  ratingBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
  },
  ratingText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  overview: { fontSize: 16, color: "#ddd", marginVertical: 16 },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagline: {
    fontSize: 14,
    color: "#aaa",
    fontStyle: "italic",
    marginVertical: 8,
  },
  genreBadge: {
    backgroundColor: "#444",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: { color: "#fff", fontSize: 14 },
  noGenres: { color: "#aaa", fontSize: 14, marginVertical: 8 },
  seasonHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 16,
    marginTop: 16,
  },
  seasonContainer: { padding: 16 },
  
  
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  episodeList: { paddingLeft: 16, paddingBottom: 16 },
  episodeText: { fontSize: 14, color: "#ccc", marginVertical: 4 },
  seasonPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 16,
    marginBottom: 10,
  },

  seasonInfo: {
   
    borderRadius: 10, // Rounded corners for a soft, modern look
    padding: 16, // Balanced padding around the content
    marginBottom: 12, // Spacing between items
    shadowColor: "#000", // Subtle shadow for depth
    shadowOffset: { width: 0, height: 4 }, // Light shadow effect
    shadowOpacity: 0.1, // Soft shadow opacity
    shadowRadius: 8, // Smooth shadow radius
    elevation: 4, // Shadow for Android support
  },
  seasonTitle: {
    fontSize: 22, // Larger font for the title
    fontWeight: "600", // Medium bold for the title
    color: "#333", // Dark gray for text readability
    marginBottom: 8, // Adds space below the title
    letterSpacing: 0.5, // Slight letter spacing for readability
  },
  seasonEpisodes: {
    fontSize: 16, // Slightly smaller font for the episode count
    color: "#757575", // Lighter gray for the episode count
    fontWeight: "400", // Regular weight for the secondary text
  },
});

export default SerieDetail;
