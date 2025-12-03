import React, { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const FACT_DATA = [
  {
    en: "Leo Fender, inventor of the Precision Bass, did not play guitar or bass himself.",
    fr: "Leo Fender, inventeur de la Precision Bass, ne savait jouer ni de la guitare ni de la basse.",
  },
  {
    en: "The 'Bass of Doom' was Jaco Pastorius's legendary fretless 1962 Jazz Bass.",
    fr: "La 'Bass of Doom' était la légendaire Jazz Bass fretless 1962 de Jaco Pastorius.",
  },
  {
    en: "The first mass-produced electric bass was the Fender Precision Bass (1951).",
    fr: "La première basse électrique produite en série fut la Fender Precision Bass (1951).",
  },
  {
    en: "James Jamerson played 95% of Motown hits using only his index finger ('The Hook').",
    fr: "James Jamerson a joué 95% des tubes de Motown avec un seul doigt (l'index).",
  },
  {
    en: "Larry Graham is credited with inventing the 'Slap' technique to emulate a drum set.",
    fr: "On attribue à Larry Graham l'invention du 'Slap' pour imiter une batterie sans batteur.",
  },
  {
    en: "A standard 4-string bass is tuned E-A-D-G, one octave lower than a guitar.",
    fr: "Une basse 4 cordes est accordée Mi-La-Ré-Sol, une octave plus bas qu'une guitare.",
  },
  {
    en: "The Rickenbacker 4001 is the iconic sound behind Lemmy (Motörhead) and Chris Squire (Yes).",
    fr: "La Rickenbacker 4001 est le son iconique de Lemmy (Motörhead) et Chris Squire (Yes).",
  },
  {
    en: "Active bass pickups require a 9V battery to boost the signal and EQ.",
    fr: "Les micros actifs nécessitent une pile 9V pour booster le signal et l'égalisation.",
  },
  {
    en: "Cliff Burton's 'Anesthesia (Pulling Teeth)' is a bass solo heavily using a Wah-Wah pedal.",
    fr: "'Anesthesia' de Cliff Burton est un solo de basse utilisant massivement une pédale Wah-Wah.",
  },
  {
    en: "The Hofner 500/1 'Violin Bass' became famous thanks to Paul McCartney.",
    fr: "La Hofner 500/1 'Violin Bass' est devenue célèbre grâce à Paul McCartney.",
  },
  {
    en: "A 5-string bass usually adds a low 'B' string for deeper sub-frequencies.",
    fr: "Une basse 5 cordes ajoute généralement une corde de Si (B) grave pour plus de sub.",
  },
  {
    en: "Flatwound strings produce a mellow, vintage tone (Motown/Jazz).",
    fr: "Les cordes 'Flatwound' (filé plat) donnent un son doux et vintage (Motown/Jazz).",
  },
  {
    en: "Roundwound strings are brighter and sustain longer, preferred for Rock and Slap.",
    fr: "Les cordes 'Roundwound' sont plus brillantes avec plus de sustain, idéales pour le Rock.",
  },
  {
    en: "Carol Kaye, a member of 'The Wrecking Crew', played on over 10,000 recordings.",
    fr: "Carol Kaye, membre du 'Wrecking Crew', a joué sur plus de 10 000 enregistrements studio.",
  },
  {
    en: "Bootsy Collins plays a custom star-shaped 'Space Bass' with 5 pickups.",
    fr: "Bootsy Collins joue sur une 'Space Bass' en forme d'étoile avec 5 micros.",
  },
  {
    en: "Flea (RHCP) used a Modulus bass made of graphite for stability and punch.",
    fr: "Flea (RHCP) utilisait une basse Modulus en graphite pour la stabilité et le punch.",
  },
  {
    en: "The Music Man StingRay was the first bass to feature active electronics (1976).",
    fr: "La Music Man StingRay fut la première basse équipée d'électronique active (1976).",
  },
  {
    en: "Tony Levin created 'Funk Fingers' (drumsticks attached to fingers) for a percussive sound.",
    fr: "Tony Levin a inventé les 'Funk Fingers' (baguettes fixées aux doigts) pour un son percussif.",
  },
  {
    en: "Les Claypool (Primus) is known for tapping and strumming on a 6-string fretless bass.",
    fr: "Les Claypool (Primus) est connu pour son tapping sur une basse 6 cordes fretless.",
  },
  {
    en: "Standard bass scale length is 34 inches (Long Scale).",
    fr: "Le diapason standard d'une basse est de 34 pouces (Long Scale).",
  },
  {
    en: "Mark King (Level 42) famously insured his thumb for several million dollars.",
    fr: "Mark King (Level 42) a assuré son pouce pour plusieurs millions de dollars.",
  },
  {
    en: "The Gibson Thunderbird was designed by a car designer (Ray Dietrich).",
    fr: "La Gibson Thunderbird a été dessinée par un designer automobile (Ray Dietrich).",
  },
  {
    en: "Jaco Pastorius removed the frets from his Jazz Bass himself and filled the slots with wood putty.",
    fr: "Jaco Pastorius a défretté sa basse lui-même et rempli les trous avec de la pâte à bois.",
  },
  {
    en: "Victor Wooten treats the thumb as a plectrum (up and down strokes).",
    fr: "Victor Wooten utilise son pouce comme un médiator (allers-retours).",
  },
];

export const LoadingFacts: React.FC = () => {
  const { language, t } = useSettings();
  const [shuffledFacts, setShuffledFacts] = useState<typeof FACT_DATA>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Initial Shuffle
  useEffect(() => {
    const shuffled = [...FACT_DATA].sort(() => Math.random() - 0.5);
    setShuffledFacts(shuffled);
  }, []);

  // Timer Loop
  useEffect(() => {
    if (shuffledFacts.length === 0) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % shuffledFacts.length);
        setFade(true);
      }, 500); // Wait for fade out
    }, 6000);

    return () => clearInterval(interval);
  }, [shuffledFacts]);

  if (shuffledFacts.length === 0) return null;

  const currentFact = shuffledFacts[currentIndex];

  return (
    <div className="flex flex-col items-center text-center max-w-[220px]">
      <div className="flex items-center gap-1.5 text-brand-400 mb-2">
        <Lightbulb size={14} />
        <span className="text-[10px] uppercase tracking-wider font-bold">
          {t("fact_title")}
        </span>
      </div>
      <p
        className={`text-xs text-gray-400 transition-opacity duration-500 min-h-[3rem] ${fade ? "opacity-100" : "opacity-0"}`}
      >
        "{language === "fr" ? currentFact.fr : currentFact.en}"
      </p>
    </div>
  );
};
