/* August — AUX mixes + Events
   Shared catalog for the last card, mix.html, event.html, and the
   archive listings. Port note: this becomes two Shopify blogs. */
(() => {
  const ART_BY_NO = {
    "060": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_060_PLAYLIST_COVER_1024x1024.png?v=1678650416",
    "058": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_058_PLAYLIST_COVER_1024x1024.png?v=1675083380",
    "056": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_056_PLAYLIST_COVER_1024x1024.jpg?v=1672425632",
    "055": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_055_PLAYLIST_COVER_1024x1024.png?v=1670467940",
    "052": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_052_SC_COVER_1024x1024.png?v=1666927960",
    "051": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_051_PLAYLIST_COVER_1024x1024.png?v=1666926095",
    "050": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_050_PLAYLIST_COVER_1024x1024.jpg?v=1664029953",
    "049": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_049_PLAYLIST_COVER_1024x1024.jpg?v=1663086818",
    "048": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_048_PLAYLIST_COVER_1024x1024.png?v=1660420109",
    "046": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_046_PLAYLIST_COVER_1024x1024.jpg?v=1657301147",
    "045": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_045_PLAYLIST_COVER_1024x1024.jpg?v=1655590105",
    "044": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_044_PLAYLIST_COVER_1024x1024.jpg?v=1654461535",
    "043": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_043_PLAYLIST_COVER_1024x1024.jpg?v=1654149933",
    "042": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_042_PLAYLIST_COVER_1024x1024.jpg?v=1649774525",
    "041": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_041_PLAYLIST_COVER_1024x1024.jpg?v=1649460194",
    "040": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_040_PLAYLIST_COVER_1024x1024.jpg?v=1648600057",
    "039": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_039_PLAYLIST_COVER_1024x1024.jpg?v=1648600138",
    "038": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_038_SPOTIFY_COVER_1024x1024.jpg?v=1655571985",
    "036": "https://cdn.shopify.com/s/files/1/2729/9188/files/August_Aux_036_spotify_cover_1024x1024.jpg?v=1655572117",
  };
  const ART_POOL = Object.values(ART_BY_NO);

  const KNOWN = {
    78: ["Madison After Hours", "House", "A late-night house session from the shop floor after State Street goes quiet. Recorded for August Aux."],
    77: ["State Street Mix", "Garage", "UK garage and broken beats picked for a walk down State Street. Guest cuts from the Aux staff."],
    76: ["Late Light", "Ambient", "Soft-focus ambient and dub recorded after close — the lights dimmed, the speakers left on."],
    75: ["DJ Azza Mix", "House", "DJ Azza in the booth: classic house, a little disco, and the kind of swing that fills the window."],
    63: ["“Access Granted” — Live from the Shop", "Garage/House", "Live from August. Garage and house cut on the shop floor for anyone who walked in."],
    62: ["“Mixcult Radio” by Kirill Matveev", "Minimal/Dub", "Kirill Matveev for Mixcult Radio — stripped-back minimal and dubbed-out space."],
    61: ["“Vinyl Bedroom Session” by Ido Haber", "House", "Ido Haber at home with a crate of house 12s. Warm, unhurried, recorded to tape."],
    60: ["“TR-909 G-House Tribute” by Samuel Wallner", "House", "Samuel Wallner pays tribute to the 909 — G-house drums, low-end, and a night that stays on the floor."],
    59: ["“Nachtstrom Schallplatten Showcase” by October Rust", "Dark/Techno", "October Rust for Nachtstrom Schallplatten. Dark techno, long blends, no shortcuts."],
    58: ["“Pharoah Sanders Tribute” by Rob Lewis", "Jazz/Blues", "Rob Lewis in memory of Pharoah Sanders — jazz, blues, and spiritual fire."],
    57: ["“Live at the Weary Traveler” by Samuel Wallner", "House", "Samuel Wallner live at the Weary Traveler. Percussion-heavy house for a packed room."],
    56: ["“Brain Dead Mix” by Kyle Ng", "Dub/Alt", "Kyle Ng of Brain Dead — dub, leftfield, and the kind of selection you only get from a friend of the shop."],
  };

  const NAMES = [
    "Shop Floor Session", "Guest Mix", "Vinyl Hour", "Closing Shift",
    "Warehouse Tape", "Staff Picks", "After Close", "Open Deck Night",
    "Basement Broadcast", "Corner Store Cuts", "Slow Rotation",
  ];
  const GENRES = [
    "House", "Techno", "Disco", "Ambient", "Garage",
    "Dub", "Jazz", "Electro", "Breaks",
  ];
  const STAND_INS = [
    "assets/radio-vol-14.wav",
    "assets/radio-vol-15.wav",
    "assets/radio-vol-16.wav",
  ];

  const artFor = (no, i) => ART_BY_NO[no] || ART_POOL[i % ART_POOL.length];

  const MIXES = [];
  for (let n = 78, i = 0; n >= 16; n--, i++) {
    const known = KNOWN[n];
    const no = String(n).padStart(3, "0");
    const name = known ? known[0] : NAMES[n % NAMES.length];
    const genre = known ? known[1] : GENRES[n % GENRES.length];
    const body = known
      ? known[2]
      : `${name} — a ${genre.toLowerCase()} session for August Aux :: ${no}. Recorded for the archive and the shop floor at 414 State Street.`;
    MIXES.push({
      no,
      name,
      genre,
      art: artFor(no, i),
      src: STAND_INS[i % STAND_INS.length],
      body,
    });
  }

  const EVENTS = [
    {
      id: "aux-09",
      series: "AUX",
      date: "Oct 12, 2024",
      title: "AUGUST AUX :: AUXILIARY 09 JEAN LE DUKE, SAMUEL WALLNER",
      excerpt: "August Aux @ The Side Door. Trap, Footwork, and Juke with Sam Wallner and Jean Le Duke.",
      venue: "The Side Door, Madison",
      body: [
        "August Aux @ The Side Door.",
        "Join us for a genre-blending night of Trap, Footwork, and Juke featuring local DJs Sam Wallner and Jean Le Duke.",
      ],
    },
    {
      id: "aac-010",
      series: "Art Collective",
      date: "Jun 1, 2024",
      title: "AUGUST ART COLLECTIVE :: 010 CHRIS MALCHOW",
      excerpt: "Photographer and artist from Madison, WI. Work on display during June 2024.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "Chris Malchow is a photographer and artist born and raised in Madison, WI. Through his early years of skateboarding he was drawn towards the arts and went on to pursue a degree in graphic design. It’s here that he truly developed an eye for composition, color and curation.",
        "Shortly after graduating Chris picked up a camera as a way to incorporate his own photos into the designs he was doing. Though quickly he fell in love with photography and capturing life and the simple everyday moments. Now as a full time freelance photographer he’s hoping to continue to grow as an artist and evolve his work.",
        "These photos are some of his favorites and an overall entry point into the artful world of @thecolorfulkid. Chris's art was on display during June of 2024.",
      ],
    },
    {
      id: "aac-009",
      series: "Art Collective",
      date: "May 1, 2024",
      title: "AUGUST ART COLLECTIVE :: 009 BENETT HOLGERSON",
      excerpt: "Filmmaker and painter from Madison. Work on display during May 2024.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "Benett Holgerson is a filmmaker and painter from Madison, Wisconsin. He received his BFA at the Maryland Institute College of Art (MICA) in 2020.",
        "Utilizing intuitive mark-making and combining various mediums, his work explores the unique and complex pathways our brains form to experience and map the temporal world around and inside of us.",
        "Benett's art was on display during the month of May 2024.",
      ],
    },
    {
      id: "aac-008",
      series: "Art Collective",
      date: "Apr 1, 2024",
      title: "AUGUST ART COLLECTIVE :: 008 MABEL THADEN",
      excerpt: "Ceramics under the name Germ — sculptural pieces and functional wares.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "Mabel Thaden produces ceramics under the name of Germ. Her pieces are explorations into technique and craft of a timeless material. She produces sculptural pieces as well as functional wares for daily use of practice in art.",
        "Mabel's art was on display during the month of April 2024.",
      ],
    },
    {
      id: "aac-007",
      series: "Art Collective",
      date: "Mar 1, 2024",
      title: "AUGUST ART COLLECTIVE: 007 KATE WEBER",
      excerpt: "Local potter from Madison focusing on shape, closed forms, and the clay body.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "Kate Weber, a local potter from Madison, WI, specializes in creating functional and non-functional pieces, focusing on shape and closed forms. Weber's pottery stands out for its hand-thrown craftsmanship, often with reduced or no glaze application, allowing the clay body to speak for itself.",
        "Kate's work was displayed during the month of March 2024.",
      ],
    },
    {
      id: "aac-006",
      series: "Art Collective",
      date: "Feb 15, 2024",
      title: "AUGUST ART COLLECTIVE :: 006 MT KOSOBUCKI",
      excerpt: "Documentary photographer working in sport and music. Displayed February 2024.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "MT Kosobucki is a documentary minded American photographer and photojournalist working primarily in the realm of sport and music. Kosobucki is currently pursuing both short and long term projects with inspirations ranging from personal experiences to cultural and environmental themes.",
        "MT Kosobucki's work was on display during the month of February, 2024.",
      ],
    },
    {
      id: "aac-005",
      series: "Art Collective",
      date: "Dec 1, 2023",
      title: "AUGUST ART COLLECTIVE :: 005 LEXIE OLSON",
      excerpt: "Multidisciplinary work at the crossroads of fiction and reality.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "Lexie Olson is a multidisciplinary artist who does not live in the real world. Her creative expression unfolds at the crossroads of fiction and reality, giving rise to characters that embody a unique synthesis of these disparate realms.",
        "Within this pixilated landscape, she embarks on a quest to explore the nuanced interplay of felinity as performance of life and myth. Lexie's art was displayed in the month of December, 2023.",
      ],
    },
    {
      id: "aux-08",
      series: "AUX",
      date: "Aug 27, 2022",
      title: "AUGUST AUX :: AUXILIARY 08 SAMUEL WALLNER",
      excerpt: "First Auxiliary set outside the shop — Lisa Link Peace Park on State Street.",
      venue: "Lisa Link Peace Park, State Street",
      body: [
        "August 27 marked the first time we hosted an Auxiliary event outside of the confines of the store. Our Aux coordinator Samuel Wallner carried the set up just down the block to Lisa Link Peace Park before getting on the 1's and 2's for an hour of outdoor sounds for the enjoyment of our State Street community.",
      ],
    },
    {
      id: "aux-07",
      series: "AUX",
      date: "Jun 18, 2022",
      title: "AUGUST AUX :: AUXILIARY 07 CLANDESTINE CHEMISTRY, KTP, FTBK",
      excerpt: "Three half-hour sets back to back: Clandestine Chemistry, KTP, and FTBK.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "Almost a year to the day after the inaugural August Aux :: Auxiliary set that marked the return of live music to August, the shop played host to the most ambitious live Auxiliary set. The 3-artist showcase saw Clandestine Chemistry, KTP, and FTBK go back to back to back for 3 half-hour sets in a row.",
      ],
    },
    {
      id: "aux-06",
      series: "AUX",
      date: "Apr 22, 2022",
      title: "AUGUST AUX :: AUXILIARY 06 SAMUEL WALLNER",
      excerpt: "Resident DJ Sam Wallner back on the live stage — tech and disco-house.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "April 22nd saw the return of August's resident DJ, Sam Wallner back to the live stage, treating customers to an hour and a half set of percussion-heavy tunes flavored with tech and disco-house influences.",
        "That day was a little rainy but we went ahead and had an intimate session nonetheless. Now, the mix is available for those who weren't able to make it.",
      ],
    },
    {
      id: "aux-05",
      series: "AUX",
      date: "Oct 23, 2021",
      title: "AUGUST AUX :: AUXILIARY 005 DJ YUPPIE",
      excerpt: "Local radio personality DJ Yuppie — an eclectic subterranean set.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "Saturday, October 23, local radio personality and underground mixmaster, Shelby, also known as DJ Yuppie blessed the crowd with an eclectic subterranean set that will be hard to match. Yuppie packed the floor with friends and newcomers alike.",
      ],
    },
    {
      id: "aux-04",
      series: "AUX",
      date: "Sep 18, 2021",
      title: "AUGUST AUX :: AUXILIARY 004 GODLY THE RULER",
      excerpt: "First live performance since the start of the pandemic.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "On Saturday, September 18, we welcomed back the first actual live performance since the beginning of the pandemic. With Godly the Ruler overcoming technical difficulties to perform a live set to the biggest crowd we've seen since 2019.",
      ],
    },
    {
      id: "aux-03",
      series: "AUX",
      date: "Aug 21, 2021",
      title: "AUGUST AUX :: AUXILIARY 003 SAMUEL WALLNER",
      excerpt: "Samuel Wallner back in the window for a live Auxiliary set.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "Last Saturday, August 21, our resident music guy and de facto DJ, the main guy behind August Aux, Samuel Wallner, stepped out from behind the curtain and into the window once again for a live Auxiliary set.",
        "It had been over 3 years — still in the early days of August — that Sam pioneered the DJ-in-the-window set-up which we have employed for all of our live events since starting back up earlier this year.",
      ],
    },
    {
      id: "homegrown-fake",
      series: "Homegrown",
      date: "Aug 13, 2021",
      title: "AUGUST HOMEGROWN :: FAKE CLOTHING POP-UP",
      excerpt: "Exclusive Fake Clothing pop-up with Cult House Sound.",
      venue: "August, 414 State St., Madison, WI",
      image: "https://cdn.shopify.com/s/files/1/2729/9188/files/7_d20c24b4-7783-4bd1-a535-6fbfd5f1c587.jpg?v=1630186657",
      body: [
        "On Friday, August 13th, August was proud to host an exclusive pop-up for Fake Clothing. Since Alex was born on a Friday the 13th, it was the perfect date to do a pop-up for his brand.",
        "While some may associate Friday the 13th with bad luck, Alex has the opposite outlook. The event was a smashing success, aided by some spectacular tunes spun by Cult House Sound, and some cold ones from Madison's Happiest Corner.",
      ],
    },
    {
      id: "aux-02",
      series: "AUX",
      date: "Jun 24, 2021",
      title: "AUGUST AUX :: AUXILIARY 002 BRIGHTVIOLET B2B BAKER",
      excerpt: "brightviolet+baker — lush garage, soulful house, and deep techno.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "We were delayed by a week due to the Maxwell Street Days craziness, but this weekend we hosted our second Auxiliary DJ set. Sam Molinaro and Andrew Baker, as brightviolet+baker, going back and forth track by track, playing off each other all set.",
        "The two played a b2b set from 6:30 – 8:00PM full of lush garage, soulful house, and deep cut melodic techno.",
      ],
    },
    {
      id: "aux-01",
      series: "AUX",
      date: "Jun 19, 2021",
      title: "AUGUST AUX :: AUXILIARY 001 UNNOUN",
      excerpt: "Live music returns to August — Max Arneson (unnoun), 1.5 hours.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "Live music and events have been incredibly important to us since day 1. Beyond fashion, the Madison culture scene including music, art, and learning have all provided ways for us to connect with our community.",
        "On June 19th 2021, we welcomed back live music to August, in the form of a 1.5 hour live DJ set by our friend Max Arneson (unnoun). This was the first of a monthly series, titled Auxiliary, where on the 3rd Saturday of every month we have a live set from one of the DJs in our community.",
      ],
    },
    {
      id: "aac-004",
      series: "Art Collective",
      date: "Jan 16, 2021",
      title: "AUGUST ART COLLECTIVE :: 004 “PAIN & ITCH” BY XIAOYUE PU",
      excerpt: "Vogue Italia featured photographer Xiaoyue Pu — PAIN AND ITCH.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "August Art Collective : 004 returns this January with Vogue Italia featured gallery artist and photographer Xiaoyue Pu’s PAIN AND ITCH. The term Tòng Yǎng (痛痒) literally means the sensational feeling of pain and itch in Chinese but often is used to refer sufferings, difficulty, importance and consequence in broader contexts.",
        "In this performative photo project, Pu traced the origin of connection and separation in her life back to her mother’s womb in an attempt to understand conflicted emotions in interpersonal relationships.",
        "Installation available for viewing and purchase from 01.16.21 – 01.29.21. Artist meet & greet Saturday 01.16.2021 from 12pm – 3pm.",
      ],
    },
    {
      id: "aac-003",
      series: "Art Collective",
      date: "Sep 18, 2020",
      title: "AUGUST ART COLLECTIVE :: 003 BY TERRENCE “PEELD” ADEYANJU",
      excerpt: "Two-month gallery installation — PEELD by Terrence Adeyanju.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "August Art Collective is back with the return of Madison artist Terrence Adeyanju. August Art Collective :: 003 is a two month gallery installation available for viewing and purchase at August during September and October, 2020.",
        "\"PEELD\" is an archive of visual footnotes from Adeyanju. His works reference the human experience, self empowerment, and the unseen through bold, colorful, and imaginative imagery.",
        "Artist meet & greet Friday 09.18.2020 from 6:30 – 8pm. PEELD and August released the limited run \"INSIGHT WE TRUST\" ivory t-shirt; 100% of sale proceeds from the meet and greet were donated to Freedom Inc.",
      ],
    },
    {
      id: "e1t1-baldwin",
      series: "Each One, Teach One",
      date: "Jul 3, 2020",
      title: "EACH ONE, TEACH ONE :: James Baldwin “The Fire Next Time”",
      excerpt: "Book swap centered on Baldwin's The Fire Next Time.",
      venue: "August, 414 State St., Madison, WI",
      body: [
        "August's EACH ONE, TEACH ONE book swap is back, with a renewed goal of sharing uplifting and discussion driving literature in our August family community.",
        "This initiative is simple; you pick up the featured book at August, and you drop off a book to share with others.",
        "Our initial book feature is James Baldwin's iconic essay series The Fire Next Time — two essays on the central role of race in American history, and the relations between race and religion.",
      ],
    },
  ];

  const mixByNo = (no) => MIXES.find((m) => m.no === String(no).padStart(3, "0"));
  const eventById = (id) => EVENTS.find((e) => e.id === id);

  const relatedMixes = (mix, n = 6) => {
    const idx = MIXES.findIndex((m) => m.no === mix.no);
    if (idx === -1) return MIXES.slice(0, n);
    const out = [];
    for (let i = 1; i <= MIXES.length && out.length < n; i++) {
      out.push(MIXES[(idx + i) % MIXES.length]);
    }
    return out;
  };

  const relatedEvents = (ev, n = 4) => {
    const idx = EVENTS.findIndex((e) => e.id === ev.id);
    if (idx === -1) return EVENTS.slice(0, n);
    const out = [];
    for (let i = 1; i <= EVENTS.length && out.length < n; i++) {
      out.push(EVENTS[(idx + i) % EVENTS.length]);
    }
    return out;
  };

  window.AugustAux = {
    MIXES,
    EVENTS,
    artFor,
    mixByNo,
    eventById,
    relatedMixes,
    relatedEvents,
  };
})();
