import { supabase } from "../../../lib/supabase.js";

// All RSS feed configurations (same as in the HTML)
const RSS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";

const BLOCK_WORDS = [
  "iran", "missile", "attack", "bomb", "war zone", "military strike", "nato",
  "nuclear weapon", "terrorist", "assassination", "coup", "drone strike",
  "ceasefire", "invasion", "airstrike", "hostage", "refugee crisis", "famine",
  "earthquake", "hurricane", "tornado", "pandemic surge", "covid wave",
  "plane crash", "train derailment", "shooting", "mass casualty",
  "protest riot", "sanctions imposed", "genocide", "ethnic cleansing",
];

function isRelevant(title, desc) {
  const t = (title + " " + (desc || "")).toLowerCase();
  return !BLOCK_WORDS.some((w) => t.includes(w));
}

const FEEDS = {
  wealth: [
    { url: "https://news.google.com/rss/search?q=IPO+listing+SGX+Singapore+Exchange&hl=en-SG&gl=SG", tag: "IPO", color: "#1B8F5A", country: "Singapore", signal: "IPO" },
    { url: "https://news.google.com/rss/search?q=IPO+listing+Bursa+Malaysia+Exchange&hl=en-MY&gl=MY", tag: "IPO", color: "#1B8F5A", country: "Malaysia", signal: "IPO" },
    { url: "https://news.google.com/rss/search?q=IPO+listing+IDX+Indonesia+Stock+Exchange&hl=en&gl=ID", tag: "IPO", color: "#1B8F5A", country: "Indonesia", signal: "IPO" },
    { url: "https://news.google.com/rss/search?q=IPO+listing+HKEX+Hong+Kong+Exchange&hl=en", tag: "IPO", color: "#1B8F5A", country: "Hong Kong", signal: "IPO" },
    { url: "https://news.google.com/rss/search?q=IPO+listing+SET+Thailand+Stock+Exchange&hl=en", tag: "IPO", color: "#1B8F5A", country: "Thailand", signal: "IPO" },
    { url: "https://news.google.com/rss/search?q=IPO+listing+PSE+Philippines+Stock+Exchange&hl=en", tag: "IPO", color: "#1B8F5A", country: "Philippines", signal: "IPO" },
    { url: "https://news.google.com/rss/search?q=startup+fundraising+%22Series+C%22+OR+%22Series+D%22+Asia+Southeast&hl=en", tag: "Pre-IPO", color: "#6B5BAE", country: "SEA", signal: "Pre-IPO Funding" },
    { url: "https://news.google.com/rss/search?q=venture+capital+funding+round+Singapore+Indonesia+Vietnam&hl=en-SG&gl=SG", tag: "Fundraising", color: "#C6943E", country: "SEA", signal: "Fundraising" },
    { url: "https://news.google.com/rss/search?q=unicorn+startup+valuation+billion+Asia+Southeast&hl=en", tag: "Unicorn", color: "#3A7BD5", country: "SEA", signal: "Unicorn Watch" },
    { url: "https://news.google.com/rss/search?q=merger+acquisition+deal+Asia+Singapore+billion&hl=en-SG&gl=SG", tag: "M&A", color: "#1B2A4A", country: "Asia", signal: "M&A" },
    { url: "https://news.google.com/rss/search?q=startup+exit+acquisition+sold+Asia+unicorn&hl=en", tag: "Exit", color: "#C0392B", country: "Asia", signal: "Founder Exit" },
    { url: "https://news.google.com/rss/search?q=secondary+share+sale+pre-IPO+Asia+founder&hl=en", tag: "Secondary", color: "#2A8F8F", country: "Asia", signal: "Secondary Sale" },
  ],
  corp: [
    { url: "https://news.google.com/rss/search?q=%22substantial+shareholder%22+OR+%22major+shareholder%22+SGX+Bursa+IDX&hl=en", tag: "Filing", color: "#1B2A4A", country: "SEA", signal: "Shareholder Filing" },
    { url: "https://news.google.com/rss/search?q=insider+transaction+OR+%22director+dealing%22+Asia+stock+exchange&hl=en", tag: "Insider", color: "#6B5BAE", country: "Asia", signal: "Insider Transaction" },
    { url: "https://news.google.com/rss/search?q=special+dividend+OR+%22interim+dividend%22+Singapore+Malaysia+Indonesia+Hong+Kong&hl=en", tag: "Dividend", color: "#1B8F5A", country: "SEA/HK", signal: "Dividend Payout" },
    { url: "https://news.google.com/rss/search?q=corporate+restructuring+OR+demerger+OR+spin-off+Asia+conglomerate&hl=en", tag: "Restructure", color: "#C6943E", country: "Asia", signal: "Restructuring" },
    { url: "https://news.google.com/rss/search?q=succession+OR+%22next+generation%22+OR+inheritance+tycoon+Asia+family+business&hl=en", tag: "Succession", color: "#C0392B", country: "Asia", signal: "Succession" },
    { url: "https://news.google.com/rss/search?q=billionaire+death+OR+%22passed+away%22+tycoon+Asia+fortune+estate&hl=en", tag: "Estate", color: "#C0392B", country: "Asia", signal: "Estate Settlement" },
    { url: "https://news.google.com/rss/search?q=tycoon+OR+billionaire+Singapore+%22net+worth%22+OR+business+OR+fortune&hl=en-SG&gl=SG", tag: "Prospect", color: "#3A7BD5", country: "Singapore", signal: "Prospect Intel" },
    { url: "https://news.google.com/rss/search?q=tycoon+OR+billionaire+Malaysia+%22net+worth%22+OR+Bursa+OR+fortune&hl=en-MY&gl=MY", tag: "Prospect", color: "#3A7BD5", country: "Malaysia", signal: "Prospect Intel" },
    { url: "https://news.google.com/rss/search?q=konglomerat+OR+billionaire+Indonesia+%22net+worth%22+OR+IDX+OR+fortune&hl=en&gl=ID", tag: "Prospect", color: "#3A7BD5", country: "Indonesia", signal: "Prospect Intel" },
    { url: "https://news.google.com/rss/search?q=tycoon+OR+billionaire+Thailand+%22net+worth%22+OR+SET+OR+fortune&hl=en", tag: "Prospect", color: "#3A7BD5", country: "Thailand", signal: "Prospect Intel" },
    { url: "https://news.google.com/rss/search?q=tycoon+OR+billionaire+Philippines+%22net+worth%22+OR+PSE+OR+fortune&hl=en", tag: "Prospect", color: "#3A7BD5", country: "Philippines", signal: "Prospect Intel" },
    { url: "https://news.google.com/rss/search?q=billionaire+China+%22net+worth%22+OR+%22rich+list%22+OR+fortune+OR+wealth&hl=en", tag: "Prospect", color: "#3A7BD5", country: "China", signal: "Prospect Intel" },
    { url: "https://news.google.com/rss/search?q=tycoon+OR+billionaire+%22Hong+Kong%22+%22net+worth%22+OR+property+OR+fortune&hl=en", tag: "Prospect", color: "#3A7BD5", country: "Hong Kong", signal: "Prospect Intel" },
    { url: "https://news.google.com/rss/search?q=billionaire+Taiwan+%22net+worth%22+OR+TSMC+OR+fortune+OR+Foxconn&hl=en", tag: "Prospect", color: "#3A7BD5", country: "Taiwan", signal: "Prospect Intel" },
    { url: "https://news.google.com/rss/search?q=billionaire+Vietnam+%22net+worth%22+OR+VinFast+OR+fortune+OR+Vingroup&hl=en", tag: "Prospect", color: "#3A7BD5", country: "Vietnam", signal: "Prospect Intel" },
  ],
  pw: [
    { url: "https://news.google.com/rss/search?q=%22private+bank%22+OR+%22private+banking%22+Asia+Singapore+Hong+Kong&hl=en-SG&gl=SG", tag: "Private Banking", color: "#1B2A4A", country: "Asia", signal: "PB Activity" },
    { url: "https://news.google.com/rss/search?q=%22wealth+management%22+Asia+Singapore+UHNW+hire+OR+launch&hl=en", tag: "Wealth Mgmt", color: "#3A7BD5", country: "Asia", signal: "WM Activity" },
    { url: "https://news.google.com/rss/search?q=%22Asian+Private+Banker%22+OR+%22private+wealth%22+Southeast+Asia&hl=en", tag: "Industry", color: "#6B5BAE", country: "Asia", signal: "Industry News" },
    { url: "https://news.google.com/rss/search?q=%22family+office%22+Singapore+OR+Hong+Kong+new+OR+launch+OR+establish&hl=en-SG&gl=SG", tag: "Family Office", color: "#1B8F5A", country: "Singapore/HK", signal: "FO Formation" },
    { url: "https://news.google.com/rss/search?q=%22single+family+office%22+Asia+MAS+license+OR+registered&hl=en", tag: "Family Office", color: "#1B8F5A", country: "Asia", signal: "FO Formation" },
    { url: "https://news.google.com/rss/search?q=%22Global+Investor+Programme%22+OR+%22GIP%22+Singapore+investment+migration&hl=en-SG&gl=SG", tag: "Migration", color: "#C6943E", country: "Singapore", signal: "Wealth Migration" },
    { url: "https://news.google.com/rss/search?q=%22wealth+migration%22+OR+%22investment+visa%22+OR+%22relocate%22+UHNW+Singapore+OR+%22Hong+Kong%22&hl=en", tag: "Migration", color: "#C6943E", country: "Asia", signal: "Wealth Migration" },
    { url: "https://news.google.com/rss/search?q=%22golden+visa%22+OR+%22residency+by+investment%22+Asia+Southeast&hl=en", tag: "Migration", color: "#C6943E", country: "SEA", signal: "Wealth Migration" },
    { url: "https://news.google.com/rss/search?q=%22second+generation%22+OR+%22next+generation%22+billionaire+Asia+heir+business&hl=en", tag: "Next Gen", color: "#2A8F8F", country: "Asia", signal: "Next Gen" },
    { url: "https://news.google.com/rss/search?q=heir+OR+heiress+OR+%22family+business%22+succession+Asia+wealth+transfer&hl=en", tag: "Next Gen", color: "#2A8F8F", country: "Asia", signal: "Wealth Transfer" },
    { url: "https://news.google.com/rss/search?q=luxury+property+OR+%22good+class+bungalow%22+Singapore+OR+%22The+Peak%22+Hong+Kong+sold&hl=en", tag: "Property", color: "#C0392B", country: "SG/HK", signal: "Property Signal" },
  ],
};

async function fetchFeed(feedUrl) {
  try {
    const res = await fetch(RSS_PROXY + encodeURIComponent(feedUrl));
    const data = await res.json();
    if (data.status === "ok" && data.items) {
      return data.items.map((it) => {
        const desc = (it.description || "").replace(/<[^>]*>/g, "").slice(0, 200);
        let src = "";
        try { src = new URL(it.link || "").hostname.replace("www.", ""); } catch {}
        return {
          title: it.title || "",
          link: it.link || "",
          date: it.pubDate ? it.pubDate.split(" ")[0] : "",
          source: src,
          description: desc,
        };
      });
    }
    return [];
  } catch {
    return [];
  }
}

export async function GET(request) {
  // Verify this is called by Vercel Cron (or allow in dev)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let totalInserted = 0;
  let totalSkipped = 0;
  const errors = [];

  for (const [tab, feeds] of Object.entries(FEEDS)) {
    for (const feed of feeds) {
      try {
        const items = await fetchFeed(feed.url);

        for (const item of items) {
          if (!isRelevant(item.title, item.description)) continue;

          const row = {
            title: item.title,
            link: item.link,
            date: item.date,
            source: item.source,
            description: item.description,
            tag: feed.tag,
            color: feed.color,
            country: feed.country,
            signal: feed.signal,
            tab: tab,
          };

          const { error } = await supabase.from("articles").upsert(row, {
            onConflict: "title,tab",
            ignoreDuplicates: true,
          });

          if (error) {
            totalSkipped++;
          } else {
            totalInserted++;
          }
        }
      } catch (err) {
        errors.push(`${tab}/${feed.tag}: ${err.message}`);
      }
    }
  }

  return Response.json({
    success: true,
    inserted: totalInserted,
    skipped: totalSkipped,
    errors: errors.length ? errors : undefined,
    timestamp: new Date().toISOString(),
  });
}
