import * as firebase from 'firebase';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCL8FEywFF_3Yh2g6xBtURUWfQRQCqtzu4",
  authDomain: "cbsf-cc2d3.firebaseapp.com",
  databaseURL: "https://cbsf-cc2d3.firebaseio.com",
  projectId: "cbsf-cc2d3",
  storageBucket: "cbsf-cc2d3.appspot.com",
  messagingSenderId: "674960542552"
};

firebase.initializeApp(firebaseConfig);

export default class Chat {
  uid = '';
  messagesRef = null;
  databaseId = null;

  constructor(id) {
    if (id) {
      this.databaseId = id;
    }

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setUid(user.uid);
      } else {
        firebase.auth().signInAnonymously().catch((error) => {
          alert(error.message);
        })
      }
    })
  }

  setUid(value) {
    this.uid = value;
  }

  getUid() {
    return this.uid;
  }

  getDatabaseName() {
    if (this.databaseId) {
      return 'messages' + this.databaseId;
    } else {
      return 'messages';
    }
  }

  loadMessages(callback) {
    this.messagesRef = firebase.database().ref(this.getDatabaseName());
    this.messagesRef.off();
    const onReceive = (data) => {
      const message = data.val();
      callback({
        _id: data.key,
        text: message.text,
        createdAt: new Date(message.createdAt),
        user: {
          _id: message.user._id,
          name: message.user.name
        }
      })
    };

    this.messagesRef.limitToLast(100).on('child_added', onReceive);
  }

  sendMessage(message) {
    for (i = 0; i < message.length; i++) {
      console.log("sendMessage: " + JSON.stringify(message[i]));
      this.messagesRef.push({
        text: message[i].text,
        user: message[i].user,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      })
    }
  }

  closeChat() {
    if (this.messagesRef) {
      this.messagesRef.off();
    }
  }
}