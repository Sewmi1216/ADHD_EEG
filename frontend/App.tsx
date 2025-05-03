import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import FontLoader from "./src/components/FontLoader";
import { WebSocketProvider } from "./src/screens/WebSocketContext";
import Navigator from "./src/navigation/Navigator";

const App: React.FC = () => {
  return (
    <FontLoader>
      <WebSocketProvider>
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </WebSocketProvider>
    </FontLoader>
  );
};

export default App;
