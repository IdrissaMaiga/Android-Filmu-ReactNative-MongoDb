import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../../../hooks/useAuthContext';
import { flagDevice, logout, updateField } from '../../../function/auth';
import { useNavigation, NavigationProp } from "@react-navigation/native";

interface User {
  name: string;
  email: string;
  phone?: string;
  referralCode?: string;
  devicesInfo: DeviceInfo[];
  token: string; // Token to identify current device
  password?: string;
}

interface DeviceInfo {
  id: string;
  deviceType?: string;
  os?: string;
  loginTime?: string;
  token?: string;
  isFlagged:boolean
}

interface FormData {
  name: string;
  countryCode: string;
  localPhoneNumber: string;
  password: string;
}

const Profile: React.FC = () => {
  const { user, setUser }: { user: User; setUser: (user: any) => void } = useAuth();
  const [isEditing, setIsEditing] = useState<Record<keyof FormData | 'phone', boolean>>({
    name: false,
    countryCode: false,
    localPhoneNumber: false,
    phone: false,
    password: false,
  });
 type RootStackParamList = {
    Connexion: undefined;
    Inscription: undefined;
    TabNavigator: undefined;
    Login: undefined; // Add Login
    Register: undefined; // Add Register if need
    Profile:undefined
  };

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    countryCode: '+223',
    localPhoneNumber: '',
    password: user?.password || '',
  });
  
  

  const handleEditToggle = (field: keyof FormData | 'phone') => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (value: string, name: keyof FormData) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (field: keyof FormData | 'phone') => {
    try {
      const fieldValue =
        field === 'phone'
          ? `${formData.countryCode} ${formData.localPhoneNumber}`
          : formData[field];
      const res = await updateField({ fieldName: field, fieldValue });
      if (res.success) setUser(res.response);
      else Alert.alert('Erreur', res.message || `Échec de la mise à jour de ${field}.`);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur imprévue est survenue.');
    } finally {
      setIsEditing((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleFlagDevice = async (deviceId: string) => {
     const res=await flagDevice({ deviceId });
     
    if (res.success){
      setUser(res.response.user)
      navigation.navigate("Login");
    }
    else{
      Alert.alert('Impossible de Marqué', `ID du périphérique : ${deviceId}`);
    }
    
  };
  const handleLogout = async () => {
    const res=await logout();
    
   if (res.success){
     
     navigation.navigate("Login");
   }
   else{
     Alert.alert(`${res.message}`);
   }
   
 };

  const formatDate = (isoDate: string | undefined) => {
    if (!isoDate) return 'Heure inconnue';
    const date = new Date(isoDate);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
     <View style={styles.headingContainer}>
        <Text style={styles.heading}>Mon Profil</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="sign-out" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.wrapper}>
      <View style={styles.section}>
        {/* Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nom :</Text>
          {isEditing.name ? (
            <TextInput
              style={[styles.input, { width: screenWidth * 0.8 }]}
              value={formData.name}
              onChangeText={(text) => handleInputChange(text, 'name')}
            />
          ) : (
            <Text style={styles.fieldValue}>{user.name || 'N/A'}</Text>
          )}
          <TouchableOpacity
            onPress={() =>
              isEditing.name ? handleSave('name') : handleEditToggle('name')
            }
            style={styles.iconButton}
          >
            <Icon name={isEditing.name ? 'check' : 'pencil'} size={16} color="black" />
          </TouchableOpacity>
        </View>

        {/* Password */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Mot de passe :</Text>
          {isEditing.password ? (
            <TextInput
              style={[styles.input, { width: screenWidth * 0.8 }]}
              value={formData.password}
              secureTextEntry
              onChangeText={(text) => handleInputChange(text, 'password')}
            />
          ) : (
            <Text style={styles.fieldValue}>{user.password}</Text>
          )}
          <TouchableOpacity
            onPress={() =>
              isEditing.password ? handleSave('password') : handleEditToggle('password')
            }
            style={styles.iconButton}
          >
            <Icon name={isEditing.password ? 'check' : 'pencil'} size={16} color="black" />
          </TouchableOpacity>
        </View>

        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email :</Text>
          <Text style={styles.fieldValue}>{user.email || 'N/A'}</Text>
        </View>

        {/* Phone */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Téléphone :</Text>
          {isEditing.phone ? (
            <View style={styles.phoneRow}>
              <TextInput
                style={[styles.input, { width: screenWidth * 0.25 }]}
                value={formData.countryCode}
                onChangeText={(text) => handleInputChange(text, 'countryCode')}
              />
              <TextInput
                style={[styles.input, { width: screenWidth * 0.5 }]}
                value={formData.localPhoneNumber}
                onChangeText={(text) => handleInputChange(text, 'localPhoneNumber')}
              />
            </View>
          ) : (
            <Text style={styles.fieldValue}>{user.phone || 'N/A'}</Text>
          )}
          <TouchableOpacity
            onPress={() =>
              isEditing.phone ? handleSave('phone') : handleEditToggle('phone')
            }
            style={styles.iconButton}
          >
            <Icon name={isEditing.phone ? 'check' : 'pencil'} size={16} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
      {/* Devices */}
      <Text style={styles.specialLabel}>Appareils :</Text>
      <ScrollView style={styles.devicesSection}>
      
        {user.devicesInfo.length === 0 ? (
          <Text style={styles.fieldValue}>Aucun appareil trouvé.</Text>
        ) : (
          user.devicesInfo.map((device) => (
           !device.isFlagged&& <View
              key={device.id}
              style={[
                styles.deviceRow,
                device.token === user.token && styles.currentDevice,
              ]}
            >
              <Text style={styles.deviceText}>
                Type: {device.deviceType || 'Appareil inconnu'}
              </Text>
              <Text style={styles.deviceText}>OS: {device.os || 'OS inconnu'}</Text>
              <Text style={styles.deviceText}>
                Dernière connexion: {formatDate(device.loginTime)}
              </Text>
              <TouchableOpacity
                onPress={() => handleFlagDevice(device.id)}
                style={styles.flagButton}
              >
                <Icon name="flag" size={16} color="red" />
              </TouchableOpacity>
            </View>
          ))
        )}
      
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F3F4F6', // Light modern gray background
    flex: 1,
  }, 
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5, // Reduced margin to bring elements closer
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left', // Align text to the left
    color: '#1E40AF', // Vibrant deep blue
    marginLeft: 10, // Add some left margin for spacing
  },
  logoutButton: {
    padding: 5, // Small padding for the icon button
    backgroundColor: '#e0e0e0',
    borderRadius: 50,
    justifyContent: 'center', // Center the icon inside the button
    alignItems: 'center',
  },
  section: {
    marginTop: 10,
  },
  fieldContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFFFFF', // White for card-like sections
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
    color: '#4B5563', // Muted gray for labels
  },
  specialLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A', // Custom color (can be changed to suit your design)
    backgroundColor: '#f0f8ff', // Light background color to make it pop
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 2,
    textAlign: 'center', // Centers the text
    elevation: 2, // Optional shadow effect for depth on Android
    shadowColor: '#000', // Shadow effect for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  }
  ,
  fieldValue: {
    fontSize: 15,
    color: '#1F2937', // Dark gray for text
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // Light gray for input border
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  iconButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#3B82F6', // Bright blue for action buttons
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devicesSection: {
    marginTop: 1,
    flexGrow: 0,
    backgroundColor: '#f0f8ff',
    maxHeight: 400,
    marginBottom: 30,
  },
  wrapper: {
    marginTop: 5,
    flexGrow: 0,
    marginBottom: 10,
    maxHeight: 400,
    minHeight:150
   
  },
  deviceRow: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Border for device rows
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentDevice: {
    backgroundColor: '#DCFCE7', // Light green for current device
    borderColor: '#22C55E', // Green border
  },
  deviceText: {
    fontSize: 14,
    color: '#374151', // Text color for device info
    marginBottom: 8,
  },
  flagButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#F87171', // Red for flagging
    padding: 8,
    borderRadius: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Profile;
