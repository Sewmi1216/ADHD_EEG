import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/Navigator";
import { useWebSocket } from "./WebSocketContext";
import globalStyles from "../../globalStyles";
import ToggleComponent from "../components/ToggleComponent";
import TopProfile from "../components/TopProfile";
import UserProfile from "../components/UserProfile";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Audio } from "expo-av";

import {
  image01,
  image02,
  image03,
  image04,
  image05,
  image06,
  image07,
  image08,
  image09,
  image10,
} from "../../assets/images";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const users = [
  { child_id: 1, image: image01, name: "Nethuli Sahasna" },
  { child_id: 2, image: image06, name: "Inuli Nihinsa" },
  { child_id: 3, image: image07, name: "Shehan Tharusha" },
  { child_id: 4, image: image02, name: "Sarala Nethmini" },
  { child_id: 5, image: image08, name: "Amanda Dulsara" },
  { child_id: 6, image: image09, name: "Randima Perera" },
  { child_id: 7, image: image10, name: "Senil Kumarasiri" },
  { child_id: 8, image: image03, name: "Ovindu Pathirana" },
  { child_id: 9, image: image04, name: "Ama Fernando" },
  { child_id: 10, image: image05, name: "Nimeth Nimsara" },
];

// Helper function to map attention level to color
const getLevelColor = (level: string) => {
  switch (level) {
    case "Low":
      return "red";
    case "High":
      return "green";
    case "Mid":
      return "#FFBF00";
    default:
      return "gray";
  }
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((prev) => !prev);

  // State to hold real-time attention levels
  const [attentionStates, setAttentionStates] = useState<Map<number, string>>(
    new Map()
  );
  const { sendMessage, addMessageListener } = useWebSocket();

  useEffect(() => {
    sendMessage({ type: "dashboard" });

    const playAlert = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/alert1.mp3")
      );
      await sound.playAsync();
    };

    const removeListener = addMessageListener((msg: any) => {
      if (msg.type === "dashboard_update") {
        setAttentionStates((prev) => {
          const updated = new Map(prev);
          updated.set(msg.child_id, msg.attention_level);

          // If the toggle is on and the new message indicates Low attention, play the sound
          if (isEnabled && msg.attention_level === "Low") {
            playAlert();
          }

          return updated;
        });
      }
    });

    return removeListener;
  }, [isEnabled]);

  // Filter profiles with lowest attention (Low)
  const topProfiles = users.filter(
    (user) => attentionStates.get(user.child_id) === "Low"
  );

  return (
    <SafeAreaView style={{ flex: 1, gap: 25 }}>
      <View style={globalStyles.container}>
        <View style={globalStyles.innerContainer}>
          <View style={globalStyles.topContainer}>
            <Text style={globalStyles.topContainerTitle}>DASHBOARD</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: "-2.5%",
              }}
            >
              {isEnabled ? (
                <Icon
                  name="volume-up"
                  size={24}
                  color="#000"
                  style={{ marginRight: "2%" }}
                />
              ) : (
                <Icon
                  name="volume-off"
                  size={24}
                  color="#000"
                  style={{ marginRight: "2%" }}
                />
              )}
              <ToggleComponent isEnabled={isEnabled} onToggle={toggleSwitch} />
            </View>
          </View>

          {/* Class A - Low Attention */}
          <View style={globalStyles.middleContainer}>
            <Text style={globalStyles.middleContainerTitle}>Class A</Text>
            <Text style={globalStyles.innerMiddleTitle}>
              Children with Lowest Attention
            </Text>
            <ScrollView
              style={globalStyles.innerMiddleWrapper}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {topProfiles.map((profile, index) => (
                <TopProfile
                  key={index}
                  imageSource={profile.image}
                  onPress={() => {
                    // Send message to backend to start streaming for selected child
                    sendMessage({
                      type: "start_stream",
                      child_id: profile.child_id,
                    });

                    navigation.navigate("Profile", {
                      name: profile.name,
                      borderColor: getLevelColor(
                        attentionStates.get(profile.child_id) || ""
                      ),
                      child_id: profile.child_id,
                      isEnabled: isEnabled, // Pass the toggle state
                    });
                  }}
                />
              ))}
            </ScrollView>
          </View>

          {/* All User Profiles */}
          <View style={globalStyles.bottomContainer}>
            <Text style={globalStyles.innerMiddleTitle}>User Profiles</Text>
            <ScrollView
              style={globalStyles.innerBottomWrapper}
              showsVerticalScrollIndicator={false}
            >
              {users.map((user, index) => (
                <UserProfile
                  key={index}
                  imageSource={user.image}
                  name={user.name}
                  borderColor={getLevelColor(
                    attentionStates.get(user.child_id) || ""
                  )}
                  child_id={user.child_id}
                  isEnabled={isEnabled}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
