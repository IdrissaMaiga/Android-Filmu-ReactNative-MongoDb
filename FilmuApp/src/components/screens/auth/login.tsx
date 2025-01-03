import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useAuth } from "../../../hooks/useAuthContext";
import { logo } from "../../../constants/images";
import { login } from "../../../function/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [motDePasse, setMotDePasse] = useState<string>("");
  const [chargement, setChargement] = useState<boolean>(false);
  const [isButtonsVisible, setIsButtonsVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false); // New state for password visibility

  type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    TabNavigator: undefined;
  };

  const { setUser, user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsButtonsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          navigation.navigate("TabNavigator");
        }
      } catch (error) {
        console.error("Error checking token", error);
      }
    };

    checkToken();
  }, []);

  const gererConnexion = async () => {
    if (!email || !motDePasse) {
      Alert.alert("Erreur de validation", "Veuillez remplir les deux champs.");
      return;
    }

    setChargement(true);
    try {
      const data = await login({ email, password: motDePasse });
      if (data.success) {
        setUser(data.response);
        navigation.navigate("TabNavigator");
      } else {
        Alert.alert("Échec de connexion", data.message || "Veuillez réessayer.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <Image source={{ uri: logo }} style={styles.logo} />

      {isButtonsVisible && (
        <>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Mot de passe"
              value={motDePasse}
              onChangeText={setMotDePasse}
              style={styles.passwordInput}
              secureTextEntry={!showPassword} // Toggle visibility
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleButtonText}>
                {showPassword ? "Cacher" : "Voir"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={gererConnexion}
            disabled={chargement}
            style={[styles.button, chargement ? styles.buttonDisabled : styles.buttonActive]}
          >
            {chargement ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.registerButton}
          >
            <Text style={styles.registerText}>S'inscrire</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logo: {
    width: 206,
    height: 206,
    borderRadius: 100,
    marginBottom: 24,
    resizeMode: "contain",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
  },
  toggleButtonText: {
    color: "#1E3A8A",
    fontWeight: "600",
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  registerButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  registerText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
  },
});
