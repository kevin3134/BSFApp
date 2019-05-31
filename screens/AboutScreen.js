import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { EventRegister } from 'react-native-event-listeners';
import { Constants, Updates, WebBrowser } from 'expo';
import { Button } from 'react-native-elements';
import Colors from '../constants/Colors';
import { appVersion } from '../dataStorage/storage';
import { getCurrentUser } from '../utils/user';

export default class AboutScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('关于CBSF'),
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    windowWidth: Dimensions.get('window').width,
    appUpdateAvailable: false
  };

  listeners = [];

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    this.listeners.push(EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width, windowHeight: window.height });
    }));

    this.listeners.push(EventRegister.addEventListener('appUpdateAvailable', (hasAppUpdate) => {
      this.setState({ appUpdateAvailable: hasAppUpdate });
    }));

    getCurrentUser().checkForAppUpdateAsync(true);
  }

  componentWillUnmount() {
    this.listeners.forEach(listener => {
      EventRegister.removeEventListener(listener);
    });
  }

  render() {

    console.log("about screen!!!!!!!!!!!!!!!!!!");

    const version = `${appVersion} (SDK${Constants.manifest.sdkVersion})`;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{
          marginTop: 10,
          marginHorizontal: 10,
          borderColor: '#FFE8A1',
          backgroundColor: '#FFF2CC',
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 18, marginHorizontal: 20, marginVertical: 10, fontWeight: 'bold' }}>This CBSF app has been developed independently from BSF but with BSF’s permission to post lesson questions. CBSF does not collect any data on MyBSF.org tab from BSF members but does provide a link to BSF’s official website for members who wish to gain access to all their lesson materials and supplementary resources.</Text>

          <View style={{ flexDirection: 'row', marginVertical: 10 }}>
            <TouchableOpacity onPress={() => {
              WebBrowser.openBrowserAsync('http://www.mycbsf.org/tou.html');
            }}>
              <Text style={{ fontSize: 16, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('合约条款')}</Text>
            </TouchableOpacity>
            <View style={{ width: 10 }} />
            <TouchableOpacity onPress={() => {
              WebBrowser.openBrowserAsync('http://www.mycbsf.org/privacy.html');
            }}>
              <Text style={{ fontSize: 16, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('隐私条款')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{
          marginTop: 10,
          marginHorizontal: 10,
          borderColor: '#FFE8A1',
          backgroundColor: '#FFF2CC',
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 18, marginHorizontal: 20, marginTop: 10, fontWeight: 'bold' }}>{getI18nText('版本')}</Text>
          <Text style={{ fontSize: 18, marginHorizontal: 20, fontWeight: 'bold' }}>{version}</Text>
          <View>
            <Button
              icon={{ name: "refresh", size: 20, color: "white" }}
              title="Reload"
              buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
              onPress={() => Updates.reload()}
            />
            {
              this.state.appUpdateAvailable &&
              <View
                style={{
                  position: 'absolute',
                  backgroundColor: 'red',
                  height: 9,
                  width: 9,
                  borderRadius: 9,
                  right: 20,
                  top: 15
                }} />
            }
          </View>
        </View>
      </ScrollView>
    );
  }
}
