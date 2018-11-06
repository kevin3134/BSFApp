import React from 'react';
import {
  WebView,
  ScrollView,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ProgressViewIOS,
  ProgressBarAndroid
} from 'react-native';
import { pokeServer, downloadBibleAsync } from '../dataStorage/storage';
import { getPassageAsync } from '../dataStorage/storage';
import { Octicons, Feather } from '@expo/vector-icons';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { getCurrentUser } from '../store/user';
import { FileSystem } from 'expo';
import { getI18nText, getI18nBibleBookFromLang } from '../store/I18n';

function onSetting() { }

const audioBookId = require('../assets/json/audioBookId.json');

@connectActionSheet export default class BibleReadScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let title = getI18nText("读圣经");
    if (navigation.state.params && navigation.state.params.bookTitle) {
      title = navigation.state.params.bookTitle;
    }
    return {
      title,
      headerRight: (
        <View style={{ marginRight: 20, flexDirection: 'row', backgroundColor: '#fcaf17', alignItems: 'baseline' }}>
          <TouchableOpacity onPress={() => onSetting()}>
            <Feather name='settings' size={28} color='#fff' />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    downloading: false,
    downloadProgress: 0,
    downloadBible: '',
    passage: null,
    book: 1,
    chapter: 1
  }

  componentWillMount() {
    onSetting = this.onSetting.bind(this);

    this.loadAsync(this.state.book, this.state.chapter);
  }

  async loadAsync(book, chapter) {
    console.log(`loadPassage: ${book}/${chapter}`);
    const passage = await getPassageAsync(getCurrentUser().getBibleVersion(), `${book}/${chapter}`);
    const item = audioBookId.find((element) => (element.id == book));

    const bookName = getI18nBibleBookFromLang(item.name, getCurrentUser().getLanguage()) + chapter;
    this.props.navigation.setParams({ bookTitle: bookName })

    this.setState({ book, chapter, passage });
  }

  onSetting() {
  }

  onPrev() {
    let book = this.state.book;
    let chapter = this.state.chapter;

    if (this.state.chapter === 1) {
      if (book === 1) {
        book = 66;
      } else {
        book--;
      }

      const item = audioBookId.find((element) => (element.id == book));
      chapter = item.chapters;
    } else {
      chapter--;
    }

    this.loadAsync(book, chapter);
  }

  onNext() {
    let book = this.state.book;
    let chapter = this.state.chapter;

    const item = audioBookId.find((element) => (element.id == book));
    if (this.state.chapter === item.chapters) {
      if (book === 66) {
        book = 1;
      } else {
        book++;
      }

      chapter = 1;
    } else {
      chapter++;
    }

    this.loadAsync(book, chapter);
  }

  render() {
    const fontSize = getCurrentUser().getBibleFontSize();
    const verses = this.state.passage;
    // For some reason, Android cannot show html with 'tr:nth-child(even)' css...
    const moreStyle = Platform.OS === 'ios' ? 'tr:nth-child(even) { background: #EEEEEE }' : '';
    // Using html
    let html = '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /></head>' +
      '<style> td { font-size: ' + fontSize + '; padding: 4px;} ' + moreStyle + '</style><body><table>';
    for (var i in verses) {
      const verse = verses[i];
      html += `<tr><td>${verse.verse} ${verse.text.replace(/\n/g, '<br>')}</td></tr>`;
    }
    html += '</table><br><br><br><br></body>';

    return (
      <View style={{ flex: 1 }}>
        <WebView source={{ html }} />

        <View style={{
          position: 'absolute',
          backgroundColor: 'rgba(0,0,0,0.05)',
          left: 3,
          bottom: 20
        }}>
          <TouchableOpacity onPress={() => this.onPrev()}>
            <Feather name='chevron-left' size={30} color='#202020' />
          </TouchableOpacity>
        </View>

        <View style={{
          position: 'absolute',
          backgroundColor: 'rgba(0,0,0,0.05)',
          right: 3,
          bottom: 20
        }}>
          <TouchableOpacity onPress={() => this.onNext()}>
            <Feather name='chevron-right' size={30} color='#202020' />
          </TouchableOpacity>
        </View>
      </View >
    );
  }
}

// Build the web service url
function getId(book, verse) {
  // Parse the book name to id
  const bookIdList = require('../assets/json/bookid.json');
  let bookId = 1;
  for (var i in bookIdList) {
    if (bookIdList[i].name == book) {
      bookId = bookIdList[i].id;
      break;
    }
  }
  return bookId + "/" + verse;
}

const styles = StyleSheet.create({
  progress: {
    marginHorizontal: 10,
    marginVertical: 5,
  }
});