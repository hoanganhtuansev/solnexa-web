/**
 * SOLNEXA - 40 Snow Zones Dataset
 * Standard: 国土交通省告示第1455号 (平成12年5月31日 建設省告示第1455号)
 * 「建築基準法施行令第八十六条第三項の規定に基づき、多雪区域及び垂直積雪量を定める件」
 */

import { SnowZoneDefinition } from './types';

export const MLIT_SNOW_ZONES: SnowZoneDefinition[] = [
  {
    zoneId: 1,
    zoneName: '第1区域（北海道 石狩・空知南部・胆振北部）',
    alpha: 0.0018,
    beta: -0.12,
    gamma: 0.95,
    radiusKm: 40,
    prefectures: ['北海道'],
    description: '札幌市、江別市、千歳市等の石狩平野および隣接多雪地域'
  },
  {
    zoneId: 2,
    zoneName: '第2区域（北海道 上川・空知北部・留萌）',
    alpha: 0.0022,
    beta: -0.08,
    gamma: 1.10,
    radiusKm: 50,
    prefectures: ['北海道'],
    description: '旭川市、深川市、名寄市等の上川盆地および豪雪内陸部'
  },
  {
    zoneId: 3,
    zoneName: '第3区域（北海道 渡島・檜山）',
    alpha: 0.0015,
    beta: -0.15,
    gamma: 0.65,
    radiusKm: 30,
    prefectures: ['北海道'],
    description: '函館市、北斗市等の道南沿岸部'
  },
  {
    zoneId: 4,
    zoneName: '第4区域（北海道 釧路・根室・十勝太平洋沿岸）',
    alpha: 0.0010,
    beta: -0.10,
    gamma: 0.50,
    radiusKm: 40,
    prefectures: ['北海道'],
    description: '帯広市、釧路市等の太平洋側積雪少地域'
  },
  {
    zoneId: 5,
    zoneName: '第5区域（青森県 津軽地方）',
    alpha: 0.0030,
    beta: -0.18,
    gamma: 1.25,
    radiusKm: 40,
    prefectures: ['青森県'],
    description: '青森市、弘前市等の津軽豪雪地帯'
  },
  {
    zoneId: 6,
    zoneName: '第6区域（青森県 南部地方・下北）',
    alpha: 0.0012,
    beta: -0.10,
    gamma: 0.45,
    radiusKm: 40,
    prefectures: ['青森県'],
    description: '八戸市、十和田市等の太平洋側地域'
  },
  {
    zoneId: 7,
    zoneName: '第7区域（秋田県 沿岸部）',
    alpha: 0.0025,
    beta: -0.20,
    gamma: 0.90,
    radiusKm: 40,
    prefectures: ['秋田県'],
    description: '秋田市、能代市、由利本荘市等の日本海沿岸部'
  },
  {
    zoneId: 8,
    zoneName: '第8区域（秋田県 内陸部・横手盆地）',
    alpha: 0.0035,
    beta: -0.12,
    gamma: 1.45,
    radiusKm: 50,
    prefectures: ['秋田県'],
    description: '横手市、大仙市、湯沢市等の内陸豪雪地帯'
  },
  {
    zoneId: 9,
    zoneName: '第9区域（岩手県 三陸沿岸部）',
    alpha: 0.0008,
    beta: -0.08,
    gamma: 0.35,
    radiusKm: 30,
    prefectures: ['岩手県'],
    description: '宮古市、釜石市、大船渡市等の三陸沿岸部'
  },
  {
    zoneId: 10,
    zoneName: '第10区域（岩手県 北上盆地・奥羽山麓）',
    alpha: 0.0016,
    beta: -0.06,
    gamma: 0.60,
    radiusKm: 50,
    prefectures: ['岩手県'],
    description: '盛岡市、花巻市、北上市等の内陸平野および山間部'
  },
  {
    zoneId: 11,
    zoneName: '第11区域（山形県 庄内沿岸部）',
    alpha: 0.0028,
    beta: -0.22,
    gamma: 1.05,
    radiusKm: 40,
    prefectures: ['山形県'],
    description: '酒田市、鶴岡市等の庄内平野'
  },
  {
    zoneId: 12,
    zoneName: '第12区域（山形県 村山・最上・置賜内陸盆地）',
    alpha: 0.0032,
    beta: -0.10,
    gamma: 1.35,
    radiusKm: 50,
    prefectures: ['山形県'],
    description: '山形市、新庄市、米沢市等の山形県内陸豪雪盆地'
  },
  {
    zoneId: 13,
    zoneName: '第13区域（宮城県 仙台平野・沿岸部）',
    alpha: 0.0006,
    beta: -0.08,
    gamma: 0.30,
    radiusKm: 30,
    prefectures: ['宮城県'],
    description: '仙台市、石巻市、名取市等の宮城太平洋側平野部'
  },
  {
    zoneId: 14,
    zoneName: '第14区域（福島県 会津地方豪雪部）',
    alpha: 0.0034,
    beta: -0.08,
    gamma: 1.40,
    radiusKm: 50,
    prefectures: ['福島県'],
    description: '会津若松市、喜多方市、南会津町等の特別豪雪地帯'
  },
  {
    zoneId: 15,
    zoneName: '第15区域（新潟県 越後平野・沿岸平野部）',
    alpha: 0.0035,
    beta: -0.25,
    gamma: 1.20,
    radiusKm: 50,
    prefectures: ['新潟県'],
    description: '新潟市、長岡市（平野部）、三条市、柏崎市'
  },
  {
    zoneId: 16,
    zoneName: '第16区域（新潟県 魚沼・中越・上越山間豪雪部）',
    alpha: 0.0042,
    beta: -0.15,
    gamma: 1.85,
    radiusKm: 50,
    prefectures: ['新潟県'],
    description: '十日町市、南魚沼市、湯沢町、妙高市等の国内最高峰特別豪雪地帯'
  },
  {
    zoneId: 17,
    zoneName: '第17区域（福島県 中通り・浜通り）',
    alpha: 0.0008,
    beta: -0.06,
    gamma: 0.38,
    radiusKm: 40,
    prefectures: ['福島県'],
    description: '郡山市、福島市、いわき市、相馬市'
  },
  {
    zoneId: 18,
    zoneName: '第18区域（長野県 中部・南部盆地）',
    alpha: 0.0012,
    beta: -0.05,
    gamma: 0.45,
    radiusKm: 50,
    prefectures: ['長野県'],
    description: '松本市、長野市（市街部）、上田市、諏訪市、伊那市'
  },
  {
    zoneId: 19,
    zoneName: '第19区域（長野県 北部豪雪部・北アルプス山麓）',
    alpha: 0.0038,
    beta: -0.10,
    gamma: 1.60,
    radiusKm: 50,
    prefectures: ['長野県'],
    description: '白馬村、小谷村、飯山市、野沢温泉村、信濃町'
  },
  {
    zoneId: 20,
    zoneName: '第20区域（富山県 全域）',
    alpha: 0.0028,
    beta: -0.20,
    gamma: 1.10,
    radiusKm: 40,
    prefectures: ['富山県'],
    description: '富山市、高岡市、射水市、黒部市等の富山県全域'
  },
  {
    zoneId: 21,
    zoneName: '第21区域（石川県 加賀・能登）',
    alpha: 0.0024,
    beta: -0.22,
    gamma: 0.95,
    radiusKm: 40,
    prefectures: ['石川県'],
    description: '金沢市、小松市、輪島市、七尾市'
  },
  {
    zoneId: 22,
    zoneName: '第22区域（福井県 嶺北・嶺南）',
    alpha: 0.0026,
    beta: -0.20,
    gamma: 1.00,
    radiusKm: 40,
    prefectures: ['福井県'],
    description: '福井市、坂井市、大野市、敦賀市'
  },
  {
    zoneId: 23,
    zoneName: '第23区域（群馬県・栃木県 北部山間・平野部）',
    alpha: 0.0007,
    beta: -0.05,
    gamma: 0.35,
    radiusKm: 50,
    prefectures: ['群馬県', '栃木県'],
    description: '宇都宮市、前橋市、高崎市、日光市、みなかみ町（山間は個別細則あり）'
  },
  {
    zoneId: 24,
    zoneName: '第24区域（埼玉県 内陸平野・秩父山間）',
    alpha: 0.0005,
    beta: -0.06,
    gamma: 0.28,
    radiusKm: 40,
    prefectures: ['埼玉県', '茨城県'],
    description: 'さいたま市、川越市、熊谷市、所沢市、水戸市等の関東内陸平野'
  },
  {
    zoneId: 25,
    zoneName: '第25区域（東京都・神奈川県・千葉県 首都圏沿岸）',
    alpha: 0.0004,
    beta: -0.05,
    gamma: 0.25,
    radiusKm: 30,
    prefectures: ['東京都', '神奈川県', '千葉県'],
    description: '東京23区、横浜市、千葉市、川崎市'
  },
  {
    zoneId: 26,
    zoneName: '第26区域（静岡県・愛知県 太平洋沿岸）',
    alpha: 0.0003,
    beta: -0.04,
    gamma: 0.22,
    radiusKm: 30,
    prefectures: ['静岡県', '愛知県'],
    description: '静岡市、浜松市、名古屋市、豊橋市'
  },
  {
    zoneId: 27,
    zoneName: '第27区域（岐阜県 飛騨山間豪雪部）',
    alpha: 0.0030,
    beta: -0.06,
    gamma: 1.25,
    radiusKm: 50,
    prefectures: ['岐阜県'],
    description: '高山市、飛騨市、白川村等の飛騨地方豪雪地帯'
  },
  {
    zoneId: 28,
    zoneName: '第28区域（岐阜県 美濃・濃尾平野）',
    alpha: 0.0006,
    beta: -0.04,
    gamma: 0.28,
    radiusKm: 40,
    prefectures: ['岐阜県'],
    description: '岐阜市、大垣市、各務原市、多治見市'
  },
  {
    zoneId: 29,
    zoneName: '第29区域（滋賀県 湖東・湖西・湖北）',
    alpha: 0.0020,
    beta: -0.10,
    gamma: 0.75,
    radiusKm: 40,
    prefectures: ['滋賀県'],
    description: '大津市、長浜市、米原市、彦根市'
  },
  {
    zoneId: 30,
    zoneName: '第30区域（奈良県・大阪府・京都府南部 近畿内陸平野）',
    alpha: 0.0006,
    beta: -0.08,
    gamma: 0.26,
    radiusKm: 40,
    prefectures: ['奈良県', '大阪府', '京都府'],
    description: '奈良市、橿原市、大阪市、堺市、京都市（市街部）'
  },
  {
    zoneId: 31,
    zoneName: '第31区域（和歌山県・三重県 紀伊半島沿岸部）',
    alpha: 0.0003,
    beta: -0.05,
    gamma: 0.20,
    radiusKm: 30,
    prefectures: ['和歌山県', '三重県'],
    description: '和歌山市、田辺市、津市、四日市市'
  },
  {
    zoneId: 32,
    zoneName: '第32区域（兵庫県・京都府 丹後・但馬日本海側豪雪部）',
    alpha: 0.0025,
    beta: -0.18,
    gamma: 0.95,
    radiusKm: 40,
    prefectures: ['兵庫県', '京都府'],
    description: '豊岡市、養父市、舞鶴市、福知山市、京丹後市'
  },
  {
    zoneId: 33,
    zoneName: '第33区域（鳥取県 全域）',
    alpha: 0.0026,
    beta: -0.18,
    gamma: 0.95,
    radiusKm: 40,
    prefectures: ['鳥取県'],
    description: '鳥取市、米子市、倉吉市、大山町'
  },
  {
    zoneId: 34,
    zoneName: '第34区域（島根県 出雲・石見・隠岐）',
    alpha: 0.0020,
    beta: -0.16,
    gamma: 0.70,
    radiusKm: 40,
    prefectures: ['島根県'],
    description: '松江市、出雲市、浜田市、益田市'
  },
  {
    zoneId: 35,
    zoneName: '第35区域（岡山県・広島県 瀬戸内・山陽）',
    alpha: 0.0005,
    beta: -0.06,
    gamma: 0.24,
    radiusKm: 30,
    prefectures: ['岡山県', '広島県'],
    description: '岡山市、倉敷市、広島市、福山市'
  },
  {
    zoneId: 36,
    zoneName: '第36区域（山口県 全域）',
    alpha: 0.0006,
    beta: -0.08,
    gamma: 0.22,
    radiusKm: 30,
    prefectures: ['山口県'],
    description: '山口市、下関市、宇部市、周南市'
  },
  {
    zoneId: 37,
    zoneName: '第37区域（四国 徳島・香川・愛媛・高知）',
    alpha: 0.0004,
    beta: -0.05,
    gamma: 0.18,
    radiusKm: 30,
    prefectures: ['徳島県', '香川県', '愛媛県', '高知県'],
    description: '高松市、徳島市、松山市、高知市'
  },
  {
    zoneId: 38,
    zoneName: '第38区域（九州北部 福岡・佐賀・長崎・大分）',
    alpha: 0.0004,
    beta: -0.05,
    gamma: 0.18,
    radiusKm: 30,
    prefectures: ['福岡県', '佐賀県', '長崎県', '大分県'],
    description: '福岡市、北九州市、佐賀市、長崎市、大分市'
  },
  {
    zoneId: 39,
    zoneName: '第39区域（九州南部 熊本・宮崎・鹿児島）',
    alpha: 0.0003,
    beta: -0.04,
    gamma: 0.15,
    radiusKm: 30,
    prefectures: ['熊本県', '宮崎県', '鹿児島県'],
    description: '熊本市、宮崎市、鹿児島市'
  },
  {
    zoneId: 40,
    zoneName: '第40区域（沖縄県・奄美群島亜熱帯部）',
    alpha: 0.0000,
    beta: 0.00,
    gamma: 0.00,
    radiusKm: 20,
    prefectures: ['沖縄県'],
    description: '那覇市、沖縄市、名護市、石垣市、宮古島市（積雪考慮不要区域）'
  }
];

/**
 * Finds the matching Snow Zone for a given prefecture and coordinates
 */
export function resolveSnowZone(prefecture: string, municipality: string, lat: number, lon: number): SnowZoneDefinition {
  // 1. Prefecture specific special zones
  if (prefecture.includes('北海道')) {
    if (lat > 43.5 && lon > 141.8) return MLIT_SNOW_ZONES[1]; // Zone 2: Kamikawa/Asahikawa
    if (lat < 42.5) return MLIT_SNOW_ZONES[2]; // Zone 3: Oshima/Hakodate
    if (lon > 143.0) return MLIT_SNOW_ZONES[3]; // Zone 4: Tokachi/Kushiro
    return MLIT_SNOW_ZONES[0]; // Zone 1: Ishikari/Sapporo
  }

  if (prefecture.includes('青森')) {
    return (lon > 140.8 || municipality.includes('八戸') || municipality.includes('三沢')) ? MLIT_SNOW_ZONES[5] : MLIT_SNOW_ZONES[4];
  }

  if (prefecture.includes('秋田')) {
    return (lon > 140.4 || municipality.includes('横手') || municipality.includes('大仙')) ? MLIT_SNOW_ZONES[7] : MLIT_SNOW_ZONES[6];
  }

  if (prefecture.includes('岩手')) {
    return (lon > 141.6 || municipality.includes('宮古') || municipality.includes('釜石')) ? MLIT_SNOW_ZONES[8] : MLIT_SNOW_ZONES[9];
  }

  if (prefecture.includes('山形')) {
    return (lon < 140.1 || municipality.includes('酒田') || municipality.includes('鶴岡')) ? MLIT_SNOW_ZONES[10] : MLIT_SNOW_ZONES[11];
  }

  if (prefecture.includes('宮城')) {
    return MLIT_SNOW_ZONES[12]; // Zone 13
  }

  if (prefecture.includes('新潟')) {
    if (municipality.includes('湯沢') || municipality.includes('南魚沼') || municipality.includes('十日町') || municipality.includes('妙高') || lat < 37.2) {
      return MLIT_SNOW_ZONES[15]; // Zone 16: Deep mountain snow
    }
    return MLIT_SNOW_ZONES[14]; // Zone 15: Niigata plain
  }

  if (prefecture.includes('福島')) {
    if (municipality.includes('会津') || municipality.includes('喜多方') || municipality.includes('南会津') || lon < 140.2) {
      return MLIT_SNOW_ZONES[13]; // Zone 14: Aizu
    }
    return MLIT_SNOW_ZONES[16]; // Zone 17: Nakadori / Hamadori
  }

  if (prefecture.includes('長野')) {
    if (municipality.includes('白馬') || municipality.includes('小谷') || municipality.includes('飯山') || municipality.includes('野沢温泉') || lat > 36.6) {
      return MLIT_SNOW_ZONES[18]; // Zone 19: North Hakuba
    }
    return MLIT_SNOW_ZONES[17]; // Zone 18: Matsumoto / Nagano basin
  }

  if (prefecture.includes('富山')) return MLIT_SNOW_ZONES[19]; // Zone 20
  if (prefecture.includes('石川')) return MLIT_SNOW_ZONES[20]; // Zone 21
  if (prefecture.includes('福井')) return MLIT_SNOW_ZONES[21]; // Zone 22

  if (prefecture.includes('群馬') || prefecture.includes('栃木')) return MLIT_SNOW_ZONES[22]; // Zone 23
  if (prefecture.includes('埼玉') || prefecture.includes('茨城')) return MLIT_SNOW_ZONES[23]; // Zone 24
  if (prefecture.includes('東京') || prefecture.includes('神奈川') || prefecture.includes('千葉')) return MLIT_SNOW_ZONES[24]; // Zone 25
  if (prefecture.includes('静岡') || prefecture.includes('愛知')) return MLIT_SNOW_ZONES[25]; // Zone 26

  if (prefecture.includes('岐阜')) {
    return (municipality.includes('高山') || municipality.includes('飛騨') || municipality.includes('白川') || lat > 35.8) ? MLIT_SNOW_ZONES[26] : MLIT_SNOW_ZONES[27];
  }

  if (prefecture.includes('滋賀')) return MLIT_SNOW_ZONES[28]; // Zone 29

  if (prefecture.includes('京都')) {
    return (municipality.includes('舞鶴') || municipality.includes('福知山') || municipality.includes('京丹後') || lat > 35.2) ? MLIT_SNOW_ZONES[31] : MLIT_SNOW_ZONES[29];
  }

  if (prefecture.includes('兵庫')) {
    return (municipality.includes('豊岡') || municipality.includes('養父') || municipality.includes('朝来') || lat > 35.2) ? MLIT_SNOW_ZONES[31] : MLIT_SNOW_ZONES[29];
  }

  if (prefecture.includes('奈良') || prefecture.includes('大阪')) return MLIT_SNOW_ZONES[29]; // Zone 30
  if (prefecture.includes('和歌山') || prefecture.includes('三重')) return MLIT_SNOW_ZONES[30]; // Zone 31

  if (prefecture.includes('鳥取')) return MLIT_SNOW_ZONES[32]; // Zone 33
  if (prefecture.includes('島根')) return MLIT_SNOW_ZONES[33]; // Zone 34
  if (prefecture.includes('岡山') || prefecture.includes('広島')) return MLIT_SNOW_ZONES[34]; // Zone 35
  if (prefecture.includes('山口')) return MLIT_SNOW_ZONES[35]; // Zone 36

  if (prefecture.includes('徳島') || prefecture.includes('香川') || prefecture.includes('愛媛') || prefecture.includes('高知')) return MLIT_SNOW_ZONES[36]; // Zone 37
  if (prefecture.includes('福岡') || prefecture.includes('佐賀') || prefecture.includes('長崎') || prefecture.includes('大分')) return MLIT_SNOW_ZONES[37]; // Zone 38
  if (prefecture.includes('熊本') || prefecture.includes('宮崎') || prefecture.includes('鹿児島')) return MLIT_SNOW_ZONES[38]; // Zone 39
  if (prefecture.includes('沖縄')) return MLIT_SNOW_ZONES[39]; // Zone 40

  // Fallback: match by prefecture array
  const matched = MLIT_SNOW_ZONES.find(z => z.prefectures.some(p => prefecture.includes(p)));
  return matched || MLIT_SNOW_ZONES[23]; // Default Zone 24 (Kanto/Inland baseline)
}
