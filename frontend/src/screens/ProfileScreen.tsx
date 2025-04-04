import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/Navigator';
import globalStyles from '../../globalStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define types for route and navigation
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface ProfileScreenProps {
  route: ProfileScreenRouteProp;
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ route, navigation }) => {
  const { name, borderColor } = route.params; // Extract parameters including borderColor

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        <View style={globalStyles.innerContainer}>
          <View style={globalStyles.topContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: '-1%', gap: '3%'}}>
              {/* Back Button */}
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={36} color="#000"/>
              </TouchableOpacity>
              {/* Name */}
              <Text style={{...globalStyles.topContainerTitle, maxWidth: '85%'}} numberOfLines={1} ellipsizeMode='clip'>{name}</Text>
            </View>
            {/* Circle Icon with Dynamic Color */}
            <Icon name="circle" size={24} color={borderColor} />
          </View>
          <View style={globalStyles.middleContainer}>
            <Text style={globalStyles.middleContainerTitle}>Class A</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
