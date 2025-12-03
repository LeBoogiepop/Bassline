import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Language = "en" | "fr";
type Theme = "dark" | "light";

interface SettingsContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Sidebar & Nav
    nav_new: "New Transcription",
    nav_upload: "Upload Audio",
    nav_library: "Library",
    profile_view: "View Source",

    // Upload & Process
    drop_zone: "Drop your bass track here",
    btn_select: "Select File",
    processing_step_1: "Uploading...",
    processing_step_2: "Isolating Bass (Demucs)...",
    processing_step_3: "Transcribing to MIDI...",
    processing_done: "Analysis Complete!",
    status_processing: "Processing Audio...",
    status_ready: "Ready to Play",

    // Track Info
    track_title: "Track Info",
    notes_count: "notes",
    duration: "Duration",
    bpm: "Tempo",

    // Player Controls
    speed: "Speed",
    loop: "Loop",
    play: "Play",
    pause: "Pause",

    // 3D View
    controls_help: "Left Click to Rotate • Right Click to Pan",

    // Fun Facts
    fact_title: "Did you know?",

    // Player Empty State
    no_track_title: "No Track Loaded",
    no_track_subtitle: "Upload a file to start",

    // 3D Overlay
    overlay_upload_hint: "Upload a track to view tablature",

    // Sidebar Profile
    role_student: "Student Dev",
    role_portfolio: "Portfolio Mode",
    view_source: "View Source",

    // Tab Label
    tab_interactive: "Interactive Tab",

    // Help Modal
    help_btn: "Help & Guide",
    help_title: "How to master Bassline",
    help_intro:
      "Welcome to your new practice space. Here is how to turn any audio file into a bass lesson:",
    help_step1_title: "1. Drop the Beat",
    help_step1_desc:
      "Upload any MP3 or WAV. Our AI (Demucs) automatically isolates the bass from the mix. No stems needed.",
    help_step2_title: "2. Watch & Learn",
    help_step2_desc:
      "Top Screen: 3D Visualization shows you WHERE to place your fingers.\nBottom Screen: Interactive Tab shows you WHAT to play.",
    help_step3_title: "3. Slow Down to Speed Up",
    help_step3_desc:
      "Is the groove too fast? Use the Speed Control (down to x0.25) to nail every nuance before speeding back up.",

    // Help Modal - Difficulty Levels
    help_levels_title: "Smart Difficulty Mapping",
    help_levels_intro:
      "The AI adapts the fingering to your playstyle. Choose your mode:",
    help_levels_beginner:
      "🟢 **Beginner (Anchor Mode)**: Keeps your hand in the first 5 frets (Open Position). Perfect for learning the basics without jumping around the neck.",
    help_levels_intermediate:
      "🟡 **Intermediate (Efficiency)**: Finds the shortest path for your hand. It avoids large jumps and plays 'in the box' like a session musician.",
    help_levels_pro:
      "🔴 **Pro (Tone Hunter)**: Prioritizes sound quality over ease. It will choose thicker strings (higher up the neck) for a warmer, fatter tone, even if it's harder to play.",

    // Sidebar - Difficulty Selector
    difficulty_label: "Difficulty Level",
    diff_beginner: "Beginner (Frets 0-5)",
    diff_intermediate: "Intermediate (Economic)",
    diff_pro: "Pro (Tone & Context)",

    // Pipeline Explorer
    pipeline_title: "Audio Pipeline Explorer",
    pipeline_subtitle: "Visualizing the Audio to Tablature conversion process",
    pipeline_step1_title: "Engine Initialization (Frontend)",
    pipeline_step1_desc:
      "The browser prepares the ground. It synchronizes the visual clock (60 FPS) with the sound card clock (AudioContext) to ensure zero latency.",
    pipeline_step2_title: "Ingestion (Backend)",
    pipeline_step2_desc:
      "The audio file leaves the browser. The server places the task in a queue (Redis Queue) and allocates the necessary VRAM (GPU).",
    pipeline_step3_title: "Spectral Extraction (Demucs)",
    pipeline_step3_desc:
      "The AI (Demucs) analyzes the audio spectrum. It's an intelligent 'spectral subtraction': everything that doesn't match the mathematical model of a bass is erased.",
    pipeline_step4_title: "Transient Analysis (Basic Pitch)",
    pipeline_step4_desc:
      "A second AI scans for 'attacks' (transients). The continuous wave is discretized into digital events: Note, Duration, and Velocity.",
    pipeline_step5_title: "Trajectory Calculation (Algo)",
    pipeline_step5_desc:
      "A 'Pathfinding' problem. The algo calculates the hand movement cost for each combination and chooses the most ergonomic path.",
    pipeline_hint:
      "Click on a step on the left to see the technical visualization.",
    pipeline_btn_open: "View Architecture (Visual)",

    // Tech Guide
    tech_toggle_user: "User Guide",
    tech_toggle_dev: "Architecture / Stack",
    tech_intro:
      "No magic, just heavy code. Here is the full processing pipeline:",
    tech_step1_title: "1. React Three Fiber (Frontend)",
    tech_step1_desc:
      "State-driven 3D rendering loop running at 60fps. Audio synchronization relies on the Web Audio API clock (AudioContext) to prevent drift, bypassing standard JS event loop latency.",
    tech_step2_title: "2. Flask & PyTorch (Backend)",
    tech_step2_desc:
      "A Python REST API handling asynchronous job queues. It acts as the bridge between the client and the heavy inference engines, managing memory allocation for DSP tasks.",
    tech_step3_title: "3. Demucs Hybrid Model (DSP)",
    tech_step3_desc:
      "Source separation powered by Meta's Hybrid Transformer/U-Net architecture. It performs advanced spectral analysis (STFT) to disentangle bass frequencies from complex mixes.",
    tech_step4_title: "4. Basic Pitch CNN (Transcription)",
    tech_step4_desc:
      "A lightweight Convolutional Neural Network (CNN) optimized for multipitch detection. It converts raw audio transients into structured MIDI events (Note On/Off, Velocity).",
    tech_step5_title: "5. Graph Theory Mapping (Algo)",
    tech_step5_desc:
      "Custom pathfinding algorithm. The fretboard is treated as a weighted graph. We use a cost function (distance + ergonomics) to find the optimal path for the hand position.",
  },
  fr: {
    // Sidebar & Nav
    nav_new: "Nouvelle Transcription",
    nav_upload: "Importer Audio",
    nav_library: "Bibliothèque",
    profile_view: "Voir le Code",

    // Upload & Process
    drop_zone: "Glissez votre ligne de basse ici",
    btn_select: "Choisir un fichier",
    processing_step_1: "Envoi en cours...",
    processing_step_2: "Isolation Basse (Demucs)...",
    processing_step_3: "Transcription MIDI...",
    processing_done: "Analyse Terminée !",
    status_processing: "Traitement audio...",
    status_ready: "Prêt à jouer",

    // Track Info
    track_title: "Infos Piste",
    notes_count: "notes",
    duration: "Durée",
    bpm: "Tempo",

    // Player Controls
    speed: "Vitesse",
    loop: "Boucle",
    play: "Lecture",
    pause: "Pause",

    // 3D View
    controls_help: "Clic Gauche : Rotation • Clic Droit : Déplacer",

    // Fun Facts
    fact_title: "Le saviez-vous ?",

    // Player Empty State
    no_track_title: "Aucune piste chargée",
    no_track_subtitle: "Importez un fichier pour commencer",

    // 3D Overlay
    overlay_upload_hint: "Importez une piste pour voir la tablature",

    // Sidebar Profile
    role_student: "Développeur Étudiant",
    role_portfolio: "Mode Portfolio",
    view_source: "Voir le code",

    // Tab Label
    tab_interactive: "Tablature Interactive",

    // Help Modal
    help_btn: "Aide & Guide",
    help_title: "Comment maîtriser Bassline",
    help_intro:
      "Bienvenue dans ton nouveau studio. Voici comment transformer n'importe quel MP3 en leçon de basse :",
    help_step1_title: "1. Importe ton son",
    help_step1_desc:
      "Glisse un fichier MP3 ou WAV. L'IA se charge du sale boulot : elle isole la basse et écrit la partition pour toi.",
    help_step2_title: "2. Analyse le jeu",
    help_step2_desc:
      "En haut : La 3D te montre OÙ poser tes doigts sur le manche.\nEn bas : La Tablature t'indique QUOI jouer en temps réel.",
    help_step3_title: "3. Bosse ton Groove",
    help_step3_desc:
      "C'est trop rapide ? Utilise le ralentisseur (jusqu'à x0.25) pour décortiquer le plan, puis remonte le tempo petit à petit.",

    // Help Modal - Difficulty Levels
    help_levels_title: "Mapping Intelligent",
    help_levels_intro:
      "L'IA adapte le doigté à ton style de jeu. Choisis ton mode :",
    help_levels_beginner:
      "🟢 **Débutant (Position Ouverte)** : Garde la main près du sillet (cases 0 à 5). Idéal pour apprendre les bases sans faire de grands écarts.",
    help_levels_intermediate:
      "🟡 **Intermédiaire (Efficacité)** : Calcule le chemin le plus court pour ta main. Évite les sauts inutiles et joue 'dans la boîte' comme un pro.",
    help_levels_pro:
      "🔴 **Pro (Chasseur de Son)** : Privilégie la qualité du son (timbre) sur la facilité. L'IA choisira des cordes plus épaisses (plus haut sur le manche) pour un son plus chaud et rond.",

    // Sidebar - Difficulty Selector
    difficulty_label: "Niveau de Difficulté",
    diff_beginner: "Débutant (Cases 0-5)",
    diff_intermediate: "Intermédiaire (Économique)",
    diff_pro: "Pro (Son & Contexte)",

    help_resources_title: "Besoin de sons ?",
    help_resources_desc: "",
    help_link_text: "Trouver des sons sur TrackMusik.fr",
    close: "C'est compris, let's groove",

    // Pipeline Explorer
    pipeline_title: "Explorateur de Pipeline Audio",
    pipeline_subtitle:
      "Visualisation du processus de conversion Audio vers Tablature",
    pipeline_step1_title: "Initialisation Moteur (Frontend)",
    pipeline_step1_desc:
      "Le navigateur prépare le terrain. Il synchronise l'horloge visuelle (60 FPS) avec l'horloge de la carte son (AudioContext) pour garantir une latence zéro.",
    pipeline_step2_title: "Ingestion (Backend)",
    pipeline_step2_desc:
      "Le fichier audio quitte le navigateur. Le serveur place la tâche dans une file d'attente (Redis Queue) et alloue la mémoire VRAM (GPU) nécessaire.",
    pipeline_step3_title: "Extraction Spectrale (Demucs)",
    pipeline_step3_desc:
      "L'IA (Demucs) analyse le spectre audio. C'est une 'soustraction spectrale' intelligente : tout ce qui ne correspond pas au modèle mathématique d'une basse est gommé.",
    pipeline_step4_title: "Analyse Transitoire (Basic Pitch)",
    pipeline_step4_desc:
      "Une seconde IA scrute les 'attaques' (transitoires). L'onde continue est discrétisée en événements numériques : Note, Durée et Vélocité.",
    pipeline_step5_title: "Calcul de Trajectoire (Algo)",
    pipeline_step5_desc:
      "Problème de 'Pathfinding'. L'algo calcule le coût de déplacement de la main pour chaque combinaison et choisit le chemin le plus ergonomique.",
    pipeline_hint:
      "Cliquez sur une étape à gauche pour voir la visualisation technique.",
    pipeline_btn_open: "Voir l'Architecture (Visual)",

    // Tech Guide
    tech_toggle_user: "Guide Musicien",
    tech_toggle_dev: "Architecture / Stack",
    tech_intro:
      "Pas de magie, juste du code. Voici le pipeline de traitement complet :",
    tech_step1_title: "1. React Three Fiber (Frontend)",
    tech_step1_desc:
      "Boucle de rendu 3D pilotée par l'état (60fps). La synchro audio utilise l'horloge précise de l'AudioContext (Web Audio API) pour éviter toute latence liée à l'event loop JS.",
    tech_step2_title: "2. Flask & PyTorch (Backend)",
    tech_step2_desc:
      "API REST Python gérant des files d'attente asynchrones. Elle fait le pont entre le client et les moteurs d'inférence, gérant l'allocation mémoire pour les calculs DSP.",
    tech_step3_title: "3. Demucs Hybrid Model (DSP)",
    tech_step3_desc:
      "Séparation de source via l'architecture Hybride Transformer/U-Net de Meta. Utilise l'analyse spectrale (STFT) pour isoler les basses fréquences dans un mix dense.",
    tech_step4_title: "4. Basic Pitch CNN (Transcription)",
    tech_step4_desc:
      "Réseau de Neurones Convolutif (CNN) léger optimisé pour la détection de pitch. Convertit les transitoires audio bruts en événements MIDI structurés.",
    tech_step5_title: "5. Mapping par Théorie des Graphes",
    tech_step5_desc:
      "Algorithme de pathfinding maison. Le manche est modélisé comme un graphe pondéré. Une fonction de coût (distance + ergonomie) détermine le chemin optimal pour la main.",
  },
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Default to French and Dark mode as requested
  const [language, setLanguage] = useState<Language>("fr");
  const [theme, setTheme] = useState<Theme>("dark");

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("bassline_lang") as Language;
    const savedTheme = localStorage.getItem("bassline_theme") as Theme;

    if (savedLang) setLanguage(savedLang);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Persist settings and apply theme
  useEffect(() => {
    localStorage.setItem("bassline_lang", language);
    localStorage.setItem("bassline_theme", theme);

    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [language, theme]);

  const t = (key: string): string => {
    const value = translations[language][key];
    return value !== undefined ? value : key;
  };

  return (
    <SettingsContext.Provider
      value={{ language, theme, setLanguage, setTheme, t }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
