import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Dimensions, KeyboardAvoidingView, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { getCurrentUser } from '../utils/user';
import { EventRegister } from 'react-native-event-listeners';
import { Button, Input } from 'react-native-elements';
import Colors from '../constants/Colors';
import { loadAsync } from '../dataStorage/storage';
import { updateAnswer } from '../store/answers';

class UserHomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('我的账号'),
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

  constructor(props) {
    super(props);

    const userLoggedIn = this.getUserLoggedIn();
    this.state = {
      mode: userLoggedIn ? 'userProfile' : 'userLogin',
      email: getCurrentUser().getEmail(),
      password: '',
      password2: '',
      busy: false,
      windowWidth: Dimensions.get('window').width
    }
  }

  getUserLoggedIn() {
    const email = getCurrentUser().getEmail();
    const accessToken = getCurrentUser().getAccessToken();
    return email.length > 0 && accessToken.length > 0;
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
      password: '',
      password2: '',
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

        if (result.status === 200 && result.body.accessToken) {
          await getCurrentUser().setLoginInfoAsync(this.state.email, result.body.accessToken);
          if (result.body.ResetPassword) {
            this.gotoPage('updatePassword');
          } else {
            this.gotoPage('userProfile');
          }
          return;
        }

        Alert.alert(getI18nText('错误') + result.status, getI18nText('Unknown error, please try again later'));
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
        if (result.status === 201 && result.body.accessToken) {
          await getCurrentUser().setLoginInfoAsync(this.state.email, result.body.accessToken);
          this.gotoPage('userProfile');
        } else if (result.status === 409) {
          Alert.alert(getI18nText('错误'), 'Email is already registered!');
        } else {
          Alert.alert(getI18nText('错误') + result.status, getI18nText('Unknown error, please try again later'));
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
        accessToken: getCurrentUser().getAccessToken(),
        pass: this.state.password,
      };
      const result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=changePassword`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201 && result.body.accessToken) {
          await getCurrentUser().setLoginInfoAsync(this.state.email, result.body.accessToken);
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

  async logout() {
    await getCurrentUser().setLoginInfoAsync('', '');
    this.gotoPage('userLogin');
  }

  async syncAnswers() {
    try {
      this.setState({ busy: true });
      let body = {
        accessToken: getCurrentUser().getAccessToken()
      };

      // Download answers
      let result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=downloadAnswers`, '', 'POST', [], body);
      let succeed = await showWebServiceCallErrorsAsync(result);
      if (!succeed || !result.status || result.status !== 200) {
        Alert.alert(getI18nText('错误') + result.status, getI18nText('未知错误，请稍后再试！'));
        return;
      }

      // Merge answers
      let downloadAnswers = result.body.answers ? (result.body.answers === '[]' ? {} : JSON.parse(result.body.answers)) : {};

      const answerContent = await loadAsync(Models.Answer, null, false);
      let localAnswers = {};
      if (answerContent && answerContent.answers) {
        for (let i in answerContent.answers) {
          const item = answerContent.answers[i];
          localAnswers[item.questionId] = item.answerText;
        }
      }

      // console.log({ localAnswers, downloadAnswers });
      let useRemote = 0;
      let useMerged = 0;
      let mergedAnswers = JSON.parse(JSON.stringify(localAnswers));
      for (let i in downloadAnswers) {
        const remote = downloadAnswers[i];
        const local = localAnswers[i];
        let merged;
        if (local === undefined || local === null) {
          merged = remote;
          useRemote++;
          this.props.updateAnswer(i, merged);
          // console.log(`${i}: ${local} | ${remote} => ${merged} - No local, use remote`);
        } else if (local === remote) {
          merged = local;
          // console.log(`${i}: ${local} | ${remote} => ${merged} - Same, use local`);
        } else if (local.indexOf(remote) !== -1) {
          merged = local;
          // console.log(`${i}: ${local} | ${remote} => ${merged} - local contains remote, use local`);
        } else if (remote.indexOf(local) !== -1) {
          merged = remote;
          useRemote++;
          this.props.updateAnswer(i, merged);
          // console.log(`${i}: ${local} | ${remote} => ${merged} - remote contains local, use remote`);
        } else {
          merged = local + '\n---\n' + remote;
          useMerged++;
          this.props.updateAnswer(i, merged);
          // console.log(`${i}: ${local} | ${remote} => ${merged} - Use both`);
        }
        mergedAnswers[i] = merged;
      }
      // console.log({ mergedAnswers });
      const useLocal = Object.keys(mergedAnswers).length - useRemote - useMerged;

      // Upload answers
      body = {
        accessToken: getCurrentUser().getAccessToken(),
        answers: mergedAnswers
      };
      result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=uploadAnswers`, '', 'POST', [], body);
      succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201) {
          Alert.alert(getI18nText('合并成功'),
            getI18nText('使用远程答案: ') + useRemote + '\n' +
            getI18nText('使用本地答案: ') + useLocal + '\n' +
            getI18nText('使用合并答案: ') + useMerged);
        } else {
          Alert.alert(getI18nText('错误') + result.status, getI18nText('未知错误，请稍后再试！'));
        }
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async uploadAnswers() {
    try {
      this.setState({ busy: true });
      let body = {
        accessToken: getCurrentUser().getAccessToken()
      };

      const answerContent = await loadAsync(Models.Answer, null, false);
      let localAnswers = {};
      if (answerContent && answerContent.answers) {
        for (let i in answerContent.answers) {
          const item = answerContent.answers[i];
          localAnswers[item.questionId] = item.answerText;
        }
      }

      body = {
        accessToken: getCurrentUser().getAccessToken(),
        answers: localAnswers
      };
      result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=uploadAnswers`, '', 'POST', [], body);
      succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201) {
          Alert.alert(getI18nText('上传成功'), '答案数目: ' + Object.keys(localAnswers).length);
        } else {
          Alert.alert(getI18nText('错误') + result.status, getI18nText('未知错误，请稍后再试！'));
        }
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async downloadAnswers() {
    try {
      this.setState({ busy: true });
      let body = {
        accessToken: getCurrentUser().getAccessToken()
      };

      // Download answers
      let result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=downloadAnswers`, '', 'POST', [], body);
      let succeed = await showWebServiceCallErrorsAsync(result);
      if (!succeed || !result.status || result.status !== 200) {
        Alert.alert(getI18nText('错误') + result.status, getI18nText('未知错误，请稍后再试！'));
        return;
      }

      let downloadAnswers = result.body.answers ? (result.body.answers === '[]' ? {} : JSON.parse(result.body.answers)) : {};
      for (let i in downloadAnswers) {
        this.props.updateAnswer(i, downloadAnswers[i]);
      }

      Alert.alert(getI18nText('下载成功'), '答案数目: ' + Object.keys(downloadAnswers).length);
    }
    finally {
      this.setState({ busy: false });
    }
  }

  render() {
    if (this.state.busy) {
      return (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          size='large'
          color={Colors.yellow} />
      );
    }

    const userLoggedIn = this.getUserLoggedIn();
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0} >
        <ScrollView style={{ flex: 1, backgroundColor: 'white', width: this.state.windowWidth }}>
          <View style={{ height: 10 }} />
          {/* <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
            <Text style={{ fontSize: 23, color: 'red' }}>---Under development---</Text>
          </View> */}
          {
            this.state.mode === 'userProfile' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <Text style={{ fontSize: 20 }}>{getI18nText('同步答案')}</Text>
              <Button
                containerStyle={{ width: 170 }}
                icon={{ name: "send", size: 20, color: "white" }}
                title={getI18nText('合并答案')}
                buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                onPress={() => this.syncAnswers()}
              />
              <Button
                containerStyle={{ width: 170 }}
                icon={{ name: "send", size: 20, color: "white" }}
                title={getI18nText('上传答案')}
                buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                onPress={() => {
                  Alert.alert(getI18nText('确认'), getI18nText('请确认是否上传并覆盖远程的答案？'), [
                    { text: 'Yes', onPress: () => { this.uploadAnswers() } },
                    { text: 'Cancel', onPress: () => { } },
                  ]);
                }}
              />
              <Button
                containerStyle={{ width: 170 }}
                icon={{ name: "send", size: 20, color: "white" }}
                title={getI18nText('下载答案')}
                buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                onPress={() => {
                  Alert.alert(getI18nText('确认'), getI18nText('请确认是否下载并覆盖本地的答案（所有本地修改的答案将会丢失）？'), [
                    { text: 'Yes', onPress: () => { this.downloadAnswers() } },
                    { text: 'Cancel', onPress: () => { } },
                  ]);
                }}
              />
            </View>
          }

          {
            this.state.mode === 'updatePassword' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <Text style={{ fontSize: 20 }}>{getI18nText('修改密码')}</Text>
              <Input
                containerStyle={{ marginTop: 20 }}
                ref={(input) => this.passwordInput = input}
                label={getI18nText('新密码(至少6位)')}
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
                label={getI18nText('重复新密码(至少6位)')}
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
                label={getI18nText('密码(至少6位)')}
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
                label={getI18nText('密码(至少6位)')}
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
                label={getI18nText('重复密码(至少6位)')}
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
                !userLoggedIn && this.state.mode !== 'userLogin' &&
                <TouchableOpacity onPress={() => { this.gotoPage('userLogin') }}>
                  <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('登录已有账号')}</Text>
                </TouchableOpacity>
              }

              {
                !userLoggedIn && this.state.mode !== 'createUser' && <View style={{ width: 7 }} />
              }
              {
                !userLoggedIn && this.state.mode !== 'createUser' &&
                <TouchableOpacity onPress={() => { this.gotoPage('createUser') }}>
                  <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('创建新用户')}</Text>
                </TouchableOpacity>
              }

              {
                !userLoggedIn && this.state.mode !== 'forgetPassword' && <View style={{ width: 7 }} />
              }
              {
                !userLoggedIn && this.state.mode !== 'forgetPassword' &&
                <TouchableOpacity onPress={() => { this.gotoPage('forgetPassword') }}>
                  <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('找回密码')}</Text>
                </TouchableOpacity>
              }

              {
                userLoggedIn && <View style={{ width: 7 }} />
              }
              {
                userLoggedIn && this.state.mode !== 'userProfile' &&
                <TouchableOpacity onPress={() => { this.gotoPage('userProfile') }}>
                  <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('修改用户资料')}</Text>
                </TouchableOpacity>
              }

              {
                userLoggedIn && <View style={{ width: 7 }} />
              }
              {
                userLoggedIn && this.state.mode !== 'updatePassword' &&
                <TouchableOpacity onPress={() => { this.gotoPage('updatePassword') }}>
                  <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('修改密码')}</Text>
                </TouchableOpacity>
              }

              {
                userLoggedIn && <View style={{ width: 7 }} />
              }
              {
                userLoggedIn &&
                <TouchableOpacity onPress={() => { this.logout() }}>
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

const mapStateToProps = (state, ownProps) => {
  return {};
}

const mapDispatchToProps = {
  updateAnswer
}

export default connect(mapStateToProps, mapDispatchToProps)(UserHomeScreen)
