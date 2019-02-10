import React from 'react';
import { ScrollView, View, Alert, Text, ActivityIndicator, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { FontAwesome } from '@expo/vector-icons';
import { CheckBox, Button } from 'react-native-elements';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { getCurrentUser } from '../utils/user';
import Colors from '../constants/Colors';
import DatePicker from 'react-native-datepicker';
import { EventRegister } from 'react-native-event-listeners';

export default class AttendanceLessonScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let title = `${navigation.state.params.lessonTitle} ${navigation.state.params.group.id}组`;
    if (navigation.state.params.group.lesson !== 0) {
      title += ' ' + getI18nText('代理组长');
    }
    return {
      title: title,
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>),
      headerRight: (
        <View style={{ marginRight: 10, flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => share()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/Share.png')} />
          </TouchableOpacity>
          <View style={{ width: 6 }} />
          <TouchableOpacity onPress={() => submit()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/Ok.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    attendance: null,
    busy: false,
    windowWidth: Dimensions.get('window').width
  };

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    share = () => this.share();
    submit = () => this.submit();
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });

    this.loadAsync();
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener)
  }

  async loadAsync() {
    try {
      this.setState({ busy: true });
      const lesson = this.props.navigation.state.params.lesson;
      const group = this.props.navigation.state.params.group.id;
      const result = await callWebServiceAsync(`${Models.HostServer}/attendance/${getCurrentUser().getCellphone()}/${group}/${lesson}`, '', 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result, 200);
      if (succeed) {
        this.setState({ attendance: result.body });
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async share() {
    alert('TODO');
  }

  async submit() {
    try {
      this.setState({ busy: true });
      let users = [];
      const attendance = this.state.attendance;
      for (var i in attendance) {
        if (attendance[i].checked) {
          users.push(attendance[i].id);
        }
      }

      const body = {
        class: 2,
        group: this.props.navigation.state.params.group.id,
        lesson: this.props.navigation.state.params.lesson,
        users
      };

      const result = await callWebServiceAsync(`${Models.HostServer}/attendance`, `?cellphone=${getCurrentUser().getCellphone()}`, 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result, 201);
      if (succeed) {
        this.props.navigation.pop();
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  onCheck(user) {
    const attendance = this.state.attendance;
    for (let i in attendance) {
      if (attendance[i].id == user.id) {
        attendance[i].checked = !user.checked;
        break;
      }
    }

    this.setState({ attendance });
  }

  getTitle(index, user) {
    if (user.cellphone) {
      return `#${index}: ${user.name} (${user.cellphone})`;
    } else {
      return `#${index}: ${user.name}`;
    }
  }

  render() {
    if (!this.state.attendance) {
      return (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          size='large'
          color={Colors.yellow} />
      );
    }

    let keyIndex = 0;
    let index = 0;
    return (
      <ScrollView style={{ backgroundColor: 'white' }}>
        <View style={{ alignItems: 'center', marginTop: 5, marginBottom: 5 }}>
          {
            this.state.attendance.map((user) => user.checked ? (
              <CheckBox
                containerStyle={{ width: this.state.windowWidth - 20 }}
                key={keyIndex++}
                title={this.getTitle(++index, user)}
                checked={user.checked}
                onPress={() => { this.onCheck(user) }} />
            ) : null)
          }
          {
            this.state.attendance.map((user) => !user.checked ? (
              <CheckBox
                containerStyle={{ width: this.state.windowWidth - 20 }}
                key={keyIndex++}
                title={this.getTitle(++index, user)}
                checked={user.checked}
                onPress={() => { this.onCheck(user) }} />
            ) : null)
          }
        </View>
      </ScrollView>
    );
  }
}
