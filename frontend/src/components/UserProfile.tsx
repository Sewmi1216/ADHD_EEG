import React from 'react';
import { TouchableOpacity, Image, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import globalStyles from '../../globalStyles';
import { RootStackParamList } from '../navigation/Navigator';

interface UserProfileProps {
  imageSource: any;
  name: string;
  borderColor: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const UserProfile: React.FC<UserProfileProps> = ({ imageSource, name, borderColor }) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <TouchableOpacity
      style={[globalStyles.userProfile, { marginBottom: 10 }]}
      onPress={() => navigation.navigate('Profile', { name, borderColor })}
    >
      <View
        style={[
          globalStyles.userPictureContainer,
          { borderColor: borderColor, borderWidth: 3, borderRadius: 35 },
        ]}
      >
        <Image source={imageSource} style={globalStyles.userprofileImage} />
      </View>
      <Text numberOfLines={1} ellipsizeMode='clip' style={{...globalStyles.userName, maxWidth: '75%'}}>{name}</Text>
    </TouchableOpacity>
  );
};

export default UserProfile;
