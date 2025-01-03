import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import { Collapse, CollapseHeader, CollapseBody } from 'accordion-collapse-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchPortAndPlay } from '../../../function/channel';
import { streamingserverurl } from '../../../function/server';
import VideoPlayer from '../../videoplayers/VideoPlayer';
import PPort from '../../videoplayers/PPort';

// Utility function for base64 decoding
const decodeBase64 = (str: string) => {
  try {
    const decodedStr = atob(str);
    return decodeURIComponent(escape(decodedStr));
  } catch (e) {
    console.error("Base64 decoding error:", e);
    return str; // Return original string if decoding fails
  }
};

type Program = {
  title: string;
  start: string | number | Date;
  end: string | number | Date;
  description: string;
};

interface PortDetailProps {
  portId: string;
  user: {
    username: string;
    password: string;
  };
  uri:string
  bPorts:string[]
}

const PortDetail: React.FC<PortDetailProps> = ({ portId, user,uri,bPorts }) => {
  const [loading, setLoading] = useState(true);
  const [streamUrls, setStreamUrls] = useState<string[]>([]);
  const [epgData, setEpgData] = useState<Program[]>([]);
  const [error, setError] = useState<string>('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const loadStream = async () => {
    try {
      setLoading(true);
      const res = await fetchPortAndPlay(portId, {
        username: user.username,
        password: user.password,
      });

      if (res.success) {
        const { port, epg } = res.response;
        const sUrl: string = `${streamingserverurl}/live/${user.username}/${user.password}/${port.indexer}.m3u8`;

        // Corrected map function to return the constructed URLs for bPorts
        let bUrls: string[] = bPorts.map(p => `${streamingserverurl}/live/${user.username}/${user.password}/${p}.m3u8`);
        
        // Add sUrl to the bUrls array
        bUrls = [sUrl,...bUrls];
        console.log(bUrls)
        // Set the stream URLs
        setStreamUrls(bUrls);
        setEpgData(epg);
      } else {
        setError('Failed to fetch stream or EPG data.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load port or stream details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStream();
  }, [portId, user.username, user.password]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {streamUrls.length>0 ? (
        <PPort
          sources={streamUrls}
          
        />
      ) : (
        <Text style={styles.errorText}>No streaming URL available.</Text>
      )}
    
<Image
source={{ uri: uri || 'default-logo.png' }}
style={styles.channelLogo}
resizeMode="contain"
/> 

      {epgData.length > 0 && (
        <View style={styles.epgContainer}>
          <TouchableOpacity
            style={styles.guideToggle}
            onPress={() => setIsGuideOpen(!isGuideOpen)}
            accessibilityLabel="Toggle program guide"
          >
            <Text style={styles.guideToggleText}>
            {isGuideOpen ? 'Masquer le guide des programmes' : 'Afficher le guide des programmes'}

            </Text>
            <Ionicons
              name={isGuideOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#007BFF"
            />
          </TouchableOpacity>

          <Collapse isExpanded={isGuideOpen}>
            <CollapseHeader>
              <View style={styles.collapseHeader} />
            </CollapseHeader>
            <CollapseBody>
              <ScrollView style={styles.epgBody}>
                {epgData.map((program, index) => (
                  <View key={program.title + index} style={styles.programItem}>
                    <Text style={styles.programTitle}>{decodeBase64(program.title)}</Text>
                    <Text style={styles.programTime}>
                      {new Date(program.start).toLocaleTimeString(['en-US'], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(program.end).toLocaleTimeString(['en-US'], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.programDescription}>
                      {decodeBase64(program.description)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </CollapseBody>
          </Collapse>
        </View>
      )}
    </ScrollView>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  channelLogo: { width: 50, height: 50, borderRadius: 8 },
  videoPlayer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  epgContainer: {
    marginTop: 16,
  },
  guideToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  guideToggleText: {
    fontSize: 16,
    color: '#007BFF',
  },
  collapseHeader: {
    height: 0,
  },
  epgBody: {
    marginTop: 8,
  },
  programItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  programTime: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  programDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default PortDetail;
