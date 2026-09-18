import type { GalleryEntry } from "./destination-gallery";

/**
 * destination-gallery-wave2 — wave2 新增 50 城的结构化画廊。
 *
 *   · 首图 = 该城 Hero（最具辨识度的城市视觉）；其余为该城真实地标照片。
 *   · 每城最多 6 张（含首图），去重；实测 50 城，最少 4 张。
 *   · 全部逐张整图 GET（HTTP 200 + image/*）校验；主体匹配规则同 attractions-wave2。
 *   · 未收录城市仍走既有回退逻辑（行为不变）。
 *
 * verifiedAt（人工核验）：2026-09-18
 */

export const DESTINATION_GALLERY_WAVE2: Record<string, GalleryEntry[]> = {
  "marrakech": [
    {
      src:
        "https://images.pexels.com/photos/36598429/pexels-photo-36598429.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Ancient ruins in marrakech morocco",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/0/0b/Storytellers_in_Jemaa_el-Fnaa_%28Marrakech%2C_Morocco%29_%2815722800436%29.jpg",
      alt: "Jemaa el-Fnaa, Marrakech",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/35816095/pexels-photo-35816095.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Koutoubia Mosque, Marrakech",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/4220977/pexels-photo-4220977.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Bahia Palace, Marrakech",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/36966417/pexels-photo-36966417.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Jardin Majorelle, Marrakech",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/15260633/pexels-photo-15260633.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Ben Youssef Madrasa, Marrakech",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "casablanca": [
    {
      src:
        "https://images.pexels.com/photos/30846938/pexels-photo-30846938.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Scenic seaside wall in casablanca morocco",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/25945757/pexels-photo-25945757.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Hassan II Mosque, Casablanca",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Quartier_Habous_Casablanca.jpg/1920px-Quartier_Habous_Casablanca.jpg",
      alt: "Habous Quarter, Casablanca",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37765242/pexels-photo-37765242.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Casablanca Cathedral, Casablanca",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/5/5f/Parc_de_la_Ligue_Arabe_Casablanca_2007.jpg",
      alt: "Parc de la Ligue Arabe, Casablanca",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Promenade_sur_la_Corniche_Ain_Diab_%C3%A0_Casablanca_-_photo_Bertrand_SOUBEYRAND.jpg/1920px-Promenade_sur_la_Corniche_Ain_Diab_%C3%A0_Casablanca_-_photo_Bertrand_SOUBEYRAND.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Corniche Ain Diab, Casablanca",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "fes": [
    {
      src:
        "https://images.pexels.com/photos/28582577/pexels-photo-28582577.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Traditional market stall in fes morocco",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/16049500/pexels-photo-16049500.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Al-Qarawiyyin Mosque and University, Fes",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/38111694/pexels-photo-38111694.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Bou Inania Madrasa, Fes",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Chouara_Tannery.jpg/1920px-Chouara_Tannery.jpg",
      alt: "Chouara Tannery, Fes",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/30279399/pexels-photo-30279399.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Bab Bou Jeloud, Fes",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/19190380/pexels-photo-19190380.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Al-Attarine Madrasa, Fes",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "luxor": [
    {
      src:
        "https://images.pexels.com/photos/34664285/pexels-photo-34664285.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Aerial view of hot air balloons over luxor desert",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/20987972/pexels-photo-20987972.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Karnak Temple Complex, Luxor",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/31730176/pexels-photo-31730176.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Luxor Temple, Luxor",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/18934704/pexels-photo-18934704.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Valley of the Kings, Luxor",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/6102266/pexels-photo-6102266.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Mortuary Temple of Hatshepsut, Luxor",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/36336689/pexels-photo-36336689.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Colossi of Memnon, Luxor",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "aswan": [
    {
      src:
        "https://images.pexels.com/photos/31659551/pexels-photo-31659551.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Historic hotel in aswan by the nile river",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/35549851/pexels-photo-35549851.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Abu Simbel Temples, Aswan",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/33691550/pexels-photo-33691550.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Philae Temple, Aswan",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Aswan_High_Dam-1.jpg/3840px-Aswan_High_Dam-1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Aswan High Dam, Aswan",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Elephantine_Island%2C_Aswan%2C_AG%2C_EGY_%2848025286316%29.jpg/1920px-Elephantine_Island%2C_Aswan%2C_AG%2C_EGY_%2848025286316%29.jpg",
      alt: "Elephantine Island, Aswan",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Unfinished_Obelisk_in_Aswan.jpg/1920px-Unfinished_Obelisk_in_Aswan.jpg",
      alt: "Unfinished Obelisk, Aswan",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "tunis": [
    {
      src:
        "https://images.pexels.com/photos/38203376/pexels-photo-38203376.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Charming street scene in tunis tunisia",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/38002206/pexels-photo-38002206.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Medina of Tunis, Tunis",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/38224377/pexels-photo-38224377.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Bardo National Museum, Tunis",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/20190785/pexels-photo-20190785.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Zitouna Mosque, Tunis",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/32465896/pexels-photo-32465896.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Sidi Bou Said, Tunis",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/8577260/pexels-photo-8577260.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Baths of Antoninus, Tunis",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "zanzibar": [
    {
      src:
        "https://images.pexels.com/photos/24247143/pexels-photo-24247143.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Back view of women in veils walking in the alley between buildings on zanzibar tanzania, Zanzibar City",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37087442/pexels-photo-37087442.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Stone Town, Zanzibar City",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Old_Fort_of_Zanzibar_%28Boma_la_Kale_la_Zanzibar%29.jpg/1920px-Old_Fort_of_Zanzibar_%28Boma_la_Kale_la_Zanzibar%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Old Fort, Zanzibar City",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Forodhani_jubilee_gardens_Zanzibar.jpg/1920px-Forodhani_jubilee_gardens_Zanzibar.jpg",
      alt: "Forodhani Gardens, Zanzibar City",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Darajani_Market_%2CZanzibar.jpg/1920px-Darajani_Market_%2CZanzibar.jpg",
      alt: "Darajani Market, Zanzibar City",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/14401141/pexels-photo-14401141.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Palace Museum, Zanzibar City",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "victoria-falls": [
    {
      src:
        "https://images.pexels.com/photos/35271379/pexels-photo-35271379.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Aerial view of majestic victoria falls in africa",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Cataratas_Victoria%2C_Zambia-Zimbabue%2C_2018-07-27%2C_DD_30-34_PAN.jpg/3840px-Cataratas_Victoria%2C_Zambia-Zimbabue%2C_2018-07-27%2C_DD_30-34_PAN.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Victoria Falls (Mosi-oa-Tunya), Victoria Falls",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/30172599/pexels-photo-30172599.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Victoria Falls Bridge, Victoria Falls",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Mosi-oa-Tunya_National_Park%2C_Zambia_%2848598087667%29.jpg/1920px-Mosi-oa-Tunya_National_Park%2C_Zambia_%2848598087667%29.jpg",
      alt: "Mosi-oa-Tunya National Park, Victoria Falls",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/The_Big_Tree%2C_Victoria_Falls.jpg/1920px-The_Big_Tree%2C_Victoria_Falls.jpg",
      alt: "The Big Tree, Victoria Falls",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mosi-oa-Tunya%2C_Livingstone_%2820260519-P1075665%29.jpg/1920px-Mosi-oa-Tunya%2C_Livingstone_%2820260519-P1075665%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Livingstone Island, Victoria Falls",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "johannesburg": [
    {
      src:
        "https://images.pexels.com/photos/35697020/pexels-photo-35697020.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Modern architecture in sandton johannesburg",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Entrance_to_the_museum_of_apartheid._Johannesburg._South_Africa.jpg/1920px-Entrance_to_the_museum_of_apartheid._Johannesburg._South_Africa.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Apartheid Museum, Johannesburg",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Eternal_Flame_on_Constitution_Hill_in_Johannesburg.JPG/1920px-Eternal_Flame_on_Constitution_Hill_in_Johannesburg.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Constitution Hill, Johannesburg",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Vilakazi_street_performers.jpg/1920px-Vilakazi_street_performers.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Vilakazi Street, Johannesburg",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/1._Looking_for_Transport_in_Maboneng%2C_Johannesburg%2C_South_Africa.jpg/1920px-1._Looking_for_Transport_in_Maboneng%2C_Johannesburg%2C_South_Africa.jpg",
      alt: "Maboneng Precinct, Johannesburg",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Origins_Centre_and_M1_highway.jpg/1920px-Origins_Centre_and_M1_highway.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Origins Centre, Johannesburg",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "port-louis": [
    {
      src:
        "https://images.pexels.com/photos/32964865/pexels-photo-32964865.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Port louis tugboat approaching a docked ship",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Aapravasi_ghat_museum%2C_Port_Louis%2C_Mauritius.jpg/1920px-Aapravasi_ghat_museum%2C_Port_Louis%2C_Mauritius.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Aapravasi Ghat, Port Louis",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Umbrellas_at_Caudan_Waterfront_Mall.JPG/1920px-Umbrellas_at_Caudan_Waterfront_Mall.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Le Caudan Waterfront, Port Louis",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Herbal_tisanes_for_several_ailments_on_sale_at_the_Central_Market%2C_Port_Louis%2C_Mauritius.jpg/3840px-Herbal_tisanes_for_several_ailments_on_sale_at_the_Central_Market%2C_Port_Louis%2C_Mauritius.jpg",
      alt: "Central Market, Port Louis",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Mauritius_citadelle_fort_adelaide.jpg/1920px-Mauritius_citadelle_fort_adelaide.jpg",
      alt: "Citadel Fort Adelaide, Port Louis",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Blue_Penny_Museum_%28Port_Louis%2C_Mauritius%29.jpg/1920px-Blue_Penny_Museum_%28Port_Louis%2C_Mauritius%29.jpg",
      alt: "Blue Penny Museum, Port Louis",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "victoria-seychelles": [
    {
      src:
        "https://images.pexels.com/photos/12987327/pexels-photo-12987327.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: "Aerial View of Victoria",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Big_Ben_Clock_Tower_-_Victoria_-_Mahe_-_Seychelles_-_01.jpg/1920px-Big_Ben_Clock_Tower_-_Victoria_-_Mahe_-_Seychelles_-_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Victoria Clock Tower, Victoria",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Vendors_and_produce%2C_Sir_Selwyn_Clarke_Market%2C_Victoria%2C_Seychelles.jpg/1920px-Vendors_and_produce%2C_Sir_Selwyn_Clarke_Market%2C_Victoria%2C_Seychelles.jpg",
      alt: "Sir Selwyn Selwyn-Clarke Market, Victoria",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Victoria_Mont_Fleuri_Botanical_Garden_asv2024-09_img2.jpg/3840px-Victoria_Mont_Fleuri_Botanical_Garden_asv2024-09_img2.jpg",
      alt: "Seychelles National Botanical Gardens, Victoria",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Beau_Vallon%2C_Mah%C3%A9%2C_Seychelles%2C_2025-09-07%2C_DD_02.jpg/1920px-Beau_Vallon%2C_Mah%C3%A9%2C_Seychelles%2C_2025-09-07%2C_DD_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Beau Vallon Beach, Victoria",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/c/c5/Ile_de_Mahe_-_Morne_Seychellois_%281%29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
      alt: "Morne Seychellois National Park, Victoria",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "accra": [
    {
      src:
        "https://images.pexels.com/photos/28302097/pexels-photo-28302097.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Relaxed street scene in accra ghana",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/6374574/pexels-photo-6374574.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Independence Square (Black Star Square), Accra",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37539845/pexels-photo-37539845.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Kwame Nkrumah Memorial Park, Accra",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Makola_Market_Entrance%2C_Accra%2C_Ghana.JPG/1920px-Makola_Market_Entrance%2C_Accra%2C_Ghana.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Makola Market, Accra",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37574987/pexels-photo-37574987.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Jamestown Lighthouse, Accra",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Museum_Ground_floor_from_1st_floor.jpg/1920px-Museum_Ground_floor_from_1st_floor.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "National Museum of Ghana, Accra",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "dakar": [
    {
      src:
        "https://images.pexels.com/photos/37904482/pexels-photo-37904482.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Vibrant minibus on dakar street next to historic church",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/African_Renaissance_Monument_Dakar_2025.jpg/1920px-African_Renaissance_Monument_Dakar_2025.jpg",
      alt: "African Renaissance Monument, Dakar",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/36508969/pexels-photo-36508969.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Gorée Island, Dakar",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Salt-harvesting_at_Lake_Retba_%28Lac_Rose%29_%2854205608528%29.jpg/1920px-Salt-harvesting_at_Lake_Retba_%28Lac_Rose%29_%2854205608528%29.jpg",
      alt: "Lake Retba (Lac Rose), Dakar",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Grande_mosqu%C3%A9e_de_Dakar.jpg/1920px-Grande_mosqu%C3%A9e_de_Dakar.jpg",
      alt: "Dakar Grand Mosque, Dakar",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mus%C3%A9e_des_civilisations_noires_2022.jpg/1920px-Mus%C3%A9e_des_civilisations_noires_2022.jpg",
      alt: "Museum of Black Civilisations, Dakar",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "addis-ababa": [
    {
      src:
        "https://images.pexels.com/photos/36200692/pexels-photo-36200692.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Stunning addis ababa city skyline view",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Central_Exhibition_Hall_-_National_Museum_of_Ethiopia_-_Addis_Ababa_-_Ethiopia_%288744259542%29.jpg/1920px-Central_Exhibition_Hall_-_National_Museum_of_Ethiopia_-_Addis_Ababa_-_Ethiopia_%288744259542%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "National Museum of Ethiopia, Addis Ababa",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Holy_Trinity_Cathedral%2C_Addis_Ababa_%283434312871%29.jpg/1920px-Holy_Trinity_Cathedral%2C_Addis_Ababa_%283434312871%29.jpg",
      alt: "Holy Trinity Cathedral, Addis Ababa",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Merkato_area_%2825095201411%29.jpg/1920px-Merkato_area_%2825095201411%29.jpg",
      alt: "Merkato, Addis Ababa",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Church_on_the_Mount_Entoto.jpg/1920px-Church_on_the_Mount_Entoto.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Mount Entoto, Addis Ababa",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/6/69/Unity_Park_Addis_Ababa_Ethiopia_1.jpg",
      alt: "Unity Park, Addis Ababa",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "sao-paulo": [
    {
      src:
        "https://images.pexels.com/photos/13234771/pexels-photo-13234771.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Cityscape of sao paulo in brazil, São Paulo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/34161929/pexels-photo-34161929.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Ibirapuera Park, São Paulo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/32423613/pexels-photo-32423613.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "São Paulo Museum of Art (MASP), São Paulo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Conservas_en_un_puesto_japones_del_Mercado_Municipal_de_Sao_Paulo.jpg/1920px-Conservas_en_un_puesto_japones_del_Mercado_Municipal_de_Sao_Paulo.jpg",
      alt: "Mercado Municipal de São Paulo, São Paulo",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/6507406/pexels-photo-6507406.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Pinacoteca do Estado, São Paulo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/31811013/pexels-photo-31811013.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Theatro Municipal, São Paulo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "cartagena": [
    {
      src:
        "https://images.pexels.com/photos/17745834/pexels-photo-17745834.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "City street with a view of the cathedral of cartagena de indias i",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Ciudad_Amurallada_Cartagena_de_Indias.jpg/1920px-Ciudad_Amurallada_Cartagena_de_Indias.jpg",
      alt: "Ciudad Amurallada (Walled City), Cartagena",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Castillo_San_Felipe_de_Barajas%2C_Cartagena_25.jpg/1920px-Castillo_San_Felipe_de_Barajas%2C_Cartagena_25.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Castillo San Felipe de Barajas, Cartagena",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Getsemani_Street_Scene%2C_Cartagena%2C_Colombia_%2823957406474%29.jpg/1920px-Getsemani_Street_Scene%2C_Cartagena%2C_Colombia_%2823957406474%29.jpg",
      alt: "Getsemaní, Cartagena",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/15936586/pexels-photo-15936586.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Torre del Reloj, Cartagena",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Private_island_-_Islas_del_Rosario_%284626312640%29.jpg/1920px-Private_island_-_Islas_del_Rosario_%284626312640%29.jpg",
      alt: "Rosario Islands, Cartagena",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "medellin": [
    {
      src:
        "https://images.pexels.com/photos/15293179/pexels-photo-15293179.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Las palmas medellin where the mountains meet the city, Medellín",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Medell%C3%ADn%2C_Museo_de_Antioquia%2C_2023-07_CN-01.jpg/1920px-Medell%C3%ADn%2C_Museo_de_Antioquia%2C_2023-07_CN-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Museo de Antioquia, Medellín",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Medell%C3%ADn%2C_Plaza_Botero%2C_2023-07_CN-01.jpg/3840px-Medell%C3%ADn%2C_Plaza_Botero%2C_2023-07_CN-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Plaza Botero, Medellín",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37278677/pexels-photo-37278677.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Comuna 13, Medellín",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Metrocable_del_Parque_Arv%C3%AD_-_Medell%C3%ADn.jpg/3840px-Metrocable_del_Parque_Arv%C3%AD_-_Medell%C3%ADn.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Arví Park, Medellín",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/18156722/pexels-photo-18156722.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Pueblito Paisa, Medellín",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "oaxaca": [
    {
      src:
        "https://images.pexels.com/photos/37361509/pexels-photo-37361509.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Charming street in oaxaca with hanging flowers",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/30266266/pexels-photo-30266266.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Monte Albán, Oaxaca",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Templo_de_Santo_Domingo_de_Guzm%C3%A1n-_2023.jpg/1920px-Templo_de_Santo_Domingo_de_Guzm%C3%A1n-_2023.jpg",
      alt: "Templo de Santo Domingo de Guzmán, Oaxaca",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Zocalo%2C_oaxaca%2C_oaxaca_-_panoramio.jpg/1920px-Zocalo%2C_oaxaca%2C_oaxaca_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Plaza de la Constitución (Zócalo), Oaxaca",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/33601910/pexels-photo-33601910.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Hierve el Agua, Oaxaca",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37908073/pexels-photo-37908073.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Mitla, Oaxaca",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "san-juan": [
    {
      src:
        "https://images.pexels.com/photos/20795503/pexels-photo-20795503.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Residential buildings of san juan",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/31451136/pexels-photo-31451136.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Old San Juan, San Juan",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Castillo_San_Felipe_del_Morro_aerial%2C_May_2024_-_01.jpg/1920px-Castillo_San_Felipe_del_Morro_aerial%2C_May_2024_-_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Castillo San Felipe del Morro, San Juan",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/1/1e/Castillo_San_Cristobal_SJU_06_2019_7581.jpg",
      alt: "Castillo San Cristóbal, San Juan",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/14724087/pexels-photo-14724087.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "La Fortaleza, San Juan",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/20014663/pexels-photo-20014663.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "El Yunque National Forest, San Juan",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "panama-city": [
    {
      src:
        "https://images.pexels.com/photos/14840824/pexels-photo-14840824.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Cityscape of panama city downtown panama",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/32119729/pexels-photo-32119729.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Miraflores Locks, Panama City",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Panama_Casco_Antiguo_panorama.jpg/1920px-Panama_Casco_Antiguo_panorama.jpg",
      alt: "Casco Antiguo, Panama City",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/11371694/pexels-photo-11371694.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Biomuseo, Panama City",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Calzada_de_amador.jpg/1920px-Calzada_de_amador.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Amador Causeway, Panama City",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Metropolitan_Natural_Park%2C_Panama_City.jpg/1920px-Metropolitan_Natural_Park%2C_Panama_City.jpg",
      alt: "Metropolitan Natural Park, Panama City",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "montevideo": [
    {
      src:
        "https://images.pexels.com/photos/12161968/pexels-photo-12161968.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Montevideo landmark near the beach",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/2016_Mercado_del_Puerto_de_Montevideo.jpg/1920px-2016_Mercado_del_Puerto_de_Montevideo.jpg",
      alt: "Mercado del Puerto, Montevideo",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/33130032/pexels-photo-33130032.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Plaza Independencia, Montevideo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Montevideo_Rambla-20110506-RM-120836.jpg/1920px-Montevideo_Rambla-20110506-RM-120836.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Rambla of Montevideo, Montevideo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/35069944/pexels-photo-35069944.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Palacio Legislativo, Montevideo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Atardecer_en_Pocitos%2C_Montevideo%2C_Uruguay.jpg/1920px-Atardecer_en_Pocitos%2C_Montevideo%2C_Uruguay.jpg",
      alt: "Pocitos, Montevideo",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "quito": [
    {
      src:
        "https://images.pexels.com/photos/18506879/pexels-photo-18506879.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Panorama of quito cityscape with epiq tower",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37244764/pexels-photo-37244764.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Basílica del Voto Nacional, Quito",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Iglesia_de_La_Compa%C3%B1%C3%ADa%2C_Quito%2C_Ecuador%2C_2015-07-22%2C_DD_116-118_HDR.JPG/1920px-Iglesia_de_La_Compa%C3%B1%C3%ADa%2C_Quito%2C_Ecuador%2C_2015-07-22%2C_DD_116-118_HDR.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "La Compañía de Jesús, Quito",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Mitad_del_Mundo%2C_Quito%2C_Ecuador%2C_2015-07-22%2C_DD_02.JPG/1920px-Mitad_del_Mundo%2C_Quito%2C_Ecuador%2C_2015-07-22%2C_DD_02.JPG",
      alt: "Mitad del Mundo, Quito",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Gondolas_of_the_TeleferiQo_in_Quito%2C_Ecuador.jpg/1920px-Gondolas_of_the_TeleferiQo_in_Quito%2C_Ecuador.jpg",
      alt: "TelefériQo, Quito",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/32497238/pexels-photo-32497238.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Plaza Grande, Quito",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "ushuaia": [
    {
      src:
        "https://images.pexels.com/photos/39485112/pexels-photo-39485112.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Scenic winter landscape of ushuaia argentina",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/16994231/pexels-photo-16994231.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Tierra del Fuego National Park, Ushuaia",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/38515940/pexels-photo-38515940.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Beagle Channel, Ushuaia",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Martial_Mountains_1.JPG/1920px-Martial_Mountains_1.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Martial Glacier, Ushuaia",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Museo_Maritimo_y_Ex_Presidio_de_Ushuaia_14.jpg/1920px-Museo_Maritimo_y_Ex_Presidio_de_Ushuaia_14.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Museo Marítimo y del Presidio de Ushuaia, Ushuaia",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/13557596/pexels-photo-13557596.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Laguna Esmeralda, Ushuaia",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "san-antonio": [
    {
      src:
        "https://images.pexels.com/photos/39387628/pexels-photo-39387628.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Scenic view of san antonio riverwalk restaurants",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/36131850/pexels-photo-36131850.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "The Alamo, San Antonio",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/19421896/pexels-photo-19421896.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "San Antonio River Walk, San Antonio",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/4863947/pexels-photo-4863947.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Tower of the Americas, San Antonio",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/20731633/pexels-photo-20731633.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "San Antonio Missions National Historical Park, San Antonio",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/San_Antonio_July_2017_10_%28El_Mercado%29.jpg/1920px-San_Antonio_July_2017_10_%28El_Mercado%29.jpg",
      alt: "Market Square (El Mercado), San Antonio",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "savannah": [
    {
      src:
        "https://images.pexels.com/photos/29333205/pexels-photo-29333205.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Scenic oak tree canopy in savannah georgia",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/31546896/pexels-photo-31546896.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Forsyth Park, Savannah",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/267_Forsyth_Park%2C_Savannah%2C_Georgia.jpg/1920px-267_Forsyth_Park%2C_Savannah%2C_Georgia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Savannah Historic District, Savannah",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/32637443/pexels-photo-32637443.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Bonaventure Cemetery, Savannah",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Tabby_ruins_at_Wormsloe_State_Historic_site_Savannah%2C_Georgia.jpg/1920px-Tabby_ruins_at_Wormsloe_State_Historic_site_Savannah%2C_Georgia.jpg",
      alt: "Wormsloe Historic Site, Savannah",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Buildings_facing_River_Street%2C_Savannah%2C_Georgia.jpg/1920px-Buildings_facing_River_Street%2C_Savannah%2C_Georgia.jpg",
      alt: "River Street, Savannah",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "montego-bay": [
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Montego_bay-1001.jpg/1920px-Montego_bay-1001.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Spectacular fireworks over montego bay at night",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/a/ac/Doctors-Cave-Beach.jpg",
      alt: "Doctor's Cave Beach, Montego Bay",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/St_James_Church%2C_Montego_Bay.jpg/1920px-St_James_Church%2C_Montego_Bay.jpg",
      alt: "St. James Parish Church, Montego Bay",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Greenwood_Great_House.jpg/1920px-Greenwood_Great_House.jpg",
      alt: "Greenwood Great House, Montego Bay",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "new-delhi": [
    {
      src:
        "https://images.pexels.com/photos/13751552/pexels-photo-13751552.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "The safdarjung tomb in new delhi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/38583281/pexels-photo-38583281.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "India Gate, New Delhi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/14094276/pexels-photo-14094276.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Red Fort, New Delhi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/17348001/pexels-photo-17348001.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Qutub Minar, New Delhi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/10933128/pexels-photo-10933128.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Humayun's Tomb, New Delhi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/34662732/pexels-photo-34662732.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Lotus Temple, New Delhi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "agra": [
    {
      src:
        "https://images.pexels.com/photos/37899513/pexels-photo-37899513.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Scenic view of taj mahal from agra rooftops",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/11521892/pexels-photo-11521892.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Taj Mahal, Agra",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/31301782/pexels-photo-31301782.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Agra Fort, Agra",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Mehtab_Bagh-Agra-Uttar_Pradesh-N-AP-A18.jpg/1920px-Mehtab_Bagh-Agra-Uttar_Pradesh-N-AP-A18.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Mehtab Bagh, Agra",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/16738840/pexels-photo-16738840.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Itmad-ud-Daulah's Tomb, Agra",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/36449833/pexels-photo-36449833.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Fatehpur Sikri, Agra",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "varanasi": [
    {
      src:
        "https://images.pexels.com/photos/12112985/pexels-photo-12112985.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Waterfront buildings in varanasi by the ganges india",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Shri_Kashi_Vishwanath_Temple_2.jpg/1920px-Shri_Kashi_Vishwanath_Temple_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Kashi Vishwanath Temple, Varanasi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/31602871/pexels-photo-31602871.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Dashashwamedh Ghat, Varanasi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Assi_Ghat_boats_Varanasi.jpg/1920px-Assi_Ghat_boats_Varanasi.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Assi Ghat, Varanasi",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/30984692/pexels-photo-30984692.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Sarnath, Varanasi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/36213406/pexels-photo-36213406.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Ramnagar Fort, Varanasi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "samarkand": [
    {
      src:
        "https://images.pexels.com/photos/34168957/pexels-photo-34168957.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Intricate architecture of samarkand mausoleum",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/35220191/pexels-photo-35220191.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Registan, Samarkand",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/32653752/pexels-photo-32653752.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Gur-e-Amir, Samarkand",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/35275568/pexels-photo-35275568.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Shah-i-Zinda, Samarkand",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/18118640/pexels-photo-18118640.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Bibi-Khanym Mosque, Samarkand",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/%D0%9E%D0%B1%D1%81%D0%B5%D1%80%D0%B2%D0%B0%D1%82%D0%BE%D1%80%D0%B8%D1%8F_%D0%A3%D0%BB%D1%83%D0%B3%D0%B1%D0%B5%D0%BA%D0%B0%2C_%D0%A1%D0%B0%D0%BC%D0%B0%D1%80%D0%BA%D0%B0%D0%BD%D0%B4_%28Ulugh_Beg_Observatory%2C_Samarkand%29.jpg/1920px-%D0%9E%D0%B1%D1%81%D0%B5%D1%80%D0%B2%D0%B0%D1%82%D0%BE%D1%80%D0%B8%D1%8F_%D0%A3%D0%BB%D1%83%D0%B3%D0%B1%D0%B5%D0%BA%D0%B0%2C_%D0%A1%D0%B0%D0%BC%D0%B0%D1%80%D0%BA%D0%B0%D0%BD%D0%B4_%28Ulugh_Beg_Observatory%2C_Samarkand%29.jpg",
      alt: "Ulugh Beg Observatory, Samarkand",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "muscat": [
    {
      src:
        "https://images.pexels.com/photos/33079575/pexels-photo-33079575.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Architectural view of muscat with mountains",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37417544/pexels-photo-37417544.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Sultan Qaboos Grand Mosque, Muscat",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37703020/pexels-photo-37703020.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Mutrah Souq, Muscat",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Fort_al-Jalali_in_Muscat%2C_Oman.jpg/1920px-Fort_al-Jalali_in_Muscat%2C_Oman.jpg",
      alt: "Al Jalali Fort, Muscat",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/32166312/pexels-photo-32166312.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Royal Opera House Muscat, Muscat",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Qurum_Beach_in_Muscat_2019-11-30.jpg/1920px-Qurum_Beach_in_Muscat_2019-11-30.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Qurum Beach, Muscat",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "jeddah": [
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Jeddah_skyline_February_2020.jpg/1920px-Jeddah_skyline_February_2020.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Historic minaret in jeddah s old town",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/28506244/pexels-photo-28506244.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Al-Balad (Historic Jeddah), Jeddah",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/King_Fahd%27s_Fountain_Jeddah_Fountain_%285129797428%29.jpg/1920px-King_Fahd%27s_Fountain_Jeddah_Fountain_%285129797428%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "King Fahd's Fountain, Jeddah",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/34744916/pexels-photo-34744916.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Jeddah Corniche, Jeddah",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/32879718/pexels-photo-32879718.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Al-Rahma Mosque (Floating Mosque), Jeddah",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Al-Shafi%E2%80%99i_Mosque.jpg/1920px-Al-Shafi%E2%80%99i_Mosque.jpg",
      alt: "Al-Shafi'i Mosque, Jeddah",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "tbilisi": [
    {
      src:
        "https://images.pexels.com/photos/8681306/pexels-photo-8681306.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Waterfront view of tbilisi with bridge of peace visible in georgia",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/19063134/pexels-photo-19063134.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Narikala Fortress, Tbilisi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/17286332/pexels-photo-17286332.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Abanotubani (Sulfur Baths), Tbilisi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/15820821/pexels-photo-15820821.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Bridge of Peace, Tbilisi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/16658272/pexels-photo-16658272.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Holy Trinity Cathedral, Tbilisi",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Tbilisi%2C_Rustaveli_Avenue%2C_Georgia.jpg/1920px-Tbilisi%2C_Rustaveli_Avenue%2C_Georgia.jpg",
      alt: "Rustaveli Avenue, Tbilisi",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "bagan": [
    {
      src:
        "https://images.pexels.com/photos/36827486/pexels-photo-36827486.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Silhouette of agricultural scene in bagan at sunset",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/9350442/pexels-photo-9350442.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Ananda Temple, Bagan",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Shwezigon_Pagoda%2C_Bagan.jpg/1920px-Shwezigon_Pagoda%2C_Bagan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Shwezigon Pagoda, Bagan",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Bagan%2C_Myanmar%2C_Dhammayangyi_Temple.jpg/1920px-Bagan%2C_Myanmar%2C_Dhammayangyi_Temple.jpg",
      alt: "Dhammayangyi Temple, Bagan",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/13798001/pexels-photo-13798001.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Thatbyinnyu Temple, Bagan",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2013_Myanmar_Luyten-De-Hauwere_Bagan_072_Shwesandaw_Pagoda.jpg/1920px-2013_Myanmar_Luyten-De-Hauwere_Bagan_072_Shwesandaw_Pagoda.jpg",
      alt: "Shwesandaw Pagoda, Bagan",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "vientiane": [
    {
      src:
        "https://images.pexels.com/photos/36477129/pexels-photo-36477129.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Patuxai monument in vientiane at daytime",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/20171118_Pha_That_Luang_in_Vientiane_3169_DxO.jpg/1920px-20171118_Pha_That_Luang_in_Vientiane_3169_DxO.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Pha That Luang, Vientiane",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/31418553/pexels-photo-31418553.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Patuxai, Vientiane",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Wat_Si_Saket_front_view%2C_Vientiane%2C_Laos.jpg/1920px-Wat_Si_Saket_front_view%2C_Vientiane%2C_Laos.jpg",
      alt: "Wat Si Saket, Vientiane",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Haw_Phra_Kaew.jpg/1920px-Haw_Phra_Kaew.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Haw Phra Kaew, Vientiane",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/17757818/pexels-photo-17757818.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Buddha Park (Xieng Khuan), Vientiane",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "kota-kinabalu": [
    {
      src:
        "https://images.pexels.com/photos/36692772/pexels-photo-36692772.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Stunning blue mosque in kota kinabalu malaysia",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/38374420/pexels-photo-38374420.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Mount Kinabalu, Kota Kinabalu",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/View_of_Mount_Kinabalu_taken_from_Manukan_Island_%28Pulau_Manukan%29_.jpg/1920px-View_of_Mount_Kinabalu_taken_from_Manukan_Island_%28Pulau_Manukan%29_.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Tunku Abdul Rahman National Park, Kota Kinabalu",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/4542638/pexels-photo-4542638.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Kota Kinabalu City Mosque, Kota Kinabalu",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Signal_Hill_Observatory.jpg/1920px-Signal_Hill_Observatory.jpg",
      alt: "Signal Hill Observatory, Kota Kinabalu",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Photowalk_at_Sabah_State_Museum%2C_Kota_Kinabalu_209.jpg/1920px-Photowalk_at_Sabah_State_Museum%2C_Kota_Kinabalu_209.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Sabah Museum, Kota Kinabalu",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "almaty": [
    {
      src:
        "https://images.pexels.com/photos/28958897/pexels-photo-28958897.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Scenic view of almaty city with mountains",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/34293570/pexels-photo-34293570.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Big Almaty Lake, Almaty",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Almaty%2C_Kok-tobe_exposition_3.jpg/1920px-Almaty%2C_Kok-tobe_exposition_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Kok-Tobe, Almaty",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37334044/pexels-photo-37334044.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Ascension Cathedral, Almaty",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/14238232/pexels-photo-14238232.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Medeu, Almaty",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Green_Market%2C_Almaty_02.jpg/1920px-Green_Market%2C_Almaty_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Green Bazaar, Almaty",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "helsinki": [
    {
      src:
        "https://images.pexels.com/photos/6407025/pexels-photo-6407025.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "City street near buildings in helsinki finland",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/13787813/pexels-photo-13787813.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Suomenlinna, Helsinki",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/33852609/pexels-photo-33852609.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Temppeliaukio Church, Helsinki",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/37021916/pexels-photo-37021916.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Helsinki Cathedral, Helsinki",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/18434992/pexels-photo-18434992.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Uspenski Cathedral, Helsinki",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Kauppatori_silakkamarkkinoiden_aikaan.Market_Square_Helsinki_%2Cduring_the_Helsinki_Baltic_Herring_Market.jpg/1920px-Kauppatori_silakkamarkkinoiden_aikaan.Market_Square_Helsinki_%2Cduring_the_Helsinki_Baltic_Herring_Market.jpg",
      alt: "Market Square (Kauppatori), Helsinki",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "bergen": [
    {
      src:
        "https://images.pexels.com/photos/36987452/pexels-photo-36987452.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Picturesque bergen harbor with colorful buildings",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/33528046/pexels-photo-33528046.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Bryggen, Bergen",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Vista_de_Bergen_desde_la_monta%C3%B1a_Fl%C3%B8yen%2C_Noruega%2C_2019-09-08%2C_DD_48.jpg/1920px-Vista_de_Bergen_desde_la_monta%C3%B1a_Fl%C3%B8yen%2C_Noruega%2C_2019-09-08%2C_DD_48.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Mount Fløyen, Bergen",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bergenhus_Fortress_Bergen_Norway_2009_1_HDR.JPG/1920px-Bergenhus_Fortress_Bergen_Norway_2009_1_HDR.JPG",
      alt: "Bergenhus Fortress, Bergen",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Bergen_Fish_Market_-_2013.08_-_panoramio.jpg/1920px-Bergen_Fish_Market_-_2013.08_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Bergen Fish Market, Bergen",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ulriken_Bergen.jpg/1920px-Ulriken_Bergen.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Ulriken, Bergen",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "bruges": [
    {
      src:
        "https://images.pexels.com/photos/26609668/pexels-photo-26609668.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Bruges streets and architectural splendor",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/35845606/pexels-photo-35845606.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Markt, Bruges",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/14361940/pexels-photo-14361940.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Belfry of Bruges, Bruges",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/36081482/pexels-photo-36081482.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Church of Our Lady, Bruges",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Lake_of_Love_in_Bruges.JPG/1920px-Lake_of_Love_in_Bruges.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Minnewater (Lake of Love), Bruges",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Brugge_-_Dijver_12_-Voormalig_poortgebouw_van_de_proosdij_van_Onze-Lieve-Vrouw%2C_heden_ingang_van_het_Groeningemuseum_-_82339.jpg/1920px-Brugge_-_Dijver_12_-Voormalig_poortgebouw_van_de_proosdij_van_Onze-Lieve-Vrouw%2C_heden_ingang_van_het_Groeningemuseum_-_82339.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Groeningemuseum, Bruges",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "salzburg": [
    {
      src:
        "https://images.pexels.com/photos/39491967/pexels-photo-39491967.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Aerial view of picturesque salzburg cityscape",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/34190287/pexels-photo-34190287.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Hohensalzburg Fortress, Salzburg",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/23363393/pexels-photo-23363393.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Mirabell Palace and Gardens, Salzburg",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/39466603/pexels-photo-39466603.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Getreidegasse, Salzburg",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/38549879/pexels-photo-38549879.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Salzburg Cathedral, Salzburg",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/20545817/pexels-photo-20545817.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Hellbrunn Palace, Salzburg",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "ljubljana": [
    {
      src:
        "https://images.pexels.com/photos/37320095/pexels-photo-37320095.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Scenic view of ljubljana cityscape with red roofs",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/18381600/pexels-photo-18381600.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Ljubljana Castle, Ljubljana",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/34346900/pexels-photo-34346900.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Triple Bridge, Ljubljana",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/33490409/pexels-photo-33490409.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Dragon Bridge, Ljubljana",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Ljubljana_Park_Tivoli_%2854209040156%29.jpg/1920px-Ljubljana_Park_Tivoli_%2854209040156%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Tivoli Park, Ljubljana",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ljubljana_Central_Market_%2846593078772%29.jpg/1920px-Ljubljana_Central_Market_%2846593078772%29.jpg",
      alt: "Ljubljana Central Market, Ljubljana",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "marseille": [
    {
      src:
        "https://images.pexels.com/photos/38869772/pexels-photo-38869772.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Scenic view of marseille coastline and cityscape",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/The_old_Port_%28Vieux_Port%29_of_Marseille.jpg/1920px-The_old_Port_%28Vieux_Port%29_of_Marseille.jpg",
      alt: "Old Port (Vieux-Port), Marseille",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/32724588/pexels-photo-32724588.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Notre-Dame de la Garde, Marseille",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/29824815/pexels-photo-29824815.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Calanques National Park, Marseille",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/20121156/pexels-photo-20121156.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "MuCEM, Marseille",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Marseille_%28France%29%2C_wall_with_seven_silhouettes_in_quarter_of_Le_Panier.JPG/1920px-Marseille_%28France%29%2C_wall_with_seven_silhouettes_in_quarter_of_Le_Panier.JPG",
      alt: "Le Panier, Marseille",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "palermo": [
    {
      src:
        "https://images.pexels.com/photos/35644624/pexels-photo-35644624.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Palermo skyline with historic buildings in sicily",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/14213519/pexels-photo-14213519.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Palermo Cathedral, Palermo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/9523803/pexels-photo-9523803.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Cappella Palatina, Palermo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ballar%C3%B2%2C_gente_en_el_mercado%2C_Palermo%2C_Sicilia%2C_Italia%2C_2015.JPG/1920px-Ballar%C3%B2%2C_gente_en_el_mercado%2C_Palermo%2C_Sicilia%2C_Italia%2C_2015.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Ballarò Market, Palermo",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/12615316/pexels-photo-12615316.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Teatro Massimo, Palermo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/14213562/pexels-photo-14213562.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Quattro Canti, Palermo",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
  ],
  "valletta": [
    {
      src:
        "https://images.pexels.com/photos/36971190/pexels-photo-36971190.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Stunning view of valletta shoreline in malta",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/St._John%27s_Co-Cathedral%2C_Valletta_009.jpg/1920px-St._John%27s_Co-Cathedral%2C_Valletta_009.jpg",
      alt: "St John's Co-Cathedral, Valletta",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/33435844/pexels-photo-33435844.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Upper Barrakka Gardens, Valletta",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Malta_-_Valletta_-_St._Elmo_Place_-_Fort_St._Elmo_01.jpg/1920px-Malta_-_Valletta_-_St._Elmo_Place_-_Fort_St._Elmo_01.jpg",
      alt: "Fort St Elmo, Valletta",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/18021128/pexels-photo-18021128.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Grand Harbour, Valletta",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Malta_-_Valletta_-_Republic_Street_-_View_along_National_Museum_of_Archaeology.jpg/1920px-Malta_-_Valletta_-_Republic_Street_-_View_along_National_Museum_of_Archaeology.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "National Museum of Archaeology, Valletta",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "bilbao": [
    {
      src:
        "https://images.pexels.com/photos/35427606/pexels-photo-35427606.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Scenic view of bilbao s colorful riverside architecture",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/28127212/pexels-photo-28127212.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Guggenheim Museum Bilbao, Bilbao",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Bilbao_-_Casco_Viejo_10.jpg/1920px-Bilbao_-_Casco_Viejo_10.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Casco Viejo, Bilbao",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/18795928/pexels-photo-18795928.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "Zubizuri, Bilbao",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Bilbao_-_Mercado_de_la_Ribera_%2828935207930%29.jpg/1920px-Bilbao_-_Mercado_de_la_Ribera_%2828935207930%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Mercado de la Ribera, Bilbao",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Funicular_Artxanda%2C_Bilbao%2C_July_2010_%2801%29.JPG/1920px-Funicular_Artxanda%2C_Bilbao%2C_July_2010_%2801%29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Mount Artxanda, Bilbao",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "hobart": [
    {
      src:
        "https://images.pexels.com/photos/33899468/pexels-photo-33899468.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Hobart waterfront fishing boats in tasmania",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Reflection_on_black_oil_-_Museum_of_Old_and_New_Art_%28MONA%29_-_Hobart.jpg/1920px-Reflection_on_black_oil_-_Museum_of_Old_and_New_Art_%28MONA%29_-_Hobart.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Museum of Old and New Art (MONA), Hobart",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Salamanca_Market_Hobart.jpg/1920px-Salamanca_Market_Hobart.jpg",
      alt: "Salamanca Market, Hobart",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://images.pexels.com/photos/38404744/pexels-photo-38404744.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "kunanyi / Mount Wellington, Hobart",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Battery_Point_to_west_hobart_2015.jpg/1920px-Battery_Point_to_west_hobart_2015.jpg",
      alt: "Battery Point, Hobart",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Hobart_Botanical_Garden_-_panoramio.jpg/3840px-Hobart_Botanical_Garden_-_panoramio.jpg",
      alt: "Royal Tasmanian Botanical Gardens, Hobart",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "darwin": [
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/8/84/City_landscape_of_Darwin%2C_Northern_Territory.jpg",
      alt: "Darwin, Northern Territory, Australia Panorama",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/A_front_moving_in_over_Mindil_Beach%2C_Darwin%2C_Australia_01.jpg/1920px-A_front_moving_in_over_Mindil_Beach%2C_Darwin%2C_Australia_01.jpg",
      alt: "Mindil Beach, Darwin",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/c/cb/Museum_and_Art_Gallery_of_the_Northern_Territory.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
      alt: "Museum and Art Gallery of the Northern Territory, Darwin",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Walkway_through_the_George_Brown_Darwin_Botanic_Gardens%2C_Darwin%2C_Australia_01.jpg/1920px-Walkway_through_the_George_Brown_Darwin_Botanic_Gardens%2C_Darwin%2C_Australia_01.jpg",
      alt: "George Brown Darwin Botanic Gardens, Darwin",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/7/72/Darwin_Waterfront_Precinct.jpg",
      alt: "Darwin Waterfront Precinct, Darwin",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/In_Kakadu_Natl_Park_E_of_Darwin_N.T_-_a_roadside_forest_fire_reddens_the_imminent_sunset_%2813113319793%29.jpg/1920px-In_Kakadu_Natl_Park_E_of_Darwin_N.T_-_a_roadside_forest_fire_reddens_the_imminent_sunset_%2813113319793%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Kakadu National Park, Darwin",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "papeete": [
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/PF-papeete-hafen-2.jpg/1920px-PF-papeete-hafen-2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Panorama de Papeete",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Tahitian_local_market_01.jpg/1920px-Tahitian_local_market_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Papeete Market, Papeete",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Tahiti%2C_French_Polynesia_-_Notre_Dame_Cathedral%2C_Papeete_%2848028242478%29.jpg/1920px-Tahiti%2C_French_Polynesia_-_Notre_Dame_Cathedral%2C_Papeete_%2848028242478%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Notre-Dame Cathedral of Papeete, Papeete",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Tahiti%2C_French_Polynesia_-_Point_Venus_Lighthouse_%2848032601316%29.jpg/1920px-Tahiti%2C_French_Polynesia_-_Point_Venus_Lighthouse_%2848032601316%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Point Venus, Papeete",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tahiti%2C_French_Polynesia_-_Arahoho_Blowhole_%2848033965818%29.jpg/1920px-Tahiti%2C_French_Polynesia_-_Arahoho_Blowhole_%2848033965818%29.jpg",
      alt: "Arahoho Blowhole, Papeete",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
  "dunedin": [
    {
      src:
        "https://images.pexels.com/photos/38231987/pexels-photo-38231987.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Scenic sheep grazing in dunedin new zealand",
      source: "pexels",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Larnach_Castle_in_Dunedin%3B_2008.jpg/1920px-Larnach_Castle_in_Dunedin%3B_2008.jpg",
      alt: "Larnach Castle, Dunedin",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/4/4c/00_1512_Dunedin_%28New_Zealand%29_railway_station.jpg",
      alt: "Dunedin Railway Station, Dunedin",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Baldwin_Street.JPG/1920px-Baldwin_Street.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
      alt: "Baldwin Street, Dunedin",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Megadyptes_antipodes_-Otago_Peninsula%2C_Dunedin%2C_New_Zealand_-family-8.jpg/1920px-Megadyptes_antipodes_-Otago_Peninsula%2C_Dunedin%2C_New_Zealand_-family-8.jpg",
      alt: "Otago Peninsula, Dunedin",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
    {
      src:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Toitu_Otago_Settlers_Museum_main_wing.jpg/1920px-Toitu_Otago_Settlers_Museum_main_wing.jpg",
      alt: "Toitū Otago Settlers Museum, Dunedin",
      source: "wikimedia-commons",
      verifiedAt: "2026-09-18",
    },
  ],
};
