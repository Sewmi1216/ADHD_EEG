import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import globalStyles from '../../globalStyles';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/Navigator';
import { Audio } from 'expo-av';

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '3',
    strokeWidth: '5',
    stroke: '#3F51B5',
  },
  propsForBackgroundLines: {
    strokeDasharray: '', // Dotted lines
    stroke: '#999999',
  },
};


type AttentionLevel = 'High' | 'Mid' | 'Low';
interface AttentionDataPoint {
  time: string;
  level: AttentionLevel;
  value: number; // Numeric representation of the level (0: Low, 1: Mid, 2: High)
  window: number;
}

type Props = {
  route: RouteProp<RootStackParamList, 'Profile'>;
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

const ProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { name, borderColor, child_id, isEnabled } = route.params;
  const [data, setData] = useState<AttentionDataPoint[]>([]);
  const [currentLevel, setCurrentLevel] = useState<AttentionLevel>('Mid');
  const [prevLevel, setPrevLevel] = useState<AttentionLevel>('Mid');
  const ws = useRef<WebSocket | null>(null);
  const soundRef = useRef<any>(null);
  const maxDataPoints = 60;

  // Convert attention level to numeric value for the chart
  const levelToValue = (level: AttentionLevel): number => {
    switch (level) {
      case 'Low': return 0;
      case 'Mid': return 1;
      case 'High': return 2;
      default: return 1;
    }
  };

 // Import sound (you'll need to install expo-av)
 useEffect(() => {
  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alert1.mp3')
      );
      soundRef.current = sound;
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  loadSound();

  return () => {
    if (soundRef.current) {
      soundRef.current.unloadAsync();
    }
  };
}, []);

// WebSocket connection with sound alert
useEffect(() => {
  ws.current = new WebSocket('ws://192.168.50.250:8765');
  
  ws.current.onopen = () => {
    console.log('WebSocket connected');
    const initPayload = JSON.stringify({ child_id });
    ws.current?.send(initPayload);
  };

  ws.current.onmessage = async (e) => {
    try {
      const response = JSON.parse(e.data);
      if (response.attention_level) {
        const newPoint: AttentionDataPoint = {
          time: response.time || `${response.window * 5 - 5}-${response.window * 5}s`,
          level: response.attention_level,
          value: levelToValue(response.attention_level),
          window: response.window
        };
        
        setData(prev => {
          const newData = [...prev, newPoint];
          return newData.slice(-maxDataPoints);
        });
        
        if (response.attention_level === 'Low' && prevLevel !== 'Low' && isEnabled && soundRef.current) {
        try {
          await soundRef.current.replayAsync();
        } catch (error) {
          console.error('Error playing sound:', error);
        }
      }
        
        setPrevLevel(currentLevel);
        setCurrentLevel(response.attention_level);
      }
    } catch (error) {
      console.error('Error parsing WebSocket data:', error);
    }
  };

    
    ws.current.onerror = (e) => {
      console.error('WebSocket error:', e);
    };
    
    ws.current.onclose = (e) => {
      console.log('WebSocket closed:', e.code, e.reason);
    };
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isEnabled]);

  // Style functions
  const getLevelColor = (level: AttentionLevel): string => {
    const colors = { High: '#4CAF50', Mid: '#FFC107', Low: '#F44336' };
    return colors[level];
  };

  // Prepare data for the chart
  const screenWidth = Dimensions.get('window').width;

    // Prepare data for the chart
    const chartData = {
      labels: data.map(point => `${(point.window - 1) * 5}s`),
      // labels: data.map(point => `${point.window * 5}s`),

      datasets: [
        {
          data: data.length > 0 ? data.map(point => point.value) : [1], // Default to Mid if no data
          color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`, // Line color
          strokeWidth: 2
        }
      ],
      // legend: ["Attention Level (0:Low, 1:Mid, 2:High)"]
    };
  

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.innerContainer}>
        {/* Header */}
        <View style={globalStyles.topContainer}>
          <View style={globalStyles.headerBackContainer}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={36} color="#000"/>
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
            <View style={[
              globalStyles.statusBadge, 
              { backgroundColor: getLevelColor(currentLevel) }
            ]}>
              <Text style={globalStyles.statusText}>{currentLevel}</Text>
            </View>
          </View>
          
          {/* Chart */}
          <View style={globalStyles.chartWrapper}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 8 }}>
            Attention Level Over Time
          </Text>
          <LineChart
        data={chartData}
        width={screenWidth - 40}
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
          if (num === 0) return 'Low';
          if (num === 1) return 'Mid';
          if (num === 2) return 'High';
          return '';
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      
             {/* X-axis label */}
            <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 12 }}>
              Time (seconds)
            </Text>
            <Text
              style={{
                position: 'absolute',
                left: -10,
                top: 100,
                transform: [{ rotate: '-90deg' }],
                fontSize: 12,
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