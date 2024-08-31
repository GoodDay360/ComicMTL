// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');
// importScripts('https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js')
// importScripts('https://cdn.jsdelivr.net/npm/dayjs@1/locale/km.js'); dayjs.locale('km');


// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyDDZ0wd0PfhdbmPnneakeCs9PbaRjGuLCo",
    authDomain: "ngslibrary-34210.firebaseapp.com",
    projectId: "ngslibrary-34210",
    storageBucket: "ngslibrary-34210.appspot.com",
    messagingSenderId: "839206585637",
    appId: "1:839206585637:web:e37bf61fbb8f081405c6cc",
    measurementId: "G-QY107DP1DP"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    const notification=JSON.parse(payload);
    console.log(payload)
    const notificationOption={
        body:notification.body,
        icon:notification.icon,
    };
    return self.registration.showNotification(payload.notification.title,notificationOption);
});