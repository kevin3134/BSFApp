import React from 'react';
import { Image, View } from 'react-native';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Colors from '../constants/Colors';
import HomeScreen from '../screens/HomeScreen';
import AudioBibleScreen from '../screens/AudioBibleScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyBSFScreen from '../screens/MyBSFScreen';

export default TabNavigator(
  {
    Home: {
      screen: HomeScreen
    },
    MyBSFScreen: {
      screen: MyBSFScreen
    },
    AudioBible: {
      screen: AudioBibleScreen
    },
    Settings: {
      screen: SettingsScreen
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let image;
        let showUpdateRedDot = false;
        switch (routeName) {
          case 'Home':
            image = focused ? require('../assets/images/Classes.On.png') : require('../assets/images/Classes.Off.png');
            break;
          case 'MyBSFScreen':
            image = focused ? require('../assets/images/mybsf.On.png') : require('../assets/images/mybsf.Off.png');
            break;
          case 'AudioBible':
            image = focused ? require('../assets/images/AudioBible.On.png') : require('../assets/images/AudioBible.Off.png');
            break;
          case 'Settings':
            image = focused ? require('../assets/images/MySettings.On.png') : require('../assets/images/MySettings.Off.png');
            showUpdateRedDot = navigation.state.params && navigation.state.params.hasAppUpdate;
            break;
        }
        return (
          <View>
            <Image
              style={{ width: 30, height: 30 }}
              source={image} />
            {
              showUpdateRedDot &&
              <View
                style={{
                  position: 'absolute',
                  backgroundColor: 'red',
                  height: 9,
                  width: 9,
                  borderRadius: 9,
                  right: 0,
                  top: 0
                }} />
            }
          </View>
        );
      },
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
    tabBarOptions: {
      activeTintColor: 'white',
      labelStyle: {
        fontSize: 11,
      },
      style: {
        backgroundColor: Colors.yellow
      }
    }
  }
);
