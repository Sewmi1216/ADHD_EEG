import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import FontLoader from './src/components/FontLoader';
import Navigator from './src/navigation/Navigator';

const App: React.FC = () => {
  return (
    <FontLoader>
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
    </FontLoader>
  );
};

export default App;
