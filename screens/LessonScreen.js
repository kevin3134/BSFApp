import React from 'react';
import { connect } from 'react-redux';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TouchableHighlight,
  KeyboardAvoidingView,
  Dimensions,
  Alert
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { loadLesson } from '../store/lessons.js'
import Answer from '../components/Answer'
import ExportAnswer from '../components/ExportAnswer.js';
import Colors from '../constants/Colors'
import { getI18nText, getI18nBibleBook } from '../utils/I18n';
import { getCurrentUser } from '../utils/user';
import { EventRegister } from 'react-native-event-listeners';

class LessonScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params && navigation.state.params.title ? navigation.state.params.title : '',
      headerLeft: (
        <View style={{ marginLeft: 10 }}>  
          <TouchableOpacity 
          onPress={() => {
            navigateBack();
            getCurrentUser().settabLocAsync(null); 
            getCurrentUser().setlessonLocAsync(null);
            getCurrentUser().setscrollLocAsync(0);
            }}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>),
      headerRight: (
        <ExportAnswer lessonId={navigation.state.params.lesson.id} importExport={() => onImportAndExport()} />
      )
    };
  };

  constructor() {
    super();
    this.goToPassage = this.goToPassage.bind(this);

    // [Wei] TextInput cannot copy-paste on initialPage, this is a bug on Android
    // The workaround is set initialPage to -1 and navigate to page 0 when control is initialized
    this.initialPage = Platform.OS === 'ios' ? 0 : -1;
    this.intervalId = null;
  }

  componentWillMount() {
    navigateTo = this.navigateTo.bind(this);
    navigateBack = () => this.props.navigation.pop();
    onImportAndExport = this.onImportAndExport.bind(this);

    if (!this.props.lesson) {
      this.props.loadLesson(this.props.navigation.state.params.lesson.id);
    }

    if (Platform.OS != 'ios') {
      this.goToFirstPage();
    }else{
      //inital tab for ios (android not work)
      try{
        let tabloc = getCurrentUser().gettabLoc();
        if(tabloc!=null){
          this.initialPage = tabloc;
        } 
        console.log("tab loc is "+ tabloc);
      }catch(e){
        console.log("cannot load tab");
      }
    }  

  }

  componentWillUnmount() {
    if (Platform.OS != 'ios') {
      clearInterval(this.intervalId);
    }
  }

  navigateTo(page, data) { 
    data.text = this.props.lesson.name + '\n' + data.text;
    this.props.navigation.navigate(page, data);
  }

  goToFirstPage() {
    if (this.tabView) {
      clearInterval(this.intervalId);
      this.tabView.goToPage(0);
    } else {
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          this.goToFirstPage();
        }, 0);
      }
    }
  }

  goToPassage(book, verse) {    
    this.props.navigation.navigate('Bible', { book, verse, title: getI18nBibleBook(book) + verse });
  }

  onImportAndExport() {
    this.props.navigation.navigate('AnswerManage');
  }

  updateScrollLoc(event) { 
    if (getCurrentUser().getscrollLoc() != event.nativeEvent.contentOffset.y) {
      getCurrentUser().setscrollLocAsync(event.nativeEvent.contentOffset.y);
    }
  }

  renderTab(name, page, isTabActive, onPressHandler, onLayoutHandler) {
    return (
      <View style={{ height: 20 }}>
        <TouchableHighlight
          key={`${name}_${page}`}
          onPress={() => onPressHandler(page)}
          onLayout={onLayoutHandler}
          style={{ flex: 1, width: 100, }}
          underlayColor="#aaaaaa">
          <Text>{name}</Text>
        </TouchableHighlight>
      </View>
    );
  };

  render() {
    const scrollableStyleProps = {
      tabBarBackgroundColor: Colors.yellow,
      tabBarActiveTextColor: 'rgba(255, 255, 255, 1)',
      tabBarInactiveTextColor: 'rgba(0, 0, 0, 0.7)',
      tabBarUnderlineStyle: {
        backgroundColor: 'white',
        height: 2
      },
      tabBarTextStyle: {
        fontSize: 20,
        fontWeight: '700'
      },
    }

    if (!this.props.lesson) {
      // Display loading screen
      return (
        <View style={styles.BSFQuestionContainer}>
          <Text style={{ marginVertical: 12, color: 'black' }}>Loading</Text>
        </View>
      );
    }

    const dayQuestions = this.props.lesson.dayQuestions;
    const content =
      <ScrollableTabView
        scrollWithoutAnimation = {true}
        ref={ref => {
          this.tabView = ref;
        }}

        {...scrollableStyleProps}
        initialPage={this.initialPage}
        renderTabBar={() => <LessonTab key={dayQuestions} dayQuestions={[
          dayQuestions.one.questions,
          dayQuestions.two.questions,
          dayQuestions.three.questions,
          dayQuestions.four.questions,
          dayQuestions.five.questions,
          dayQuestions.six.questions]} 
          />}>
            
          <ScrollView tabLabel='1' 
            ref = {ref => {
              if(ref){
                if (Platform.OS != 'ios') {
                  setTimeout(() => ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc() }), 50);
                }else{
                  ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc()});
                }
              } 
            }} 
            onScroll={event => { 
              this.updateScrollLoc(event);
            }}>
            <DayQuestions goToPassage={this.goToPassage} day={dayQuestions.one} memoryVerse={this.props.lesson.memoryVerse} />   
          </ScrollView>

          <ScrollView tabLabel='2'
            ref = {ref => {
              if(ref){
                if (Platform.OS != 'ios') {
                  setTimeout(() => ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc() }), 50);
                }else{
                  ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc()});
                }
                //setTimeout(() => ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc() }), 50);
              }            
            }}  
            onScroll={event => { 
              this.updateScrollLoc(event);
            }}>
            <DayQuestions goToPassage={this.goToPassage} day={dayQuestions.two}/>
          </ScrollView>

          <ScrollView tabLabel='3'
            ref = {ref => {
              if(ref){
                if (Platform.OS != 'ios') {
                  setTimeout(() => ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc() }), 50);
                }else{
                  ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc()});
                }
              }            
            }}  
            onScroll={event => { 
              this.updateScrollLoc(event);
            }}>          
            <DayQuestions goToPassage={this.goToPassage} day={dayQuestions.three}/>
          </ScrollView>

          <ScrollView tabLabel='4'
            ref = {ref => {
              if(ref){
                if (Platform.OS != 'ios') {
                  setTimeout(() => ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc() }), 50);
                }else{
                  ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc()});
                }
              }            
            }} 
            onScroll={event => { 
              this.updateScrollLoc(event);
            }}>          
            <DayQuestions goToPassage={this.goToPassage} day={dayQuestions.four} />
          </ScrollView>

          <ScrollView tabLabel='5'
            ref = {ref => {
              if(ref){
                if (Platform.OS != 'ios') {
                  setTimeout(() => ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc() }), 50);
                }else{
                  ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc()});
                }
              }            
            }}
            onScroll={event => { 
              this.updateScrollLoc(event);
            }}>          
            <DayQuestions goToPassage={this.goToPassage} day={dayQuestions.five} />
          </ScrollView>

          <ScrollView tabLabel='6'
            ref = {ref => {
              if(ref){
                if (Platform.OS != 'ios') {
                  setTimeout(() => ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc() }), 50);
                }else{
                  ref.scrollTo({x:0,y:getCurrentUser().getscrollLoc()});
                }
              }             
            }}
            onScroll={event => { 
              this.updateScrollLoc(event);
            }}>          
            <DayQuestions goToPassage={this.goToPassage} day={dayQuestions.six} /> 
          </ScrollView>

      </ScrollableTabView>

    // TODO:[Wei] KeyboardAwareScrollView works on iOS but not Android, KeyboardAvoidingView works on Android, but not iOS :(
    return (Platform.OS === 'ios') ? content : (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={80}>
        {content}
      </KeyboardAvoidingView >
    );
  }
}

class LessonTab extends React.Component {
  componentWillMount() {
    this.listener = EventRegister.addEventListener('userReadDiscussionChanged', () => this.forceUpdate());
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  componentDidMount() { 
    try{
      let tabloc = getCurrentUser().gettabLoc();
      if(tabloc!=null&&tabloc!=this.props.activeTab){
        //in android, initalpage and goToPage not work, unless using settimeout
        setTimeout(() => this.props.goToPage(tabloc), 50);
      } 
    }catch(e){
      console.log("cannot load scroll");
    }
  }
  
  //update when change tab, also remove the scroll loc
  updateTabLoc(tabLoc) {
    if (getCurrentUser().gettabLoc() != tabLoc) {
      getCurrentUser().settabLocAsync(tabLoc);
      getCurrentUser().setscrollLocAsync(0);
    }
  }

  render() {
    const containerWidth = Dimensions.get('window').width;
    const numberOfTabs = this.props.tabs.length;
    return (
      <View style={{
        flexDirection: 'row',
        backgroundColor: this.props.backgroundColor
      }}>
        {
          this.props.tabs.map((name, page) => {
            const hasUnread = getCurrentUser().getDiscussionHasUnreadByDay(this.props.dayQuestions[page]);
            const isTabActive = this.props.activeTab === page;
            const redDot = hasUnread ? (<View
              style={{
                position: 'absolute',
                backgroundColor: 'red',
                height: 9,
                width: 9,
                borderRadius: 9,
                right: 2,
                top: 3
              }} />) : null;
            return (
              <TouchableOpacity key={name} 
              onPress={() => {
                this.props.goToPage(page)
                this.updateTabLoc(page)
              }}> 
                <View style={{
                  marginHorizontal: 0.5,
                  width: (containerWidth / numberOfTabs) - 1,
                  borderTopColor: 'whitesmoke',
                  borderLeftColor: 'whitesmoke',
                  borderRightColor: 'whitesmoke',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopWidth: 1,
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  backgroundColor: isTabActive ? 'whitesmoke' : this.props.backgroundColor
                }}>
                  <Text style={{
                    margin: 3,
                    fontSize: getCurrentUser().getLessonFontSize() + 4,
                    color: isTabActive ? Colors.yellow : 'whitesmoke',
                    fontWeight: '900'
                  }}>{name}</Text>
                  {redDot}
                </View>
              </TouchableOpacity>
            );
          })
        }
      </View>
    );
  }
}

const DayQuestions = (props) => {
  lastBibleQuote = null;
  let dayTitle;
  let subTitle;
  const index = props.day.title.indexOf('\n');
  if (index === -1) {
    dayTitle = props.day.title;
  } else {
    dayTitle = props.day.title.substring(0, index);
    subTitle = props.day.title.substring(index + 1).trim();
  }
  const content = (
    <View style={styles.BSFQuestionContainer}>
      {
        props.memoryVerse &&
        <Text style={[styles.memoryVerse, { fontSize: getCurrentUser().getLessonFontSize() }]} selectable={true}>{getI18nText('背诵经文：')}{props.memoryVerse}</Text>
      }
      <Text style={[styles.dayTitle, { fontSize: getCurrentUser().getLessonFontSize() }]} selectable={true}>{dayTitle}</Text>

      {
        subTitle &&
        <Text style={[styles.subDayTitle, { fontSize: getCurrentUser().getLessonFontSize() }]} selectable={true}>{subTitle}</Text>
      }

      {
        props.day.readVerse &&
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          maxWidth: Dimensions.get('window').width - 10
        }}>
          {
            props.day.readVerse.map((quote) => (
              <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} goToPassage={props.goToPassage} />
            ))
          }
        </View>
      }
      {
        props.day.questions &&
        props.day.questions.map((question) => (
          <BSFQuestion
            key={question.id}
            question={question}
            goToPassage={props.goToPassage}
          />
        ))
      }
    </View >
  );

  return (Platform.OS === 'ios') ? (
    <KeyboardAwareScrollView style={styles.dayQuestionsContainer} extraScrollHeight={80}>
      {content}
    </KeyboardAwareScrollView>
  ) : (
      <ScrollView style={styles.dayQuestionsContainer}>
        {content}
      </ScrollView>
    );
}

class BSFQuestion extends React.Component {
  componentWillMount() {
    this.listener = EventRegister.addEventListener('userReadDiscussionChanged', () => this.forceUpdate());
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  async onChat() {
    const props = this.props;

    const id = props.question.id;
    await getCurrentUser().setDiscussionReadAsync(props.question);
    this.setState({ hasUnread: getCurrentUser().getDiscussionHasUnread(props.question) });

    const ids = id.split('_');
    const title = (ids.length >= 3) ? `:${ids[1]}课${ids[2]}题` : '';
    const isGroupLeader = props.question.homiletics && getCurrentUser().getUserPermissions().isGroupLeader;

    // Group leader has a different chat screen for homiletics question
    navigateTo('Discussion', {
      id: id,
      isGroupLeader: isGroupLeader,
      title: isGroupLeader ? `${getI18nText('问题讨论')} ${title}` : getI18nText('问题讨论'),
      text: props.question.questionText,
      quotes: props.question.quotes
    });
  }

  render() {
    const props = this.props;
    const homiletics = props.question.homiletics;
    const hasUnread = getCurrentUser().getDiscussionHasUnread(props.question);
    return (
      <View style={{ marginVertical: 12, }}>
        <QuestionText>
          {props.question.questionText}
        </QuestionText>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          maxWidth: Dimensions.get('window').width - 10
        }}>
          {props.question.quotes.map(quote => (
            <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} goToPassage={props.goToPassage} />
          ))}
        </View>
        <View>
          <Answer questionId={props.question.id} homiletics={homiletics} />
          {
            getCurrentUser().getUserPermissions().chat &&
            <View style={{
              position: 'absolute',
              top: -26,
              right: -11
            }}>
              <TouchableOpacity onPress={this.onChat.bind(this)}>
                <Image
                  style={{ width: 30, height: 30, marginRight: 2, marginBottom: 2 }}
                  source={require('../assets/images/Chat.png')} />
              </TouchableOpacity>
              {
                hasUnread &&
                <View style={{
                  position: 'absolute',
                  backgroundColor: 'red',
                  height: 9,
                  width: 9,
                  borderRadius: 9,
                  right: 2
                }} />
              }
            </View>
          }
        </View>
      </View>
    );
  }
}

const QuestionText = (props) => (
  <Text style={{ color: 'black', marginBottom: 5, fontSize: getCurrentUser().getLessonFontSize() }} selectable={true}>{props.children}</Text>
)

let lastBibleQuote = '';
const BibleQuote = (props) => {
  const repeat = lastBibleQuote === props.book;
  lastBibleQuote = props.book;
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => props.goToPassage(props.book, props.verse) }>
        <View style={styles.bibleQuote}>
          <Text style={{ color: 'white', fontSize: getCurrentUser().getLessonFontSize() - 2 }} selectable={true}>{repeat ? '' : getI18nBibleBook(props.book)}{props.verse}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const mapStateToProps = (state, ownProps) => {
  return {
    lesson: state.lessons[ownProps.navigation.state.params.lesson.id],
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadLesson: (id) => dispatch(loadLesson(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LessonScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayQuestionsContainer: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  BSFQuestionContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 8,
  },
  bibleQuote: {
    marginVertical: 2,
    marginRight: 2,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    backgroundColor: Colors.yellow,
  },
  dayTitle: {
    color: 'black',
    fontWeight: 'bold',
  },
  subDayTitle: {
    color: 'black',
    fontStyle: 'italic'
  },
  memoryVerse: {
    color: 'black',
    marginBottom: 30,
    fontWeight: 'bold',
  }
});