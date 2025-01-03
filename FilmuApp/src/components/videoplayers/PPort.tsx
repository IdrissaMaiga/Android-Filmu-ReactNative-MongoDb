import React, { useState, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';

interface VideoPlayerProps {
  sources: string[]; // Array of stream URLs
}

const PPort: React.FC<VideoPlayerProps> = ({ sources }) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0); // Track the current source index
  const [isError, setIsError] = useState(false); // To track if there is an error

  const videoDimensions = {
    width: isFullscreen ? width : isLandscape ? width : height * (16 / 9),
    height: isFullscreen ? height : isLandscape ? height : width * (9 / 16),
  };

  // Handle orientation changes for fullscreen
  const handleFullscreen = (fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
    if (fullscreen) {
      Orientation.lockToLandscape(); // Lock orientation to landscape for fullscreen
    } else {
      Orientation.unlockAllOrientations(); // Allow default orientation when exiting fullscreen
    }
  };

  // Handle the error and fallback to the next source
  const handleError = () => {
    if (currentSourceIndex < sources.length - 1) {
      setCurrentSourceIndex(currentSourceIndex + 1); // Try the next source
      setIsError(true); // Indicate that there was an error and fallback is happening
    } else {
      console.log('All sources failed');
    }
  };

  useEffect(() => {
    return () => {
      // Unlock orientations when the component is unmounted
      Orientation.unlockAllOrientations();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: sources[currentSourceIndex] }} // Use the current source
        style={[styles.video, { width: videoDimensions.width, height: videoDimensions.height }]}
        resizeMode="contain"
        controls
        paused={false}
        fullscreen={isFullscreen} // Enable fullscreen
        fullscreenOrientation="landscape" // Set fullscreen orientation
        onFullscreenPlayerWillPresent={() => handleFullscreen(true)} // Called when entering fullscreen
        onFullscreenPlayerDidDismiss={() => handleFullscreen(false)} // Called when exiting fullscreen
        onBuffer={(e) => console.log('Buffering...', e)}
        onError={handleError} // Handle error and fallback to next source
        onLoad={() => {
          if (isError) {
            setIsError(false); // Reset error state when a source is successfully loaded
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    backgroundColor: 'black',
  },
});

export default PPort;
