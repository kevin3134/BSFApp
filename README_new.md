main changes:

User.js
line 201
Add lessonLoc, tabLoc, scrollLoc in user info, and add related function

HomeScreen.js
line 168
add function componentDidMount() in class HomeScreen, reload prev lessonLoc
line 277
in goToLesson function: store current lessonLoc

Lesson.js
line 31
modified onPress function for navigate back
line 71
modified componentWillMount() in lessonscreen class, set initalpage to reload tabLoc(only work for ios)
line 118
add funtion updateScrollLoc(event) in lessonscreen class
line 166
modified struct ScrollableTabView, add scrollview outside DayQuestion in order to get the scrollLoc and reload them later.(Android and ios differ in the funtion)
line 299
add componentDidMount() and updateTabLoc(tabLoc), to reload the tabloc
