import React from 'react';
import { View, Switch } from 'react-native';
import globalStyles from '../../globalStyles';

interface ToggleComponentProps {
  isEnabled: boolean; // Current state of the toggle
  onToggle: () => void; // Function to handle toggle changes
}

const ToggleComponent: React.FC<ToggleComponentProps> = ({ isEnabled, onToggle }) => {
  return (
    <View>
      {/* Switch component */}
      <Switch
        style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }} // Adjust scale
        value={isEnabled} // Bind switch value to prop
        onValueChange={onToggle} // Call handler on change
        trackColor={{ false: '#D3D3D3', true: '#000000' }} // Customize track colors
        thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'} // Customize thumb colors
        ios_backgroundColor="#3e3e3e" // Fallback for iOS background
      />
    </View>
  );
};

export default ToggleComponent;
