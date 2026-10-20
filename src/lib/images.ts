/**
 * Curated photography from Unsplash. Every <Photo /> has a designed fallback,
 * so if an image can't load the layout still looks intentional.
 */
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const img = {
  heroFriends: u("1529156069898-49953e39b3ac", 2000),
  gathering: u("1511632765486-a01980e01a18"),
  dinner: u("1528605248644-14dd04022da1"),
  coffeeCup: u("1495474472287-4d71bcdd2085"),
  latte: u("1509042239860-f550ce710b93"),
  cafe: u("1501339847302-ac426a4a7cbb"),
  music: u("1501281668745-f7f57925c3b4"),
  venue: u("1519167758481-83f550bb49b3"),
  openBook: u("1504052434569-70ad5836ab65"),
  reading: u("1456513080510-7bf3a84b82f8"),
  studyTable: u("1522202176988-66273c2fd55f"),
  conversation: u("1517048676732-d65bc937f952"),
  handshake: u("1521791136064-7986c2920216"),
  volunteers: u("1559027615-cd4628902d4a"),
  helping: u("1593113598332-cd288d649433"),
  hike: u("1551632811-561732d1e306"),
  sunrise: u("1470252649378-9c29740c9fa8"),
  forest: u("1441974231531-c6227db76b6e"),
  family: u("1511895426328-dc8714191300"),
  kids: u("1503454537195-1dcabb73ffb9"),
  kidsPlay: u("1484820540004-14229fe36ca4"),
  laughing: u("1543269865-cbf427effbad"),
  officeWarm: u("1497366811353-6870744d04b2"),
};

const p = (id: string) => u(id, 400);

export const portraits = {
  jamie: p("1531123897727-8f129e1688ce"),
  daniel: p("1500648767791-00dcc994a43e"),
  grace: p("1580489944761-15a19d654956"),
  marcus: p("1507003211169-0a1dd7228f2d"),
  priya: p("1544005313-94ddf0286df2"),
  ellie: p("1494790108377-be9c29b29330"),
  tom: p("1472099645785-5658abf4ff4e"),
  nora: p("1438761681033-6461ffad8d80"),
  sam: p("1506794778202-cad84cf45f1d"),
  v1: p("1534528741775-53994a69daeb"),
  v2: p("1539571696357-5a69c17a67c6"),
  v3: p("1517841905240-472988babdf9"),
  v4: p("1552058544-f2b08422138a"),
  v5: p("1599566150163-29194dcaad36"),
};
