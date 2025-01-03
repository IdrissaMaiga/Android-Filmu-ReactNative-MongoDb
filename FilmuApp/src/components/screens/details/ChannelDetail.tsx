import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchChannelDetails } from '../../../function/channel';
import { useAuth } from '../../../hooks/useAuthContext';
import PortDetail from './PortDetail';

type Channel = {
  id: string;
  name: string;
  description: string;
  logos: string[];
  category?: string;
  ports: Port[];
};

type Port = {
  id: string;
  name: string;
  resolution?: string;
  language?: string;
};

const ChannelDetail: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { channelId } = route.params;
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const { user } = useAuth();
  const [BackupPorts, setBackupPorts] = useState<string[] | []>([]);
 

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const response = await fetchChannelDetails(channelId);
      if (response.success && response.response) {
        // Sort ports alphabetically by name
        const sortedPorts = response.response.channel.ports.sort((a: Port, b: Port) =>
          a.name.localeCompare(b.name)
        );
        setChannel({ ...response.response.channel, ports: sortedPorts });
        //console.log(response.response.backupports)
        setBackupPorts(response.response.backupports)
      }
      setLoading(false);
    };

    fetchDetails();
  }, [channelId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Channel details not found.</Text>
      </View>
    );
  }

  const renderPorts = () => {
    if (!user.ipTvUsername || !user.ipTvPassword) {
      return <Text style={styles.errorText}>Not Allowed to Stream</Text>;
    }

    return channel.ports.map((port) => (
      <TouchableOpacity
        key={port.id}
        style={styles.portItem}
        onPress={() => setSelectedPort(port.id)}
      >
        
        <Text style={styles.portName}>{port.name}</Text>
        <Text style={styles.portDetails}>
          {port.resolution || 'Unknown'} - {port.language || 'Unknown'}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <ScrollView style={styles.container}>
    {!selectedPort&&  <Image
        source={{ uri: channel.logos[0] || 'default-logo.png' }}
        style={styles.channelLogo}
        resizeMode="contain"
      />}
      {/*<Text style={styles.channelName}>{channel.name}</Text>*/}
      {channel.category!="undefined" && <Text style={styles.channelCategory}>{channel.category}</Text>}
     
      {selectedPort&& <PortDetail
          portId={selectedPort}
          uri={channel.logos[0]}
          user={{
            username: user.ipTvUsername,
            password: user.ipTvPassword,
          }}
          bPorts={BackupPorts}
        />}
      <Text style={styles.portTitle}>Available Ports:</Text>
      {renderPorts()}


      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: '#ff6347' },
  channelLogo: { width: "100%", height: 200, borderRadius: 8, marginBottom: 16 },
  channelName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  channelCategory: { fontSize: 16, color: '#777', marginBottom: 16 },
  channelDescription: { fontSize: 16, lineHeight: 22, color: '#333' },
  portTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  portItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
   
  },
  portName: { fontSize: 16, fontWeight: 'bold' },
  portDetails: { fontSize: 14, color: '#555' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    padding: 10,
    marginTop: 20,
    marginBottom: 30
  },
  backButtonText: { color: '#fff', fontSize: 16, marginLeft: 8 },
});

export default ChannelDetail;
