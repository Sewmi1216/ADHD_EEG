import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/Navigator';
import globalStyles from '../../globalStyles';
import ToggleComponent from '../components/ToggleComponent';
import TopProfile from '../components/TopProfile';
import UserProfile from '../components/UserProfile';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { image01, image02, image03, image04, image05, image06, image07, image08, image09, image10 } from '../../assets/images';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// Define the user data with images, names, and border colors
const users = [
  { child_id: 1, image: image01, name: 'Nethuli Sahasna', borderColor: 'red' },
  { child_id: 2, image: image06, name: 'Inuli Nihinsa', borderColor: 'green' },
  { child_id: 3, image: image07, name: 'Shehan Tharusha', borderColor: '#FFBF00' },
  { child_id: 4, image: image02, name: 'Sarala Nethmini', borderColor: 'red' },
  { child_id: 5, image: image08, name: 'Amanda Dulsara', borderColor: 'green' },
  { child_id: 6, image: image09, name: 'Randima Perera', borderColor: 'green' },
  { child_id: 7, image: image10, name: 'Senil Kumarasiri', borderColor: '#FFBF00' },
  { child_id: 8, image: image03, name: 'Ovindu Pathirana', borderColor: 'green' },
  { child_id: 9, image: image04, name: 'Ama Fernando', borderColor: 'red' },
  { child_id: 10, image: image05, name: 'Nimeth Nimsara', borderColor: 'red' },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // Filter users with a red border color for the TopProfile section
  const topProfiles = users.filter(user => user.borderColor === 'red');

  const [isEnabled, setIsEnabled] = useState(false); // State for toggle
  
    // Function to handle toggle state
  const toggleSwitch = () => setIsEnabled((prevState: any) => !prevState);

  return (
    <SafeAreaView style={{ flex: 1, gap: 25 }}>
      <View style={globalStyles.container}>
        <View style={globalStyles.innerContainer}>
          <View style={globalStyles.topContainer}>
            <Text style={globalStyles.topContainerTitle}>DASHBOARD</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: '-2.5%'}}>
                  {/* Dynamic Icon */}
              {isEnabled ? (
                <Icon name="volume-up" size={24} color="#000" style={{ marginRight: '2%' }} />
              ) : (
                <Icon name="volume-off" size={24} color="#000" style={{ marginRight: '2%' }} />
              )}
              {/* Pass the state and handler to ToggleComponent */}
              <ToggleComponent isEnabled={isEnabled} onToggle={toggleSwitch} />
            </View>
          </View>
          <View style={globalStyles.middleContainer}>
            <Text style={globalStyles.middleContainerTitle}>Class A</Text>
            <Text style={globalStyles.innerMiddleTitle}>Children with Lowest Attention</Text>
            <ScrollView
              style={globalStyles.innerMiddleWrapper}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {topProfiles.map((profile, index) => (
                <TopProfile
                  key={index}
                  imageSource={profile.image}
                  onPress={() =>
                    navigation.navigate('Profile', {
                      name: profile.name, 
                      borderColor: profile.borderColor, // Pass borderColor
                      child_id: profile.child_id,
                      isEnabled: isEnabled,
                    })
                  } 
                />
              ))}
            </ScrollView>
          </View>
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
                  borderColor={user.borderColor}
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