import React from 'react';
import { Image, Text } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import Colors from '../constants/Colors';
import HomeScreen from '../screens/HomeScreen';
import AudioBibleScreen from '../screens/AudioBibleScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyBSFScreen from '../screens/MyBSFScreen';
import { getI18nText } from '../utils/I18n';
import LessonScreen from '../screens/LessonScreen';
import BibleScreen from '../screens/BibleScreen';
import SetPhoneScreen from '../screens/SetPhoneScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AttendanceHomeScreen from '../screens/AttendanceHomeScreen';
import AttendanceGroupScreen from '../screens/AttendanceGroupScreen';
import AttendanceLessonScreen from '../screens/AttendanceLessonScreen';
import AttendanceSelectLeaderScreen from '../screens/AttendanceSelectLeaderScreen';
import LectureMaterialScreen from '../screens/LectureMaterialScreen';
import GlobalChatScreen from '../screens/GlobalChatScreen';
import AnswerManageScreen from '../screens/AnswerManageScreen';
import BibleSelectScreen from '../screens/BibleSelectScreen';
import DiscussionScreen from '../screens/DiscussionScreen';

const HomeStack = createStackNavigator({
  Home: HomeScreen,
  Lesson: LessonScreen,
  Bible: BibleScreen,
  BibleSelect: BibleSelectScreen,
  LectureMaterial: LectureMaterialScreen,
  Discussion: DiscussionScreen,
});

const MyBSFStack = createStackNavigator({
  MyBSF: MyBSFScreen,
});

const AudioBibleStack = createStackNavigator({
  AudioBible: AudioBibleScreen,
});

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
  AnswerManage: AnswerManageScreen,
  SetPhone: SetPhoneScreen,
  Attendance: AttendanceScreen,
  AttendanceHome: AttendanceHomeScreen,
  AttendanceGroup: AttendanceGroupScreen,
  AttendanceLesson: AttendanceLessonScreen,
  AttendanceSelectLeader: AttendanceSelectLeaderScreen,
  LectureMaterial: LectureMaterialScreen,
  GlobalChat: GlobalChatScreen,
  BibleSelect: BibleSelectScreen,
});

function getTabBarLabel(route) {
  switch (route) {
    case 'HomeStack':
      return getI18nText('BSF课程');
    case 'MyBSFStack':
      return getI18nText('MyBSF.org');
    case 'AudioBibleStack':
      return getI18nText('有声圣经');
    case 'SettingsStack':
      return getI18nText('我的设置');
  }
  return '';
};

export default createBottomTabNavigator({
  HomeStack,
  MyBSFStack,
  AudioBibleStack,
  SettingsStack,
},
  {
    defaultNavigationOptions: ({ navigation }) => {
      return {
        tabBarVisible: navigation.state.index === 0,
        tabBarLabel: navigation.state.params && navigation.state.params.tabLabel ? navigation.state.params.tabLabel : getTabBarLabel(navigation.state.routeName),
        tabBarIcon: ({ focused, horizontal, tintColor }) => {
          const { routeName } = navigation.state;
          let image;
          switch (routeName) {
            case 'HomeStack':
              image = focused ? require('../assets/images/Classes.On.png') : require('../assets/images/Classes.Off.png');
              break;
            case 'MyBSFStack':
              image = focused ? require('../assets/images/mybsf.On.png') : require('../assets/images/mybsf.Off.png');
              break;
            case 'AudioBibleStack':
              image = focused ? require('../assets/images/AudioBible.On.png') : require('../assets/images/AudioBible.Off.png');
              break;
            case 'SettingsStack':
              image = focused ? require('../assets/images/MySettings.On.png') : require('../assets/images/MySettings.Off.png');
              break;
          }
          return (
            <Image
              style={{ width: 30, height: 30 }}
              source={image} />
          );
        },
      }
    },
    tabBarOptions: {
      activeTintColor: 'white',
      labelStyle: {
        fontSize: 11,
      },
      style: {
        backgroundColor: Colors.yellow
      }
    },
  }
);
