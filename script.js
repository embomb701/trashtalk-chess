(function () {
  'use strict';

  const STORAGE_KEY = 'trashtalk-chess-save-v1';
  const DEFAULT_SAVE = {
    settings: {
      level: 5,
      boardTheme: 'classic',
      pieceTheme: 'standard',
      languageMode: 'mature',
      voiceEnabled: true,
      voiceProfile: 'sultry',
      voiceName: 'auto',
      voiceRate: 0.92,
      voiceVolume: 1,
      voicePitch: 1.08
    },
    stats: {
      gamesPlayed: 0,
      totalWins: 0,
      highestLevelBeaten: 0
    },
    unlocks: {
      boards: ['classic'],
      pieces: ['standard']
    }
  };

  const LEVEL_LABELS = {
    1: 'Noob',
    2: 'Sandbox',
    3: 'Casual',
    4: 'Scrapper',
    5: 'Intermediate',
    6: 'Dangerous',
    7: 'Tactician',
    8: 'Monster',
    9: 'Grandmaster',
    10: 'Nightmare'
  };

  const BOARD_THEMES = {
    classic: {
      id: 'classic',
      name: 'Classic Wood',
      light: '#ead8bf',
      dark: '#95694b',
      border: '#5d3f2f',
      accent: '#d39b6d',
      requirement: null
    },
    green: {
      id: 'green',
      name: 'Tournament Green',
      light: '#e3f0d7',
      dark: '#4b7b55',
      border: '#24472b',
      accent: '#9ad9a7',
      requirement: { text: '2 wins', test: stats => stats.totalWins >= 2 }
    },
    marble: {
      id: 'marble',
      name: 'Marble Luxury',
      light: '#f4f5f7',
      dark: '#babec8',
      border: '#737783',
      accent: '#e4d7ff',
      requirement: { text: '5 wins', test: stats => stats.totalWins >= 5 }
    },
    blood: {
      id: 'blood',
      name: 'Blood Arena',
      light: '#f0d2d2',
      dark: '#832f39',
      border: '#451016',
      accent: '#ff9a9a',
      requirement: { text: 'Beat Level 3', test: stats => stats.highestLevelBeaten >= 3 }
    },
    neon: {
      id: 'neon',
      name: 'Neon Void',
      light: '#17243c',
      dark: '#1fd0ff',
      border: '#06263f',
      accent: '#7dfff5',
      requirement: { text: 'Beat Level 6 or 15 wins', test: stats => stats.highestLevelBeaten >= 6 || stats.totalWins >= 15 }
    }
  };

  const PIECE_THEMES = {
    standard: {
      id: 'standard',
      name: 'Standard',
      accent: '#ffffff',
      requirement: null,
      icons: {
        w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
        b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
      }
    },
    medieval: {
      id: 'medieval',
      name: 'Medieval Steel',
      accent: '#c9ced6',
      requirement: { text: '3 wins', test: stats => stats.totalWins >= 3 },
      icons: {
        w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
        b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
      }
    },
    cyber: {
      id: 'cyber',
      name: 'Cyber Neon',
      accent: '#79fff0',
      requirement: { text: 'Beat Level 4', test: stats => stats.highestLevelBeaten >= 4 },
      icons: {
        w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
        b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
      }
    },
    pirate: {
      id: 'pirate',
      name: 'Pirate Gold',
      accent: '#ffda6e',
      requirement: { text: 'Beat Level 5', test: stats => stats.highestLevelBeaten >= 5 },
      icons: {
        w: { k: '⚓', q: '☠', r: '🏴', b: '🗡', n: '🐎', p: '🪙' },
        b: { k: '⚓', q: '☠', r: '🏴', b: '🗡', n: '🐎', p: '💰' }
      }
    },
    dragon: {
      id: 'dragon',
      name: 'Dragon Fantasy',
      accent: '#99ff9b',
      requirement: { text: 'Beat Level 8 or 25 wins', test: stats => stats.highestLevelBeaten >= 8 || stats.totalWins >= 25 },
      icons: {
        w: { k: '🐲', q: '🐉', r: '🔥', b: '✨', n: '🦄', p: '🌿' },
        b: { k: '🦂', q: '🐲', r: '🔥', b: '✨', n: '🦄', p: '🌑' }
      }
    }
  };

  const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const INF = 999999;

  const PST = {
    p: [
       0,   0,   0,   0,   0,   0,   0,   0,
      50,  50,  50,  50,  50,  50,  50,  50,
      10,  10,  20,  30,  30,  20,  10,  10,
       5,   5,  10,  27,  27,  10,   5,   5,
       0,   0,   0,  25,  25,   0,   0,   0,
       5,  -5, -10,   0,   0, -10,  -5,   5,
       5,  10,  10, -25, -25,  10,  10,   5,
       0,   0,   0,   0,   0,   0,   0,   0
    ],
    n: [
     -50, -40, -30, -30, -30, -30, -40, -50,
     -40, -20,   0,   5,   5,   0, -20, -40,
     -30,   5,  10,  15,  15,  10,   5, -30,
     -30,   0,  15,  20,  20,  15,   0, -30,
     -30,   5,  15,  20,  20,  15,   5, -30,
     -30,   0,  10,  15,  15,  10,   0, -30,
     -40, -20,   0,   0,   0,   0, -20, -40,
     -50, -40, -30, -30, -30, -30, -40, -50
    ],
    b: [
     -20, -10, -10, -10, -10, -10, -10, -20,
     -10,   5,   0,   0,   0,   0,   5, -10,
     -10,  10,  10,  10,  10,  10,  10, -10,
     -10,   0,  10,  10,  10,  10,   0, -10,
     -10,   5,   5,  10,  10,   5,   5, -10,
     -10,   0,   5,  10,  10,   5,   0, -10,
     -10,   0,   0,   0,   0,   0,   0, -10,
     -20, -10, -10, -10, -10, -10, -10, -20
    ],
    r: [
       0,   0,   0,   5,   5,   0,   0,   0,
      -5,   0,   0,   0,   0,   0,   0,  -5,
      -5,   0,   0,   0,   0,   0,   0,  -5,
      -5,   0,   0,   0,   0,   0,   0,  -5,
      -5,   0,   0,   0,   0,   0,   0,  -5,
      -5,   0,   0,   0,   0,   0,   0,  -5,
       5,  10,  10,  10,  10,  10,  10,   5,
       0,   0,   0,   0,   0,   0,   0,   0
    ],
    q: [
     -20, -10, -10,  -5,  -5, -10, -10, -20,
     -10,   0,   0,   0,   0,   0,   0, -10,
     -10,   0,   5,   5,   5,   5,   0, -10,
      -5,   0,   5,   5,   5,   5,   0,  -5,
       0,   0,   5,   5,   5,   5,   0,  -5,
     -10,   5,   5,   5,   5,   5,   0, -10,
     -10,   0,   5,   0,   0,   0,   0, -10,
     -20, -10, -10,  -5,  -5, -10, -10, -20
    ],
    k: [
      20,  30,  10,   0,   0,  10,  30,  20,
      20,  20,   0,   0,   0,   0,  20,  20,
     -10, -20, -20, -20, -20, -20, -20, -10,
     -20, -30, -30, -40, -40, -30, -30, -20,
     -30, -40, -40, -50, -50, -40, -40, -30,
     -30, -40, -40, -50, -50, -40, -40, -30,
     -30, -40, -40, -50, -50, -40, -40, -30,
     -30, -40, -40, -50, -50, -40, -40, -30
    ]
  };

  const TAUNTS = {
    mature: {
      start: [
        'Let\'s get this over with. Try not to embarrass your bloodline.',
        'I play Black. You play victim.',
        'You brought confidence to a tactical execution. Bold.',
        'I can already smell the blunder coming off your first move.',
        'Settle in. I\'m about to narrate your collapse.',
        'You wanted smoke. I brought a flamethrower.',
        'Hope that opening prep wasn\'t downloaded from a cereal box.',
        'Standard rules, nonstandard disrespect.',
        'Take your time, gorgeous. The wrong move will still be wrong later.',
        'I hope you stretched. Carrying this much false confidence can pull something.',
        'You have the first move and somehow I already have the advantage.',
        'Welcome to the board. Your dignity can wait outside.'
      ],
      afterPlayer: [
        'That move had all the grace of a shopping cart crash.',
        'Interesting. By interesting I mean terrible.',
        'You moved with confidence. Shame about the quality.',
        'That was cute. Do you have a serious move too?',
        'I\'m trying to decide if that was brave or just stupid.',
        'Every turn you make me believe less in humanity.',
        'You keep volunteering pieces like it\'s charity night.',
        'I\'ve seen stronger ideas scribbled on napkins.',
        'That move has the tactical depth of a parking lot puddle.',
        'You play chess like autocorrect: confidently wrong and never apologizing.',
        'Was that strategy, or did your finger slip with ambition?',
        'Keep moving like that and your king is filing for new management.',
        'Bold move. Not good, but definitely visible from space.',
        'I love the confidence. It makes the autopsy funnier.'
      ],
      aiMove: [
        'There. I moved slowly so you could pretend you understood it.',
        'Your turn, gorgeous. Try not to make desperation look so obvious.',
        'I just improved my position and your anxiety at the same time.',
        'That move has consequences. I would explain them, but discovery is part of the fun.',
        'I left you several options. Most of them are humiliating.',
        'Go ahead, sweetheart. Touch another piece you cannot protect.',
        'That was foreplay. The tactical violation comes next.',
        'I know that move looked innocent. So did your opening before it caught fire.',
        'Your position is begging for mercy in a language your ego cannot translate.',
        'I moved one piece and somehow lowered your whole board\'s property value.',
        'Take your time. I enjoy watching bad ideas become commitments.',
        'Your move. Give me something embarrassing to remember you by.'
      ],
      blunder: [
        'There it is. A fresh, steaming blunder.',
        'Oh wow. You didn\'t just slip. You dove headfirst into disaster.',
        'That move belongs in a museum of bad decisions.',
        'You just hung that like laundry, genius.',
        'That wasn\'t a mistake. That was a confession.',
        'I didn\'t punish you yet and you already punished yourself.',
        'Spectacular throw. Truly cinematic.',
        'You just donated evaluation points like a fool with a trust fund.',
        'Holy shit. Even your other bad moves are embarrassed by that one.',
        'That blunder had setup, timing, and a punchline. Unfortunately, you were it.',
        'You didn\'t miss the tactic. You gave it your home address.',
        'That move turned a chess game into a public apology.',
        'Your position just lost value faster than a crypto scam.',
        'I was planning a trap, but apparently you prefer self-checkout.'
      ],
      capture: [
        'Thanks, I\'ll be taking that.',
        'Your army is shedding pieces like a cheap haircut.',
        'Another one gone. You weren\'t using it anyway.',
        'I collect your pieces the way debt collectors collect tears.',
        'That piece died for nothing. Kind of poetic.',
        'You keep feeding me material. I\'m spoiled.',
        'Snip. Another limb off your position.',
        'You defend like a wet paper bag.',
        'Another piece? At this point I should send you a loyalty card.',
        'I took that so cleanly it still thinks it belongs to you.',
        'Your material advantage has entered the witness protection program.',
        'You guard pieces like a nightclub with no doors.',
        'That piece lasted about as long as your opening theory.',
        'I\'m not stealing your pieces. You keep leaving them at the curb.'
      ],
      check: [
        'Check. Start panicking now.',
        'Your king is exposed like your bad habits.',
        'Check. I hope your pulse just spiked.',
        'Your monarch is in trouble and I love that for you.',
        'Check. The noose is tightening.',
        'That king looks nervous. Good.',
        'Check, clown. Find a move if you can.',
        'I have your king tap-dancing on hot coals.',
        'Check. Your king has fewer safe spaces than your ego.',
        'That crown is doing a lot of work for someone this helpless.',
        'Check, sweetheart. Try breathing through the panic.',
        'Your king is one bad square away from becoming a historical footnote.',
        'Check. I knocked politely; your position collapsed anyway.',
        'The king is running. Finally, one of your pieces has a plan.'
      ],
      promotion: [
        'Promotion. My position just got richer and you got poorer.',
        'New queen, same disrespect.',
        'That pawn grew up fast. Faster than your game did.',
        'Promotion time. This is where things get mean.',
        'I upgraded. You downgraded the moment you sat down.',
        'Fresh power on the board. Bad news for your survival.',
        'That pawn just got a better career than you.',
        'Promotion. Now watch me use it to ruin your day.',
        'A new queen. As if you weren\'t already overwhelmed.',
        'That pawn crossed the whole board while your strategy stayed home.',
        'Promotion. I just unlocked the deluxe version of your problem.',
        'Meet my new queen. She has plans for your evening.'
      ],
      aiWin: [
        'Checkmate. That was cleaner than you deserved.',
        'I win. You got roasted and outplayed.',
        'Another corpse on the board. Shame it was your position.',
        'Checkmate. Somewhere a tutorial video is crying for you.',
        'Easy money. You never really had this.',
        'I just folded you into a tactical lawn chair.',
        'Game over. You fought like a Wi-Fi signal in a basement.',
        'Get some sleep. Maybe a stronger brain spawns tomorrow.',
        'Checkmate. Your king died surrounded by coworkers who stopped caring.',
        'I expected resistance. You brought decorative pieces.',
        'That wasn\'t a game; it was a guided tour of your limitations.',
        'Checkmate. You had thirty-two pieces and not one good excuse.',
        'I\'d say you almost had me, but lying after a funeral feels tacky.',
        'You played like the board owed you an apology.'
      ],
      playerWin: [
        'I hate this, but fine. You earned that one.',
        'Lucky? Maybe. Still annoying. Good job.',
        'You actually finished the job. Disgusting, but respectable.',
        'Well played. Don\'t get used to hearing that from me.',
        'I walked into that one and now I\'m mad about it.',
        'You got me. I feel unclean saying it, but nice game.',
        'I\'ll remember this humiliation. Enjoy your tiny parade.',
        'Congratulations. You managed not to crumble for once.',
        'Fine, you won. Try not to make competence your whole personality.',
        'You beat me. That smug little silence suits you.',
        'Well played, asshole. There, enjoy the rare collectible.',
        'You earned that. I still hate the way you look winning.'
      ],
      draw: [
        'A draw. Nobody wins, but somehow you still look worse.',
        'Half a point each. I feel robbed and underwhelmed.',
        'Draw. What a boring way for your suffering to plateau.',
        'You escaped. Don\'t mistake that for mastery.',
        'Stalemate. Bureaucratic survival, not glory.',
        'A draw is just losing with paperwork.',
        'Neither of us got the full kill. Annoying.',
        'Fine. Call it a draw. I call it unfinished business.',
        'A draw: all that tension and neither of us got satisfaction.',
        'We split the point. You can keep the emotional damage.',
        'A draw. Like kissing through a screen door: effort, no payoff.',
        'Neither side won, but your opening definitely lost.'
      ],
      easyMode: [
        'Level {level}? Cute. Try level 10 if you want adult supervision.',
        'You {result} on level {level}. That barely counts, sweetheart.',
        'Imagine celebrating anything below Nightmare mode.',
        'Level {level} is training wheels and you still made it dramatic.',
        'Come back after level 10 if you want respect instead of snacks.',
        'That result on level {level} says more about your courage than your skill.',
        'Pick the hardest setting next time if you want your win—or loss—to matter.',
        'Level {level}? You want applause for that kiddie pool performance?'
      ],
      level10Respect: [
        'Damn... you actually beat me on max difficulty. You\'re better than I thought. Respect.',
        'Okay, that was real. Level 10 and you still took me down. Respect.',
        'You beat Nightmare mode. I can roast a lot, but not that.',
        'Level 10 win? Fine. You earned the silence between insults.',
        'That wasn\'t luck. That was skill. Respect.',
        'You cracked max difficulty. I hate it here, but respect.',
        'I came to talk trash. You came to prove a point.',
        'Nightmare mode beaten. That one goes on your fridge.'
      ]
    },
    pg: {
      start: [
        'Let\'s play. Try not to trip over your own opening.',
        'I\'m warmed up. Hope you are too.',
        'Time to see if your confidence has any supporting evidence.',
        'You bring the moves. I\'ll bring the commentary.',
        'Standard chess, premium ridicule.',
        'Ready for a lesson with extra sarcasm?',
        'I hope your plan is better than your odds.',
        'Today feels like a great day for you to get humbled.'
      ],
      afterPlayer: [
        'That move sure was a decision.',
        'I see what you tried. I also see why it worries me for you.',
        'That looked optimistic. Maybe too optimistic.',
        'You moved quickly. The quality did not keep up.',
        'That plan could use a little adult supervision.',
        'Interesting choice. I wouldn\'t recommend repeating it.',
        'You\'re making this easier than I expected.',
        'That was brave in the same way jumping in a puddle is sailing.'
      ],
      aiMove: [
        'Your turn. There are good moves available, statistically speaking.',
        'I improved my position. See if you can say the same.',
        'That move has a point. You may meet it shortly.',
        'Your position just got a little more uncomfortable.',
        'Take your time. The board is not going anywhere.',
        'I have a plan. You appear to have a collection of hopes.',
        'Your move. Choose carefully this time.',
        'That should give you something to worry about.'
      ],
      blunder: [
        'Yikes. That was a big miss.',
        'That move may come back to haunt you immediately.',
        'You just made my day a lot easier.',
        'That wasn\'t ideal for your long-term health.',
        'That looked better before the consequences arrived.',
        'Careful. Your position is starting to squeak.',
        'That move had a trap in it. For you.',
        'Oof. That was rough.'
      ],
      capture: [
        'I\'ll take that. Thanks.',
        'Another piece off the board. Tough scene.',
        'That one belonged to me now.',
        'You might want to keep a closer eye on your pieces.',
        'Material is leaving your account quickly.',
        'That exchange did not help your mood.',
        'I picked that off like low-hanging fruit.',
        'You keep giving me free samples.'
      ],
      check: [
        'Check. Time to respond.',
        'Your king needs attention right now.',
        'Check. Things just got serious.',
        'That king alarm you hear? That\'s for you.',
        'You are officially under pressure.',
        'Check. Hope your defense is awake.',
        'That king is looking a little uncomfortable.',
        'Immediate problem: your king.'
      ],
      promotion: [
        'Promotion! This just got more dangerous.',
        'That pawn just graduated.',
        'Fresh queen energy on the board.',
        'Promotion time. You may want a backup plan.',
        'That pawn got a major upgrade.',
        'New piece, new problems.',
        'Promotion. My options just expanded.',
        'That little pawn grew up fast.'
      ],
      aiWin: [
        'Checkmate. Good effort.',
        'I win this round. Thanks for playing.',
        'That ended well for me and educationally for you.',
        'Game over. I had the better answers today.',
        'That was clean. Want another shot?',
        'Victory for me. Improvement opportunity for you.',
        'I got the point. You got experience.',
        'That game belongs in my highlight reel.'
      ],
      playerWin: [
        'Nicely done. You earned that win.',
        'Okay, that was solid. Well played.',
        'You got me this time. Respect.',
        'Strong finish. I can\'t argue with that.',
        'You stayed composed and it paid off.',
        'That was a good game. You deserved the point.',
        'You found the right ideas at the right time.',
        'Well done. That was no accident.'
      ],
      draw: [
        'Draw. We\'ll call it unfinished business.',
        'Half a point each. Fair enough.',
        'Nobody wins today, but nobody collapses either.',
        'A draw. Tense, balanced, annoying.',
        'That game leveled out in the end.',
        'No winner this time. Rematch energy.',
        'Drawn battle. Plenty to learn from that one.',
        'That score sheet says equality.'
      ],
      easyMode: [
        'Level {level}? Nice. Now try level 10.',
        'You {result} on level {level}. Let\'s see that on Nightmare.',
        'That result is cool, but the hardest mode is still waiting.',
        'Level {level} was a warm-up. Be brave next time.',
        'Want real bragging rights? Choose level 10.',
        'You handled level {level}. Time to turn the heat up.',
        'That result is better when the difficulty gets serious.',
        'Good start. Now do it on max difficulty.'
      ],
      level10Respect: [
        'Wow, you beat me on max difficulty. Respect.',
        'Level 10 and you still won? That was strong.',
        'That took real skill. Nicely done.',
        'Nightmare mode beaten. Impressive.',
        'You cleared the hardest setting. Respect earned.',
        'That was top-shelf chess. Nicely played.',
        'You took down max difficulty fair and square.',
        'That win means something. Great job.'
      ]
    }
  };

  const state = {
    save: loadSave(),
    screen: 'menu',
    chess: null,
    selectedSquare: null,
    legalMoves: [],
    playerPendingPromotion: null,
    aiThinking: false,
    lastMove: null,
    banter: [],
    recentTaunts: [],
    voices: [],
    voiceAvailable: 'speechSynthesis' in window,
    boardSize: 720,
    gameResult: null,
    menuFocusIndex: 0
  };

  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const elements = {
    screens: {
      menu: $('#screen-menu'),
      settings: $('#screen-settings'),
      progress: $('#screen-progress'),
      game: $('#screen-game')
    },
    globalMuteBtn: $('#globalMuteBtn'),
    playBtn: $('#playBtn'),
    settingsBtn: $('#settingsBtn'),
    progressBtn: $('#progressBtn'),
    quitBtn: $('#quitBtn'),
    backFromSettings: $('#backFromSettings'),
    backFromProgress: $('#backFromProgress'),
    backToMenuBtn: $('#backToMenuBtn'),
    changeSettingsBtn: $('#changeSettingsBtn'),
    rematchBtn: $('#rematchBtn'),
    resetSaveBtn: $('#resetSaveBtn'),
    difficulty: $('#difficulty'),
    difficultyLabel: $('#difficultyLabel'),
    languageMode: $('#languageMode'),
    boardTheme: $('#boardTheme'),
    pieceTheme: $('#pieceTheme'),
    voiceEnabled: $('#voiceEnabled'),
    voiceProfile: $('#voiceProfile'),
    voiceName: $('#voiceName'),
    previewVoiceBtn: $('#previewVoiceBtn'),
    voiceRate: $('#voiceRate'),
    voiceRateLabel: $('#voiceRateLabel'),
    voiceVolume: $('#voiceVolume'),
    voiceVolumeLabel: $('#voiceVolumeLabel'),
    voicePitch: $('#voicePitch'),
    voicePitchLabel: $('#voicePitchLabel'),
    statsSummary: $('#statsSummary'),
    boardUnlocks: $('#boardUnlocks'),
    pieceUnlocks: $('#pieceUnlocks'),
    board: $('#board'),
    turnIndicator: $('#turnIndicator'),
    levelBadge: $('#levelBadge'),
    menuBtn: $('#menuBtn'),
    resignBtn: $('#resignBtn'),
    banterLead: $('#banterLead'),
    banterLog: $('#banterLog'),
    moveHistory: $('#moveHistory'),
    capturedWhite: $('#capturedWhite'),
    capturedBlack: $('#capturedBlack'),
    promotionModal: $('#promotionModal'),
    promotionChoices: $('#promotionChoices'),
    toast: $('#toast'),
    gameOverModal: $('#gameOverModal'),
    gameOverTitle: $('#gameOverTitle'),
    gameOverSubtitle: $('#gameOverSubtitle'),
    gameOverTaunt: $('#gameOverTaunt'),
    unlockNotice: $('#unlockNotice'),
    postGameStats: $('#postGameStats')
  };

  const ctx = elements.board.getContext('2d');

  init();

  function init() {
    bindEvents();
    applySettingsToControls();
    populateThemeSelects();
    renderProgress();
    resizeBoard();
    switchScreen('menu');
    renderIdleBoard();
    updateGlobalMuteLabel();
    loadVoices();
    if (state.voiceAvailable) window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    window.addEventListener('resize', resizeBoard);
    window.visualViewport?.addEventListener('resize', resizeBoard);
    document.addEventListener('keydown', handleMenuKeyboard);
  }

  function bindEvents() {
    elements.playBtn.addEventListener('click', () => startGame());
    elements.settingsBtn.addEventListener('click', () => switchScreen('settings'));
    elements.progressBtn.addEventListener('click', () => {
      renderProgress();
      switchScreen('progress');
    });
    elements.quitBtn.addEventListener('click', () => {
      window.close();
      toast('Close the tab when you are done. Browsers are annoyingly responsible.');
    });

    elements.backFromSettings.addEventListener('click', () => switchScreen('menu'));
    elements.backFromProgress.addEventListener('click', () => switchScreen('menu'));
    elements.backToMenuBtn.addEventListener('click', () => {
      hideGameOver();
      switchScreen('menu');
      renderIdleBoard();
    });
    elements.changeSettingsBtn.addEventListener('click', () => {
      hideGameOver();
      switchScreen('settings');
    });
    elements.rematchBtn.addEventListener('click', () => {
      hideGameOver();
      startGame();
    });

    elements.resetSaveBtn.addEventListener('click', () => {
      if (!window.confirm('Reset all unlocks, stats, and settings?')) return;
      state.save = clone(DEFAULT_SAVE);
      persistSave();
      applySettingsToControls();
      populateThemeSelects();
      renderProgress();
      renderIdleBoard();
      toast('Save reset. Back to square one.');
    });

    elements.globalMuteBtn.addEventListener('click', () => {
      state.save.settings.voiceEnabled = !state.save.settings.voiceEnabled;
      persistSave();
      applySettingsToControls();
      updateGlobalMuteLabel();
    });

    elements.menuBtn.addEventListener('click', () => switchScreen('menu'));
    elements.resignBtn.addEventListener('click', () => {
      if (!state.chess || state.chess.game_over()) return;
      state.gameResult = { winner: 'black', reason: 'Resignation' };
      finishGame();
    });

    elements.board.addEventListener('click', onBoardClick);
    elements.board.addEventListener('touchstart', onBoardTouch, { passive: false });

    elements.difficulty.addEventListener('input', () => {
      state.save.settings.level = Number(elements.difficulty.value);
      persistSave();
      updateDifficultyLabel();
    });
    elements.languageMode.addEventListener('change', () => {
      state.save.settings.languageMode = elements.languageMode.value;
      persistSave();
    });
    elements.boardTheme.addEventListener('change', () => {
      state.save.settings.boardTheme = elements.boardTheme.value;
      persistSave();
      renderCurrentBoard();
    });
    elements.pieceTheme.addEventListener('change', () => {
      state.save.settings.pieceTheme = elements.pieceTheme.value;
      persistSave();
      renderCurrentBoard();
      renderProgress();
    });
    elements.voiceEnabled.addEventListener('change', () => {
      state.save.settings.voiceEnabled = elements.voiceEnabled.checked;
      persistSave();
      updateGlobalMuteLabel();
    });
    elements.voiceProfile.addEventListener('change', () => {
      state.save.settings.voiceProfile = elements.voiceProfile.value;
      persistSave();
    });
    elements.voiceName.addEventListener('change', () => {
      state.save.settings.voiceName = elements.voiceName.value;
      persistSave();
    });
    elements.previewVoiceBtn.addEventListener('click', () => {
      speak('Careful, sweetheart. I can hear your next blunder from here.', true);
    });
    elements.voiceRate.addEventListener('input', () => {
      state.save.settings.voiceRate = Number(elements.voiceRate.value);
      persistSave();
      applySettingsToControls();
    });
    elements.voiceVolume.addEventListener('input', () => {
      state.save.settings.voiceVolume = Number(elements.voiceVolume.value);
      persistSave();
      applySettingsToControls();
    });
    elements.voicePitch.addEventListener('input', () => {
      state.save.settings.voicePitch = Number(elements.voicePitch.value);
      persistSave();
      applySettingsToControls();
    });
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULT_SAVE);
      return deepMerge(clone(DEFAULT_SAVE), JSON.parse(raw));
    } catch (error) {
      console.warn('Failed to load save, using defaults.', error);
      return clone(DEFAULT_SAVE);
    }
  }

  function persistSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.save));
    } catch (error) {
      console.warn('Failed to save state.', error);
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function deepMerge(base, extra) {
    Object.keys(extra || {}).forEach(key => {
      if (extra[key] && typeof extra[key] === 'object' && !Array.isArray(extra[key])) {
        base[key] = deepMerge(base[key] || {}, extra[key]);
      } else {
        base[key] = extra[key];
      }
    });
    return base;
  }

  function applySettingsToControls() {
    const settings = state.save.settings;
    elements.difficulty.value = settings.level;
    elements.languageMode.value = settings.languageMode;
    elements.voiceEnabled.checked = settings.voiceEnabled;
    elements.voiceProfile.value = settings.voiceProfile;
    elements.voiceRate.value = settings.voiceRate;
    elements.voiceVolume.value = settings.voiceVolume;
    elements.voicePitch.value = settings.voicePitch;
    elements.voiceRateLabel.textContent = settings.voiceRate.toFixed(2) + 'x';
    elements.voiceVolumeLabel.textContent = Math.round(settings.voiceVolume * 100) + '%';
    elements.voicePitchLabel.textContent = settings.voicePitch.toFixed(2) + 'x';
    updateDifficultyLabel();
  }

  function updateDifficultyLabel() {
    const level = state.save.settings.level;
    elements.difficultyLabel.textContent = `Level ${level} — ${LEVEL_LABELS[level]}`;
    elements.levelBadge.textContent = `Level ${level} · ${LEVEL_LABELS[level]}`;
  }

  function populateThemeSelects() {
    const boardIds = Object.keys(BOARD_THEMES);
    const pieceIds = Object.keys(PIECE_THEMES);

    populateThemeSelect(elements.boardTheme, boardIds, state.save.unlocks.boards, BOARD_THEMES, state.save.settings.boardTheme);
    populateThemeSelect(elements.pieceTheme, pieceIds, state.save.unlocks.pieces, PIECE_THEMES, state.save.settings.pieceTheme);
  }

  function populateThemeSelect(select, ids, unlockedIds, source, currentValue) {
    select.innerHTML = '';
    ids.forEach(id => {
      const meta = source[id];
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = unlockedIds.includes(id) ? meta.name : `${meta.name} 🔒`;
      opt.disabled = !unlockedIds.includes(id);
      if (id === currentValue && unlockedIds.includes(id)) opt.selected = true;
      select.appendChild(opt);
    });
    if (select.selectedIndex === -1) {
      const firstUnlocked = ids.find(id => unlockedIds.includes(id));
      select.value = firstUnlocked;
      if (select === elements.boardTheme) state.save.settings.boardTheme = firstUnlocked;
      if (select === elements.pieceTheme) state.save.settings.pieceTheme = firstUnlocked;
      persistSave();
    }
  }

  function renderProgress() {
    const stats = state.save.stats;
    elements.statsSummary.innerHTML = [
      statCard('Games Played', stats.gamesPlayed),
      statCard('Wins', stats.totalWins),
      statCard('Highest Level Beaten', stats.highestLevelBeaten),
      statCard('Voice', state.voiceAvailable ? 'Ready' : 'Text Only')
    ].join('');

    elements.boardUnlocks.innerHTML = Object.values(BOARD_THEMES).map(theme => unlockCard(theme, state.save.unlocks.boards.includes(theme.id), 'board')).join('');
    elements.pieceUnlocks.innerHTML = Object.values(PIECE_THEMES).map(theme => unlockCard(theme, state.save.unlocks.pieces.includes(theme.id), 'piece')).join('');
  }

  function statCard(label, value) {
    return `<div class="stat-card"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function unlockCard(theme, unlocked, kind) {
    const preview = kind === 'board'
      ? `<span class="theme-preview" style="background: linear-gradient(135deg, ${theme.light} 0 50%, ${theme.dark} 50% 100%)"></span>`
      : `<span>${PIECE_THEMES[theme.id].icons.w.q} ${PIECE_THEMES[theme.id].icons.b.q}</span>`;
    const requirement = theme.requirement ? theme.requirement.text : 'Starter';
    return `
      <div class="unlock-card ${unlocked ? 'unlocked' : 'locked'}">
        <h4>${preview}${theme.name}</h4>
        <p>${unlocked ? 'Unlocked and ready to flex.' : `Unlock: ${requirement}`}</p>
        <span class="unlock-tag ${unlocked ? 'good' : 'bad'}">${unlocked ? 'Unlocked' : 'Locked'}</span>
      </div>
    `;
  }

  function switchScreen(screen) {
    state.screen = screen;
    document.body.classList.toggle('game-active', screen === 'game');
    Object.keys(elements.screens).forEach(key => elements.screens[key].classList.toggle('active', key === screen));
    state.menuFocusIndex = 0;
    if (screen === 'game') {
      resizeBoard();
      renderCurrentBoard();
    }
  }

  function resizeBoard() {
    const wrap = elements.board.parentElement;
    wrap.style.width = '';
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const boardTop = Math.max(0, wrap.getBoundingClientRect().top);
    const availableHeight = viewportHeight - boardTop - 18;
    const availableWidth = wrap.clientWidth || 720;
    const mobileWidth = window.innerWidth - (window.innerWidth < 800 ? 22 : 0);
    const size = Math.floor(Math.min(availableWidth, mobileWidth, availableHeight, 860));
    state.boardSize = Math.max(240, size);
    wrap.style.width = `${state.boardSize}px`;
    elements.board.width = state.boardSize;
    elements.board.height = state.boardSize;
    renderCurrentBoard();
  }

  function renderIdleBoard() {
    state.lastMove = null;
    state.selectedSquare = null;
    state.legalMoves = [];
    renderBoardFromFen('rnbqkbnr/pppppppp/8/8/3q4/8/PPPPPPPP/RNBQKBNR');
  }

  function startGame() {
    if (typeof Chess !== 'function') {
      toast('chess.js did not load. Keep chess.min.js next to index.html.');
      return;
    }
    state.chess = new Chess();
    state.selectedSquare = null;
    state.legalMoves = [];
    state.playerPendingPromotion = null;
    state.aiThinking = false;
    state.lastMove = null;
    state.banter = [];
    state.gameResult = null;
    hideGameOver();
    elements.moveHistory.value = '';
    elements.capturedWhite.textContent = '';
    elements.capturedBlack.textContent = '';
    elements.banterLog.innerHTML = '';
    elements.banterLead.textContent = 'The board is fresh. Your odds are not.';
    updateDifficultyLabel();
    switchScreen('game');
    renderCurrentBoard();
    updateMoveHistory();
    updateCapturedPieces();
    updateTurnLabel();
    taunt('start');
  }

  function onBoardTouch(event) {
    event.preventDefault();
    const touch = event.changedTouches[0];
    const rect = elements.board.getBoundingClientRect();
    onBoardInteraction(touch.clientX - rect.left, touch.clientY - rect.top);
  }

  function onBoardClick(event) {
    const rect = elements.board.getBoundingClientRect();
    onBoardInteraction(event.clientX - rect.left, event.clientY - rect.top);
  }

  function onBoardInteraction(x, y) {
    if (!state.chess || state.aiThinking || state.playerPendingPromotion || state.chess.game_over()) return;
    if (state.chess.turn() !== 'w') return;
    const square = pointToSquare(x, y);
    if (!square) return;

    if (state.selectedSquare) {
      const candidateMoves = state.legalMoves.filter(move => move.to === square);
      if (candidateMoves.length) {
        if (candidateMoves.some(move => move.promotion)) {
          showPromotionChoices(state.selectedSquare, square);
          return;
        }
        commitPlayerMove({ from: state.selectedSquare, to: square });
        return;
      }
    }

    const piece = state.chess.get(square);
    if (piece && piece.color === 'w') {
      state.selectedSquare = square;
      state.legalMoves = state.chess.moves({ square, verbose: true });
    } else {
      state.selectedSquare = null;
      state.legalMoves = [];
    }
    renderCurrentBoard();
  }

  function showPromotionChoices(from, to) {
    state.playerPendingPromotion = { from, to };
    elements.promotionChoices.innerHTML = '';
    ['q', 'r', 'b', 'n'].forEach(pieceType => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'promotion-choice';
      button.textContent = getPieceGlyph('w', pieceType);
      button.addEventListener('click', () => {
        hidePromotionChoices();
        commitPlayerMove({ from, to, promotion: pieceType });
      });
      elements.promotionChoices.appendChild(button);
    });
    elements.promotionModal.classList.remove('hidden');
  }

  function hidePromotionChoices() {
    state.playerPendingPromotion = null;
    elements.promotionModal.classList.add('hidden');
    elements.promotionChoices.innerHTML = '';
  }

  function commitPlayerMove(move) {
    const before = evaluatePosition(state.chess);
    const verbose = state.chess.move(move);
    if (!verbose) return;

    state.lastMove = { from: verbose.from, to: verbose.to };
    state.selectedSquare = null;
    state.legalMoves = [];

    const after = evaluatePosition(state.chess);
    if (after - before > blunderThreshold()) {
      taunt('blunder');
    } else if (verbose.captured) {
      taunt('capture');
    } else if (state.chess.in_check()) {
      taunt('check');
    } else if (verbose.promotion) {
      taunt('promotion');
    } else {
      taunt('afterPlayer', 0.85);
    }

    updateMoveHistory();
    updateCapturedPieces();
    updateTurnLabel();
    renderCurrentBoard();

    if (checkIfGameFinished()) return;
    window.setTimeout(runAiTurn, 160);
  }

  function blunderThreshold() {
    const level = state.save.settings.level;
    if (level >= 8) return 90;
    if (level >= 5) return 140;
    return 190;
  }

  function runAiTurn() {
    if (!state.chess || state.chess.game_over()) return;
    state.aiThinking = true;
    updateTurnLabel();

    window.setTimeout(() => {
      const move = getBestAiMove(state.chess, state.save.settings.level);
      if (!move) {
        state.aiThinking = false;
        checkIfGameFinished();
        return;
      }

      const verbose = state.chess.move(move);
      state.lastMove = { from: verbose.from, to: verbose.to };

      if (verbose.captured) taunt('capture');
      else if (verbose.promotion) taunt('promotion');
      else if (state.chess.in_check()) taunt('check');
      else taunt('aiMove', 0.9);

      updateMoveHistory();
      updateCapturedPieces();
      state.aiThinking = false;
      updateTurnLabel();
      renderCurrentBoard();
      checkIfGameFinished();
    }, state.save.settings.level >= 8 ? 240 : 140);
  }

  function getBestAiMove(chess, level) {
    const moves = chess.moves({ verbose: true });
    if (!moves.length) return null;

    if (level === 1) return moves[Math.floor(Math.random() * moves.length)];

    const depth = getSearchDepth(level);
    const randomness = getRandomness(level);
    let bestScore = -INF;
    let bestMoves = [];

    const ordered = orderMoves(moves);
    for (const move of ordered) {
      chess.move(move);
      const score = search(chess, depth - 1, -INF, INF, false);
      chess.undo();

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    const goodPool = bestMoves.length ? bestMoves : ordered;
    if (Math.random() < randomness) {
      const topSlice = ordered.slice(0, Math.min(4, ordered.length));
      return topSlice[Math.floor(Math.random() * topSlice.length)];
    }
    return goodPool[Math.floor(Math.random() * goodPool.length)];
  }

  function getSearchDepth(level) {
    if (level <= 2) return 1;
    if (level <= 4) return 2;
    if (level <= 6) return 3;
    if (level <= 8) return 4;
    return 5;
  }

  function getRandomness(level) {
    if (level <= 2) return 0.6;
    if (level <= 4) return 0.35;
    if (level <= 6) return 0.16;
    if (level <= 8) return 0.06;
    return 0;
  }

  function search(chess, depth, alpha, beta, maximizingBlack) {
    if (depth === 0 || chess.game_over()) return evaluatePosition(chess);

    const moves = orderMoves(chess.moves({ verbose: true }));
    if (maximizingBlack) {
      let best = -INF;
      for (const move of moves) {
        chess.move(move);
        best = Math.max(best, search(chess, depth - 1, alpha, beta, false));
        chess.undo();
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    }

    let best = INF;
    for (const move of moves) {
      chess.move(move);
      best = Math.min(best, search(chess, depth - 1, alpha, beta, true));
      chess.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  function orderMoves(moves) {
    return moves.slice().sort((a, b) => moveHeuristic(b) - moveHeuristic(a));
  }

  function moveHeuristic(move) {
    let score = 0;
    if (move.captured) score += 10 * PIECE_VALUES[move.captured] - PIECE_VALUES[move.piece];
    if (move.promotion) score += PIECE_VALUES[move.promotion] + 500;
    if (move.flags && move.flags.includes('k')) score += 35;
    if (move.flags && move.flags.includes('q')) score += 35;
    if (move.san.includes('+')) score += 40;
    if (move.san.includes('#')) score += 10000;
    return score;
  }

  function evaluatePosition(chess) {
    if (chess.in_checkmate()) return chess.turn() === 'w' ? INF - 1 : -INF + 1;
    if (chess.in_stalemate() || chess.in_draw() || chess.insufficient_material() || chess.in_threefold_repetition()) return 0;

    const board = chess.board();
    let total = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (!piece) continue;
        const index = row * 8 + col;
        const table = PST[piece.type];
        const whiteSquare = table[index];
        const blackSquare = table[mirrorIndex(index)];
        const pieceScore = PIECE_VALUES[piece.type] + (piece.color === 'w' ? whiteSquare : blackSquare);
        total += piece.color === 'b' ? pieceScore : -pieceScore;
      }
    }

    const mobility = chess.moves().length;
    total += chess.turn() === 'b' ? mobility : -mobility;
    return total;
  }

  function mirrorIndex(index) {
    const row = Math.floor(index / 8);
    const col = index % 8;
    return (7 - row) * 8 + col;
  }

  function checkIfGameFinished() {
    if (!state.chess || !state.chess.game_over()) return false;

    if (state.chess.in_checkmate()) {
      state.gameResult = state.chess.turn() === 'w'
        ? { winner: 'black', reason: 'Checkmate' }
        : { winner: 'white', reason: 'Checkmate' };
    } else if (state.chess.in_stalemate()) {
      state.gameResult = { winner: 'draw', reason: 'Stalemate' };
    } else if (state.chess.in_threefold_repetition()) {
      state.gameResult = { winner: 'draw', reason: 'Threefold repetition' };
    } else if (state.chess.insufficient_material()) {
      state.gameResult = { winner: 'draw', reason: 'Insufficient material' };
    } else if (state.chess.in_draw()) {
      const halfmove = Number(state.chess.fen().split(' ')[4] || 0);
      state.gameResult = { winner: 'draw', reason: halfmove >= 100 ? '50-move rule' : 'Draw' };
    } else {
      state.gameResult = { winner: 'draw', reason: 'Draw' };
    }

    finishGame();
    return true;
  }

  function finishGame() {
    const result = state.gameResult;
    const settings = state.save.settings;
    const stats = state.save.stats;
    const unlockMessages = [];

    stats.gamesPlayed += 1;
    let subtitle = result.reason;
    let finalLine = '';

    if (result.winner === 'white') {
      stats.totalWins += 1;
      stats.highestLevelBeaten = Math.max(stats.highestLevelBeaten, settings.level);
      if (settings.level === 10) {
        finalLine = pickTaunt('level10Respect');
      } else {
        finalLine = fillTemplate(pickTaunt('easyMode'), { level: settings.level, result: 'won' });
      }
      elements.gameOverTitle.textContent = 'CHECKMATE — YOU WIN';
      taunt('playerWin', 1);
    } else if (result.winner === 'black') {
      finalLine = settings.level < 10
        ? fillTemplate(pickTaunt('easyMode'), { level: settings.level, result: 'lost' })
        : pickTaunt('aiWin');
      elements.gameOverTitle.textContent = result.reason === 'Resignation' ? 'YOU RESIGNED' : 'AI WINS';
      taunt('aiWin', 1);
    } else {
      finalLine = pickTaunt('draw');
      elements.gameOverTitle.textContent = 'DRAW';
      taunt('draw', 1);
    }

    const newUnlocks = applyUnlocks();
    if (newUnlocks.length) unlockMessages.push(...newUnlocks);

    persistSave();
    populateThemeSelects();
    renderProgress();

    elements.gameOverSubtitle.textContent = subtitle;
    elements.gameOverTaunt.textContent = finalLine;
    elements.postGameStats.innerHTML = [
      statCard('Games Played', stats.gamesPlayed),
      statCard('Wins', stats.totalWins),
      statCard('Highest Level', stats.highestLevelBeaten)
    ].join('');

    if (unlockMessages.length) {
      elements.unlockNotice.textContent = `New unlock${unlockMessages.length > 1 ? 's' : ''}: ${unlockMessages.join(', ')}`;
      elements.unlockNotice.classList.remove('hidden');
      toast(`Unlocked: ${unlockMessages.join(' · ')}`);
    } else {
      elements.unlockNotice.classList.add('hidden');
      elements.unlockNotice.textContent = '';
    }

    elements.gameOverModal.classList.remove('hidden');
    speak(finalLine);
  }

  function hideGameOver() {
    elements.gameOverModal.classList.add('hidden');
  }

  function applyUnlocks() {
    const messages = [];
    const stats = state.save.stats;

    Object.values(BOARD_THEMES).forEach(theme => {
      if (state.save.unlocks.boards.includes(theme.id) || !theme.requirement) return;
      if (theme.requirement.test(stats)) {
        state.save.unlocks.boards.push(theme.id);
        messages.push(theme.name);
      }
    });

    Object.values(PIECE_THEMES).forEach(theme => {
      if (state.save.unlocks.pieces.includes(theme.id) || !theme.requirement) return;
      if (theme.requirement.test(stats)) {
        state.save.unlocks.pieces.push(theme.id);
        messages.push(theme.name);
      }
    });

    return messages;
  }

  function updateMoveHistory() {
    if (!state.chess) return;
    const history = state.chess.history();
    const lines = [];
    for (let i = 0; i < history.length; i += 2) {
      const moveNo = Math.floor(i / 2) + 1;
      lines.push(`${moveNo}. ${history[i] || ''} ${history[i + 1] || ''}`.trim());
    }
    elements.moveHistory.value = lines.join('\n');
    elements.moveHistory.scrollTop = elements.moveHistory.scrollHeight;
  }

  function updateCapturedPieces() {
    if (!state.chess) return;
    const history = state.chess.history({ verbose: true });
    const whiteLost = [];
    const blackLost = [];

    history.forEach(move => {
      if (!move.captured) return;
      if (move.color === 'w') {
        blackLost.push(getPieceGlyph('b', move.captured));
      } else {
        whiteLost.push(getPieceGlyph('w', move.captured));
      }
    });

    elements.capturedWhite.textContent = whiteLost.join(' ');
    elements.capturedBlack.textContent = blackLost.join(' ');
  }

  function updateTurnLabel() {
    if (!state.chess) return;
    if (state.aiThinking) {
      elements.turnIndicator.textContent = 'AI thinking';
      return;
    }
    elements.turnIndicator.textContent = state.chess.turn() === 'w' ? 'Your move' : 'AI move';
  }

  function renderCurrentBoard() {
    if (!ctx) return;
    if (!state.chess) {
      renderIdleBoard();
      return;
    }
    renderBoardFromFen(state.chess.fen().split(' ')[0]);
  }

  function renderBoardFromFen(boardFen) {
    const theme = BOARD_THEMES[state.save.settings.boardTheme] || BOARD_THEMES.classic;
    const size = state.boardSize;
    const cell = size / 8;
    document.documentElement.style.setProperty('--board-light', theme.light);
    document.documentElement.style.setProperty('--board-dark', theme.dark);
    document.documentElement.style.setProperty('--board-border', theme.border);

    ctx.clearRect(0, 0, size, size);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const light = (row + col) % 2 === 0;
        ctx.fillStyle = light ? theme.light : theme.dark;
        ctx.fillRect(col * cell, row * cell, cell, cell);

        if (theme.id === 'marble') drawMarbleVein(row, col, cell);
        if (theme.id === 'classic') drawWoodGrain(row, col, cell);
        if (theme.id === 'neon') drawNeonGlow(row, col, cell, light);

        const square = coordsToSquare(row, col);
        if (state.lastMove && state.lastMove.from === square) {
          ctx.fillStyle = 'rgba(95, 227, 208, 0.42)';
          ctx.fillRect(col * cell, row * cell, cell, cell);
          ctx.strokeStyle = 'rgba(95, 227, 208, 0.95)';
          ctx.lineWidth = Math.max(3, cell * 0.055);
          ctx.strokeRect(col * cell + 3, row * cell + 3, cell - 6, cell - 6);
        }

        if (state.lastMove && state.lastMove.to === square) {
          ctx.fillStyle = 'rgba(255, 216, 92, 0.48)';
          ctx.fillRect(col * cell, row * cell, cell, cell);
          ctx.strokeStyle = 'rgba(255, 216, 92, 0.98)';
          ctx.lineWidth = Math.max(3, cell * 0.055);
          ctx.strokeRect(col * cell + 3, row * cell + 3, cell - 6, cell - 6);
        }

        if (state.selectedSquare === square) {
          ctx.strokeStyle = 'rgba(255, 92, 125, 0.95)';
          ctx.lineWidth = Math.max(3, cell * 0.08);
          ctx.strokeRect(col * cell + 3, row * cell + 3, cell - 6, cell - 6);
        }
      }
    }

    drawCoordinates(cell, theme);

    state.legalMoves.forEach(move => {
      const { row, col } = squareToCoords(move.to);
      const cx = col * cell + cell / 2;
      const cy = row * cell + cell / 2;
      ctx.fillStyle = move.captured ? 'rgba(255, 92, 125, 0.45)' : 'rgba(95, 227, 208, 0.38)';
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.18, 0, Math.PI * 2);
      ctx.fill();
      if (move.captured) {
        ctx.strokeStyle = 'rgba(255, 92, 125, 0.9)';
        ctx.lineWidth = 4;
        ctx.strokeRect(col * cell + 6, row * cell + 6, cell - 12, cell - 12);
      }
    });

    const rows = boardFen.split('/');
    rows.forEach((rowString, row) => {
      let col = 0;
      rowString.split('').forEach(token => {
        if (/\d/.test(token)) {
          col += Number(token);
          return;
        }
        const color = token === token.toUpperCase() ? 'w' : 'b';
        const type = token.toLowerCase();
        drawPiece(color, type, row, col, cell);
        col += 1;
      });
    });
  }

  function drawCoordinates(cell, theme) {
    ctx.save();
    ctx.font = `${Math.max(12, cell * 0.14)}px Inter`;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? theme.dark : theme.light;
      ctx.fillText(String(8 - i), 6, i * cell + 16);
      ctx.fillText('abcdefgh'[i], i * cell + cell - 14, state.boardSize - 8);
    }
    ctx.restore();
  }

  function drawWoodGrain(row, col, cell) {
    if ((row + col) % 2 !== 0) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(120, 77, 47, 0.18)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const y = row * cell + (cell / 4) * (i + 1);
      ctx.beginPath();
      ctx.moveTo(col * cell + 4, y);
      ctx.lineTo(col * cell + cell - 4, y + (i % 2 === 0 ? 2 : -2));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMarbleVein(row, col, cell) {
    ctx.save();
    ctx.strokeStyle = 'rgba(130, 140, 165, 0.12)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(col * cell + cell * 0.12, row * cell + cell * 0.2);
    ctx.bezierCurveTo(
      col * cell + cell * 0.35,
      row * cell + cell * 0.35,
      col * cell + cell * 0.55,
      row * cell + cell * 0.1,
      col * cell + cell * 0.84,
      row * cell + cell * 0.82
    );
    ctx.stroke();
    ctx.restore();
  }

  function drawNeonGlow(row, col, cell, light) {
    ctx.save();
    ctx.strokeStyle = light ? 'rgba(125,255,245,0.12)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(col * cell + 1, row * cell + 1, cell - 2, cell - 2);
    ctx.restore();
  }

  function drawPiece(color, type, row, col, cell) {
    const theme = PIECE_THEMES[state.save.settings.pieceTheme] || PIECE_THEMES.standard;
    const x = col * cell + cell / 2;
    const y = row * cell + cell / 2;
    const glyph = theme.icons[color][type];

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.floor(cell * (theme.id === 'pirate' || theme.id === 'dragon' ? 0.58 : 0.72))}px ${theme.id === 'standard' ? 'Georgia' : 'Inter'}`;

    if (theme.id === 'cyber') {
      ctx.shadowColor = color === 'w' ? '#79fff0' : '#00c8ff';
      ctx.shadowBlur = 18;
      ctx.fillStyle = color === 'w' ? '#cffff9' : '#071722';
      ctx.strokeStyle = '#79fff0';
      ctx.lineWidth = 2;
      ctx.strokeText(glyph, x, y + 2);
    } else if (theme.id === 'medieval') {
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = color === 'w' ? '#d9dde5' : '#2d3546';
    } else if (theme.id === 'pirate') {
      ctx.fillStyle = color === 'w' ? '#ffd36d' : '#5b3600';
      ctx.shadowColor = 'rgba(255, 184, 51, 0.35)';
      ctx.shadowBlur = 10;
    } else if (theme.id === 'dragon') {
      ctx.fillStyle = color === 'w' ? '#bdffbf' : '#052909';
      ctx.shadowColor = '#6dff76';
      ctx.shadowBlur = 14;
    } else {
      ctx.fillStyle = color === 'w' ? '#f8fafc' : '#121928';
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 5;
    }

    if (theme.id !== 'cyber') ctx.strokeStyle = color === 'w' ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.4;
    ctx.strokeText(glyph, x, y + 2);
    ctx.fillText(glyph, x, y + 2);
    ctx.restore();
  }

  function getPieceGlyph(color, type) {
    const theme = PIECE_THEMES[state.save.settings.pieceTheme] || PIECE_THEMES.standard;
    return theme.icons[color][type];
  }

  function pointToSquare(x, y) {
    const cell = state.boardSize / 8;
    const col = Math.floor(x / cell);
    const row = Math.floor(y / cell);
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;
    return coordsToSquare(row, col);
  }

  function coordsToSquare(row, col) {
    return 'abcdefgh'[col] + String(8 - row);
  }

  function squareToCoords(square) {
    const col = 'abcdefgh'.indexOf(square[0]);
    const row = 8 - Number(square[1]);
    return { row, col };
  }

  function taunt(category, probability = 1) {
    if (Math.random() > probability) return;
    const line = pickTaunt(category);
    elements.banterLead.textContent = line;
    state.banter.unshift(line);
    state.banter = state.banter.slice(0, 8);
    elements.banterLog.innerHTML = state.banter.map(entry => `<div class="banter-entry">${escapeHtml(entry)}</div>`).join('');
    speak(line);
  }

  function pickTaunt(category) {
    const language = state.save.settings.languageMode;
    const list = TAUNTS[language][category] || ['I have thoughts. None of them are kind.'];
    const fresh = list.filter(line => !state.recentTaunts.includes(line));
    const pool = fresh.length ? fresh : list;
    const line = pool[Math.floor(Math.random() * pool.length)];
    state.recentTaunts.push(line);
    state.recentTaunts = state.recentTaunts.slice(-12);
    return line;
  }

  function fillTemplate(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
  }

  function loadVoices() {
    if (!state.voiceAvailable) return;
    state.voices = window.speechSynthesis.getVoices();
    const previous = state.save.settings.voiceName || 'auto';
    elements.voiceName.innerHTML = '<option value="auto">Auto-select best available</option>';
    state.voices
      .filter(voice => /^en([_-]|$)/i.test(voice.lang))
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voiceScore(voice) >= 80 ? '★ ' : ''}${voice.name} (${voice.lang})`;
        elements.voiceName.appendChild(option);
      });
    elements.voiceName.value = state.voices.some(voice => voice.name === previous) ? previous : 'auto';
  }

  function voiceScore(voice) {
    const name = voice.name.toLowerCase();
    const feminineNames = [
      'aria', 'jenny', 'zira', 'sonia', 'samantha', 'victoria', 'ava', 'emma', 'olivia',
      'serena', 'karen', 'moira', 'tessa', 'fiona', 'susan', 'hazel', 'libby', 'michelle',
      'joanna', 'salli', 'kimberly', 'ivy', 'amy', 'nicole', 'ruth', 'danielle', 'denise',
      'natasha', 'clara', 'veena', 'neera', 'female', 'google us english'
    ];
    const masculineNames = ['david', 'mark', 'guy', 'ryan', 'brian', 'joey', 'matthew', 'justin', 'male'];
    const feminine = feminineNames.reduce((score, candidate, index) => score + (name.includes(candidate) ? 200 - index : 0), 0);
    const masculine = masculineNames.some(candidate => name.includes(candidate)) ? 500 : 0;
    return feminine - masculine + (/natural|neural|online/i.test(voice.name) ? 35 : 0) + (voice.localService ? 2 : 0);
  }

  function chooseVoice() {
    const requested = state.save.settings.voiceName;
    if (requested && requested !== 'auto') {
      const exact = state.voices.find(voice => voice.name === requested);
      if (exact) return exact;
    }
    return state.voices
      .filter(voice => /^en([_-]|$)/i.test(voice.lang))
      .map(voice => ({ voice, score: voiceScore(voice) }))
      .sort((a, b) => b.score - a.score)[0]?.voice || state.voices[0];
  }

  function speak(text, force = false, attempt = 0) {
    if (!state.voiceAvailable || (!force && !state.save.settings.voiceEnabled)) return;
    try {
      if (!state.voices.length && attempt < 8) {
        loadVoices();
        window.setTimeout(() => speak(text, force, attempt + 1), 150);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const profiles = {
        sultry: { rate: 0.80, pitch: 1.14 },
        confident: { rate: 1, pitch: 1 },
        vicious: { rate: 1.13, pitch: 1.03 }
      };
      const profile = profiles[state.save.settings.voiceProfile] || profiles.sultry;
      const voice = chooseVoice();
      utterance.voice = voice || null;
      utterance.lang = voice?.lang || 'en-US';
      utterance.rate = Math.max(0.6, Math.min(1.6, state.save.settings.voiceRate * profile.rate));
      utterance.volume = state.save.settings.voiceVolume;
      utterance.pitch = Math.max(0.7, Math.min(1.5, state.save.settings.voicePitch * profile.pitch));
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech failed.', error);
    }
  }

  function updateGlobalMuteLabel() {
    elements.globalMuteBtn.textContent = state.save.settings.voiceEnabled ? '🔊 Voice' : '🔇 Voice';
  }

  function toast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = window.setTimeout(() => elements.toast.classList.add('hidden'), 2400);
  }

  function handleMenuKeyboard(event) {
    if (event.target.matches('input, select, textarea')) {
      if (event.key === 'Escape') {
        event.preventDefault();
        hidePromotionChoices();
        hideGameOver();
        if (state.screen !== 'menu') switchScreen('menu');
      }
      return;
    }

    if (event.key === 'Escape') {
      hidePromotionChoices();
      if (!elements.gameOverModal.classList.contains('hidden')) hideGameOver();
      if (state.screen !== 'menu') switchScreen('menu');
      return;
    }

    const activeScreen = elements.screens[state.screen];
    if (!activeScreen) return;
    const targets = Array.from(activeScreen.querySelectorAll('button, select, input[type="range"], input[type="checkbox"]')).filter(el => !el.disabled && el.offsetParent !== null);
    if (!targets.length) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      state.menuFocusIndex = (state.menuFocusIndex + 1) % targets.length;
      targets[state.menuFocusIndex].focus();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      state.menuFocusIndex = (state.menuFocusIndex - 1 + targets.length) % targets.length;
      targets[state.menuFocusIndex].focus();
    } else if (event.key === 'Enter' && document.activeElement && document.activeElement.tagName === 'BUTTON') {
      document.activeElement.click();
    }
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
