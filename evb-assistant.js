/**
 * East Village Buyers — Free keyword-based site assistant
 * No API required. All answers hand-written from site content.
 * Covers: gold, silver, diamonds, jewelry, watches, designer, sneakers,
 *         streetwear, vintage, process, payment, hours, location, ID, appraisal.
 */
(function () {
  'use strict';

  // ── Contact constants ─────────────────────────────────────────────────────
  const PHONE     = '917-608-8939';
  const ADDRESS   = '39 Avenue A, New York, NY 10009';
  const HOURS     = 'Sun–Thu 12:30–6:30 · Fri 12:30–6 · Sat Closed';
  const PHONE_URL = 'tel:9176088939';
  const SMS_URL   = 'sms:9176088939';

  const STOP = new Set('a an the and or but in on at to for of is are was were be been have has had do does did will would can could should may might i me my we you your our they them it its this that with from as by'.split(' '));

  function normalize(text) {
    return (text || '').toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // ── Suggestion chips ──────────────────────────────────────────────────────
  const SUGGESTIONS = [
    'Do you buy gold?',
    'How do I sell here?',
    'What do I need to bring?',
    'Is the appraisal free?',
    'What are your hours?',
    'Where are you located?',
  ];

  /** Guaranteed answers for suggestion chips + common phrasings */
  const CHIP_ANSWERS = (() => {
    const map = Object.create(null);
    const add = (phrases, html) => {
      phrases.forEach((p) => {
        map[normalize(p)] = html;
      });
    };
    add(
      ['Do you buy gold?', 'Do you buy gold', 'buy gold'],
      `<p><strong>Yes — we buy gold every day.</strong> 10K, 14K, 18K, 22K, and 24K rings, chains, bracelets, broken scrap, and coins. We test and weigh in front of you and pay based on live spot prices. Walk in or text <a href="${SMS_URL}">${PHONE}</a>.</p>`
    );
    add(
      ['How do I sell here?', 'How do I sell', 'How does selling work', 'how to sell'],
      `<p><strong>Just walk in</strong> with your item during store hours — no appointment.</p>
<ol style="padding-left:1.2em;margin:.5em 0">
<li>We examine and authenticate your item</li>
<li>We give you a cash offer on the spot</li>
<li>Say yes → quick ID check (NYC law) → same-day payment</li>
<li>Say no → leave with your item, no fee</li>
</ol>
<p>Most visits take 15–30 minutes. ${ADDRESS}</p>`
    );
    add(
      ['What do I need to bring?', 'What should I bring', 'What do I need'],
      `<p><strong>Bring a valid government-issued photo ID</strong> (driver's license, passport, or state ID) — required by NYC law.</p>
<p>Helpful extras: GIA certs for diamonds, box/papers for watches, receipt for designer bags, original box for sneakers. None of those are required — bring what you have.</p>`
    );
    add(
      ['Is the appraisal free?', 'Is appraisal free', 'free appraisal'],
      `<p><strong>Yes — 100% free, no obligation.</strong> We test, weigh, and give you a real offer on the spot. If you decline, you walk out with your item at no charge.</p>`
    );
    add(
      ['What are your hours?', 'Store hours', 'What are your hours', 'when are you open'],
      `<p><strong>Hours:</strong> Sunday–Thursday 12:30–6:30 · Friday 12:30–6 · Saturday closed.</p>
<p>Walk-ins welcome — no appointment. Text <a href="${SMS_URL}">${PHONE}</a> before a long trip if you want to confirm we're open.</p>`
    );
    add(
      ['Where are you located?', 'Where are you', 'your address', 'store location'],
      `<p><strong>${ADDRESS}</strong> — East Village, between 2nd and 3rd.</p>
<p>Subway: L to 1st Ave or 6 to Astor Place. Walk-ins welcome.</p>`
    );
    return map;
  })();

  // ── Knowledge base: each entry has keywords[] and a reply ────────────────
  // Keywords are matched against the lowercased user message.
  // First entry whose keywords ALL match (or score highest) wins.
  // Format: { keywords: [], reply: 'HTML string', score bonus: used internally }

  const KB = [

    // ── GREETINGS ────────────────────────────────────────────────────────────
    {
      id: 'greeting',
      keywords: [['hi','hey','hello','howdy','what\'s up','whats up','yo','hiya']],
      matchAny: true,
      reply: `<p>Hey! Welcome to East Village Buyers. Ask me anything about what we buy, how the process works, our hours — whatever you need. I'm here to help.</p>`
    },
    {
      id: 'thanks',
      keywords: [['thank','thanks','appreciate','helpful']],
      matchAny: true,
      reply: `<p>Of course! If you have more questions or want to get a quote, just walk in or text us at <a href="${SMS_URL}">${PHONE}</a>. We're here to help.</p>`
    },

    // ── HOURS & LOCATION ─────────────────────────────────────────────────────
    {
      id: 'hours',
      keywords: [['what are your hours','store hours','hours','hour','open','close','closing','when','time','schedule','sunday','monday','tuesday','wednesday','thursday','friday','saturday','weekend']],
      matchAny: true,
      reply: `<p><strong>Store Hours:</strong><br>
Sunday–Thursday: 12:30 PM – 6:30 PM<br>
Friday: 12:30 PM – 6:00 PM<br>
Saturday: <strong>Closed</strong></p>
<p>No appointment needed — just walk in during those hours. If you're making a special trip, feel free to text us first at <a href="${SMS_URL}">${PHONE}</a> to make sure we're open.</p>`
    },
    {
      id: 'location',
      keywords: [['where','location','located','address','avenue a','east village','directions','subway','train','transit','get to','find','map','parking']],
      matchAny: true,
      reply: `<p><strong>We're at:</strong> 39 Avenue A, New York, NY 10009 — right in the heart of the East Village.</p>
<p><strong>Subway:</strong> L train to 1st Ave, or 6 train to Astor Place. The M14 bus also runs on Avenue A.</p>
<p>Street parking is limited — subway or rideshare is easiest. Walk-ins always welcome!</p>`
    },

    // ── APPOINTMENT / WALK-IN ────────────────────────────────────────────────
    {
      id: 'appointment',
      keywords: [['appointment','walk in','walk-in','drop in','drop by','just show up','need to call']],
      matchAny: true,
      reply: `<p>No appointment needed! Walk-ins are welcome any time during store hours.</p>
<p>If you have a large estate collection or want to make sure we're ready for you, it helps to text photos to <a href="${SMS_URL}">${PHONE}</a> ahead of time — but it's totally not required.</p>`
    },

    // ── APPRAISAL / COST / FEE ───────────────────────────────────────────────
    {
      id: 'appraisal',
      keywords: [['is the appraisal free','free appraisal','appraisal','appraise','evaluation','evaluate','cost','fee','charge','free','obligation','no pressure']],
      matchAny: true,
      reply: `<p><strong>100% free — no strings attached.</strong></p>
<p>We test, weigh, and give you a real offer on the spot. You're never obligated to sell. If you don't like the number, you walk out with your stuff — no charge, no hard feelings. We only get paid when you say yes.</p>`
    },

    // ── HOW TO SELL / PROCESS ────────────────────────────────────────────────
    {
      id: 'how-to-sell',
      keywords: [['how do i sell','how to sell','sell here','how','sell','process','work','steps','what happens','procedure','selling','do i sell','start','begin','first time','visit']],
      matchAny: true,
      reply: `<p><strong>Here's how selling works:</strong></p>
<ol style="padding-left:1.2em;margin:.5em 0">
<li>Walk in with your item — no appointment needed</li>
<li>Our buyer examines it: tests metal purity, checks authenticity, reviews condition</li>
<li>We give you a real offer based on live market rates — right there at the counter</li>
<li>If you accept, we complete a quick ID check (required by NYC law) and pay you same day</li>
<li>If you decline, you leave with your item — no charge, no pressure</li>
</ol>
<p>Most visits take 15–30 minutes. You can also text photos to <a href="${SMS_URL}">${PHONE}</a> first for a rough idea before coming in.</p>`
    },

    // ── WHAT DO I NEED / ID ──────────────────────────────────────────────────
    {
      id: 'what-to-bring',
      keywords: [['what do i need','what to bring','need to bring','need','bring','id','identification','photo id','driver','passport','requirements','require','documents']],
      matchAny: true,
      reply: `<p><strong>Bring a valid government-issued photo ID</strong> — driver's license, passport, or state ID. This is required by New York City law for all buy/sell transactions.</p>
<p>For specific items, these extras help but aren't required:</p>
<ul style="padding-left:1.2em;margin:.5em 0">
<li><strong>Jewelry/Gold:</strong> any receipts or GIA certificates</li>
<li><strong>Watches:</strong> original box, papers, and service records</li>
<li><strong>Designer bags:</strong> dust bag, box, original receipt</li>
<li><strong>Sneakers:</strong> original box</li>
</ul>
<p>Don't have extras? No problem — we evaluate plenty of items without them.</p>`
    },

    // ── PAYMENT ──────────────────────────────────────────────────────────────
    {
      id: 'payment',
      keywords: [['pay','paid','payment','cash','check','how much','get money','payout','same day','instant']],
      matchAny: true,
      reply: `<p><strong>Same-day payment</strong> — most people walk out with cash in hand the same visit.</p>
<p>We offer cash for most transactions. For larger purchases, a check is also available. You'll know the exact offer before committing to anything — no surprises at the register.</p>`
    },

    // ── GOLD ─────────────────────────────────────────────────────────────────
    {
      id: 'gold',
      keywords: [['gold','do you buy gold','buy gold','10k','14k','18k','24k','karat','yellow gold','white gold','rose gold','gold chain','gold ring','gold bracelet','gold necklace']],
      matchAny: true,
      reply: `<p><strong>Yes, we buy gold every day.</strong></p>
<p>We purchase all karat weights — 10K, 14K, 18K, 22K, 24K — in any form:</p>
<ul style="padding-left:1.2em;margin:.5em 0">
<li>Rings, chains, bracelets, earrings, necklaces</li>
<li>Broken or damaged pieces — scrap gold is welcome</li>
<li>Gold coins and bullion</li>
<li>Gold watches and gold-case jewelry</li>
</ul>
<p>We weigh and test everything right in front of you. Offers are based on live spot prices — transparent, no guessing games. Walk in or text photos to <a href="${SMS_URL}">${PHONE}</a>.</p>`
    },

    // ── SILVER ───────────────────────────────────────────────────────────────
    {
      id: 'silver',
      keywords: [['silver','sterling','925','silver flatware','silverware','silver coin','silver bar','silver jewelry']],
      matchAny: true,
      reply: `<p><strong>Yes, we buy silver.</strong></p>
<p>We purchase sterling silver (925), fine silver, and silver-plated items (where value is there), including:</p>
<ul style="padding-left:1.2em;margin:.5em 0">
<li>Sterling flatware and serving sets</li>
<li>Silver jewelry — rings, chains, bracelets</li>
<li>Silver coins and rounds</li>
<li>Silver bars and bullion</li>
</ul>
<p>Bring it in — we'll test and weigh it on the spot at no charge.</p>`
    },

    // ── PLATINUM ─────────────────────────────────────────────────────────────
    {
      id: 'platinum',
      keywords: [['platinum','plat','pt950','pt900']],
      matchAny: true,
      reply: `<p><strong>Yes, we buy platinum.</strong></p>
<p>Platinum rings, settings, and estate jewelry are all welcome. We test purity right in front of you and offer based on current platinum spot prices. Walk in any time.</p>`
    },

    // ── DIAMONDS ─────────────────────────────────────────────────────────────
    {
      id: 'diamonds',
      keywords: [['diamond','diamonds','gia','engagement ring','gemstone','stone','sapphire','ruby','emerald','moissanite']],
      matchAny: true,
      reply: `<p><strong>Yes, we buy diamonds and colored gemstones.</strong></p>
<p>We evaluate diamonds for cut, clarity, color, and carat weight. GIA certificates help us move faster and can increase the offer, but we can evaluate without them too.</p>
<p>We also buy sapphires, rubies, emeralds, and other fine gemstones in quality settings. Loose stones and mounted pieces both welcome.</p>
<p>Note: We do not buy moissanite or lab-grown stones as precious gems.</p>`
    },

    // ── JEWELRY (GENERAL) ────────────────────────────────────────────────────
    {
      id: 'jewelry',
      keywords: [['jewelry','jewellery','jewel','ring','necklace','bracelet','earring','pendant','chain','pearl','pearls','cameo','turquoise','estate jewelry','vintage jewelry','broken jewelry','scrap']],
      matchAny: true,
      reply: `<p><strong>We buy all kinds of jewelry</strong> — fine, estate, vintage, and even broken pieces.</p>
<ul style="padding-left:1.2em;margin:.5em 0">
<li>Gold, silver, platinum, and diamond jewelry</li>
<li>Estate and vintage signed pieces</li>
<li>Broken chains, single earrings, scrap gold</li>
<li>Cartier, Tiffany, David Yurman, and other name brands</li>
<li>Sterling flatware and silverware sets</li>
</ul>
<p>Everything is evaluated free with no obligation to sell. Walk in or text photos to <a href="${SMS_URL}">${PHONE}</a> first.</p>`
    },

    // ── WATCHES ──────────────────────────────────────────────────────────────
    {
      id: 'watches',
      keywords: [['watch','watches','rolex','omega','cartier','patek','audemars','tudor','breitling','tag heuer','panerai','iwc','seiko','g-shock','timepiece','wristwatch']],
      matchAny: true,
      reply: `<p><strong>We buy luxury, vintage, and select sport watches every day.</strong></p>
<p><strong>Brands we regularly buy:</strong></p>
<ul style="padding-left:1.2em;margin:.5em 0">
<li>Rolex — Submariner, Daytona, Datejust, GMT, Explorer</li>
<li>Omega, Tudor, Breitling, TAG Heuer</li>
<li>Cartier, Panerai, IWC, Jaeger-LeCoultre</li>
<li>Patek Philippe, Audemars Piguet (by appointment for those)</li>
<li>Vintage mechanical & automatic watches</li>
<li>Select G-Shock, Seiko, and Citizen models</li>
</ul>
<p>Box and papers add value but aren't required. We verify serial numbers and inspect the movement. Text photos to <a href="${SMS_URL}">${PHONE}</a> for a quick preliminary idea, or just walk in.</p>`
    },

    // ── DESIGNER HANDBAGS ────────────────────────────────────────────────────
    {
      id: 'designer-bags',
      keywords: [['bag','handbag','purse','louis vuitton','lv','chanel','hermes','hermès','gucci','prada','dior','fendi','saint laurent','ysl','bottega','celine','loewe','designer']],
      matchAny: true,
      reply: `<p><strong>We buy authenticated designer handbags and accessories.</strong></p>
<p><strong>Brands we regularly purchase:</strong></p>
<ul style="padding-left:1.2em;margin:.5em 0">
<li>Louis Vuitton — Speedy, Neverfull, Keepall, Pochette</li>
<li>Chanel — Classic Flap, Boy, Wallet on Chain</li>
<li>Gucci, Dior, Saint Laurent, Prada, Fendi</li>
<li>Hermès — Kelly and Birkin (by appointment)</li>
<li>Bottega Veneta, Celine, Loewe</li>
<li>Designer belts, wallets, and small leather goods</li>
</ul>
<p>Dust bag, box, and receipt help but aren't required. We authenticate in-store. Text photos to <a href="${SMS_URL}">${PHONE}</a> first if you want a rough idea before visiting.</p>`
    },

    // ── SNEAKERS ─────────────────────────────────────────────────────────────
    {
      id: 'sneakers',
      keywords: [['sneaker','sneakers','shoes','jordan','nike','yeezy','dunk','air max','new balance','travis scott','off-white','fragment','deadstock','ds','footwear','kicks']],
      matchAny: true,
      reply: `<p><strong>We buy sneakers daily — deadstock and gently worn pairs both welcome.</strong></p>
<p><strong>What we buy:</strong></p>
<ul style="padding-left:1.2em;margin:.5em 0">
<li>Air Jordan retros and collabs</li>
<li>Nike Dunk and SB Dunk</li>
<li>Adidas Yeezy (350, 500, 700, Foam Runner)</li>
<li>New Balance collabs</li>
<li>Travis Scott, Off-White, Fragment collaborations</li>
</ul>
<p>OG box preferred — it helps the offer. We use live market pricing, not kiosk lowball rates. Most people get cash in hand within 10 minutes. Walk in or text photos to <a href="${SMS_URL}">${PHONE}</a>.</p>`
    },

    // ── STREETWEAR / VINTAGE ─────────────────────────────────────────────────
    {
      id: 'streetwear',
      keywords: [['streetwear','supreme','off-white','bape','palace','kith','fear of god','fog','chrome hearts','vintage','band tee','tour shirt','carhartt','workwear','90s','y2k','hype','hoodie','jacket']],
      matchAny: true,
      reply: `<p><strong>We buy hype streetwear and curated vintage clothing.</strong></p>
<p><strong>Streetwear labels:</strong> Supreme, Off-White, BAPE, Palace, Kith collabs, Fear of God — authenticated for resale demand.</p>
<p><strong>Vintage we love:</strong> Band and tour tees (80s–00s), Carhartt and Schott jackets, Levi's, 90s & Y2K pieces, Harley and sports vintage — clean condition only.</p>
<p>We do <strong>not</strong> buy fast-fashion or bulk by the pound. Condition matters a lot. Text photos to <a href="${SMS_URL}">${PHONE}</a> if you want a quick sense before making the trip.</p>`
    },

    // ── ELECTRONICS ──────────────────────────────────────────────────────────
    {
      id: 'electronics',
      keywords: [['phone','iphone','ipad','tablet','macbook','laptop','camera','playstation','ps5','ps4','xbox','nintendo','console','electronics','airpods']],
      matchAny: true,
      reply: `<p><strong>We buy select electronics.</strong></p>
<p>iPhones, MacBooks, iPads, cameras, gaming consoles (PS5, PS4, Xbox, Nintendo Switch), and accessories.</p>
<p>Because prices and model demand change fast, the best move is to <a href="${SMS_URL}">text us a photo</a> and the model name for a quick quote before coming in. We'll let you know right away if it's something we're actively buying.</p>`
    },

    // ── COINS ────────────────────────────────────────────────────────────────
    {
      id: 'coins',
      keywords: [['coin','coins','bullion','gold coin','silver coin','american eagle','krugerrand','numismatic','rare coin']],
      matchAny: true,
      reply: `<p><strong>Yes, we buy gold and silver coins.</strong></p>
<p>American Eagles, Krugerrands, Maple Leafs, silver rounds, and other bullion coins. Numismatic (rare/collectible) coins are evaluated case by case. Walk in with whatever you have — appraisal is always free.</p>`
    },

    // ── BROKEN / DAMAGED ─────────────────────────────────────────────────────
    {
      id: 'broken',
      keywords: [['broken','damaged','scrap','single earring','bent','cracked','missing stone','incomplete','tangled']],
      matchAny: true,
      reply: `<p><strong>Yes — broken or damaged items can still have real value.</strong></p>
<p>Broken chains, single earrings, scrap gold, bent rings, damaged watches — the metal and stone content still count. We evaluate everything based on what it's actually worth, not just its condition. Bring it in and we'll tell you what we'd offer.</p>`
    },

    // ── ESTATE / INHERITED ───────────────────────────────────────────────────
    {
      id: 'estate',
      keywords: [['estate','inherited','inheritance','grandmother','grandfather','family','passed away','deceased','collection','lot','multiple items','moving','liquidation']],
      matchAny: true,
      reply: `<p><strong>We handle estate and inherited items all the time.</strong></p>
<p>Families clearing an apartment or liquidating a collection can bring mixed boxes — jewelry, watches, bags, coins, electronics — and leave with one payment. We evaluate everything and explain each offer clearly.</p>
<p>For large estates, it helps to text photos to <a href="${SMS_URL}">${PHONE}</a> ahead of time so we can set aside enough time for you. Walk-ins are welcome too.</p>`
    },

    // ── HOW OFFERS ARE CALCULATED ────────────────────────────────────────────
    {
      id: 'how-valued',
      keywords: [['value','valued','worth','calculate','calculate','price','offer','much','rate','market','spot price','weigh','test','karat','purity']],
      matchAny: true,
      reply: `<p><strong>Here's how we arrive at your offer:</strong></p>
<ul style="padding-left:1.2em;margin:.5em 0">
<li><strong>Gold & silver:</strong> Weight + purity tested right in front of you, priced against live spot rates</li>
<li><strong>Diamonds & gems:</strong> Cut, clarity, color, carat weight, setting, and GIA cert if available</li>
<li><strong>Watches:</strong> Brand, model, serial number, condition, box & papers</li>
<li><strong>Designer bags:</strong> Brand, model, condition, authentication, original packaging</li>
<li><strong>Sneakers:</strong> Style, size, condition, box, live resale market data</li>
</ul>
<p>We don't quote prices over the phone for every item — photos and in-person evaluation give you the real number. Text photos to <a href="${SMS_URL}">${PHONE}</a> for a preliminary idea.</p>`
    },

    // ── TEXT PHOTOS / QUOTE ──────────────────────────────────────────────────
    {
      id: 'text-photos',
      keywords: [['text','photo','picture','pic','send','quote online','remote','before i come','before coming','not sure']],
      matchAny: true,
      reply: `<p><strong>Texting photos is a great first step.</strong></p>
<p>Send photos of your item to <a href="${SMS_URL}">${PHONE}</a> and we'll give you a rough idea of whether it's worth a trip in. Include close-ups of any markings, stamps, or labels — that helps us a lot.</p>
<p>For a firm offer, you'll need to come in so we can test and weigh everything properly. But the text-first approach is popular and saves time.</p>`
    },

    // ── CONSIGNMENT ──────────────────────────────────────────────────────────
    {
      id: 'consignment',
      keywords: [['consign','consignment','trade','trade in']],
      matchAny: true,
      reply: `<p><strong>Yes — we buy outright and also offer consignment.</strong></p>
<p>Most sellers prefer the instant cash offer. Consignment means we sell the item on your behalf and you get paid when it sells — sometimes at a higher number. We can walk you through both options when you come in so you can choose what works best.</p>`
    },

    // ── SELL vs PAWN ─────────────────────────────────────────────────────────
    {
      id: 'pawn',
      keywords: [['pawn','pawnshop','loan','borrow','pawn shop']],
      matchAny: true,
      reply: `<p>We are a licensed buy/sell shop — <strong>not a traditional pawn shop.</strong></p>
<p>We make outright purchase offers: you sell us the item and walk out with cash. We don't do short-term loans against items. If you're looking to sell, we're a great option. Licensed under NYC DCA #2070477.</p>`
    },

    // ── AUTHENTICITY / FAKE ──────────────────────────────────────────────────
    {
      id: 'authentication',
      keywords: [['authentic','authentication','fake','real','legit','genuine','replica','verify','serial number']],
      matchAny: true,
      reply: `<p><strong>We authenticate everything before making an offer.</strong></p>
<p>Our buyers inspect hallmarks, serial numbers, stitching, hardware, and other markers depending on the item. We do this in-store — no sending items out, no waiting days for a result.</p>
<p>If something doesn't pass authentication, we'll tell you honestly. We won't make an offer on items we can't verify.</p>`
    },

    // ── REVIEWS / TRUST ───────────────────────────────────────────────────────
    {
      id: 'reviews',
      keywords: [['review','reviews','google','rating','stars','trust','legit','scam','reputation','real']],
      matchAny: true,
      reply: `<p>East Village Buyers has a <strong>5.0 ★ rating on Google with 556+ reviews</strong> — verified.</p>
<p>Customers consistently mention transparent pricing, no pressure, and same-day cash. We're a licensed NYC buyer (DCA #2070477) and have been operating in the East Village for years. You can read all reviews on Google before you come in.</p>`
    },

    // ── LICENSE / LEGAL ───────────────────────────────────────────────────────
    {
      id: 'license',
      keywords: [['license','licensed','legal','dca','regulated','law','nyc law','compliant']],
      matchAny: true,
      reply: `<p>East Village Buyers operates under <strong>NYC DCA license #2070477</strong> (Vintage USA Inc, DBA East Village Buyers).</p>
<p>We follow all New York City and State regulations for precious-metal and secondhand purchases, including ID verification and transaction documentation. Everything is above board.</p>`
    },

    // ── CONTACT ───────────────────────────────────────────────────────────────
    {
      id: 'contact',
      keywords: [['contact','call','phone','number','reach','get in touch','talk to someone']],
      matchAny: true,
      reply: `<p><strong>Call or text us:</strong> <a href="${PHONE_URL}">${PHONE}</a></p>
<p><strong>Address:</strong> ${ADDRESS}<br>
<strong>Hours:</strong> ${HOURS}</p>
<p>Texting is the fastest way to get a quick answer — especially if you want to send photos of your item first.</p>`
    },

    // ── WHAT DO YOU BUY (GENERAL) ─────────────────────────────────────────────
    {
      id: 'what-we-buy',
      keywords: [['what do you buy','what you buy','you guys buy','do you buy','categories','types','accept','take in','looking for']],
      matchAny: true,
      reply: `<p><strong>We buy a wide range of things — here's the full list:</strong></p>
<ul style="padding-left:1.2em;margin:.5em 0">
<li>💍 <strong>Jewelry</strong> — gold, silver, platinum, diamonds, estate pieces, broken scrap</li>
<li>⌚ <strong>Watches</strong> — Rolex, Omega, Cartier, Patek, vintage mechanicals</li>
<li>👜 <strong>Designer</strong> — Louis Vuitton, Chanel, Gucci, Hermès, Prada, and more</li>
<li>👟 <strong>Sneakers</strong> — Jordan, Yeezy, Dunk, collabs — deadstock and worn</li>
<li>👕 <strong>Streetwear</strong> — Supreme, BAPE, Off-White, vintage band tees, workwear</li>
<li>🥇 <strong>Coins & Bullion</strong> — gold/silver coins and bars</li>
<li>📱 <strong>Electronics</strong> — iPhones, MacBooks, cameras, consoles (text first)</li>
</ul>
<p>Not sure if your item qualifies? Text a photo to <a href="${SMS_URL}">${PHONE}</a> and we'll tell you right away.</p>`
    },

    // ── YES / NO / CAN I SELL ─────────────────────────────────────────────────
    {
      id: 'can-i-sell',
      keywords: [['can i','will you','do you take','accept','allowed','able to sell','sell my','sell this','sell a','sell an','looking to sell','want to sell','trying to sell']],
      matchAny: true,
      reply: `<p><strong>Yes — bring it in.</strong> We buy gold, jewelry, watches, designer bags, sneakers, streetwear, coins, and select electronics. Walk in for a free appraisal at ${ADDRESS}. Not sure? Text a photo to <a href="${SMS_URL}">${PHONE}</a> first.</p>`
    },

    // ── QUOTE / PRICE (no exact number) ─────────────────────────────────────
    {
      id: 'quote',
      keywords: [['quote','price','pricing','how much','offer','estimate','ballpark','worth','value my']],
      matchAny: true,
      reply: `<p>We give firm offers in person after we test and inspect your item — that's the only way to get a real number. Text photos to <a href="${SMS_URL}">${PHONE}</a> for a rough yes/no before you visit. Appraisal is always free.</p>`
    },

    // ── TODAY / TOMORROW ──────────────────────────────────────────────────────
    {
      id: 'when-today',
      keywords: [['today','tomorrow','right now','open now','still open','come in now','this afternoon','this evening']],
      matchAny: true,
      reply: `<p><strong>Hours:</strong> ${HOURS}. Walk-ins welcome — no appointment. Text <a href="${SMS_URL}">${PHONE}</a> before a long trip if you want to confirm we're open.</p>`
    },

    // ── CATCH-ALL (always available) ──────────────────────────────────────────
    {
      id: 'default',
      keywords: [['buy','sell','item','stuff','help','question','about','shop','store','you','your','anything','something','info','information']],
      matchAny: true,
      isDefault: true,
      reply: `<p>East Village Buyers is a licensed NYC resale shop at ${ADDRESS}. We buy gold, jewelry, watches, designer, sneakers, streetwear, coins, and more — <strong>free appraisal</strong>, same-day cash, no appointment. Call or text <a href="${SMS_URL}">${PHONE}</a> or walk in during store hours.</p>`
    },

  ];

  // ── Query expansion ───────────────────────────────────────────────────────
  const QUERY_ALIASES = [
    ['hrs', 'hours'], ['hr', 'hours'], ['loc', 'location'], ['addr', 'address'],
    ['appt', 'appointment'], ['appraisal', 'appraisal'], ['jewlery', 'jewelry'],
    ['rolexes', 'rolex'], ['jordans', 'jordan'], ['sneaker', 'sneakers'],
  ];

  function expandQuery(rawQuery) {
    let q = normalize(rawQuery);
    QUERY_ALIASES.forEach(([from, to]) => {
      if (q.includes(from)) q += ' ' + to;
    });
    return q;
  }

  function tokenize(text) {
    return expandQuery(text).split(' ').filter(w => w.length > 1 && !STOP.has(w));
  }

  function allKeywords(entry) {
    if (!entry.keywords) return [];
    return entry.keywords.flat();
  }

  // ── Scoring (KB + site chunks) ────────────────────────────────────────────
  function scoreEntry(entry, rawQuery) {
    const q = expandQuery(rawQuery);
    const tokens = tokenize(rawQuery);
    let score = 0;

    if (entry.isDefault) score += 1;

    allKeywords(entry).forEach(kw => {
      if (q.includes(kw)) {
        score += kw.length >= 6 ? 24 : 18;
      } else {
        tokens.forEach(t => {
          if (t.length >= 3 && (kw.includes(t) || t.includes(kw))) score += 10;
          if (t.length >= 4 && kw.startsWith(t.slice(0, 4))) score += 6;
        });
      }
    });

    if (entry.pairs) {
      entry.pairs.forEach(pair => {
        if (pair.every(kw => q.includes(kw))) score += 45;
      });
    }

    return score;
  }

  function scoreChunk(chunk, rawQuery) {
    const q = expandQuery(rawQuery);
    const tokens = tokenize(rawQuery);
    const hay = [chunk.question, chunk.section, chunk.text, chunk.pageLabel]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    let score = 0;

    if (chunk.question) {
      const cq = chunk.question.toLowerCase();
      if (cq.includes(q) || q.includes(cq.slice(0, Math.min(28, cq.length)))) score += 90;
      tokens.forEach(t => {
        if (t.length >= 3 && cq.includes(t)) score += 14;
      });
    }

    tokens.forEach(t => {
      if (t.length >= 3 && hay.includes(t)) score += 11;
    });

    if (chunk.type === 'faq') score += 4;
    return score;
  }

  function searchKnowledge(query) {
    const k = window.EVB_KNOWLEDGE;
    if (!k?.chunks?.length) return null;
    const ranked = k.chunks
      .map(chunk => ({ chunk, score: scoreChunk(chunk, query) }))
      .sort((a, b) => b.score - a.score);
    return ranked[0]?.score >= 10 ? ranked[0] : null;
  }

  function rankKb(query) {
    return KB.filter(e => !e.isDefault)
      .map(entry => ({ entry, score: scoreEntry(entry, query) }))
      .sort((a, b) => b.score - a.score);
  }

  function lookupChipAnswer(query) {
    const key = normalize(query);
    if (CHIP_ANSWERS[key]) return CHIP_ANSWERS[key];
    for (const phrase of Object.keys(CHIP_ANSWERS)) {
      if (key.includes(phrase) || phrase.includes(key)) return CHIP_ANSWERS[phrase];
    }
    return null;
  }

  /** Keep chat replies readable — include lists when present */
  function toSimpleAnswer(html) {
    const parts = html.match(/<p>[\s\S]*?<\/p>/g);
    const list = html.match(/<ol[\s\S]*?<\/ol>|<ul[\s\S]*?<\/ul>/);
    if (!parts?.length) return html;
    let out = parts[0];
    if (list) out += list[0];
    else if (parts[1]) {
      const plain = parts[1].replace(/<[^>]+>/g, '');
      if (plain.length < 220) out += parts[1];
    }
    return out;
  }

  function formatKnowledgeHit({ chunk }) {
    let text = (chunk.text || '').replace(/\s+/g, ' ').trim();
    if (text.length > 340) {
      const cut = text.slice(0, 340);
      const dot = cut.lastIndexOf('.');
      text = dot > 60 ? cut.slice(0, dot + 1) : cut.trim() + '…';
    }
    let html = '';
    if (chunk.question) {
      html += '<p><strong>' + escapeHtml(chunk.question) + '</strong></p>';
    }
    html += '<p>' + escapeHtml(text) + '</p>';
    html += '<p class="evb-asst-footnote">Walk in or text <a href="' + SMS_URL + '">' + PHONE + '</a> · ' + escapeHtml(ADDRESS) + '</p>';
    return html;
  }

  function resolveAnswer(query) {
    const chip = lookupChipAnswer(query);
    if (chip) return chip;

    const kbRanked = rankKb(query);
    const kbBest = kbRanked[0];
    const siteHit = searchKnowledge(query);

    // KB answers beat random site FAQ snippets
    if (kbBest && kbBest.score >= 18) {
      return toSimpleAnswer(kbBest.entry.reply);
    }

    if (kbBest && kbBest.score >= 10) {
      return toSimpleAnswer(kbBest.entry.reply);
    }

    if (siteHit && siteHit.score >= 28) {
      return formatKnowledgeHit(siteHit);
    }

    if (kbBest && kbBest.score >= 6) {
      return toSimpleAnswer(kbBest.entry.reply);
    }

    if (siteHit && siteHit.score >= 14) {
      return formatKnowledgeHit(siteHit);
    }

    if (kbBest && kbBest.score > 0) {
      return toSimpleAnswer(kbBest.entry.reply);
    }

    if (siteHit && siteHit.score >= 10) {
      return formatKnowledgeHit(siteHit);
    }

    const def = KB.find(e => e.isDefault);
    return toSimpleAnswer(def ? def.reply : `<p>Walk in at ${ADDRESS} for a free appraisal, or text <a href="${SMS_URL}">${PHONE}</a>. We buy gold, jewelry, watches, designer, sneakers, and more.</p>`);
  }

  // ── Escape HTML ───────────────────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Build UI ──────────────────────────────────────────────────────────────
  function buildUI() {
    const root = document.createElement('div');
    root.className = 'evb-asst-root';
    root.setAttribute('role', 'complementary');
    root.setAttribute('aria-label', 'Site assistant');

    root.innerHTML =
      '<button type="button" class="evb-asst-toggle" aria-expanded="false" aria-controls="evb-asst-panel">' +
      '<span class="evb-asst-toggle-icon" aria-hidden="true">' +
      '<img src="evblogo.png" alt="East Village Buyers" class="evb-asst-logo-img">' +
      '</span>' +
      '<span class="evb-asst-toggle-label">Ask EVB<small>Site assistant</small></span>' +
      '</button>' +
      '<div class="evb-asst-panel" id="evb-asst-panel" hidden>' +
      '<div class="evb-asst-head">' +
      '<div class="evb-asst-head-logo">' +
      '<img src="evblogo.png" alt="East Village Buyers" class="evb-asst-head-logo-img">' +
      '<div class="evb-asst-head-text"><h2>East Village Buyers</h2><p>Ask me anything about the shop</p></div>' +
      '</div>' +
      '<button type="button" class="evb-asst-close" aria-label="Close chat">×</button>' +
      '</div>' +
      '<div class="evb-asst-messages" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<div class="evb-asst-chips"></div>' +
      '<form class="evb-asst-foot" role="search">' +
      '<textarea class="evb-asst-input" rows="1" placeholder="Ask about selling, hours, gold, watches…" aria-label="Your question"></textarea>' +
      '<button type="submit" class="evb-asst-send">Send</button>' +
      '</form>' +
      '</div>';

    document.body.appendChild(root);

    const toggle   = root.querySelector('.evb-asst-toggle');
    const panel    = root.querySelector('.evb-asst-panel');
    const closeBtn = root.querySelector('.evb-asst-close');
    const messages = root.querySelector('.evb-asst-messages');
    const chipsEl  = root.querySelector('.evb-asst-chips');
    const form     = root.querySelector('.evb-asst-foot');
    const input    = root.querySelector('.evb-asst-input');
    const sendBtn  = root.querySelector('.evb-asst-send');

    let greeted = false;

    function openPanel() {
      root.classList.add('evb-asst-root--open');
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      if (!greeted) {
        greeted = true;
        addBotMessage(
          '<p>Hey! I\'m the East Village Buyers assistant. Ask me anything — what we buy, how selling works, our hours, location, whatever you need.</p>'
        );
        renderChips();
      }
      input.focus();
    }

    function closePanel() {
      root.classList.remove('evb-asst-root--open');
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }

    function addMessage(html, role) {
      const el = document.createElement('div');
      el.className = 'evb-asst-msg evb-asst-msg--' + role;
      el.innerHTML = html;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    }

    function addBotMessage(html) { return addMessage(html, 'bot'); }
    function addUserMessage(text) { return addMessage('<p>' + escapeHtml(text) + '</p>', 'user'); }

    function showTyping() {
      const el = document.createElement('div');
      el.className = 'evb-asst-typing';
      el.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    }

    function renderChips() {
      chipsEl.innerHTML = '';
      SUGGESTIONS.forEach(s => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'evb-asst-chip';
        b.textContent = s;
        b.addEventListener('click', () => askQuestion(s));
        chipsEl.appendChild(b);
      });
    }

    function askQuestion(q) {
      const text = (q || '').trim();
      if (!text) return;

      sendBtn.disabled = true;
      addUserMessage(text);

      const typing = showTyping();

      setTimeout(() => {
        typing.remove();
        addBotMessage(resolveAnswer(text));
        sendBtn.disabled = false;
        input.focus();
      }, 400);
    }

    function submitQuery() {
      const q = input.value.trim();
      if (!q) return;
      input.value = '';
      askQuestion(q);
    }

    toggle.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);

    form.addEventListener('submit', e => { e.preventDefault(); submitQuery(); });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuery(); }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && root.classList.contains('evb-asst-root--open')) closePanel();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }
})();
