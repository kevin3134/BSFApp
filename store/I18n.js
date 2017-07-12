import { Models } from '../dataStorage/models';
import { getCurrentUser } from '../store/user';

const text = {
  chs: [
    "BSF课程",
    "课",
    "我",
    "有声圣经",
    "设置",
    "显示语言",
    "圣经版本",
    "反馈意见",
    "App版本",
    "提交",
    "请选择显示语言",
    "请选择圣经版本",
    "提示：选择后程序将重新启动",
    "缺少内容",
    "请输入反馈意见内容",
    "谢谢您的反馈意见！",
    "背诵经文：",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "暂停",
    "播放",
    "创世记", "出埃及记", "利未记", "民数记", "申命记", "约书亚记", "士师记", "路得记", "撒母耳记上", "撒母耳记下", "列王纪上", "列王纪下", "历代志上", "历代志下", "以斯拉记", "尼希米记", "以斯帖记", "约伯记", "诗篇", "箴言", "传道书", "雅歌", "以赛亚书", "耶利米书", "耶利米哀歌", "以西结书", "但以理书", "何西阿书", "约珥书", "阿摩司书", "俄巴底亚书", "约拿书", "弥迦书", "那鸿书", "哈巴谷书", "西番雅书", "哈该书", "撒迦利亚书", "玛拉基书", "马太福音", "马可福音", "路加福音", "约翰福音", "使徒行传", "罗马书", "哥林多前书", "哥林多后书", "加拉太书", "以弗所书", "腓立比书", "歌罗西书", "帖撒罗尼迦前书", "帖撒罗尼迦后书", "提摩太前书", "提摩太后书", "提多书", "腓利门书", "希伯来书", "雅各书", "彼得前书", "彼得后书", "约翰一书", "约翰二书", "约翰三书", "犹大书", "启示录",
    "第",
    "章",
  ],
  cht: [
    "BSF課程",
    "課",
    "我",
    "有聲聖經",
    "設置",
    "顯示語言",
    "聖經版本",
    "反饋意見",
    "App版本",
    "提交",
    "請選擇顯示語言",
    "請選擇聖經版本",
    "提示：選擇後程序將重新啟動",
    "缺少內容",
    "請輸入反饋意見內容",
    "謝謝您的反饋意見！",
    "背誦經文：",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "暫停",
    "播放",
    "創世記", "出埃及記", "利未記", "民數記", "申命記", "約書亞記", "士師記", "路得記", "撒母耳記上", "撒母耳記下", "列王紀上", "列王紀下", "歷代志上", "歷代志下", "以斯拉記", "尼希米記", "以斯帖記", "約伯記", "詩篇", "箴言", "傳道書", "雅歌", "以賽亞書", "耶利米書", "耶利米哀歌", "以西結書", "但以理書", "何西阿書", "約珥書", "阿摩司書", "俄巴底亞書", "約拿書", "彌迦書", "那鴻書", "哈巴谷書", "西番雅書", "哈該書", "撒迦利亞書", "瑪拉基書", "馬太福音", "馬可福音", "路加福音", "約翰福音", "使徒行傳", "羅馬書", "哥林多前書", "哥林多後書", "加拉太書", "以弗所書", "腓立比書", "歌羅西書", "帖撒羅尼迦前書", "帖撒羅尼迦後書", "提摩太前書", "提摩太後書", "提多書", "腓利門書", "希伯來書", "雅各書", "彼得前書", "彼得後書", "約翰一書", "約翰二書", "約翰三書", "猶大書", "啟示錄",
    "第",
    "章",
  ],
  eng: [
    "BSF Lessons",
    "Lessons",
    "Me",
    "AudioBible",
    "Settings",
    "Diaply Language",
    "Bible Version",
    "Feedback",
    "App Version",
    "Submit",
    "Please select display language",
    "Please select bible version",
    "Note: App will restart",
    "Missing content",
    "Please enter feedback content",
    "Thank you for your feedback!",
    "Scripture Memory Verse: ",
    "1ST",
    "2ND",
    "3RD",
    "4TH",
    "5TH",
    "6TH",
    "Pause",
    "Play",
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1st Samuel", "2nd Samuel", "1st Kings", "2nd Kings", "1st Chronicles", "2nd Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1st Corinthians", "2nd Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1st Thessalonians", "2nd Thessalonians", "1st Timothy", "2nd Timothy", "Titus", "Philemon", "Hebrews", "James", "1st Peter", "2nd Peter", "1st John", "2nd John", "3rd John", "Jude", "Revelation",
    "Chapter ",
    "",
  ]
};

export default function getI18nText(origText) {
  const lang = getCurrentUser().getLanguage();
  //console.log("[I18n]" + lang + "{" + origText + "}");
  if (lang == Models.DefaultLanguage) {
    return origText;
  }

  for (var i in text[Models.DefaultLanguage]) {
    if (text[Models.DefaultLanguage][i] == origText) {
      return text[lang][i];
    }
  }

  return '';
}