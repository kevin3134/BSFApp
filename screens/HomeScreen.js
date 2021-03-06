import React from 'react';
import { connect } from 'react-redux';
import { FontAwesome } from '@expo/vector-icons';
import { FileSystem, Updates } from 'expo';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  ProgressViewIOS,
  ProgressBarAndroid,
  RefreshControl,
  Dimensions,
  Image
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import { requestBooks, clearBooks } from "../store/books";
import { clearLesson } from '../store/lessons';
import { clearPassage } from '../store/passage';
import { getI18nText } from '../utils/I18n';
import { getCurrentUser } from '../utils/user';
import { Models } from '../dataStorage/models';
import { resetGlobalCache } from '../dataStorage/storage';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';
import { isPreview, appVersion } from '../dataStorage/storage';
import { showMessage } from "react-native-flash-message";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { syncAnswersAsync } from '../utils/answers';
import { updateAnswer } from '../store/answers';
import { NavigationActions } from 'react-navigation';

async function checkForAppUpdate() {
  const { isAvailable } = await Updates.checkForUpdateAsync();
  if (isAvailable) {
    Updates.reload();
  } else {
    showMessage({
      message: getI18nText('没有发现更新！'),
      duration: 3000,
      type: "info"
    });
  }
}

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('BSF课程'),
      headerLeft: (
        <View style={{ marginLeft: 14 }} >
          {
            getCurrentUser().getUserPermissions().audios &&
            <TouchableOpacity onPress={() => { userHome() }}>
              <FontAwesome name='user-o' size={28} color='white' />
            </TouchableOpacity>
          }
        </View>
      ),
      headerRight: (
        <View style={{ flexDirection: 'row' }}>
          {
            isPreview &&
            <View>
              <TouchableOpacity onPress={() => {
                checkForAppUpdate();
              }}>
                <View style={{
                  backgroundColor: '#e74c3c',
                  borderRadius: 11,
                  paddingHorizontal: 5
                }}>
                  <Text style={{
                    padding: 3,
                    color: '#ecf0f1',
                    fontWeight: 'bold',
                    fontSize: 10
                  }}>{appVersion}</Text>
                </View>
              </TouchableOpacity>
            </View>
          }

          {
            getCurrentUser().getUserPermissions().audios &&
            <TouchableOpacity onPress={() => { syncUserData() }}>
              <MaterialCommunityIcons name='cloud-sync' size={34} color='white' />
            </TouchableOpacity>
          }
          <View style={{ width: 10 }} />
          <TouchableOpacity onPress={() => { checkForContentUpdate() }}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/Download.png')} />
          </TouchableOpacity>
          <View style={{ width: 10 }} />
        </View >)
    };
  };

  state = {
    downloadProgress: '',
    remoteVersion: '',
    downloading: false,
    refreshing: false,
    activeSections: [0],
    windowWidth: Dimensions.get('window').width
  };

  lastCheckForContentUpdateDate = 0;
  sessionId = null;
  listeners = [];

  componentWillMount() {
    if (!this.props.booklist) {
      this.props.requestBooks();
    }

    this.listeners.push(EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width, windowHeight: window.height });
    }));

    this.listeners.push(EventRegister.addEventListener('userPermissionChanged', (permissions) => {
      console.log('userPermissionChanged');
      this.props.navigation.dispatch(NavigationActions.setParams({
        params: {},
        key: 'Home',
      }));
      console.log('forceUpdate');
      this.forceUpdate();
    }));

    this.listeners.push(EventRegister.addEventListener('appUpdateAvailable', (hasAppUpdate) => {
      this.props.navigation.dispatch(NavigationActions.setParams({
        params: { hasAppUpdate },
        key: 'Settings',
      }));
    }));

    this.props.navigation.addListener('willFocus', () => {
      getCurrentUser().checkForAppUpdateAsync();
      // Workaround: For some reason, when event is triggered TabIcon cannot be updated, so we proactively check it here
      const hasAppUpdate = getCurrentUser().getAppUpdateAvailable();
      this.props.navigation.dispatch(NavigationActions.setParams({
        params: { hasAppUpdate },
        key: 'Settings',
      }));
    });

    checkForContentUpdate = () => this.checkForContentUpdate(true);
    userHome = () => this.props.navigation.navigate('UserProfile');
    syncUserData = () => this.syncUserData();

    setTimeout(() => {
      this.checkForContentUpdate(false);
    }, 200);
  }

  componentWillUnmount() {
    this.listeners.forEach(listener => {
      EventRegister.removeEventListener(listener);
    });
  }

  componentDidMount() {
    try{
      let lessonloc = getCurrentUser().getlessonLoc();
      let tabloc = getCurrentUser().gettabLoc();
      if(lessonloc!=null&&tabloc!=null){
        this.goToLesson(lessonloc);
      }
      console.log("lesson loc is "+ lessonloc);
    }catch(e){
      console.log("cannot load lesson");
    }
  }

  downloadCallback(downloadProgress) {
    if (downloadProgress.totalBytesExpectedToWrite == -1) {
      progress = 1;
    } else {
      progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
    }
    this.setState({ downloadProgress: progress });
  }

  async syncUserData() {
    const accessToken = getCurrentUser().getAccessToken();
    if (!accessToken || accessToken.length <= 0) {
      showMessage({
        message: getI18nText('请首先登陆或者创建用户'),
        duration: 3000,
        type: "info"
      });
      this.props.navigation.navigate('UserProfile');
      return;
    }

    syncAnswersAsync(this.props.updateAnswer, null, null, (useRemote, useLocal, useMerged) => {
      showMessage({
        message: getI18nText('合并成功'),
        duration: 3000,
        description: getI18nText('使用远程答案: ') + useRemote + '\n' +
          getI18nText('使用本地答案: ') + useLocal + '\n' +
          getI18nText('使用合并答案: ') + useMerged,
        type: "success"
      });
    });
  }

  async checkForContentUpdate(showUI) {
    if (this.state.downloading) {
      return;
    }

    // Don't need to wait for it to complete
    getCurrentUser().reloadPermissionAsync().then(() => {
      this.setState({ onRefresh: !this.state.onRefresh });
    });

    this.lastCheckForContentUpdateDate = (new Date()).getDate();
    try {
      const { localVersion, remoteVersion, localVersionString, remoteVersionString } = await getCurrentUser().getContentVersions(showUI);
      if (localVersion === remoteVersion) {
        if (showUI) {
          Alert.alert(getI18nText('课程没有更新'), getI18nText('是否重新下载？') + '[' + remoteVersionString + ']', [
            { text: 'Yes', onPress: () => { this.downloadContent(remoteVersionString); } },
            { text: 'No', onPress: () => { } },
          ]);
        }
      } else {
        await this.downloadContent(remoteVersionString);
      }
    } catch (e) {
      console.log(e);
    }
  }

  reload() {
    // reload all data
    this.props.clearBooks();
    this.props.clearLesson();
    this.props.clearPassage();
    this.props.requestBooks();
  }

  async downloadContent(remoteVersion) {
    this.downloadFiles = Models.DownloadList.length;
    this.downloadedFiles = 0;
    await this.setState({ downloadProgress: 0, downloading: true, remoteVersion });

    // download lessons
    for (var i in Models.DownloadList) {
      const remoteUri = Models.DownloadUrl + Models.DownloadList[i] + '.json';
      const localUri = FileSystem.documentDirectory + Models.DownloadList[i] + '.json';
      console.log(`Downlad ${remoteUri} to ${localUri}...`);

      const downloadResumable = FileSystem.createDownloadResumable(remoteUri, localUri, {}, this.downloadCallback.bind(this));
      try {
        const { uri } = await downloadResumable.downloadAsync();
        this.downloadedFiles++;
        resetGlobalCache(Models.DownloadList[i]);
      } catch (e) {
        console.log(e);
      }
    }

    this.reload();
    this.setState({ downloading: false });
  }

  goToLesson(lesson) {
    let parsed = lesson.name.split(' ');

    //if change lesson remove tab loc and scroll loc
    if (getCurrentUser().getlessonLoc() != lesson) {
      getCurrentUser().setlessonLocAsync(lesson);
      getCurrentUser().settabLocAsync(0);
      getCurrentUser().setscrollLocAsync(0);
    }

    this.props.navigation.navigate('Lesson', { lesson, title: parsed[1] });
  }

  goToAudio(lesson) {
    this.props.navigation.navigate('LectureMaterial', { id: lesson.id });
  }

  render() {
    const progress = (this.state.downloadProgress + this.downloadedFiles) / this.downloadFiles;
    const progressText = getI18nText('下载课程') + ' ' + this.state.remoteVersion + ' (' + parseInt(progress * 100) + '%)';
    return (
      <View style={styles.container}>
        {
          this.state.downloading && Platform.OS === 'ios' &&
          <View>
            <Text style={styles.progress}>{progressText}</Text>
            <ProgressViewIOS style={styles.progress} progress={progress} />
          </View>
        }
        {
          this.state.downloading && Platform.OS === 'android' &&
          <View>
            <Text style={styles.progress}>{progressText}</Text>
            <ProgressBarAndroid style={styles.progress} styleAttr="Horizontal" indeterminate={false} progress={progress} />
          </View>
        }
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => { this.checkForContentUpdate(false); }}
            />
          }>
          <View style={styles.booksContainer}>
            {
              this.props.booklist &&
              <Accordion
                activeSections={this.state.activeSections}
                underlayColor='white'
                sections={this.props.booklist}
                renderHeader={this._renderHeader.bind(this)}
                renderContent={this._renderContent.bind(this)}
                onChange={(activeSections) => this.setState({ activeSections })} />
            }
            {
              !this.props.booklist &&
              <Text style={{ textAlign: 'center', textAlignVertical: 'center', fontSize: 22 }}>Loading</Text>
            }
          </View>
        </ScrollView>
      </View>
    )
  }

  _renderHeader(content, index, isActive) {
    // TODO: clean up backend api for this to work
    const parsed = content.title.indexOf('2');
    const book = content.title.substring(0, parsed);
    const year = content.title.substring(parsed);
    return (
      <View style={styles.bookHeader} >
        <FontAwesome
          name={isActive ? 'minus' : 'plus'}
          size={18}
        />
        <Text style={[styles.bookHeaderText, { fontSize: getCurrentUser().getHomeTitleFontSize() }]}>    {book} ({year})</Text>
      </View>
    )
  }

  _renderContent(content, index, isActive) {
    return (
      <View>
        {content.lessons.map(lesson => (
          <Lesson
            key={lesson.id}
            goToLesson={() => this.goToLesson(lesson)}
            goToAudio={() => this.goToAudio(lesson)}
            lesson={lesson}
          />))}
      </View>
    )
  }
}

const Lesson = (props) => {
  // TODO: clean up backend api for this to work
  const parsed = props.lesson.name.split(' ');
  const lessonNumber = parsed[0];
  const name = parsed[1];
  const date = parsed[2];
  const permissions = getCurrentUser().getUserPermissions();
  const hasAudio = permissions.audios && (permissions.audios.indexOf(props.lesson.id) != -1)
  return (
    <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>
      <View style={{
        borderWidth: 1,
        width: Dimensions.get('window').width - 85,
        marginLeft: 20,
        marginVertical: 2,
        borderRadius: 10,
        borderColor: '#cdcdcd'
      }}>
        <TouchableOpacity style={styles.lessonContainer} onPress={() => props.goToLesson()}>
          <View style={styles.lessonMetadata}>
            <Text style={styles.lessonMetadataText}>
              {date} {lessonNumber}
            </Text>
          </View>
          <Text style={{ marginVertical: 4, fontSize: getCurrentUser().getHomeFontSize() }}>
            {name}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{
        borderWidth: 1,
        width: 50,
        marginLeft: 2,
        marginVertical: 2,
        borderRadius: 10,
        borderColor: '#cdcdcd',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {
          hasAudio &&
          <TouchableOpacity onPress={() => props.goToAudio()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/Materials.On.png')} />
          </TouchableOpacity>
        }
        {
          !hasAudio &&
          <Image
            style={{ width: 34, height: 34 }}
            source={require('../assets/images/Materials.Off.png')} />
        }
      </View>
    </View>
  )
}

const mapStateToProps = (state) => {
  return {
    booklist: state.books.booklist,
  }
}

const mapDispatchToProps = {
  requestBooks,
  clearLesson,
  clearPassage,
  clearBooks,
  updateAnswer
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  contentContainer: {
  },
  booksContainer: {
    backgroundColor: 'white'
  },
  bookHeader: {
    flexDirection: 'row',
    paddingVertical: 2,
    backgroundColor: '#FFECC4',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 11,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: Colors.yellow
  },
  bookHeaderText: {
    marginVertical: 6,
    fontWeight: '400',
  },
  lessonContainer: {
    paddingLeft: 10,
    backgroundColor: 'transparent',
  },
  lessonMetadata: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  lessonMetadataText: {
    color: 'grey',
  },
  progress: {
    marginHorizontal: 10,
    marginVertical: 5,
  }
});