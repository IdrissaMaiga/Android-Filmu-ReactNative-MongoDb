import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Import the type
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchChannels } from '../../../function/channel';

const ITEMS_PER_PAGE = 20;

// Define the Channel type
type Channel = {
  id: number;
  name: string;
  logos: string[];
  category?: string;
};

// Define the navigation parameter list
type RootStackParamList = {
  ChannelDetail: { channelId: number };
};

// Use the defined type for navigation
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChannelDetail'>;

const ChannelList: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chunkSize, setChunkSize] = useState<number>(1);

  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation<NavigationProp>(); // Add the type here

  useEffect(() => {
    if (screenWidth > 768) setChunkSize(6);
    else if (screenWidth > 480) setChunkSize(4);
    else setChunkSize(3);
  }, [screenWidth]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response = await fetchChannels(currentPage, ITEMS_PER_PAGE, searchTerm, selectedCategory);

    setLoading(false);
    if (response.success && response.response) {
      setChannels(response.response.channels);
      setTotalPages(response.response.totalPages);
      setCategories(
        Array.from(new Set(response.response.channels.map((channel: Channel) => channel.category).filter(Boolean)))
      );
    }
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    if (selectedCategory === category) {
      // If the same category is clicked again, reset it
      setSelectedCategory('');
    } else {
      // Otherwise, set the new category
      setSelectedCategory(category);
    }
    setCurrentPage(1);
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const itemChunks = chunkArray(channels, chunkSize);

  const renderChunk = (chunk: Channel[]) => (
    <View style={styles.chunkContainer} key={chunk[0]?.id || Math.random().toString()}>
      {chunk.map((channel) => (
        <TouchableOpacity
          key={channel.id}
          style={styles.channelCard}
          onPress={() => navigation.navigate('ChannelDetail', { channelId: channel.id })} // Type-safe navigation
        >
          <Image
            source={{ uri: channel.logos[0] || 'default-logo.png' }}
            style={styles.channelLogo}
            resizeMode="contain" // Ensures the image fits within the specified dimensions
          />
          {/*Text style={styles.channelName}>{channel.name}</Text>*/}
          {/*channel.category!="undefined" && <Text style={styles.channelCategory}>{channel.category}</Text>*/}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search channels..."
          value={searchTerm}
          onChangeText={handleSearch}
        />
        <ScrollView horizontal style={styles.categoryScroll}>
          {categories.map((category, index) => (
           <TouchableOpacity
           key={index}
           style={[
             styles.categoryButton,
             selectedCategory === category && styles.selectedCategoryButton,
           ]}
           onPress={() => handleCategoryChange(category)} // Use the updated function
         >
           <Text
             style={[
               styles.categoryText,
               selectedCategory === category && styles.selectedCategoryText,
             ]}
           >
             {category}
           </Text>
         </TouchableOpacity>
         
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ff6347" />
      ) : (
        itemChunks.map(renderChunk)
      )}

      <View style={styles.paginationContainer}>
        <TouchableOpacity onPress={goToPreviousPage} disabled={currentPage === 1}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={currentPage === 1 ? '#ccc' : '#333'}
          />
        </TouchableOpacity>
        <Text style={styles.pageNumberText}>
          {currentPage} / {totalPages}
        </Text>
        <TouchableOpacity onPress={goToNextPage} disabled={currentPage === totalPages}>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color={currentPage === totalPages ? '#ccc' : '#333'}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchContainer: { padding: 10 },
  searchInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8 },
  categoryScroll: { marginTop: 10 },
  categoryButton: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#1E3A8A',
    backgroundColor: '#fff',
  },
  selectedCategoryButton: { backgroundColor: '#1E3A8A' },
  categoryText: { fontSize: 14, color: '#1E3A8A' },
  selectedCategoryText: { color: '#fff' },
  chunkContainer: { flexDirection: 'row', justifyContent: 'space-between', margin: 10 },
  channelCard: { alignItems: 'center', margin: 5 },
  channelLogo: { width: 80, height: 80, borderRadius: 8, },
  channelName: { marginTop: 8, fontWeight: 'bold' },
  channelCategory: { color: '#777' },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 20,marginBottom:80 },
  pageNumberText: { fontSize: 16, marginHorizontal: 10 },
});

export default ChannelList;
