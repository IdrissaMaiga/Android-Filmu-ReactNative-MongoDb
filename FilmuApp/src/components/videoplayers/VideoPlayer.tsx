import React, { useState, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';

interface VideoPlayerProps {
  source: { uri: string };
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ source }) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    return () => {
      // Unlock orientations when the component is unmounted
      Orientation.unlockAllOrientations();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Video
        source={source}
        style={[styles.video, { width: videoDimensions.width, height: videoDimensions.height }]}
        resizeMode="contain"
        controls
        paused={false}
        fullscreen={isFullscreen} // Enable fullscreen
        fullscreenOrientation="landscape" // Set fullscreen orientation
        onFullscreenPlayerWillPresent={() => handleFullscreen(true)} // Called when entering fullscreen
        onFullscreenPlayerDidDismiss={() => handleFullscreen(false)} // Called when exiting fullscreen
        onBuffer={(e) => console.log('Buffering...', e)}
        onError={(e) => console.log('Error: ', e)}
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

export default VideoPlayer;
