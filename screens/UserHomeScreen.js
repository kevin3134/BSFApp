import React from 'react';
import { StyleSheet, View, Dimensions, KeyboardAvoidingView, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { getCurrentUser } from '../utils/user';
import { EventRegister } from 'react-native-event-listeners';
import { Button, Input } from 'react-native-elements';
import Colors from '../constants/Colors';

export default class UserHomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('用户管理'),
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
    mode: 'userLogin',
    email: getCurrentUser().getEmail(),
    oldPassword: '',
    password: getCurrentUser().getPassword(),
    password2: '',
    busy: false,
    windowWidth: Dimensions.get('window').width
  }

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    onSubmit = () => this.onSubmit();

    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width, windowHeight: window.height });
    });
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  gotoPage(mode) {
    this.setState({
      mode: mode,
      email: getCurrentUser().getEmail(),
      oldPassword: getCurrentUser().getPassword(),
      password: getCurrentUser().getPassword(),
      password2: getCurrentUser().getPassword(),
    });
  }

  async loginUser() {
    if (!this.state.email || this.state.email.length < 6) {
      this.emailInput.shake();
      this.emailInput.focus();
      return;
    }
    if (!this.state.password || this.state.password.length < 6) {
      this.passwordInput.shake();
      this.passwordInput.focus();
      return;
    }

    try {
      this.setState({ busy: true });
      const body = {
        email: this.state.email,
        pass: this.state.password
      };
      const result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=loginUser`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status !== 200) {
          Alert.alert(getI18nText('错误'), 'Please double check your email and password!');
          return;
        }

        await getCurrentUser().setLoginInfoAsync(this.state.email, this.state.password);
        this.gotoPage('userProfile');
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async createUser() {
    if (!this.state.email || this.state.email.length < 6) {
      this.emailInput.shake();
      this.emailInput.focus();
      return;
    }
    if (!this.state.password || this.state.password.length < 6) {
      this.passwordInput.shake();
      this.passwordInput.focus();
      return;
    }
    if (this.state.password !== this.state.password2) {
      this.password2Input.shake();
      this.password2Input.focus();
      return;
    }

    try {
      this.setState({ busy: true });
      const body = {
        email: this.state.email,
        pass: this.state.password
      };
      const result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=createUser`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201) {
          await getCurrentUser().setLoginInfoAsync(this.state.email, this.state.password);
          this.gotoPage('userProfile');
        } else if (result.status === 409) {
          Alert.alert(getI18nText('错误'), 'Email is already registered!');
        } else {
          Alert.alert(getI18nText('错误') + result.status, getI18nText('Server error, please try again later'));
        }
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async forgetPassword() {
    if (!this.state.email || this.state.email.length < 6) {
      this.emailInput.shake();
      this.emailInput.focus();
      return;
    }

    try {
      this.setState({ busy: true });
      const result = await callWebServiceAsync(`${Models.HostServer}/resetPassword/${this.state.email}`, '', 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201) {
          Alert.alert(getI18nText('成功'), getI18nText('临时密码已经通过电子邮件发送给您，请在1小时内用临时密码登录并修改密码!'), [
            { text: 'OK', onPress: () => { this.gotoPage('userLogin'); } }
          ]);
        } else {
          Alert.alert(getI18nText('错误') + result.status, getI18nText('没有找到用户!'));
        }
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async updatePassword() {
    if (!this.state.oldPassword || this.state.oldPassword.length < 6) {
      this.oldPasswordInput.shake();
      this.oldPasswordInput.focus();
      return;
    }
    if (!this.state.password || this.state.password.length < 6) {
      this.passwordInput.shake();
      this.passwordInput.focus();
      return;
    }
    if (this.state.password !== this.state.password2) {
      this.password2Input.shake();
      this.password2Input.focus();
      return;
    }

    try {
      this.setState({ busy: true });
      const body = {
        email: this.state.email,
        pass: this.state.oldPassword,
        newPass: this.state.password,
      };
      const result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=changePassword`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201) {
          await getCurrentUser().setLoginInfoAsync(this.state.email, this.state.password);
          this.gotoPage('userProfile');
        } else {
          Alert.alert(getI18nText('错误') + result.status, getI18nText('Please double check your input!'));
        }
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0}>
        <ScrollView style={{ flex: 1, backgroundColor: 'white', width: this.state.windowWidth }}>
          {
            this.state.mode === 'userProfile' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <Text style={{ fontSize: 20 }}>{getI18nText('修改密码')}</Text>
              <Input
                containerStyle={{ marginTop: 20 }}
                ref={(input) => this.oldPasswordInput = input}
                label={getI18nText('旧密码')}
                defaultValue={this.state.oldPassword}
                secureTextEntry={true}
                errorStyle={{ color: 'red' }}
                onChangeText={(text) => { this.setState({ oldPassword: text }); }}
              />
              <Input
                containerStyle={{ marginTop: 20 }}
                ref={(input) => this.passwordInput = input}
                label={getI18nText('新密码')}
                defaultValue={this.state.password}
                secureTextEntry={true}
                errorStyle={{ color: 'red' }}
                onChangeText={(text) => { this.setState({ password: text }); }}
              />
              <Input
                containerStyle={{ marginTop: 20 }}
                ref={(input) => this.password2Input = input}
                defaultValue={this.state.password2}
                secureTextEntry={true}
                label={getI18nText('重复新密码')}
                errorStyle={{ color: 'red' }}
                onChangeText={(text) => { this.setState({ password2: text }); }}
              />
              <Button
                containerStyle={{ width: 170 }}
                icon={{ name: "send", size: 20, color: "white" }}
                title={getI18nText('提交')}
                buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                onPress={() => this.updatePassword()}
              />
            </View>
          }

          {
            this.state.mode === 'userLogin' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <Text style={{ fontSize: 20 }}>{getI18nText('用户登录')}</Text>
              <Input
                containerStyle={{ marginTop: 10 }}
                ref={(input) => this.emailInput = input}
                label={getI18nText('电子邮件')}
                defaultValue={this.state.email}
                errorStyle={{ color: 'red' }}
                onChangeText={(text) => { this.setState({ email: text }); }}
              />
              <Input
                containerStyle={{ marginTop: 20 }}
                ref={(input) => this.passwordInput = input}
                label={getI18nText('密码')}
                defaultValue={this.state.password}
                secureTextEntry={true}
                errorStyle={{ color: 'red' }}
                onChangeText={(text) => { this.setState({ password: text }); }}
              />
              <View style={{ flexDirection: 'row' }}>
                <Button
                  containerStyle={{ width: 170 }}
                  icon={{ name: "send", size: 20, color: "white" }}
                  title={getI18nText('提交')}
                  buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                  onPress={() => this.loginUser()}
                />
              </View>
            </View>
          }
          {
            this.state.mode === 'createUser' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <Text style={{ fontSize: 20 }}>{getI18nText('创建新用户')}</Text>
              <Input
                containerStyle={{ marginTop: 10 }}
                ref={(input) => this.emailInput = input}
                label={getI18nText('电子邮件')}
                defaultValue={this.state.email}
                errorStyle={{ color: 'red' }}
                onChangeText={(text) => { this.setState({ email: text }); }}
              />
              <Input
                containerStyle={{ marginTop: 20 }}
                ref={(input) => this.passwordInput = input}
                label={getI18nText('密码')}
                defaultValue={this.state.password}
                secureTextEntry={true}
                errorStyle={{ color: 'red' }}
                onChangeText={(text) => { this.setState({ password: text }); }}
              />
              <Input
                containerStyle={{ marginTop: 20 }}
                ref={(input) => this.password2Input = input}
                defaultValue={this.state.password2}
                secureTextEntry={true}
                label={getI18nText('重复密码')}
                errorStyle={{ color: 'red' }}
                onChangeText={(text) => { this.setState({ password2: text }); }}
              />
              <Button
                containerStyle={{ width: 170 }}
                icon={{ name: "send", size: 20, color: "white" }}
                title={getI18nText('提交')}
                buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                onPress={() => this.createUser()}
              />
            </View>
          }
          {
            this.state.mode === 'forgetPassword' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <Text style={{ fontSize: 20 }}>{getI18nText('找回密码')}</Text>
              <Input
                containerStyle={{ marginTop: 10 }}
                ref={(input) => this.emailInput = input}
                label={getI18nText('电子邮件')}
                defaultValue={this.state.email}
                errorStyle={{ color: 'red' }}
                onChangeText={(text) => { this.setState({ email: text }); }}
              />
              <View style={{ flexDirection: 'row' }}>
                <Button
                  containerStyle={{ width: 170 }}
                  icon={{ name: "send", size: 20, color: "white" }}
                  title={getI18nText('提交')}
                  buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                  onPress={() => this.forgetPassword()}
                />
              </View>
            </View>
          }
          <View style={{ flex: 1, marginTop: 10, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
            <View style={{ flexDirection: 'row' }}>
              {
                this.state.mode !== 'userProfile' && this.state.mode !== 'userLogin' &&
                <TouchableOpacity onPress={() => { this.gotoPage('userLogin') }}>
                  <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('登录已有账号')}</Text>
                </TouchableOpacity>
              }

              {
                this.state.mode !== 'userProfile' && this.state.mode !== 'createUser' && <View style={{ width: 7 }} />
              }
              {
                this.state.mode !== 'userProfile' && this.state.mode !== 'createUser' &&
                <TouchableOpacity onPress={() => { this.gotoPage('createUser') }}>
                  <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('创建新用户')}</Text>
                </TouchableOpacity>
              }

              {
                this.state.mode !== 'userProfile' && this.state.mode !== 'forgetPassword' && <View style={{ width: 7 }} />
              }
              {
                this.state.mode !== 'userProfile' && this.state.mode !== 'forgetPassword' &&
                <TouchableOpacity onPress={() => { this.gotoPage('forgetPassword') }}>
                  <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('找回密码')}</Text>
                </TouchableOpacity>
              }

              {
                this.state.mode === 'userProfile' && <View style={{ width: 7 }} />
              }
              {
                this.state.mode === 'userProfile' &&
                <TouchableOpacity onPress={() => { this.gotoPage('userLogin') }}>
                  <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('登出')}</Text>
                </TouchableOpacity>
              }
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
