// Vibrant Real Townspeople (Mela Visitors & Shopkeepers)
// They walk, chat, gather around fireworks, cheer, and give Diwali blessings!

export const NPCS = [
  {
    id: 'npc_sharma',
    name: 'Sharma Ji',
    role: 'Elder & Firework Enthusiast',
    outfit: { top: '#f59e0b', bottom: '#fef08a', turban: '#dc2626' },
    x: 740,
    y: 620,
    targetX: 740,
    targetY: 620,
    dialogues: [
      'Namaste beta! Shubh Deepawali! Remember to keep safe distance while lighting the Sutli bomb!',
      'In our days, we used to burst 5000-wali ladi right on the street! Here on Dhamaka ground it is much safer.',
      'Have you visited the Lakshmi temple yet? Ringing the bell brings good fortune!'
    ],
    cheers: [
      'Wah beta wah! What a magnificent burst!',
      'Zabardast dhamaka! Shubh Deepawali!',
      'Careful everyone, step back for safety!'
    ],
    giftGiven: false,
    giftCoins: 50
  },
  {
    id: 'npc_priya',
    name: 'Priya Verma',
    role: 'Diwali Photographer',
    outfit: { top: '#ec4899', bottom: '#9333ea', dupatta: '#f43f5e' },
    x: 520,
    y: 780,
    targetX: 520,
    targetY: 780,
    dialogues: [
      'Happy Diwali! I am taking festival photos of the diyas and rangoli. You look so festive today!',
      'Light a sparkler or anar so I can capture the golden light trails on camera!',
      'The chai tapri has hot masala chai, it gives a warm golden glow!'
    ],
    cheers: [
      'That sparkle trail is so photogenic! ✨',
      'OMG look at those colors in the sky!',
      'Happy Diwali everyone! 🎉'
    ],
    giftGiven: false,
    giftCoins: 40
  },
  {
    id: 'npc_aarav',
    name: 'Aarav (Chhotu)',
    role: 'Excited Kid',
    outfit: { top: '#3b82f6', bottom: '#1e293b', cap: '#f59e0b' },
    x: 920,
    y: 720,
    targetX: 920,
    targetY: 720,
    dialogues: [
      'Bhaiya! Did you see my Chakri spin? It went wheee-whooosh!',
      'Can you burst a rocket for me? I love when it shoots up so high!',
      'Mummy bought me Motichoor laddoos, they are so yummy!'
    ],
    cheers: [
      'YAAAAY! Look at the rocket go up! 🚀',
      'Look at the Chakri zoom! Wheee!',
      'More crackers, please! Again again!'
    ],
    giftGiven: false,
    giftCoins: 30
  },
  {
    id: 'npc_dadi',
    name: 'Dadi Amma',
    role: 'Loving Grandmother',
    outfit: { top: '#fbcfe8', bottom: '#be185d', shawl: '#fef08a' },
    x: 380,
    y: 540,
    targetX: 380,
    targetY: 540,
    dialogues: [
      'Jeete raho beta! May Goddess Lakshmi shower endless prosperity, health, and happiness on your home.',
      'Take this Diwali Shagun as my blessing. Buy lots of sweets and sparklers!',
      'Did you light the earthen diyas? Oil diyas dispel all darkness from life.'
    ],
    cheers: [
      'Bhagwan sada sukhi rakhe! Auspicious lights!',
      'Sundar! Bohot sundar deepawali!',
      'May your life shine as bright as these lights!'
    ],
    giftGiven: false,
    giftCoins: 100
  },
  {
    id: 'npc_uncle_dave',
    name: 'Uncle Dave',
    role: 'Mesmerized Tourist',
    outfit: { top: '#10b981', bottom: '#e2e8f0', hat: '#64748b' },
    x: 1060,
    y: 600,
    targetX: 1060,
    targetY: 600,
    dialogues: [
      'Happy Diwali! This is my first time in India during festival of lights and I am absolutely blown away!',
      'The colors, the golden lights, the sweets... it is the most magical festival on earth!',
      'What do you call those flowerpot fireworks? Anar? The fountain of sparks is breathtaking!'
    ],
    cheers: [
      'Incredible! That was spectacular!',
      'Woohoo! India is truly incredible! 🎇',
      'Magnificent! Look at that sky bloom!'
    ],
    giftGiven: false,
    giftCoins: 60
  },
  {
    id: 'npc_kabir',
    name: 'Kabir & Friends',
    role: 'Festive Youth Group',
    outfit: { top: '#8b5cf6', bottom: '#312e81', scarf: '#fbbf24' },
    x: 850,
    y: 840,
    targetX: 850,
    targetY: 840,
    dialogues: [
      'Yo bro! Happy Diwali! We are planning a synchronized sky shot launch tonight!',
      'Check out Raju Bhaiya’s shop, he has got the 7-shot Aakash Ganga!',
      'Let’s make this Diwali night unforgettable!'
    ],
    cheers: [
      'BOOM! That Sutli bomb shook the ground, bro!',
      'Aakash Ganga sky shot is top tier!',
      'Diwali vibes 100/100! 💥'
    ],
    giftGiven: false,
    giftCoins: 50
  },
  {
    id: 'npc_ananya',
    name: 'Ananya',
    role: 'Rangoli Artist',
    outfit: { top: '#06b6d4', bottom: '#0e7490', bindi: '#ef4444' },
    x: 480,
    y: 420,
    targetX: 480,
    targetY: 420,
    dialogues: [
      'Happy Diwali! I just completed the peacock rangoli near the entrance!',
      'Take a look at the intricate colors. Lighting diyas around it makes it glow magically.',
      'Have you had Kaju Katli today? Festive celebrations are incomplete without it!'
    ],
    cheers: [
      'The colors reflect on the rangoli so gorgeously! 🪔',
      'Shubh Deepawali everyone!',
      'Such golden warmth everywhere!'
    ],
    giftGiven: false,
    giftCoins: 40
  }
];

// Spontaneous chat thoughts that NPCs say periodically
export const AMBIENT_CHATTER = [
  'Happy Diwali everyone! 🪔',
  'Shubh Deepawali! May this year bring happiness and prosperity!',
  'Look at the sky, someone launched a rocket! 🚀',
  'The fragrance of fresh jalebis is irresistible! 🥨',
  'Let us light more diyas at the Lakshmi Mandir! 🪔',
  'Raju Bhaiya has fresh stock of Anars! 🪴',
  'Bhai bachke raho, don’t stand too close to the fuse! ⚠️',
  'Happy Diwali to all friends and family! ✨',
  'Who wants Kaju Katli? 🍬',
  'Listen to the temple bells chime! 🔔'
];
