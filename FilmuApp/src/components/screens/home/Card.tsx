import React from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";

type RootStackParamList = {
  MovieDetail: { id: string,tmdb:string };
  SerieDetail: { id: string,tmdb:string };
};

type CardProps = {
  item: {
    id: string;
    title: string;
    overview: string;
    imagePath: string;
    rating: number;
    releaseDate?: string;
    tmdb:string
  };
  type: string;
};

const Card: React.FC<CardProps> = ({ item, type }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleClick = () => {
    if (item.id) {
      console.log(item.id ,item.tmdb)
      navigation.navigate(type === "movie" ? "MovieDetail" : "SerieDetail", { id: item.id ,tmdb:item.tmdb});
    }
  };

  const getYear = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return !isNaN(date.getFullYear()) ? date.getFullYear() : "Unknown";
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handleClick}>
      <Image
        source={{ uri: item.imagePath || "https://via.placeholder.com/150" }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>{item.title || "Title Unavailable"}</Text>
        <Text style={styles.year}>{getYear(item.releaseDate)}</Text>
         
        {item.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="gold" />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 180,
    height: 300,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#333",
    margin: 10,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: "60%", // Reduced the height of the image
  },
  overlay: {
    padding: 12,
    backgroundColor: "#000",
    flex: 1,
    justifyContent: "space-evenly", // Adjusted spacing for better alignment
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  year: {
    color: "#bbb",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 4,
  },
 
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rating: {
    color: "gold",
    marginLeft: 4,
    fontSize: 14,
  },
});

export default Card;
