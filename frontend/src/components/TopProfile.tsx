import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import globalStyles from '../../globalStyles';

interface TopProfileProps {
  imageSource: any;
  onPress: () => void; // Add an onPress prop for navigation
}

const TopProfile: React.FC<TopProfileProps> = ({ imageSource, onPress }) => {
  return (
    <TouchableOpacity style={[globalStyles.topprofile, { marginRight: 10 }]} onPress={onPress}>
      <Image source={imageSource} style={globalStyles.topprofileImage} />
    </TouchableOpacity>
  );
};

export default TopProfile;
