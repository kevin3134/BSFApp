import Colors from '../constants/Colors.js';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';

export const headerProperty = {
  headerStyle: {
    backgroundColor: Colors.yellow,
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 0
  },
  headerTitleStyle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700'
  },
  headerTintColor: 'white'
};

export default createAppContainer(createSwitchNavigator({
  // You could add another route here for authentication.
  // Read more at https://reactnavigation.org/docs/en/auth-flow.html
  Main: MainTabNavigator,
}));