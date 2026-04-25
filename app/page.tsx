"use client";

import { geoMercator } from "d3-geo";
import { AnimatePresence, motion } from "framer-motion";
import { Cormorant_Garamond } from "next/font/google";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, Graticule, Marker } from "react-simple-maps";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";

type Stop = {
  city: string;
  country: string;
  travelMode: string;
  quote: string;
  coordinates: [number, number];
  photoKey: string;
  layoverNote?: string;
};

type StoryPage = {
  title?: string;
  text: string;
};

type ProposalPage = {
  title: string;
  text: string;
  imageSrc?: string;
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
  { code: "de", label: "Deutsch" },
  { code: "tr", label: "Türkçe" }
] as const;

type AppLanguage = (typeof LANGUAGES)[number]["code"];
const LANGUAGE_STORAGE_KEY = "project-moon-language";

const STOPS: Stop[] = [
  {
    city: "Madrid",
    country: "Spain (Start)",
    travelMode: "Beginning",
    quote: "Every story needs a beginning, and ours began under the warm Spanish sun.",
    coordinates: [-3.7038, 40.4168],
    photoKey: "spain"
  },
  {
    city: "Ankara",
    country: "Turkey",
    travelMode: "via fly",
    quote: "I wonder how our bestie is doing, we should check in on him...",
    coordinates: [32.8597, 39.9334],
    photoKey: "ankara-1"
  },
  {
    city: "Istanbul",
    country: "Turkey",
    travelMode: "via bus",
    quote: "I miss Xiǎomāo, cant wait to meet him again!",
    coordinates: [28.9784, 41.0082],
    photoKey: "istanbul"
  },
  {
    city: "Ankara",
    country: "Turkey",
    travelMode: "via bus",
    quote: "We rolled back to Ankara with full hearts and one more chapter ready to unfold.",
    coordinates: [32.8597, 39.9334],
    photoKey: "ankara-1"
  },
  {
    city: "Warsaw",
    country: "Poland",
    travelMode: "via fly",
    quote: "We need to go back for the museums!",
    coordinates: [21.0122, 52.2297],
    photoKey: "warsaw"
  },
  {
    city: "Kutaisi",
    country: "Georgia",
    travelMode: "via fly",
    quote: "I hope Georgie is doing good!",
    coordinates: [42.6931, 42.2662],
    photoKey: "kutaisi"
  },
  {
    city: "Tbilisi",
    country: "Georgia",
    travelMode: "via bus",
    quote: "The view was so good for Xiǎomāo!",
    coordinates: [44.793, 41.7151],
    photoKey: "tbilisi"
  },
  {
    city: "Yerevan",
    country: "Armenia",
    travelMode: "via bus",
    quote: "I'm still scared of the mob, but oh well!",
    coordinates: [44.5152, 40.1872],
    photoKey: "yerevan"
  },
  {
    city: "Istanbul",
    country: "Turkey",
    travelMode: "via fly",
    quote: "Well Burger king and Popeyes were good...",
    coordinates: [28.9784, 41.0082],
    photoKey: "istanbul",
    layoverNote: "Oops, you missed your flight."
  },
  {
    city: "Ankara",
    country: "Turkey",
    travelMode: "via fly",
    quote: "How you know I'm Dominican Papi?",
    coordinates: [32.8597, 39.9334],
    photoKey: "ankara-2"
  }
];

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
const CARD_ANIMATION_MS = 3;
const TRAVEL_START_DELAY_MS = 500;
const ARRIVAL_PAUSE_MS = 500;
const MAP_WIDTH = 960;
const MAP_HEIGHT = 560;
const PROJECTION_SCALE = 5500;
const BASE_PROJECTION_CENTER = STOPS[0].coordinates;
const OCEAN_COLOR = "#dff1ff";
const LAND_COLOR = "#5f7f71";
const BORDER_COLOR = "#2f473c";
const GRID_COLOR = "#8fb1c4";
const TRAIL_COLOR = "#9b5de5";
const PHOTO_ROTATION_MS = 2000;
const FALLBACK_PHOTOS = ["/cute-world-map.webp"];
const PHOTO_FOLDER_KEYS = ["spain", "ankara-1", "ankara-2", "warsaw", "kutaisi", "tbilisi", "yerevan", "istanbul", "final"] as const;
const AUDIO_TRACKS = [
  { label: "English", src: "/English.mp3" },
  { label: "Español", src: "/Spanish.mp3" },
  { label: "中文", src: "/Chinese.mp3" },
  { label: "Deutsch", src: "/German.mp3" },
  { label: "Türkçe", src: "/Turkish.mp3" }
] as const;

const APP_COPY: Record<
  AppLanguage,
  Record<
    | "journeyTitle"
    | "welcomeLabel"
    | "welcomeHeading"
    | "welcomeText"
    | "fullExperience"
    | "audios"
    | "goodStuff"
    | "audioCornerTitle"
    | "audioCornerSubtitle"
    | "backToHome"
    | "continue"
    | "oneLastThing"
    | "girlfriendQuestion"
    | "yes"
    | "no"
    | "back"
    | "turnPage"
    | "beginJourney"
    | "continueJourney"
    | "finish"
    | "mapBeginHint"
    | "begin"
    | "onward"
    | "quickStop"
    | "memoryCard"
    | "layoverAlert"
    | "quotePrefix"
    | "traveling"
    | "seeFinale"
    | "next"
    | "finaleTitle"
    | "finaleQuestionButton"
    | "nextAdventureQuestion"
    | "readyConfirm"
    | "page"
    | "oneLastThingCaps"
    | "languageLabel"
    | "close",
    string
  >
> = {
  en: {
    journeyTitle: "Our Journey",
    welcomeLabel: "WELCOME",
    welcomeHeading: "Welcome to the Surprise",
    welcomeText: "Pick how you want to experience it.",
    fullExperience: "Give Me the Full Experience",
    audios: "Audios",
    goodStuff: "Give Me the Good Stuff",
    audioCornerTitle: "Audio Corner",
    audioCornerSubtitle: "Tap a track to play your saved audios.",
    backToHome: "Back to Home",
    continue: "Continue",
    oneLastThing: "One last thing...",
    girlfriendQuestion: "Will you be my girlfriend Luna?",
    yes: "Yes",
    no: "No",
    back: "Back",
    turnPage: "Turn Page",
    beginJourney: "Begin the Journey",
    continueJourney: "Continue Journey",
    finish: "Finish",
    mapBeginHint: "And this all started in the magical ancient land of Spain...",
    begin: "Begin",
    onward: "Onward",
    quickStop: "Quick stop before the next chapter...",
    memoryCard: "Memory Card",
    layoverAlert: "Layover Alert",
    quotePrefix: "[QUOTE]",
    traveling: "Traveling...",
    seeFinale: "See the Finale",
    next: "Next",
    finaleTitle: "Every journey was better because you were there.",
    finaleQuestionButton: "I have one more question...",
    nextAdventureQuestion: "Will you go on the next adventure with me?",
    readyConfirm: "Are you sure youre ready?",
    page: "PAGE",
    oneLastThingCaps: "ONE LAST THING...",
    languageLabel: "App Language",
    close: "Close"
  },
  es: {
    journeyTitle: "Nuestro Viaje",
    welcomeLabel: "BIENVENIDA",
    welcomeHeading: "Bienvenida a la sorpresa",
    welcomeText: "Elige como quieres vivirla.",
    fullExperience: "Quiero la experiencia completa",
    audios: "Audios",
    goodStuff: "Quiero lo bueno",
    audioCornerTitle: "Rincon de audio",
    audioCornerSubtitle: "Toca una pista para reproducir tus audios guardados.",
    backToHome: "Volver al inicio",
    continue: "Continuar",
    oneLastThing: "Una cosa mas...",
    girlfriendQuestion: "Quieres ser mi novia, Luna?",
    yes: "Si",
    no: "No",
    back: "Atras",
    turnPage: "Pasar pagina",
    beginJourney: "Comenzar el viaje",
    continueJourney: "Continuar viaje",
    finish: "Terminar",
    mapBeginHint: "Y todo esto comenzo en la magica y antigua tierra de Espana...",
    begin: "Comenzar",
    onward: "Seguimos",
    quickStop: "Parada rapida antes del siguiente capitulo...",
    memoryCard: "Tarjeta de recuerdos",
    layoverAlert: "Alerta de escala",
    quotePrefix: "[CITA]",
    traveling: "Viajando...",
    seeFinale: "Ver el final",
    next: "Siguiente",
    finaleTitle: "Cada viaje fue mejor porque estabas ahi.",
    finaleQuestionButton: "Tengo una pregunta mas...",
    nextAdventureQuestion: "Iras en la proxima aventura conmigo?",
    readyConfirm: "Seguro que estas lista?",
    page: "PAGINA",
    oneLastThingCaps: "UNA ULTIMA COSA...",
    languageLabel: "Idioma de la app",
    close: "Cerrar"
  },
  zh: {
    journeyTitle: "我们的旅程",
    welcomeLabel: "欢迎",
    welcomeHeading: "欢迎来到这个惊喜",
    welcomeText: "选择你想体验它的方式。",
    fullExperience: "给我完整体验",
    audios: "音频",
    goodStuff: "给我重点内容",
    audioCornerTitle: "音频角落",
    audioCornerSubtitle: "点按音轨即可播放你保存的音频。",
    backToHome: "返回首页",
    continue: "继续",
    oneLastThing: "还有一件事...",
    girlfriendQuestion: "Luna，你愿意做我女朋友吗？",
    yes: "愿意",
    no: "不要",
    back: "返回",
    turnPage: "翻页",
    beginJourney: "开始旅程",
    continueJourney: "继续旅程",
    finish: "完成",
    mapBeginHint: "这一切都始于神奇而古老的西班牙...",
    begin: "开始",
    onward: "继续前进",
    quickStop: "下一章前的短暂停留...",
    memoryCard: "回忆卡片",
    layoverAlert: "中转提醒",
    quotePrefix: "[语录]",
    traveling: "旅行中...",
    seeFinale: "查看结尾",
    next: "下一步",
    finaleTitle: "因为有你，每段旅程都更美好。",
    finaleQuestionButton: "我还有一个问题...",
    nextAdventureQuestion: "你愿意和我开始下一次冒险吗？",
    readyConfirm: "你确定准备好了吗？",
    page: "第",
    oneLastThingCaps: "最后一件事...",
    languageLabel: "应用语言",
    close: "关闭"
  },
  de: {
    journeyTitle: "Unsere Reise",
    welcomeLabel: "WILLKOMMEN",
    welcomeHeading: "Willkommen zur Ueberraschung",
    welcomeText: "Waehle, wie du es erleben moechtest.",
    fullExperience: "Ich will das volle Erlebnis",
    audios: "Audios",
    goodStuff: "Zeig mir das Gute",
    audioCornerTitle: "Audio Ecke",
    audioCornerSubtitle: "Tippe auf einen Track, um deine gespeicherten Audios abzuspielen.",
    backToHome: "Zurueck zur Startseite",
    continue: "Weiter",
    oneLastThing: "Eine letzte Sache...",
    girlfriendQuestion: "Willst du meine Freundin sein, Luna?",
    yes: "Ja",
    no: "Nein",
    back: "Zurueck",
    turnPage: "Seite umblaettern",
    beginJourney: "Reise beginnen",
    continueJourney: "Reise fortsetzen",
    finish: "Fertig",
    mapBeginHint: "Und all das begann im magischen alten Land Spanien...",
    begin: "Start",
    onward: "Weiter",
    quickStop: "Kurzer Halt vor dem naechsten Kapitel...",
    memoryCard: "Erinnerungskarte",
    layoverAlert: "Zwischenstopp Alarm",
    quotePrefix: "[ZITAT]",
    traveling: "Unterwegs...",
    seeFinale: "Finale ansehen",
    next: "Weiter",
    finaleTitle: "Jede Reise war besser, weil du dabei warst.",
    finaleQuestionButton: "Ich habe noch eine Frage...",
    nextAdventureQuestion: "Willst du mit mir ins naechste Abenteuer gehen?",
    readyConfirm: "Bist du sicher, dass du bereit bist?",
    page: "SEITE",
    oneLastThingCaps: "EINE LETZTE SACHE...",
    languageLabel: "App Sprache",
    close: "Schliessen"
  },
  tr: {
    journeyTitle: "Bizim Yolculugumuz",
    welcomeLabel: "HOS GELDIN",
    welcomeHeading: "Surprize hos geldin",
    welcomeText: "Bunu nasil deneyimlemek istedigini sec.",
    fullExperience: "Tam deneyimi ver",
    audios: "Sesler",
    goodStuff: "Asil kismi ver",
    audioCornerTitle: "Ses Kosesi",
    audioCornerSubtitle: "Kayitli seslerini calmak icin bir parcaya dokun.",
    backToHome: "Ana sayfaya don",
    continue: "Devam et",
    oneLastThing: "Son bir sey...",
    girlfriendQuestion: "Luna, benim kiz arkadasim olur musun?",
    yes: "Evet",
    no: "Hayir",
    back: "Geri",
    turnPage: "Sayfa cevir",
    beginJourney: "Yolculugu baslat",
    continueJourney: "Yolculuga devam et",
    finish: "Bitir",
    mapBeginHint: "Ve her sey Ispanya'nin buyulu eski topraklarinda basladi...",
    begin: "Basla",
    onward: "Ileri",
    quickStop: "Sonraki bolumden once kisa bir durak...",
    memoryCard: "Ani karti",
    layoverAlert: "Aktarma Uyarisi",
    quotePrefix: "[ALINTI]",
    traveling: "Yoldayiz...",
    seeFinale: "Finali gor",
    next: "Siradaki",
    finaleTitle: "Sen yanimdayken her yolculuk daha guzeldi.",
    finaleQuestionButton: "Bir sorum daha var...",
    nextAdventureQuestion: "Benimle bir sonraki maceraya gelir misin?",
    readyConfirm: "Hazir olduguna emin misin?",
    page: "SAYFA",
    oneLastThingCaps: "SON BIR SEY...",
    languageLabel: "Uygulama dili",
    close: "Kapat"
  }
};

const VIDEO_SRC_RE = /\.(mp4|webm|mov)(?:$|[?#])/i;
const memoryMediaClassName = "block max-h-full max-w-full object-contain rounded-[1.75rem]";
const fairyTaleFont = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "600", "700"] });
const STORYBOOK_PAGES = [
  {
    title: "Once upon a time...",
    text: "In a far distant land known as Spain, there lived a girl who was a little bit autistic, and very happy with colors and fabric, she did some time in taiwan but she always came back to Spain, and she was very happy with her work and lifestyle."
  },
  {
    text: "Then, she met a boy who was a little bit autistic, and he was very beep beep boop boop and also a little autist, he was a little bit shy but she was interested in his shitty work ethic and math skills. They lived a close few thousdand kilometers away but she was still curious about this little autistic boy, so like the cougar she is, she took a chance."
  },
  {
    text: "But then the little autistic boy went back to the beautiful land, and she was very sad, not knowing if she would see him again..."
  },
  {
    text: "The autistic girl was very excited to see the autistic boy again! She told him that she was going to the land of meat (Turkey) and to meet him there. And the Autistic boy was very excited to see the autistic girl again!"
  },
  {
    text: "They explored the land of meat together and had a great time and made some wonderful memories together, they laughed, they cried, they loved, but then the Autistic boy said he needed to go and that left her very sad... But then he said he was going to see her again and that made her very happy..."
  },
  {
    text: "And one day the autistic girl got a text from the autistic boy saying that he was going to the land of Poles (Poland) and to meet him there. And the Autistic girl was very excited to see the autistic boy again!"
  },
  {
    text: "They explored the land of Poles together and had a great time and made some wonderful memories together that they decided to go to the wannabe American state of Georgia!"
  },
  {
    text: "The wannabe state of Georgia was so great, they decided to go to the land of the arms (Armenia) and see if there was anything there for them..."
  },
  {
    text: "They had a run-in with the mob and got scared (mainly the autist boy), so the autistic boy decided to spend some money and they lived like royals for a few days but then the autistic girl invited the autistic boy to her place in the land of meat!"
  },
  {
    text: "They lived together in the land of meat for a few weeks and had a mishap here and there but they made thorugh it together and they were very happy together, they were just perfect for each other, but then the Autistic boy said he needed to go and that left her very sad..."
  },
  {
    text: "But just because he is gone, doesnt mean their story is over, so I have a question for you..."
  }
] as const;
const PROPOSAL_ENDING_PAGES: ReadonlyArray<{ title: string; text: string; imageSrc?: string }> = [
  {
    title: "A Tiny Promise",
    text: "No matter where we go next, I want every map, every airport, and every little memory to have us in it. So..."
  },
  {
    title: "Wrap Up",
    text: "The autistic boy and the autistic girl decided to date, and every chapter so far created a beautiful story. Finishing this chapter means that the story is not over, and that they will continue to be together and make more beautiful memories together, but this is..."
  },
  {
    title: "The End",
    text: "The end of the chapter, and the beginning of the story! Thank you for reading, and thank you for being a part of our story..."
  }
] as const;

const STOP_TRANSLATIONS: Record<AppLanguage, Array<Pick<Stop, "city" | "country" | "travelMode" | "quote" | "layoverNote">>> = {
  en: STOPS.map(({ city, country, travelMode, quote, layoverNote }) => ({ city, country, travelMode, quote, layoverNote })),
  es: [
    { city: "Madrid", country: "Espana (Inicio)", travelMode: "Comienzo", quote: "Toda historia necesita un comienzo, y la nuestra empezo bajo el calido sol espanol." },
    { city: "Ankara", country: "Turquia", travelMode: "en avion", quote: "Me pregunto como estara nuestro bestie, deberiamos escribirle..." },
    { city: "Estambul", country: "Turquia", travelMode: "en bus", quote: "Extrano a Xiaomao, no veo la hora de volver a verlo!" },
    { city: "Ankara", country: "Turquia", travelMode: "en bus", quote: "Volvimos a Ankara con el corazon lleno y otro capitulo listo para abrirse." },
    { city: "Varsovia", country: "Polonia", travelMode: "en avion", quote: "Tenemos que volver por los museos!" },
    { city: "Kutaisi", country: "Georgia", travelMode: "en avion", quote: "Espero que Georgie este bien!" },
    { city: "Tiflis", country: "Georgia", travelMode: "en bus", quote: "La vista estaba buenisima para Xiaomao!" },
    { city: "Erevan", country: "Armenia", travelMode: "en bus", quote: "Sigo asustado por la mafia, pero bueno!" },
    { city: "Estambul", country: "Turquia", travelMode: "en avion", quote: "Bueno, Burger King y Popeyes estuvieron buenos...", layoverNote: "Ups, perdiste tu vuelo." },
    { city: "Ankara", country: "Turquia", travelMode: "en avion", quote: "Como sabes que soy dominicano, papi?" }
  ],
  zh: [
    { city: "马德里", country: "西班牙（起点）", travelMode: "开始", quote: "每个故事都需要一个开始，而我们的故事始于温暖的西班牙阳光下。" },
    { city: "安卡拉", country: "土耳其", travelMode: "飞机", quote: "不知道我们的好朋友怎么样了，我们该去看看他..." },
    { city: "伊斯坦布尔", country: "土耳其", travelMode: "大巴", quote: "我想念小猫，等不及再见到他！" },
    { city: "安卡拉", country: "土耳其", travelMode: "大巴", quote: "我们带着满满的心意回到安卡拉，又一个章节准备展开。" },
    { city: "华沙", country: "波兰", travelMode: "飞机", quote: "我们一定要为了博物馆再回来！" },
    { city: "库塔伊西", country: "格鲁吉亚", travelMode: "飞机", quote: "希望Georgie一切都好！" },
    { city: "第比利斯", country: "格鲁吉亚", travelMode: "大巴", quote: "这风景对小猫来说太棒了！" },
    { city: "埃里温", country: "亚美尼亚", travelMode: "大巴", quote: "我还是有点怕黑帮，不过算了！" },
    { city: "伊斯坦布尔", country: "土耳其", travelMode: "飞机", quote: "嗯，汉堡王和Popeyes确实不错...", layoverNote: "糟糕，你错过航班了。" },
    { city: "安卡拉", country: "土耳其", travelMode: "飞机", quote: "你怎么知道我是多米尼加帅哥？" }
  ],
  de: [
    { city: "Madrid", country: "Spanien (Start)", travelMode: "Beginn", quote: "Jede Geschichte braucht einen Anfang, und unsere begann unter der warmen spanischen Sonne." },
    { city: "Ankara", country: "Tuerkei", travelMode: "mit Flug", quote: "Ich frage mich, wie es unserem Bestie geht, wir sollten mal nachfragen..." },
    { city: "Istanbul", country: "Tuerkei", travelMode: "mit Bus", quote: "Ich vermisse Xiaomao, kann es kaum erwarten, ihn wiederzusehen!" },
    { city: "Ankara", country: "Tuerkei", travelMode: "mit Bus", quote: "Wir rollten mit vollen Herzen nach Ankara zurueck, bereit fuer das naechste Kapitel." },
    { city: "Warschau", country: "Polen", travelMode: "mit Flug", quote: "Wir muessen fuer die Museen nochmal zurueck!" },
    { city: "Kutaisi", country: "Georgien", travelMode: "mit Flug", quote: "Ich hoffe, Georgie geht es gut!" },
    { city: "Tiflis", country: "Georgien", travelMode: "mit Bus", quote: "Die Aussicht war so gut fuer Xiaomao!" },
    { city: "Eriwan", country: "Armenien", travelMode: "mit Bus", quote: "Ich habe immer noch Angst vor der Mafia, aber na gut!" },
    { city: "Istanbul", country: "Tuerkei", travelMode: "mit Flug", quote: "Naja, Burger King und Popeyes waren gut...", layoverNote: "Ups, du hast deinen Flug verpasst." },
    { city: "Ankara", country: "Tuerkei", travelMode: "mit Flug", quote: "Woher weisst du, dass ich dominikanisch bin, papi?" }
  ],
  tr: [
    { city: "Madrid", country: "Ispanya (Baslangic)", travelMode: "Baslangic", quote: "Her hikayenin bir baslangici vardir, bizimki de sicak Ispanya gunesi altinda basladi." },
    { city: "Ankara", country: "Turkiye", travelMode: "ucakla", quote: "Bestie nasil acaba, ona bir bakalim..." },
    { city: "Istanbul", country: "Turkiye", travelMode: "otobusle", quote: "Xiaomao'yu ozledim, tekrar gormek icin sabirsizim!" },
    { city: "Ankara", country: "Turkiye", travelMode: "otobusle", quote: "Kalbimiz dolu sekilde Ankara'ya donduk, bir bolum daha acilmaya hazirdi." },
    { city: "Varsova", country: "Polonya", travelMode: "ucakla", quote: "Muzeler icin kesin geri donmeliyiz!" },
    { city: "Kutaisi", country: "Gurcistan", travelMode: "ucakla", quote: "Umarim Georgie iyidir!" },
    { city: "Tiflis", country: "Gurcistan", travelMode: "otobusle", quote: "Manzara Xiaomao icin harikaydi!" },
    { city: "Erivan", country: "Ermenistan", travelMode: "otobusle", quote: "Hala mafyadan korkuyorum ama neyse!" },
    { city: "Istanbul", country: "Turkiye", travelMode: "ucakla", quote: "Burger King ve Popeyes iyiydi aslinda...", layoverNote: "Eyvah, ucagi kacirdin." },
    { city: "Ankara", country: "Turkiye", travelMode: "ucakla", quote: "Dominikli oldugumu nereden biliyorsun papi?" }
  ]
};

const STORYBOOK_PAGES_BY_LANGUAGE: Record<AppLanguage, StoryPage[]> = {
  en: [...STORYBOOK_PAGES],
  es: [
    { title: "Habia una vez...", text: "En una tierra lejana llamada Espana vivia una chica muy feliz con los colores y las telas. Habia pasado un tiempo en Taiwan, pero siempre volvia a Espana, feliz con su trabajo y su estilo de vida." },
    { text: "Luego conocio a un chico timido pero brillante en matematicas. Vivian a miles de kilometros, pero ella tenia curiosidad, y como buena aventurera, se atrevio a intentarlo." },
    { text: "Pero el chico tuvo que volver a su tierra y ella se quedo triste, sin saber si volverian a verse..." },
    { text: "La chica se emociono cuando supo que iria a Turquia para reencontrarse con el. El chico tambien estaba feliz de verla otra vez." },
    { text: "Exploraron Turquia juntos, rieron, lloraron y crearon recuerdos preciosos. Cuando el tuvo que irse, ella se puso triste... hasta que el prometio volver a verla." },
    { text: "Un dia ella recibio un mensaje: el iria a Polonia y queria que se encontraran alla. Ella se emociono muchisimo." },
    { text: "Recorrieron Polonia juntos y la pasaron tan bien que decidieron ir tambien a Georgia." },
    { text: "Georgia les gusto tanto que despues fueron a Armenia para descubrir que mas les esperaba." },
    { text: "Tuvieron un susto con la mafia y se asustaron, sobre todo el chico. Asi que gastaron un poco mas y vivieron como reyes unos dias, hasta volver a Turquia." },
    { text: "Vivieron juntos en Turquia por unas semanas, con algunos tropiezos, pero siempre unidos y felices. Parecian hechos el uno para el otro, hasta que el tuvo que irse otra vez." },
    { text: "Pero que el se haya ido no significa que su historia haya terminado..." }
  ],
  zh: [
    { title: "从前...", text: "在遥远的西班牙，有一位热爱色彩与布料的女孩。她曾在台湾生活一段时间，但总会回到西班牙，过着自己喜欢的生活。" },
    { text: "后来她遇见了一个有点害羞、数学很厉害的男孩。虽然相隔几千公里，她还是决定勇敢试一试。" },
    { text: "后来男孩回到了自己的国家，她很难过，不知道还能不能再见..." },
    { text: "当她告诉男孩自己要去土耳其见他时，两个人都非常兴奋。" },
    { text: "他们一起探索土耳其，欢笑、落泪、相爱，留下许多珍贵回忆。后来男孩说要离开，她很伤心... 但他也说还会再见面。" },
    { text: "有一天，女孩收到消息：男孩要去波兰，希望在那里见面。她再次开心起来。" },
    { text: "他们在波兰玩得很开心，于是决定接着去格鲁吉亚。" },
    { text: "格鲁吉亚太棒了，他们又去了亚美尼亚，看看那里会有什么故事。" },
    { text: "他们遇到了一点危险，被吓到了（尤其是男孩）。后来他们花了点钱，像皇室一样度过了几天，之后又回到土耳其。" },
    { text: "他们在土耳其同住了几周，虽然有些小插曲，但总能一起度过，依然幸福。可男孩又要离开了，她再次难过。" },
    { text: "但离开并不代表故事结束..." }
  ],
  de: [
    { title: "Es war einmal...", text: "In einem fernen Land namens Spanien lebte ein Maedchen, das Farben und Stoffe liebte. Sie war eine Zeit lang in Taiwan, kam aber immer nach Spanien zurueck und war gluecklich mit ihrem Leben." },
    { text: "Dann traf sie einen Jungen, etwas schuechtern, aber stark in Mathe. Obwohl sie tausende Kilometer entfernt lebten, war sie neugierig und wagte den Schritt." },
    { text: "Doch der Junge kehrte in sein Land zurueck, und sie war traurig, weil sie nicht wusste, ob sie sich wiedersehen..." },
    { text: "Das Maedchen freute sich sehr: Sie wollte in die Tuerkei reisen, um ihn zu treffen. Der Junge freute sich genauso." },
    { text: "Sie erkundeten gemeinsam die Tuerkei, lachten, weinten und sammelten wunderschoene Erinnerungen. Als er gehen musste, war sie traurig... bis er versprach, sie wiederzusehen." },
    { text: "Eines Tages schrieb der Junge, dass er nach Polen fliegt und sie sich dort treffen sollten. Sie war wieder voller Vorfreude." },
    { text: "Sie erkundeten Polen und hatten so eine gute Zeit, dass sie danach weiter nach Georgien reisten." },
    { text: "Georgien war so schoen, dass sie beschlossen, auch Armenien zu besuchen." },
    { text: "Sie gerieten in eine unangenehme Begegnung mit der Mafia und hatten Angst, vor allem der Junge. Danach goennten sie sich ein paar royale Tage und kehrten spaeter in die Tuerkei zurueck." },
    { text: "Sie lebten einige Wochen zusammen in der Tuerkei, mit kleinen Pannen, aber immer gemeinsam und gluecklich. Dann musste der Junge wieder gehen." },
    { text: "Aber nur weil er weg ist, bedeutet das nicht das Ende ihrer Geschichte..." }
  ],
  tr: [
    { title: "Bir varmis bir yokmus...", text: "Uzaklardaki Ispanya'da renkleri ve kumaslari cok seven bir kiz yasarmis. Bir sure Tayvan'da bulunmus ama hep Ispanya'ya donmus ve hayatindan memnunmus." },
    { text: "Sonra biraz utangac ama matematikte cok iyi bir cocukla tanismis. Aralarinda binlerce kilometre olmasina ragmen kiz sansini denemis." },
    { text: "Fakat cocuk ulkesine geri donunce kiz cok uzulmus, onu tekrar gorup goremeyecegini bilmiyormus..." },
    { text: "Kiz, Turkiye'ye gidip cocugu gorecegini soyleyince ikisi de cok heyecanlanmis." },
    { text: "Turkiye'yi birlikte gezmisler; gulmusler, aglamislar ve guzel anilar biriktirmisler. Cocuk gitmek zorunda kalinca kiz uzulmus... ama yeniden goruseceklerini soylemis." },
    { text: "Bir gun kiz, cocuktan mesaj almis: Polonya'ya gidiyormus ve orada bulusalim demis. Kiz yine cok sevinmis." },
    { text: "Polonya'yi birlikte gezmisler, o kadar keyif almislarki sonra Gurcistan'a gitmeye karar vermisler." },
    { text: "Gurcistan'i da cok sevince Ermenistan'a gecmisler, bakalim orada ne var diye." },
    { text: "Mafyayla korkutucu bir an yasamislar (ozellikle cocuk cok korkmus). Sonra biraz para harcayip birkac gun krallar gibi yasamislar ve tekrar Turkiye'ye donmusler." },
    { text: "Turkiye'de birkac hafta birlikte yasamislar; bazen aksilik olsa da birlikte atlatmislar. Sonra cocuk yine gitmek zorunda kalmis." },
    { text: "Ama onun gitmesi hikayenin bittigi anlamina gelmiyor..." }
  ]
};

const PROPOSAL_ENDING_PAGES_BY_LANGUAGE: Record<AppLanguage, ProposalPage[]> = {
  en: [...PROPOSAL_ENDING_PAGES],
  es: [
    { title: "Una pequena promesa", text: "No importa adonde vayamos despues, quiero que cada mapa, cada aeropuerto y cada pequeno recuerdo nos tenga a los dos. Asi que..." },
    { title: "Cierre", text: "El chico y la chica decidieron estar juntos, y cada capitulo construyo una historia hermosa. Terminar este capitulo no significa el final, solo que seguiran creando recuerdos, pero esto es..." },
    { title: "Fin", text: "El final del capitulo y el comienzo de la historia. Gracias por leer y por ser parte de nuestra historia..." }
  ],
  zh: [
    { title: "一个小小的承诺", text: "不管我们下一站去哪里，我都希望每一张地图、每一个机场、每一段小回忆里都有我们。所以..." },
    { title: "收尾", text: "男孩和女孩决定在一起，到目前为止的每一章都让故事更美。这个章节结束并不代表故事结束，他们还会继续一起创造更多回忆，而这只是..." },
    { title: "终章", text: "这一章的结束，也是故事真正的开始。谢谢你读到这里，也谢谢你成为我们故事的一部分..." }
  ],
  de: [
    { title: "Ein kleines Versprechen", text: "Egal wohin wir als naechstes gehen, ich will, dass in jeder Karte, jedem Flughafen und jeder kleinen Erinnerung immer wir beide vorkommen. Also..." },
    { title: "Abschluss", text: "Der Junge und das Maedchen entschieden sich, zusammen zu sein. Jedes Kapitel hat bisher eine wunderschoene Geschichte geschaffen. Dieses Kapitel zu beenden heisst nicht das Ende, sondern dass sie weiter gemeinsam Erinnerungen machen, aber das ist..." },
    { title: "Das Ende", text: "Das Ende dieses Kapitels und der Anfang der ganzen Geschichte. Danke fuers Lesen und danke, dass du Teil unserer Geschichte bist..." }
  ],
  tr: [
    { title: "Kucuk bir soz", text: "Sirada nereye gidersek gidelim, her haritada, her havaalaninda ve her guzel anida ikimiz de olalim istiyorum. O yuzden..." },
    { title: "Kapanis", text: "Cocuk ve kiz birlikte olmaya karar verdi, ve her bolum simdiye kadar guzel bir hikaye olusturdu. Bu bolumun bitmesi hikayenin bittigi anlamina gelmiyor; birlikte yeni anilar yapmaya devam edecekler, ama bu..." },
    { title: "Son", text: "Bolumun sonu ve hikayenin baslangici. Okudugun icin ve hikayemizin bir parcasi oldugun icin tesekkurler..." }
  ]
};

const INTRO_STORY_LAST_PAGE = 3;
const FINAL_STORY_PAGE_INDEX = STORYBOOK_PAGES.length - 1;
const STORYBOOK_EXIT_MS = 420;
const MOBILE_CARD_EXIT_MS = 320;
const ENDING_STORY_PAGES: number[] = [9, 10];
const ANKARA_RETURN_STOP_INDEX = STOPS.findIndex((stop) => stop.city === "Ankara" && stop.travelMode.toLowerCase().includes("bus"));
const STORY_PAGES_FOR_NEXT_STOP: Partial<Record<number, number[]>> = {
  3: [4], // Istanbul -> Ankara (return by bus)
  4: [5], // Ankara -> Warsaw (by flight)
  5: [6], // Warsaw -> Kutaisi (after Poland)
  7: [7], // Tbilisi -> Yerevan (bus)
  8: [8],
  10: [9,10] // Yerevan -> Istanbul
};
const JOURNEY_STORY_SEQUENCES: Array<{ pages: number[]; toStop: number }> = [
  { pages: [4], toStop: 3 },
  { pages: [5], toStop: 4 },
  { pages: [6, 7], toStop: 5 },
  { pages: [8], toStop: 7 },
  { pages: [9], toStop: 8 }
];

function isVideoMediaSrc(src: string) {
  return VIDEO_SRC_RE.test(src);
}

function MemoryMediaCover({ src, label, eager = false }: { src: string; label: string; eager?: boolean }) {
  if (isVideoMediaSrc(src)) {
    return (
      <video
        src={src}
        aria-label={label}
        className={memoryMediaClassName}
        muted
        playsInline
        controls={false}
        preload="metadata"
        tabIndex={-1}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          const t = v.duration > 0 && !Number.isNaN(v.duration) ? Math.min(0.1, v.duration * 0.01) : 0.1;
          try {
            v.currentTime = t;
          } catch {
            v.currentTime = 0.1;
          }
        }}
        onSeeked={(e) => {
          e.currentTarget.pause();
        }}
        onPlay={(e) => {
          e.currentTarget.pause();
        }}
      />
    );
  }
  return <img src={src} alt={label} className={memoryMediaClassName} loading={eager ? "eager" : "lazy"} />;
}

const StaticMapLayer = memo(function StaticMapLayer() {
  return (
    <>
      <Graticule stroke={GRID_COLOR} strokeWidth={0.45} />
      <Geographies geography={GEO_URL}>
        {({ geographies }: { geographies: any[] }) =>
          geographies.map((geo: any) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={LAND_COLOR}
              stroke={BORDER_COLOR}
              strokeWidth={0.9}
              style={{
                default: { outline: "none" },
                hover: { outline: "none" },
                pressed: { outline: "none" }
              }}
            />
          ))
        }
      </Geographies>
    </>
  );
});

function getRoutePoint(from: [number, number], to: [number, number], mode: string, t: number): [number, number] {
  const lng = from[0] + (to[0] - from[0]) * t;
  const lat = from[1] + (to[1] - from[1]) * t;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const distance = Math.hypot(dx, dy) || 1;
  const perp: [number, number] = [-dy / distance, dx / distance];

  if (mode.includes("bus")) {
    const envelope = Math.sin(Math.PI * t);
    const wave = Math.sin(t * Math.PI * 6);
    const amplitude = Math.min(1.15, distance * 0.08);
    return [lng + perp[0] * amplitude * envelope * wave, lat + perp[1] * amplitude * envelope * wave];
  }

  const arc = Math.sin(Math.PI * t);
  const arcAmplitude = Math.min(2.2, distance * 0.15);
  return [lng + perp[0] * arcAmplitude * arc, lat + perp[1] * arcAmplitude * arc];
}

function createProjectedRouteD(
  projection: ReturnType<typeof geoMercator>,
  from: [number, number],
  to: [number, number],
  mode: string,
  progress = 1
): string {
  const points: string[] = [];
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const steps = 140;
  const maxStep = Math.max(1, Math.ceil(steps * clampedProgress));
  for (let i = 0; i <= maxStep; i += 1) {
    const t = (i / maxStep) * clampedProgress;
    const geoPoint = getRoutePoint(from, to, mode, t);
    const projected = projection(geoPoint);
    if (!projected) continue;
    points.push(`${projected[0]} ${projected[1]}`);
  }
  const endpoint = projection(getRoutePoint(from, to, mode, clampedProgress));
  if (endpoint) {
    const endpointText = `${endpoint[0]} ${endpoint[1]}`;
    if (points[points.length - 1] !== endpointText) {
      points.push(endpointText);
    }
  }
  if (points.length < 2) return "";
  return `M ${points[0]} L ${points.slice(1).join(" L ")}`;
}

function getHeadingDegrees(from: [number, number], to: [number, number]): number {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return 0;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export default function HomePage() {
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showAudioHub, setShowAudioHub] = useState(false);
  const [showQuestionOnly, setShowQuestionOnly] = useState(false);
  const [showStorybook, setShowStorybook] = useState(false);
  const [storybookMode, setStorybookMode] = useState<"intro" | "journey" | "ending" | "proposalEnding">("intro");
  const [storyPage, setStoryPage] = useState(0);
  const [pendingStop, setPendingStop] = useState<number | null>(null);
  const [pendingJourneyPages, setPendingJourneyPages] = useState<number[]>([]);
  const [pendingJourneyPageIndex, setPendingJourneyPageIndex] = useState(0);
  const [hasUnlockedGoodStuff, setHasUnlockedGoodStuff] = useState(false);
  const [showGoodStuffConfirm, setShowGoodStuffConfirm] = useState(false);
  const [showGoodStuffQuestion, setShowGoodStuffQuestion] = useState(false);
  const [awaitingJourneyBegin, setAwaitingJourneyBegin] = useState(false);
  const [activeStop, setActiveStop] = useState(0);
  const [isTraveling, setIsTraveling] = useState(false);
  const [isTravelPending, setIsTravelPending] = useState(false);
  const [travelFrom, setTravelFrom] = useState<number | null>(null);
  const [travelProgress, setTravelProgress] = useState(0);
  const [showFinale, setShowFinale] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showMobileMemoryCard, setShowMobileMemoryCard] = useState(true);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [photoLibrary, setPhotoLibrary] = useState<Record<string, string[]>>({});
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const ankaraReturnAutoAdvanceDoneRef = useRef(false);

  const mapProjectionScale = PROJECTION_SCALE;
  const t = APP_COPY[language];
  const localizedStops = STOP_TRANSLATIONS[language];
  const storybookPages = STORYBOOK_PAGES_BY_LANGUAGE[language];
  const proposalEndingPages = PROPOSAL_ENDING_PAGES_BY_LANGUAGE[language];
  const selectedLanguageLabel = LANGUAGES.find((entry) => entry.code === language)?.label ?? "English";
  const current = STOPS[activeStop];
  const currentText = localizedStops[activeStop];
  const shouldHideMemoryCardForCurrentStop = activeStop === ANKARA_RETURN_STOP_INDEX;
  const isLastStop = activeStop === STOPS.length - 1;
  const travelCoordinates: [number, number] = (() => {
    if (isTraveling && travelFrom !== null) {
      const from = STOPS[travelFrom].coordinates;
      const to = STOPS[travelFrom + 1].coordinates;
      const mode = STOPS[travelFrom + 1].travelMode.toLowerCase();
      return getRoutePoint(from, to, mode, travelProgress);
    }
    return current.coordinates;
  })();
  const projection = useMemo(
    () =>
      geoMercator()
        .center(BASE_PROJECTION_CENTER)
        .scale(mapProjectionScale)
        .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]),
    [mapProjectionScale]
  );
  const projectedTravelPoint = projection(travelCoordinates);
  const panX = projectedTravelPoint ? MAP_WIDTH / 2 - projectedTravelPoint[0] : 0;
  const panY = projectedTravelPoint ? MAP_HEIGHT / 2 - projectedTravelPoint[1] : 0;

  const segments = useMemo(() => {
    return STOPS.slice(0, -1).map((stop, i) => ({
      key: `${stop.city}-${STOPS[i + 1].city}-${i}`,
      from: stop.coordinates,
      to: STOPS[i + 1].coordinates,
      mode: STOPS[i + 1].travelMode.toLowerCase()
    }));
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const isValid = LANGUAGES.some((entry) => entry.code === stored);
    if (isValid) {
      setLanguage(stored as AppLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (!showIntro) {
      setShowLanguagePopup(false);
    }
  }, [showIntro]);

  const projectedPaths = useMemo(() => {
    return segments.map((segment) => {
      const d = createProjectedRouteD(projection, segment.from, segment.to, segment.mode);
      return {
        key: segment.key,
        d
      };
    });
  }, [segments, projection]);

  const moveNoButton = () => {
    const x = Math.floor(Math.random() * 190) - 95;
    const y = Math.floor(Math.random() * 110) - 55;
    setNoPosition({ x, y });
  };

  const startJourney = () => {
    setActiveStop(0);
    setTravelFrom(null);
    setTravelProgress(0);
    setIsTraveling(false);
    setShowFinale(false);
    setShowQuestion(false);
    setShowAudioHub(false);
    setShowQuestionOnly(false);
    setShowStorybook(false);
    setStorybookMode("intro");
    setStoryPage(0);
    setPendingStop(null);
    setPendingJourneyPages([]);
    setPendingJourneyPageIndex(0);
    setAwaitingJourneyBegin(false);
    setShowMobileMemoryCard(false);
    setShowIntro(false);
    window.setTimeout(() => {
      runTravelToStop(1);
    }, STORYBOOK_EXIT_MS);
  };

  const openFullExperience = () => {
    setShowIntro(false);
    setShowAudioHub(false);
    setShowQuestionOnly(false);
    setShowStorybook(true);
    setStorybookMode("intro");
    setShowFinale(false);
    setShowQuestion(false);
    setStoryPage(0);
    setPendingStop(null);
    setPendingJourneyPages([]);
    setPendingJourneyPageIndex(0);
    setAwaitingJourneyBegin(false);
    setShowMobileMemoryCard(false);
  };

  const goToAudioHub = () => {
    setShowIntro(false);
    setShowAudioHub(true);
    setShowQuestionOnly(false);
    setAwaitingJourneyBegin(false);
    setShowFinale(false);
    setShowQuestion(false);
    setShowMobileMemoryCard(false);
  };

  const goToGoodStuff = () => {
    if (!hasUnlockedGoodStuff) {
      setShowGoodStuffConfirm(true);
      return;
    }
    setNoPosition({ x: 0, y: 0 });
    setShowGoodStuffQuestion(false);
    setShowIntro(false);
    setShowQuestionOnly(true);
    setShowAudioHub(false);
    setAwaitingJourneyBegin(false);
    setShowFinale(false);
    setShowQuestion(false);
    setShowMobileMemoryCard(false);
  };

  const goBackToHome = () => {
    setNoPosition({ x: 0, y: 0 });
    setShowGoodStuffQuestion(false);
    setShowIntro(true);
    setShowAudioHub(false);
    setShowQuestionOnly(false);
    setShowStorybook(false);
    setStorybookMode("intro");
    setAwaitingJourneyBegin(false);
    setShowFinale(false);
    setShowQuestion(false);
    setStoryPage(0);
    setPendingStop(null);
    setPendingJourneyPages([]);
    setPendingJourneyPageIndex(0);
    setShowMobileMemoryCard(false);
  };

  const beginFromSpain = () => {
    setAwaitingJourneyBegin(false);
    setShowMobileMemoryCard(false);
    const firstTravelStop = 1;
    const journeyStoryPages = STORY_PAGES_FOR_NEXT_STOP[firstTravelStop];
    if (journeyStoryPages?.length) {
      setShowStorybook(true);
      setStorybookMode("journey");
      setStoryPage(journeyStoryPages[0]);
      setPendingStop(firstTravelStop);
      setPendingJourneyPages(journeyStoryPages);
      setPendingJourneyPageIndex(0);
      return;
    }
    runTravelToStop(firstTravelStop);
  };

  const handleStorybookBack = () => {
    if (storybookMode === "intro") {
      if (storyPage === 0) {
        goBackToHome();
        return;
      }
      setStoryPage((value) => Math.max(0, value - 1));
      return;
    }
    if (storybookMode === "proposalEnding") {
      if (storyPage <= 1) {
        setShowStorybook(false);
        setShowQuestionOnly(true);
        setShowGoodStuffQuestion(true);
        return;
      }
      setStoryPage((value) => Math.max(0, value - 1));
      return;
    }
    const previousStoryPage = Math.max(0, storyPage - 1);
    if (previousStoryPage <= INTRO_STORY_LAST_PAGE) {
      setStorybookMode("intro");
      setStoryPage(previousStoryPage);
      setPendingStop(null);
      setPendingJourneyPages([]);
      setPendingJourneyPageIndex(0);
      return;
    }
    const endingIndex = ENDING_STORY_PAGES.indexOf(previousStoryPage);
    if (endingIndex >= 0) {
      setStorybookMode("ending");
      setStoryPage(previousStoryPage);
      setPendingStop(null);
      setPendingJourneyPages([...ENDING_STORY_PAGES]);
      setPendingJourneyPageIndex(endingIndex);
      return;
    }
    const matchingSequence = JOURNEY_STORY_SEQUENCES.find((sequence) => sequence.pages.includes(previousStoryPage));
    if (matchingSequence) {
      const pageIndex = matchingSequence.pages.indexOf(previousStoryPage);
      setStorybookMode("journey");
      setStoryPage(previousStoryPage);
      setPendingStop(matchingSequence.toStop);
      setPendingJourneyPages([...matchingSequence.pages]);
      setPendingJourneyPageIndex(pageIndex);
      return;
    }
    setStoryPage(previousStoryPage);
  };

  const runTravelToStop = (toStop: number) => {
    if (toStop <= 0 || toStop >= STOPS.length) return;
    const fromIndex = toStop - 1;
    setShowMobileMemoryCard(false);
    setIsTravelPending(true);
    setTravelFrom(null);
    setIsTraveling(false);
    setTravelProgress(0);

    window.setTimeout(() => {
      setTravelFrom(fromIndex);
      setIsTraveling(true);
      setIsTravelPending(false);
      setTravelProgress(0);
      window.setTimeout(() => {
        setActiveStop(toStop);
        setIsTraveling(false);
        setTravelFrom(null);
        setTravelProgress(0);
        window.setTimeout(() => {
          setShowMobileMemoryCard(toStop !== ANKARA_RETURN_STOP_INDEX);
        }, ARRIVAL_PAUSE_MS);
      }, CARD_ANIMATION_MS * 1000);
    }, TRAVEL_START_DELAY_MS);
  };

  const handleStorybookAdvance = () => {
    if (storybookMode === "intro") {
      if (storyPage < INTRO_STORY_LAST_PAGE) {
        setStoryPage((value) => Math.min(INTRO_STORY_LAST_PAGE, value + 1));
        return;
      }
      startJourney();
      return;
    }
    if (storybookMode === "proposalEnding") {
      if (storyPage < proposalEndingPages.length - 1) {
        setStoryPage((value) => Math.min(proposalEndingPages.length - 1, value + 1));
        return;
      }
      setShowStorybook(false);
      goToAudioHub();
      return;
    }
    if (storybookMode === "journey") {
      if (pendingStop === null) {
        setShowStorybook(false);
        return;
      }
      if (pendingJourneyPageIndex < pendingJourneyPages.length - 1) {
        const nextPageIndex = pendingJourneyPageIndex + 1;
        setPendingJourneyPageIndex(nextPageIndex);
        setStoryPage(pendingJourneyPages[nextPageIndex]);
        return;
      }
      const stopToGo = pendingStop;
      setShowStorybook(false);
      setPendingStop(null);
      setPendingJourneyPages([]);
      setPendingJourneyPageIndex(0);
      window.setTimeout(() => {
        runTravelToStop(stopToGo);
      }, STORYBOOK_EXIT_MS);
      return;
    }
    if (pendingJourneyPageIndex < pendingJourneyPages.length - 1) {
      const nextPageIndex = pendingJourneyPageIndex + 1;
      setPendingJourneyPageIndex(nextPageIndex);
      setStoryPage(pendingJourneyPages[nextPageIndex]);
      return;
    }
    setPendingJourneyPages([]);
    setPendingJourneyPageIndex(0);
    setShowStorybook(false);
    setShowQuestionOnly(true);
    setShowGoodStuffQuestion(false);
  };

  const nextStep = () => {
    if (isTraveling || isTravelPending) return;
    if (isLastStop) {
      setShowMobileMemoryCard(false);
      window.setTimeout(() => {
        setHasUnlockedGoodStuff(true);
        setShowStorybook(true);
        setStorybookMode("ending");
        setStoryPage(ENDING_STORY_PAGES[0]);
        setPendingStop(null);
        setPendingJourneyPages([...ENDING_STORY_PAGES]);
        setPendingJourneyPageIndex(0);
      }, MOBILE_CARD_EXIT_MS);
      return;
    }
    const toStop = activeStop + 1;
    const journeyStoryPages = STORY_PAGES_FOR_NEXT_STOP[toStop];
    if (journeyStoryPages?.length) {
      setShowMobileMemoryCard(false);
      window.setTimeout(() => {
        setShowStorybook(true);
        setStorybookMode("journey");
        setStoryPage(journeyStoryPages[0]);
        setPendingStop(toStop);
        setPendingJourneyPages(journeyStoryPages);
        setPendingJourneyPageIndex(0);
      }, MOBILE_CARD_EXIT_MS);
      return;
    }
    runTravelToStop(toStop);
  };

  useEffect(() => {
    if (activeStop !== ANKARA_RETURN_STOP_INDEX) {
      ankaraReturnAutoAdvanceDoneRef.current = false;
    }
  }, [activeStop]);

  useEffect(() => {
    if (isTraveling || isTravelPending) return;
    if (showStorybook || showIntro || showAudioHub || showQuestionOnly || showFinale) return;
    if (activeStop !== ANKARA_RETURN_STOP_INDEX) return;
    if (ankaraReturnAutoAdvanceDoneRef.current) return;
    const timer = window.setTimeout(() => {
      if (ankaraReturnAutoAdvanceDoneRef.current) return;
      ankaraReturnAutoAdvanceDoneRef.current = true;
      nextStep();
    }, ARRIVAL_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [activeStop, isTravelPending, isTraveling, nextStep, showAudioHub, showFinale, showIntro, showQuestionOnly, showStorybook]);

  useEffect(() => {
    if (!isTraveling) return;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / (CARD_ANIMATION_MS * 1000), 1);
      setTravelProgress(progress);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isTraveling]);

  const playAudio = (index: number) => {
    const audio = audioRefs.current[index];
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play();
  };

  const activeTravelMode = isTraveling && travelFrom !== null ? STOPS[travelFrom + 1].travelMode.toLowerCase() : null;
  const isBus = activeTravelMode?.includes("bus") ?? false;
  const vehicleHeading = useMemo(() => {
    if (isTraveling && travelFrom !== null) {
      const fromGeo = getRoutePoint(
        STOPS[travelFrom].coordinates,
        STOPS[travelFrom + 1].coordinates,
        activeTravelMode ?? STOPS[travelFrom + 1].travelMode.toLowerCase(),
        travelProgress
      );
      const toGeo = getRoutePoint(
        STOPS[travelFrom].coordinates,
        STOPS[travelFrom + 1].coordinates,
        activeTravelMode ?? STOPS[travelFrom + 1].travelMode.toLowerCase(),
        Math.min(travelProgress + 0.02, 1)
      );
      const fromProjected = projection(fromGeo);
      const toProjected = projection(toGeo);
      if (!fromProjected || !toProjected) return 0;
      return getHeadingDegrees([fromProjected[0], fromProjected[1]], [toProjected[0], toProjected[1]]);
    }
    if (activeStop < STOPS.length - 1) {
      const fromProjected = projection(current.coordinates);
      const toProjected = projection(STOPS[activeStop + 1].coordinates);
      if (!fromProjected || !toProjected) return 0;
      return getHeadingDegrees([fromProjected[0], fromProjected[1]], [toProjected[0], toProjected[1]]);
    }
    if (activeStop > 0) {
      const fromProjected = projection(STOPS[activeStop - 1].coordinates);
      const toProjected = projection(current.coordinates);
      if (!fromProjected || !toProjected) return 0;
      return getHeadingDegrees([fromProjected[0], fromProjected[1]], [toProjected[0], toProjected[1]]);
    }
    return 0;
  }, [activeStop, activeTravelMode, current.coordinates, isTraveling, projection, travelFrom, travelProgress]);
  const busFacing = useMemo<1 | -1>(() => {
    const nextIndex = isTraveling && travelFrom !== null ? travelFrom + 1 : Math.min(activeStop + 1, STOPS.length - 1);
    const fromCoords = isTraveling && travelFrom !== null ? STOPS[travelFrom].coordinates : current.coordinates;
    const toCoords = STOPS[nextIndex]?.coordinates ?? current.coordinates;
    return toCoords[0] >= fromCoords[0] ? 1 : -1;
  }, [activeStop, current.coordinates, isTraveling, travelFrom]);
  const cityMarkers = useMemo(() => {
    const markers = new Map<
      string,
      {
        city: string;
        coordinates: [number, number];
        firstIndex: number;
        unlocked: boolean;
        isCurrent: boolean;
        isUpcoming: boolean;
      }
    >();

    const upcomingIndex = isTraveling && travelFrom !== null ? travelFrom + 1 : activeStop + 1;

    STOPS.forEach((stop, index) => {
      const localizedCity = localizedStops[index].city;
      const existing = markers.get(localizedCity);
      const unlocked = index <= activeStop;
      const isCurrent = index === activeStop;
      const isUpcoming = index === upcomingIndex;

      if (!existing) {
        markers.set(localizedCity, {
          city: localizedCity,
          coordinates: stop.coordinates,
          firstIndex: index,
          unlocked,
          isCurrent,
          isUpcoming
        });
        return;
      }

      existing.unlocked = existing.unlocked || unlocked;
      existing.isCurrent = existing.isCurrent || isCurrent;
      existing.isUpcoming = existing.isUpcoming || isUpcoming;
    });

    return Array.from(markers.values());
  }, [activeStop, isTraveling, localizedStops, travelFrom]);
  const currentPhotos = photoLibrary[current.photoKey] ?? FALLBACK_PHOTOS;
  const hasMultipleDistinctPhotos = currentPhotos.length > 1;
  const carouselPhotos = hasMultipleDistinctPhotos ? currentPhotos : [currentPhotos[0], currentPhotos[0], currentPhotos[0]];
  const finalPhotos = photoLibrary.final ?? FALLBACK_PHOTOS;
  const hasMultipleDistinctFinalPhotos = new Set(finalPhotos).size > 1;
  const finalCarouselPhotos = hasMultipleDistinctFinalPhotos ? finalPhotos : [finalPhotos[0], finalPhotos[0], finalPhotos[0]];

  useEffect(() => {
    let isMounted = true;

    const loadPhotos = async () => {
      const loadedEntries = await Promise.all(
        PHOTO_FOLDER_KEYS.map(async (key) => {
          try {
            const response = await fetch(`/api/photos/${key}`);
            if (!response.ok) return [key, FALLBACK_PHOTOS] as const;
            const data = (await response.json()) as { photos?: string[] };
            const photos = data.photos?.length ? data.photos : FALLBACK_PHOTOS;
            return [key, photos] as const;
          } catch {
            return [key, FALLBACK_PHOTOS] as const;
          }
        })
      );

      if (!isMounted) return;
      setPhotoLibrary(Object.fromEntries(loadedEntries));
    };

    void loadPhotos();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const grouped = Object.values(photoLibrary);
    if (!grouped.length) return;

    const uniqueImageSources = Array.from(new Set(grouped.flat().filter((src) => !isVideoMediaSrc(src))));
    uniqueImageSources.slice(0, 80).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, [photoLibrary]);

  return (
    <main className="min-h-dvh bg-[#f7efe4] p-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-[max(env(safe-area-inset-top),1rem)] sm:p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center font-serif text-4xl text-[#5b4637] sm:text-5xl"
        >
          {t.journeyTitle}
        </motion.h1>

        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.section
              key="intro-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl bg-[#f6efe6] p-6 text-center shadow-soft sm:p-10"
            >
              <p className="text-sm tracking-[0.2em] text-[#7b6656]">{t.welcomeLabel}</p>
              <h2 className="mt-3 font-serif text-4xl text-[#5b4637] sm:text-5xl">{t.welcomeHeading}</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#6e5949]">
                {t.welcomeText}
              </p>
              <div className="mt-8 grid w-full max-w-md gap-3">
                <button
                  onClick={openFullExperience}
                  className="rounded-full bg-[#67463C] px-6 py-3 text-sm font-semibold text-[#fffaf3] shadow-md transition active:scale-95"
                >
                  {t.fullExperience}
                </button>
                <button
                  onClick={goToAudioHub}
                  className="rounded-full border border-[#cdb8a2] bg-[#efe2d3] px-6 py-3 text-sm font-semibold text-[#5b4637] shadow-sm transition active:scale-95"
                >
                  {t.audios}
                </button>
                <button
                  onClick={goToGoodStuff}
                  className="rounded-full bg-[#7b5a4c] px-6 py-3 text-sm font-semibold text-[#fffaf3] shadow-md transition active:scale-95"
                >
                  {t.goodStuff}
                </button>
              </div>
              <button
                onClick={() => setShowLanguagePopup(true)}
                className="mt-5 rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-6 py-3 text-sm font-semibold text-[#5b4637] shadow-sm transition active:scale-95"
              >
                {t.languageLabel}: {selectedLanguageLabel}
              </button>
            </motion.section>
          ) : showAudioHub ? (
            <motion.section
              key="audio-hub-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl bg-[#f6efe6] p-6 text-center shadow-soft sm:p-10"
            >
              <h2 className="font-serif text-3xl text-[#5b4637] sm:text-4xl">{t.audioCornerTitle}</h2>
              <p className="mt-2 text-sm text-[#6e5949]">{t.audioCornerSubtitle}</p>
              <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
                {AUDIO_TRACKS.map(({ label }, i) => (
                  <button
                    key={label}
                    onClick={() => playAudio(i)}
                    className="rounded-2xl border border-[#d8c3ad] bg-[#eadccf] px-4 py-3 text-sm font-semibold text-[#5b4637] shadow-sm transition active:scale-95"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={goBackToHome}
                className="mt-7 rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-8 py-3 text-sm font-semibold text-[#5b4637] transition active:scale-95"
              >
                {t.backToHome}
              </button>
            </motion.section>
          ) : showQuestionOnly ? (
            <motion.section
              key="good-stuff-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl bg-[#f6efe6] p-6 text-center shadow-soft sm:p-10"
            >
              {!showGoodStuffQuestion ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className={`mt-4 w-full rounded-3xl border border-[#c7b093] bg-[#f8efdf] p-7 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5),0_14px_26px_rgba(92,66,43,0.16)] ${fairyTaleFont.className}`}
                >
                  <p className="text-sm tracking-[0.14em] text-[#8a7463]">{t.page} 12</p>
                  <p className="mt-5 text-[1.45rem] leading-[1.55] text-[#6b5647]">{proposalEndingPages[0].text}</p>
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setShowGoodStuffQuestion(true)}
                      className="rounded-full bg-[#67463C] px-6 py-3 text-sm font-semibold text-[#fffaf3] shadow-md transition active:scale-95"
                    >
                      {t.continue}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-sm tracking-[0.22em] text-[#7b6656]"
                  >
                    {t.oneLastThingCaps}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.55, ease: "easeOut" }}
                    className="mt-6 w-full rounded-3xl border border-[#d8c3ad] bg-[#efe3d5] p-6"
                  >
                    <p className="font-serif text-2xl text-[#5b4637]">{t.girlfriendQuestion}</p>
                    <div className="relative mt-5 flex h-28 items-center justify-center gap-5">
                      <button
                        onClick={() => {
                          setShowQuestionOnly(false);
                          setShowStorybook(true);
                          setStorybookMode("proposalEnding");
                          setStoryPage(1);
                          setPendingStop(null);
                          setPendingJourneyPages([]);
                          setPendingJourneyPageIndex(0);
                        }}
                        className="rounded-full bg-[#67463C] px-8 py-3 font-semibold text-[#fffaf3] transition active:scale-95"
                      >
                        {t.yes}
                      </button>
                      <motion.button
                        onMouseEnter={moveNoButton}
                        onTouchStart={moveNoButton}
                        animate={{ x: noPosition.x, y: noPosition.y }}
                        transition={{ type: "spring", stiffness: 300, damping: 16 }}
                        className="rounded-full border border-[#bfa690] bg-[#fff8ef] px-8 py-3 font-semibold text-[#5b4637]"
                      >
                        {t.no}
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </motion.section>
          ) : showStorybook ? (
            <motion.section
              key="storybook-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl bg-[#efe3d4] p-6 text-center shadow-soft sm:p-10"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`story-page-${storyPage}`}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`mt-4 w-full rounded-3xl border border-[#c7b093] bg-[#f8efdf] p-7 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5),0_14px_26px_rgba(92,66,43,0.16)] ${fairyTaleFont.className}`}
                >
                  <p className="text-sm tracking-[0.14em] text-[#8a7463]">
                    {t.page} {storybookMode === "proposalEnding" ? storyPage + 12 : storyPage + 1}
                  </p>
                  {storybookMode === "proposalEnding" ? (
                    <>
                      <p className="mt-5 text-[1.45rem] leading-[1.55] text-[#6b5647]">{proposalEndingPages[storyPage].text}</p>
                      {storyPage === proposalEndingPages.length - 1 && (
                        <div className="memory-swiper mt-5 mx-auto aspect-[9/16] w-full max-w-[255px] overflow-hidden sm:max-w-[275px]">
                          <Swiper
                            key={`proposal-ending-final-${storyPage}`}
                            direction="horizontal"
                            modules={[Autoplay]}
                            centeredSlides
                            centerInsufficientSlides
                            slidesPerView={1.18}
                            spaceBetween={10}
                            initialSlide={0}
                            loop={finalCarouselPhotos.length > 1}
                            speed={520}
                            allowTouchMove={false}
                            simulateTouch={false}
                            shortSwipes={false}
                            longSwipes={false}
                            touchRatio={0}
                            grabCursor={false}
                            onSwiper={(swiper) => {
                              if (finalCarouselPhotos.length > 1) {
                                swiper.slideToLoop(0, 0, false);
                              }
                            }}
                            autoplay={
                              hasMultipleDistinctFinalPhotos
                                ? {
                                    delay: PHOTO_ROTATION_MS,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: false,
                                    reverseDirection: false,
                                    waitForTransition: false
                                  }
                                : false
                            }
                          >
                            {finalCarouselPhotos.map((photoSrc, index) => (
                              <SwiperSlide
                                key={`proposal-final-${photoSrc}-${index}`}
                                className="overflow-hidden rounded-[1.75rem]"
                              >
                                <MemoryMediaCover src={photoSrc} label={`Final memory ${index + 1}`} eager={index === 0} />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {storyPage === 0 && <h3 className="mt-2 text-4xl leading-[1.05] text-[#5b4637]">{storybookPages[storyPage].title}</h3>}
                      <p className={`${storyPage === 0 ? "mt-5" : "mt-3"} text-[1.45rem] leading-[1.55] text-[#6b5647]`}>
                        {storybookPages[storyPage].text}
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleStorybookBack}
                  className="rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-6 py-3 text-sm font-semibold text-[#5b4637] transition active:scale-95"
                >
                  {t.back}
                </button>
                {storybookMode === "intro" && storyPage < INTRO_STORY_LAST_PAGE ? (
                  <button
                    onClick={handleStorybookAdvance}
                    className="rounded-full bg-[#67463C] px-6 py-3 text-sm font-semibold text-[#fffaf3] shadow-md transition active:scale-95"
                  >
                    {t.turnPage}
                  </button>
                ) : (
                  <button
                    onClick={handleStorybookAdvance}
                    className="rounded-full bg-[#67463C] px-6 py-3 text-sm font-semibold text-[#fffaf3] shadow-md transition active:scale-95"
                  >
                    {storybookMode === "intro"
                      ? t.beginJourney
                      : storybookMode === "journey"
                        ? t.continueJourney
                        : storybookMode === "proposalEnding"
                          ? storyPage < proposalEndingPages.length - 1
                            ? t.turnPage
                            : t.finish
                        : pendingJourneyPageIndex < pendingJourneyPages.length - 1
                          ? t.turnPage
                          : t.continue}
                  </button>
                )}
              </div>
            </motion.section>
          ) : !showFinale ? (
            <motion.section
              key="map-view"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: showMobileMemoryCard && !awaitingJourneyBegin ? -18 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid min-h-[74dvh] place-items-center gap-4 lg:min-h-0 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:justify-items-stretch"
            >
              <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-[#e2d2c0] p-3 shadow-soft backdrop-blur sm:p-5">
                {awaitingJourneyBegin && (
                  <p className="pb-3 text-center font-serif text-base text-[#5b4637] sm:text-lg">
                    {t.mapBeginHint}
                  </p>
                )}
                <ComposableMap
                  width={MAP_WIDTH}
                  height={MAP_HEIGHT}
                  projection="geoMercator"
                  projectionConfig={{ center: BASE_PROJECTION_CENTER, scale: mapProjectionScale }}
                  style={{ backgroundColor: OCEAN_COLOR }}
                  className="mx-auto block h-[56vh] min-h-[420px] w-full rounded-2xl sm:h-[460px]"
                >
                  <g transform={`translate(${panX} ${panY})`}>
                    <StaticMapLayer />

                    {projectedPaths.map((segmentPath, index) => {
                      const isVisible = index < activeStop;
                      const isAnimating = isTraveling && index === travelFrom;
                      if (!segmentPath.d) return null;

                      return (
                        <g key={segmentPath.key}>
                          {isVisible && !isAnimating && (
                            <path
                              d={segmentPath.d}
                              fill="none"
                              stroke={TRAIL_COLOR}
                              strokeWidth={3}
                              strokeLinecap="round"
                              strokeDasharray="8 8"
                              opacity="0.95"
                            />
                          )}
                          {isAnimating && travelFrom !== null && (
                            <path
                              d={createProjectedRouteD(
                                projection,
                                STOPS[travelFrom].coordinates,
                                STOPS[travelFrom + 1].coordinates,
                                activeTravelMode ?? STOPS[travelFrom + 1].travelMode.toLowerCase(),
                                travelProgress
                              )}
                              fill="none"
                              stroke={TRAIL_COLOR}
                              strokeWidth={3}
                              strokeLinecap="round"
                              strokeDasharray="8 8"
                              opacity="0.95"
                            />
                          )}
                        </g>
                      );
                    })}

                    {cityMarkers.map((marker) => {
                      return (
                        <Marker key={marker.city} coordinates={marker.coordinates}>
                          <motion.text
                            textAnchor="middle"
                            y={4}
                            className={marker.unlocked ? "text-[24px]" : "text-[18px] opacity-50"}
                            animate={{ scale: marker.isCurrent ? [1, 1.18, 1] : 1 }}
                            transition={{ duration: 1.2, repeat: marker.isCurrent ? Infinity : 0 }}
                          >
                            🎃
                          </motion.text>
                          {(marker.unlocked || marker.isUpcoming) && (
                            <text
                              x={8}
                              y={marker.firstIndex % 2 === 0 ? -8 : 14}
                              textAnchor="start"
                              className="fill-ink text-[13px] font-semibold"
                            >
                              {marker.city}
                            </text>
                          )}
                        </Marker>
                      );
                    })}

                    {isTraveling && (
                      <Marker coordinates={travelCoordinates}>
                        <motion.g
                          animate={isBus ? { y: [-8, -12, -8] } : { y: 0 }}
                          transition={{ duration: 0.9, repeat: Infinity }}
                        >
                          {isBus ? (
                            <g transform={busFacing === -1 ? "translate(0 0) scale(-1 1)" : undefined}>
                              <rect x={-24} y={-14} width={48} height={24} rx={5} fill="#f3e9ff" stroke="#4c365e" strokeWidth={2} />
                              <rect x={-18} y={-11} width={13} height={7} rx={1.6} fill="#bfe6ff" />
                              <rect x={3} y={-11} width={14} height={7} rx={1.6} fill="#bfe6ff" />
                              <circle cx={-13} cy={12} r={3.9} fill="#2f3f38" />
                              <circle cx={13} cy={12} r={3.9} fill="#2f3f38" />
                            </g>
                          ) : (
                            <motion.text
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-[40px]"
                              transform={`rotate(${vehicleHeading})`}
                            >
                              ✈
                            </motion.text>
                          )}
                        </motion.g>
                      </Marker>
                    )}
                  </g>
                </ComposableMap>
              </div>

              <AnimatePresence mode="wait">
                {awaitingJourneyBegin ? (
                  <motion.article
                    key="desktop-journey-begin"
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
                    className="hidden h-full flex-col justify-end rounded-3xl bg-[#f6efe6] p-5 shadow-soft lg:flex"
                  >
                    <button
                      onClick={beginFromSpain}
                      className="w-full rounded-full bg-[#67463C] px-6 py-3 text-sm font-semibold text-[#fffaf3] transition-transform active:scale-95"
                    >
                      {t.begin}
                    </button>
                  </motion.article>
                ) : (
                  shouldHideMemoryCardForCurrentStop ? (
                    <motion.article
                      key={`${current.city}-${activeStop}-transition`}
                      initial={{ opacity: 0, y: 18, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut", delay: 0.28 }}
                      className="hidden h-full flex-col justify-center rounded-3xl bg-[#f6efe6] p-5 text-center shadow-soft lg:flex"
                    >
                      <p className="text-sm tracking-wide text-[#7b6656]">{t.onward}</p>
                      <h2 className="mt-2 font-serif text-3xl text-[#5b4637]">{currentText.city}</h2>
                      <p className="mt-3 text-sm text-[#6e5949]">{t.quickStop}</p>
                    </motion.article>
                  ) : (
                    <motion.article
                      key={`${current.city}-${activeStop}`}
                      initial={{ opacity: 0, y: 18, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut", delay: 0.28 }}
                      className="hidden h-full flex-col rounded-3xl bg-[#f6efe6] p-5 shadow-soft lg:flex"
                    >
                      <p className="text-sm tracking-wide text-[#7b6656]">{t.memoryCard}</p>
                      <h2 className="mt-2 font-serif text-3xl text-[#5b4637]">{currentText.city}</h2>
                      <p className="text-sm text-[#7b6656]">
                        {currentText.country} - {currentText.travelMode}
                      </p>

                      {currentText.layoverNote ? (
                        <div className="mt-4 rounded-2xl border border-[#dcc6ae] bg-[#efe2d3] p-5 text-center shadow-sm">
                          <p className="text-3xl">😵‍💫</p>
                          <p className="mt-2 font-serif text-xl text-[#5b4637]">{t.layoverAlert}</p>
                          <p className="mt-2 text-sm text-[#6e5949]">{currentText.layoverNote}</p>
                        </div>
                      ) : (
                        <div className="memory-swiper mt-4 mx-auto aspect-[9/16] w-full max-w-[255px] overflow-hidden sm:max-w-[275px]">
                          <Swiper
                            key={`${current.city}-${activeStop}`}
                            direction="horizontal"
                            modules={[Autoplay]}
                            centeredSlides
                            centerInsufficientSlides
                            slidesPerView={1.18}
                            spaceBetween={10}
                            initialSlide={0}
                            loop={carouselPhotos.length > 1}
                            speed={520}
                            allowTouchMove={false}
                            simulateTouch={false}
                            shortSwipes={false}
                            longSwipes={false}
                            touchRatio={0}
                            grabCursor={false}
                            onSwiper={(swiper) => {
                              if (carouselPhotos.length > 1) {
                                swiper.slideToLoop(0, 0, false);
                              }
                            }}
                            autoplay={
                              hasMultipleDistinctPhotos
                                ? {
                                    delay: 2000,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: false,
                                    reverseDirection: false,
                                    waitForTransition: false
                                  }
                                : false
                            }
                          >
                            {carouselPhotos.map((photoSrc, index) => (
                              <SwiperSlide
                                key={`${current.city}-${photoSrc}-${index}`}
                                className="overflow-hidden rounded-[1.75rem]"
                              >
                                <MemoryMediaCover src={photoSrc} label={`${current.city} memory ${index + 1}`} eager={index === 0} />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      )}

                      <p className="mt-4 rounded-2xl bg-[#efe4d6] p-4 text-sm italic leading-relaxed text-[#5f4a3a]">
                        {t.quotePrefix} {currentText.quote}
                      </p>

                      <button
                        onClick={nextStep}
                        disabled={isTraveling || isTravelPending}
                        className="mt-auto rounded-full bg-[#67463C] px-6 py-3 text-sm font-medium text-[#fffaf3] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {isTraveling || isTravelPending ? t.traveling : isLastStop ? t.seeFinale : t.next}
                      </button>
                    </motion.article>
                  )
                )}
              </AnimatePresence>
            </motion.section>
          ) : (
            <motion.section
              key="finale-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl bg-[#f6efe6] p-6 text-center shadow-soft sm:p-10"
            >
              <h2 className="font-serif text-3xl text-[#5b4637] sm:text-4xl">{t.finaleTitle}</h2>

              <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
                {AUDIO_TRACKS.map(({ label }, i) => (
                  <button
                    key={label}
                    onClick={() => playAudio(i)}
                    className="rounded-2xl border border-[#d8c3ad] bg-[#eadccf] px-4 py-3 text-sm font-semibold text-[#5b4637] shadow-sm transition active:scale-95"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowQuestion(true)}
                className="mt-7 rounded-full bg-[#67463C] px-8 py-4 text-base font-semibold text-[#fffaf3] shadow-lg transition active:scale-95"
              >
                {t.finaleQuestionButton}
              </button>

              <AnimatePresence>
                {showQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-7 w-full rounded-3xl border border-[#d8c3ad] bg-[#efe3d5] p-6"
                  >
                    <p className="font-serif text-2xl text-[#5b4637]">{t.nextAdventureQuestion}</p>
                    <div className="relative mt-5 flex h-28 items-center justify-center gap-5">
                      <button className="rounded-full bg-[#67463C] px-8 py-3 font-semibold text-[#fffaf3] transition active:scale-95">{t.yes}</button>
                      <motion.button
                        onMouseEnter={moveNoButton}
                        onTouchStart={moveNoButton}
                        animate={{ x: noPosition.x, y: noPosition.y }}
                        transition={{ type: "spring", stiffness: 300, damping: 16 }}
                        className="rounded-full border border-[#bfa690] bg-[#fff8ef] px-8 py-3 font-semibold text-[#5b4637]"
                      >
                        {t.no}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
          {AUDIO_TRACKS.map(({ label, src }, index) => (
            <audio
              key={label}
              ref={(el) => {
                audioRefs.current[index] = el;
              }}
              src={src}
              preload="none"
            />
          ))}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {!showIntro && !showFinale && !showAudioHub && !showQuestionOnly && !showStorybook && awaitingJourneyBegin && (
            <div className="fixed inset-x-0 bottom-0 z-50 p-3 lg:hidden">
              <motion.div
                key="mobile-journey-begin"
                initial={{ y: 84, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 96, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl bg-[#f6efe6]/95 p-4 shadow-soft backdrop-blur"
              >
                <button
                  onClick={beginFromSpain}
                  className="w-full rounded-full bg-[#67463C] px-6 py-3 text-sm font-semibold text-[#fffaf3] transition-transform active:scale-95"
                >
                  {t.begin}
                </button>
              </motion.div>
            </div>
          )}
          {!showIntro && !showFinale && !showAudioHub && !showQuestionOnly && !showStorybook && !awaitingJourneyBegin && showMobileMemoryCard && (
            <div className="fixed inset-x-0 bottom-0 z-50 p-3 lg:hidden">
              <motion.article
                key={`mobile-${current.city}-${activeStop}`}
                initial={{ y: 96, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 108, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="hide-scrollbar max-h-[86vh] overflow-y-auto overscroll-contain rounded-3xl bg-[#f6efe6]/95 p-4 pb-5 shadow-soft backdrop-blur [touch-action:pan-y]"
              >
              <p className="text-sm tracking-wide text-[#7b6656]">{t.memoryCard}</p>
              <h2 className="mt-2 font-serif text-3xl text-[#5b4637]">{currentText.city}</h2>
              <p className="text-sm text-[#7b6656]">
                {currentText.country} - {currentText.travelMode}
              </p>

              {currentText.layoverNote ? (
                <div className="mt-4 rounded-2xl border border-[#dcc6ae] bg-[#efe2d3] p-5 text-center shadow-sm">
                  <p className="text-3xl">😵‍💫</p>
                  <p className="mt-2 font-serif text-xl text-[#5b4637]">{t.layoverAlert}</p>
                  <p className="mt-2 text-sm text-[#6e5949]">{currentText.layoverNote}</p>
                </div>
              ) : (
                <div className="memory-swiper mt-4 mx-auto aspect-[9/16] w-full max-w-[255px] overflow-hidden">
                  <Swiper
                    key={`mobile-${current.city}-${activeStop}`}
                    direction="horizontal"
                    modules={[Autoplay]}
                    centeredSlides
                    centerInsufficientSlides
                    slidesPerView={1.18}
                    spaceBetween={10}
                    initialSlide={0}
                    loop={carouselPhotos.length > 1}
                    speed={520}
                    allowTouchMove={false}
                    simulateTouch={false}
                    shortSwipes={false}
                    longSwipes={false}
                    touchRatio={0}
                    grabCursor={false}
                    onSwiper={(swiper) => {
                      if (carouselPhotos.length > 1) {
                        swiper.slideToLoop(0, 0, false);
                      }
                    }}
                    autoplay={
                      hasMultipleDistinctPhotos
                        ? {
                            delay: 2000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: false,
                            reverseDirection: false,
                            waitForTransition: false
                          }
                        : false
                    }
                  >
                    {carouselPhotos.map((photoSrc, index) => (
                      <SwiperSlide
                        key={`mobile-${current.city}-${photoSrc}-${index}`}
                        className="overflow-hidden rounded-[1.75rem]"
                      >
                        <MemoryMediaCover src={photoSrc} label={`${current.city} memory ${index + 1}`} eager={index === 0} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              <p className="mt-4 rounded-2xl bg-[#efe4d6] p-4 text-sm italic leading-relaxed text-[#5f4a3a]">
                {t.quotePrefix} {currentText.quote}
              </p>

              <button
                onClick={nextStep}
                disabled={isTraveling || isTravelPending}
                className="mt-4 w-full rounded-full bg-[#67463C] px-6 py-3 text-sm font-medium text-[#fffaf3] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isTraveling || isTravelPending ? t.traveling : isLastStop ? t.seeFinale : t.next}
              </button>
              </motion.article>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showGoodStuffConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-[#00000066] px-4"
            >
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                className="w-full max-w-sm rounded-3xl border border-[#d8c3ad] bg-[#f6efe6] p-6 text-center shadow-soft"
              >
                <p className="font-serif text-2xl text-[#5b4637]">{t.readyConfirm}</p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setShowGoodStuffConfirm(false);
                      setShowIntro(false);
                      setShowQuestionOnly(true);
                      setShowGoodStuffQuestion(false);
                      setShowAudioHub(false);
                      setAwaitingJourneyBegin(false);
                      setShowFinale(false);
                      setShowQuestion(false);
                      setShowMobileMemoryCard(false);
                    }}
                    className="rounded-full bg-[#67463C] px-6 py-3 text-sm font-semibold text-[#fffaf3] shadow-md transition active:scale-95"
                  >
                    {t.yes}
                  </button>
                  <button
                    onClick={() => setShowGoodStuffConfirm(false)}
                    className="rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-6 py-3 text-sm font-semibold text-[#5b4637] transition active:scale-95"
                  >
                    {t.no}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showIntro && showLanguagePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[75] flex items-center justify-center bg-[#00000066] px-4"
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                className="w-full max-w-sm rounded-3xl border border-[#d8c3ad] bg-[#f6efe6] p-6 text-center shadow-soft"
              >
                <p className="font-serif text-2xl text-[#5b4637]">{t.languageLabel}</p>
                <div className="mt-5 grid gap-2">
                  {LANGUAGES.map((entry) => (
                    <button
                      key={entry.code}
                      onClick={() => {
                        setLanguage(entry.code);
                        setShowLanguagePopup(false);
                      }}
                      className={`rounded-full px-5 py-3 text-sm font-semibold transition active:scale-95 ${
                        entry.code === language
                          ? "bg-[#67463C] text-[#fffaf3] shadow-md"
                          : "border border-[#cdb8a2] bg-[#fff8ef] text-[#5b4637]"
                      }`}
                    >
                      {entry.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowLanguagePopup(false)}
                  className="mt-5 rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-6 py-2 text-sm font-semibold text-[#5b4637] transition active:scale-95"
                >
                  {t.close}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style jsx global>{`
        .memory-swiper .swiper {
          height: 100%;
          overflow: hidden;
          padding: 0 0.6rem;
          box-sizing: border-box;
        }
        .memory-swiper .swiper-wrapper {
          align-items: center;
        }
        .memory-swiper .swiper-slide {
          opacity: 0.38;
          transform: scale(0.9);
          transition: opacity 220ms ease, transform 220ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 1.75rem;
          background: transparent;
        }
        .memory-swiper .swiper-slide-active {
          opacity: 1;
          transform: scale(1);
        }
        .memory-swiper .swiper-slide-prev,
        .memory-swiper .swiper-slide-next {
          opacity: 0.68;
          transform: scale(0.93);
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}
