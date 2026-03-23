export type KanaType = "hiragana" | "katakana";
export type KanaColumn = "a" | "i" | "u" | "e" | "o";

export interface KanaEntry {
  id: string;
  row: string;
  column: KanaColumn;
  romaji: string;
  hiragana: string;
  katakana: string;
  originHiragana?: string;
  originKatakana?: string;
  audio?: string;
  notes?: string;
}

export interface KanaRow {
  id: string;
  label: string;
  entries: Array<KanaEntry | null>;
}

export const kanaColumns: KanaColumn[] = ["a", "i", "u", "e", "o"];

function createKanaEntry(entry: KanaEntry): KanaEntry {
  return entry;
}

function createKanaRow(id: string, label: string, entries: Array<KanaEntry | null>): KanaRow {
  return { id, label, entries };
}

export function getKanaChar(entry: KanaEntry, type: KanaType) {
  return type === "hiragana" ? entry.hiragana : entry.katakana;
}

export function getKanaOrigin(entry: KanaEntry, type: KanaType) {
  return type === "hiragana" ? entry.originHiragana : entry.originKatakana;
}

export const kanaRows: KanaRow[] = [
  createKanaRow("a", "あ行", [
    createKanaEntry({ id: "a", row: "あ行", column: "a", romaji: "a", hiragana: "あ", katakana: "ア", originHiragana: "安", notes: "基础元音。" }),
    createKanaEntry({ id: "i", row: "あ行", column: "i", romaji: "i", hiragana: "い", katakana: "イ", originHiragana: "以", notes: "基础元音。" }),
    createKanaEntry({ id: "u", row: "あ行", column: "u", romaji: "u", hiragana: "う", katakana: "ウ", originHiragana: "宇", notes: "基础元音。" }),
    createKanaEntry({ id: "e", row: "あ行", column: "e", romaji: "e", hiragana: "え", katakana: "エ", originHiragana: "衣", notes: "基础元音。" }),
    createKanaEntry({ id: "o", row: "あ行", column: "o", romaji: "o", hiragana: "お", katakana: "オ", originHiragana: "於", notes: "基础元音。" }),
  ]),
  createKanaRow("ka", "か行", [
    createKanaEntry({ id: "ka", row: "か行", column: "a", romaji: "ka", hiragana: "か", katakana: "カ", originHiragana: "加" }),
    createKanaEntry({ id: "ki", row: "か行", column: "i", romaji: "ki", hiragana: "き", katakana: "キ", originHiragana: "幾" }),
    createKanaEntry({ id: "ku", row: "か行", column: "u", romaji: "ku", hiragana: "く", katakana: "ク", originHiragana: "久" }),
    createKanaEntry({ id: "ke", row: "か行", column: "e", romaji: "ke", hiragana: "け", katakana: "ケ", originHiragana: "計" }),
    createKanaEntry({ id: "ko", row: "か行", column: "o", romaji: "ko", hiragana: "こ", katakana: "コ", originHiragana: "己" }),
  ]),
  createKanaRow("sa", "さ行", [
    createKanaEntry({ id: "sa", row: "さ行", column: "a", romaji: "sa", hiragana: "さ", katakana: "サ", originHiragana: "左" }),
    createKanaEntry({ id: "shi", row: "さ行", column: "i", romaji: "shi", hiragana: "し", katakana: "シ", originHiragana: "之" }),
    createKanaEntry({ id: "su", row: "さ行", column: "u", romaji: "su", hiragana: "す", katakana: "ス", originHiragana: "寸" }),
    createKanaEntry({ id: "se", row: "さ行", column: "e", romaji: "se", hiragana: "せ", katakana: "セ", originHiragana: "世" }),
    createKanaEntry({ id: "so", row: "さ行", column: "o", romaji: "so", hiragana: "そ", katakana: "ソ", originHiragana: "曾" }),
  ]),
  createKanaRow("ta", "た行", [
    createKanaEntry({ id: "ta", row: "た行", column: "a", romaji: "ta", hiragana: "た", katakana: "タ", originHiragana: "太" }),
    createKanaEntry({ id: "chi", row: "た行", column: "i", romaji: "chi", hiragana: "ち", katakana: "チ", originHiragana: "知" }),
    createKanaEntry({ id: "tsu", row: "た行", column: "u", romaji: "tsu", hiragana: "つ", katakana: "ツ", originHiragana: "川" }),
    createKanaEntry({ id: "te", row: "た行", column: "e", romaji: "te", hiragana: "て", katakana: "テ", originHiragana: "天" }),
    createKanaEntry({ id: "to", row: "た行", column: "o", romaji: "to", hiragana: "と", katakana: "ト", originHiragana: "止" }),
  ]),
  createKanaRow("na", "な行", [
    createKanaEntry({ id: "na", row: "な行", column: "a", romaji: "na", hiragana: "な", katakana: "ナ", originHiragana: "奈" }),
    createKanaEntry({ id: "ni", row: "な行", column: "i", romaji: "ni", hiragana: "に", katakana: "ニ", originHiragana: "仁" }),
    createKanaEntry({ id: "nu", row: "な行", column: "u", romaji: "nu", hiragana: "ぬ", katakana: "ヌ", originHiragana: "奴" }),
    createKanaEntry({ id: "ne", row: "な行", column: "e", romaji: "ne", hiragana: "ね", katakana: "ネ", originHiragana: "禰" }),
    createKanaEntry({ id: "no", row: "な行", column: "o", romaji: "no", hiragana: "の", katakana: "ノ", originHiragana: "乃" }),
  ]),
  createKanaRow("ha", "は行", [
    createKanaEntry({ id: "ha", row: "は行", column: "a", romaji: "ha", hiragana: "は", katakana: "ハ", originHiragana: "波" }),
    createKanaEntry({ id: "hi", row: "は行", column: "i", romaji: "hi", hiragana: "ひ", katakana: "ヒ", originHiragana: "比" }),
    createKanaEntry({ id: "fu", row: "は行", column: "u", romaji: "fu", hiragana: "ふ", katakana: "フ", originHiragana: "不" }),
    createKanaEntry({ id: "he", row: "は行", column: "e", romaji: "he", hiragana: "へ", katakana: "ヘ", originHiragana: "部" }),
    createKanaEntry({ id: "ho", row: "は行", column: "o", romaji: "ho", hiragana: "ほ", katakana: "ホ", originHiragana: "保" }),
  ]),
  createKanaRow("ma", "ま行", [
    createKanaEntry({ id: "ma", row: "ま行", column: "a", romaji: "ma", hiragana: "ま", katakana: "マ", originHiragana: "末" }),
    createKanaEntry({ id: "mi", row: "ま行", column: "i", romaji: "mi", hiragana: "み", katakana: "ミ", originHiragana: "美" }),
    createKanaEntry({ id: "mu", row: "ま行", column: "u", romaji: "mu", hiragana: "む", katakana: "ム", originHiragana: "武" }),
    createKanaEntry({ id: "me", row: "ま行", column: "e", romaji: "me", hiragana: "め", katakana: "メ", originHiragana: "女" }),
    createKanaEntry({ id: "mo", row: "ま行", column: "o", romaji: "mo", hiragana: "も", katakana: "モ", originHiragana: "毛" }),
  ]),
  createKanaRow("ya", "や行", [
    createKanaEntry({ id: "ya", row: "や行", column: "a", romaji: "ya", hiragana: "や", katakana: "ヤ", originHiragana: "也" }),
    null,
    createKanaEntry({ id: "yu", row: "や行", column: "u", romaji: "yu", hiragana: "ゆ", katakana: "ユ", originHiragana: "由" }),
    null,
    createKanaEntry({ id: "yo", row: "や行", column: "o", romaji: "yo", hiragana: "よ", katakana: "ヨ", originHiragana: "与" }),
  ]),
  createKanaRow("ra", "ら行", [
    createKanaEntry({ id: "ra", row: "ら行", column: "a", romaji: "ra", hiragana: "ら", katakana: "ラ", originHiragana: "良" }),
    createKanaEntry({ id: "ri", row: "ら行", column: "i", romaji: "ri", hiragana: "り", katakana: "リ", originHiragana: "利" }),
    createKanaEntry({ id: "ru", row: "ら行", column: "u", romaji: "ru", hiragana: "る", katakana: "ル", originHiragana: "留" }),
    createKanaEntry({ id: "re", row: "ら行", column: "e", romaji: "re", hiragana: "れ", katakana: "レ", originHiragana: "礼" }),
    createKanaEntry({ id: "ro", row: "ら行", column: "o", romaji: "ro", hiragana: "ろ", katakana: "ロ", originHiragana: "呂" }),
  ]),
  createKanaRow("wa", "わ行", [
    createKanaEntry({ id: "wa", row: "わ行", column: "a", romaji: "wa", hiragana: "わ", katakana: "ワ", originHiragana: "和" }),
    null,
    null,
    createKanaEntry({ id: "wo", row: "わ行", column: "e", romaji: "wo", hiragana: "を", katakana: "ヲ", originHiragana: "遠", notes: "现代日语里常作助词读作 o。" }),
    createKanaEntry({ id: "n", row: "わ行", column: "o", romaji: "n", hiragana: "ん", katakana: "ン", originHiragana: "無", notes: "独立鼻音，常单独学习。" }),
  ]),
];
