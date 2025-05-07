import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import globalStyles from "../../globalStyles";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/Navigator";
import { Audio } from "expo-av";
import { useWebSocket } from "./WebSocketContext";

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: () => "#1665d0",
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 10,
  },
  propsForDots: {
    r: "3",
    strokeWidth: "5",
    stroke: "#3F51B5",
  },
  propsForBackgroundLines: {
    strokeDasharray: "",
    stroke: "#999999",
  },
  strokeWidth: 3,
};

type AttentionLevel = "High" | "Mid" | "Low";
interface AttentionDataPoint {
  time: string;
  level: AttentionLevel;
  value: number;
  window: number;
}

type Props = {
  route: RouteProp<RootStackParamList, "Profile">;
  navigation: StackNavigationProp<RootStackParamList, "Profile">;
};

const ProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { name, borderColor, child_id, isEnabled } = route.params;
  const { sendMessage, addMessageListener } = useWebSocket();
  const [data, setData] = useState<AttentionDataPoint[]>([]);
  const [currentLevel, setCurrentLevel] = useState<AttentionLevel>("Mid");
  const [prevLevel, setPrevLevel] = useState<AttentionLevel>("Mid");
  const soundRef = useRef<any>(null);
  const maxDataPoints = 120;

  const levelToValue = (level: AttentionLevel): number => {
    switch (level) {
      case "Low":
        return 0;
      case "Mid":
        return 1;
      case "High":
        return 2;
      default:
        return 1;
    }
  };

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/alert1.mp3")
        );
        soundRef.current = sound;
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    // Start stream
    sendMessage({
      type: "start_stream",
      child_id: child_id,
    });

    // Listen to messages
    const removeListener = addMessageListener((response: any) => {
      if (response.type === "profile_data") {
        const newPoint: AttentionDataPoint = {
          time:
            response.time ||
            `${(response.window - 1) * 5}-${response.window * 5}s`,
          level: response.attention_level,
          value: levelToValue(response.attention_level),
          window: response.window,
        };

        setPrevLevel((prev) => currentLevel);
        setCurrentLevel(response.attention_level);
        setData((prev) => {
          const updated = [...prev, newPoint];
          console.log("updates: ", updated);
          return updated.slice(-maxDataPoints);
        });
      }
    });

    return () => {
      sendMessage({ type: "stop_stream" });
      removeListener(); // Remove listener when screen unmounts
    };
  }, [child_id]);

  useEffect(() => {
    const playAlertSound = async () => {
      if (
        currentLevel === "Low" &&
        prevLevel !== "Low" &&
        isEnabled &&
        soundRef.current
      ) {
        try {
          await soundRef.current.replayAsync();
          console.log("Alert sound played - attention level changed to Low");
        } catch (error) {
          console.error("Error playing sound:", error);
        }
      }
    };

    playAlertSound();
  }, [currentLevel, prevLevel, isEnabled]);

  const getLevelColor = (level: AttentionLevel): string => {
    const colors = { High: "#4CAF50", Mid: "#FFC107", Low: "#F44336" };
    return colors[level];
  };

  const screenWidth = Dimensions.get("window").width;

  const chartData = {
    labels: data.map((point) => `${(point.window - 1) * 5}s`),
    datasets: [
      {
        data: data.length > 0 ? data.map((point) => point.value) : [1],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.innerContainer}>
        {/* Header */}
        <View style={globalStyles.topContainer}>
          <View style={globalStyles.headerBackContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={36} color="#000" />
            </TouchableOpacity>
            <Text style={globalStyles.topContainerTitle} numberOfLines={1}>
              {name}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={globalStyles.middleContainer}>
          <Text style={globalStyles.middleContainerTitle}>Class A</Text>

          {/* Current Level Indicator */}
          <View style={globalStyles.statusContainer}>
            <Text style={globalStyles.statusLabel}>Current State:</Text>
            <View
              style={[
                globalStyles.statusBadge,
                { backgroundColor: getLevelColor(currentLevel) },
              ]}
            >
              <Text style={globalStyles.statusText}>{currentLevel}</Text>
            </View>
          </View>

          {/* Chart */}
          <View style={globalStyles.chartWrapper}>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              Attention Level Over Time
            </Text>
            <LineChart
              data={chartData}
              width={screenWidth - 30}
              height={260}
              chartConfig={chartConfig}
              bezier
              fromZero
              withShadow={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              segments={2}
              yLabelsOffset={12}
              xLabelsOffset={-10}
              formatYLabel={(value) => {
                const num = Number(value);
                if (num === 0) return "Low";
                if (num === 1) return "Mid";
                if (num === 2) return "High";
                return "";
              }}
              formatXLabel={(label) => {
                const num = parseInt(label);
                return num % 10 === 0 ? label : "";
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
            <Text style={{ textAlign: "center", marginTop: 10, fontSize: 10 }}>
              Time (seconds)
            </Text>
            <Text
              style={{
                position: "absolute",
                left: -10,
                top: 100,
                transform: [{ rotate: "-90deg" }],
                fontSize: 10,
              }}
            >
              Attention
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
