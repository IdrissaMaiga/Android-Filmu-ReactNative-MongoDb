import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { getAgents } from "../../../function/getAgents";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  TabNavigator: undefined;
};

interface Agent {
  id: string;
  phone?: string;
  email?: string;
  address?: string;
  facebook?: string;
  telegram?: string;
  whatsapp?: string;
}

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    setLoading(true);
    async function fetchAgents() {
      try {
        const data = await getAgents();
        if (data.success) {
          setAgents(data.response);
        } else {
          Alert.alert("Aucun agent trouvé", data.message || "Veuillez réessayer.");
        }
      } catch (error) {
        Alert.alert("Erreur", "Une erreur inattendue s'est produite. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      //console.log("URL Support Status:", supported, "URL:", url); // Debugging line
      if (supported) {
        await Linking.openURL(url);
      } else {
        // If the app-specific URL scheme isn't supported, open in a browser
        const webUrl = `${url}`;
       // console.log("Opening in browser:", webUrl); // Debugging line
        await Linking.openURL(webUrl);
      }
    } catch (err) {
      console.error("Error opening link:", err);  // Debugging line
      Alert.alert("Erreur", "Une erreur est survenue lors de l'ouverture du lien.");
    }
  };
  
  const handlePhonePress = (phone: string) => {
    openLink(`tel:${phone}`);
  };
  
  const handleEmailPress = (email: string) => {
    openLink(`mailto:${email}`);
  };
  

  const renderAgent = ({ item }: { item: Agent }) => (
    <View style={styles.agentCard}>
      {item.phone && (
        <View style={styles.agentField}>
          <Text style={styles.agentLabel}>📞 Téléphone:</Text>
          <Text onPress={() => handlePhonePress(`${item.phone}`)} style={styles.linkText}>
            {item.phone}
          </Text>
        </View>
      )}
      {item.email && (
        <View style={styles.agentField}>
          <Text style={styles.agentLabel}>📧 Email:</Text>
          <Text onPress={() => handleEmailPress(`${item.email}`)} style={styles.linkText}>
            {item.email}
          </Text>
        </View>
      )}
      {item.address && (
        <View style={styles.agentField}>
          <Text style={styles.agentLabel}>🏠 Adresse:</Text>
          <Text style={styles.agentText}>{item.address}</Text>
        </View>
      )}
      <View style={styles.socialMediaContainer}>
        {item.facebook && (
          <TouchableOpacity onPress={() => openLink(`${item.facebook}`)}>
            <Icon name="logo-facebook" size={24} color="#3b5998" style={styles.socialIcon} />
          </TouchableOpacity>
        )}
        {item.telegram && (
          <TouchableOpacity onPress={() => openLink(`${item.telegram}`)}>
            <Icon name="paper-plane-outline" size={24} color="#0088cc" style={styles.socialIcon} />
          </TouchableOpacity>
        )}
        {item.whatsapp && (
          <TouchableOpacity onPress={() => openLink(`${item.whatsapp}`)}>
            <Icon name="logo-whatsapp" size={24} color="#25D366" style={styles.socialIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agents Disponibles</Text>
      <TouchableOpacity
        style={[styles.button, loading ? styles.buttonDisabled : styles.buttonActive]}
        onPress={() => navigation.navigate("Login")}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Aller à la Connexion</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={styles.loader} />
      ) : agents.length === 0 ? (
        <Text style={styles.noAgentsText}>Aucun agent disponible.</Text>
      ) : (
        <FlatList
          data={agents}
          keyExtractor={(item) => item.id}
          renderItem={renderAgent}
          contentContainerStyle={styles.agentList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F4F6",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
  },
  loader: {
    marginTop: 20,
  },
  noAgentsText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 18,
    color: "#DC2626",
  },
  agentList: {
    paddingBottom: 20,
  },
  agentCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  agentField: {
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center align vertically
    marginBottom: 8,
  },
  agentLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8, // Add spacing between label and value
  },
  agentText: {
    fontSize: 16,
    color: "#374151",
  },
  linkText: {
    fontSize: 16,
    color: "#1D4ED8",
    textDecorationLine: "underline",
  },

  socialMediaContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  socialIcon: {
    marginHorizontal: 8,
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonActive: {
    backgroundColor: "#1E3A8A",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
