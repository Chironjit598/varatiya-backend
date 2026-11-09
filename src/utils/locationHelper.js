/**
 * Location Helper for Smart Location-Aware Property Listing in Varatia
 * Comprehensive dictionary covering:
 * - ALL 64 official districts (জেলা) of Bangladesh with their central towns, sub-areas, student mess zones, and college areas
 * - In-depth granular neighborhood coverage of Greater Dhaka (North & South City Corporations)
 *
 * Provides area dictionary, coordinates mapping, reverse geocoding via Haversine distance,
 * and fuzzy English-Bangla area keyword matching.
 */

// Major areas in Bangladesh (All 64 districts + Greater Dhaka neighborhoods)
const BD_AREAS = [
  {
    "name": "Mirpur",
    "banglaName": "মিরপুর",
    "aliases": [
      "mirpur",
      "মিরপুর",
      "pallabi",
      "পল্লবী",
      "kazipara",
      "কাজীপাড়া",
      "shewrapara",
      "শেওড়াপাড়া",
      "rupnagar",
      "রুপনগর",
      "monipur",
      "মণিপুর",
      "pirerbag",
      "পীরেরবাগ",
      "paikpara",
      "পাইকপাড়া"
    ],
    "coordinates": [
      90.3685,
      23.8067
    ],
    "subAreas": [
      {
        "name": "Section 1",
        "banglaName": "সেকশন ১",
        "aliases": [
          "section 1",
          "sec 1",
          "১",
          "সেকশন ১",
          "সনি সিনেমা",
          "আনসার ক্যাম্প",
          "মাজার রোড"
        ],
        "coordinates": [
          90.3533,
          23.7956
        ]
      },
      {
        "name": "Section 2",
        "banglaName": "সেকশন ২",
        "aliases": [
          "section 2",
          "sec 2",
          "২",
          "সেকশন ২",
          "স্টেডিয়াম",
          "কমার্স কলেজ"
        ],
        "coordinates": [
          90.3582,
          23.8031
        ]
      },
      {
        "name": "Section 6",
        "banglaName": "সেকশন ৬",
        "aliases": [
          "section 6",
          "sec 6",
          "৬",
          "সেকশন ৬"
        ],
        "coordinates": [
          90.3644,
          23.8123
        ]
      },
      {
        "name": "Section 7",
        "banglaName": "সেকশন ৭",
        "aliases": [
          "section 7",
          "sec 7",
          "৭",
          "সেকশন ৭",
          "মিল্ক ভিটা"
        ],
        "coordinates": [
          90.367,
          23.816
        ]
      },
      {
        "name": "Section 10",
        "banglaName": "সেকশন ১০",
        "aliases": [
          "section 10",
          "sec 10",
          "১০",
          "সেকশন ১০",
          "গোলচত্বর",
          "বেনারসি"
        ],
        "coordinates": [
          90.3685,
          23.8067
        ]
      },
      {
        "name": "Section 11",
        "banglaName": "সেকশন ১১",
        "aliases": [
          "section 11",
          "sec 11",
          "১১",
          "সেকশন ১১",
          "কালশী রোড",
          "প্যারিস রোড"
        ],
        "coordinates": [
          90.3705,
          23.8197
        ]
      },
      {
        "name": "Section 12",
        "banglaName": "সেকশন ১২",
        "aliases": [
          "section 12",
          "sec 12",
          "১২",
          "সেকশন ১২",
          "কালশী মোড়",
          "ইস্টার্ন হাউজিং"
        ],
        "coordinates": [
          90.3639,
          23.8273
        ]
      },
      {
        "name": "Section 13",
        "banglaName": "সেকশন ১৩",
        "aliases": [
          "section 13",
          "sec 13",
          "১৩",
          "সেকশন ১৩",
          "বিআরটিএ"
        ],
        "coordinates": [
          90.3768,
          23.808
        ]
      },
      {
        "name": "Section 14",
        "banglaName": "সেকশন ১৪",
        "aliases": [
          "section 14",
          "sec 14",
          "১৪",
          "সেকশন ১৪",
          "কচুক্ষেত সংলগ্ন",
          "পুলিশ লাইন"
        ],
        "coordinates": [
          90.3855,
          23.801
        ]
      },
      {
        "name": "Mirpur DOHS",
        "banglaName": "মিরপুর ডিওএইচএস",
        "aliases": [
          "mirpur dohs",
          "ডিওএইচএস",
          "dohs mirpur"
        ],
        "coordinates": [
          90.3725,
          23.834
        ]
      },
      {
        "name": "Kazipara",
        "banglaName": "কাজীপাড়া",
        "aliases": [
          "kazipara",
          "কাজীপাড়া",
          "পূর্ব কাজীপাড়া",
          "পশ্চিম কাজীপাড়া"
        ],
        "coordinates": [
          90.3723,
          23.7925
        ]
      },
      {
        "name": "Shewrapara",
        "banglaName": "শেওড়াপাড়া",
        "aliases": [
          "shewrapara",
          "শেওড়াপাড়া",
          "পূর্ব শেওড়াপাড়া",
          "পশ্চিম শেওড়াপাড়া"
        ],
        "coordinates": [
          90.3735,
          23.7845
        ]
      },
      {
        "name": "Pallabi",
        "banglaName": "পল্লবী",
        "aliases": [
          "pallabi",
          "পল্লবী",
          "পল্লবী থানা"
        ],
        "coordinates": [
          90.362,
          23.824
        ]
      },
      {
        "name": "Rupnagar",
        "banglaName": "রুপনগর",
        "aliases": [
          "rupnagar",
          "রুপনগর আবাসিক",
          "টিনশেড"
        ],
        "coordinates": [
          90.352,
          23.815
        ]
      },
      {
        "name": "Paikpara",
        "banglaName": "পাইকপাড়া",
        "aliases": [
          "paikpara",
          "পাইকপাড়া",
          "সরকারি কলোনি"
        ],
        "coordinates": [
          90.36,
          23.785
        ]
      },
      {
        "name": "Pirerbag",
        "banglaName": "পীরেরবাগ",
        "aliases": [
          "pirerbag",
          "পীরেরবাগ",
          "আমতলী পীরেরবাগ"
        ],
        "coordinates": [
          90.363,
          23.788
        ]
      },
      {
        "name": "Monipur",
        "banglaName": "মণিপুর",
        "aliases": [
          "monipur",
          "মণিপুর",
          "মণিপুর স্কুল"
        ],
        "coordinates": [
          90.368,
          23.799
        ]
      },
      {
        "name": "Gabtoli",
        "banglaName": "গাবতলী",
        "aliases": [
          "gabtoli",
          "গাবতলী",
          "বাস টার্মিনাল",
          "গরুর হাট"
        ],
        "coordinates": [
          90.344,
          23.783
        ]
      },
      {
        "name": "Mazar Road",
        "banglaName": "মাজার রোড",
        "aliases": [
          "mazar road",
          "মাজার রোড",
          "শাহ আলী মাজার"
        ],
        "coordinates": [
          90.349,
          23.792
        ]
      }
    ]
  },
  {
    "name": "Dhanmondi",
    "banglaName": "ধানমন্ডি",
    "aliases": [
      "dhanmondi",
      "ধানমন্ডি",
      "jigatola",
      "জিগাতলা",
      "kalabagan",
      "কলাবাগান",
      "sobhanbag",
      "শোভনবাগ",
      "shankar",
      "শংকর",
      "sukrabad",
      "শুক্রাবাদ",
      "rayer bazar",
      "রায়ের বাজার"
    ],
    "coordinates": [
      90.3742,
      23.7465
    ],
    "subAreas": [
      {
        "name": "Dhanmondi 27",
        "banglaName": "ধানমন্ডি ২৭",
        "aliases": [
          "27",
          "২৭",
          "road 27",
          "ধানমন্ডি ২৭",
          "রাপা প্লাজা"
        ],
        "coordinates": [
          90.372,
          23.754
        ]
      },
      {
        "name": "Dhanmondi 32",
        "banglaName": "ধানমন্ডি ৩২",
        "aliases": [
          "32",
          "৩২",
          "road 32",
          "ধানমন্ডি ৩২",
          "রাসেল স্কয়ার"
        ],
        "coordinates": [
          90.378,
          23.751
        ]
      },
      {
        "name": "Dhanmondi 15",
        "banglaName": "ধানমন্ডি ১৫",
        "aliases": [
          "15",
          "১৫",
          "road 15",
          "ধানমন্ডি ১৫",
          "স্টার কাবাব ১৫"
        ],
        "coordinates": [
          90.371,
          23.744
        ]
      },
      {
        "name": "Dhanmondi 8/A",
        "banglaName": "ধানমন্ডি ৮/এ",
        "aliases": [
          "8/a",
          "৮/এ",
          "road 8/a",
          "ধানমন্ডি ৮"
        ],
        "coordinates": [
          90.376,
          23.748
        ]
      },
      {
        "name": "Dhanmondi 9/A",
        "banglaName": "ধানমন্ডি ৯/এ",
        "aliases": [
          "9/a",
          "৯/এ",
          "road 9/a"
        ],
        "coordinates": [
          90.375,
          23.749
        ]
      },
      {
        "name": "Jigatola",
        "banglaName": "জিগাতলা",
        "aliases": [
          "jigatola",
          "জিগাতলা",
          "ট্যানারি মোড়"
        ],
        "coordinates": [
          90.369,
          23.741
        ]
      },
      {
        "name": "Kalabagan",
        "banglaName": "কলাবাগান",
        "aliases": [
          "kalabagan",
          "কলাবাগান",
          "ক্রীড়া চক্র",
          "বশির উদ্দিন রোড"
        ],
        "coordinates": [
          90.381,
          23.749
        ]
      },
      {
        "name": "Shankar",
        "banglaName": "শংকর",
        "aliases": [
          "shankar",
          "শংকর",
          "শংকর বাসস্ট্যান্ড"
        ],
        "coordinates": [
          90.366,
          23.75
        ]
      },
      {
        "name": "Sobhanbag",
        "banglaName": "শোভনবাগ",
        "aliases": [
          "sobhanbag",
          "শোভনবাগ",
          "ড্যাফোডিল মোড়"
        ],
        "coordinates": [
          90.377,
          23.755
        ]
      },
      {
        "name": "Sukrabad",
        "banglaName": "শুক্রাবাদ",
        "aliases": [
          "sukrabad",
          "শুক্রাবাদ",
          "মেট্রো শপিং মল"
        ],
        "coordinates": [
          90.38,
          23.753
        ]
      },
      {
        "name": "Rayer Bazar",
        "banglaName": "রায়ের বাজার",
        "aliases": [
          "rayer bazar",
          "রায়ের বাজার",
          "সাদেক খান রোড",
          "বধ্যভূমি"
        ],
        "coordinates": [
          90.363,
          23.746
        ]
      }
    ]
  },
  {
    "name": "Mohammadpur",
    "banglaName": "মোহাম্মদপুর",
    "aliases": [
      "mohammadpur",
      "মোহাম্মদপুর",
      "bosila",
      "বসিলা",
      "ring road",
      "রিং রোড",
      "tajmahal",
      "তাজমহল",
      "town hall",
      "টাউন হল",
      "japan garden",
      "জাপান গার্ডেন",
      "shia masjid",
      "শিয়া মসজিদ",
      "chad uddan",
      "চাঁদ উদ্যান"
    ],
    "coordinates": [
      90.3584,
      23.7658
    ],
    "subAreas": [
      {
        "name": "Ring Road",
        "banglaName": "রিং রোড",
        "aliases": [
          "ring road",
          "রিং রোড",
          "সুচনা কমিউনিটি"
        ],
        "coordinates": [
          90.36,
          23.771
        ]
      },
      {
        "name": "Town Hall",
        "banglaName": "টাউন হল",
        "aliases": [
          "town hall",
          "টাউন হল",
          "বাজার মোড়"
        ],
        "coordinates": [
          90.364,
          23.761
        ]
      },
      {
        "name": "Tajmahal Road",
        "banglaName": "তাজমহল রোড",
        "aliases": [
          "tajmahal",
          "তাজমহল রোড",
          "মিনাবাজার মোড়"
        ],
        "coordinates": [
          90.362,
          23.764
        ]
      },
      {
        "name": "Noorjahan Road",
        "banglaName": "নূরজাহান রোড",
        "aliases": [
          "noorjahan",
          "নূরজাহান রোড"
        ],
        "coordinates": [
          90.363,
          23.762
        ]
      },
      {
        "name": "Salimullah Road",
        "banglaName": "সলিমুল্লাহ রোড",
        "aliases": [
          "salimullah",
          "সলিমুল্লাহ রোড"
        ],
        "coordinates": [
          90.364,
          23.76
        ]
      },
      {
        "name": "Asad Avenue",
        "banglaName": "আসাদ এভিনিউ",
        "aliases": [
          "asad avenue",
          "আসাদ এভিনিউ",
          "আসাদ গেট"
        ],
        "coordinates": [
          90.368,
          23.762
        ]
      },
      {
        "name": "Japan Garden City",
        "banglaName": "জাপান গার্ডেন সিটি",
        "aliases": [
          "japan garden",
          "জাপান গার্ডেন",
          "গার্ডেন সিটি"
        ],
        "coordinates": [
          90.358,
          23.772
        ]
      },
      {
        "name": "Bosila",
        "banglaName": "বসিলা",
        "aliases": [
          "bosila",
          "বসিলা",
          "বসিলা ব্রিজ",
          "বসতি সিটি",
          "মেট্রো হাউজিং"
        ],
        "coordinates": [
          90.339,
          23.755
        ]
      },
      {
        "name": "Shia Masjid",
        "banglaName": "শিয়া মসজিদ",
        "aliases": [
          "shia masjid",
          "শিয়া মসজিদ",
          "কাঁচাবাজার"
        ],
        "coordinates": [
          90.359,
          23.768
        ]
      },
      {
        "name": "Chad Uddan",
        "banglaName": "চাঁদ উদ্যান",
        "aliases": [
          "chad uddan",
          "চাঁদ উদ্যান",
          "একতা হাউজিং"
        ],
        "coordinates": [
          90.346,
          23.765
        ]
      },
      {
        "name": "Nabodoy Housing",
        "banglaName": "নবোদয় হাউজিং",
        "aliases": [
          "nabodoy",
          "নবোদয় হাউজিং",
          "নবোদয়"
        ],
        "coordinates": [
          90.354,
          23.77
        ]
      },
      {
        "name": "PC Culture Housing",
        "banglaName": "পিসি কালচার",
        "aliases": [
          "pc culture",
          "পিসি কালচার",
          "পিসিকালচার হাউজিং"
        ],
        "coordinates": [
          90.358,
          23.769
        ]
      },
      {
        "name": "Monsurabad Housing",
        "banglaName": "মনসুরাবাদ",
        "aliases": [
          "monsurabad",
          "মনসুরাবাদ হাউজিং"
        ],
        "coordinates": [
          90.35,
          23.768
        ]
      },
      {
        "name": "Baitul Aman Housing",
        "banglaName": "বায়তুল আমান",
        "aliases": [
          "baitul aman",
          "বায়তুল আমান হাউজিং"
        ],
        "coordinates": [
          90.361,
          23.767
        ]
      },
      {
        "name": "Mohammadia Housing",
        "banglaName": "মোহাম্মাদীয়া হাউজিং",
        "aliases": [
          "mohammadia",
          "মোহাম্মাদীয়া হাউজিং",
          "মোহাম্মাদীয়া সোসাইটি"
        ],
        "coordinates": [
          90.355,
          23.769
        ]
      },
      {
        "name": "Iqbal Road",
        "banglaName": "ইকবাল রোড",
        "aliases": [
          "iqbal road",
          "ইকবাল রোড"
        ],
        "coordinates": [
          90.366,
          23.761
        ]
      },
      {
        "name": "Humayun Road",
        "banglaName": "হুমায়ুন রোড",
        "aliases": [
          "humayun road",
          "হুমায়ুন রোড"
        ],
        "coordinates": [
          90.367,
          23.759
        ]
      },
      {
        "name": "Babar Road",
        "banglaName": "বাবর রোড",
        "aliases": [
          "babar road",
          "বাবর রোড"
        ],
        "coordinates": [
          90.365,
          23.763
        ]
      }
    ]
  },
  {
    "name": "Adabor",
    "banglaName": "আদাবর",
    "aliases": [
      "adabor",
      "আদাবর",
      "shekhertek",
      "শেখেরটেক",
      "sunibir",
      "সুনিবিড়"
    ],
    "coordinates": [
      90.355,
      23.774
    ],
    "subAreas": [
      {
        "name": "Shekhertek",
        "banglaName": "শেখেরটেক",
        "aliases": [
          "shekhertek",
          "শেখেরটেক",
          "শেখেরটেক ১ থেকে ১২"
        ],
        "coordinates": [
          90.352,
          23.773
        ]
      },
      {
        "name": "Adabor Road 1-18",
        "banglaName": "আদাবর মেইন",
        "aliases": [
          "adabor road",
          "আদাবর রোড",
          "আদাবর থানা"
        ],
        "coordinates": [
          90.355,
          23.774
        ]
      },
      {
        "name": "Sunibir Housing",
        "banglaName": "সুনিবিড় হাউজিং",
        "aliases": [
          "sunibir",
          "সুনিবিড় হাউজিং"
        ],
        "coordinates": [
          90.351,
          23.776
        ]
      },
      {
        "name": "Baitus Salah",
        "banglaName": "বাইতুস সালাহ",
        "aliases": [
          "baitus salah",
          "বাইতুস সালাহ জামে মসজিদ"
        ],
        "coordinates": [
          90.354,
          23.777
        ]
      }
    ]
  },
  {
    "name": "Uttara",
    "banglaName": "উত্তরা",
    "aliases": [
      "uttara",
      "উত্তরা",
      "diabari",
      "দিয়াবাড়ি",
      "azampur",
      "আজমপুর",
      "jasimuddin",
      "জসীমউদদীন",
      "rajlakshmi",
      "রাজলক্ষ্মী",
      "house building",
      "হাউস বিল্ডিং",
      "abdullahpur",
      "আবদুল্লাহপুর",
      "uttarkhan",
      "উত্তরখান",
      "dakhinkhan",
      "দক্ষিণখান"
    ],
    "coordinates": [
      90.3978,
      23.8759
    ],
    "subAreas": [
      {
        "name": "Sector 1",
        "banglaName": "সেক্টর ১",
        "aliases": [
          "sector 1",
          "sec 1",
          "সেক্টর ১",
          "১"
        ],
        "coordinates": [
          90.398,
          23.863
        ]
      },
      {
        "name": "Sector 3",
        "banglaName": "সেক্টর ৩",
        "aliases": [
          "sector 3",
          "sec 3",
          "সেক্টর ৩",
          "৩",
          "jasimuddin",
          "জসীমউদদীন"
        ],
        "coordinates": [
          90.399,
          23.868
        ]
      },
      {
        "name": "Sector 4",
        "banglaName": "সেক্টর ৪",
        "aliases": [
          "sector 4",
          "sec 4",
          "সেক্টর ৪",
          "৪"
        ],
        "coordinates": [
          90.404,
          23.869
        ]
      },
      {
        "name": "Sector 5",
        "banglaName": "সেক্টর ৫",
        "aliases": [
          "sector 5",
          "sec 5",
          "সেক্টর ৫",
          "৫"
        ],
        "coordinates": [
          90.395,
          23.87
        ]
      },
      {
        "name": "Sector 6",
        "banglaName": "সেক্টর ৬",
        "aliases": [
          "sector 6",
          "sec 6",
          "সেক্টর ৬",
          "৬"
        ],
        "coordinates": [
          90.405,
          23.874
        ]
      },
      {
        "name": "Sector 7",
        "banglaName": "সেক্টর ৭",
        "aliases": [
          "sector 7",
          "sec 7",
          "সেক্টর ৭",
          "৭",
          "বিজিবি মার্কেট"
        ],
        "coordinates": [
          90.398,
          23.876
        ]
      },
      {
        "name": "Sector 8",
        "banglaName": "সেক্টর ৮",
        "aliases": [
          "sector 8",
          "sec 8",
          "সেক্টর ৮",
          "৮",
          "রেললাইন সংলগ্ন"
        ],
        "coordinates": [
          90.407,
          23.877
        ]
      },
      {
        "name": "Sector 9",
        "banglaName": "সেক্টর ৯",
        "aliases": [
          "sector 9",
          "sec 9",
          "সেক্টর ৯",
          "৯"
        ],
        "coordinates": [
          90.395,
          23.881
        ]
      },
      {
        "name": "Sector 10",
        "banglaName": "সেক্টর ১০",
        "aliases": [
          "sector 10",
          "sec 10",
          "সেক্টর ১০",
          "১০",
          "কামারপাড়া রোড"
        ],
        "coordinates": [
          90.388,
          23.882
        ]
      },
      {
        "name": "Sector 11",
        "banglaName": "সেক্টর ১১",
        "aliases": [
          "sector 11",
          "sec 11",
          "সেক্টর ১১",
          "১১",
          "জমজম টাওয়ার"
        ],
        "coordinates": [
          90.387,
          23.875
        ]
      },
      {
        "name": "Sector 12",
        "banglaName": "সেক্টর ১২",
        "aliases": [
          "sector 12",
          "sec 12",
          "সেক্টর ১২",
          "১২",
          "খালপাড়"
        ],
        "coordinates": [
          90.383,
          23.877
        ]
      },
      {
        "name": "Sector 13",
        "banglaName": "সেক্টর ১৩",
        "aliases": [
          "sector 13",
          "sec 13",
          "সেক্টর ১৩",
          "১৩",
          "গাউসুল আজম এভিনিউ"
        ],
        "coordinates": [
          90.385,
          23.87
        ]
      },
      {
        "name": "Sector 14",
        "banglaName": "সেক্টর ১৪",
        "aliases": [
          "sector 14",
          "sec 14",
          "সেক্টর ১৪",
          "১৪"
        ],
        "coordinates": [
          90.383,
          23.865
        ]
      },
      {
        "name": "Sector 15",
        "banglaName": "সেক্টর ১৫",
        "aliases": [
          "sector 15",
          "sec 15",
          "সেক্টর ১৫",
          "১৫",
          "খালপাড় উত্তরা"
        ],
        "coordinates": [
          90.377,
          23.88
        ]
      },
      {
        "name": "Sector 16",
        "banglaName": "সেক্টর ১৬",
        "aliases": [
          "sector 16",
          "sec 16",
          "সেক্টর ১৬",
          "১৬"
        ],
        "coordinates": [
          90.373,
          23.883
        ]
      },
      {
        "name": "Sector 17",
        "banglaName": "সেক্টর ১৭",
        "aliases": [
          "sector 17",
          "sec 17",
          "সেক্টর ১৭",
          "১৭"
        ],
        "coordinates": [
          90.369,
          23.886
        ]
      },
      {
        "name": "Sector 18",
        "banglaName": "সেক্টর ১৮",
        "aliases": [
          "sector 18",
          "sec 18",
          "সেক্টর ১৮",
          "১৮",
          "মেট্রোরেল ডিপো"
        ],
        "coordinates": [
          90.365,
          23.889
        ]
      },
      {
        "name": "Diabari",
        "banglaName": "দিয়াবাড়ি",
        "aliases": [
          "diabari",
          "দিয়াবাড়ি",
          "মেট্রোরেল স্টেশন",
          "কাশফুল"
        ],
        "coordinates": [
          90.37,
          23.878
        ]
      },
      {
        "name": "Azampur",
        "banglaName": "আজমপুর",
        "aliases": [
          "azampur",
          "আজমপুর বাসস্ট্যান্ড",
          "কাঁচাবাজার"
        ],
        "coordinates": [
          90.402,
          23.867
        ]
      },
      {
        "name": "Rajlakshmi",
        "banglaName": "রাজলক্ষ্মী",
        "aliases": [
          "rajlakshmi",
          "রাজলক্ষ্মী কমপ্লেক্স"
        ],
        "coordinates": [
          90.4,
          23.865
        ]
      },
      {
        "name": "House Building",
        "banglaName": "হাউস বিল্ডিং",
        "aliases": [
          "house building",
          "হাউস বিল্ডিং মোড়",
          "মাসকট প্লাজা"
        ],
        "coordinates": [
          90.399,
          23.872
        ]
      },
      {
        "name": "Abdullahpur",
        "banglaName": "আবদুল্লাহপুর",
        "aliases": [
          "abdullahpur",
          "আবদুল্লাহপুর মোড়",
          "টঙ্গী ব্রিজ"
        ],
        "coordinates": [
          90.401,
          23.885
        ]
      },
      {
        "name": "Uttarkhan",
        "banglaName": "উত্তরখান",
        "aliases": [
          "uttarkhan",
          "উত্তরখান",
          "মাজার চৌরাস্তা"
        ],
        "coordinates": [
          90.42,
          23.88
        ]
      },
      {
        "name": "Dakhinkhan",
        "banglaName": "দক্ষিণখান",
        "aliases": [
          "dakhinkhan",
          "দক্ষিণখান",
          "কাওলার মোড়"
        ],
        "coordinates": [
          90.422,
          23.868
        ]
      },
      {
        "name": "Uttara DOHS",
        "banglaName": "উত্তরা ডিওএইচএস",
        "aliases": [
          "uttara dohs",
          "উত্তরা ডিওএইচএস"
        ],
        "coordinates": [
          90.368,
          23.865
        ]
      }
    ]
  },
  {
    "name": "Gulshan",
    "banglaName": "গুলশান",
    "aliases": [
      "gulshan",
      "গুলশান",
      "niketan",
      "নিকেতন",
      "shahjadpur",
      "শাহজাদপুর",
      "police plaza",
      "পুলিশ প্লাজা"
    ],
    "coordinates": [
      90.4152,
      23.7925
    ],
    "subAreas": [
      {
        "name": "Gulshan 1",
        "banglaName": "গুলশান ১",
        "aliases": [
          "gulshan 1",
          "গুলশান ১",
          "১",
          "গোলচত্বর ১"
        ],
        "coordinates": [
          90.418,
          23.78
        ]
      },
      {
        "name": "Gulshan 2",
        "banglaName": "গুলশান ২",
        "aliases": [
          "gulshan 2",
          "গুলশান ২",
          "২",
          "গোলচত্বর ২"
        ],
        "coordinates": [
          90.415,
          23.793
        ]
      },
      {
        "name": "Niketan",
        "banglaName": "নিকেতন",
        "aliases": [
          "niketan",
          "নিকেতন",
          "নিকেতন আবাসিক",
          "পুলিশ প্লাজা"
        ],
        "coordinates": [
          90.41,
          23.776
        ]
      },
      {
        "name": "Shahjadpur",
        "banglaName": "শাহজাদপুর",
        "aliases": [
          "shahjadpur",
          "শাহজাদপুর",
          "সুবাস্তু নজর ভ্যালি",
          "বাঁশতলা"
        ],
        "coordinates": [
          90.424,
          23.796
        ]
      }
    ]
  },
  {
    "name": "Banani",
    "banglaName": "বনানী",
    "aliases": [
      "banani",
      "বনানী",
      "kakoli",
      "কাকলী",
      "chairman bari",
      "চেয়ারম্যান বাড়ি",
      "kamal ataturk"
    ],
    "coordinates": [
      90.4043,
      23.7937
    ],
    "subAreas": [
      {
        "name": "Road 11",
        "banglaName": "রোড ১১",
        "aliases": [
          "road 11",
          "১১ নম্বর রোড",
          "বনানী ১১"
        ],
        "coordinates": [
          90.403,
          23.794
        ]
      },
      {
        "name": "Banani DOHS",
        "banglaName": "বনানী ডিওএইচএস",
        "aliases": [
          "banani dohs",
          "বনানী ডিওএইচএস"
        ],
        "coordinates": [
          90.399,
          23.798
        ]
      },
      {
        "name": "Kakoli",
        "banglaName": "কাকলী",
        "aliases": [
          "kakoli",
          "কাকলী মোড়",
          "কাকলী বাসস্ট্যান্ড"
        ],
        "coordinates": [
          90.401,
          23.79
        ]
      },
      {
        "name": "Chairman Bari",
        "banglaName": "চেয়ারম্যান বাড়ি",
        "aliases": [
          "chairman bari",
          "চেয়ারম্যান বাড়ি মোড়"
        ],
        "coordinates": [
          90.401,
          23.785
        ]
      },
      {
        "name": "Kamal Ataturk",
        "banglaName": "কামাল আতাতুর্ক",
        "aliases": [
          "kamal ataturk avenue",
          "কামাল আতাতুর্ক এভিনিউ"
        ],
        "coordinates": [
          90.406,
          23.793
        ]
      }
    ]
  },
  {
    "name": "Baridhara",
    "banglaName": "বারিধারা",
    "aliases": [
      "baridhara",
      "বারিধারা",
      "nadda",
      "নদ্দা",
      "notun bazar",
      "নতুন বাজার"
    ],
    "coordinates": [
      90.42,
      23.8
    ],
    "subAreas": [
      {
        "name": "Diplomatic Zone",
        "banglaName": "কূটনৈতিক এলাকা",
        "aliases": [
          "diplomatic",
          "কূটনৈতিক জোন",
          "বারিধারা ডিপ্লোমেটিক"
        ],
        "coordinates": [
          90.421,
          23.799
        ]
      },
      {
        "name": "Baridhara DOHS",
        "banglaName": "বারিধারা ডিওএইচএস",
        "aliases": [
          "baridhara dohs",
          "বারিধারা ডিওএইচএস"
        ],
        "coordinates": [
          90.415,
          23.812
        ]
      },
      {
        "name": "J Block",
        "banglaName": "জে ব্লক",
        "aliases": [
          "j block",
          "জে ব্লক বারিধারা",
          "বারিধারা জে ব্লক"
        ],
        "coordinates": [
          90.427,
          23.805
        ]
      },
      {
        "name": "Nadda",
        "banglaName": "নদ্দা",
        "aliases": [
          "nadda",
          "নদ্দা বাসস্ট্যান্ড",
          "নদ্দা বাজার"
        ],
        "coordinates": [
          90.426,
          23.809
        ]
      },
      {
        "name": "Notun Bazar",
        "banglaName": "নতুন বাজার",
        "aliases": [
          "notun bazar",
          "নতুন বাজার মোড়",
          "ভাটারা মোড়"
        ],
        "coordinates": [
          90.426,
          23.798
        ]
      }
    ]
  },
  {
    "name": "Bashundhara R/A",
    "banglaName": "বসুন্ধরা আ/এ",
    "aliases": [
      "bashundhara",
      "বসুন্ধরা",
      "residential area",
      "r/a",
      "বসুন্ধরা আবাসিক",
      "kuril",
      "কুড়িল",
      "jamuna future park",
      "যমুনা ফিউচার পার্ক"
    ],
    "coordinates": [
      90.4326,
      23.8164
    ],
    "subAreas": [
      {
        "name": "Block A",
        "banglaName": "ব্লক এ",
        "aliases": [
          "block a",
          "ব্লক এ"
        ],
        "coordinates": [
          90.427,
          23.811
        ]
      },
      {
        "name": "Block B",
        "banglaName": "ব্লক বি",
        "aliases": [
          "block b",
          "ব্লক বি"
        ],
        "coordinates": [
          90.429,
          23.814
        ]
      },
      {
        "name": "Block C",
        "banglaName": "ব্লক সি",
        "aliases": [
          "block c",
          "ব্লক সি",
          "এভারকেয়ার সংলগ্ন"
        ],
        "coordinates": [
          90.432,
          23.817
        ]
      },
      {
        "name": "Block D",
        "banglaName": "ব্লক ডি",
        "aliases": [
          "block d",
          "ব্লক ডি",
          "এনএসইউ ক্যাম্পাস"
        ],
        "coordinates": [
          90.436,
          23.82
        ]
      },
      {
        "name": "Block E",
        "banglaName": "ব্লক ই",
        "aliases": [
          "block e",
          "ব্লক ই"
        ],
        "coordinates": [
          90.439,
          23.822
        ]
      },
      {
        "name": "Block F",
        "banglaName": "ব্লক এফ",
        "aliases": [
          "block f",
          "ব্লক এফ"
        ],
        "coordinates": [
          90.442,
          23.825
        ]
      },
      {
        "name": "Block G",
        "banglaName": "ব্লক জি",
        "aliases": [
          "block g",
          "ব্লক জি"
        ],
        "coordinates": [
          90.445,
          23.827
        ]
      },
      {
        "name": "Block H",
        "banglaName": "ব্লক এইচ",
        "aliases": [
          "block h",
          "ব্লক এইচ"
        ],
        "coordinates": [
          90.448,
          23.829
        ]
      },
      {
        "name": "Block I",
        "banglaName": "ব্লক আই",
        "aliases": [
          "block i",
          "ব্লক আই",
          "আই ব্লক বাজার"
        ],
        "coordinates": [
          90.443,
          23.824
        ]
      },
      {
        "name": "Block J",
        "banglaName": "ব্লক জে",
        "aliases": [
          "block j",
          "ব্লক জে"
        ],
        "coordinates": [
          90.449,
          23.822
        ]
      },
      {
        "name": "Block K",
        "banglaName": "ব্লক কে",
        "aliases": [
          "block k",
          "ব্লক কে"
        ],
        "coordinates": [
          90.452,
          23.825
        ]
      },
      {
        "name": "Block L",
        "banglaName": "ব্লক এল",
        "aliases": [
          "block l",
          "ব্লক এল"
        ],
        "coordinates": [
          90.455,
          23.828
        ]
      },
      {
        "name": "Block M",
        "banglaName": "ব্লক এম",
        "aliases": [
          "block m",
          "ব্লক এম"
        ],
        "coordinates": [
          90.458,
          23.831
        ]
      },
      {
        "name": "Kuril",
        "banglaName": "কুড়িল",
        "aliases": [
          "kuril",
          "কুড়িল বিশ্বরোড",
          "কুড়িল ফ্লাইওভার"
        ],
        "coordinates": [
          90.422,
          23.818
        ]
      }
    ]
  },
  {
    "name": "Badda",
    "banglaName": "বাড্ডা",
    "aliases": [
      "badda",
      "বাড্ডা",
      "merul",
      "মেরুল",
      "satarkul",
      "সাঁতারকুল",
      "beraid",
      "বেরাইদ"
    ],
    "coordinates": [
      90.4267,
      23.7806
    ],
    "subAreas": [
      {
        "name": "North Badda",
        "banglaName": "উত্তর বাড্ডা",
        "aliases": [
          "north badda",
          "উত্তর বাড্ডা",
          "ফুজি টাওয়ার"
        ],
        "coordinates": [
          90.428,
          23.788
        ]
      },
      {
        "name": "Middle Badda",
        "banglaName": "মধ্য বাড্ডা",
        "aliases": [
          "middle badda",
          "মধ্য বাড্ডা",
          "বাড্ডা হাই স্কুল"
        ],
        "coordinates": [
          90.427,
          23.781
        ]
      },
      {
        "name": "South Badda",
        "banglaName": "দক্ষিণ বাড্ডা",
        "aliases": [
          "south badda",
          "দক্ষিণ বাড্ডা"
        ],
        "coordinates": [
          90.424,
          23.774
        ]
      },
      {
        "name": "Merul Badda",
        "banglaName": "মেরুল বাড্ডা",
        "aliases": [
          "merul badda",
          "মেরুল",
          "ব্র্যাক ইউনিভার্সিটি",
          "হাতিরঝিল সংযোগ"
        ],
        "coordinates": [
          90.421,
          23.769
        ]
      },
      {
        "name": "Satarkul",
        "banglaName": "সাঁতারকুল",
        "aliases": [
          "satarkul",
          "সাঁতারকুল রোড"
        ],
        "coordinates": [
          90.443,
          23.788
        ]
      },
      {
        "name": "Beraid",
        "banglaName": "বেরাইদ",
        "aliases": [
          "beraid",
          "বেরাইদ বাজার",
          "বালু নদী"
        ],
        "coordinates": [
          90.465,
          23.792
        ]
      },
      {
        "name": "Gudaraghat",
        "banglaName": "গুদারঘাট",
        "aliases": [
          "gudaraghat",
          "গুদারঘাট বাড্ডা"
        ],
        "coordinates": [
          90.419,
          23.775
        ]
      }
    ]
  },
  {
    "name": "Aftabnagar",
    "banglaName": "আফতাবনগর",
    "aliases": [
      "aftabnagar",
      "আফতাবনগর",
      "jahurul islam city",
      "জহুরুল ইসলাম সিটি",
      "east west university"
    ],
    "coordinates": [
      90.435,
      23.768
    ],
    "subAreas": [
      {
        "name": "Block A",
        "banglaName": "ব্লক এ",
        "aliases": [
          "block a",
          "ব্লক এ",
          "ইস্ট ওয়েস্ট সংলগ্ন"
        ],
        "coordinates": [
          90.429,
          23.769
        ]
      },
      {
        "name": "Block B",
        "banglaName": "ব্লক বি",
        "aliases": [
          "block b",
          "ব্লক বি"
        ],
        "coordinates": [
          90.432,
          23.769
        ]
      },
      {
        "name": "Block C",
        "banglaName": "ব্লক সি",
        "aliases": [
          "block c",
          "ব্লক সি"
        ],
        "coordinates": [
          90.436,
          23.768
        ]
      },
      {
        "name": "Block D",
        "banglaName": "ব্লক ডি",
        "aliases": [
          "block d",
          "ব্লক ডি"
        ],
        "coordinates": [
          90.439,
          23.767
        ]
      },
      {
        "name": "Block E",
        "banglaName": "ব্লক ই",
        "aliases": [
          "block e",
          "ব্লক ই"
        ],
        "coordinates": [
          90.442,
          23.766
        ]
      },
      {
        "name": "Block F",
        "banglaName": "ব্লক এফ",
        "aliases": [
          "block f",
          "ব্লক এফ"
        ],
        "coordinates": [
          90.445,
          23.765
        ]
      }
    ]
  },
  {
    "name": "Rampura",
    "banglaName": "রামপুরা",
    "aliases": [
      "rampura",
      "রামপুরা",
      "mohanagar",
      "মহানগর",
      "hazipara",
      "হাজীপাড়া",
      "ulan",
      "উলান"
    ],
    "coordinates": [
      90.4208,
      23.7612
    ],
    "subAreas": [
      {
        "name": "TV Station",
        "banglaName": "টিভি সেন্টার",
        "aliases": [
          "tv station",
          "টিভি সেন্টার",
          "রামপুরা ব্রিজ"
        ],
        "coordinates": [
          90.419,
          23.764
        ]
      },
      {
        "name": "Mohanagar Project",
        "banglaName": "মহানগর প্রজেক্ট",
        "aliases": [
          "mohanagar project",
          "মহানগর প্রজেক্ট",
          "হাতিরঝিল মহানগর"
        ],
        "coordinates": [
          90.414,
          23.765
        ]
      },
      {
        "name": "Hazipara",
        "banglaName": "হাজীপাড়া",
        "aliases": [
          "hazipara",
          "হাজীপাড়া পেট্রোল পাম্প"
        ],
        "coordinates": [
          90.415,
          23.759
        ]
      },
      {
        "name": "Ulan",
        "banglaName": "উলান",
        "aliases": [
          "ulan",
          "উলান বাজার"
        ],
        "coordinates": [
          90.422,
          23.765
        ]
      },
      {
        "name": "Wapda Road",
        "banglaName": "ওয়াপদা রোড",
        "aliases": [
          "wapda road",
          "ওয়াপদা রোড রামপুরা"
        ],
        "coordinates": [
          90.417,
          23.763
        ]
      },
      {
        "name": "East Rampura",
        "banglaName": "পূর্ব রামপুরা",
        "aliases": [
          "east rampura",
          "পূর্ব রামপুরা"
        ],
        "coordinates": [
          90.424,
          23.761
        ]
      },
      {
        "name": "West Rampura",
        "banglaName": "পশ্চিম রামপুরা",
        "aliases": [
          "west rampura",
          "পশ্চিম রামপুরা"
        ],
        "coordinates": [
          90.418,
          23.761
        ]
      }
    ]
  },
  {
    "name": "Banasree",
    "banglaName": "বনশ্রী",
    "aliases": [
      "banasree",
      "বনশ্রী",
      "farazi hospital",
      "ফরাজী হাসপাতাল",
      "বনশ্রী আবাসিক"
    ],
    "coordinates": [
      90.434,
      23.762
    ],
    "subAreas": [
      {
        "name": "Block A",
        "banglaName": "ব্লক এ",
        "aliases": [
          "block a",
          "ব্লক এ",
          "বনশ্রী ১ নং গেট"
        ],
        "coordinates": [
          90.425,
          23.763
        ]
      },
      {
        "name": "Block B",
        "banglaName": "ব্লক বি",
        "aliases": [
          "block b",
          "ব্লক বি"
        ],
        "coordinates": [
          90.428,
          23.763
        ]
      },
      {
        "name": "Block C",
        "banglaName": "ব্লক সি",
        "aliases": [
          "block c",
          "ব্লক সি",
          "ফরাজী হাসপাতাল মোড়"
        ],
        "coordinates": [
          90.431,
          23.762
        ]
      },
      {
        "name": "Block D",
        "banglaName": "ব্লক ডি",
        "aliases": [
          "block d",
          "ব্লক ডি"
        ],
        "coordinates": [
          90.434,
          23.762
        ]
      },
      {
        "name": "Block E",
        "banglaName": "ব্লক ই",
        "aliases": [
          "block e",
          "ব্লক ই"
        ],
        "coordinates": [
          90.437,
          23.761
        ]
      },
      {
        "name": "Block F",
        "banglaName": "ব্লক এফ",
        "aliases": [
          "block f",
          "ব্লক এফ"
        ],
        "coordinates": [
          90.44,
          23.76
        ]
      },
      {
        "name": "Block G",
        "banglaName": "ব্লক জি",
        "aliases": [
          "block g",
          "ব্লক জি"
        ],
        "coordinates": [
          90.442,
          23.759
        ]
      },
      {
        "name": "Block H",
        "banglaName": "ব্লক এইচ",
        "aliases": [
          "block h",
          "ব্লক এইচ"
        ],
        "coordinates": [
          90.444,
          23.758
        ]
      },
      {
        "name": "Block I",
        "banglaName": "ব্লক আই",
        "aliases": [
          "block i",
          "ব্লক আই"
        ],
        "coordinates": [
          90.446,
          23.757
        ]
      },
      {
        "name": "Block J",
        "banglaName": "ব্লক জে",
        "aliases": [
          "block j",
          "ব্লক জে"
        ],
        "coordinates": [
          90.448,
          23.756
        ]
      },
      {
        "name": "Block K",
        "banglaName": "ব্লক কে",
        "aliases": [
          "block k",
          "ব্লক কে"
        ],
        "coordinates": [
          90.45,
          23.755
        ]
      },
      {
        "name": "Block L",
        "banglaName": "ব্লক এল",
        "aliases": [
          "block l",
          "ব্লক এল"
        ],
        "coordinates": [
          90.452,
          23.754
        ]
      },
      {
        "name": "Block M",
        "banglaName": "ব্লক এম",
        "aliases": [
          "block m",
          "ব্লক এম"
        ],
        "coordinates": [
          90.454,
          23.753
        ]
      }
    ]
  },
  {
    "name": "Khilgaon",
    "banglaName": "খিলগাঁও",
    "aliases": [
      "khilgaon",
      "খিলগাঁও",
      "taltola",
      "তালতলা",
      "goran",
      "গোড়ান",
      "sipahibagh",
      "সিপাহীবাগ",
      "tilpapara",
      "তিলপাপাড়া",
      "meradia",
      "মেরাদিয়া"
    ],
    "coordinates": [
      90.4227,
      23.7505
    ],
    "subAreas": [
      {
        "name": "Taltola",
        "banglaName": "তালতলা",
        "aliases": [
          "taltola",
          "তালতলা মার্কেট",
          "তালতলা সুপার মার্কেট"
        ],
        "coordinates": [
          90.422,
          23.753
        ]
      },
      {
        "name": "Goran",
        "banglaName": "গোড়ান",
        "aliases": [
          "goran",
          "গোড়ান বাজার",
          "পূর্ব গোড়ান",
          "পশ্চিম গোড়ান"
        ],
        "coordinates": [
          90.431,
          23.752
        ]
      },
      {
        "name": "Sipahibagh",
        "banglaName": "সিপাহীবাগ",
        "aliases": [
          "sipahibagh",
          "সিপাহীবাগ বাজার"
        ],
        "coordinates": [
          90.43,
          23.748
        ]
      },
      {
        "name": "Tilpapara",
        "banglaName": "তিলপাপাড়া",
        "aliases": [
          "tilpapara",
          "তিলপাপাড়া রোড"
        ],
        "coordinates": [
          90.425,
          23.749
        ]
      },
      {
        "name": "Chowdhury Para",
        "banglaName": "খিলগাঁও চৌধুরীপাড়া",
        "aliases": [
          "khilgaon chowdhury para",
          "চৌধুরীপাড়া"
        ],
        "coordinates": [
          90.418,
          23.753
        ]
      },
      {
        "name": "Bagicha",
        "banglaName": "খিলগাঁও বাগিচা",
        "aliases": [
          "bagicha",
          "খিলগাঁও বাগিচা"
        ],
        "coordinates": [
          90.42,
          23.747
        ]
      },
      {
        "name": "Meradia",
        "banglaName": "মেরাদিয়া",
        "aliases": [
          "meradia",
          "মেরাদিয়া বাজার",
          "মেরাদিয়া হাট"
        ],
        "coordinates": [
          90.44,
          23.754
        ]
      }
    ]
  },
  {
    "name": "Malibagh",
    "banglaName": "মালিবাগ",
    "aliases": [
      "malibagh",
      "মালিবাগ",
      "mouchak",
      "মৌচাক",
      "shantinagar",
      "শান্তিনগর",
      "bailey road",
      "বেইলি রোড",
      "siddheshwari",
      "সিদ্ধেশ্বরী",
      "kakrail",
      "কাকরাইল",
      "segunbagicha",
      "সেগুনবাগিচা"
    ],
    "coordinates": [
      90.4116,
      23.7441
    ],
    "subAreas": [
      {
        "name": "Mouchak",
        "banglaName": "মৌচাক",
        "aliases": [
          "mouchak",
          "মৌচাক মোড়",
          "মৌচাক মার্কেট"
        ],
        "coordinates": [
          90.41,
          23.746
        ]
      },
      {
        "name": "Shantinagar",
        "banglaName": "শান্তিনগর",
        "aliases": [
          "shantinagar",
          "শান্তিনগর মোড়",
          "শান্তিনগর টুইন টাওয়ার"
        ],
        "coordinates": [
          90.412,
          23.739
        ]
      },
      {
        "name": "Malibagh Chowdhury Para",
        "banglaName": "মালিবাগ চৌধুরীপাড়া",
        "aliases": [
          "malibagh chowdhury para",
          "চৌধুরীপাড়া মালিবাগ"
        ],
        "coordinates": [
          90.415,
          23.752
        ]
      },
      {
        "name": "Malibagh Railgate",
        "banglaName": "মালিবাগ রেলগেট",
        "aliases": [
          "malibagh railgate",
          "মালিবাগ বাজার"
        ],
        "coordinates": [
          90.411,
          23.748
        ]
      },
      {
        "name": "Bailey Road",
        "banglaName": "বেইলি রোড",
        "aliases": [
          "bailey road",
          "বেইলি রোড",
          "অফিসার্স ক্লাব"
        ],
        "coordinates": [
          90.407,
          23.741
        ]
      },
      {
        "name": "Siddheshwari",
        "banglaName": "সিদ্ধেশ্বরী",
        "aliases": [
          "siddheshwari",
          "সিদ্ধেশ্বরী গার্লস",
          "ভিকারুননিসা সংলগ্ন"
        ],
        "coordinates": [
          90.409,
          23.743
        ]
      },
      {
        "name": "Kakrail",
        "banglaName": "কাকরাইল",
        "aliases": [
          "kakrail",
          "কাকরাইল মোড়",
          "রাজমনি সিনেমা"
        ],
        "coordinates": [
          90.408,
          23.737
        ]
      },
      {
        "name": "Segunbagicha",
        "banglaName": "সেগুনবাগিচা",
        "aliases": [
          "segunbagicha",
          "সেগুনবাগিচা",
          "দুদক কার্যালয়"
        ],
        "coordinates": [
          90.405,
          23.734
        ]
      }
    ]
  },
  {
    "name": "Moghbazar",
    "banglaName": "মগবাজার",
    "aliases": [
      "moghbazar",
      "মগবাজার",
      "wireless gate",
      "ওয়্যারলেস গেট",
      "modhubagh",
      "মধুবাগ",
      "dilu road",
      "দিলু রোড",
      "noyatola",
      "নয়াটোলা",
      "pearabag",
      "পেয়ারাবাগ"
    ],
    "coordinates": [
      90.404,
      23.75
    ],
    "subAreas": [
      {
        "name": "Wireless Gate",
        "banglaName": "ওয়্যারলেস গেট",
        "aliases": [
          "wireless gate",
          "মগবাজার ওয়্যারলেস"
        ],
        "coordinates": [
          90.405,
          23.749
        ]
      },
      {
        "name": "Modhubagh",
        "banglaName": "মধুবাগ",
        "aliases": [
          "modhubagh",
          "মধুবাগ ব্রিজ",
          "হাতিরঝিল মধুবাগ"
        ],
        "coordinates": [
          90.41,
          23.753
        ]
      },
      {
        "name": "Dilu Road",
        "banglaName": "দিলু রোড",
        "aliases": [
          "dilu road",
          "দিলু রোড মগবাজার"
        ],
        "coordinates": [
          90.402,
          23.746
        ]
      },
      {
        "name": "Noyatola",
        "banglaName": "নয়াটোলা",
        "aliases": [
          "noyatola",
          "নয়াটোলা পার্ক"
        ],
        "coordinates": [
          90.408,
          23.756
        ]
      },
      {
        "name": "Pearabag",
        "banglaName": "পেয়ারাবাগ",
        "aliases": [
          "pearabag",
          "পেয়ারাবাগ রেলগেট"
        ],
        "coordinates": [
          90.403,
          23.754
        ]
      }
    ]
  },
  {
    "name": "Farmgate",
    "banglaName": "ফার্মগেট",
    "aliases": [
      "farmgate",
      "ফার্মগেট",
      "tejgaon",
      "তেজগাঁও",
      "indira road",
      "ইন্দিরা রোড",
      "green road",
      "গ্রীন রোড",
      "kawran bazar",
      "কাওরান বাজার",
      "panthapath",
      "পান্থপথ",
      "nakhalpara",
      "নাখালপাড়া",
      "monipuripara",
      "মণিপুরীপাড়া",
      "rajabazar",
      "রাজাবাজার"
    ],
    "coordinates": [
      90.3888,
      23.757
    ],
    "subAreas": [
      {
        "name": "Indira Road",
        "banglaName": "ইন্দিরা রোড",
        "aliases": [
          "indira road",
          "ইন্দিরা রোড"
        ],
        "coordinates": [
          90.385,
          23.758
        ]
      },
      {
        "name": "Green Road",
        "banglaName": "গ্রীন রোড",
        "aliases": [
          "green road",
          "গ্রীন রোড",
          "কমফোর্ট হাসপাতাল"
        ],
        "coordinates": [
          90.384,
          23.748
        ]
      },
      {
        "name": "Monipuripara",
        "banglaName": "মণিপুরীপাড়া",
        "aliases": [
          "monipuripara",
          "মণিপুরীপাড়া",
          "সংসদ ভবন সংলগ্ন"
        ],
        "coordinates": [
          90.381,
          23.762
        ]
      },
      {
        "name": "East Nakhalpara",
        "banglaName": "পূর্ব নাখালপাড়া",
        "aliases": [
          "east nakhalpara",
          "নাখালপাড়া",
          "লুকাস মোড়"
        ],
        "coordinates": [
          90.395,
          23.769
        ]
      },
      {
        "name": "West Nakhalpara",
        "banglaName": "পশ্চিম নাখালপাড়া",
        "aliases": [
          "west nakhalpara",
          "পশ্চিম নাখালপাড়া"
        ],
        "coordinates": [
          90.39,
          23.768
        ]
      },
      {
        "name": "Tejkunipara",
        "banglaName": "তেজকুনিপাড়া",
        "aliases": [
          "tejkunipara",
          "তেজকুনিপাড়া",
          "বিজয় সরণি সংলগ্ন"
        ],
        "coordinates": [
          90.391,
          23.763
        ]
      },
      {
        "name": "Tejgaon I/A",
        "banglaName": "তেজগাঁও শিল্পাঞ্চল",
        "aliases": [
          "tejgaon i/a",
          "তেজগাঁও শিল্প এলাকা",
          "শান্তা পিনাকল",
          "চ্যানেল আই"
        ],
        "coordinates": [
          90.401,
          23.767
        ]
      },
      {
        "name": "Kawran Bazar",
        "banglaName": "কাওরান বাজার",
        "aliases": [
          "kawran bazar",
          "কাওরান বাজার",
          "সোনারগাঁও মোড়"
        ],
        "coordinates": [
          90.392,
          23.751
        ]
      },
      {
        "name": "Panthapath",
        "banglaName": "পান্থপথ",
        "aliases": [
          "panthapath",
          "পান্থপথ",
          "বসুন্ধরা সিটি",
          "স্কয়ার হাসপাতাল"
        ],
        "coordinates": [
          90.386,
          23.752
        ]
      },
      {
        "name": "Rajabazar",
        "banglaName": "রাজাবাজার",
        "aliases": [
          "rajabazar",
          "পূর্ব রাজাবাজার",
          "পশ্চিম রাজাবাজার"
        ],
        "coordinates": [
          90.384,
          23.755
        ]
      }
    ]
  },
  {
    "name": "Shahbagh",
    "banglaName": "শাহবাগ",
    "aliases": [
      "shahbagh",
      "শাহবাগ",
      "katabon",
      "কাটাবন",
      "nilkhet",
      "নীলক্ষেত",
      "elephant road",
      "এলিফ্যান্ট রোড",
      "new market",
      "নিউ মার্কেট",
      "azimpur",
      "আজিমপুর",
      "hatirpool",
      "হাতিরপুল",
      "banglamotor",
      "বাংলামোটর",
      "paribagh",
      "পরিবাগ"
    ],
    "coordinates": [
      90.3965,
      23.7388
    ],
    "subAreas": [
      {
        "name": "Shahbagh Circle",
        "banglaName": "শাহবাগ মোড়",
        "aliases": [
          "shahbagh circle",
          "পিজি হাসপাতাল",
          "বারডেম"
        ],
        "coordinates": [
          90.3965,
          23.7388
        ]
      },
      {
        "name": "Katabon",
        "banglaName": "কাটাবন",
        "aliases": [
          "katabon",
          "কাটাবন মোড়",
          "কাটাবন ঢাল"
        ],
        "coordinates": [
          90.39,
          23.74
        ]
      },
      {
        "name": "Nilkhet",
        "banglaName": "নীলক্ষেত",
        "aliases": [
          "nilkhet",
          "নীলক্ষেত বই মার্কেট",
          "বাবলু রোড"
        ],
        "coordinates": [
          90.386,
          23.733
        ]
      },
      {
        "name": "Elephant Road",
        "banglaName": "এলিফ্যান্ট রোড",
        "aliases": [
          "elephant road",
          "এলিফ্যান্ট রোড",
          "বাটা সিগন্যাল",
          "মাল্টিপ্ল্যান"
        ],
        "coordinates": [
          90.385,
          23.74
        ]
      },
      {
        "name": "New Market",
        "banglaName": "নিউ মার্কেট",
        "aliases": [
          "new market",
          "নিউ মার্কেট",
          "গাউছিয়া",
          "চন্দ্রিমা সুপার মার্কেট"
        ],
        "coordinates": [
          90.383,
          23.734
        ]
      },
      {
        "name": "Azimpur",
        "banglaName": "আজিমপুর",
        "aliases": [
          "azimpur",
          "আজিমপুর বটতলা",
          "গভঃ কলোনি",
          "চায়না বিল্ডিং লেন",
          "ইরাকি কবরস্থান"
        ],
        "coordinates": [
          90.384,
          23.728
        ]
      },
      {
        "name": "Paribagh",
        "banglaName": "পরিবাগ",
        "aliases": [
          "paribagh",
          "পরিবাগ মোড়"
        ],
        "coordinates": [
          90.395,
          23.745
        ]
      },
      {
        "name": "Hatirpool",
        "banglaName": "হাতিরপুল",
        "aliases": [
          "hatirpool",
          "হাতিরপুল বাজার",
          "মোতালেব প্লাজা"
        ],
        "coordinates": [
          90.39,
          23.744
        ]
      },
      {
        "name": "Banglamotor",
        "banglaName": "বাংলামোটর",
        "aliases": [
          "banglamotor",
          "বাংলামোটর মোড়",
          "বিশ্বসাহিত্য কেন্দ্র"
        ],
        "coordinates": [
          90.395,
          23.748
        ]
      },
      {
        "name": "Palashi",
        "banglaName": "পলাশী",
        "aliases": [
          "palashi",
          "পলাশী মোড়",
          "বুয়েট ক্যাম্পাস সংলগ্ন"
        ],
        "coordinates": [
          90.389,
          23.727
        ]
      }
    ]
  },
  {
    "name": "Motijheel",
    "banglaName": "মতিঝিল",
    "aliases": [
      "motijheel",
      "মতিঝিল",
      "paltan",
      "পল্টন",
      "dilkusha",
      "দিলকুশা",
      "fakirapool",
      "ফকিরাপুল",
      "arambagh",
      "আরামবাগ",
      "kamalapur",
      "কমলাপুর",
      "shahjahanpur",
      "শাহজাহানপুর",
      "gopibagh",
      "গোপীবাগ"
    ],
    "coordinates": [
      90.4172,
      23.733
    ],
    "subAreas": [
      {
        "name": "Motijheel C/A",
        "banglaName": "মতিঝিল বা/এ",
        "aliases": [
          "motijheel c/a",
          "শাপলা চত্বর",
          "বাংলাদেশ ব্যাংক"
        ],
        "coordinates": [
          90.4172,
          23.733
        ]
      },
      {
        "name": "Dilkusha",
        "banglaName": "দিলকুশা",
        "aliases": [
          "dilkusha",
          "দিলকুশা বা/এ"
        ],
        "coordinates": [
          90.419,
          23.731
        ]
      },
      {
        "name": "Purana Paltan",
        "banglaName": "পুরানা পল্টন",
        "aliases": [
          "purana paltan",
          "পল্টন মোড়",
          "বায়তুল মোকাররম"
        ],
        "coordinates": [
          90.411,
          23.734
        ]
      },
      {
        "name": "Naya Paltan",
        "banglaName": "নয়া পল্টন",
        "aliases": [
          "naya paltan",
          "নয়া পল্টন বিএনপি অফিস সংলগ্ন"
        ],
        "coordinates": [
          90.412,
          23.736
        ]
      },
      {
        "name": "Fakirapool",
        "banglaName": "ফকিরাপুল",
        "aliases": [
          "fakirapool",
          "ফকিরাপুল পানির ট্যাংক"
        ],
        "coordinates": [
          90.416,
          23.736
        ]
      },
      {
        "name": "Arambagh",
        "banglaName": "আরামবাগ",
        "aliases": [
          "arambagh",
          "আরামবাগ বাসস্ট্যান্ড"
        ],
        "coordinates": [
          90.419,
          23.735
        ]
      },
      {
        "name": "Kamalapur",
        "banglaName": "কমলাপুর",
        "aliases": [
          "kamalapur",
          "কমলাপুর রেলওয়ে স্টেশন",
          "টিঅ্যান্ডটি কলোনি"
        ],
        "coordinates": [
          90.423,
          23.733
        ]
      },
      {
        "name": "Shahjahanpur",
        "banglaName": "শাহজাহানপুর",
        "aliases": [
          "shahjahanpur",
          "রেলওয়ে কলোনি শাহজাহানপুর"
        ],
        "coordinates": [
          90.42,
          23.742
        ]
      },
      {
        "name": "Gopibagh",
        "banglaName": "গোপীবাগ",
        "aliases": [
          "gopibagh",
          "গোপীবাগ বাজার",
          "ব্রাদার্স ইউনিয়ন"
        ],
        "coordinates": [
          90.425,
          23.729
        ]
      }
    ]
  },
  {
    "name": "Old Dhaka",
    "banglaName": "পুরান ঢাকা",
    "aliases": [
      "old dhaka",
      "পুরান ঢাকা",
      "puran dhaka",
      "lalbagh",
      "লালবাগ",
      "chawkbazar",
      "চকবাজার",
      "wari",
      "ওয়ারী",
      "sadarghat",
      "সদরঘাট",
      "armanitola",
      "আরমানিটোলা",
      "babu bazar",
      "বাবুবাজার",
      "islampur",
      "ইসলামপুর",
      "shankhari bazar",
      "শাখারি বাজার",
      "tanti bazar",
      "তাঁতি বাজার",
      "sutrapur",
      "সূত্রাপুর",
      "gandaria",
      "গেন্ডারিয়া",
      "narinda",
      "নারিন্দা",
      "tikatuli",
      "টিকাটুলী",
      "bangshal",
      "বংশাল"
    ],
    "coordinates": [
      90.4,
      23.715
    ],
    "subAreas": [
      {
        "name": "Wari",
        "banglaName": "ওয়ারী",
        "aliases": [
          "wari",
          "ওয়ারী",
          "র‌্যাঙ্কিন স্ট্রিট",
          "টিপু সুলতান রোড",
          "ওয়ারী ক্লাব"
        ],
        "coordinates": [
          90.42,
          23.717
        ]
      },
      {
        "name": "Lalbagh",
        "banglaName": "লালবাগ",
        "aliases": [
          "lalbagh",
          "লালবাগ কেল্লা",
          "শায়েস্তা খাঁ রোড"
        ],
        "coordinates": [
          90.388,
          23.718
        ]
      },
      {
        "name": "Chawkbazar",
        "banglaName": "চকবাজার",
        "aliases": [
          "chawkbazar",
          "চকবাজার",
          "বেগমবাজার",
          "উর্দু রোড",
          "চক সার্কুলার রোড"
        ],
        "coordinates": [
          90.395,
          23.715
        ]
      },
      {
        "name": "Sadarghat",
        "banglaName": "সদরঘাট",
        "aliases": [
          "sadarghat",
          "লঞ্চ টার্মিনাল",
          "ওয়াইজঘাট",
          "পাটুয়াটুলী"
        ],
        "coordinates": [
          90.412,
          23.708
        ]
      },
      {
        "name": "Armanitola",
        "banglaName": "আরমানিটোলা",
        "aliases": [
          "armanitola",
          "তারা মসজিদ সংলগ্ন",
          "আরমানিটোলা মাঠ"
        ],
        "coordinates": [
          90.404,
          23.713
        ]
      },
      {
        "name": "Babu Bazar",
        "banglaName": "বাবুবাজার",
        "aliases": [
          "babu bazar",
          "বাবুবাজার ব্রিজ",
          "মিটফোর্ড রোড"
        ],
        "coordinates": [
          90.401,
          23.711
        ]
      },
      {
        "name": "Islampur",
        "banglaName": "ইসলামপুর",
        "aliases": [
          "islampur",
          "কাপড়ের বাজার ইসলামপুর"
        ],
        "coordinates": [
          90.408,
          23.71
        ]
      },
      {
        "name": "Shankhari Bazar",
        "banglaName": "শাখারি বাজার",
        "aliases": [
          "shankhari bazar",
          "শাখারি পট্টি"
        ],
        "coordinates": [
          90.41,
          23.712
        ]
      },
      {
        "name": "Tanti Bazar",
        "banglaName": "তাঁতি বাজার",
        "aliases": [
          "tanti bazar",
          "তাঁতি বাজার স্বর্ণের মার্কেট"
        ],
        "coordinates": [
          90.407,
          23.713
        ]
      },
      {
        "name": "Sutrapur",
        "banglaName": "সূত্রাপুর",
        "aliases": [
          "sutrapur",
          "সূত্রাপুর থানা",
          "ধূপখোলা মাঠ"
        ],
        "coordinates": [
          90.418,
          23.71
        ]
      },
      {
        "name": "Gandaria",
        "banglaName": "গেন্ডারিয়া",
        "aliases": [
          "gandaria",
          "গেন্ডারিয়া রেলস্টেশন",
          "দীননাথ সেন রোড"
        ],
        "coordinates": [
          90.427,
          23.707
        ]
      },
      {
        "name": "Narinda",
        "banglaName": "নারিন্দা",
        "aliases": [
          "narinda",
          "নারিন্দা পুল",
          "শাহ সাহেব লেন"
        ],
        "coordinates": [
          90.422,
          23.712
        ]
      },
      {
        "name": "Tikatuli",
        "banglaName": "টিকাটুলী",
        "aliases": [
          "tikatuli",
          "টিকাটুলী মোড়",
          "রাজধানী সুপার মার্কেট",
          "অভয় দাস লেন"
        ],
        "coordinates": [
          90.421,
          23.72
        ]
      },
      {
        "name": "Bangshal",
        "banglaName": "বংশাল",
        "aliases": [
          "bangshal",
          "বংশাল মোড়",
          "নাজিরাবাজার",
          "আল রাজ্জাক সংলগ্ন"
        ],
        "coordinates": [
          90.408,
          23.718
        ]
      },
      {
        "name": "Swamibagh",
        "banglaName": "স্বামীবাগ",
        "aliases": [
          "swamibagh",
          "স্বামীবাগ ইসকন মন্দির সংলগ্ন"
        ],
        "coordinates": [
          90.424,
          23.717
        ]
      },
      {
        "name": "Dayaganj",
        "banglaName": "দয়াগঞ্জ",
        "aliases": [
          "dayaganj",
          "দয়াগঞ্জ মোড়",
          "দয়াগঞ্জ বাজার"
        ],
        "coordinates": [
          90.426,
          23.711
        ]
      }
    ]
  },
  {
    "name": "Hazaribagh",
    "banglaName": "হাজারীবাগ",
    "aliases": [
      "hazaribagh",
      "হাজারীবাগ",
      "kamrangirchar",
      "কামরাঙ্গীরচর",
      "jhauchar",
      "ঝাউচর",
      "tannery",
      "ট্যানারি"
    ],
    "coordinates": [
      90.369,
      23.733
    ],
    "subAreas": [
      {
        "name": "Hazaribagh Tannery",
        "banglaName": "ট্যানারি মোড়",
        "aliases": [
          "tannery more",
          "ট্যানারি মোড়",
          "হাজারীবাগ পার্ক"
        ],
        "coordinates": [
          90.369,
          23.733
        ]
      },
      {
        "name": "Jhauchar",
        "banglaName": "ঝাউচর",
        "aliases": [
          "jhauchar",
          "ঝাউচর বেড়িবাঁধ"
        ],
        "coordinates": [
          90.363,
          23.735
        ]
      },
      {
        "name": "Kamrangirchar",
        "banglaName": "কামরাঙ্গীরচর",
        "aliases": [
          "kamrangirchar",
          "কামরাঙ্গীরচর",
          "লোহারপুল",
          "আশ্রাফাবাদ",
          "রনি মার্কেট"
        ],
        "coordinates": [
          90.37,
          23.715
        ]
      },
      {
        "name": "Rayerbazar Beribadh",
        "banglaName": "রায়েরবাজার বেড়িবাঁধ",
        "aliases": [
          "beribadh",
          "বেড়িবাঁধ তিন রাস্তার মোড়"
        ],
        "coordinates": [
          90.355,
          23.742
        ]
      }
    ]
  },
  {
    "name": "Mohakhali",
    "banglaName": "মহাখালী",
    "aliases": [
      "mohakhali",
      "মহাখালী",
      "amtoli",
      "আমতলী",
      "tb gate",
      "টিবি গেট",
      "mohakhali dohs",
      "korail",
      "কড়াইল"
    ],
    "coordinates": [
      90.402,
      23.777
    ],
    "subAreas": [
      {
        "name": "Wireless Gate",
        "banglaName": "ওয়ারলেস গেট",
        "aliases": [
          "wireless gate",
          "মহাখালী ওয়ারলেস",
          "আইসিডিডিআরবি"
        ],
        "coordinates": [
          90.404,
          23.778
        ]
      },
      {
        "name": "Amtoli",
        "banglaName": "আমতলী",
        "aliases": [
          "amtoli",
          "আমতলী মোড় মহাখালী"
        ],
        "coordinates": [
          90.401,
          23.777
        ]
      },
      {
        "name": "TB Gate",
        "banglaName": "টিবি গেট",
        "aliases": [
          "tb gate",
          "টিবি গেট সংলগ্ন"
        ],
        "coordinates": [
          90.407,
          23.78
        ]
      },
      {
        "name": "Bus Terminal",
        "banglaName": "মহাখালী বাস টার্মিনাল",
        "aliases": [
          "bus terminal",
          "মহাখালী টার্মিনাল"
        ],
        "coordinates": [
          90.4,
          23.774
        ]
      },
      {
        "name": "Mohakhali DOHS",
        "banglaName": "মহাখালী ডিওএইচএস",
        "aliases": [
          "mohakhali dohs",
          "মহাখালী ডিওএইচএস"
        ],
        "coordinates": [
          90.392,
          23.778
        ]
      },
      {
        "name": "Korail",
        "banglaName": "কড়াইল",
        "aliases": [
          "korail",
          "কড়াইল বস্তি",
          "টিঅ্যান্ডটি কলোনি"
        ],
        "coordinates": [
          90.408,
          23.774
        ]
      },
      {
        "name": "Rasulbag",
        "banglaName": "রসুলবাগ",
        "aliases": [
          "rasulbag",
          "রসুলবাগ মহাখালী"
        ],
        "coordinates": [
          90.403,
          23.775
        ]
      }
    ]
  },
  {
    "name": "Khilkhet",
    "banglaName": "খিলক্ষেত",
    "aliases": [
      "khilkhet",
      "খিলক্ষেত",
      "nikunja",
      "নিকুঞ্জ",
      "airport",
      "বিমানবন্দর",
      "kawla",
      "কাওলা",
      "ashkona",
      "আশকোনা",
      "kuratoli",
      "কুড়াতলী"
    ],
    "coordinates": [
      90.4206,
      23.8293
    ],
    "subAreas": [
      {
        "name": "Nikunja 1",
        "banglaName": "নিকুঞ্জ ১",
        "aliases": [
          "nikunja 1",
          "নিকুঞ্জ ১"
        ],
        "coordinates": [
          90.417,
          23.825
        ]
      },
      {
        "name": "Nikunja 2",
        "banglaName": "নিকুঞ্জ ২",
        "aliases": [
          "nikunja 2",
          "নিকুঞ্জ ২",
          "খিলক্ষেত নিকুঞ্জ"
        ],
        "coordinates": [
          90.419,
          23.832
        ]
      },
      {
        "name": "Khilkhet Bazar",
        "banglaName": "খিলক্ষেত বাজার",
        "aliases": [
          "khilkhet bazar",
          "টানপাড়া",
          "নামাপাড়া"
        ],
        "coordinates": [
          90.425,
          23.83
        ]
      },
      {
        "name": "Airport",
        "banglaName": "বিমানবন্দর",
        "aliases": [
          "airport",
          "হযরত শাহজালাল বিমানবন্দর",
          "এয়ারপোর্ট রেলওয়ে স্টেশন"
        ],
        "coordinates": [
          90.408,
          23.844
        ]
      },
      {
        "name": "Kawla",
        "banglaName": "কাওলা",
        "aliases": [
          "kawla",
          "কাওলা বাজার",
          "আশিয়ান সিটি সংলগ্ন"
        ],
        "coordinates": [
          90.413,
          23.84
        ]
      },
      {
        "name": "Ashkona",
        "banglaName": "আশকোনা",
        "aliases": [
          "ashkona",
          "আশকোনা হজ্ব ক্যাম্প",
          "আশকোনা বাজার"
        ],
        "coordinates": [
          90.412,
          23.858
        ]
      },
      {
        "name": "Kuratoli",
        "banglaName": "কুড়াতলী",
        "aliases": [
          "kuratoli",
          "কুড়াতলী আমেরিকান ইন্টারন্যাশনাল এআইইউবি"
        ],
        "coordinates": [
          90.422,
          23.822
        ]
      }
    ]
  },
  {
    "name": "Shyamoli",
    "banglaName": "শ্যামলী",
    "aliases": [
      "shyamoli",
      "শ্যামলী",
      "kalyanpur",
      "কল্যাণপুর",
      "shishu mela",
      "শিশু মেলা",
      "shyamoli cinema"
    ],
    "coordinates": [
      90.365,
      23.772
    ],
    "subAreas": [
      {
        "name": "Shyamoli Square",
        "banglaName": "শ্যামলী স্কয়ার",
        "aliases": [
          "shyamoli square",
          "শ্যামলী সিনেমা",
          "রিং রোড সংলগ্ন"
        ],
        "coordinates": [
          90.365,
          23.772
        ]
      },
      {
        "name": "Kalyanpur",
        "banglaName": "কল্যাণপুর",
        "aliases": [
          "kalyanpur",
          "কল্যাণপুর বাসস্ট্যান্ড",
          "রোড ১ থেকে ১১",
          "খাজা রোড"
        ],
        "coordinates": [
          90.362,
          23.778
        ]
      },
      {
        "name": "Kalyanpur Natun Bazar",
        "banglaName": "কল্যাণপুর নতুন বাজার",
        "aliases": [
          "natun bazar kalyanpur",
          "নতুন বাজার কল্যাণপুর"
        ],
        "coordinates": [
          90.358,
          23.781
        ]
      }
    ]
  },
  {
    "name": "Agargaon",
    "banglaName": "আগারগাঁও",
    "aliases": [
      "agargaon",
      "আগারগাঁও",
      "sher-e-bangla nagar",
      "শেরেবাংলা নগর",
      "passport office",
      "পাসপোর্ট অফিস",
      "nirbachon bhaban"
    ],
    "coordinates": [
      90.375,
      23.778
    ],
    "subAreas": [
      {
        "name": "Agargaon Taltola",
        "banglaName": "আগারগাঁও তালতলা",
        "aliases": [
          "taltola agargaon",
          "তালতলা আগারগাঁও",
          "কলোনি বাজার"
        ],
        "coordinates": [
          90.372,
          23.781
        ]
      },
      {
        "name": "Sher-e-Bangla Nagar",
        "banglaName": "শেরেবাংলা নগর",
        "aliases": [
          "sher-e-bangla nagar",
          "জাতীয় সংসদ ভবন সংলগ্ন",
          "শিশু হাসপাতাল সংলগ্ন"
        ],
        "coordinates": [
          90.378,
          23.768
        ]
      },
      {
        "name": "BNP Bazar",
        "banglaName": "বিএনপি বাজার",
        "aliases": [
          "bnp bazar",
          "বিএনপি বাজার আগারগাঁও"
        ],
        "coordinates": [
          90.374,
          23.775
        ]
      },
      {
        "name": "Passport Office Area",
        "banglaName": "পাসপোর্ট অফিস সংলগ্ন",
        "aliases": [
          "passport office",
          "নির্বাচন ভবন মোড়"
        ],
        "coordinates": [
          90.376,
          23.777
        ]
      }
    ]
  },
  {
    "name": "Cantonment",
    "banglaName": "ক্যান্টনমেন্ট",
    "aliases": [
      "cantonment",
      "ক্যান্টনমেন্ট",
      "kafrul",
      "কাফরুল",
      "ibrahimpur",
      "ইব্রাহিমপুর",
      "vashantek",
      "ভাসানটেক",
      "matikata",
      "মাটিকাটা",
      "ecb chattar",
      "ইসিবি চত্বর",
      "manikdi",
      "মানিকদী",
      "kachukhet",
      "কচুক্ষেত"
    ],
    "coordinates": [
      90.395,
      23.815
    ],
    "subAreas": [
      {
        "name": "ECB Chattar",
        "banglaName": "ইসিবি চত্বর",
        "aliases": [
          "ecb chattar",
          "ইসিবি চত্বর",
          "মাটিকাটা মোড়"
        ],
        "coordinates": [
          90.391,
          23.821
        ]
      },
      {
        "name": "Kachukhet",
        "banglaName": "কচুক্ষেত",
        "aliases": [
          "kachukhet",
          "কচুক্ষেত বাজার",
          "সৈনিক ক্লাব"
        ],
        "coordinates": [
          90.39,
          23.796
        ]
      },
      {
        "name": "Kafrul",
        "banglaName": "কাফরুল",
        "aliases": [
          "kafrul",
          "কাফরুল থানা",
          "সেনপাড়া পর্বতা"
        ],
        "coordinates": [
          90.38,
          23.792
        ]
      },
      {
        "name": "Ibrahimpur",
        "banglaName": "ইব্রাহিমপুর",
        "aliases": [
          "ibrahimpur",
          "ইব্রাহিমপুর পুলপাড়"
        ],
        "coordinates": [
          90.386,
          23.795
        ]
      },
      {
        "name": "Vashantek",
        "banglaName": "ভাসানটেক",
        "aliases": [
          "vashantek",
          "ভাসানটেক বাজার",
          "ধামালকোট"
        ],
        "coordinates": [
          90.392,
          23.809
        ]
      },
      {
        "name": "Matikata",
        "banglaName": "মাটিকাটা",
        "aliases": [
          "matikata",
          "মাটিকাটা রোড"
        ],
        "coordinates": [
          90.39,
          23.818
        ]
      },
      {
        "name": "Manikdi",
        "banglaName": "মানিকদী",
        "aliases": [
          "manikdi",
          "মানিকদী বাজার",
          "ক্যান্টনমেন্ট সংলগ্ন"
        ],
        "coordinates": [
          90.394,
          23.824
        ]
      }
    ]
  },
  {
    "name": "Bhatara",
    "banglaName": "ভাটারা",
    "aliases": [
      "bhatara",
      "ভাটারা",
      "solmaid",
      "ছোলমাইদ",
      "joar sahara",
      "জোয়ার সাহারা",
      "purbachal",
      "পূর্বাচল",
      "300 feet",
      "৩০০ ফিট"
    ],
    "coordinates": [
      90.431,
      23.805
    ],
    "subAreas": [
      {
        "name": "Solmaid",
        "banglaName": "ছোলমাইদ",
        "aliases": [
          "solmaid",
          "ছোলমাইদ বাজার",
          "ভাটারা মোড়"
        ],
        "coordinates": [
          90.436,
          23.802
        ]
      },
      {
        "name": "Joar Sahara",
        "banglaName": "জোয়ার সাহারা",
        "aliases": [
          "joar sahara",
          "জোয়ার সাহারা বাজার"
        ],
        "coordinates": [
          90.424,
          23.813
        ]
      },
      {
        "name": "Jagannathpur",
        "banglaName": "জগন্নাথপুর",
        "aliases": [
          "jagannathpur",
          "জগন্নাথপুর নদ্দা"
        ],
        "coordinates": [
          90.429,
          23.809
        ]
      },
      {
        "name": "300 Feet",
        "banglaName": "৩০০ ফিট",
        "aliases": [
          "300 feet",
          "৩০০ ফিট এক্সপ্রেসওয়ে",
          "কাঞ্চন ব্রিজ রোড"
        ],
        "coordinates": [
          90.445,
          23.82
        ]
      },
      {
        "name": "Purbachal",
        "banglaName": "পূর্বাচল নতুন শহর",
        "aliases": [
          "purbachal",
          "পূর্বাচল",
          "সেক্টর ১ থেকে ৩০"
        ],
        "coordinates": [
          90.485,
          23.84
        ]
      }
    ]
  },
  {
    "name": "Jatrabari",
    "banglaName": "যাত্রাবাড়ী",
    "aliases": [
      "jatrabari",
      "যাত্রাবাড়ী",
      "sayedabad",
      "সায়েদাবাদ",
      "shanir akhra",
      "শনির আখড়া",
      "rayerbagh",
      "রায়েরবাগ",
      "matuail",
      "মাতুয়াইল",
      "demra",
      "ডেমরা",
      "dania",
      "দনিয়া",
      "dholairpar",
      "ধোলাইরপাড়"
    ],
    "coordinates": [
      90.4349,
      23.7104
    ],
    "subAreas": [
      {
        "name": "Jatrabari Chowrasta",
        "banglaName": "যাত্রাবাড়ী চৌরাস্তা",
        "aliases": [
          "chowrasta",
          "যাত্রাবাড়ী মোড়",
          "শহীদ ফারুক রোড"
        ],
        "coordinates": [
          90.4349,
          23.7104
        ]
      },
      {
        "name": "Sayedabad",
        "banglaName": "সায়েদাবাদ",
        "aliases": [
          "sayedabad",
          "সায়েদাবাদ বাস টার্মিনাল",
          "জনপথ মোড়"
        ],
        "coordinates": [
          90.428,
          23.715
        ]
      },
      {
        "name": "Shanir Akhra",
        "banglaName": "শনির আখড়া",
        "aliases": [
          "shanir akhra",
          "শনির আখড়া বাসস্ট্যান্ড",
          "জিয়া সরণি"
        ],
        "coordinates": [
          90.449,
          23.705
        ]
      },
      {
        "name": "Rayerbagh",
        "banglaName": "রায়েরবাগ",
        "aliases": [
          "rayerbagh",
          "রায়েরবাগ বাসস্ট্যান্ড",
          "কদমতলী সংলগ্ন"
        ],
        "coordinates": [
          90.457,
          23.7
        ]
      },
      {
        "name": "Matuail",
        "banglaName": "মাতুয়াইল",
        "aliases": [
          "matuail",
          "মাতুয়াইল মেডিকেল",
          "মাতুয়াইল কবরস্থান"
        ],
        "coordinates": [
          90.465,
          23.708
        ]
      },
      {
        "name": "Demra",
        "banglaName": "ডেমরা",
        "aliases": [
          "demra",
          "ডেমরা বাজার",
          "স্টাফ কোয়ার্টার",
          "সারুলিয়া",
          "কোনাপাড়া"
        ],
        "coordinates": [
          90.495,
          23.715
        ]
      },
      {
        "name": "Dania",
        "banglaName": "দনিয়া",
        "aliases": [
          "dania",
          "দনিয়া কলেজ রোড",
          "রসুলপুর দনিয়া"
        ],
        "coordinates": [
          90.445,
          23.7
        ]
      },
      {
        "name": "Dholairpar",
        "banglaName": "ধোলাইরপাড়",
        "aliases": [
          "dholairpar",
          "ধোলাইরপাড় চত্বর",
          "ফ্লাইওভার সংলগ্ন"
        ],
        "coordinates": [
          90.432,
          23.702
        ]
      }
    ]
  },
  {
    "name": "Mugda",
    "banglaName": "মুগদা",
    "aliases": [
      "mugda",
      "মুগদা",
      "maniknagar",
      "মানিকনগর",
      "manda",
      "মান্দা",
      "dhalpur",
      "ধলপুর",
      "golapbagh",
      "গোলাপবাগ"
    ],
    "coordinates": [
      90.431,
      23.729
    ],
    "subAreas": [
      {
        "name": "North Mugda",
        "banglaName": "উত্তর মুগদা",
        "aliases": [
          "north mugda",
          "উত্তর মুগদা",
          "মুগদা ঝিলপাড়"
        ],
        "coordinates": [
          90.432,
          23.731
        ]
      },
      {
        "name": "South Mugda",
        "banglaName": "দক্ষিণ মুগদা",
        "aliases": [
          "south mugda",
          "মুগদা মেডিকেল সংলগ্ন"
        ],
        "coordinates": [
          90.43,
          23.728
        ]
      },
      {
        "name": "Maniknagar",
        "banglaName": "মানিকনগর",
        "aliases": [
          "maniknagar",
          "মানিকনগর বিশ্বরোড",
          "মিয়াজান গলি"
        ],
        "coordinates": [
          90.428,
          23.723
        ]
      },
      {
        "name": "Manda",
        "banglaName": "মান্দা",
        "aliases": [
          "manda",
          "মান্দা বাজার",
          "গ্রীন মডেল টাউন"
        ],
        "coordinates": [
          90.44,
          23.728
        ]
      },
      {
        "name": "Dhalpur",
        "banglaName": "ধলপুর",
        "aliases": [
          "dhalpur",
          "ধলপুর সিটি কলোনি"
        ],
        "coordinates": [
          90.43,
          23.718
        ]
      },
      {
        "name": "Golapbagh",
        "banglaName": "গোলাপবাগ",
        "aliases": [
          "golapbagh",
          "গোলাপবাগ মাঠ",
          "সায়েদাবাদ সংলগ্ন"
        ],
        "coordinates": [
          90.427,
          23.719
        ]
      }
    ]
  },
  {
    "name": "Jurain",
    "banglaName": "জুরাইন",
    "aliases": [
      "jurain",
      "জুরাইন",
      "shyampur",
      "শ্যামপুর",
      "postogola",
      "পোস্তগোলা",
      "kadamtali",
      "কদমতলী"
    ],
    "coordinates": [
      90.437,
      23.698
    ],
    "subAreas": [
      {
        "name": "Jurain Railgate",
        "banglaName": "জুরাইন রেলগেট",
        "aliases": [
          "jurain railgate",
          "জুরাইন বাজার",
          "কমিশনার রোড"
        ],
        "coordinates": [
          90.437,
          23.698
        ]
      },
      {
        "name": "Shyampur",
        "banglaName": "শ্যামপুর",
        "aliases": [
          "shyampur",
          "শ্যামপুর শিল্পাঞ্চল",
          "ইকো পার্ক"
        ],
        "coordinates": [
          90.435,
          23.689
        ]
      },
      {
        "name": "Postogola",
        "banglaName": "পোস্তগোলা",
        "aliases": [
          "postogola",
          "পোস্তগোলা ব্রিজ",
          "বুড়িগঙ্গা সেতু"
        ],
        "coordinates": [
          90.431,
          23.693
        ]
      },
      {
        "name": "Kadamtali",
        "banglaName": "কদমতলী",
        "aliases": [
          "kadamtali",
          "কদমতলী থানা"
        ],
        "coordinates": [
          90.435,
          23.693
        ]
      }
    ]
  },
  {
    "name": "Keraniganj",
    "banglaName": "কেরানীগঞ্জ",
    "aliases": [
      "keraniganj",
      "কেরানীগঞ্জ",
      "jinjira",
      "জিনজিরা",
      "chunkutia",
      "চুনকুটিয়া",
      "aganagar",
      "আগানগর",
      "hasnabad",
      "হাসনাবাদ"
    ],
    "coordinates": [
      90.39,
      23.69
    ],
    "subAreas": [
      {
        "name": "Jinjira",
        "banglaName": "জিনজিরা",
        "aliases": [
          "jinjira",
          "জিনজিরা বাসস্ট্যান্ড",
          "জিনজিরা বাজার"
        ],
        "coordinates": [
          90.393,
          23.705
        ]
      },
      {
        "name": "Chunkutia",
        "banglaName": "চুনকুটিয়া",
        "aliases": [
          "chunkutia",
          "চুনকুটিয়া চৌরাস্তা"
        ],
        "coordinates": [
          90.405,
          23.695
        ]
      },
      {
        "name": "Aganagar",
        "banglaName": "আগানগর",
        "aliases": [
          "aganagar",
          "আগানগর কাপড়ের মার্কেট"
        ],
        "coordinates": [
          90.398,
          23.702
        ]
      },
      {
        "name": "Hasnabad",
        "banglaName": "হাসনাবাদ",
        "aliases": [
          "hasnabad",
          "হাসনাবাদ হাউজিং"
        ],
        "coordinates": [
          90.425,
          23.682
        ]
      },
      {
        "name": "Rohitpur",
        "banglaName": "রোহিতপুর",
        "aliases": [
          "rohitpur",
          "রোহিতপুর বাজার"
        ],
        "coordinates": [
          90.285,
          23.695
        ]
      }
    ]
  },
  {
    "name": "Savar",
    "banglaName": "সাভার",
    "aliases": [
      "savar",
      "সাভার",
      "hemayetpur",
      "হেমায়েতপুর",
      "radio colony",
      "রেডিও কলোনি",
      "crp",
      "সিআরপি"
    ],
    "coordinates": [
      90.2667,
      23.8583
    ],
    "subAreas": [
      {
        "name": "Savar Bazar",
        "banglaName": "সাভার বাজার",
        "aliases": [
          "savar bazar",
          "সাভার বাসস্ট্যান্ড",
          "থানা রোড",
          "সিআরপি"
        ],
        "coordinates": [
          90.26,
          23.855
        ]
      },
      {
        "name": "Hemayetpur",
        "banglaName": "হেমায়েতপুর",
        "aliases": [
          "hemayetpur",
          "হেমায়েতপুর বাসস্ট্যান্ড",
          "ট্যানারি মোড় হেমায়েতপুর"
        ],
        "coordinates": [
          90.278,
          23.795
        ]
      },
      {
        "name": "Radio Colony",
        "banglaName": "রেডিও কলোনি",
        "aliases": [
          "radio colony",
          "রেডিও কলোনি সাভার"
        ],
        "coordinates": [
          90.262,
          23.848
        ]
      },
      {
        "name": "Bank Town",
        "banglaName": "ব্যাংক টাউন",
        "aliases": [
          "bank town",
          "ব্যাংক টাউন সাভার"
        ],
        "coordinates": [
          90.269,
          23.839
        ]
      }
    ]
  },
  {
    "name": "Ashulia",
    "banglaName": "আশুলিয়া",
    "aliases": [
      "ashulia",
      "আশুলিয়া",
      "baipail",
      "বাইপাইল",
      "depz",
      "ডিইপিজেড",
      "jamgora",
      "জামগড়া",
      "zirabo",
      "জিরাবো",
      "nabinagar",
      "নবীনগর"
    ],
    "coordinates": [
      90.32,
      23.9
    ],
    "subAreas": [
      {
        "name": "Ashulia Bazar",
        "banglaName": "আশুলিয়া বাজার",
        "aliases": [
          "ashulia bazar",
          "বেড়িবাঁধ আশুলিয়া"
        ],
        "coordinates": [
          90.32,
          23.9
        ]
      },
      {
        "name": "Baipail",
        "banglaName": "বাইপাইল",
        "aliases": [
          "baipail",
          "বাইপাইল ত্রিমোড়",
          "বাইপাইল বাসস্ট্যান্ড"
        ],
        "coordinates": [
          90.27,
          23.935
        ]
      },
      {
        "name": "DEPZ",
        "banglaName": "ডিইপিজেড",
        "aliases": [
          "depz",
          "ডিইপিজেড গেট",
          "ইপিজেড"
        ],
        "coordinates": [
          90.28,
          23.94
        ]
      },
      {
        "name": "Jamgora",
        "banglaName": "জামগড়া",
        "aliases": [
          "jamgora",
          "জামগড়া চৌরাস্তা"
        ],
        "coordinates": [
          90.315,
          23.92
        ]
      },
      {
        "name": "Zirabo",
        "banglaName": "জিরাবো",
        "aliases": [
          "zirabo",
          "জিরাবো বাজার"
        ],
        "coordinates": [
          90.335,
          23.91
        ]
      },
      {
        "name": "Nabinagar",
        "banglaName": "নবীনগর",
        "aliases": [
          "nabinagar",
          "জাতীয় স্মৃতিসৌধ সংলগ্ন"
        ],
        "coordinates": [
          90.255,
          23.91
        ]
      }
    ]
  },
  {
    "name": "Gazipur",
    "banglaName": "গাজীপুর",
    "aliases": [
      "gazipur",
      "গাজীপুর",
      "tongi",
      "টঙ্গী",
      "board bazar",
      "বোর্ড বাজার",
      "chowrasta",
      "চৌরাস্তা",
      "konabari",
      "কোনাবাড়ী"
    ],
    "coordinates": [
      90.4203,
      23.9999
    ],
    "subAreas": [
      {
        "name": "Tongi",
        "banglaName": "টঙ্গী",
        "aliases": [
          "tongi",
          "টঙ্গী স্টেশন রোড",
          "টঙ্গী বাজার",
          "চেরাগ আলী",
          "কলেজ গেট"
        ],
        "coordinates": [
          90.4,
          23.89
        ]
      },
      {
        "name": "Board Bazar",
        "banglaName": "বোর্ড বাজার",
        "aliases": [
          "board bazar",
          "বোর্ড বাজার ইসলামিক বিশ্ববিদ্যালয়"
        ],
        "coordinates": [
          90.395,
          23.95
        ]
      },
      {
        "name": "Gazipur Chowrasta",
        "banglaName": "গাজীপুর চৌরাস্তা",
        "aliases": [
          "gazipur chowrasta",
          "চান্দনা চৌরাস্তা"
        ],
        "coordinates": [
          90.395,
          23.99
        ]
      },
      {
        "name": "Konabari",
        "banglaName": "কোনাবাড়ী",
        "aliases": [
          "konabari",
          "কোনাবাড়ী বিসিক"
        ],
        "coordinates": [
          90.325,
          24.01
        ]
      }
    ]
  },
  {
    "name": "Narayanganj",
    "banglaName": "নারায়ণগঞ্জ",
    "aliases": [
      "narayanganj",
      "নারায়ণগঞ্জ",
      "chashara",
      "চাষাড়া",
      "signboard",
      "সাইনবোর্ড",
      "shiddhirganj",
      "সিদ্ধিরগঞ্জ",
      "fatullah",
      "ফতুল্লা"
    ],
    "coordinates": [
      90.5,
      23.6238
    ],
    "subAreas": [
      {
        "name": "Chashara",
        "banglaName": "চাষাড়া",
        "aliases": [
          "chashara",
          "চাষাড়া গোলচত্বর",
          "চাষাড়া রেলওয়ে স্টেশন"
        ],
        "coordinates": [
          90.499,
          23.624
        ]
      },
      {
        "name": "Signboard",
        "banglaName": "সাইনবোর্ড",
        "aliases": [
          "signboard",
          "সাইনবোর্ড মোড়",
          "ঢাকা-চট্টগ্রাম হাইওয়ে সংলগ্ন"
        ],
        "coordinates": [
          90.478,
          23.682
        ]
      },
      {
        "name": "Shiddhirganj",
        "banglaName": "সিদ্ধিরগঞ্জ",
        "aliases": [
          "shiddhirganj",
          "সিদ্ধিরগঞ্জ পুল",
          "কাঁচপুর ব্রিজ সংলগ্ন"
        ],
        "coordinates": [
          90.515,
          23.67
        ]
      },
      {
        "name": "Fatullah",
        "banglaName": "ফতুল্লা",
        "aliases": [
          "fatullah",
          "ফতুল্লা স্টেডিয়াম সংলগ্ন",
          "পঞ্চবটী"
        ],
        "coordinates": [
          90.485,
          23.65
        ]
      }
    ]
  },
  {
    "name": "Chittagong",
    "banglaName": "চট্টগ্রাম",
    "aliases": [
      "chittagong",
      "chattogram",
      "চট্টগ্রাম",
      "agrabad",
      "আগ্রাবাদ",
      "gec",
      "জিইসি",
      "nasirabad",
      "নাসিরাবাদ",
      "khulshi",
      "খুলশী",
      "halishahar",
      "হালিশহর",
      "chawkbazar ctg"
    ],
    "coordinates": [
      91.7832,
      22.3569
    ],
    "subAreas": [
      {
        "name": "GEC Circle",
        "banglaName": "জিইসি মোড়",
        "aliases": [
          "gec",
          "জিইসি মোড়",
          "খুলশী সংলগ্ন"
        ],
        "coordinates": [
          91.821,
          22.358
        ]
      },
      {
        "name": "Agrabad",
        "banglaName": "আগ্রাবাদ",
        "aliases": [
          "agrabad",
          "আগ্রাবাদ বা/এ",
          "বাদামতলী মোড়"
        ],
        "coordinates": [
          91.812,
          22.327
        ]
      },
      {
        "name": "Nasirabad",
        "banglaName": "নাসিরাবাদ",
        "aliases": [
          "nasirabad",
          "নাসিরাবাদ হাউজিং"
        ],
        "coordinates": [
          91.819,
          22.37
        ]
      },
      {
        "name": "Halishahar",
        "banglaName": "হালিশহর",
        "aliases": [
          "halishahar",
          "হালিশহর হাউজিং এস্টেট",
          "বড়পুল"
        ],
        "coordinates": [
          91.785,
          22.338
        ]
      },
      {
        "name": "Chawkbazar Ctg",
        "banglaName": "চকবাজার চট্টগ্রাম",
        "aliases": [
          "chawkbazar ctg",
          "চকবাজার চিটাগাং",
          "গুলজার মোড়"
        ],
        "coordinates": [
          91.838,
          22.358
        ]
      }
    ]
  },
  {
    "name": "Sylhet",
    "banglaName": "সিলেট",
    "aliases": [
      "sylhet",
      "সিলেট",
      "zindabazar",
      "জিন্দাবাজার",
      "amberkhana",
      "আম্বরখানা",
      "subidbazar",
      "সুবিদবাজার",
      "shahi eidgah",
      "শাহী ঈদগাহ"
    ],
    "coordinates": [
      91.8687,
      24.8949
    ],
    "subAreas": [
      {
        "name": "Zindabazar",
        "banglaName": "জিন্দাবাজার",
        "aliases": [
          "zindabazar",
          "জিন্দাবাজার পয়েন্ট"
        ],
        "coordinates": [
          91.869,
          24.896
        ]
      },
      {
        "name": "Amberkhana",
        "banglaName": "আম্বরখানা",
        "aliases": [
          "amberkhana",
          "আম্বরখানা পয়েন্ট"
        ],
        "coordinates": [
          91.868,
          24.908
        ]
      },
      {
        "name": "Subidbazar",
        "banglaName": "সুবিদবাজার",
        "aliases": [
          "subidbazar",
          "সুবিদবাজার পয়েন্ট"
        ],
        "coordinates": [
          91.855,
          24.902
        ]
      },
      {
        "name": "Shahi Eidgah",
        "banglaName": "শাহী ঈদগাহ",
        "aliases": [
          "shahi eidgah",
          "টিলাগড় সংলগ্ন"
        ],
        "coordinates": [
          91.88,
          24.905
        ]
      }
    ]
  },
  {
    "name": "Rajshahi",
    "banglaName": "রাজশাহী",
    "aliases": [
      "rajshahi",
      "রাজশাহী",
      "motihar",
      "মতিহার",
      "shaheb bazar",
      "সাহেব বাজার",
      "kazla",
      "কাজলা",
      "talaimari",
      "তালাইমারী",
      "laxmipur",
      "লক্ষ্মীপুর রাজশাহী"
    ],
    "coordinates": [
      88.6241,
      24.3636
    ],
    "subAreas": [
      {
        "name": "Shaheb Bazar",
        "banglaName": "সাহেব বাজার",
        "aliases": [
          "shaheb bazar",
          "সাহেব বাজার জিরো পয়েন্ট"
        ],
        "coordinates": [
          88.601,
          24.367
        ]
      },
      {
        "name": "Motihar",
        "banglaName": "মতিহার",
        "aliases": [
          "motihar",
          "রাবি ক্যাম্পাস সংলগ্ন",
          "কাজলা"
        ],
        "coordinates": [
          88.636,
          24.368
        ]
      },
      {
        "name": "Talaimari",
        "banglaName": "তালাইমারী",
        "aliases": [
          "talaimari",
          "রুয়েট সংলগ্ন",
          "তালাইমারী মোড়"
        ],
        "coordinates": [
          88.628,
          24.364
        ]
      },
      {
        "name": "Laxmipur",
        "banglaName": "লক্ষ্মীপুর",
        "aliases": [
          "laxmipur",
          "মেডিকেল মোড় রাজশাহী",
          "লক্ষ্মীপুর ভাটাপাড়া"
        ],
        "coordinates": [
          88.586,
          24.372
        ]
      },
      {
        "name": "New Market",
        "banglaName": "নিউ মার্কেট",
        "aliases": [
          "new market",
          "থিম ওমর প্লাজা সংলগ্ন"
        ],
        "coordinates": [
          88.595,
          24.373
        ]
      },
      {
        "name": "Shiroil",
        "banglaName": "শিরোইল",
        "aliases": [
          "shiroil",
          "শিরোইল বাস টার্মিনাল",
          "রেলওয়ে স্টেশন"
        ],
        "coordinates": [
          88.602,
          24.376
        ]
      },
      {
        "name": "Upashohor",
        "banglaName": "উপশহর",
        "aliases": [
          "upashohor",
          "উপশহর হাউজিং এস্টেট রাজশাহী"
        ],
        "coordinates": [
          88.598,
          24.382
        ]
      },
      {
        "name": "Vodra",
        "banglaName": "ভদ্রা",
        "aliases": [
          "vodra",
          "ভদ্রা মোড়"
        ],
        "coordinates": [
          88.618,
          24.372
        ]
      }
    ]
  },
  {
    "name": "Khulna",
    "banglaName": "খুলনা",
    "aliases": [
      "khulna",
      "খুলনা",
      "sonadanga",
      "সোনাডাঙ্গা",
      "khalishpur",
      "খালিশপুর",
      "daulatpur",
      "দৌলতপুর"
    ],
    "coordinates": [
      89.5403,
      22.8456
    ],
    "subAreas": [
      {
        "name": "Sonadanga",
        "banglaName": "সোনাডাঙ্গা",
        "aliases": [
          "sonadanga",
          "সোনাডাঙ্গা বাস টার্মিনাল",
          "সোনাডাঙ্গা আবাসিক"
        ],
        "coordinates": [
          89.537,
          22.822
        ]
      },
      {
        "name": "Khalishpur",
        "banglaName": "খালিশপুর",
        "aliases": [
          "khalishpur",
          "খালিশপুর হাউজিং"
        ],
        "coordinates": [
          89.535,
          22.86
        ]
      },
      {
        "name": "Daulatpur",
        "banglaName": "দৌলতপুর",
        "aliases": [
          "daulatpur",
          "দৌলতপুর বাজার"
        ],
        "coordinates": [
          89.52,
          22.88
        ]
      }
    ]
  },
  {
    "name": "Barisal",
    "banglaName": "বরিশাল",
    "aliases": [
      "barisal",
      "barishal",
      "বরিশাল",
      "sadar road",
      "সদর রোড",
      "rupatali",
      "রূপাতলী",
      "natun bazar barisal"
    ],
    "coordinates": [
      90.3696,
      22.701
    ],
    "subAreas": [
      {
        "name": "Sadar Road",
        "banglaName": "সদর রোড",
        "aliases": [
          "sadar road",
          "সদর রোড বরিশাল"
        ],
        "coordinates": [
          90.37,
          22.703
        ]
      },
      {
        "name": "Rupatali",
        "banglaName": "রূপাতলী",
        "aliases": [
          "rupatali",
          "রূপাতলী বাস টার্মিনাল"
        ],
        "coordinates": [
          90.35,
          22.68
        ]
      }
    ]
  },
  {
    "name": "Rangpur",
    "banglaName": "রংপুর",
    "aliases": [
      "rangpur",
      "রংপুর",
      "dhap",
      "ধাপ",
      "lalbagh rangpur",
      "জাহাজ কোম্পানি মোড়",
      "payra chottor"
    ],
    "coordinates": [
      89.2444,
      25.7439
    ],
    "subAreas": [
      {
        "name": "Dhap",
        "banglaName": "ধাপ",
        "aliases": [
          "dhap",
          "ধাপ মেডিকেল মোড়"
        ],
        "coordinates": [
          89.23,
          25.755
        ]
      },
      {
        "name": "Jahaj Company",
        "banglaName": "জাহাজ কোম্পানি মোড়",
        "aliases": [
          "jahaj company",
          "পায়রা চত্বর"
        ],
        "coordinates": [
          89.248,
          25.745
        ]
      },
      {
        "name": "Jahaj Company Mour",
        "banglaName": "জাহাজ কোম্পানি মোড়",
        "aliases": [
          "jahaj company",
          "পায়রা চত্বর",
          "জাহাজ কোম্পানি"
        ],
        "coordinates": [
          89.248,
          25.745
        ]
      },
      {
        "name": "Lalbagh",
        "banglaName": "লালবাগ",
        "aliases": [
          "lalbagh",
          "কারমাইকেল কলেজ মোড়",
          "লালবাগ রংপুর"
        ],
        "coordinates": [
          89.261,
          25.731
        ]
      },
      {
        "name": "Modern Mour",
        "banglaName": "মডার্ন মোড়",
        "aliases": [
          "modern mour",
          "মডার্ন মোড় রংপুর"
        ],
        "coordinates": [
          89.255,
          25.719
        ]
      },
      {
        "name": "Radhaballabh",
        "banglaName": "রাধাবল্লভ",
        "aliases": [
          "radhaballabh",
          "রাধাবল্লভ"
        ],
        "coordinates": [
          89.242,
          25.751
        ]
      },
      {
        "name": "Keranipara",
        "banglaName": "কেরানীপাড়া",
        "aliases": [
          "keranipara",
          "কেরানীপাড়া"
        ],
        "coordinates": [
          89.239,
          25.748
        ]
      },
      {
        "name": "Medical Purbopara",
        "banglaName": "মেডিকেল পূর্বপাড়া",
        "aliases": [
          "medical",
          "মেডিকেল পূর্বপাড়া রংপুর"
        ],
        "coordinates": [
          89.227,
          25.758
        ]
      },
      {
        "name": "Mahiganj",
        "banglaName": "মাহিগঞ্জ",
        "aliases": [
          "mahiganj",
          "মাহিগঞ্জ বাজার"
        ],
        "coordinates": [
          89.289,
          25.738
        ]
      },
      {
        "name": "RK Road",
        "banglaName": "আরকে রোড",
        "aliases": [
          "rk road",
          "রংপুর কুড়িগ্রাম রোড"
        ],
        "coordinates": [
          89.265,
          25.748
        ]
      }
    ]
  },
  {
    "name": "Mymensingh",
    "banglaName": "ময়মনসিংহ",
    "aliases": [
      "mymensingh",
      "ময়মনসিংহ",
      "ganginar par",
      "গাঙ্গিনার পাড়",
      "charpara",
      "চরপাড়া",
      "town hall mymensingh",
      "bau",
      "বাকৃবি"
    ],
    "coordinates": [
      90.4049,
      24.7471
    ],
    "subAreas": [
      {
        "name": "Charpara",
        "banglaName": "চরপাড়া",
        "aliases": [
          "charpara",
          "মেডিকেল মোড় ময়মনসিংহ"
        ],
        "coordinates": [
          90.41,
          24.738
        ]
      },
      {
        "name": "Ganginar Par",
        "banglaName": "গাঙ্গিনার পাড়",
        "aliases": [
          "ganginar par",
          "গাঙ্গিনার পাড় মোড়"
        ],
        "coordinates": [
          90.405,
          24.752
        ]
      },
      {
        "name": "Town Hall",
        "banglaName": "টাউন হল",
        "aliases": [
          "town hall",
          "টাউন হল চত্বর ময়মনসিংহ"
        ],
        "coordinates": [
          90.402,
          24.756
        ]
      },
      {
        "name": "Notun Bazar",
        "banglaName": "নতুন বাজার",
        "aliases": [
          "notun bazar",
          "নতুন বাজার ময়মনসিংহ"
        ],
        "coordinates": [
          90.407,
          24.749
        ]
      },
      {
        "name": "Shankipara",
        "banglaName": "শাঁখিপাড়া",
        "aliases": [
          "shankipara",
          "শাঁখিপাড়া রেলক্রসিং"
        ],
        "coordinates": [
          90.395,
          24.748
        ]
      },
      {
        "name": "Akua",
        "banglaName": "আকুয়া",
        "aliases": [
          "akua",
          "আকুয়া মোড়",
          "বাইপাস আকুয়া"
        ],
        "coordinates": [
          90.388,
          24.741
        ]
      },
      {
        "name": "BAU Campus",
        "banglaName": "বাকৃবি ক্যাম্পাস",
        "aliases": [
          "bau",
          "বাংলাদেশ কৃষি বিশ্ববিদ্যালয়",
          "শেষ মোড়"
        ],
        "coordinates": [
          90.428,
          24.725
        ]
      }
    ]
  },
  {
    "name": "Comilla",
    "banglaName": "কুমিল্লা",
    "aliases": [
      "comilla",
      "cumilla",
      "কুমিল্লা",
      "kandirpar",
      "কান্দিরপাড়",
      "shashangachha",
      "শাসনগাছা",
      "badurtala",
      "বাদুড়তলা"
    ],
    "coordinates": [
      91.1809,
      23.4607
    ],
    "subAreas": [
      {
        "name": "Kandirpar",
        "banglaName": "কান্দিরপাড়",
        "aliases": [
          "kandirpar",
          "কান্দিরপাড় টাউন হল"
        ],
        "coordinates": [
          91.181,
          23.461
        ]
      },
      {
        "name": "Shashangachha",
        "banglaName": "শাসনগাছা",
        "aliases": [
          "shashangachha",
          "শাসনগাছা বাস টার্মিনাল"
        ],
        "coordinates": [
          91.171,
          23.468
        ]
      }
    ]
  },
  {
    "name": "Dhaka",
    "banglaName": "ঢাকা",
    "aliases": [
      "dhaka",
      "ঢাকা",
      "dhaka city",
      "ঢাকা শহর",
      "রাজধানী ঢাকা"
    ],
    "coordinates": [
      90.399452,
      23.777176
    ],
    "subAreas": [
      {
        "name": "Mirpur",
        "banglaName": "মিরপুর",
        "aliases": [
          "mirpur",
          "মিরপুর"
        ],
        "coordinates": [
          90.3685,
          23.8067
        ]
      },
      {
        "name": "Dhanmondi",
        "banglaName": "ধানমন্ডি",
        "aliases": [
          "dhanmondi",
          "ধানমন্ডি"
        ],
        "coordinates": [
          90.3742,
          23.7465
        ]
      },
      {
        "name": "Uttara",
        "banglaName": "উত্তরা",
        "aliases": [
          "uttara",
          "উত্তরা"
        ],
        "coordinates": [
          90.3978,
          23.8759
        ]
      },
      {
        "name": "Mohammadpur",
        "banglaName": "মোহাম্মদপুর",
        "aliases": [
          "mohammadpur",
          "মোহাম্মদপুর"
        ],
        "coordinates": [
          90.3584,
          23.7658
        ]
      },
      {
        "name": "Gulshan",
        "banglaName": "গুলশান",
        "aliases": [
          "gulshan",
          "গুলশান"
        ],
        "coordinates": [
          90.4152,
          23.7925
        ]
      },
      {
        "name": "Banani",
        "banglaName": "বনানী",
        "aliases": [
          "banani",
          "বনানী"
        ],
        "coordinates": [
          90.4043,
          23.7937
        ]
      },
      {
        "name": "Baridhara",
        "banglaName": "বারিধারা",
        "aliases": [
          "baridhara",
          "বারিধারা"
        ],
        "coordinates": [
          90.42,
          23.8
        ]
      },
      {
        "name": "Bashundhara",
        "banglaName": "বসুন্ধরা",
        "aliases": [
          "bashundhara",
          "বসুন্ধরা"
        ],
        "coordinates": [
          90.4326,
          23.8164
        ]
      },
      {
        "name": "Badda",
        "banglaName": "বাড্ডা",
        "aliases": [
          "badda",
          "বাড্ডা"
        ],
        "coordinates": [
          90.4267,
          23.7806
        ]
      },
      {
        "name": "Farmgate",
        "banglaName": "ফার্মগেট",
        "aliases": [
          "farmgate",
          "ফার্মগেট"
        ],
        "coordinates": [
          90.3888,
          23.757
        ]
      },
      {
        "name": "Motijheel",
        "banglaName": "মতিঝিল",
        "aliases": [
          "motijheel",
          "মতিঝিল"
        ],
        "coordinates": [
          90.4172,
          23.733
        ]
      },
      {
        "name": "Old Dhaka",
        "banglaName": "পুরান ঢাকা",
        "aliases": [
          "old dhaka",
          "পুরান ঢাকা"
        ],
        "coordinates": [
          90.4,
          23.715
        ]
      },
      {
        "name": "Malibagh",
        "banglaName": "মালিবাগ",
        "aliases": [
          "malibagh",
          "মালিবাগ"
        ],
        "coordinates": [
          90.4116,
          23.7441
        ]
      },
      {
        "name": "Rampura",
        "banglaName": "রামপুরা",
        "aliases": [
          "rampura",
          "রামপুরা"
        ],
        "coordinates": [
          90.4208,
          23.7612
        ]
      },
      {
        "name": "Khilgaon",
        "banglaName": "খিলগাঁও",
        "aliases": [
          "khilgaon",
          "খিলগাঁও"
        ],
        "coordinates": [
          90.4227,
          23.7505
        ]
      },
      {
        "name": "Jatrabari",
        "banglaName": "যাত্রাবাড়ী",
        "aliases": [
          "jatrabari",
          "যাত্রাবাড়ী"
        ],
        "coordinates": [
          90.4349,
          23.7104
        ]
      }
    ]
  },
  {
    "name": "Dinajpur",
    "banglaName": "দিনাজপুর",
    "aliases": [
      "dinajpur",
      "দিনাজপুর",
      "balubari",
      "বালুবাড়ী",
      "nimtola",
      "নিমতলা",
      "hstu",
      "হাবিপ্রবি"
    ],
    "coordinates": [
      88.6367,
      25.6279
    ],
    "subAreas": [
      {
        "name": "Balubari",
        "banglaName": "বালুবাড়ী",
        "aliases": [
          "balubari",
          "বালুবাড়ী",
          "বালুবাড়ি"
        ],
        "coordinates": [
          88.639,
          25.626
        ]
      },
      {
        "name": "Nimtola",
        "banglaName": "নিমতলা",
        "aliases": [
          "nimtola",
          "নিমতলা মোড়"
        ],
        "coordinates": [
          88.635,
          25.629
        ]
      },
      {
        "name": "Ghashipara",
        "banglaName": "ঘাসিপাড়া",
        "aliases": [
          "ghashipara",
          "ঘাসিপাড়া",
          "ঘাসিপাড়া"
        ],
        "coordinates": [
          88.631,
          25.632
        ]
      },
      {
        "name": "Munshipara",
        "banglaName": "মুন্সিপাড়া",
        "aliases": [
          "munshipara",
          "মুন্সিপাড়া",
          "মুন্সীপাড়া"
        ],
        "coordinates": [
          88.637,
          25.63
        ]
      },
      {
        "name": "Suihari",
        "banglaName": "সুইহারী",
        "aliases": [
          "suihari",
          "সুইহারী",
          "সুইহারি"
        ],
        "coordinates": [
          88.648,
          25.641
        ]
      },
      {
        "name": "Paharpur",
        "banglaName": "পাহাড়পুর",
        "aliases": [
          "paharpur",
          "পাহাড়পুর"
        ],
        "coordinates": [
          88.633,
          25.625
        ]
      },
      {
        "name": "Pulhat",
        "banglaName": "পুলহাট",
        "aliases": [
          "pulhat",
          "পুলহাট বাজার"
        ],
        "coordinates": [
          88.625,
          25.608
        ]
      },
      {
        "name": "Modern Mour",
        "banglaName": "মডার্ন মোড়",
        "aliases": [
          "modern mour",
          "মডার্ন মোড়"
        ],
        "coordinates": [
          88.643,
          25.638
        ]
      },
      {
        "name": "Medical Mour",
        "banglaName": "মেডিকেল মোড়",
        "aliases": [
          "medical mour",
          "দিনাজপুর মেডিকেল মোড়"
        ],
        "coordinates": [
          88.645,
          25.615
        ]
      },
      {
        "name": "Kalitola",
        "banglaName": "কালীতলা",
        "aliases": [
          "kalitola",
          "কালীতলা মোড়"
        ],
        "coordinates": [
          88.634,
          25.635
        ]
      },
      {
        "name": "Ramnagar",
        "banglaName": "রামনগর",
        "aliases": [
          "ramnagar",
          "রামনগর দিনাজপুর"
        ],
        "coordinates": [
          88.628,
          25.637
        ]
      },
      {
        "name": "HSTU Area",
        "banglaName": "হাবিপ্রবি এলাকা",
        "aliases": [
          "hstu",
          "হাবিপ্রবি",
          "বাশেরহাট",
          "বাসেরহাট"
        ],
        "coordinates": [
          88.653,
          25.658
        ]
      },
      {
        "name": "Station Road",
        "banglaName": "স্টেশন রোড",
        "aliases": [
          "station road",
          "রেলওয়ে স্টেশন দিনাজপুর"
        ],
        "coordinates": [
          88.642,
          25.627
        ]
      }
    ]
  },
  {
    "name": "Thakurgaon",
    "banglaName": "ঠাকুরগাঁও",
    "aliases": [
      "thakurgaon",
      "ঠাকুরগাঁও",
      "kalibari thakurgaon",
      "কালীবাড়ি"
    ],
    "coordinates": [
      88.4608,
      26.0336
    ],
    "subAreas": [
      {
        "name": "Kalibari",
        "banglaName": "কালীবাড়ি",
        "aliases": [
          "kalibari",
          "কালীবাড়ি মোড়",
          "কালীবাড়ি"
        ],
        "coordinates": [
          88.465,
          26.035
        ]
      },
      {
        "name": "Old Bus Stand",
        "banglaName": "পুরাতন বাসস্ট্যান্ড",
        "aliases": [
          "old bus stand",
          "পুরাতন বাসস্ট্যান্ড ঠাকুরগাঁও"
        ],
        "coordinates": [
          88.461,
          26.031
        ]
      },
      {
        "name": "Hazipara",
        "banglaName": "হাজীপাড়া",
        "aliases": [
          "hazipara",
          "হাজীপাড়া",
          "হাজী পাড়া"
        ],
        "coordinates": [
          88.455,
          26.038
        ]
      },
      {
        "name": "College Road",
        "banglaName": "কলেজ রোড",
        "aliases": [
          "college road",
          "ঠাকুরগাঁও সরকারি কলেজ এলাকা"
        ],
        "coordinates": [
          88.468,
          26.042
        ]
      },
      {
        "name": "Gobindanagar",
        "banglaName": "গোবিন্দনগর",
        "aliases": [
          "gobindanagar",
          "গোবিন্দনগর"
        ],
        "coordinates": [
          88.472,
          26.029
        ]
      },
      {
        "name": "Sarkarpara",
        "banglaName": "সরকারপাড়া",
        "aliases": [
          "sarkarpara",
          "সরকারপাড়া ঠাকুরগাঁও"
        ],
        "coordinates": [
          88.458,
          26.034
        ]
      },
      {
        "name": "Nischintapur",
        "banglaName": "নিশ্চিন্তপুর",
        "aliases": [
          "nischintapur",
          "নিশ্চিন্তপুর"
        ],
        "coordinates": [
          88.452,
          26.028
        ]
      },
      {
        "name": "Chourasta",
        "banglaName": "চৌরাস্তা",
        "aliases": [
          "chourasta",
          "ঠাকুরগাঁও চৌরাস্তা মোড়"
        ],
        "coordinates": [
          88.463,
          26.033
        ]
      },
      {
        "name": "Shibganj",
        "banglaName": "শিবগঞ্জ",
        "aliases": [
          "shibganj",
          "শিবগঞ্জ ঠাকুরগাঁও"
        ],
        "coordinates": [
          88.441,
          26.022
        ]
      }
    ]
  },
  {
    "name": "Panchagarh",
    "banglaName": "পঞ্চগড়",
    "aliases": [
      "panchagarh",
      "পঞ্চগড়",
      "পঞ্চগড়"
    ],
    "coordinates": [
      88.5562,
      26.3411
    ],
    "subAreas": [
      {
        "name": "Chowrangi Mour",
        "banglaName": "চৌরঙ্গী মোড়",
        "aliases": [
          "chowrangi",
          "চৌরঙ্গী মোড় পঞ্চগড়"
        ],
        "coordinates": [
          88.557,
          26.342
        ]
      },
      {
        "name": "Dokropara",
        "banglaName": "ডোকরোপাড়া",
        "aliases": [
          "dokropara",
          "ডোকরোপাড়া"
        ],
        "coordinates": [
          88.562,
          26.338
        ]
      },
      {
        "name": "College Road",
        "banglaName": "কলেজ রোড",
        "aliases": [
          "college road",
          "মকবুলার রহমান কলেজ"
        ],
        "coordinates": [
          88.552,
          26.345
        ]
      },
      {
        "name": "Railgate",
        "banglaName": "রেলগেট",
        "aliases": [
          "railgate",
          "পঞ্চগড় রেলগেট"
        ],
        "coordinates": [
          88.559,
          26.335
        ]
      },
      {
        "name": "Bus Stand",
        "banglaName": "বাসস্ট্যান্ড",
        "aliases": [
          "bus stand",
          "কেন্দ্রীয় বাস টার্মিনাল"
        ],
        "coordinates": [
          88.565,
          26.348
        ]
      }
    ]
  },
  {
    "name": "Nilphamari",
    "banglaName": "নীলফামারী",
    "aliases": [
      "nilphamari",
      "নীলফামারী",
      "saidpur",
      "সৈয়দপুর"
    ],
    "coordinates": [
      88.8447,
      25.9318
    ],
    "subAreas": [
      {
        "name": "Chourangi Mour",
        "banglaName": "চৌরঙ্গী মোড়",
        "aliases": [
          "chourangi",
          "চৌরঙ্গী মোড় নীলফামারী"
        ],
        "coordinates": [
          88.845,
          25.932
        ]
      },
      {
        "name": "Kalibari",
        "banglaName": "কালীবাড়ি",
        "aliases": [
          "kalibari",
          "কালীবাড়ি মোড় নীলফামারী"
        ],
        "coordinates": [
          88.841,
          25.935
        ]
      },
      {
        "name": "College Mour",
        "banglaName": "কলেজ মোড়",
        "aliases": [
          "college mour",
          "নীলফামারী সরকারি কলেজ"
        ],
        "coordinates": [
          88.849,
          25.928
        ]
      },
      {
        "name": "Notun Bazar",
        "banglaName": "নতুন বাজার",
        "aliases": [
          "notun bazar",
          "নতুন বাজার নীলফামারী"
        ],
        "coordinates": [
          88.843,
          25.938
        ]
      },
      {
        "name": "Saidpur Town",
        "banglaName": "সৈয়দপুর শহর",
        "aliases": [
          "saidpur",
          "সৈয়দপুর",
          "সৈয়দপুর রেলগেট",
          "ক্যান্টনমেন্ট"
        ],
        "coordinates": [
          88.8917,
          25.7778
        ]
      }
    ]
  },
  {
    "name": "Kurigram",
    "banglaName": "কুড়িগ্রাম",
    "aliases": [
      "kurigram",
      "কুড়িগ্রাম",
      "কুড়িগ্রাম"
    ],
    "coordinates": [
      89.6369,
      25.8073
    ],
    "subAreas": [
      {
        "name": "Shapla Chottor",
        "banglaName": "শাপলা চত্বর",
        "aliases": [
          "shapla chottor",
          "শাপলা চত্বর কুড়িগ্রাম"
        ],
        "coordinates": [
          89.637,
          25.808
        ]
      },
      {
        "name": "Ghoshpara",
        "banglaName": "ঘোষপাড়া",
        "aliases": [
          "ghoshpara",
          "ঘোষপাড়া কুড়িগ্রাম"
        ],
        "coordinates": [
          89.632,
          25.805
        ]
      },
      {
        "name": "College Mour",
        "banglaName": "কলেজ মোড়",
        "aliases": [
          "college mour",
          "কুড়িগ্রাম কলেজ মোড়"
        ],
        "coordinates": [
          89.641,
          25.812
        ]
      },
      {
        "name": "Trimohoni",
        "banglaName": "ত্রিমোহনী",
        "aliases": [
          "trimohoni",
          "ত্রিমোহনী বাজার"
        ],
        "coordinates": [
          89.625,
          25.801
        ]
      },
      {
        "name": "Khalilganj",
        "banglaName": "খলিলগঞ্জ",
        "aliases": [
          "khalilganj",
          "খলিলগঞ্জ বাজার"
        ],
        "coordinates": [
          89.645,
          25.819
        ]
      }
    ]
  },
  {
    "name": "Lalmonirhat",
    "banglaName": "লালমনিরহাট",
    "aliases": [
      "lalmonirhat",
      "লালমনিরহাট"
    ],
    "coordinates": [
      89.4484,
      25.9165
    ],
    "subAreas": [
      {
        "name": "Mission Mour",
        "banglaName": "মিশন মোড়",
        "aliases": [
          "mission mour",
          "মিশন মোড় লালমনিরহাট"
        ],
        "coordinates": [
          89.449,
          25.917
        ]
      },
      {
        "name": "Thana Road",
        "banglaName": "থানা রোড",
        "aliases": [
          "thana road",
          "থানা রোড লালমনিরহাট"
        ],
        "coordinates": [
          89.445,
          25.915
        ]
      },
      {
        "name": "BDR Hat",
        "banglaName": "বিডিআর হাট",
        "aliases": [
          "bdr hat",
          "বিডিআর হাট"
        ],
        "coordinates": [
          89.452,
          25.922
        ]
      },
      {
        "name": "Station Road",
        "banglaName": "রেলওয়ে স্টেশন",
        "aliases": [
          "station road",
          "লালমনিরহাট রেলওয়ে স্টেশন"
        ],
        "coordinates": [
          89.442,
          25.912
        ]
      }
    ]
  },
  {
    "name": "Gaibandha",
    "banglaName": "গাইবান্ধা",
    "aliases": [
      "gaibandha",
      "গাইবান্ধা"
    ],
    "coordinates": [
      89.5414,
      25.3288
    ],
    "subAreas": [
      {
        "name": "Circular Road",
        "banglaName": "সার্কুলার রোড",
        "aliases": [
          "circular road",
          "সার্কুলার রোড গাইবান্ধা"
        ],
        "coordinates": [
          89.542,
          25.329
        ]
      },
      {
        "name": "Station Road",
        "banglaName": "স্টেশন রোড",
        "aliases": [
          "station road",
          "রেলওয়ে স্টেশন গাইবান্ধা"
        ],
        "coordinates": [
          89.538,
          25.326
        ]
      },
      {
        "name": "Masterpara",
        "banglaName": "মাস্টারপাড়া",
        "aliases": [
          "masterpara",
          "মাস্টারপাড়া"
        ],
        "coordinates": [
          89.545,
          25.332
        ]
      },
      {
        "name": "DB Road",
        "banglaName": "ডিবি রোড",
        "aliases": [
          "db road",
          "আসাদুজ্জামান মার্কেট সংলগ্ন"
        ],
        "coordinates": [
          89.54,
          25.331
        ]
      }
    ]
  },
  {
    "name": "Bogra",
    "banglaName": "বগুড়া",
    "aliases": [
      "bogra",
      "bogura",
      "বগুড়া",
      "বগুড়া",
      "saatmatha",
      "সাতমাথা",
      "jaleshwaritola",
      "জলেশ্বরীতলা"
    ],
    "coordinates": [
      89.373,
      24.8465
    ],
    "subAreas": [
      {
        "name": "Saatmatha",
        "banglaName": "সাতমাথা",
        "aliases": [
          "saatmatha",
          "সাতমাথা জিরো পয়েন্ট",
          "বীরশ্রেষ্ঠ স্কয়ার"
        ],
        "coordinates": [
          89.373,
          24.8465
        ]
      },
      {
        "name": "Jaleshwaritola",
        "banglaName": "জলেশ্বরীতলা",
        "aliases": [
          "jaleshwaritola",
          "জলেশ্বরীতলা",
          "কালীতলা সংলগ্ন"
        ],
        "coordinates": [
          89.376,
          24.851
        ]
      },
      {
        "name": "Thanthania",
        "banglaName": "ঠনঠনিয়া",
        "aliases": [
          "thanthania",
          "ঠনঠনিয়া বাসস্ট্যান্ড"
        ],
        "coordinates": [
          89.368,
          24.839
        ]
      },
      {
        "name": "Charmatha",
        "banglaName": "চারমাথা",
        "aliases": [
          "charmatha",
          "চারমাথা কেন্দ্রীয় বাস টার্মিনাল"
        ],
        "coordinates": [
          89.352,
          24.853
        ]
      },
      {
        "name": "Maltinagar",
        "banglaName": "মালতিনগর",
        "aliases": [
          "maltinagar",
          "মালতিনগর বগুড়া"
        ],
        "coordinates": [
          89.366,
          24.833
        ]
      },
      {
        "name": "Fulbari",
        "banglaName": "ফুলবাড়ি",
        "aliases": [
          "fulbari",
          "ফুলবাড়ি বগুড়া"
        ],
        "coordinates": [
          89.379,
          24.862
        ]
      },
      {
        "name": "Bogra Banani",
        "banglaName": "বনানী মোড়",
        "aliases": [
          "banani bogra",
          "বনানী বগুড়া"
        ],
        "coordinates": [
          89.362,
          24.815
        ]
      }
    ]
  },
  {
    "name": "Pabna",
    "banglaName": "পাবনা",
    "aliases": [
      "pabna",
      "পাবনা",
      "edward college",
      "এডওয়ার্ড কলেজ"
    ],
    "coordinates": [
      89.2331,
      24.0129
    ],
    "subAreas": [
      {
        "name": "Abdul Hamid Road",
        "banglaName": "আব্দুল হামিদ রোড",
        "aliases": [
          "abdul hamid road",
          "ট্রাফিক মোড় পাবনা"
        ],
        "coordinates": [
          89.234,
          24.013
        ]
      },
      {
        "name": "Gopalpur",
        "banglaName": "গোপালপুর",
        "aliases": [
          "gopalpur",
          "গোপালপুর পাবনা"
        ],
        "coordinates": [
          89.238,
          24.016
        ]
      },
      {
        "name": "Radhanagar",
        "banglaName": "রাধানগর",
        "aliases": [
          "radhanagar",
          "এডওয়ার্ড কলেজ সংলগ্ন"
        ],
        "coordinates": [
          89.245,
          24.009
        ]
      },
      {
        "name": "Shalgaria",
        "banglaName": "শালগাড়ীয়া",
        "aliases": [
          "shalgaria",
          "শালগাড়িয়া"
        ],
        "coordinates": [
          89.227,
          24.019
        ]
      },
      {
        "name": "Bus Terminal",
        "banglaName": "বাস টার্মিনাল",
        "aliases": [
          "bus terminal",
          "পাবনা কেন্দ্রীয় বাস টার্মিনাল"
        ],
        "coordinates": [
          89.219,
          24.024
        ]
      }
    ]
  },
  {
    "name": "Sirajganj",
    "banglaName": "সিরাজগঞ্জ",
    "aliases": [
      "sirajganj",
      "সিরাজগঞ্জ"
    ],
    "coordinates": [
      89.716,
      24.4534
    ],
    "subAreas": [
      {
        "name": "Bazar Station",
        "banglaName": "বাজার স্টেশন",
        "aliases": [
          "bazar station",
          "বাজার স্টেশন মোড়"
        ],
        "coordinates": [
          89.717,
          24.454
        ]
      },
      {
        "name": "Mujib Sarak",
        "banglaName": "মুজিব সড়ক",
        "aliases": [
          "mujib sarak",
          "মুজিব সড়ক সিরাজগঞ্জ"
        ],
        "coordinates": [
          89.712,
          24.451
        ]
      },
      {
        "name": "Ekdala",
        "banglaName": "একডালা",
        "aliases": [
          "ekdala",
          "একডালা পুনর্নিবাসন"
        ],
        "coordinates": [
          89.722,
          24.462
        ]
      },
      {
        "name": "Masumpur",
        "banglaName": "মাসুমপুর",
        "aliases": [
          "masumpur",
          "মাসুমপুর"
        ],
        "coordinates": [
          89.708,
          24.446
        ]
      }
    ]
  },
  {
    "name": "Naogaon",
    "banglaName": "নওগাঁ",
    "aliases": [
      "naogaon",
      "নওগাঁ"
    ],
    "coordinates": [
      88.9413,
      24.8103
    ],
    "subAreas": [
      {
        "name": "Muktirmor",
        "banglaName": "মুক্তির মোড়",
        "aliases": [
          "muktirmor",
          "মুক্তির মোড় নওগাঁ"
        ],
        "coordinates": [
          88.942,
          24.811
        ]
      },
      {
        "name": "Bridge Mour",
        "banglaName": "ব্রিজের মোড়",
        "aliases": [
          "bridge mour",
          "লিটন ব্রিজ মোড়"
        ],
        "coordinates": [
          88.938,
          24.808
        ]
      },
      {
        "name": "Ukilpara",
        "banglaName": "উকিলপাড়া",
        "aliases": [
          "ukilpara",
          "উকিলপাড়া নওগাঁ"
        ],
        "coordinates": [
          88.945,
          24.814
        ]
      },
      {
        "name": "Par-Naogaon",
        "banglaName": "পার-নওগাঁ",
        "aliases": [
          "par-naogaon",
          "পার নওগাঁ"
        ],
        "coordinates": [
          88.951,
          24.818
        ]
      }
    ]
  },
  {
    "name": "Natore",
    "banglaName": "নাটোর",
    "aliases": [
      "natore",
      "নাটোর"
    ],
    "coordinates": [
      89.0076,
      24.4102
    ],
    "subAreas": [
      {
        "name": "Madrasa Mour",
        "banglaName": "মাদ্রাসা মোড়",
        "aliases": [
          "madrasa mour",
          "মাদ্রাসা মোড় নাটোর"
        ],
        "coordinates": [
          89.008,
          24.411
        ]
      },
      {
        "name": "Kanaikhali",
        "banglaName": "কানাইখালী",
        "aliases": [
          "kanaikhali",
          "কানাইখালী ওল্ড টাউন"
        ],
        "coordinates": [
          89.004,
          24.413
        ]
      },
      {
        "name": "Nichabazar",
        "banglaName": "নিচাবাজার",
        "aliases": [
          "nichabazar",
          "নিচাবাজার নাটোর"
        ],
        "coordinates": [
          89.002,
          24.409
        ]
      },
      {
        "name": "Harishpur",
        "banglaName": "হরিষপুর",
        "aliases": [
          "harishpur",
          "হরিষপুর বাইপাস মোড়"
        ],
        "coordinates": [
          89.018,
          24.402
        ]
      }
    ]
  },
  {
    "name": "Chapai Nawabganj",
    "banglaName": "চাঁপাইনবাবগঞ্জ",
    "aliases": [
      "chapai nawabganj",
      "chapainawabganj",
      "চাঁপাইনবাবগঞ্জ",
      "নবাবগঞ্জ"
    ],
    "coordinates": [
      88.2709,
      24.5965
    ],
    "subAreas": [
      {
        "name": "Shantinagar",
        "banglaName": "শান্তিনগর",
        "aliases": [
          "shantinagar",
          "শান্তিনগর চাঁপাই"
        ],
        "coordinates": [
          88.272,
          24.597
        ]
      },
      {
        "name": "Bat-tala",
        "banglaName": "বটতলা",
        "aliases": [
          "bat-tala",
          "বটতলা মোড়"
        ],
        "coordinates": [
          88.268,
          24.594
        ]
      },
      {
        "name": "College Mour",
        "banglaName": "কলেজ মোড়",
        "aliases": [
          "college mour",
          "নবাবগঞ্জ সরকারি কলেজ"
        ],
        "coordinates": [
          88.275,
          24.601
        ]
      },
      {
        "name": "Boro Indara",
        "banglaName": "বড় ইন্দারা",
        "aliases": [
          "boro indara",
          "বড় ইন্দারা মোড়"
        ],
        "coordinates": [
          88.269,
          24.598
        ]
      }
    ]
  },
  {
    "name": "Joypurhat",
    "banglaName": "জয়পুরহাট",
    "aliases": [
      "joypurhat",
      "জয়পুরহাট",
      "জয়পুরহাট"
    ],
    "coordinates": [
      89.027,
      25.0968
    ],
    "subAreas": [
      {
        "name": "Zero Point",
        "banglaName": "জিরো পয়েন্ট",
        "aliases": [
          "zero point",
          "জিরো পয়েন্ট জয়পুরহাট"
        ],
        "coordinates": [
          89.027,
          25.097
        ]
      },
      {
        "name": "Thana Mour",
        "banglaName": "থানা মোড়",
        "aliases": [
          "thana mour",
          "থানা মোড় জয়পুরহাট"
        ],
        "coordinates": [
          89.024,
          25.094
        ]
      },
      {
        "name": "Sabujnagar",
        "banglaName": "সবুজনগর",
        "aliases": [
          "sabujnagar",
          "সবুজনগর হাউজিং"
        ],
        "coordinates": [
          89.031,
          25.102
        ]
      },
      {
        "name": "Railgate",
        "banglaName": "রেলগেট",
        "aliases": [
          "railgate",
          "জয়পুরহাট রেলগেট"
        ],
        "coordinates": [
          89.025,
          25.099
        ]
      }
    ]
  },
  {
    "name": "Narsingdi",
    "banglaName": "নরসিংদী",
    "aliases": [
      "narsingdi",
      "নরসিংদী",
      "velanagar",
      "ভেলারনগর"
    ],
    "coordinates": [
      90.7176,
      23.9226
    ],
    "subAreas": [
      {
        "name": "Velanagar",
        "banglaName": "ভেলারনগর",
        "aliases": [
          "velanagar",
          "ভেলারনগর বাসস্ট্যান্ড"
        ],
        "coordinates": [
          90.718,
          23.923
        ]
      },
      {
        "name": "Sadar Road",
        "banglaName": "সদর রোড",
        "aliases": [
          "sadar road",
          "নরসিংদী বাজার"
        ],
        "coordinates": [
          90.715,
          23.92
        ]
      },
      {
        "name": "Madhabdi",
        "banglaName": "মাধবদী",
        "aliases": [
          "madhabdi",
          "মাধবদী কাপড়ের বাজার"
        ],
        "coordinates": [
          90.665,
          23.855
        ]
      },
      {
        "name": "Chinishpur",
        "banglaName": "চিনিশপুর",
        "aliases": [
          "chinishpur",
          "চিনিশপুর কালীবাড়ি"
        ],
        "coordinates": [
          90.722,
          23.929
        ]
      }
    ]
  },
  {
    "name": "Tangail",
    "banglaName": "টাঙ্গাইল",
    "aliases": [
      "tangail",
      "টাঙ্গাইল",
      "nirala mour",
      "নিরালা মোড়"
    ],
    "coordinates": [
      89.9167,
      24.25
    ],
    "subAreas": [
      {
        "name": "Nirala Mour",
        "banglaName": "নিরালা মোড়",
        "aliases": [
          "nirala mour",
          "নিরালা মোড় টাঙ্গাইল"
        ],
        "coordinates": [
          89.917,
          24.251
        ]
      },
      {
        "name": "Victoria Road",
        "banglaName": "ভিক্টোরিয়া রোড",
        "aliases": [
          "victoria road",
          "ভিক্টোরিয়া রোড"
        ],
        "coordinates": [
          89.915,
          24.248
        ]
      },
      {
        "name": "Akur Thakur Para",
        "banglaName": "আকুর টাকুর পাড়া",
        "aliases": [
          "akur thakur para",
          "আকুরটাকুর পাড়া"
        ],
        "coordinates": [
          89.921,
          24.256
        ]
      },
      {
        "name": "Biswas Betka",
        "banglaName": "বিশ্বাস বেতকা",
        "aliases": [
          "biswas betka",
          "বিশ্বাস বেতকা"
        ],
        "coordinates": [
          89.925,
          24.244
        ]
      },
      {
        "name": "Sabalia",
        "banglaName": "সাবালিয়া",
        "aliases": [
          "sabalia",
          "সাবালিয়া"
        ],
        "coordinates": [
          89.919,
          24.259
        ]
      }
    ]
  },
  {
    "name": "Kishoreganj",
    "banglaName": "কিশোরগঞ্জ",
    "aliases": [
      "kishoreganj",
      "কিশোরগঞ্জ"
    ],
    "coordinates": [
      90.7829,
      24.4449
    ],
    "subAreas": [
      {
        "name": "Gaital",
        "banglaName": "গাইটাল",
        "aliases": [
          "gaital",
          "গাইটাল বাসস্ট্যান্ড"
        ],
        "coordinates": [
          90.783,
          24.445
        ]
      },
      {
        "name": "Puraton Thana",
        "banglaName": "পুরাতন থানা",
        "aliases": [
          "puraton thana",
          "পুরাতন থানা মোড়"
        ],
        "coordinates": [
          90.779,
          24.441
        ]
      },
      {
        "name": "Kharampotti",
        "banglaName": "খড়মপট্টি",
        "aliases": [
          "kharampotti",
          "খড়মপট্টি"
        ],
        "coordinates": [
          90.781,
          24.446
        ]
      },
      {
        "name": "Gurudayal College Area",
        "banglaName": "গুরুদয়াল কলেজ সংলগ্ন",
        "aliases": [
          "gurudayal",
          "গুরুদয়াল সরকারি কলেজ"
        ],
        "coordinates": [
          90.787,
          24.449
        ]
      }
    ]
  },
  {
    "name": "Manikganj",
    "banglaName": "মানিকগঞ্জ",
    "aliases": [
      "manikganj",
      "মানিকগঞ্জ"
    ],
    "coordinates": [
      90.0053,
      23.8617
    ],
    "subAreas": [
      {
        "name": "Khalpar",
        "banglaName": "খালপাড়",
        "aliases": [
          "khalpar",
          "খালপাড় মানিকগঞ্জ"
        ],
        "coordinates": [
          90.006,
          23.862
        ]
      },
      {
        "name": "Bus Stand",
        "banglaName": "বাসস্ট্যান্ড",
        "aliases": [
          "bus stand",
          "মানিকগঞ্জ কেন্দ্রীয় বাসস্ট্যান্ড"
        ],
        "coordinates": [
          90.001,
          23.859
        ]
      },
      {
        "name": "Seota",
        "banglaName": "সেওতা",
        "aliases": [
          "seota",
          "সেওতা হাউজিং"
        ],
        "coordinates": [
          90.009,
          23.867
        ]
      },
      {
        "name": "Beutha",
        "banglaName": "বেউথা",
        "aliases": [
          "beutha",
          "বেউথা ঘাট"
        ],
        "coordinates": [
          90.015,
          23.855
        ]
      }
    ]
  },
  {
    "name": "Munshiganj",
    "banglaName": "মুন্সিগঞ্জ",
    "aliases": [
      "munshiganj",
      "মুন্সিগঞ্জ",
      "মুন্সীগঞ্জ",
      "mirkadim",
      "মিরকাদিম"
    ],
    "coordinates": [
      90.5305,
      23.5422
    ],
    "subAreas": [
      {
        "name": "Sipahipara",
        "banglaName": "সিপাহীপাড়া",
        "aliases": [
          "sipahipara",
          "সিপাহীপাড়া মোড়"
        ],
        "coordinates": [
          90.521,
          23.541
        ]
      },
      {
        "name": "Supermarket",
        "banglaName": "সুপারমার্কেট",
        "aliases": [
          "supermarket",
          "মুন্সিগঞ্জ সুপারমার্কেট মোড়"
        ],
        "coordinates": [
          90.531,
          23.543
        ]
      },
      {
        "name": "Mirkadim",
        "banglaName": "মিরকাদিম",
        "aliases": [
          "mirkadim",
          "মিরকাদিম পৌরসভা"
        ],
        "coordinates": [
          90.505,
          23.561
        ]
      },
      {
        "name": "Launch Ghat",
        "banglaName": "লঞ্চ ঘাট",
        "aliases": [
          "launch ghat",
          "মুন্সিগঞ্জ লঞ্চ টার্মিনাল"
        ],
        "coordinates": [
          90.535,
          23.545
        ]
      }
    ]
  },
  {
    "name": "Faridpur",
    "banglaName": "ফরিদপুর",
    "aliases": [
      "faridpur",
      "ফরিদপুর",
      "goalchamot",
      "গোয়ালচামট"
    ],
    "coordinates": [
      89.843,
      23.6071
    ],
    "subAreas": [
      {
        "name": "Mujib Sarak",
        "banglaName": "মুজিব সড়ক",
        "aliases": [
          "mujib sarak",
          "মুজিব সড়ক ফরিদপুর"
        ],
        "coordinates": [
          89.843,
          23.608
        ]
      },
      {
        "name": "Goalchamot",
        "banglaName": "গোয়ালচামট",
        "aliases": [
          "goalchamot",
          "গোয়ালচামট বাসস্ট্যান্ড"
        ],
        "coordinates": [
          89.839,
          23.612
        ]
      },
      {
        "name": "Alipur",
        "banglaName": "আলীপুর",
        "aliases": [
          "alipur",
          "আলীপুর ব্রিজ মোড়"
        ],
        "coordinates": [
          89.847,
          23.604
        ]
      },
      {
        "name": "Jhiltuli",
        "banglaName": "ঝিলটুলী",
        "aliases": [
          "jhiltuli",
          "ঝিলটুলী আবাসিক"
        ],
        "coordinates": [
          89.845,
          23.606
        ]
      }
    ]
  },
  {
    "name": "Gopalganj",
    "banglaName": "গোপালগঞ্জ",
    "aliases": [
      "gopalganj",
      "গোপালগঞ্জ"
    ],
    "coordinates": [
      89.8277,
      23.0051
    ],
    "subAreas": [
      {
        "name": "Post Office Road",
        "banglaName": "পোস্ট অফিস রোড",
        "aliases": [
          "post office road",
          "পোস্ট অফিস মোড় গোপালগঞ্জ"
        ],
        "coordinates": [
          89.828,
          23.006
        ]
      },
      {
        "name": "Bedgram",
        "banglaName": "বেদগ্রাম",
        "aliases": [
          "bedgram",
          "বেদগ্রাম বাসস্ট্যান্ড"
        ],
        "coordinates": [
          89.821,
          23.011
        ]
      },
      {
        "name": "Launch Ghat",
        "banglaName": "লঞ্চ ঘাট",
        "aliases": [
          "launch ghat",
          "গোপালগঞ্জ ঘাট"
        ],
        "coordinates": [
          89.831,
          23.002
        ]
      }
    ]
  },
  {
    "name": "Madaripur",
    "banglaName": "মাদারীপুর",
    "aliases": [
      "madaripur",
      "মাদারীপুর"
    ],
    "coordinates": [
      90.187,
      23.1641
    ],
    "subAreas": [
      {
        "name": "Puran Bazar",
        "banglaName": "পুরান বাজার",
        "aliases": [
          "puran bazar",
          "মাদারীপুর পুরান বাজার"
        ],
        "coordinates": [
          90.188,
          23.165
        ]
      },
      {
        "name": "Shakuni",
        "banglaName": "শকুনি",
        "aliases": [
          "shakuni",
          "শকুনি লেক এলাকা"
        ],
        "coordinates": [
          90.184,
          23.162
        ]
      },
      {
        "name": "Mostafapur",
        "banglaName": "মোস্তফাপুর",
        "aliases": [
          "mostafapur",
          "মোস্তফাপুর বাসস্ট্যান্ড"
        ],
        "coordinates": [
          90.155,
          23.151
        ]
      }
    ]
  },
  {
    "name": "Rajbari",
    "banglaName": "রাজবাড়ী",
    "aliases": [
      "rajbari",
      "রাজবাড়ী",
      "রাজবাড়ি"
    ],
    "coordinates": [
      89.6445,
      23.7574
    ],
    "subAreas": [
      {
        "name": "Railgate",
        "banglaName": "রেলগেট",
        "aliases": [
          "railgate",
          "রাজবাড়ী রেলগেট"
        ],
        "coordinates": [
          89.645,
          23.758
        ]
      },
      {
        "name": "Boro Pul",
        "banglaName": "বড় পুল",
        "aliases": [
          "boro pul",
          "বড় পুল মোড় রাজবাড়ী"
        ],
        "coordinates": [
          89.641,
          23.754
        ]
      },
      {
        "name": "Goalanda",
        "banglaName": "গোয়ালন্দ",
        "aliases": [
          "goalanda",
          "গোয়ালন্দ ঘাট"
        ],
        "coordinates": [
          89.755,
          23.738
        ]
      }
    ]
  },
  {
    "name": "Shariatpur",
    "banglaName": "শরীয়তপুর",
    "aliases": [
      "shariatpur",
      "শরীয়তপুর",
      "শরিয়তপুর"
    ],
    "coordinates": [
      90.3547,
      23.2423
    ],
    "subAreas": [
      {
        "name": "Palong",
        "banglaName": "পালং",
        "aliases": [
          "palong",
          "পালং বাজার মোড়"
        ],
        "coordinates": [
          90.355,
          23.243
        ]
      },
      {
        "name": "Dhanuka",
        "banglaName": "ধানুকা",
        "aliases": [
          "dhanuka",
          "ধানুকা মনসা বাড়ি"
        ],
        "coordinates": [
          90.351,
          23.239
        ]
      },
      {
        "name": "Chourangi",
        "banglaName": "চৌরঙ্গী",
        "aliases": [
          "chourangi",
          "শরীয়তপুর চৌরঙ্গী মোড়"
        ],
        "coordinates": [
          90.358,
          23.246
        ]
      }
    ]
  },
  {
    "name": "Jamalpur",
    "banglaName": "জামালপুর",
    "aliases": [
      "jamalpur",
      "জামালপুর"
    ],
    "coordinates": [
      89.9378,
      24.9375
    ],
    "subAreas": [
      {
        "name": "Station Road",
        "banglaName": "স্টেশন রোড",
        "aliases": [
          "station road",
          "জামালপুর রেলওয়ে স্টেশন"
        ],
        "coordinates": [
          89.938,
          24.938
        ]
      },
      {
        "name": "Boro Masjid Mour",
        "banglaName": "বড় মসজিদ মোড়",
        "aliases": [
          "boro masjid",
          "বড় মসজিদ মোড় জামালপুর"
        ],
        "coordinates": [
          89.934,
          24.935
        ]
      },
      {
        "name": "Doyamoyee Mour",
        "banglaName": "দয়াময়ী মোড়",
        "aliases": [
          "doyamoyee",
          "দয়াময়ী মোড়"
        ],
        "coordinates": [
          89.939,
          24.941
        ]
      },
      {
        "name": "Gatepar",
        "banglaName": "গেটপাড়",
        "aliases": [
          "gatepar",
          "গেটপাড় জামালপুর"
        ],
        "coordinates": [
          89.942,
          24.945
        ]
      }
    ]
  },
  {
    "name": "Netrokona",
    "banglaName": "নেত্রকোণা",
    "aliases": [
      "netrokona",
      "নেত্রকোণা",
      "নেত্রকোনা"
    ],
    "coordinates": [
      90.7279,
      24.8709
    ],
    "subAreas": [
      {
        "name": "Choto Bazar",
        "banglaName": "ছোট বাজার",
        "aliases": [
          "choto bazar",
          "ছোট বাজার নেত্রকোণা"
        ],
        "coordinates": [
          90.728,
          24.871
        ]
      },
      {
        "name": "Boro Bazar",
        "banglaName": "বড় বাজার",
        "aliases": [
          "boro bazar",
          "বড় বাজার মোড়"
        ],
        "coordinates": [
          90.725,
          24.869
        ]
      },
      {
        "name": "Moktarpara",
        "banglaName": "মোক্তারপাড়া",
        "aliases": [
          "moktarpara",
          "মোক্তারপাড়া মাঠ"
        ],
        "coordinates": [
          90.732,
          24.875
        ]
      },
      {
        "name": "Kurpar",
        "banglaName": "কুরপাড়",
        "aliases": [
          "kurpar",
          "কুরপাড় বাসস্ট্যান্ড"
        ],
        "coordinates": [
          90.738,
          24.881
        ]
      }
    ]
  },
  {
    "name": "Sherpur",
    "banglaName": "শেরপুর",
    "aliases": [
      "sherpur",
      "শেরপুর"
    ],
    "coordinates": [
      90.0175,
      25.0205
    ],
    "subAreas": [
      {
        "name": "Thana Mour",
        "banglaName": "থানা মোড়",
        "aliases": [
          "thana mour",
          "থানা মোড় শেরপুর"
        ],
        "coordinates": [
          90.018,
          25.021
        ]
      },
      {
        "name": "Raghunath Bazar",
        "banglaName": "রঘুনাথ বাজার",
        "aliases": [
          "raghunath bazar",
          "রঘুনাথ বাজার"
        ],
        "coordinates": [
          90.015,
          25.018
        ]
      },
      {
        "name": "Nayanbazar",
        "banglaName": "নয়নবাজার",
        "aliases": [
          "nayanbazar",
          "নয়নবাজার মোড়"
        ],
        "coordinates": [
          90.021,
          25.025
        ]
      },
      {
        "name": "Nababerbag",
        "banglaName": "নবাবেরবাগ",
        "aliases": [
          "nababerbag",
          "নবাবেরবাগ"
        ],
        "coordinates": [
          90.012,
          25.015
        ]
      }
    ]
  },
  {
    "name": "Coxs Bazar",
    "banglaName": "কক্সবাজার",
    "aliases": [
      "coxs bazar",
      "cox's bazar",
      "coxsbazar",
      "কক্সবাজার",
      "kolatoli",
      "কলাতলী",
      "laboni point",
      "সুগন্ধা"
    ],
    "coordinates": [
      91.9804,
      21.4272
    ],
    "subAreas": [
      {
        "name": "Kolatoli",
        "banglaName": "কলাতলী",
        "aliases": [
          "kolatoli",
          "কলাতলী মোড়",
          "কলাতলী বিচ"
        ],
        "coordinates": [
          91.984,
          21.417
        ]
      },
      {
        "name": "Laboni Point",
        "banglaName": "লাবনী পয়েন্ট",
        "aliases": [
          "laboni",
          "লাবনী বিচ মোড়"
        ],
        "coordinates": [
          91.975,
          21.431
        ]
      },
      {
        "name": "Sugandha Point",
        "banglaName": "সুগন্ধা পয়েন্ট",
        "aliases": [
          "sugandha",
          "সুগন্ধা মোড়"
        ],
        "coordinates": [
          91.979,
          21.425
        ]
      },
      {
        "name": "Jhawtola",
        "banglaName": "ঝাউতলা",
        "aliases": [
          "jhawtola",
          "ঝাউতলা প্রধান সড়ক"
        ],
        "coordinates": [
          91.981,
          21.435
        ]
      },
      {
        "name": "Link Road",
        "banglaName": "লিংক রোড",
        "aliases": [
          "link road",
          "কক্সবাজার লিংক রোড"
        ],
        "coordinates": [
          92.015,
          21.43
        ]
      }
    ]
  },
  {
    "name": "Brahmanbaria",
    "banglaName": "ব্রাহ্মণবাড়িয়া",
    "aliases": [
      "brahmanbaria",
      "ব্রাহ্মণবাড়িয়া",
      "বিবাড়িয়া"
    ],
    "coordinates": [
      91.1115,
      23.9571
    ],
    "subAreas": [
      {
        "name": "Kautoli",
        "banglaName": "কাউতলী",
        "aliases": [
          "kautoli",
          "কাউতলী মোড় ব্রাহ্মণবাড়িয়া"
        ],
        "coordinates": [
          91.112,
          23.958
        ]
      },
      {
        "name": "Medda",
        "banglaName": "মেড্ডা",
        "aliases": [
          "medda",
          "মেড্ডা বাসস্ট্যান্ড"
        ],
        "coordinates": [
          91.118,
          23.965
        ]
      },
      {
        "name": "TA Road",
        "banglaName": "টি এ রোড",
        "aliases": [
          "ta road",
          "টিএ রোড সদর"
        ],
        "coordinates": [
          91.108,
          23.952
        ]
      },
      {
        "name": "Ghatura",
        "banglaName": "ঘাটুরা",
        "aliases": [
          "ghatura",
          "মেডিকেল কলেজ সংলগ্ন"
        ],
        "coordinates": [
          91.125,
          23.971
        ]
      }
    ]
  },
  {
    "name": "Chandpur",
    "banglaName": "চাঁদপুর",
    "aliases": [
      "chandpur",
      "চাঁদপুর",
      "ইলিশের বাড়ি"
    ],
    "coordinates": [
      90.6631,
      23.2333
    ],
    "subAreas": [
      {
        "name": "Natun Bazar",
        "banglaName": "নতুন বাজার",
        "aliases": [
          "natun bazar",
          "নতুন বাজার চাঁদপুর"
        ],
        "coordinates": [
          90.664,
          23.234
        ]
      },
      {
        "name": "Puran Bazar",
        "banglaName": "পুরান বাজার",
        "aliases": [
          "puran bazar",
          "পুরান বাজার ঘাট"
        ],
        "coordinates": [
          90.658,
          23.228
        ]
      },
      {
        "name": "Boro Station",
        "banglaName": "বড় স্টেশন",
        "aliases": [
          "boro station",
          "মোলহেড ত্রিনদী মোহনা"
        ],
        "coordinates": [
          90.652,
          23.239
        ]
      },
      {
        "name": "Mission Road",
        "banglaName": "মিশন রোড",
        "aliases": [
          "mission road",
          "মিশন রোড চাঁদপুর"
        ],
        "coordinates": [
          90.668,
          23.238
        ]
      }
    ]
  },
  {
    "name": "Noakhali",
    "banglaName": "নোয়াখালী",
    "aliases": [
      "noakhali",
      "নোয়াখালী",
      "maijdee",
      "মাইজদী",
      "chaumuhani",
      "চৌমুহনী"
    ],
    "coordinates": [
      91.0973,
      22.8696
    ],
    "subAreas": [
      {
        "name": "Maijdee Court",
        "banglaName": "মাইজদী কোর্ট",
        "aliases": [
          "maijdee",
          "মাইজদী কোর্ট মোড়",
          "টাউন হল"
        ],
        "coordinates": [
          91.097,
          22.869
        ]
      },
      {
        "name": "Housing Estate",
        "banglaName": "হাউজিং এস্টেট",
        "aliases": [
          "housing estate",
          "মাইজদী হাউজিং"
        ],
        "coordinates": [
          91.104,
          22.875
        ]
      },
      {
        "name": "Chaumuhani",
        "banglaName": "চৌমুহনী",
        "aliases": [
          "chaumuhani",
          "চৌমুহনী বাজার",
          "চৌমুহনী রেলগেট"
        ],
        "coordinates": [
          91.178,
          22.925
        ]
      },
      {
        "name": "Sonapur",
        "banglaName": "সোনাপুর",
        "aliases": [
          "sonapur",
          "সোনাপুর জিরো পয়েন্ট"
        ],
        "coordinates": [
          91.085,
          22.835
        ]
      }
    ]
  },
  {
    "name": "Feni",
    "banglaName": "ফেনী",
    "aliases": [
      "feni",
      "ফেনী",
      "mohipal",
      "মহিপাল"
    ],
    "coordinates": [
      91.3976,
      23.0186
    ],
    "subAreas": [
      {
        "name": "Mohipal",
        "banglaName": "মহিপাল",
        "aliases": [
          "mohipal",
          "মহিপাল ফ্লাইওভার মোড়",
          "মহিপাল বাস টার্মিনাল"
        ],
        "coordinates": [
          91.385,
          23.015
        ]
      },
      {
        "name": "Trunk Road",
        "banglaName": "ট্রাঙ্ক রোড",
        "aliases": [
          "trunk road",
          "ট্রাঙ্ক রোড ফেনী সদর"
        ],
        "coordinates": [
          91.398,
          23.019
        ]
      },
      {
        "name": "Masterpara",
        "banglaName": "মাস্টারপাড়া",
        "aliases": [
          "masterpara",
          "মাস্টারপাড়া ফেনী"
        ],
        "coordinates": [
          91.402,
          23.023
        ]
      },
      {
        "name": "Station Road",
        "banglaName": "স্টেশন রোড",
        "aliases": [
          "station road",
          "ফেনী রেলওয়ে স্টেশন"
        ],
        "coordinates": [
          91.405,
          23.016
        ]
      }
    ]
  },
  {
    "name": "Lakshmipur",
    "banglaName": "লক্ষ্মীপুর",
    "aliases": [
      "lakshmipur",
      "লক্ষ্মীপুর"
    ],
    "coordinates": [
      90.8415,
      22.9425
    ],
    "subAreas": [
      {
        "name": "Jhumur Mour",
        "banglaName": "ঝুমুর মোড়",
        "aliases": [
          "jhumur",
          "ঝুমুর সিনেমা মোড়"
        ],
        "coordinates": [
          90.842,
          22.943
        ]
      },
      {
        "name": "Uttar Temuhani",
        "banglaName": "উত্তর তেমুহনী",
        "aliases": [
          "uttar temuhani",
          "উত্তর তেমুহনী বাজার"
        ],
        "coordinates": [
          90.838,
          22.946
        ]
      },
      {
        "name": "Dokhin Temuhani",
        "banglaName": "দক্ষিণ তেমুহনী",
        "aliases": [
          "dokhin temuhani",
          "দক্ষিণ তেমুহনী মোড়"
        ],
        "coordinates": [
          90.845,
          22.939
        ]
      }
    ]
  },
  {
    "name": "Rangamati",
    "banglaName": "রাঙ্গামাটি",
    "aliases": [
      "rangamati",
      "রাঙ্গামাটি"
    ],
    "coordinates": [
      92.1743,
      22.6533
    ],
    "subAreas": [
      {
        "name": "Banarupa",
        "banglaName": "বনরূপা",
        "aliases": [
          "banarupa",
          "বনরূপা বাজার মোড়"
        ],
        "coordinates": [
          92.175,
          22.654
        ]
      },
      {
        "name": "Tabalchhari",
        "banglaName": "তবলছড়ি",
        "aliases": [
          "tabalchhari",
          "তবলছড়ি বাজার"
        ],
        "coordinates": [
          92.181,
          22.648
        ]
      },
      {
        "name": "Reserve Bazar",
        "banglaName": "রিজার্ভ বাজার",
        "aliases": [
          "reserve bazar",
          "লঞ্চ ঘাট রিজার্ভ বাজার"
        ],
        "coordinates": [
          92.185,
          22.661
        ]
      },
      {
        "name": "Vedvedy",
        "banglaName": "ভেদভেদী",
        "aliases": [
          "vedvedy",
          "ভেদভেদী বাসস্ট্যান্ড"
        ],
        "coordinates": [
          92.165,
          22.659
        ]
      }
    ]
  },
  {
    "name": "Bandarban",
    "banglaName": "বান্দরবান",
    "aliases": [
      "bandarban",
      "বান্দরবান"
    ],
    "coordinates": [
      92.2185,
      22.1953
    ],
    "subAreas": [
      {
        "name": "Balaghata",
        "banglaName": "বালাঘাটা",
        "aliases": [
          "balaghata",
          "বালাঘাটা বাজার"
        ],
        "coordinates": [
          92.228,
          22.211
        ]
      },
      {
        "name": "Ujanipara",
        "banglaName": "উজানীপাড়া",
        "aliases": [
          "ujanipara",
          "উজানীপাড়া"
        ],
        "coordinates": [
          92.219,
          22.196
        ]
      },
      {
        "name": "Madhyampara",
        "banglaName": "মধ্যমপাড়া",
        "aliases": [
          "madhyampara",
          "মধ্যমপাড়া ট্রাফিক মোড়"
        ],
        "coordinates": [
          92.217,
          22.194
        ]
      },
      {
        "name": "Meghla Area",
        "banglaName": "মেঘলা পর্যটন এলাকা",
        "aliases": [
          "meghla",
          "মেঘলা"
        ],
        "coordinates": [
          92.205,
          22.182
        ]
      }
    ]
  },
  {
    "name": "Khagrachhari",
    "banglaName": "খাগড়াছড়ি",
    "aliases": [
      "khagrachhari",
      "খাগড়াছড়ি",
      "খাগড়াছড়ি"
    ],
    "coordinates": [
      91.9847,
      23.1119
    ],
    "subAreas": [
      {
        "name": "Shapla Chottor",
        "banglaName": "শাপলা চত্বর",
        "aliases": [
          "shapla chottor",
          "শাপলা চত্বর খাগড়াছড়ি"
        ],
        "coordinates": [
          91.985,
          23.112
        ]
      },
      {
        "name": "Chengi Square",
        "banglaName": "চেঙ্গী স্কয়ার",
        "aliases": [
          "chengi square",
          "চেঙ্গী স্কয়ার মোড়"
        ],
        "coordinates": [
          91.982,
          23.108
        ]
      },
      {
        "name": "Pankhaiapara",
        "banglaName": "পানখাইয়া পাড়া",
        "aliases": [
          "pankhaiapara",
          "পানখাইয়া পাড়া"
        ],
        "coordinates": [
          91.989,
          23.118
        ]
      },
      {
        "name": "College Mour",
        "banglaName": "কলেজ মোড়",
        "aliases": [
          "college mour",
          "খাগড়াছড়ি সরকারি কলেজ"
        ],
        "coordinates": [
          91.979,
          23.115
        ]
      }
    ]
  },
  {
    "name": "Moulvibazar",
    "banglaName": "মৌলভীবাজার",
    "aliases": [
      "moulvibazar",
      "মৌলভীবাজার",
      "sreemangal",
      "শ্রীমঙ্গল"
    ],
    "coordinates": [
      91.7774,
      24.4829
    ],
    "subAreas": [
      {
        "name": "Chowmohana",
        "banglaName": "চৌমোহনা",
        "aliases": [
          "chowmohana",
          "চৌমোহনা চত্বর মৌলভীবাজার"
        ],
        "coordinates": [
          91.778,
          24.483
        ]
      },
      {
        "name": "Kusumbagh",
        "banglaName": "কুসুমবাগ",
        "aliases": [
          "kusumbagh",
          "কুসুমবাগ শপিং এলাকা"
        ],
        "coordinates": [
          91.773,
          24.479
        ]
      },
      {
        "name": "Court Road",
        "banglaName": "কোর্ট রোড",
        "aliases": [
          "court road",
          "কোর্ট রোড মৌলভীবাজার"
        ],
        "coordinates": [
          91.782,
          24.488
        ]
      },
      {
        "name": "Sreemangal Town",
        "banglaName": "শ্রীমঙ্গল শহর",
        "aliases": [
          "sreemangal",
          "শ্রীমঙ্গল চৌমোহনা",
          "চা বাগান এলাকা"
        ],
        "coordinates": [
          91.7333,
          24.3083
        ]
      }
    ]
  },
  {
    "name": "Habiganj",
    "banglaName": "হবিগঞ্জ",
    "aliases": [
      "habiganj",
      "হবিগঞ্জ"
    ],
    "coordinates": [
      91.4155,
      24.3749
    ],
    "subAreas": [
      {
        "name": "Chourasta",
        "banglaName": "চৌরাস্তা",
        "aliases": [
          "chourasta",
          "হবিগঞ্জ চৌরাস্তা পয়েন্ট"
        ],
        "coordinates": [
          91.416,
          24.375
        ]
      },
      {
        "name": "Thana Road",
        "banglaName": "থানা রোড",
        "aliases": [
          "thana road",
          "থানা রোড হবিগঞ্জ"
        ],
        "coordinates": [
          91.412,
          24.372
        ]
      },
      {
        "name": "Shaistanagar",
        "banglaName": "শায়েস্তাগঞ্জ রোড",
        "aliases": [
          "shaistanagar",
          "শায়েস্তানগর"
        ],
        "coordinates": [
          91.421,
          24.381
        ]
      },
      {
        "name": "New Bus Stand",
        "banglaName": "নতুন বাসস্ট্যান্ড",
        "aliases": [
          "bus stand",
          "হবিগঞ্জ পৌর বাস টার্মিনাল"
        ],
        "coordinates": [
          91.428,
          24.385
        ]
      }
    ]
  },
  {
    "name": "Sunamganj",
    "banglaName": "সুনামগঞ্জ",
    "aliases": [
      "sunamganj",
      "সুনামগঞ্জ"
    ],
    "coordinates": [
      91.3992,
      25.0658
    ],
    "subAreas": [
      {
        "name": "Traffic Point",
        "banglaName": "ট্রাফিক পয়েন্ট",
        "aliases": [
          "traffic point",
          "সুনামগঞ্জ ট্রাফিক পয়েন্ট"
        ],
        "coordinates": [
          91.4,
          25.066
        ]
      },
      {
        "name": "Hason Nagar",
        "banglaName": "হাসন নগর",
        "aliases": [
          "hason nagar",
          "হাসন রাজার বাড়ি এলাকা"
        ],
        "coordinates": [
          91.395,
          25.062
        ]
      },
      {
        "name": "Namoshankar",
        "banglaName": "নমশংকর",
        "aliases": [
          "namoshankar",
          "নমশংকরপুর"
        ],
        "coordinates": [
          91.405,
          25.071
        ]
      },
      {
        "name": "Teghoria",
        "banglaName": "তেঘরিয়া",
        "aliases": [
          "teghoria",
          "তেঘরিয়া আবাসিক"
        ],
        "coordinates": [
          91.391,
          25.059
        ]
      }
    ]
  },
  {
    "name": "Jessore",
    "banglaName": "যশোর",
    "aliases": [
      "jessore",
      "jashore",
      "যশোর",
      "doratana",
      "দড়াটানা"
    ],
    "coordinates": [
      89.2182,
      23.1664
    ],
    "subAreas": [
      {
        "name": "Doratana",
        "banglaName": "দড়াটানা",
        "aliases": [
          "doratana",
          "দড়াটানা মোড় যশোর সদর"
        ],
        "coordinates": [
          89.218,
          23.167
        ]
      },
      {
        "name": "Garikhana",
        "banglaName": "গাড়ীখানা",
        "aliases": [
          "garikhana",
          "গাড়ীখানা রোড"
        ],
        "coordinates": [
          89.214,
          23.164
        ]
      },
      {
        "name": "Bejpara",
        "banglaName": "বেজপাড়া",
        "aliases": [
          "bejpara",
          "বেজপাড়া যশোর"
        ],
        "coordinates": [
          89.223,
          23.159
        ]
      },
      {
        "name": "Chanchra",
        "banglaName": "চাঁচড়া",
        "aliases": [
          "chanchra",
          "চাঁচড়া চেকপোস্ট"
        ],
        "coordinates": [
          89.205,
          23.152
        ]
      },
      {
        "name": "Palbari",
        "banglaName": "পালবাড়ী",
        "aliases": [
          "palbari",
          "পালবাড়ী ভাস্কর্য মোড়"
        ],
        "coordinates": [
          89.208,
          23.181
        ]
      },
      {
        "name": "Arabpur",
        "banglaName": "আরবপুর",
        "aliases": [
          "arabpur",
          "আরবপুর মোড়"
        ],
        "coordinates": [
          89.195,
          23.175
        ]
      }
    ]
  },
  {
    "name": "Kushtia",
    "banglaName": "কুষ্টিয়া",
    "aliases": [
      "kushtia",
      "কুষ্টিয়া",
      "mazampur",
      "মজমপুর"
    ],
    "coordinates": [
      89.122,
      23.901
    ],
    "subAreas": [
      {
        "name": "Mazampur",
        "banglaName": "মজমপুর",
        "aliases": [
          "mazampur",
          "মজমপুর গেট কুষ্টিয়া"
        ],
        "coordinates": [
          89.123,
          23.902
        ]
      },
      {
        "name": "NS Road",
        "banglaName": "এনএস রোড",
        "aliases": [
          "ns road",
          "এন এস রোড কুষ্টিয়া বাজার"
        ],
        "coordinates": [
          89.119,
          23.899
        ]
      },
      {
        "name": "Chourhas",
        "banglaName": "চৌড়হাস",
        "aliases": [
          "chourhas",
          "চৌড়হাস মোড়"
        ],
        "coordinates": [
          89.112,
          23.889
        ]
      },
      {
        "name": "Court Station",
        "banglaName": "কোর্ট স্টেশন",
        "aliases": [
          "court station",
          "কোর্ট পাড়া কুষ্টিয়া"
        ],
        "coordinates": [
          89.126,
          23.906
        ]
      },
      {
        "name": "Thanapara",
        "banglaName": "থানাপাড়া",
        "aliases": [
          "thanapara",
          "থানাপাড়া কুষ্টিয়া"
        ],
        "coordinates": [
          89.125,
          23.896
        ]
      },
      {
        "name": "Islamic University Area",
        "banglaName": "ইবি এলাকা",
        "aliases": [
          "iu",
          "ইসলামী বিশ্ববিদ্যালয় কুষ্টিয়া",
          "শান্তিডাঙ্গা"
        ],
        "coordinates": [
          89.182,
          23.721
        ]
      }
    ]
  },
  {
    "name": "Jhenaidah",
    "banglaName": "ঝিনাইদহ",
    "aliases": [
      "jhenaidah",
      "ঝিনাইদহ",
      "paira chottor"
    ],
    "coordinates": [
      89.1726,
      23.545
    ],
    "subAreas": [
      {
        "name": "Paira Chottor",
        "banglaName": "পায়রা চত্বর",
        "aliases": [
          "paira chottor",
          "পায়রা চত্বর ঝিনাইদহ"
        ],
        "coordinates": [
          89.173,
          23.546
        ]
      },
      {
        "name": "Post Office Mour",
        "banglaName": "পোস্ট অফিস মোড়",
        "aliases": [
          "post office",
          "পোস্ট অফিস মোড়"
        ],
        "coordinates": [
          89.169,
          23.543
        ]
      },
      {
        "name": "Arappur",
        "banglaName": "আরাপপুর",
        "aliases": [
          "arappur",
          "আরাপপুর বাসস্ট্যান্ড"
        ],
        "coordinates": [
          89.162,
          23.551
        ]
      },
      {
        "name": "Hamdah",
        "banglaName": "হামদহ",
        "aliases": [
          "hamdah",
          "হামদহ মোড় ঝিনাইদহ"
        ],
        "coordinates": [
          89.182,
          23.556
        ]
      }
    ]
  },
  {
    "name": "Satkhira",
    "banglaName": "সাতক্ষীরা",
    "aliases": [
      "satkhira",
      "সাতক্ষীরা"
    ],
    "coordinates": [
      89.0718,
      22.7185
    ],
    "subAreas": [
      {
        "name": "Khulna Mour",
        "banglaName": "খুলনা মোড়",
        "aliases": [
          "khulna mour",
          "খুলনা মোড় সাতক্ষীরা"
        ],
        "coordinates": [
          89.073,
          22.721
        ]
      },
      {
        "name": "Palashpole",
        "banglaName": "পলাশপোল",
        "aliases": [
          "palashpole",
          "পলাশপোল"
        ],
        "coordinates": [
          89.078,
          22.715
        ]
      },
      {
        "name": "Sultanpur",
        "banglaName": "সুলতানপুর",
        "aliases": [
          "sultanpur",
          "সুলতানপুর বড় বাজার"
        ],
        "coordinates": [
          89.068,
          22.712
        ]
      },
      {
        "name": "Itagacha",
        "banglaName": "ইটাগাছা",
        "aliases": [
          "itagacha",
          "ইটাগাছা হাটের মোড়"
        ],
        "coordinates": [
          89.082,
          22.726
        ]
      }
    ]
  },
  {
    "name": "Bagerhat",
    "banglaName": "বাগেরহাট",
    "aliases": [
      "bagerhat",
      "বাগেরহাট",
      "shat gombuj",
      "ষাট গম্বুজ"
    ],
    "coordinates": [
      89.7927,
      22.6516
    ],
    "subAreas": [
      {
        "name": "Rail Road",
        "banglaName": "রেল রোড",
        "aliases": [
          "rail road",
          "রেল রোড বাগেরহাট সদর"
        ],
        "coordinates": [
          89.793,
          22.652
        ]
      },
      {
        "name": "Dasani",
        "banglaName": "দড়াটানা মোড়",
        "aliases": [
          "dasani",
          "দড়াটানা ব্রিজ সংলগ্ন"
        ],
        "coordinates": [
          89.788,
          22.648
        ]
      },
      {
        "name": "Mithapukur",
        "banglaName": "মিঠাপুকুর",
        "aliases": [
          "mithapukur",
          "মিঠাপুকুর পাড়"
        ],
        "coordinates": [
          89.797,
          22.656
        ]
      },
      {
        "name": "Shat Gombuj Area",
        "banglaName": "ষাট গম্বুজ এলাকা",
        "aliases": [
          "shat gombuj",
          "ষাট গম্বুজ মসজিদ সংলগ্ন"
        ],
        "coordinates": [
          89.742,
          22.673
        ]
      }
    ]
  },
  {
    "name": "Chuadanga",
    "banglaName": "চুয়াডাঙ্গা",
    "aliases": [
      "chuadanga",
      "চুয়াডাঙ্গা",
      "চুয়াডাঙ্গা"
    ],
    "coordinates": [
      88.8556,
      23.6402
    ],
    "subAreas": [
      {
        "name": "Shaheed Mour",
        "banglaName": "শহীদ মোড়",
        "aliases": [
          "shaheed mour",
          "শহীদ মোড় চুয়াডাঙ্গা"
        ],
        "coordinates": [
          88.856,
          23.641
        ]
      },
      {
        "name": "Big Bazar",
        "banglaName": "বড় বাজার",
        "aliases": [
          "big bazar",
          "বড় বাজার চুয়াডাঙ্গা"
        ],
        "coordinates": [
          88.852,
          23.638
        ]
      },
      {
        "name": "Court Mour",
        "banglaName": "কোর্ট মোড়",
        "aliases": [
          "court mour",
          "কোর্ট চত্বর চুয়াডাঙ্গা"
        ],
        "coordinates": [
          88.861,
          23.645
        ]
      },
      {
        "name": "Academy Mour",
        "banglaName": "একাডেমি মোড়",
        "aliases": [
          "academy mour",
          "ভিজে সরকারি স্কুল সংলগ্ন"
        ],
        "coordinates": [
          88.858,
          23.643
        ]
      }
    ]
  },
  {
    "name": "Meherpur",
    "banglaName": "মেহেরপুর",
    "aliases": [
      "meherpur",
      "মেহেরপুর",
      "mujibnagar",
      "মুজিবনগর"
    ],
    "coordinates": [
      88.6318,
      23.7622
    ],
    "subAreas": [
      {
        "name": "Hotel Bazar",
        "banglaName": "হোটেল বাজার",
        "aliases": [
          "hotel bazar",
          "হোটেল বাজার মেহেরপুর সদর"
        ],
        "coordinates": [
          88.632,
          23.763
        ]
      },
      {
        "name": "Barobazar",
        "banglaName": "বড় বাজার",
        "aliases": [
          "barobazar",
          "বড় বাজার মেহেরপুর"
        ],
        "coordinates": [
          88.629,
          23.76
        ]
      },
      {
        "name": "Court Mour",
        "banglaName": "কোর্ট মোড়",
        "aliases": [
          "court mour",
          "কোর্ট রোড মেহেরপুর"
        ],
        "coordinates": [
          88.635,
          23.767
        ]
      }
    ]
  },
  {
    "name": "Magura",
    "banglaName": "মাগুরা",
    "aliases": [
      "magura",
      "মাগুরা"
    ],
    "coordinates": [
      89.4198,
      23.4873
    ],
    "subAreas": [
      {
        "name": "Vaina Mour",
        "banglaName": "ভায়না মোড়",
        "aliases": [
          "vaina mour",
          "ভায়না মোড় মাগুরা"
        ],
        "coordinates": [
          89.421,
          23.488
        ]
      },
      {
        "name": "Dhaka Road",
        "banglaName": "ঢাকা রোড",
        "aliases": [
          "dhaka road",
          "বাস টার্মিনাল মাগুরা"
        ],
        "coordinates": [
          89.426,
          23.491
        ]
      },
      {
        "name": "Chourangi",
        "banglaName": "চৌরঙ্গী মোড়",
        "aliases": [
          "chourangi",
          "চৌরঙ্গী মোড় মাগুরা"
        ],
        "coordinates": [
          89.416,
          23.484
        ]
      }
    ]
  },
  {
    "name": "Narail",
    "banglaName": "নড়াইল",
    "aliases": [
      "narail",
      "নড়াইল",
      "নড়াইল"
    ],
    "coordinates": [
      89.5017,
      23.1725
    ],
    "subAreas": [
      {
        "name": "Rupanbabu Mour",
        "banglaName": "রূপনবাবু মোড়",
        "aliases": [
          "rupanbabu",
          "রূপনবাবুর মোড় নড়াইল"
        ],
        "coordinates": [
          89.502,
          23.173
        ]
      },
      {
        "name": "Chourasta",
        "banglaName": "চৌরাস্তা",
        "aliases": [
          "chourasta",
          "নড়াইল চৌরাস্তা"
        ],
        "coordinates": [
          89.498,
          23.169
        ]
      },
      {
        "name": "Mohishkhola",
        "banglaName": "মহিষখোলা",
        "aliases": [
          "mohishkhola",
          "মহিষখোলা বাসস্ট্যান্ড"
        ],
        "coordinates": [
          89.508,
          23.178
        ]
      }
    ]
  },
  {
    "name": "Patuakhali",
    "banglaName": "পটুয়াখালী",
    "aliases": [
      "patuakhali",
      "পটুয়াখালী",
      "kuakata",
      "কুয়াকাটা"
    ],
    "coordinates": [
      90.3372,
      22.3596
    ],
    "subAreas": [
      {
        "name": "Chourasta",
        "banglaName": "চৌরাস্তা",
        "aliases": [
          "chourasta",
          "পটুয়াখালী চৌরাস্তা মোড়"
        ],
        "coordinates": [
          90.338,
          22.361
        ]
      },
      {
        "name": "Natun Bazar",
        "banglaName": "নতুন বাজার",
        "aliases": [
          "notun bazar",
          "নতুন বাজার পটুয়াখালী"
        ],
        "coordinates": [
          90.334,
          22.358
        ]
      },
      {
        "name": "Launch Ghat",
        "banglaName": "লঞ্চ ঘাট",
        "aliases": [
          "launch ghat",
          "পটুয়াখালী লঞ্চ টার্মিনাল"
        ],
        "coordinates": [
          90.342,
          22.365
        ]
      },
      {
        "name": "Shimulbagh",
        "banglaName": "শিমুলবাগ",
        "aliases": [
          "shimulbagh",
          "শিমুলবাগ মোড়"
        ],
        "coordinates": [
          90.346,
          22.355
        ]
      }
    ]
  },
  {
    "name": "Bhola",
    "banglaName": "ভোলা",
    "aliases": [
      "bhola",
      "ভোলা",
      "ilisha",
      "ইলিশা"
    ],
    "coordinates": [
      90.6482,
      22.6859
    ],
    "subAreas": [
      {
        "name": "Sadar Road",
        "banglaName": "সদর রোড",
        "aliases": [
          "sadar road",
          "সদর রোড ভোলা"
        ],
        "coordinates": [
          90.649,
          22.686
        ]
      },
      {
        "name": "Kalibari Road",
        "banglaName": "কালীবাড়ি রোড",
        "aliases": [
          "kalibari road",
          "কালীবাড়ি মোড় ভোলা"
        ],
        "coordinates": [
          90.645,
          22.683
        ]
      },
      {
        "name": "Ukilpara",
        "banglaName": "উকিলপাড়া",
        "aliases": [
          "ukilpara",
          "উকিলপাড়া ভোলা"
        ],
        "coordinates": [
          90.652,
          22.691
        ]
      },
      {
        "name": "Notun Bazar",
        "banglaName": "নতুন বাজার",
        "aliases": [
          "notun bazar",
          "নতুন বাজার ভোলা"
        ],
        "coordinates": [
          90.642,
          22.681
        ]
      }
    ]
  },
  {
    "name": "Pirojpur",
    "banglaName": "পিরোজপুর",
    "aliases": [
      "pirojpur",
      "পিরোজপুর",
      "hularhat",
      "হুলারহাট"
    ],
    "coordinates": [
      89.9754,
      22.5794
    ],
    "subAreas": [
      {
        "name": "Balesshor Bridge Area",
        "banglaName": "বলেশ্বর ব্রিজ এলাকা",
        "aliases": [
          "balesshor",
          "বলেশ্বর ব্রিজ মোড়"
        ],
        "coordinates": [
          89.976,
          22.581
        ]
      },
      {
        "name": "Parerhat Road",
        "banglaName": "পারেরহাট রোড",
        "aliases": [
          "parerhat road",
          "পারেরহাট রোড পিরোজপুর"
        ],
        "coordinates": [
          89.972,
          22.576
        ]
      },
      {
        "name": "Damodor",
        "banglaName": "দামোদর",
        "aliases": [
          "damodor",
          "দামোদর খালপাড়"
        ],
        "coordinates": [
          89.981,
          22.585
        ]
      }
    ]
  },
  {
    "name": "Jhalokati",
    "banglaName": "ঝালকাঠি",
    "aliases": [
      "jhalokati",
      "jhalakati",
      "ঝালকাঠি"
    ],
    "coordinates": [
      90.1987,
      22.6406
    ],
    "subAreas": [
      {
        "name": "Kalibari",
        "banglaName": "কালীবাড়ি",
        "aliases": [
          "kalibari",
          "কালীবাড়ি মোড় ঝালকাঠি"
        ],
        "coordinates": [
          90.199,
          22.641
        ]
      },
      {
        "name": "Chandrakanta Road",
        "banglaName": "চন্দ্রকান্ত রোড",
        "aliases": [
          "chandrakanta road",
          "সদর চত্বর"
        ],
        "coordinates": [
          90.195,
          22.638
        ]
      },
      {
        "name": "Launch Ghat",
        "banglaName": "লঞ্চ ঘাট",
        "aliases": [
          "launch ghat",
          "ঝালকাঠি লঞ্চ টার্মিনাল"
        ],
        "coordinates": [
          90.203,
          22.645
        ]
      }
    ]
  },
  {
    "name": "Barguna",
    "banglaName": "বরগুনা",
    "aliases": [
      "barguna",
      "বরগুনা"
    ],
    "coordinates": [
      90.1172,
      22.1587
    ],
    "subAreas": [
      {
        "name": "Launch Ghat",
        "banglaName": "লঞ্চ ঘাট",
        "aliases": [
          "launch ghat",
          "বরগুনা লঞ্চ ঘাট মোড়"
        ],
        "coordinates": [
          90.118,
          22.159
        ]
      },
      {
        "name": "Siraj Uddin Sarak",
        "banglaName": "সিরাজ উদ্দিন সড়ক",
        "aliases": [
          "siraj uddin",
          "সদর বাজার রোড"
        ],
        "coordinates": [
          90.114,
          22.156
        ]
      },
      {
        "name": "Krok",
        "banglaName": "ক্রোক",
        "aliases": [
          "krok",
          "ক্রোক এলাকা বরগুনা"
        ],
        "coordinates": [
          90.122,
          22.164
        ]
      }
    ]
  }
];

/**
 * Calculate distance between two lat/lng coordinates in kilometers (Haversine formula)
 */
function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Detect nearest area and sub-area given GPS coordinates [latitude, longitude]
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} [maxDistanceKm=35] - Maximum acceptable distance (covers entire district radius)
 * @returns {{ area: string, banglaName: string, subArea: string|null, distanceKm: number } | null}
 */
function detectAreaFromCoordinates(lat, lng, maxDistanceKm = 35) {
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (isNaN(numLat) || isNaN(numLng)) return null;

  let closestArea = null;
  let minDistance = Infinity;

  for (const area of BD_AREAS) {
    const [areaLng, areaLat] = area.coordinates;
    const dist = getHaversineDistanceKm(numLat, numLng, areaLat, areaLng);

    if (dist < minDistance) {
      minDistance = dist;
      closestArea = area;
    }
  }

  if (!closestArea || minDistance > maxDistanceKm) {
    return null;
  }

  // Check if coordinates are close to a specific sub-area of this area
  let detectedSubArea = null;
  let minSubAreaDist = Infinity;

  if (Array.isArray(closestArea.subAreas) && closestArea.subAreas.length > 0) {
    for (const sub of closestArea.subAreas) {
      const [subLng, subLat] = sub.coordinates;
      const subDist = getHaversineDistanceKm(numLat, numLng, subLat, subLng);
      if (subDist < minSubAreaDist && subDist <= 4.5) {
        minSubAreaDist = subDist;
        detectedSubArea = sub.name;
      }
    }
  }

  return {
    area: closestArea.name,
    banglaName: closestArea.banglaName,
    subArea: detectedSubArea,
    distanceKm: Math.round(minDistance * 10) / 10,
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Match a sub-area against a query text avoiding partial number collisions (e.g. 1 matching 10)
 */
function isSubAreaMatch(sub, queryText) {
  if (!queryText) return false;
  const clean = queryText.trim().toLowerCase();
  if (sub.name.toLowerCase() === clean || sub.banglaName === queryText.trim()) return true;

  return sub.aliases.some((alias) => {
    const a = alias.toLowerCase().trim();
    if (a === clean) return true;
    // Match whole word / whole number
    const regex = new RegExp(`(^|\\s|[.,_-])${escapeRegex(a)}($|\\s|[.,_-])`, 'i');
    return regex.test(clean);
  });
}

/**
 * Match an area against a query text
 */
function isAreaMatch(area, queryText) {
  if (!queryText) return false;
  const clean = queryText.trim().toLowerCase();
  if (area.name.toLowerCase() === clean || area.banglaName === queryText.trim()) return true;

  return area.aliases.some((alias) => {
    const a = alias.toLowerCase().trim();
    if (a === clean) return true;
    const regex = new RegExp(`(^|\\s|[.,_-])${escapeRegex(a)}($|\\s|[.,_-])`, 'i');
    return regex.test(clean);
  });
}

/**
 * Find coordinates for an area and subArea text (used for auto-geocoding landlord posts)
 * @param {string} areaText
 * @param {string} [subAreaText]
 * @returns {[number, number]} [longitude, latitude]
 */
function getCoordinatesForArea(areaText, subAreaText = '') {
  if (!areaText || typeof areaText !== 'string') {
    return [90.399452, 23.777176]; // Default center of Dhaka
  }

  const cleanArea = areaText.trim();
  const cleanSub = (subAreaText || '').trim();

  for (const area of BD_AREAS) {
    if (isAreaMatch(area, cleanArea)) {
      // Try sub-area match first for greater accuracy
      if (cleanSub && Array.isArray(area.subAreas)) {
        for (const sub of area.subAreas) {
          if (isSubAreaMatch(sub, cleanSub)) {
            return sub.coordinates;
          }
        }
      }
      return area.coordinates;
    }
  }

  // Also check if cleanArea itself matches any sub-area directly
  for (const area of BD_AREAS) {
    if (Array.isArray(area.subAreas)) {
      for (const sub of area.subAreas) {
        if (isSubAreaMatch(sub, cleanArea)) {
          return sub.coordinates;
        }
      }
    }
  }

  return [90.399452, 23.777176]; // Default Dhaka center
}

/**
 * Build a robust regex pattern combining English and Bangla aliases for an area string
 * E.g. "Mirpur" -> "(mirpur|মিরপুর|pallabi|kazipara)"
 * @param {string} text
 * @returns {string} Regex pattern string
 */
function buildAreaRegexPattern(text) {
  if (!text || typeof text !== 'string') return '';

  const clean = text.trim();

  for (const area of BD_AREAS) {
    if (isAreaMatch(area, clean)) {
      const allTokens = [area.name, area.banglaName, ...area.aliases];
      const uniqueTokens = Array.from(new Set(allTokens.map((t) => t.trim()).filter(Boolean)));
      const escaped = uniqueTokens.map(escapeRegex);
      return `(${escaped.join('|')})`;
    }
  }

  // Fallback to exact text escaped
  return escapeRegex(clean);
}

/**
 * Build a robust regex pattern for subArea string
 * @param {string} text
 * @returns {string} Regex pattern string
 */
function buildSubAreaRegexPattern(text) {
  if (!text || typeof text !== 'string') return '';

  const clean = text.trim();

  // Find if subArea matches any known subArea in BD_AREAS
  for (const area of BD_AREAS) {
    if (Array.isArray(area.subAreas)) {
      for (const sub of area.subAreas) {
        if (isSubAreaMatch(sub, clean)) {
          const allTokens = [sub.name, sub.banglaName, ...sub.aliases];
          const uniqueTokens = Array.from(new Set(allTokens.map((t) => t.trim()).filter(Boolean)));
          const escaped = uniqueTokens.map(escapeRegex);
          return `(${escaped.join('|')})`;
        }
      }
    }
  }

  return escapeRegex(clean);
}

const DHAKA_AREA_NAMES = [
  'dhaka', 'ঢাকা', 'mirpur', 'মিরপুর', 'dhanmondi', 'ধানমন্ডি', 'uttara', 'উত্তরা',
  'mohammadpur', 'মোহাম্মদপুর', 'adabor', 'আদাবর', 'gulshan', 'গুলশান', 'banani', 'বনানী',
  'baridhara', 'বারিধারা', 'bashundhara', 'বসুন্ধরা', 'bashundhara r/a', 'বসুন্ধরা আ/এ',
  'badda', 'বাড্ডা', 'aftabnagar', 'আফতাবনগর', 'rampura', 'রামপুরা', 'banasree', 'বনশ্রী',
  'khilgaon', 'খিলগাঁও', 'malibagh', 'মালিবাগ', 'moghbazar', 'মগবাজার', 'shantinagar', 'শান্তিনগর',
  'farmgate', 'ফার্মগেট', 'tejgaon', 'তেজগাঁও', 'shahbagh', 'শাহবাগ', 'motijheel', 'মতিঝিল',
  'old dhaka', 'পুরান ঢাকা', 'hazaribagh', 'হাজারীবাগ', 'mohakhali', 'মহাখালী', 'khilkhet', 'খিলক্ষেত',
  'shyamoli', 'শ্যামলী', 'agargaon', 'আগারগাঁও', 'cantonment', 'ক্যান্টনমেন্ট', 'bhatara', 'ভাটারা',
  'jatrabari', 'যাত্রাবাড়ী', 'mugda', 'মুগদা', 'jurain', 'জুরাইন', 'keraniganj', 'কেরানীগঞ্জ',
  'savar', 'সাভার', 'ashulia', 'আশুলিয়া', 'nikunja', 'নিকুঞ্জ', 'wari', 'ওয়ারী', 'lalbagh', 'লালবাগ'
];

/**
 * Check if a given area string belongs to Greater Dhaka
 * @param {string} areaText
 * @returns {boolean}
 */
function isDhakaArea(areaText) {
  if (!areaText || typeof areaText !== 'string') return false;
  const clean = areaText.trim().toLowerCase();
  return DHAKA_AREA_NAMES.some((item) => clean === item || clean.includes(item) || item.includes(clean));
}

module.exports = {
  BD_AREAS,
  getHaversineDistanceKm,
  detectAreaFromCoordinates,
  getCoordinatesForArea,
  buildAreaRegexPattern,
  buildSubAreaRegexPattern,
  isDhakaArea,
};
