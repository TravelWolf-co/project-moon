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
    quote: "I miss Xiǎomāo, cant wait to make... I mean, meet him again!",
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
    quote: "The bathtub was so good for Xiǎomāo!",
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
  { label: "English", src: "/English.m4a" },
  { label: "Español", src: "/Spanish.m4a" },
  { label: "中文", src: "/Chinese.m4a" },
  { label: "Deutsch", src: "/German.m4a" }
] as const;

const BIRTHDAY_QUESTION_SECTIONS = [
  {
    id: "history",
    title: "History (The Past & What-Ifs)",
    questions: [
      "If you could have dinner with any historical figure, who would it be?",
      "What historical mystery do you most want the answer to?",
      "If you could prevent one historical event (without creating a paradox), which one would it be?",
      "Which era would you choose to live in for just one week?",
      "Who do you think is the most underrated person in history?",
      "If you could ask a Viking one question, what would it be?",
      "What’s a historical \"fact\" that sounds fake but is actually true?",
      "If you were a royal in the 1700s, what would your \"scandal\" be?",
      "Which ancient civilization do you think was the most advanced for its time?",
      "If you could bring one piece of modern technology to the Middle Ages, what would it be?",
      "What is the most beautiful piece of architecture in history to you?",
      "If you could sit in on one historical treaty signing, which would it be?",
      "What’s a \"lost\" piece of history (like the Library of Alexandria) you wish we still had?",
      "If you could change the outcome of one war, which one would it be?",
      "Which historical figure would be the most confused by a smartphone?",
      "If you could go back and tell your 10-year-old self one thing about history, what would it be?",
      "Who is the coolest \"Renaissance\" figure you know of?",
      "If you were an explorer in the 15th century, what would you want to \"discover\"?",
      "What’s the most interesting thing about your own family history?",
      "If history repeats itself, what era are we living in right now?",
      "If you could witness one ancient city at its peak, which city would it be?",
      "What invention do you think changed human life the most, and why?",
      "If you could read one person’s private letters from history, whose would you choose?",
      "Which historical event do you wish had better documentation (like video footage)?",
      "If you could time-travel to one “ordinary day” in the past, what would you want to see?",
      "What’s a historical job you think you’d be surprisingly good at?",
      "If you could save one extinct animal species from extinction, which one would it be?",
      "What’s a “tiny” historical moment that probably changed everything later?",
      "If you could give one historical person a modern therapist, who would it be?",
      "Which empire/culture do you think was the most misunderstood?",
      "If you could swap leaders for one historical moment, who would you swap in?",
      "What’s a historical rumor you wish you could confirm or deny?",
      "If you had to live through one historical journey (ship, caravan, expedition), which one?",
      "What’s one historical era you think would be the hardest for you personally, and why?",
      "If you could ask an ancient philosopher one question, who and what?",
      "What’s the most interesting “forgotten” technology from history you’ve heard about?",
      "Which historical speech would you want to hear live?",
      "If you could preserve one artifact forever, what should it be?",
      "What’s a history “myth” you believed as a kid?"
    ]
  },
  {
    id: "philosophy",
    title: "Philosophy (The Deep & Existential)",
    questions: [
      "What is your personal definition of time?",
      "If we lived in a simulation, would it change the way you live your life?",
      "Does \"luck\" actually exist, or is it just probability we don't understand yet?",
      "What is the meaning of \"home\" to you?",
      "Is it better to be loved or respected?",
      "If you could know the date of your death, would you want to?",
      "Do humans have free will, or is everything just a reaction to previous events?",
      "What does \"success\" actually look like to you?",
      "If you could live forever but stay the same age, would you?",
      "Does art need an audience to be considered art?",
      "Is \"truth\" something objective, or is it always colored by perception?",
      "What is the most important virtue a person can have?",
      "If you could download your consciousness into a computer, would you?",
      "What do you think happens (if anything) after we die?",
      "Can you be truly happy without ever experiencing sadness?",
      "Is it more important to do the right thing or to do the thing right?",
      "What is the soul, in your opinion?",
      "If you could change one thing about human nature, what would it be?",
      "Does everything happen for a reason, or is the universe chaotic?",
      "What is the difference between \"living\" and \"existing\"?",
      "What do you think a “good life” requires (minimum ingredients)?",
      "Is it possible to be a good person without trying to be?",
      "Do you think people can truly change, or do they just become more themselves?",
      "What do you owe to strangers, if anything?",
      "Is forgiveness something you do for others or for yourself?",
      "If you could remove one emotion from humanity, would you? Which one?",
      "Would you rather live with certainty or with possibility?",
      "Is it ever okay to lie if it prevents someone’s pain?",
      "What makes something “you” — your memories, your body, your choices, or something else?",
      "Do you believe we have a purpose, or do we create it?",
      "If you could ask the universe one question and get a true answer, what would you ask?",
      "Is “beauty” real, or is it only a shared illusion?",
      "What does “freedom” mean to you personally?",
      "If two people remember the same moment differently, which memory is “true”?",
      "Is it more important to be understood or to be accepted?",
      "Do you think suffering always teaches something, or is that just a story we tell?",
      "What is something you used to believe that you no longer believe?",
      "If you could relive one year of your life, would you? Which one?",
      "What do you think love is: a feeling, a choice, a practice, or something else?"
    ]
  },
  {
    id: "political",
    title: "Political (The Society & Systems)",
    questions: [
      "If you could design a brand-new country from scratch, what would be the first law?",
      "What is the most important issue facing the world right now?",
      "Should the voting age be lowered, raised, or stay the same?",
      "What’s one social norm that you think will be completely gone in 50 years?",
      "If you were the \"benevolent dictator\" of the world for one day, what would you change?",
      "Is a truly \"borderless\" world possible or even desirable?",
      "What is the role of technology in modern democracy?",
      "Should space exploration be a government priority or left to private companies?",
      "How do you define \"justice\"?",
      "Is universal basic income a viable solution for the future?",
      "What’s the most effective way for a regular person to make a political change?",
      "Should education be completely free for everyone, regardless of the field?",
      "How do we balance personal privacy with national security?",
      "What’s one political system (real or fictional) that fascinates you?",
      "Is true equality possible, or is hierarchy natural to humans?",
      "What should the \"limit\" on wealth be, if any?",
      "How should we handle \"misinformation\" without infringing on free speech?",
      "If you could talk to the current leader of any country, what would you say?",
      "What is the most important lesson we’ve learned from past political failures?",
      "Does a government have a responsibility to ensure everyone’s happiness?",
      "What should be considered a basic human right in 2026 that isn’t everywhere yet?",
      "If you could redesign school from scratch, what would be required?",
      "What do you think is the fairest way to handle healthcare?",
      "Should the internet be treated like a public utility? Why or why not?",
      "How much should companies be allowed to influence politics?",
      "What should be illegal that currently isn’t (or vice versa)?",
      "If you could add one new “global law,” what would it be?",
      "Is it more important for a society to be safe, free, or equal? Rank them.",
      "Do you think punishment should be more about revenge, deterrence, or rehabilitation?",
      "What’s one policy you’ve changed your mind about over time?",
      "Should cities be designed more for cars or for people?",
      "What do you think is the biggest threat to democracy?",
      "If you had one billion dollars to spend on one issue, what would you pick and how would you spend it?",
      "What’s a problem you think people talk about a lot but misunderstand?",
      "How should society handle people who don’t want to participate (work, vote, etc.)?",
      "Is nationalism ever healthy? When?",
      "What do you think the ideal work week looks like?",
      "Should there be limits on AI use in art, education, or government?",
      "What does “progress” mean to you in a society?"
    ]
  },
  {
    id: "about-us",
    title: "About Us (The Connection & Future)",
    questions: [
      "What was the very first thing you thought when we first started talking?",
      "What’s your favorite memory of us so far?",
      "If we could teleport to each other for just one hour, what would we do?",
      "What’s a song that always makes you think of me?",
      "What’s one thing you’ve learned about yourself because of our relationship?",
      "If we were a \"power couple\" in history, which one would we be?",
      "What is your favorite \"small\" thing I do that you haven't mentioned before?",
      "Where is the first place we are going once the distance is finally closed?",
      "What’s a \"random\" question you’ve been wanting to ask me but haven’t?",
      "If we were characters in a movie, what would the title be?",
      "What’s the most \"us\" thing about our relationship?",
      "How do you describe me to people who haven't met me yet?",
      "What’s a dream you have for \"future us\"?",
      "If we could build a house together anywhere, where would it be?",
      "What’s one habit of mine that you actually find secretly cute?",
      "How has your perspective on \"long distance\" changed since we started?",
      "If you could send me a \"care package\" right now with only three things, what would they be?",
      "What’s the best piece of advice we’ve given each other?",
      "What’s one adventure you want to go on with me that we haven’t talked about yet?",
      "If you could tell me one thing right now that you haven't said yet, what would it be?",
      "What’s a tiny moment with me that you replay in your head sometimes?",
      "What do you think we do really well as a couple?",
      "What’s one thing you want us to get better at together (in a cute way)?",
      "If we could make one tradition just for us, what would it be?",
      "What’s a place (real or imaginary) you want us to visit together someday?",
      "What’s a question you hope I keep asking you for the rest of our lives?",
      "When do you feel most loved by me?",
      "What’s a fear you have about the future that you want me to know about?",
      "What’s one thing you want to celebrate about yourself this year?",
      "What’s a memory we haven’t made yet that you’re excited for?",
      "If you could freeze one day with me forever, what would that day look like?",
      "What do you think is the funniest “us” misunderstanding we’ve had?",
      "What’s one way I can support you when you’re stressed?",
      "What’s one way you want to support me better too?",
      "If we wrote a book about us, what would the chapter titles be?",
      "What’s something you want to learn together (a hobby, skill, language, anything)?",
      "What’s a “future us” problem you think we’ll solve easily?",
      "What do you want our life to feel like day-to-day, not just on big trips?",
      "What’s one promise you want us to keep no matter what?"
    ]
  },
  {
    id: "random",
    title: "Random (The Silly & Weird)",
    questions: [
      "If you could become any vegetable, which one would you be and why?",
      "What is the most useless superpower you can think of?",
      "If animals could talk, which species would be the rudest?",
      "What’s the weirdest thing you’ve ever eaten that you actually liked?",
      "If you were a kitchen appliance, which one would you be?",
      "Is a hotdog a sandwich? Defend your answer.",
      "What’s the best \"bad\" movie you’ve ever seen?",
      "If you had to be haunted by a ghost, but you got to pick the person, who would it be?",
      "What’s the most \"uncanny valley\" thing you’ve ever experienced?",
      "If you were a brand of cereal, what would the box look like and what's the prize inside?",
      "Which fruit do you think is the most \"high maintenance\"?",
      "If you could rename any animal, what would you call it?",
      "What’s your \"go-to\" karaoke song if your life depended on a perfect performance?",
      "If you had to live in a video game world for a year, which one would it be?",
      "What’s the most embarrassing trend you’ve ever participated in?",
      "If you could have any mythical creature as a pet, which one would you choose?",
      "What is the \"correct\" way to load a dishwasher?",
      "If your life had a narrator, whose voice would it be?",
      "What’s the most useless trivia fact you know?",
      "If you were an ice cream flavor, what weird toppings would you include?",
      "If you had to wear one costume for a full year, what is it?",
      "What conspiracy theory would you invent just to confuse people?",
      "If you could add one completely unnecessary button to the human body, what would it do?",
      "What would be the worst theme park ride imaginable?",
      "If your laugh had a subtitle, what would it usually say?",
      "If you could only communicate using movie quotes for a day, which movie would you pick?",
      "What’s the funniest “rules” you’d create for our relationship if it was a video game?",
      "If you could choose one animal to be the size of a horse, which one and why?",
      "What food do you think is secretly overrated, but you’re too polite to say?",
      "If we opened a cafe together, what would it be called and what’s the signature drink?",
      "What’s a smell you weirdly love that other people might hate?",
      "If you had to replace your hands with two objects, what objects would you pick?",
      "Which fictional character would be the most chaotic roommate?",
      "If you could ban one sound from existence, what sound is it?",
      "What is your most unhinged “would you rather” question?",
      "If we were two animals, what animals would we be?",
      "What’s the weirdest compliment you could give someone with a straight face?",
      "If your brain had a loading screen, what tip would it show?",
      "What’s the most ridiculous thing you could put on a resume that is still technically true?",
      "If we could instantly master one useless skill together, what should it be?"
    ]
  }
] as const;

type BirthdaySectionId = (typeof BIRTHDAY_QUESTION_SECTIONS)[number]["id"];

const BIRTHDAY_SECTION_TITLES_BY_LANGUAGE: Record<AppLanguage, Record<BirthdaySectionId, string>> = {
  en: Object.fromEntries(BIRTHDAY_QUESTION_SECTIONS.map((s) => [s.id, s.title])) as Record<BirthdaySectionId, string>,
  es: {
    history: "Historia (El pasado y los “¿y si…?”)",
    philosophy: "Filosofía (Profundo y existencial)",
    political: "Política (Sociedad y sistemas)",
    "about-us": "Nosotros (Conexión y futuro)",
    random: "Random (Tonto y raro)"
  },
  zh: {
    history: "历史（过去与“如果”）",
    philosophy: "哲学（更深更存在）",
    political: "政治（社会与制度）",
    "about-us": "关于我们（连接与未来）",
    random: "随机（可爱又奇怪）"
  },
  de: {
    history: "Geschichte (Vergangenheit & Was-wäre-wenn)",
    philosophy: "Philosophie (Tief & Existenzialistisch)",
    political: "Politik (Gesellschaft & Systeme)",
    "about-us": "Wir (Verbindung & Zukunft)",
    random: "Random (Silly & Weird)"
  },
  tr: {
    history: "Tarih (Gecmis ve “ya soyle olsaydi?”)",
    philosophy: "Felsefe (Derin ve varolussal)",
    political: "Politika (Toplum ve sistemler)",
    "about-us": "Biz (Baglanti ve gelecek)",
    random: "Rastgele (Komik ve tuhaf)"
  }
};

const BIRTHDAY_QUESTIONS_BY_LANGUAGE: Record<AppLanguage, Record<BirthdaySectionId, string[]>> = {
  en: Object.fromEntries(BIRTHDAY_QUESTION_SECTIONS.map((s) => [s.id, [...s.questions]])) as unknown as Record<BirthdaySectionId, string[]>,
  es: {
    history: [
      "Si pudieras cenar con cualquier figura histórica, ¿quién sería?",
      "¿Qué misterio histórico te gustaría más resolver?",
      "Si pudieras evitar un evento histórico (sin crear una paradoja), ¿cuál sería?",
      "¿Qué época elegirías para vivir solo una semana?",
      "¿Quién crees que es la persona más infravalorada de la historia?",
      "Si pudieras hacerle una pregunta a un vikingo, ¿cuál sería?",
      "¿Cuál es un “hecho” histórico que suena falso pero es real?",
      "Si fueras realeza en el siglo XVIII, ¿cuál sería tu “escándalo”?",
      "¿Qué civilización antigua crees que fue la más avanzada para su tiempo?",
      "Si pudieras llevar una tecnología moderna a la Edad Media, ¿cuál sería?",
      "¿Cuál es la pieza de arquitectura más hermosa de la historia para ti?",
      "Si pudieras estar presente en la firma de un tratado histórico, ¿cuál sería?",
      "¿Qué “pieza perdida” de la historia (como la Biblioteca de Alejandría) desearías que aún existiera?",
      "Si pudieras cambiar el resultado de una guerra, ¿cuál cambiarías?",
      "¿Qué figura histórica se confundiría más con un smartphone?",
      "Si pudieras volver atrás y decirle a tu yo de 10 años una cosa sobre historia, ¿qué le dirías?",
      "¿Quién es la figura más “cool” del Renacimiento que conoces?",
      "Si fueras explorador en el siglo XV, ¿qué te gustaría “descubrir”?",
      "¿Qué es lo más interesante de la historia de tu propia familia?",
      "Si la historia se repite, ¿en qué época estamos viviendo ahora?",
      "Si pudieras ver una ciudad antigua en su máximo esplendor, ¿cuál sería?",
      "¿Qué invento crees que cambió más la vida humana, y por qué?",
      "Si pudieras leer las cartas privadas de una persona histórica, ¿de quién serían?",
      "¿Qué evento histórico desearías que tuviera mejor documentación (como video)?",
      "Si pudieras viajar en el tiempo a un “día normal” del pasado, ¿qué te gustaría ver?",
      "¿En qué trabajo histórico crees que serías sorprendentemente buena?",
      "Si pudieras salvar a una especie extinta, ¿cuál salvarías?",
      "¿Qué “pequeño” momento histórico crees que cambió todo más tarde?",
      "Si pudieras darle un terapeuta moderno a una persona histórica, ¿a quién elegirías?",
      "¿Qué imperio/cultura crees que es el más malinterpretado?",
      "Si pudieras cambiar líderes en un momento histórico, ¿a quién pondrías?",
      "¿Qué rumor histórico te gustaría confirmar o desmentir?",
      "Si tuvieras que vivir un gran viaje histórico (barco, caravana, expedición), ¿cuál elegirías?",
      "¿Qué época histórica crees que sería la más dura para ti personalmente, y por qué?",
      "Si pudieras hacerle una pregunta a un filósofo antiguo, ¿a quién y qué le preguntarías?",
      "¿Cuál es la tecnología “olvidada” más interesante de la historia que has escuchado?",
      "¿Qué discurso histórico te gustaría escuchar en vivo?",
      "Si pudieras preservar un artefacto para siempre, ¿cuál debería ser?",
      "¿Qué “mito” histórico creías de niño/a?"
    ],
    philosophy: [
      "¿Cuál es tu definición personal del tiempo?",
      "Si viviéramos en una simulación, ¿cambiaría la forma en que vives tu vida?",
      "¿Existe la “suerte” de verdad, o es solo probabilidad que no entendemos?",
      "¿Qué significa “hogar” para ti?",
      "¿Es mejor ser amado o respetado?",
      "Si pudieras saber la fecha de tu muerte, ¿querrías saberla?",
      "¿Los humanos tenemos libre albedrío, o todo es reacción a lo anterior?",
      "¿Cómo se ve el “éxito” para ti?",
      "Si pudieras vivir para siempre pero quedarte en la misma edad, ¿lo harías?",
      "¿El arte necesita público para ser considerado arte?",
      "¿La “verdad” es objetiva, o siempre está teñida por la percepción?",
      "¿Cuál es la virtud más importante que puede tener una persona?",
      "Si pudieras descargar tu conciencia en una computadora, ¿lo harías?",
      "¿Qué crees que pasa (si pasa algo) después de morir?",
      "¿Se puede ser verdaderamente feliz sin experimentar tristeza?",
      "¿Es más importante hacer lo correcto o hacer las cosas correctamente?",
      "¿Qué es el alma, en tu opinión?",
      "Si pudieras cambiar una cosa de la naturaleza humana, ¿qué cambiarías?",
      "¿Todo pasa por una razón, o el universo es caótico?",
      "¿Cuál es la diferencia entre “vivir” y “existir”?",
      "¿Qué crees que necesita una “buena vida” (ingredientes mínimos)?",
      "¿Es posible ser una buena persona sin intentarlo?",
      "¿Crees que la gente puede cambiar de verdad, o solo se vuelve más “ella misma”?",
      "¿Qué le debes a los desconocidos, si es que debes algo?",
      "¿Perdonar es algo que haces por otros o por ti?",
      "Si pudieras eliminar una emoción de la humanidad, ¿lo harías? ¿Cuál?",
      "¿Preferirías vivir con certeza o con posibilidad?",
      "¿Está bien mentir si evita el dolor de alguien?",
      "¿Qué te hace “tú”: tus recuerdos, tu cuerpo, tus decisiones, u otra cosa?",
      "¿Crees que tenemos un propósito o lo creamos?",
      "Si pudieras hacerle una pregunta al universo y obtener una respuesta verdadera, ¿qué preguntarías?",
      "¿La “belleza” es real, o solo una ilusión compartida?",
      "¿Qué significa “libertad” para ti personalmente?",
      "Si dos personas recuerdan el mismo momento de forma distinta, ¿qué recuerdo es el “verdadero”?",
      "¿Es más importante ser comprendido/a o ser aceptado/a?",
      "¿Crees que el sufrimiento siempre enseña algo, o es solo una historia que contamos?",
      "¿Qué es algo que antes creías y ya no crees?",
      "Si pudieras revivir un año de tu vida, ¿lo harías? ¿Cuál?",
      "¿Qué crees que es el amor: un sentimiento, una elección, una práctica, o algo más?"
    ],
    political: [
      "Si pudieras diseñar un país desde cero, ¿cuál sería la primera ley?",
      "¿Cuál es el problema más importante del mundo ahora mismo?",
      "¿La edad para votar debería bajar, subir o quedarse igual?",
      "¿Qué norma social crees que desaparecerá por completo en 50 años?",
      "Si fueras el “dictador benevolente” del mundo por un día, ¿qué cambiarías?",
      "¿Un mundo verdaderamente “sin fronteras” es posible o deseable?",
      "¿Cuál es el papel de la tecnología en la democracia moderna?",
      "¿La exploración espacial debería ser prioridad del gobierno o de empresas privadas?",
      "¿Cómo defines “justicia”?",
      "¿La renta básica universal es una solución viable para el futuro?",
      "¿Cuál es la forma más efectiva de que una persona común genere cambio político?",
      "¿La educación debería ser totalmente gratuita para todos, sin importar el área?",
      "¿Cómo equilibramos la privacidad personal con la seguridad nacional?",
      "¿Qué sistema político (real o ficticio) te fascina?",
      "¿La verdadera igualdad es posible, o la jerarquía es natural en los humanos?",
      "¿Debería haber un “límite” a la riqueza, y cuál?",
      "¿Cómo manejamos la desinformación sin afectar la libertad de expresión?",
      "Si pudieras hablar con el líder actual de cualquier país, ¿qué le dirías?",
      "¿Cuál es la lección más importante que hemos aprendido de los fracasos políticos del pasado?",
      "¿Tiene el gobierno la responsabilidad de asegurar la felicidad de todos?",
      "¿Qué debería considerarse un derecho humano básico en 2026 que aún no lo es en todas partes?",
      "Si pudieras rediseñar la escuela desde cero, ¿qué sería obligatorio?",
      "¿Cuál crees que es la forma más justa de manejar la salud/atención médica?",
      "¿Internet debería tratarse como un servicio público? ¿Por qué sí o por qué no?",
      "¿Cuánta influencia deberían poder tener las empresas en la política?",
      "¿Qué debería ser ilegal y no lo es (o al revés)?",
      "Si pudieras agregar una “ley global” nueva, ¿cuál sería?",
      "¿Qué es más importante para una sociedad: seguridad, libertad o igualdad? Ordénalas.",
      "¿El castigo debería tratar más de venganza, disuasión o rehabilitación?",
      "¿Qué política te hizo cambiar de opinión con el tiempo?",
      "¿Las ciudades deberían diseñarse más para autos o para personas?",
      "¿Cuál crees que es la mayor amenaza para la democracia?",
      "Si tuvieras mil millones de dólares para un solo problema, ¿cuál elegirías y cómo lo gastarías?",
      "¿Qué problema crees que se discute mucho pero se entiende mal?",
      "¿Cómo debería tratar la sociedad a quienes no quieren participar (trabajar, votar, etc.)?",
      "¿El nacionalismo puede ser saludable? ¿Cuándo?",
      "¿Cómo crees que se ve la semana laboral ideal?",
      "¿Debería haber límites al uso de IA en arte, educación o gobierno?",
      "¿Qué significa “progreso” para ti en una sociedad?"
    ],
    "about-us": [
      "¿Qué fue lo primero que pensaste cuando empezamos a hablar?",
      "¿Cuál es tu recuerdo favorito de nosotros hasta ahora?",
      "Si pudiéramos teletransportarnos para vernos solo una hora, ¿qué haríamos?",
      "¿Qué canción siempre te hace pensar en mí?",
      "¿Qué has aprendido de ti gracias a nuestra relación?",
      "Si fuéramos una “power couple” histórica, ¿cuál seríamos?",
      "¿Cuál es tu cosa “pequeña” favorita que hago y que no me has dicho antes?",
      "¿A dónde iremos primero cuando por fin se acabe la distancia?",
      "¿Qué pregunta “random” has querido hacerme pero aún no?",
      "Si fuéramos personajes de película, ¿cómo se llamaría?",
      "¿Qué es lo más “nosotros” de nuestra relación?",
      "¿Cómo me describes a gente que no me conoce?",
      "¿Qué sueño tienes para nuestro “futuro nosotros”?",
      "Si pudiéramos construir una casa juntos en cualquier lugar, ¿dónde sería?",
      "¿Qué hábito mío te parece secretamente tierno?",
      "¿Cómo cambió tu perspectiva de la “larga distancia” desde que empezamos?",
      "Si pudieras enviarme un “care package” ahora mismo con solo tres cosas, ¿cuáles serían?",
      "¿Cuál es el mejor consejo que nos hemos dado?",
      "¿Qué aventura quieres vivir conmigo que aún no hemos hablado?",
      "Si pudieras decirme una cosa ahora mismo que no me has dicho, ¿qué sería?",
      "¿Qué momento pequeñito conmigo repites en tu cabeza a veces?",
      "¿Qué crees que hacemos muy bien como pareja?",
      "¿Qué cosa quieres que mejoremos juntos (en plan bonito)?",
      "Si pudiéramos crear una tradición solo nuestra, ¿cuál sería?",
      "¿Qué lugar (real o imaginario) quieres visitar conmigo algún día?",
      "¿Qué pregunta esperas que te siga haciendo el resto de nuestra vida?",
      "¿Cuándo te sientes más amada por mí?",
      "¿Qué miedo tienes sobre el futuro que quieres que yo sepa?",
      "¿Qué quieres celebrar de ti este año?",
      "¿Qué recuerdo que aún no existe te emociona crear conmigo?",
      "Si pudieras congelar un día conmigo para siempre, ¿cómo sería ese día?",
      "¿Cuál crees que es el malentendido más gracioso de “nosotros”?",
      "¿Cuál es una forma en que puedo apoyarte cuando estás estresada?",
      "¿Y una forma en la que tú quieres apoyarme mejor a mí?",
      "Si escribiéramos un libro sobre nosotros, ¿cuáles serían los títulos de los capítulos?",
      "¿Qué te gustaría que aprendiéramos juntos (hobby, habilidad, idioma, lo que sea)?",
      "¿Qué problema de “futuro nosotros” crees que resolveremos fácil?",
      "¿Cómo quieres que se sienta nuestra vida día a día, no solo en viajes grandes?",
      "¿Qué promesa quieres que mantengamos pase lo que pase?"
    ],
    random: [
      "Si pudieras ser cualquier verdura, ¿cuál serías y por qué?",
      "¿Cuál es el superpoder más inútil que se te ocurre?",
      "Si los animales pudieran hablar, ¿qué especie sería la más grosera?",
      "¿Qué es lo más raro que has comido y te gustó?",
      "Si fueras un electrodoméstico de cocina, ¿cuál serías?",
      "¿Un hotdog es un sándwich? Defiende tu respuesta.",
      "¿Cuál es la mejor película “mala” que has visto?",
      "Si tuvieras que ser perseguida por un fantasma pero pudieras elegir a la persona, ¿a quién elegirías?",
      "¿Qué es lo más “valle inquietante” que has vivido?",
      "Si fueras una marca de cereal, ¿cómo sería la caja y cuál sería el premio?",
      "¿Qué fruta crees que es la más “de alto mantenimiento”?",
      "Si pudieras renombrar cualquier animal, ¿cómo lo llamarías?",
      "¿Cuál es tu canción de karaoke “de emergencia” si tu vida dependiera de hacerlo perfecto?",
      "Si tuvieras que vivir un año en un mundo de videojuego, ¿cuál elegirías?",
      "¿Cuál es la tendencia más vergonzosa en la que has participado?",
      "Si pudieras tener una criatura mítica como mascota, ¿cuál elegirías?",
      "¿Cuál es la forma “correcta” de cargar el lavavajillas?",
      "Si tu vida tuviera narrador/a, ¿de quién sería la voz?",
      "¿Qué dato inútil (trivia) es tu favorito?",
      "Si fueras un sabor de helado, ¿qué toppings raros incluirías?",
      "Si tuvieras que usar un disfraz todo un año, ¿cuál sería?",
      "¿Qué teoría conspirativa inventarías solo para confundir a la gente?",
      "Si pudieras añadir un botón completamente innecesario al cuerpo humano, ¿qué haría?",
      "¿Cómo sería la peor atracción de parque de diversiones imaginable?",
      "Si tu risa tuviera subtítulos, ¿qué dirían normalmente?",
      "Si solo pudieras comunicarte con frases de una película por un día, ¿qué película elegirías?",
      "¿Cuáles serían las reglas más graciosas para nuestra relación si fuera un videojuego?",
      "Si pudieras elegir un animal para que mida como un caballo, ¿cuál y por qué?",
      "¿Qué comida crees que está sobrevalorada, pero te da pena decirlo?",
      "Si abriéramos una cafetería juntos, ¿cómo se llamaría y cuál sería la bebida estrella?",
      "¿Qué olor te encanta pero a otras personas quizá les molestaría?",
      "Si tuvieras que reemplazar tus manos por dos objetos, ¿cuáles elegirías?",
      "¿Qué personaje ficticio sería el roommate más caótico?",
      "Si pudieras prohibir un sonido para siempre, ¿cuál sería?",
      "¿Cuál es tu pregunta de “¿preferirías?” más desquiciada?",
      "Si fuéramos dos animales, ¿qué animales seríamos?",
      "¿Cuál es el cumplido más raro que podrías decir con cara seria?",
      "Si tu cerebro tuviera pantalla de carga, ¿qué “tip” aparecería?",
      "¿Qué es lo más ridículo que podrías poner en un CV que aún sea técnicamente cierto?",
      "Si pudiéramos dominar instantáneamente una habilidad inútil juntos, ¿cuál debería ser?"
    ]
  },
  zh: {
    history: [
      "如果你能和任何历史人物共进晚餐，你会选谁？",
      "你最想揭开哪个历史谜团的真相？",
      "如果你能阻止一个历史事件（不造成悖论），你会阻止哪一个？",
      "如果只能去某个时代生活一周，你会选哪个时代？",
      "你觉得历史上最被低估的人是谁？",
      "如果你能问一位维京人一个问题，你会问什么？",
      "有什么历史“事实”听起来像假的但其实是真的？",
      "如果你是 1700 年代的王室成员，你的“丑闻”会是什么？",
      "你觉得哪一个古代文明在当时最先进？",
      "如果你能把一项现代科技带到中世纪，你会带什么？",
      "在你心里，历史上最美的建筑是什么？",
      "如果你能亲临一次历史条约签署，你会选哪一次？",
      "有什么“失落的历史”（比如亚历山大图书馆）你希望还存在？",
      "如果你能改变一场战争的结局，你会改变哪一场？",
      "哪个历史人物面对智能手机会最困惑？",
      "如果你能回去对 10 岁的自己说一句关于历史的话，你会说什么？",
      "你知道的最酷的“文艺复兴人物”是谁？",
      "如果你是 15 世纪的探险家，你最想“发现”什么？",
      "你觉得自己家族史里最有趣的一点是什么？",
      "如果历史会重复，我们现在最像处在哪个时代？",
      "如果你能见到一座古城的巅峰时期，你会选哪座？",
      "你觉得哪项发明对人类生活的改变最大？为什么？",
      "如果你能读到一位历史人物的私密信件，你会选谁的？",
      "哪个历史事件你最希望有更清晰的记录（比如视频）？",
      "如果你能穿越到过去的某个“普通一天”，你最想看到什么？",
      "你觉得自己会意外擅长哪一种历史职业？",
      "如果你能拯救一种已经灭绝的动物，你会选哪一种？",
      "你觉得哪个“微小”的历史瞬间其实改变了后来的大走向？",
      "如果你能给一个历史人物安排现代心理咨询，你会选谁？",
      "你觉得哪一个帝国/文化最常被误解？",
      "如果你能在某个历史节点替换领导者，你会换成谁？",
      "有什么历史传闻你最想确认真假？",
      "如果必须经历一次历史上的长途旅程（船队/商队/探险），你会选哪一次？",
      "哪一个历史时代对你个人来说会最难熬？为什么？",
      "如果你能问一位古代哲学家一个问题，你会问谁、问什么？",
      "你听过最有趣的“被遗忘的历史技术”是什么？",
      "你最想现场听到的历史演讲是哪一篇？",
      "如果你能永远保存一件文物，你会选什么？",
      "你小时候相信过的一个历史“误区”是什么？"
    ],
    philosophy: [
      "你对“时间”的个人定义是什么？",
      "如果我们生活在模拟世界里，这会改变你怎么生活吗？",
      "“运气”真的存在吗？还是只是我们不理解的概率？",
      "“家”对你来说意味着什么？",
      "被爱更重要还是被尊重更重要？",
      "如果你能知道自己的死亡日期，你想知道吗？",
      "人类有自由意志吗？还是一切都只是对过去的反应？",
      "“成功”在你眼里到底是什么样子？",
      "如果你能永生但永远保持同一年龄，你会选择吗？",
      "艺术需要观众才能算艺术吗？",
      "“真相”是客观的吗？还是总会被感受与立场染色？",
      "你觉得一个人最重要的美德是什么？",
      "如果你能把意识下载到电脑里，你会做吗？",
      "你觉得我们死后会发生什么（如果会发生什么的话）？",
      "没有经历过悲伤，人还能真正快乐吗？",
      "做“对的事”更重要，还是把事情“做对”更重要？",
      "你认为灵魂是什么？",
      "如果你能改变人性中的一件事，你会改变什么？",
      "你相信万事皆有因果，还是宇宙本质混沌？",
      "“生活”与“存在”有什么区别？",
      "你觉得“好好活着”至少需要哪些基本要素？",
      "不刻意努力也能成为好人吗？",
      "你觉得人真的会改变吗？还是只是更像自己？",
      "你觉得自己对陌生人负有什么责任（如果有的话）？",
      "原谅是为了别人，还是为了自己？",
      "如果你能从人类身上移除一种情绪，你会移除吗？哪一种？",
      "你更想要确定性还是可能性？",
      "如果谎言能避免别人的痛苦，它是合法的吗？",
      "什么构成了“你”：记忆、身体、选择，还是别的？",
      "你相信我们天生有使命，还是我们自己创造意义？",
      "如果你能向宇宙问一个问题并得到真实答案，你会问什么？",
      "“美”是真实存在的吗？还是一种共同幻觉？",
      "“自由”对你个人来说意味着什么？",
      "两个人对同一瞬间的记忆不同，哪个才算“真实”？",
      "对你来说，被理解更重要还是被接纳更重要？",
      "你觉得痛苦一定会带来成长吗？还是我们给它编的故事？",
      "有什么你曾经深信但现在不再相信的东西？",
      "如果能重活你人生中的一年，你会选哪一年？",
      "你觉得爱是什么：感觉、选择、练习，还是别的？"
    ],
    political: [
      "如果你能从零设计一个国家，第一条法律会是什么？",
      "你认为当今世界最重要的问题是什么？",
      "投票年龄应该降低、提高，还是保持不变？",
      "你觉得 50 年后会完全消失的一条社会规范是什么？",
      "如果你当一天“仁慈的独裁者”，你会改变什么？",
      "真正“无国界”的世界可能吗？或者值得追求吗？",
      "科技在现代民主中应该扮演什么角色？",
      "太空探索应由政府优先推动还是交给私企？",
      "你如何定义“正义”？",
      "全民基本收入是未来可行的解决方案吗？",
      "普通人推动政治改变最有效的方式是什么？",
      "教育是否应该对所有人完全免费（不分专业）？",
      "如何在个人隐私与国家安全之间取得平衡？",
      "有什么政治制度（真实或虚构）让你着迷？",
      "真正的平等可能吗？还是层级是人类的天性？",
      "你认为财富是否应该有上限？如果有，上限该如何定义？",
      "我们如何处理“错误信息”而不侵犯言论自由？",
      "如果你能对任何国家的现任领导人说一句话，你会说什么？",
      "从过去的政治失败中，我们学到的最重要一课是什么？",
      "政府是否有责任确保每个人的幸福？",
      "在 2026 年，你觉得哪些应该算基本人权但还没普及？",
      "如果你能从零重做学校教育，你会把什么设为必修？",
      "你觉得最公平的医疗体系应该怎么设计？",
      "互联网应该被视为公共基础设施吗？为什么？",
      "企业应该被允许在政治上影响到什么程度？",
      "有什么事情你觉得应该违法但现在不违法（或反过来）？",
      "如果你能新增一条“全球法律”，你会写什么？",
      "在安全、自由、平等之间你会怎么排序？",
      "惩罚更应该是报复、威慑，还是改造？",
      "有哪项政策你随着时间改变过看法？",
      "城市应该更为汽车设计还是更为人设计？",
      "你认为民主最大的威胁是什么？",
      "如果你有十亿美元只用来解决一个问题，你会选什么、怎么花？",
      "有哪些问题大家讨论很多但其实理解错了？",
      "社会应如何面对不愿参与的人（工作/投票等）？",
      "民族主义在什么时候可能是健康的？",
      "你理想中的工作周是什么样？",
      "AI 在艺术、教育或政府中的使用应该有边界吗？",
      "对你来说，社会的“进步”意味着什么？"
    ],
    "about-us": [
      "我们刚开始聊天时，你的第一反应是什么？",
      "到目前为止，你最喜欢的我们的回忆是哪一个？",
      "如果我们能瞬间传送相见一小时，我们会做什么？",
      "哪首歌总会让你想到我？",
      "因为我们的关系，你对自己有什么新的认识？",
      "如果我们是历史上的一对“强强组合”，会是哪一对？",
      "你最喜欢我做的一件“小事”是什么（你还没说过的）？",
      "等距离结束后，我们第一站要去哪里？",
      "你一直想问我但还没问的一个“随机问题”是什么？",
      "如果我们是电影角色，这部电影会叫什么名字？",
      "你觉得我们关系里最“我们”的部分是什么？",
      "你会怎么向没见过我的人介绍我？",
      "你对“未来的我们”有什么梦想？",
      "如果我们能在任何地方一起建一座房子，你会选哪里？",
      "我有什么习惯你其实觉得特别可爱？",
      "从我们开始到现在，你对“异地恋”的看法有什么变化？",
      "如果现在只能寄给我一个三件套的“关怀包”，你会放什么？",
      "我们给过彼此最好的建议是什么？",
      "你想和我一起做、但我们还没认真聊过的冒险是什么？",
      "如果现在让你对我说一句你还没说过的话，你会说什么？",
      "有哪个和我有关的小瞬间你会反复回想？",
      "你觉得我们作为一对情侣做得最棒的是什么？",
      "有什么你希望我们一起变得更好的（可可爱爱的那种）？",
      "如果我们要创造一个只属于我们的传统，会是什么？",
      "有什么地方（真实或想象）你想和我一起去？",
      "你希望我一辈子都继续问你的一个问题是什么？",
      "什么时候你最能感受到我爱你？",
      "关于未来你有什么担心是你想让我知道的？",
      "今年你想庆祝自己哪一点？",
      "有什么“还没发生”的回忆你已经很期待了？",
      "如果能把和你的一天冻结成永恒，那一天会是什么样？",
      "你觉得我们之间最搞笑的一次误会是什么？",
      "你压力大的时候，我可以怎么更好地支持你？",
      "你也希望如何更好地支持我？",
      "如果我们写一本关于我们的书，章节标题会是什么？",
      "你想和我一起学点什么（爱好/技能/语言/任何）？",
      "你觉得“未来的我们”会很轻松解决的一个问题是什么？",
      "你希望我们的日常生活“感觉”是什么样，而不只是旅行？",
      "无论发生什么，你希望我们坚持的一个承诺是什么？"
    ],
    random: [
      "如果你能变成一种蔬菜，你会选哪一种？为什么？",
      "你能想到最没用的超能力是什么？",
      "如果动物会说话，哪一种最没礼貌？",
      "你吃过最奇怪但居然喜欢的东西是什么？",
      "如果你是一个厨房电器，你会是哪一个？",
      "热狗算三明治吗？请辩护。",
      "你看过最好看的“烂片”是哪一部？",
      "如果必须被一个鬼魂缠上，但你能选人，你会选谁？",
      "你经历过最“恐怖谷”的事情是什么？",
      "如果你是一款麦片品牌，包装长什么样？盒子里送什么？",
      "你觉得哪种水果最“难伺候”？",
      "如果你能给任何动物改名，你会怎么改？",
      "如果你必须靠一首歌唱到完美才能活下去，你会选哪首卡拉 OK 歌？",
      "如果要在一个游戏世界里住一年，你会选哪个？",
      "你跟风过最尴尬的潮流是什么？",
      "如果你能养一只神话生物当宠物，你会选哪个？",
      "你觉得装洗碗机的“正确方法”是什么？",
      "如果你的人生有旁白，声音你想选谁？",
      "你知道的最没用但很好笑的冷知识是什么？",
      "如果你是一个冰淇淋口味，你会加哪些奇怪配料？",
      "如果你必须穿同一套装扮一年，你会选什么？",
      "你会发明一个什么阴谋论来专门迷惑大家？",
      "如果你能给人体加一个完全没必要的按钮，它会做什么？",
      "你能想象的最糟糕游乐设施是什么样？",
      "如果你的笑声有字幕，通常会写什么？",
      "如果一天只能用电影台词交流，你会选哪部电影？",
      "如果我们的关系是一款游戏，你会加哪些最搞笑的“规则”？",
      "如果有一种动物必须变得像马一样大，你会选哪一种？为什么？",
      "你觉得哪种食物其实被高估了，但你不好意思说？",
      "如果我们一起开一家咖啡馆，它会叫什么？招牌饮品是什么？",
      "有什么味道你莫名很喜欢，但别人可能讨厌？",
      "如果你的手必须换成两个物品，你会选哪两个？",
      "哪个虚构角色会是最混乱的室友？",
      "如果能把一种声音从世界上删掉，你会删哪一种？",
      "你最离谱的“你宁愿”问题是什么？",
      "如果我们是两种动物，我们会是哪两种？",
      "你能一本正经说出口的最奇怪赞美是什么？",
      "如果你的大脑有加载界面，会显示什么提示语？",
      "你能写在简历上、最荒唐但仍然“技术上真实”的一句话是什么？",
      "如果我们能瞬间精通一个没用的技能，你想精通什么？"
    ]
  },
  de: {
    history: [
      "Wenn du mit einer historischen Person zu Abend essen könntest, wer wäre das?",
      "Welches historische Rätsel würdest du am liebsten lösen?",
      "Wenn du ein historisches Ereignis verhindern könntest (ohne Paradox), welches wäre es?",
      "In welcher Epoche würdest du gern nur eine Woche leben?",
      "Wer ist deiner Meinung nach die am meisten unterschätzte Person der Geschichte?",
      "Wenn du einen Wikinger etwas fragen könntest, was würdest du fragen?",
      "Welche historische „Tatsache“ klingt erfunden, ist aber wahr?",
      "Wenn du im 18. Jahrhundert königlich wärst: Was wäre dein „Skandal“?",
      "Welche antike Zivilisation war für ihre Zeit am fortschrittlichsten?",
      "Wenn du eine moderne Technologie ins Mittelalter bringen dürftest, welche wäre das?",
      "Welche Architektur der Geschichte findest du am schönsten?",
      "Bei welcher historischen Vertragsunterzeichnung würdest du gern dabei sein?",
      "Welches „verlorene“ Stück Geschichte (z.B. die Bibliothek von Alexandria) hättest du gern noch heute?",
      "Wenn du den Ausgang eines Krieges ändern könntest, welchen würdest du ändern?",
      "Welche historische Figur wäre von einem Smartphone am verwirrtesten?",
      "Wenn du deinem 10-jährigen Ich eine Sache über Geschichte sagen könntest, was wäre es?",
      "Welche Renaissance-Person findest du am coolsten?",
      "Wenn du im 15. Jahrhundert Entdecker:in wärst, was würdest du „entdecken“ wollen?",
      "Was ist das Interessanteste an deiner eigenen Familiengeschichte?",
      "Wenn sich Geschichte wiederholt: In welcher Epoche leben wir gerade?",
      "Welche antike Stadt würdest du gern auf dem Höhepunkt erleben?",
      "Welche Erfindung hat das menschliche Leben am meisten verändert – und warum?",
      "Wessen private Briefe aus der Geschichte würdest du gern lesen?",
      "Welches Ereignis wünschst du dir besser dokumentiert (z.B. Video)?",
      "Wenn du in die Vergangenheit zu einem „ganz normalen Tag“ reisen könntest: Was würdest du sehen wollen?",
      "Welchen historischen Beruf würdest du überraschend gut können?",
      "Welche ausgestorbene Tierart würdest du retten, wenn du könntest?",
      "Welcher „kleine“ historische Moment hat später vermutlich alles verändert?",
      "Wem aus der Geschichte würdest du eine moderne Therapie gönnen?",
      "Welches Reich / welche Kultur wird am meisten missverstanden?",
      "Wenn du für einen Moment die Führung austauschen könntest: Wen würdest du einsetzen?",
      "Welches historische Gerücht würdest du gern bestätigen oder widerlegen?",
      "Welche historische Reise (Schiff, Karawane, Expedition) würdest du erleben wollen?",
      "Welche Epoche wäre für dich persönlich am härtesten – und warum?",
      "Wenn du eine:n antiken Philosophen:in etwas fragen könntest: Wen und was?",
      "Welche „vergessene“ Technologie der Geschichte findest du am spannendsten?",
      "Welche historische Rede würdest du gern live hören?",
      "Welches Artefakt würdest du für immer bewahren?",
      "Welche Geschichts-„Legende“ hast du als Kind geglaubt?"
    ],
    philosophy: [
      "Was ist deine persönliche Definition von Zeit?",
      "Wenn wir in einer Simulation leben würden: Würde das ändern, wie du lebst?",
      "Gibt es „Glück“, oder ist es nur Wahrscheinlichkeit, die wir nicht verstehen?",
      "Was bedeutet „Zuhause“ für dich?",
      "Ist es besser, geliebt oder respektiert zu werden?",
      "Wenn du dein Todesdatum kennen könntest: Würdest du es wissen wollen?",
      "Haben Menschen freien Willen – oder ist alles nur Reaktion auf vorherige Ereignisse?",
      "Wie sieht „Erfolg“ für dich aus?",
      "Wenn du ewig leben könntest und gleich alt bliebst: Würdest du das wollen?",
      "Braucht Kunst ein Publikum, um Kunst zu sein?",
      "Ist „Wahrheit“ objektiv oder immer von Wahrnehmung gefärbt?",
      "Welche Tugend ist für dich die wichtigste?",
      "Wenn du dein Bewusstsein in einen Computer laden könntest: Würdest du es tun?",
      "Was glaubst du, passiert nach dem Tod (falls überhaupt etwas passiert)?",
      "Kann man wirklich glücklich sein, ohne jemals traurig gewesen zu sein?",
      "Ist es wichtiger, das Richtige zu tun oder Dinge richtig zu tun?",
      "Was ist eine Seele – deiner Meinung nach?",
      "Wenn du eine Sache an der menschlichen Natur ändern könntest, was wäre das?",
      "Passiert alles aus einem Grund – oder ist das Universum chaotisch?",
      "Was ist der Unterschied zwischen „leben“ und „existieren“?",
      "Was braucht ein „gutes Leben“ mindestens?",
      "Kann man gut sein, ohne es zu versuchen?",
      "Können Menschen sich wirklich ändern – oder werden sie nur mehr sie selbst?",
      "Was schuldest du Fremden, wenn überhaupt etwas?",
      "Ist Vergebung etwas für andere oder für dich selbst?",
      "Wenn du eine Emotion aus der Menschheit entfernen könntest: Würdest du? Welche?",
      "Würdest du lieber mit Gewissheit oder mit Möglichkeit leben?",
      "Ist Lügen okay, wenn es jemanden vor Schmerz schützt?",
      "Was macht dich „du“ – Erinnerungen, Körper, Entscheidungen oder etwas anderes?",
      "Glaubst du an einen Zweck – oder erschaffen wir ihn?",
      "Wenn du dem Universum eine Frage stellen und eine wahre Antwort bekommen könntest: Welche?",
      "Ist „Schönheit“ real oder nur eine gemeinsame Illusion?",
      "Was bedeutet „Freiheit“ für dich persönlich?",
      "Wenn zwei Menschen denselben Moment unterschiedlich erinnern: Welche Erinnerung ist „wahr“?",
      "Ist es wichtiger, verstanden oder akzeptiert zu werden?",
      "Lehrt Leid immer etwas – oder ist das nur eine Geschichte, die wir erzählen?",
      "Was hast du früher geglaubt, glaubst du aber heute nicht mehr?",
      "Wenn du ein Jahr deines Lebens noch einmal leben könntest: Welches wäre es?",
      "Was ist Liebe für dich: Gefühl, Entscheidung, Praxis oder etwas anderes?"
    ],
    political: [
      "Wenn du ein Land von Grund auf entwerfen könntest: Was wäre das erste Gesetz?",
      "Was ist das wichtigste Problem der Welt gerade?",
      "Sollte das Wahlalter gesenkt, erhöht oder gleich bleiben?",
      "Welche soziale Norm wird deiner Meinung nach in 50 Jahren verschwunden sein?",
      "Wenn du für einen Tag „wohlwollende:r Diktator:in“ wärst: Was würdest du ändern?",
      "Ist eine wirklich „grenzenlose“ Welt möglich oder wünschenswert?",
      "Welche Rolle sollte Technologie in einer modernen Demokratie spielen?",
      "Sollte Raumfahrt Priorität des Staates sein oder privaten Firmen überlassen werden?",
      "Wie definierst du „Gerechtigkeit“?",
      "Ist ein bedingungsloses Grundeinkommen eine realistische Zukunftslösung?",
      "Was ist der effektivste Weg für normale Menschen, politischen Wandel zu bewirken?",
      "Sollte Bildung komplett kostenlos sein – unabhängig vom Fach?",
      "Wie balancieren wir Privatsphäre und nationale Sicherheit?",
      "Welches politische System (real oder fiktiv) fasziniert dich?",
      "Ist echte Gleichheit möglich – oder ist Hierarchie menschlich?",
      "Sollte es eine Grenze für Reichtum geben? Wenn ja, welche?",
      "Wie gehen wir mit Desinformation um, ohne Meinungsfreiheit zu verletzen?",
      "Wenn du mit einem aktuellen Staatschef sprechen könntest: Was würdest du sagen?",
      "Was ist die wichtigste Lehre aus politischen Fehlschlägen der Vergangenheit?",
      "Hat eine Regierung die Pflicht, das Glück aller zu sichern?",
      "Was sollte 2026 als Menschenrecht gelten, ist es aber nicht überall?",
      "Wenn du Schule neu designen könntest: Was müsste verpflichtend sein?",
      "Wie sollte ein faires Gesundheitssystem aussehen?",
      "Sollte das Internet wie eine öffentliche Grundversorgung behandelt werden? Warum (nicht)?",
      "Wie stark sollten Unternehmen Politik beeinflussen dürfen?",
      "Was sollte illegal sein, ist es aber nicht (oder umgekehrt)?",
      "Wenn du ein neues „globales Gesetz“ hinzufügen könntest: Welches wäre es?",
      "Was ist wichtiger: Sicherheit, Freiheit oder Gleichheit? Ordne sie.",
      "Soll Strafe eher Rache, Abschreckung oder Rehabilitation sein?",
      "Welche Politikfrage hat dich deine Meinung ändern lassen?",
      "Sollten Städte mehr für Autos oder mehr für Menschen geplant sein?",
      "Was ist die größte Bedrohung für Demokratie?",
      "Wenn du eine Milliarde Euro für ein Problem ausgeben müsstest: Welches und wie?",
      "Welches Problem wird oft besprochen, aber falsch verstanden?",
      "Wie sollte die Gesellschaft mit Menschen umgehen, die nicht „mitmachen“ wollen (Arbeit, Wahl, etc.)?",
      "Kann Nationalismus gesund sein? Wann?",
      "Wie sieht für dich die ideale Arbeitswoche aus?",
      "Sollte es Grenzen für KI in Kunst, Bildung oder Staat geben?",
      "Was bedeutet „Fortschritt“ für dich in einer Gesellschaft?"
    ],
    "about-us": [
      "Was war dein allererster Gedanke, als wir angefangen haben zu schreiben?",
      "Was ist bisher deine schönste Erinnerung an uns?",
      "Wenn wir uns für nur eine Stunde teleportieren könnten: Was würden wir tun?",
      "Welches Lied erinnert dich immer an mich?",
      "Was hast du über dich gelernt благодаря unserer Beziehung?",
      "Wenn wir ein „Power Couple“ der Geschichte wären: Welches wären wir?",
      "Was ist deine liebste „kleine“ Sache, die ich mache und die du noch nie erwähnt hast?",
      "Wohin fahren wir als erstes, wenn die Distanz endlich weg ist?",
      "Welche „random“ Frage wolltest du mich schon lange fragen?",
      "Wenn wir Figuren in einem Film wären: Wie hieße der Film?",
      "Was ist das „meiste wir“ an unserer Beziehung?",
      "Wie beschreibst du mich Menschen, die mich nicht kennen?",
      "Welchen Traum hast du für „Future Us“?",
      "Wenn wir irgendwo zusammen ein Haus bauen könnten: Wo wäre es?",
      "Welche Angewohnheit von mir findest du heimlich süß?",
      "Wie hat sich dein Blick auf Fernbeziehung verändert, seit wir zusammen sind?",
      "Wenn du mir jetzt ein Care-Paket mit nur drei Dingen schicken könntest: Welche wären es?",
      "Was ist der beste Rat, den wir uns je gegeben haben?",
      "Welches Abenteuer willst du mit mir erleben, über das wir noch nicht gesprochen haben?",
      "Wenn du mir jetzt eine Sache sagen könntest, die du noch nicht gesagt hast: Was wäre das?",
      "Welchen kleinen Moment mit mir spielst du manchmal in deinem Kopf ab?",
      "Was machen wir als Paar richtig gut?",
      "Worin willst du, dass wir gemeinsam besser werden (auf süße Art)?",
      "Wenn wir eine Tradition nur für uns hätten: Welche wäre das?",
      "Welchen Ort (real oder imaginär) willst du mit mir besuchen?",
      "Welche Frage hoffst du, dass ich dich für den Rest unseres Lebens frage?",
      "Wann fühlst du dich von mir am meisten geliebt?",
      "Welche Angst über die Zukunft willst du, dass ich sie kenne?",
      "Was willst du dieses Jahr an dir feiern?",
      "Welche Erinnerung, die wir noch nicht gemacht haben, freust du dich am meisten drauf?",
      "Wenn du einen Tag mit mir für immer einfrieren könntest: Wie sähe er aus?",
      "Was ist unser lustigstes „Wir haben uns missverstanden“-Missverständnis?",
      "Wie kann ich dich am besten unterstützen, wenn du gestresst bist?",
      "Wie willst du mich besser unterstützen?",
      "Wenn wir ein Buch über uns schreiben: Wie würden die Kapitel heißen?",
      "Was willst du, dass wir zusammen lernen (Hobby, Skill, Sprache – egal was)?",
      "Welches „Future Us“-Problem lösen wir deiner Meinung nach easy?",
      "Wie soll sich unser Alltag anfühlen – nicht nur große Reisen?",
      "Welches Versprechen willst du, dass wir immer halten?"
    ],
    random: [
      "Wenn du ein Gemüse sein könntest: welches und warum?",
      "Was ist die nutzloseste Superkraft, die dir einfällt?",
      "Wenn Tiere sprechen könnten: Welche Art wäre am unhöflichsten?",
      "Was ist das seltsamste, das du gegessen hast und mochtest?",
      "Wenn du ein Küchengerät wärst: welches wärst du?",
      "Ist ein Hotdog ein Sandwich? Verteidige deine Antwort.",
      "Was ist der beste „schlechte“ Film, den du je gesehen hast?",
      "Wenn dich ein Geist verfolgen müsste, aber du dürftest wählen: Wer wäre es?",
      "Was ist das „Uncanny-Valley“-artigste, das du erlebt hast?",
      "Wenn du eine Müsli-Marke wärst: Wie sähe die Packung aus und was wäre das Spielzeug?",
      "Welche Frucht ist am „high maintenance“?",
      "Wenn du ein Tier umbenennen könntest: Wie würdest du es nennen?",
      "Was ist dein Karaoke-Song, wenn dein Leben von Perfektion abhängt?",
      "Wenn du ein Jahr in einer Videospielwelt leben müsstest: welche wäre es?",
      "Welcher Trend war dir im Nachhinein am peinlichsten?",
      "Welches mythische Wesen hättest du gern als Haustier?",
      "Was ist die „richtige“ Art, eine Spülmaschine einzuräumen?",
      "Wenn dein Leben einen Erzähler hätte: Wessen Stimme wäre das?",
      "Was ist das nutzloseste Trivia-Fakt, das du kennst?",
      "Wenn du ein Eisgeschmack wärst: Welche komischen Toppings würdest du nehmen?",
      "Wenn du ein Jahr lang nur ein Kostüm tragen müsstest: welches?",
      "Welche Verschwörungstheorie würdest du erfinden, nur um Leute zu verwirren?",
      "Wenn du dem Menschen einen unnötigen Knopf hinzufügen könntest: Was würde er tun?",
      "Wie sähe die schlimmste Achterbahn/Attraktion der Welt aus?",
      "Wenn dein Lachen Untertitel hätte: Was stünde da meistens?",
      "Wenn du einen Tag nur in Filmzitaten sprechen dürftest: Welchen Film würdest du wählen?",
      "Was wären die witzigsten „Regeln“ für unsere Beziehung, wenn sie ein Videospiel wäre?",
      "Welches Tier würdest du auf Pferdegröße skalieren – und warum?",
      "Welches Essen ist heimlich überbewertet, aber du sagst es nicht gern?",
      "Wenn wir ein Café aufmachen würden: Wie hieße es und was wäre das Signature-Getränk?",
      "Welchen Geruch liebst du, den andere vielleicht hassen?",
      "Wenn du deine Hände durch zwei Gegenstände ersetzen müsstest: welche?",
      "Welche fiktive Figur wäre der chaotischste Mitbewohner?",
      "Welches Geräusch würdest du aus der Existenz verbannen?",
      "Was ist deine verrückteste „Würdest du eher…?“-Frage?",
      "Wenn wir zwei Tiere wären: welche wären wir?",
      "Was ist das seltsamste Kompliment, das du mit ernstem Gesicht machen könntest?",
      "Wenn dein Gehirn einen Ladebildschirm hätte: Welcher Tipp stünde dort?",
      "Was ist das absurdeste, das du in einen Lebenslauf schreiben könntest, aber technisch stimmt?",
      "Wenn wir zusammen eine nutzlose Fähigkeit sofort meistern könnten: welche?"
    ]
  },
  tr: {
    history: [
      "Herhangi bir tarihi figürle akşam yemeği yiyebilsen, kimi seçerdin?",
      "En çok hangi tarihi gizemin cevabını öğrenmek isterdin?",
      "Bir tarihi olayı (paradoks yaratmadan) engelleyebilsen, hangisini engellerdin?",
      "Sadece bir haftalığına hangi dönemde yaşamak isterdin?",
      "Tarihte en “hakkı yenmiş” kişi sence kim?",
      "Bir Viking'e tek soru sorabilsen, ne sorardın?",
      "Kulağa uydurma gelen ama gerçek olan hangi tarihi “gerçek” var?",
      "1700’lerde soylu olsaydın “skandalın” ne olurdu?",
      "Hangi antik uygarlık kendi zamanı için en gelişmişti sence?",
      "Orta Çağ’a bir modern teknoloji götürebilsen, hangisini götürürdün?",
      "Tarihte sana göre en güzel mimari eser hangisi?",
      "Bir anlaşma imzasına tanık olabilsen, hangisini seçerdin?",
      "Hangi “kayıp” tarih parçasının (İskenderiye Kütüphanesi gibi) hâlâ var olmasını isterdin?",
      "Bir savaşın sonucunu değiştirebilsen, hangisini değiştirirdin?",
      "Akıllı telefondan en çok kafası karışacak tarihi kişi kim olurdu?",
      "10 yaşındaki kendine tarih hakkında tek şey söyleyebilsen, ne derdin?",
      "Bildiğin en havalı Rönesans kişisi kim?",
      "15. yüzyılda kaşif olsaydın ne “keşfetmek” isterdin?",
      "Kendi aile tarihinin en ilginç kısmı ne?",
      "Tarih tekerrür ediyorsa, şu an hangi dönemi yaşıyoruz sence?",
      "Bir antik şehri zirvesindeyken görebilsen, hangisi olurdu?",
      "Sence insan hayatını en çok değiştiren icat hangisi ve neden?",
      "Tarihten birinin özel mektuplarını okuyabilsen, kiminki olurdu?",
      "Hangi tarihi olayın daha iyi belgelenmiş olmasını isterdin (video gibi)?",
      "Geçmişte “sıradan bir gün”e gidebilsen, ne görmek isterdin?",
      "Hangi tarihi işi beklenmedik şekilde iyi yapardın sence?",
      "Yok olmuş bir hayvan türünü geri getirebilsen, hangisi olurdu?",
      "Sence hangi “küçük” tarih anı sonradan her şeyi değiştirdi?",
      "Bir tarihi kişiye modern bir terapist verebilsen, kimi seçerdin?",
      "Hangi imparatorluk/kültür en çok yanlış anlaşılmış?",
      "Bir tarihi anda liderleri değiştirebilsen, kimi koyardın?",
      "Hangi tarihi dedikodunun doğru mu yanlış mı olduğunu bilmek isterdin?",
      "Bir tarihi yolculuğu (gemi, kervan, sefer) yaşamak zorunda olsan hangisini seçerdin?",
      "Hangi dönem senin için kişisel olarak en zor olurdu ve neden?",
      "Bir antik filozofa tek soru sorabilsen, kime ve ne sorardın?",
      "Tarihten duyduğun en ilginç “unutulmuş teknoloji” ne?",
      "Hangi tarihi konuşmayı canlı dinlemek isterdin?",
      "Bir eseri sonsuza kadar koruyabilsen, hangisini seçerdin?",
      "Çocukken inandığın bir tarih “efsane”si neydi?"
    ],
    philosophy: [
      "Zamanın senin için kişisel tanımı nedir?",
      "Simülasyonda yaşıyor olsak, bu hayatını nasıl yaşadığını değiştirir miydi?",
      "“Şans” gerçekten var mı, yoksa anlamadığımız olasılık mı?",
      "“Ev” senin için ne demek?",
      "Sevilmek mi saygı görmek mi daha iyi?",
      "Ölüm tarihini bilebilsen, bilmek ister miydin?",
      "İnsanların özgür iradesi var mı, yoksa her şey öncekinin tepkisi mi?",
      "“Başarı” senin gözünde nasıl görünüyor?",
      "Sonsuza dek aynı yaşta yaşayabilsen, ister miydin?",
      "Sanat, sanat sayılmak için izleyiciye ihtiyaç duyar mı?",
      "“Gerçek” objektif mi, yoksa algıyla hep renklendiriliyor mu?",
      "Bir insanda en önemli erdem sence ne?",
      "Bilinçini bir bilgisayara indirebilsen, yapar mıydın?",
      "Öldükten sonra (eğer bir şey oluyorsa) ne olduğunu düşünüyorsun?",
      "Üzüntüyü hiç yaşamadan gerçekten mutlu olunabilir mi?",
      "Doğru şeyi yapmak mı, işi doğru yapmak mı daha önemli?",
      "Sence ruh nedir?",
      "İnsan doğasıyla ilgili bir şeyi değiştirebilsen, neyi değiştirirdin?",
      "Her şeyin bir nedeni mi var, yoksa evren kaotik mi?",
      "“Yaşamak” ile “var olmak” arasındaki fark nedir?",
      "“İyi bir hayat” için minimum neler gerekli?",
      "Çaba göstermeden iyi biri olunabilir mi?",
      "İnsanlar gerçekten değişebilir mi, yoksa sadece daha çok kendileri mi olur?",
      "Yabancılara ne borçlusun (eğer bir şey borçluysan)?",
      "Affetmek başkaları için mi yoksa kendin için mi?",
      "İnsanlıktan bir duyguyu kaldırabilsen, kaldırır mıydın? Hangisi?",
      "Kesinlik mi ihtimal mi: hangisiyle yaşamak istersin?",
      "Birinin acısını azaltıyorsa yalan söylemek olur mu?",
      "“Sen”i sen yapan şey ne: anılar, beden, seçimler, yoksa başka bir şey mi?",
      "Bir amacımız var mı, yoksa biz mi yaratıyoruz?",
      "Evrene bir soru sorup kesin doğru cevap alabilsen, ne sorardın?",
      "“Güzellik” gerçek mi, yoksa ortak bir yanılsama mı?",
      "“Özgürlük” senin için kişisel olarak ne demek?",
      "Aynı anı iki kişi farklı hatırlıyorsa hangisi “doğru”?",
      "Anlaşılmak mı kabul edilmek mi daha önemli?",
      "Acı her zaman bir şey öğretir mi, yoksa sadece anlattığımız bir hikâye mi?",
      "Eskiden inanıp artık inanmadığın bir şey ne?",
      "Hayatından bir yılı yeniden yaşayabilsen, hangisini seçerdin?",
      "Sence aşk nedir: duygu mu, seçim mi, pratik mi, yoksa başka bir şey mi?"
    ],
    political: [
      "Sıfırdan bir ülke tasarlasan, ilk yasa ne olurdu?",
      "Dünyanın şu an en önemli sorunu sence ne?",
      "Oy verme yaşı düşmeli mi, yükselmeli mi, aynı mı kalmalı?",
      "50 yıl sonra tamamen yok olacağını düşündüğün bir sosyal norm ne?",
      "Bir günlüğüne “iyi niyetli diktatör” olsan neyi değiştirirdin?",
      "Gerçekten “sınırların olmadığı” bir dünya mümkün mü ya da istenir mi?",
      "Teknolojinin modern demokrasideki rolü ne olmalı?",
      "Uzay keşfi devlet önceliği mi olmalı yoksa özel şirketlere mi bırakılmalı?",
      "“Adalet”i nasıl tanımlarsın?",
      "Evrensel temel gelir gelecekte uygulanabilir mi?",
      "Sıradan bir insanın politik değişim yaratmasının en etkili yolu ne?",
      "Eğitim alan fark etmeksizin herkes için tamamen ücretsiz olmalı mı?",
      "Kişisel mahremiyet ile ulusal güvenliği nasıl dengeleriz?",
      "Seni etkileyen bir politik sistem (gerçek ya da kurgu) hangisi?",
      "Gerçek eşitlik mümkün mü, yoksa hiyerarşi insan doğası mı?",
      "Servete bir “üst sınır” olmalı mı? Varsa nasıl olmalı?",
      "İfade özgürlüğünü zedelemeden yanlış bilgiyi nasıl yönetiriz?",
      "Herhangi bir ülkenin mevcut lideriyle konuşsan ne söylerdin?",
      "Geçmiş siyasi başarısızlıklardan aldığımız en önemli ders ne?",
      "Bir hükümetin herkesin mutluluğunu sağlama sorumluluğu var mı?",
      "2026’da temel insan hakkı sayılması gereken ama her yerde olmayan şey ne?",
      "Okulu sıfırdan tasarlasan, ne zorunlu olurdu?",
      "Sağlık sistemi sence en adil nasıl olur?",
      "İnternet kamu hizmeti gibi görülmeli mi? Neden?",
      "Şirketlerin politikaya etkisi ne kadar olmalı?",
      "Şu an yasal olan ama yasak olması gerektiğini düşündüğün bir şey ne (ya da tersi)?",
      "Bir “küresel yasa” ekleyebilsen, ne olurdu?",
      "Güvenlik, özgürlük, eşitlik: hangisi daha önemli? Sırala.",
      "Ceza daha çok intikam mı caydırıcılık mı rehabilitasyon mu olmalı?",
      "Zamanla fikrini değiştirdiğin bir politika konusu ne?",
      "Şehirler daha çok arabalar için mi insanlar için mi tasarlanmalı?",
      "Demokrasi için en büyük tehdit sence ne?",
      "Tek bir soruna 1 milyar dolar harcasan, hangisini seçer ve nasıl harcardın?",
      "İnsanların çok konuşup yanlış anladığını düşündüğün bir sorun ne?",
      "Çalışmak/oy vermek gibi “katılmak istemeyen” insanlarla toplum nasıl başa çıkmalı?",
      "Milliyetçilik ne zaman sağlıklı olabilir?",
      "İdeal çalışma haftası sence nasıl olmalı?",
      "Sanat, eğitim veya devlette AI kullanımına sınır gelmeli mi?",
      "Toplumsal “ilerleme” senin için ne demek?"
    ],
    "about-us": [
      "İlk konuşmaya başladığımızda aklından geçen ilk şey neydi?",
      "Şu ana kadar bizimle ilgili en sevdiğin anı ne?",
      "Bir saatliğine yan yana ışınlanabilsek, ne yapardık?",
      "Beni düşündüren bir şarkı hangisi?",
      "Bu ilişki sayesinde kendin hakkında ne öğrendin?",
      "Tarihte bir “power couple” olsak hangisi olurduk?",
      "Benim yaptığım, söylemediğin ama çok sevdiğin küçük şey ne?",
      "Mesafe kapanınca ilk nereye gideceğiz?",
      "Bana sormak isteyip de sormadığın “random” soru ne?",
      "Bir film olsak adı ne olurdu?",
      "İlişkimizin en “biz” olan yanı ne?",
      "Beni tanımayanlara beni nasıl anlatıyorsun?",
      "“Gelecekte biz” için bir hayalin ne?",
      "Birlikte her yerde ev yapabilsek, nerede olurdu?",
      "Benim gizlice çok tatlı bulduğun bir alışkanlığım ne?",
      "Uzak mesafe hakkındaki bakışın nasıl değişti?",
      "Şu an sadece üç şeyle bana bir paket göndersen ne koyardın?",
      "Birbirimize verdiğimiz en iyi tavsiye neydi?",
      "Benimle yaşamak istediğin ama henüz konuşmadığımız bir macera ne?",
      "Şu an söyleyip de söylemediğin bir şeyi söylemek istesen, ne olurdu?",
      "Benimle ilgili kafanda tekrar tekrar oynattığın küçük bir an var mı?",
      "Sence çift olarak en iyi yaptığımız şey ne?",
      "Birlikte daha iyi olmak istediğin şey ne (tatlı bir şekilde)?",
      "Sadece bize ait bir gelenek yaratsak, ne olurdu?",
      "Birlikte gitmek istediğin bir yer (gerçek ya da hayali) neresi?",
      "Hayat boyu benden duymak istediğin bir soru ne?",
      "Beni en çok ne zaman sevildiğini hissediyorsun?",
      "Gelecek hakkında bilmemi istediğin bir korkun var mı?",
      "Bu yıl kendinle ilgili neyi kutlamak istiyorsun?",
      "Henüz yaşamadığımız ama yaşamak için heyecanlandığın bir anı ne?",
      "Benimle bir günü sonsuza dek dondurabilsen, o gün nasıl olurdu?",
      "En komik “biz” yanlış anlaşılmamız hangisiydi?",
      "Stresliyken seni nasıl daha iyi destekleyebilirim?",
      "Sen de beni nasıl daha iyi desteklemek istersin?",
      "Bizim hakkımızda bir kitap yazsak bölüm başlıkları ne olurdu?",
      "Birlikte öğrenmek istediğin bir şey ne (hobi, beceri, dil…)?",
      "Gelecekte kolayca çözeceğimizi düşündüğün bir “biz” problemi ne?",
      "Günlük hayatımızın hissi nasıl olsun istersin (sadece büyük geziler değil)?",
      "Ne olursa olsun tutmak istediğin bir söz ne?"
    ],
    random: [
      "Herhangi bir sebze olabilsen hangisi olurdun ve neden?",
      "Aklına gelen en gereksiz süper güç ne?",
      "Hayvanlar konuşabilse hangi tür en kaba olurdu?",
      "Yediğin en garip ama sevdiğin şey neydi?",
      "Bir mutfak aleti olsaydın hangisi olurdun?",
      "Hotdog sandviç midir? Savun.",
      "İzlediğin en iyi “kötü” film hangisi?",
      "Bir hayalet tarafından “takip” edilmek zorunda olsan ve seçebilsen, kimi seçerdin?",
      "Yaşadığın en “uncanny valley” an neydi?",
      "Bir mısır gevreği markası olsan kutu nasıl olurdu ve içinden ne çıkardı?",
      "Sence en “yüksek bakım” isteyen meyve hangisi?",
      "Bir hayvanın adını değiştirebilsen, ne koyardın?",
      "Hayatın buna bağlı olsa karaoke’de hangi şarkıyı seçerdin?",
      "Bir yıl bir oyun dünyasında yaşamak zorunda olsan hangisi olurdu?",
      "Katıldığın en utandırıcı trend neydi?",
      "Efsanevi bir yaratığı evcil hayvan olarak seçebilsen hangisi?",
      "Bulaşık makinesi dizmenin “doğru” yolu sence ne?",
      "Hayatının anlatıcısı olsa, kimin sesi olsun isterdin?",
      "Bildiğin en gereksiz bilgi (trivia) ne?",
      "Bir dondurma aroması olsan hangi garip topping’leri koyardın?",
      "Bir yıl tek bir kostüm giyecek olsan hangisi?",
      "Sırf insanları şaşırtmak için hangi komplo teorisini uydururdun?",
      "İnsan vücuduna gereksiz bir düğme ekleyebilsen ne yapardı?",
      "Hayal edebileceğin en kötü lunapark oyuncağı ne olurdu?",
      "Gülüşünün altyazısı olsa genelde ne yazardı?",
      "Bir gün sadece film replikleriyle konuşsan hangi filmi seçerdin?",
      "İlişkimiz bir oyun olsaydı en komik kurallar ne olurdu?",
      "Hangi hayvanı at boyutuna büyütmek isterdin ve neden?",
      "Gizlice abartıldığını düşündüğün ama söylemeye çekindiğin yemek ne?",
      "Birlikte kafe açsak adı ne olurdu ve imza içecek hangisi olurdu?",
      "Başkalarının sevmeyebileceği ama senin sevdiğin bir koku ne?",
      "Ellerini iki nesneyle değiştirmek zorunda olsan hangi nesneler olurdu?",
      "Hangi kurgusal karakter en kaotik ev arkadaşı olurdu?",
      "Bir sesi dünyadan silebilsen hangisini silerdin?",
      "En çılgın “hangisini tercih ederdin” sorunun ne?",
      "İkimiz iki hayvan olsak hangi hayvanlar olurduk?",
      "Ciddi bir yüzle yapılabilecek en garip iltifat ne?",
      "Beynin yükleme ekranı olsa hangi ipucunu gösterirdi?",
      "Teknik olarak doğru olan en absürt CV cümlen ne olurdu?",
      "Birlikte anında ustalaşacağımız gereksiz bir beceri seçsek ne olurdu?"
    ]
  }
};

function getBirthdayQuestions(language: AppLanguage, sectionId: BirthdaySectionId) {
  return BIRTHDAY_QUESTIONS_BY_LANGUAGE[language]?.[sectionId] ?? BIRTHDAY_QUESTIONS_BY_LANGUAGE.en[sectionId];
}

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
    | "audioInfoButton"
    | "audioInfoMessage"
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
    | "birthdayButton"
    | "birthdayKicker"
    | "birthdayQuestionsTitle"
    | "birthdayQuestionsDescription"
    | "birthdayRandomButton"
    | "birthdayTip"
    | "birthdaySpotlightLabel"
    | "birthdayPopupMessage"
    | "birthdayPopupOpenQuestions"
    | "birthdayConfettiLabel"
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
    audioInfoButton: "Info",
    audioInfoMessage:
      "Hey, I did my best. Sorry if they came out bad. They should all be the same in each language (unless my pronunciation is horrible, haha). I hope you enjoy!",
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
    readyConfirm: "Are you sure you're ready?",
    page: "PAGE",
    oneLastThingCaps: "ONE LAST THING...",
    languageLabel: "App Language",
    close: "Close",
    birthdayButton: "Happy Birthday",
    birthdayKicker: "HAPPY BIRTHDAY",
    birthdayQuestionsTitle: "Luna’s Question Bank",
    birthdayQuestionsDescription:
      "A little birthday corner for the girl who always has the best (and silliest) questions. Expand a section and pick one.",
    birthdayRandomButton: "Give me a random one",
    birthdayTip: "Tip: press-and-hold any question to copy it like normal.",
    birthdaySpotlightLabel: "SPOTLIGHT",
    birthdayPopupMessage:
      "I hope today wonderful and full of love and fun with this you now have all the questions you need. Have a great birthday! - Aiden",
    birthdayPopupOpenQuestions: "Birthday Surprise",
    birthdayConfettiLabel: "Celebrate with confetti"
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
    audioInfoButton: "Info",
    audioInfoMessage:
      "Hola, hice lo mejor que pude. Perdona si no salieron perfectos. Todos deberian decir lo mismo en cada idioma (a menos que mi pronunciacion sea horrible, jaja). Espero que te guste!",
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
    close: "Cerrar",
    birthdayButton: "Feliz Cumpleaños",
    birthdayKicker: "FELIZ CUMPLEAÑOS",
    birthdayQuestionsTitle: "Banco de Preguntas de Luna",
    birthdayQuestionsDescription:
      "Un rinconcito de cumpleaños para la chica que siempre tiene las mejores (y más tontas) preguntas. Abre una sección y elige una.",
    birthdayRandomButton: "Dame una al azar",
    birthdayTip: "Tip: mantén pulsado cualquier pregunta para copiarla como siempre.",
    birthdaySpotlightLabel: "DESTACADA",
    birthdayPopupMessage:
      "Espero que hoy sea un día maravilloso, lleno de amor y diversión. Con esto, ahora tienes todas las preguntas que necesitas. ¡Que tengas un gran cumpleaños! - Aiden",
    birthdayPopupOpenQuestions: "Sorpresa de cumpleaños",
    birthdayConfettiLabel: "Celebrar con confeti"
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
    audioInfoButton: "说明",
    audioInfoMessage:
      "嘿，我已经尽力了。如果听起来不太好请原谅我。每种语言里内容都应该是一样的（除非我的发音太糟了，哈哈）。希望你会喜欢！",
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
    close: "关闭",
    birthdayButton: "生日快乐",
    birthdayKicker: "生日快乐",
    birthdayQuestionsTitle: "Luna 的问题宝库",
    birthdayQuestionsDescription:
      "给那个总是有最好（也最可爱奇怪）问题的女孩的一角生日小天地。展开一个分组，选一个问题吧。",
    birthdayRandomButton: "来一个随机问题",
    birthdayTip: "提示：长按问题即可像平常一样复制。",
    birthdaySpotlightLabel: "今日问题",
    birthdayPopupMessage:
      "希望今天是美好、充满爱和快乐的一天。有了这个，你现在拥有所有你需要的问题。生日快乐！- Aiden",
    birthdayPopupOpenQuestions: "生日惊喜",
    birthdayConfettiLabel: "撒点彩带"
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
    audioInfoButton: "Info",
    audioInfoMessage:
      "Hey, ich habe mein Bestes gegeben. Sorry, falls sie nicht perfekt geworden sind. Sie sollten in jeder Sprache alle dasselbe sagen (ausser meine Aussprache ist schrecklich, haha). Ich hoffe, es gefaellt dir!",
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
    close: "Schliessen",
    birthdayButton: "Alles Gute zum Geburtstag",
    birthdayKicker: "ALLES GUTE ZUM GEBURTSTAG",
    birthdayQuestionsTitle: "Lunas Fragen-Bank",
    birthdayQuestionsDescription:
      "Eine kleine Geburtstagsecke für das Mädchen mit den besten (und albernsten) Fragen. Öffne einen Abschnitt und such dir eine aus.",
    birthdayRandomButton: "Gib mir eine zufällige Frage",
    birthdayTip: "Tipp: zum Kopieren einfach lange auf eine Frage drücken.",
    birthdaySpotlightLabel: "SPOTLIGHT",
    birthdayPopupMessage:
      "Ich hoffe, heute ist ein wundervoller Tag voller Liebe und Spaß. Damit hast du jetzt alle Fragen, die du brauchst. Alles Gute zum Geburtstag! - Aiden",
    birthdayPopupOpenQuestions: "Geburtstagsüberraschung",
    birthdayConfettiLabel: "Mit Konfetti feiern"
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
    audioInfoButton: "Bilgi",
    audioInfoMessage:
      "Hey, elimden gelenin en iyisini yaptim. Kotuyse ozur dilerim. Her dilde hepsi ayni olmali (tabii telaffuzum cok kotu degilse, haha). Umarim hosuna gider!",
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
    close: "Kapat",
    birthdayButton: "Iyi ki dogdun",
    birthdayKicker: "IYI KI DOGDUN",
    birthdayQuestionsTitle: "Luna'nin Soru Bankasi",
    birthdayQuestionsDescription:
      "Hep en iyi (ve en komik) sorulari soran kiz icin kucuk bir dogum gunu kosesi. Bir bolumu ac ve bir soru sec.",
    birthdayRandomButton: "Rastgele bir soru ver",
    birthdayTip: "Ipucu: kopyalamak icin soruya uzun bas.",
    birthdaySpotlightLabel: "SPOTLIGHT",
    birthdayPopupMessage:
      "Umarim bugun harika, sevgi ve eglence dolu bir gun olur. Bununla artik ihtiyacin olan tum sorular sende. Iyi ki dogdun! - Aiden",
    birthdayPopupOpenQuestions: "Dogum gunu surprizi",
    birthdayConfettiLabel: "Konfetiyle kutla"
  }
};

const VIDEO_SRC_RE = /\.(mp4|webm|mov)(?:$|[?#])/i;
const memoryMediaClassName = "block max-h-full max-w-full object-contain rounded-[1.75rem]";
const fairyTaleFont = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "600", "700"] });
const STORYBOOK_PAGES = [
  {
    title: "Once upon a time...",
    text: "In a far distant land known as Spain, there lived a girl who was a little bit autistic, and very happy with colors and fabric, she did some time in Taiwan but she always came back to Spain, and she was very happy with her work and lifestyle."
  },
  {
    text: "Then, she met a boy who was also a little bit autistic, and he was very beep beep boop boop and also a little autist, he was a little bit shy but she was interested in his shitty work ethic and math skills. They lived a close few thousdand kilometers away but she was still curious about this little autistic boy, so like the cougar she is, she took a chance."
  },
  {
    text: "But then the little autistic boy went back to the beautiful land, and she was very sad, not knowing if she would see him again... But then he told her that he was going on an adventure and would like to see her!"
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
    text: "They explored the land of Poles together and had a great time and made some wonderful memories together, they decided to go to the wannabe American state of Georgia!"
  },
  {
    text: "The wannabe state of Georgia was so great, they decided to go to the land of the arms (Armenia) and see if there was anything there for them..."
  },
  {
    text: "They had a run-in with the mob and got scared (mainly the autist boy), so the autistic boy decided to spend some money and they lived like royals for a few days but then the autistic girl invited the autistic boy to her place in the land of meat!"
  },
  {
    text: "They lived together in the land of meat for a few weeks and had a mishap here and there but they got thorugh it together and they were very happy together, it was wonderful, but then the Autistic boy said he needed to go and that left her very sad..."
  },
  {
    text: "But just because he is gone, doesnt mean their story is over, so he has a question for you..."
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
    { city: "Estambul", country: "Turquia", travelMode: "en bus", quote: "Extrano a Xiaomao, no veo la hora de hacerlo... digo, de volver a verlo!" },
    { city: "Ankara", country: "Turquia", travelMode: "en bus", quote: "Volvimos a Ankara con el corazon lleno y otro capitulo listo para abrirse." },
    { city: "Varsovia", country: "Polonia", travelMode: "en avion", quote: "Tenemos que volver por los museos!" },
    { city: "Kutaisi", country: "Georgia", travelMode: "en avion", quote: "Espero que Georgie este bien!" },
    { city: "Tiflis", country: "Georgia", travelMode: "en bus", quote: "La vista estaba buenisima para Xiaomao!" },
    { city: "Erevan", country: "Armenia", travelMode: "en bus", quote: "La banera estuvo buenisima para Xiaomao!" },
    { city: "Estambul", country: "Turquia", travelMode: "en avion", quote: "Bueno, Burger King y Popeyes estuvieron buenos...", layoverNote: "Ups, perdiste tu vuelo." },
    { city: "Ankara", country: "Turquia", travelMode: "en avion", quote: "Como sabes que soy dominicano, papi?" }
  ],
  zh: [
    { city: "马德里", country: "西班牙（起点）", travelMode: "开始", quote: "每个故事都需要一个开始，而我们的故事始于温暖的西班牙阳光下。" },
    { city: "安卡拉", country: "土耳其", travelMode: "飞机", quote: "不知道我们的好朋友怎么样了，我们该去看看他..." },
    { city: "伊斯坦布尔", country: "土耳其", travelMode: "大巴", quote: "我想念小猫，等不及去做...我是说，再见到他！" },
    { city: "安卡拉", country: "土耳其", travelMode: "大巴", quote: "我们带着满满的心意回到安卡拉，又一个章节准备展开。" },
    { city: "华沙", country: "波兰", travelMode: "飞机", quote: "我们一定要为了博物馆再回来！" },
    { city: "库塔伊西", country: "格鲁吉亚", travelMode: "飞机", quote: "希望Georgie一切都好！" },
    { city: "第比利斯", country: "格鲁吉亚", travelMode: "大巴", quote: "这风景对小猫来说太棒了！" },
    { city: "埃里温", country: "亚美尼亚", travelMode: "大巴", quote: "浴缸对小猫来说太舒服了！" },
    { city: "伊斯坦布尔", country: "土耳其", travelMode: "飞机", quote: "嗯，汉堡王和Popeyes确实不错...", layoverNote: "糟糕，你错过航班了。" },
    { city: "安卡拉", country: "土耳其", travelMode: "飞机", quote: "你怎么知道我是多米尼加帅哥？" }
  ],
  de: [
    { city: "Madrid", country: "Spanien (Start)", travelMode: "Beginn", quote: "Jede Geschichte braucht einen Anfang, und unsere begann unter der warmen spanischen Sonne." },
    { city: "Ankara", country: "Tuerkei", travelMode: "mit Flug", quote: "Ich frage mich, wie es unserem Bestie geht, wir sollten mal nachfragen..." },
    { city: "Istanbul", country: "Tuerkei", travelMode: "mit Bus", quote: "Ich vermisse Xiaomao, ich kann es kaum erwarten, es zu machen... ich meine, ihn wiederzusehen!" },
    { city: "Ankara", country: "Tuerkei", travelMode: "mit Bus", quote: "Wir rollten mit vollen Herzen nach Ankara zurueck, bereit fuer das naechste Kapitel." },
    { city: "Warschau", country: "Polen", travelMode: "mit Flug", quote: "Wir muessen fuer die Museen nochmal zurueck!" },
    { city: "Kutaisi", country: "Georgien", travelMode: "mit Flug", quote: "Ich hoffe, Georgie geht es gut!" },
    { city: "Tiflis", country: "Georgien", travelMode: "mit Bus", quote: "Die Aussicht war so gut fuer Xiaomao!" },
    { city: "Eriwan", country: "Armenien", travelMode: "mit Bus", quote: "Die Badewanne war so gut fuer Xiaomao!" },
    { city: "Istanbul", country: "Tuerkei", travelMode: "mit Flug", quote: "Naja, Burger King und Popeyes waren gut...", layoverNote: "Ups, du hast deinen Flug verpasst." },
    { city: "Ankara", country: "Tuerkei", travelMode: "mit Flug", quote: "Woher weisst du, dass ich dominikanisch bin, papi?" }
  ],
  tr: [
    { city: "Madrid", country: "Ispanya (Baslangic)", travelMode: "Baslangic", quote: "Her hikayenin bir baslangici vardir, bizimki de sicak Ispanya gunesi altinda basladi." },
    { city: "Ankara", country: "Turkiye", travelMode: "ucakla", quote: "Bestie nasil acaba, ona bir bakalim..." },
    { city: "Istanbul", country: "Turkiye", travelMode: "otobusle", quote: "Xiaomao'yu ozledim, onu yapmayi... yani tekrar gormeyi bekleyemiyorum!" },
    { city: "Ankara", country: "Turkiye", travelMode: "otobusle", quote: "Kalbimiz dolu sekilde Ankara'ya donduk, bir bolum daha acilmaya hazirdi." },
    { city: "Varsova", country: "Polonya", travelMode: "ucakla", quote: "Muzeler icin kesin geri donmeliyiz!" },
    { city: "Kutaisi", country: "Gurcistan", travelMode: "ucakla", quote: "Umarim Georgie iyidir!" },
    { city: "Tiflis", country: "Gurcistan", travelMode: "otobusle", quote: "Manzara Xiaomao icin harikaydi!" },
    { city: "Erivan", country: "Ermenistan", travelMode: "otobusle", quote: "Kuvet Xiaomao icin cok iyiydi!" },
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
  const [showBirthdayHub, setShowBirthdayHub] = useState(false);
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
  const [birthdayConfettiBurstId, setBirthdayConfettiBurstId] = useState<number | null>(null);
  const [showQuestionOnly, setShowQuestionOnly] = useState(false);
  const [showAudioInfoPopup, setShowAudioInfoPopup] = useState(false);
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
  const [showAudioPlayerPopup, setShowAudioPlayerPopup] = useState(false);
  const [activeAudioTrackIndex, setActiveAudioTrackIndex] = useState<number | null>(null);
  const ankaraReturnAutoAdvanceDoneRef = useRef(false);
  const [birthdaySpotlight, setBirthdaySpotlight] = useState<{ sectionTitle: string; question: string } | null>(null);

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
    setShowBirthdayHub(false);
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
    setShowBirthdayHub(false);
    setShowQuestionOnly(false);
    setAwaitingJourneyBegin(false);
    setShowFinale(false);
    setShowQuestion(false);
    setShowMobileMemoryCard(false);
  };

  const goToBirthdayHub = () => {
    setShowIntro(false);
    setShowBirthdayHub(true);
    setShowAudioHub(false);
    setShowQuestionOnly(false);
    setShowStorybook(false);
    setAwaitingJourneyBegin(false);
    setShowFinale(false);
    setShowQuestion(false);
    setShowMobileMemoryCard(false);
    const pool = BIRTHDAY_QUESTION_SECTIONS.flatMap((section) =>
      getBirthdayQuestions(language, section.id).map((question) => ({ sectionTitle: BIRTHDAY_SECTION_TITLES_BY_LANGUAGE[language][section.id], question }))
    );
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setBirthdaySpotlight(pick ?? null);
  };

  useEffect(() => {
    if (birthdayConfettiBurstId === null) return;
    const timer = window.setTimeout(() => setBirthdayConfettiBurstId(null), 7800);
    return () => window.clearTimeout(timer);
  }, [birthdayConfettiBurstId]);

  const openBirthdayPopup = () => {
    setShowBirthdayPopup(true);
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
    setShowBirthdayHub(false);
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

  const openAudioPlayer = (index: number) => {
    setActiveAudioTrackIndex(index);
    setShowAudioPlayerPopup(true);
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
                <button
                  onClick={openBirthdayPopup}
                  className="rounded-full bg-[#7a1f2b] px-6 py-3 text-sm font-semibold text-[#fffaf3] shadow-md transition active:scale-95"
                >
                  {t.birthdayButton}
                </button>
              </div>
              <button
                onClick={() => setShowLanguagePopup(true)}
                className="mt-5 rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-6 py-3 text-sm font-semibold text-[#5b4637] shadow-sm transition active:scale-95"
              >
                {t.languageLabel}: {selectedLanguageLabel}
              </button>
            </motion.section>
          ) : showBirthdayHub ? (
            <motion.section
              key="birthday-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative mx-auto flex w-full max-w-3xl flex-col items-center rounded-3xl bg-[#f6efe6] p-5 pt-12 text-center shadow-soft sm:p-10 sm:pt-14"
            >
              <AnimatePresence>
                {birthdayConfettiBurstId !== null && (
                  <motion.div
                    key={`birthday-confetti-${birthdayConfettiBurstId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none fixed inset-0 z-[95] overflow-hidden"
                  >
                    {Array.from({ length: 240 }).map((_, i) => {
                      const isTopRain = i % 3 === 0;
                      const fromLeft = i % 2 === 0;
                      const x = isTopRain
                        ? Math.random() * 100
                        : fromLeft
                          ? Math.random() * 18 - 6
                          : 100 - (Math.random() * 18 - 6);
                      const delay = Math.random() * 1.6;
                      const duration = 4.8 + Math.random() * 3.6;
                      const size = 6 + Math.floor(Math.random() * 6);
                      const rotate = Math.floor(Math.random() * 360);
                      const drift = isTopRain ? (Math.random() * 2 - 1) * 56 : (Math.random() * 2 - 1) * (fromLeft ? 24 : -24);
                      const color = i % 2 === 0 ? "#7a1f2b" : "#9b5de5";
                      const shape = i % 3 === 0 ? "9999px" : "4px";
                      return (
                        <span
                          key={i}
                          className="confetti-piece"
                          style={
                            {
                              left: `${x}%`,
                              width: `${size}px`,
                              height: `${Math.max(8, size * 1.4)}px`,
                              backgroundColor: color,
                              borderRadius: shape,
                              animationDelay: `${delay}s`,
                              animationDuration: `${duration}s`,
                              ["--confetti-rotate" as any]: `${rotate}deg`,
                              ["--confetti-drift" as any]: `${drift}px`
                            } as React.CSSProperties
                          }
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={goBackToHome}
                className="absolute left-3 top-3 rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-4 py-1.5 text-[11px] font-semibold text-[#5b4637] shadow-sm transition active:scale-95 sm:left-6 sm:top-6 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                {t.back}
              </button>
              <button
                onClick={() => setBirthdayConfettiBurstId(Date.now())}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-[#cdb8a2] bg-[#fff8ef] text-base shadow-sm transition active:scale-95 sm:right-6 sm:top-6 sm:h-11 sm:w-11 sm:text-lg"
                aria-label={t.birthdayConfettiLabel}
                title="Confetti!"
              >
                🎉
              </button>
              <p className="mt-4 text-[11px] tracking-[0.22em] text-[#7b6656] sm:mt-2 sm:text-sm sm:tracking-[0.2em]">
                {t.birthdayKicker}
              </p>
              <h2 className="mt-1 font-serif text-[1.9rem] leading-tight text-[#5b4637] sm:mt-3 sm:text-5xl">
                {t.birthdayQuestionsTitle}
              </h2>
              <p className="mt-3 max-w-xl text-xs leading-relaxed text-[#6e5949] sm:mt-4 sm:max-w-2xl sm:text-sm">
                {t.birthdayQuestionsDescription}
              </p>

              <div className="mt-4 flex w-full max-w-xl flex-col items-stretch justify-center gap-2 sm:mt-5 sm:max-w-none sm:flex-row sm:items-center">
                <button
                  onClick={() => {
                    const pool = BIRTHDAY_QUESTION_SECTIONS.flatMap((section) =>
                      getBirthdayQuestions(language, section.id).map((question) => ({ sectionTitle: BIRTHDAY_SECTION_TITLES_BY_LANGUAGE[language][section.id], question }))
                    );
                    const pick = pool[Math.floor(Math.random() * pool.length)];
                    if (pick) setBirthdaySpotlight(pick);
                  }}
                  className="w-full rounded-full bg-[#9b5de5] px-5 py-3 text-xs font-semibold text-[#fffaf3] shadow-md transition active:scale-95 sm:w-auto sm:py-2"
                >
                  {t.birthdayRandomButton}
                </button>
              </div>

              {birthdaySpotlight && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 w-full max-w-2xl rounded-3xl border border-[#d8c3ad] bg-[#efe3d5] p-5 text-left"
                >
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#7b6656]">{t.birthdaySpotlightLabel}</p>
                  <p className="mt-2 text-xs font-semibold text-[#7b6656]">{birthdaySpotlight.sectionTitle}</p>
                  <p className="mt-2 font-serif text-2xl leading-snug text-[#5b4637]">{birthdaySpotlight.question}</p>
                </motion.div>
              )}

              <div className="mt-5 w-full max-w-3xl text-left sm:mt-6">
                <div className="grid gap-3">
                  {BIRTHDAY_QUESTION_SECTIONS.map((section) => (
                    <details
                      key={section.id}
                      open
                      className="rounded-3xl border border-[#d8c3ad] bg-[#f8efdf] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5),0_14px_26px_rgba(92,66,43,0.12)] sm:p-5"
                    >
                      <summary className="cursor-pointer text-sm font-semibold text-[#5b4637] sm:text-base">
                        {BIRTHDAY_SECTION_TITLES_BY_LANGUAGE[language][section.id]}
                      </summary>
                      <div className="mt-4 grid gap-2">
                        {getBirthdayQuestions(language, section.id).map((q, idx) => (
                          <p
                            key={`${section.id}-${idx}`}
                            className="select-text rounded-2xl border border-[#ead6c0] bg-[#fff8ef] px-4 py-3 font-serif text-[15px] leading-relaxed text-[#5b4637] sm:text-[16px]"
                          >
                            {q}
                          </p>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              <button
                onClick={goBackToHome}
                className="mt-7 rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-8 py-3 text-sm font-semibold text-[#5b4637] transition active:scale-95"
              >
                {t.backToHome}
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
              <button
                onClick={() => setShowAudioInfoPopup(true)}
                className="mt-4 rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-5 py-2 text-xs font-semibold tracking-wide text-[#5b4637] shadow-sm transition active:scale-95"
              >
                {t.audioInfoButton}
              </button>
              <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {AUDIO_TRACKS.map(({ label }, i) => (
                  <button
                    key={label}
                    onClick={() => openAudioPlayer(i)}
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
                        {isTraveling || isTravelPending ? t.traveling : t.next}
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

              <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {AUDIO_TRACKS.map(({ label }, i) => (
                  <button
                    key={label}
                    onClick={() => openAudioPlayer(i)}
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
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {!showIntro && !showFinale && !showAudioHub && !showBirthdayHub && !showQuestionOnly && !showStorybook && awaitingJourneyBegin && (
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
          {!showIntro && !showFinale && !showAudioHub && !showBirthdayHub && !showQuestionOnly && !showStorybook && !awaitingJourneyBegin && showMobileMemoryCard && (
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
                {isTraveling || isTravelPending ? t.traveling : t.next}
              </button>
              </motion.article>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showAudioPlayerPopup && activeAudioTrackIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-[#00000066] px-4"
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                className="w-full max-w-md rounded-3xl border border-[#d8c3ad] bg-[#f6efe6] p-6 text-center shadow-soft"
              >
                <p className="font-serif text-2xl text-[#5b4637]">{AUDIO_TRACKS[activeAudioTrackIndex].label}</p>
                <p className="mt-2 text-sm text-[#6e5949]">Use play/pause and drag the timeline to any moment.</p>
                <audio
                  key={AUDIO_TRACKS[activeAudioTrackIndex].src}
                  src={AUDIO_TRACKS[activeAudioTrackIndex].src}
                  controls
                  autoPlay
                  preload="metadata"
                  className="mt-5 w-full rounded-xl"
                />
                <button
                  onClick={() => setShowAudioPlayerPopup(false)}
                  className="mt-5 rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-6 py-2 text-sm font-semibold text-[#5b4637] transition active:scale-95"
                >
                  {t.close}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showAudioInfoPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[82] flex items-center justify-center bg-[#00000066] px-4"
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                className="w-full max-w-md rounded-3xl border border-[#d8c3ad] bg-[#f6efe6] p-6 text-center shadow-soft"
              >
                <p className="font-serif text-2xl text-[#5b4637]">{t.audioCornerTitle}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#6e5949]">{t.audioInfoMessage}</p>
                <button
                  onClick={() => setShowAudioInfoPopup(false)}
                  className="mt-5 rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-6 py-2 text-sm font-semibold text-[#5b4637] transition active:scale-95"
                >
                  {t.close}
                </button>
              </motion.div>
            </motion.div>
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
          {showBirthdayPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] flex items-center justify-center bg-[#00000066] px-4"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {Array.from({ length: 240 }).map((_, i) => {
                  const isTopRain = i % 3 === 0;
                  const fromLeft = i % 2 === 0;
                  const x = isTopRain
                    ? Math.random() * 100
                    : fromLeft
                      ? Math.random() * 18 - 6
                      : 100 - (Math.random() * 18 - 6);
                  const delay = Math.random() * 1.8;
                  const duration = 4.8 + Math.random() * 3.6;
                  const size = 6 + Math.floor(Math.random() * 6);
                  const rotate = Math.floor(Math.random() * 360);
                  const drift = isTopRain ? (Math.random() * 2 - 1) * 48 : (Math.random() * 2 - 1) * (fromLeft ? 22 : -22);
                  const colors = ["#7a1f2b", "#9b5de5"];
                  const color = colors[i % 2];
                  const shape = i % 3 === 0 ? "9999px" : "4px";
                  return (
                    <span
                      key={i}
                      className="confetti-piece"
                      style={
                        {
                          left: `${x}%`,
                          width: `${size}px`,
                          height: `${Math.max(8, size * 1.4)}px`,
                          backgroundColor: color,
                          borderRadius: shape,
                          animationDelay: `${delay}s`,
                          animationDuration: `${duration}s`,
                          ["--confetti-rotate" as any]: `${rotate}deg`,
                          ["--confetti-drift" as any]: `${drift}px`
                        } as React.CSSProperties
                      }
                    />
                  );
                })}
              </div>

              <motion.div
                initial={{ y: 12, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 8, opacity: 0, scale: 0.99 }}
                className="relative w-full max-w-md rounded-3xl border border-[#d8c3ad] bg-[#f6efe6] p-6 text-center shadow-soft"
              >
                <p className="text-xs font-semibold tracking-[0.22em] text-[#7b6656]">{t.birthdayKicker}</p>
                <p className="mt-2 font-serif text-3xl text-[#5b4637]">Luna</p>
                <p className="mt-3 text-sm leading-relaxed text-[#6e5949]">
                  {t.birthdayPopupMessage}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setShowBirthdayPopup(false);
                      goToBirthdayHub();
                    }}
                    className="rounded-full bg-[#7a1f2b] px-6 py-3 text-sm font-semibold text-[#fffaf3] shadow-md transition active:scale-95"
                  >
                    {t.birthdayPopupOpenQuestions}
                  </button>
                  <button
                    onClick={() => setShowBirthdayPopup(false)}
                    className="rounded-full border border-[#cdb8a2] bg-[#fff8ef] px-6 py-3 text-sm font-semibold text-[#5b4637] transition active:scale-95"
                  >
                    {t.close}
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
        .confetti-piece {
          position: absolute;
          top: -16px;
          opacity: 0.95;
          transform: translateX(0) rotate(var(--confetti-rotate));
          animation-name: confetti-fall;
          animation-timing-function: linear;
          animation-iteration-count: 1;
          will-change: transform, opacity;
          filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.14));
        }
        @keyframes confetti-fall {
          0% {
            transform: translateX(0) translateY(-20px) rotate(var(--confetti-rotate));
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateX(var(--confetti-drift)) translateY(110vh) rotate(calc(var(--confetti-rotate) + 560deg));
            opacity: 0.9;
          }
        }
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
