/**
 * Location Helper for Smart Location-Aware Property Listing in Varatia
 * Comprehensive dictionary covering every single neighborhood, thana, sector, block,
 * and residential area of Dhaka City (North & South) and major metropolitan areas in Bangladesh.
 *
 * Provides area dictionary, coordinates mapping, reverse geocoding via Haversine distance,
 * and fuzzy English-Bangla area keyword matching.
 */

// Major areas in Bangladesh (Extensive coverage of Greater Dhaka & major cities)
const BD_AREAS = [
  // ==========================================
  // 1. MIRPUR & SURROUNDINGS (মিরপুর)
  // ==========================================
  {
    name: 'Mirpur',
    banglaName: 'মিরপুর',
    aliases: ['mirpur', 'মিরপুর', 'pallabi', 'পল্লবী', 'kazipara', 'কাজীপাড়া', 'shewrapara', 'শেওড়াপাড়া', 'rupnagar', 'রুপনগর', 'monipur', 'মণিপুর', 'pirerbag', 'পীরেরবাগ', 'paikpara', 'পাইকপাড়া'],
    coordinates: [90.3685, 23.8067], // [lng, lat] - Mirpur 10 Circle
    subAreas: [
      { name: 'Section 1', banglaName: 'সেকশন ১', aliases: ['section 1', 'sec 1', '১', 'সেকশন ১', 'সনি সিনেমা', 'আনসার ক্যাম্প', 'মাজার রোড'], coordinates: [90.3533, 23.7956] },
      { name: 'Section 2', banglaName: 'সেকশন ২', aliases: ['section 2', 'sec 2', '২', 'সেকশন ২', 'স্টেডিয়াম', 'কমার্স কলেজ'], coordinates: [90.3582, 23.8031] },
      { name: 'Section 6', banglaName: 'সেকশন ৬', aliases: ['section 6', 'sec 6', '৬', 'সেকশন ৬'], coordinates: [90.3644, 23.8123] },
      { name: 'Section 7', banglaName: 'সেকশন ৭', aliases: ['section 7', 'sec 7', '৭', 'সেকশন ৭', 'মিল্ক ভিটা'], coordinates: [90.3670, 23.8160] },
      { name: 'Section 10', banglaName: 'সেকশন ১০', aliases: ['section 10', 'sec 10', '১০', 'সেকশন ১০', 'গোলচত্বর', 'বেনারসি'], coordinates: [90.3685, 23.8067] },
      { name: 'Section 11', banglaName: 'সেকশন ১১', aliases: ['section 11', 'sec 11', '১১', 'সেকশন ১১', 'কালশী রোড', 'প্যারিস রোড'], coordinates: [90.3705, 23.8197] },
      { name: 'Section 12', banglaName: 'সেকশন ১২', aliases: ['section 12', 'sec 12', '১২', 'সেকশন ১২', 'কালশী মোড়', 'ইস্টার্ন হাউজিং'], coordinates: [90.3639, 23.8273] },
      { name: 'Section 13', banglaName: 'সেকশন ১৩', aliases: ['section 13', 'sec 13', '১৩', 'সেকশন ১৩', 'বিআরটিএ'], coordinates: [90.3768, 23.8080] },
      { name: 'Section 14', banglaName: 'সেকশন ১৪', aliases: ['section 14', 'sec 14', '১৪', 'সেকশন ১৪', 'কচুক্ষেত সংলগ্ন', 'পুলিশ লাইন'], coordinates: [90.3855, 23.8010] },
      { name: 'Mirpur DOHS', banglaName: 'মিরপুর ডিওএইচএস', aliases: ['mirpur dohs', 'ডিওএইচএস', 'dohs mirpur'], coordinates: [90.3725, 23.8340] },
      { name: 'Kazipara', banglaName: 'কাজীপাড়া', aliases: ['kazipara', 'কাজীপাড়া', 'পূর্ব কাজীপাড়া', 'পশ্চিম কাজীপাড়া'], coordinates: [90.3723, 23.7925] },
      { name: 'Shewrapara', banglaName: 'শেওড়াপাড়া', aliases: ['shewrapara', 'শেওড়াপাড়া', 'পূর্ব শেওড়াপাড়া', 'পশ্চিম শেওড়াপাড়া'], coordinates: [90.3735, 23.7845] },
      { name: 'Pallabi', banglaName: 'পল্লবী', aliases: ['pallabi', 'পল্লবী', 'পল্লবী থানা'], coordinates: [90.3620, 23.8240] },
      { name: 'Rupnagar', banglaName: 'রুপনগর', aliases: ['rupnagar', 'রুপনগর আবাসিক', 'টিনশেড'], coordinates: [90.3520, 23.8150] },
      { name: 'Paikpara', banglaName: 'পাইকপাড়া', aliases: ['paikpara', 'পাইকপাড়া', 'সরকারি কলোনি'], coordinates: [90.3600, 23.7850] },
      { name: 'Pirerbag', banglaName: 'পীরেরবাগ', aliases: ['pirerbag', 'পীরেরবাগ', 'আমতলী পীরেরবাগ'], coordinates: [90.3630, 23.7880] },
      { name: 'Monipur', banglaName: 'মণিপুর', aliases: ['monipur', 'মণিপুর', 'মণিপুর স্কুল'], coordinates: [90.3680, 23.7990] },
      { name: 'Gabtoli', banglaName: 'গাবতলী', aliases: ['gabtoli', 'গাবতলী', 'বাস টার্মিনাল', 'গরুর হাট'], coordinates: [90.3440, 23.7830] },
      { name: 'Mazar Road', banglaName: 'মাজার রোড', aliases: ['mazar road', 'মাজার রোড', 'শাহ আলী মাজার'], coordinates: [90.3490, 23.7920] },
    ],
  },

  // ==========================================
  // 2. DHANMONDI & SURROUNDINGS (ধানমন্ডি)
  // ==========================================
  {
    name: 'Dhanmondi',
    banglaName: 'ধানমন্ডি',
    aliases: ['dhanmondi', 'ধানমন্ডি', 'jigatola', 'জিগাতলা', 'kalabagan', 'কলাবাগান', 'sobhanbag', 'শোভনবাগ', 'shankar', 'শংকর', 'sukrabad', 'শুক্রাবাদ', 'rayer bazar', 'রায়ের বাজার'],
    coordinates: [90.3742, 23.7465],
    subAreas: [
      { name: 'Dhanmondi 27', banglaName: 'ধানমন্ডি ২৭', aliases: ['27', '২৭', 'road 27', 'ধানমন্ডি ২৭', 'রাপা প্লাজা'], coordinates: [90.3720, 23.7540] },
      { name: 'Dhanmondi 32', banglaName: 'ধানমন্ডি ৩২', aliases: ['32', '৩২', 'road 32', 'ধানমন্ডি ৩২', 'রাসেল স্কয়ার'], coordinates: [90.3780, 23.7510] },
      { name: 'Dhanmondi 15', banglaName: 'ধানমন্ডি ১৫', aliases: ['15', '১৫', 'road 15', 'ধানমন্ডি ১৫', 'স্টার কাবাব ১৫'], coordinates: [90.3710, 23.7440] },
      { name: 'Dhanmondi 8/A', banglaName: 'ধানমন্ডি ৮/এ', aliases: ['8/a', '৮/এ', 'road 8/a', 'ধানমন্ডি ৮'], coordinates: [90.3760, 23.7480] },
      { name: 'Dhanmondi 9/A', banglaName: 'ধানমন্ডি ৯/এ', aliases: ['9/a', '৯/এ', 'road 9/a'], coordinates: [90.3750, 23.7490] },
      { name: 'Jigatola', banglaName: 'জিগাতলা', aliases: ['jigatola', 'জিগাতলা', 'ট্যানারি মোড়'], coordinates: [90.3690, 23.7410] },
      { name: 'Kalabagan', banglaName: 'কলাবাগান', aliases: ['kalabagan', 'কলাবাগান', 'ক্রীড়া চক্র', 'বশির উদ্দিন রোড'], coordinates: [90.3810, 23.7490] },
      { name: 'Shankar', banglaName: 'শংকর', aliases: ['shankar', 'শংকর', 'শংকর বাসস্ট্যান্ড'], coordinates: [90.3660, 23.7500] },
      { name: 'Sobhanbag', banglaName: 'শোভনবাগ', aliases: ['sobhanbag', 'শোভনবাগ', 'ড্যাফোডিল মোড়'], coordinates: [90.3770, 23.7550] },
      { name: 'Sukrabad', banglaName: 'শুক্রাবাদ', aliases: ['sukrabad', 'শুক্রাবাদ', 'মেট্রো শপিং মল'], coordinates: [90.3800, 23.7530] },
      { name: 'Rayer Bazar', banglaName: 'রায়ের বাজার', aliases: ['rayer bazar', 'রায়ের বাজার', 'সাদেক খান রোড', 'বধ্যভূমি'], coordinates: [90.3630, 23.7460] },
    ],
  },

  // ==========================================
  // 3. MOHAMMADPUR & SURROUNDINGS (মোহাম্মদপুর)
  // ==========================================
  {
    name: 'Mohammadpur',
    banglaName: 'মোহাম্মদপুর',
    aliases: ['mohammadpur', 'মোহাম্মদপুর', 'bosila', 'বসিলা', 'ring road', 'রিং রোড', 'tajmahal', 'তাজমহল', 'town hall', 'টাউন হল', 'japan garden', 'জাপান গার্ডেন', 'shia masjid', 'শিয়া মসজিদ', 'chad uddan', 'চাঁদ উদ্যান'],
    coordinates: [90.3584, 23.7658],
    subAreas: [
      { name: 'Ring Road', banglaName: 'রিং রোড', aliases: ['ring road', 'রিং রোড', 'সুচনা কমিউনিটি'], coordinates: [90.3600, 23.7710] },
      { name: 'Town Hall', banglaName: 'টাউন হল', aliases: ['town hall', 'টাউন হল', 'বাজার মোড়'], coordinates: [90.3640, 23.7610] },
      { name: 'Tajmahal Road', banglaName: 'তাজমহল রোড', aliases: ['tajmahal', 'তাজমহল রোড', 'মিনাবাজার মোড়'], coordinates: [90.3620, 23.7640] },
      { name: 'Noorjahan Road', banglaName: 'নূরজাহান রোড', aliases: ['noorjahan', 'নূরজাহান রোড'], coordinates: [90.3630, 23.7620] },
      { name: 'Salimullah Road', banglaName: 'সলিমুল্লাহ রোড', aliases: ['salimullah', 'সলিমুল্লাহ রোড'], coordinates: [90.3640, 23.7600] },
      { name: 'Asad Avenue', banglaName: 'আসাদ এভিনিউ', aliases: ['asad avenue', 'আসাদ এভিনিউ', 'আসাদ গেট'], coordinates: [90.3680, 23.7620] },
      { name: 'Japan Garden City', banglaName: 'জাপান গার্ডেন সিটি', aliases: ['japan garden', 'জাপান গার্ডেন', 'গার্ডেন সিটি'], coordinates: [90.3580, 23.7720] },
      { name: 'Bosila', banglaName: 'বসিলা', aliases: ['bosila', 'বসিলা', 'বসিলা ব্রিজ', 'বসতি সিটি', 'মেট্রো হাউজিং'], coordinates: [90.3390, 23.7550] },
      { name: 'Shia Masjid', banglaName: 'শিয়া মসজিদ', aliases: ['shia masjid', 'শিয়া মসজিদ', 'কাঁচাবাজার'], coordinates: [90.3590, 23.7680] },
      { name: 'Chad Uddan', banglaName: 'চাঁদ উদ্যান', aliases: ['chad uddan', 'চাঁদ উদ্যান', 'একতা হাউজিং'], coordinates: [90.3460, 23.7650] },
      { name: 'Nabodoy Housing', banglaName: 'নবোদয় হাউজিং', aliases: ['nabodoy', 'নবোদয় হাউজিং', 'নবোদয়'], coordinates: [90.3540, 23.7700] },
      { name: 'PC Culture Housing', banglaName: 'পিসি কালচার', aliases: ['pc culture', 'পিসি কালচার', 'পিসিকালচার হাউজিং'], coordinates: [90.3580, 23.7690] },
      { name: 'Monsurabad Housing', banglaName: 'মনসুরাবাদ', aliases: ['monsurabad', 'মনসুরাবাদ হাউজিং'], coordinates: [90.3500, 23.7680] },
      { name: 'Baitul Aman Housing', banglaName: 'বায়তুল আমান', aliases: ['baitul aman', 'বায়তুল আমান হাউজিং'], coordinates: [90.3610, 23.7670] },
      { name: 'Mohammadia Housing', banglaName: 'মোহাম্মাদীয়া হাউজিং', aliases: ['mohammadia', 'মোহাম্মাদীয়া হাউজিং', 'মোহাম্মাদীয়া সোসাইটি'], coordinates: [90.3550, 23.7690] },
      { name: 'Iqbal Road', banglaName: 'ইকবাল রোড', aliases: ['iqbal road', 'ইকবাল রোড'], coordinates: [90.3660, 23.7610] },
      { name: 'Humayun Road', banglaName: 'হুমায়ুন রোড', aliases: ['humayun road', 'হুমায়ুন রোড'], coordinates: [90.3670, 23.7590] },
      { name: 'Babar Road', banglaName: 'বাবর রোড', aliases: ['babar road', 'বাবর রোড'], coordinates: [90.3650, 23.7630] },
    ],
  },

  // ==========================================
  // 4. ADABOR & SHEKHERTEK (আদাবর ও শেখেরটেক)
  // ==========================================
  {
    name: 'Adabor',
    banglaName: 'আদাবর',
    aliases: ['adabor', 'আদাবর', 'shekhertek', 'শেখেরটেক', 'sunibir', 'সুনিবিড়'],
    coordinates: [90.3550, 23.7740],
    subAreas: [
      { name: 'Shekhertek', banglaName: 'শেখেরটেক', aliases: ['shekhertek', 'শেখেরটেক', 'শেখেরটেক ১ থেকে ১২'], coordinates: [90.3520, 23.7730] },
      { name: 'Adabor Road 1-18', banglaName: 'আদাবর মেইন', aliases: ['adabor road', 'আদাবর রোড', 'আদাবর থানা'], coordinates: [90.3550, 23.7740] },
      { name: 'Sunibir Housing', banglaName: 'সুনিবিড় হাউজিং', aliases: ['sunibir', 'সুনিবিড় হাউজিং'], coordinates: [90.3510, 23.7760] },
      { name: 'Baitus Salah', banglaName: 'বাইতুস সালাহ', aliases: ['baitus salah', 'বাইতুস সালাহ জামে মসজিদ'], coordinates: [90.3540, 23.7770] },
    ],
  },

  // ==========================================
  // 5. UTTARA & EXTENSIONS (উত্তরা)
  // ==========================================
  {
    name: 'Uttara',
    banglaName: 'উত্তরা',
    aliases: ['uttara', 'উত্তরা', 'diabari', 'দিয়াবাড়ি', 'azampur', 'আজমপুর', 'jasimuddin', 'জসীমউদদীন', 'rajlakshmi', 'রাজলক্ষ্মী', 'house building', 'হাউস বিল্ডিং', 'abdullahpur', 'আবদুল্লাহপুর', 'uttarkhan', 'উত্তরখান', 'dakhinkhan', 'দক্ষিণখান'],
    coordinates: [90.3978, 23.8759],
    subAreas: [
      { name: 'Sector 1', banglaName: 'সেক্টর ১', aliases: ['sector 1', 'sec 1', 'সেক্টর ১', '১'], coordinates: [90.3980, 23.8630] },
      { name: 'Sector 3', banglaName: 'সেক্টর ৩', aliases: ['sector 3', 'sec 3', 'সেক্টর ৩', '৩', 'jasimuddin', 'জসীমউদদীন'], coordinates: [90.3990, 23.8680] },
      { name: 'Sector 4', banglaName: 'সেক্টর ৪', aliases: ['sector 4', 'sec 4', 'সেক্টর ৪', '৪'], coordinates: [90.4040, 23.8690] },
      { name: 'Sector 5', banglaName: 'সেক্টর ৫', aliases: ['sector 5', 'sec 5', 'সেক্টর ৫', '৫'], coordinates: [90.3950, 23.8700] },
      { name: 'Sector 6', banglaName: 'সেক্টর ৬', aliases: ['sector 6', 'sec 6', 'সেক্টর ৬', '৬'], coordinates: [90.4050, 23.8740] },
      { name: 'Sector 7', banglaName: 'সেক্টর ৭', aliases: ['sector 7', 'sec 7', 'সেক্টর ৭', '৭', 'বিজিবি মার্কেট'], coordinates: [90.3980, 23.8760] },
      { name: 'Sector 8', banglaName: 'সেক্টর ৮', aliases: ['sector 8', 'sec 8', 'সেক্টর ৮', '৮', 'রেললাইন সংলগ্ন'], coordinates: [90.4070, 23.8770] },
      { name: 'Sector 9', banglaName: 'সেক্টর ৯', aliases: ['sector 9', 'sec 9', 'সেক্টর ৯', '৯'], coordinates: [90.3950, 23.8810] },
      { name: 'Sector 10', banglaName: 'সেক্টর ১০', aliases: ['sector 10', 'sec 10', 'সেক্টর ১০', '১০', 'কামারপাড়া রোড'], coordinates: [90.3880, 23.8820] },
      { name: 'Sector 11', banglaName: 'সেক্টর ১১', aliases: ['sector 11', 'sec 11', 'সেক্টর ১১', '১১', 'জমজম টাওয়ার'], coordinates: [90.3870, 23.8750] },
      { name: 'Sector 12', banglaName: 'সেক্টর ১২', aliases: ['sector 12', 'sec 12', 'সেক্টর ১২', '১২', 'খালপাড়'], coordinates: [90.3830, 23.8770] },
      { name: 'Sector 13', banglaName: 'সেক্টর ১৩', aliases: ['sector 13', 'sec 13', 'সেক্টর ১৩', '১৩', 'গাউসুল আজম এভিনিউ'], coordinates: [90.3850, 23.8700] },
      { name: 'Sector 14', banglaName: 'সেক্টর ১৪', aliases: ['sector 14', 'sec 14', 'সেক্টর ১৪', '১৪'], coordinates: [90.3830, 23.8650] },
      { name: 'Sector 15', banglaName: 'সেক্টর ১৫', aliases: ['sector 15', 'sec 15', 'সেক্টর ১৫', '১৫', 'খালপাড় উত্তরা'], coordinates: [90.3770, 23.8800] },
      { name: 'Sector 16', banglaName: 'সেক্টর ১৬', aliases: ['sector 16', 'sec 16', 'সেক্টর ১৬', '১৬'], coordinates: [90.3730, 23.8830] },
      { name: 'Sector 17', banglaName: 'সেক্টর ১৭', aliases: ['sector 17', 'sec 17', 'সেক্টর ১৭', '১৭'], coordinates: [90.3690, 23.8860] },
      { name: 'Sector 18', banglaName: 'সেক্টর ১৮', aliases: ['sector 18', 'sec 18', 'সেক্টর ১৮', '১৮', 'মেট্রোরেল ডিপো'], coordinates: [90.3650, 23.8890] },
      { name: 'Diabari', banglaName: 'দিয়াবাড়ি', aliases: ['diabari', 'দিয়াবাড়ি', 'মেট্রোরেল স্টেশন', 'কাশফুল'], coordinates: [90.3700, 23.8780] },
      { name: 'Azampur', banglaName: 'আজমপুর', aliases: ['azampur', 'আজমপুর বাসস্ট্যান্ড', 'কাঁচাবাজার'], coordinates: [90.4020, 23.8670] },
      { name: 'Rajlakshmi', banglaName: 'রাজলক্ষ্মী', aliases: ['rajlakshmi', 'রাজলক্ষ্মী কমপ্লেক্স'], coordinates: [90.4000, 23.8650] },
      { name: 'House Building', banglaName: 'হাউস বিল্ডিং', aliases: ['house building', 'হাউস বিল্ডিং মোড়', 'মাসকট প্লাজা'], coordinates: [90.3990, 23.8720] },
      { name: 'Abdullahpur', banglaName: 'আবদুল্লাহপুর', aliases: ['abdullahpur', 'আবদুল্লাহপুর মোড়', 'টঙ্গী ব্রিজ'], coordinates: [90.4010, 23.8850] },
      { name: 'Uttarkhan', banglaName: 'উত্তরখান', aliases: ['uttarkhan', 'উত্তরখান', 'মাজার চৌরাস্তা'], coordinates: [90.4200, 23.8800] },
      { name: 'Dakhinkhan', banglaName: 'দক্ষিণখান', aliases: ['dakhinkhan', 'দক্ষিণখান', 'কাওলার মোড়'], coordinates: [90.4220, 23.8680] },
      { name: 'Uttara DOHS', banglaName: 'উত্তরা ডিওএইচএস', aliases: ['uttara dohs', 'উত্তরা ডিওএইচএস'], coordinates: [90.3680, 23.8650] },
    ],
  },

  // ==========================================
  // 6. GULSHAN (গুলশান)
  // ==========================================
  {
    name: 'Gulshan',
    banglaName: 'গুলশান',
    aliases: ['gulshan', 'গুলশান', 'niketan', 'নিকেতন', 'shahjadpur', 'শাহজাদপুর', 'police plaza', 'পুলিশ প্লাজা'],
    coordinates: [90.4152, 23.7925],
    subAreas: [
      { name: 'Gulshan 1', banglaName: 'গুলশান ১', aliases: ['gulshan 1', 'গুলশান ১', '১', 'গোলচত্বর ১'], coordinates: [90.4180, 23.7800] },
      { name: 'Gulshan 2', banglaName: 'গুলশান ২', aliases: ['gulshan 2', 'গুলশান ২', '২', 'গোলচত্বর ২'], coordinates: [90.4150, 23.7930] },
      { name: 'Niketan', banglaName: 'নিকেতন', aliases: ['niketan', 'নিকেতন', 'নিকেতন আবাসিক', 'পুলিশ প্লাজা'], coordinates: [90.4100, 23.7760] },
      { name: 'Shahjadpur', banglaName: 'শাহজাদপুর', aliases: ['shahjadpur', 'শাহজাদপুর', 'সুবাস্তু নজর ভ্যালি', 'বাঁশতলা'], coordinates: [90.4240, 23.7960] },
    ],
  },

  // ==========================================
  // 7. BANANI (বনানী)
  // ==========================================
  {
    name: 'Banani',
    banglaName: 'বনানী',
    aliases: ['banani', 'বনানী', 'kakoli', 'কাকলী', 'chairman bari', 'চেয়ারম্যান বাড়ি', 'kamal ataturk'],
    coordinates: [90.4043, 23.7937],
    subAreas: [
      { name: 'Road 11', banglaName: 'রোড ১১', aliases: ['road 11', '১১ নম্বর রোড', 'বনানী ১১'], coordinates: [90.4030, 23.7940] },
      { name: 'Banani DOHS', banglaName: 'বনানী ডিওএইচএস', aliases: ['banani dohs', 'বনানী ডিওএইচএস'], coordinates: [90.3990, 23.7980] },
      { name: 'Kakoli', banglaName: 'কাকলী', aliases: ['kakoli', 'কাকলী মোড়', 'কাকলী বাসস্ট্যান্ড'], coordinates: [90.4010, 23.7900] },
      { name: 'Chairman Bari', banglaName: 'চেয়ারম্যান বাড়ি', aliases: ['chairman bari', 'চেয়ারম্যান বাড়ি মোড়'], coordinates: [90.4010, 23.7850] },
      { name: 'Kamal Ataturk', banglaName: 'কামাল আতাতুর্ক', aliases: ['kamal ataturk avenue', 'কামাল আতাতুর্ক এভিনিউ'], coordinates: [90.4060, 23.7930] },
    ],
  },

  // ==========================================
  // 8. BARIDHARA (বারিধারা)
  // ==========================================
  {
    name: 'Baridhara',
    banglaName: 'বারিধারা',
    aliases: ['baridhara', 'বারিধারা', 'nadda', 'নদ্দা', 'notun bazar', 'নতুন বাজার'],
    coordinates: [90.4200, 23.8000],
    subAreas: [
      { name: 'Diplomatic Zone', banglaName: 'কূটনৈতিক এলাকা', aliases: ['diplomatic', 'কূটনৈতিক জোন', 'বারিধারা ডিপ্লোমেটিক'], coordinates: [90.4210, 23.7990] },
      { name: 'Baridhara DOHS', banglaName: 'বারিধারা ডিওএইচএস', aliases: ['baridhara dohs', 'বারিধারা ডিওএইচএস'], coordinates: [90.4150, 23.8120] },
      { name: 'J Block', banglaName: 'জে ব্লক', aliases: ['j block', 'জে ব্লক বারিধারা', 'বারিধারা জে ব্লক'], coordinates: [90.4270, 23.8050] },
      { name: 'Nadda', banglaName: 'নদ্দা', aliases: ['nadda', 'নদ্দা বাসস্ট্যান্ড', 'নদ্দা বাজার'], coordinates: [90.4260, 23.8090] },
      { name: 'Notun Bazar', banglaName: 'নতুন বাজার', aliases: ['notun bazar', 'নতুন বাজার মোড়', 'ভাটারা মোড়'], coordinates: [90.4260, 23.7980] },
    ],
  },

  // ==========================================
  // 9. BASHUNDHARA R/A (বসুন্ধরা আ/এ)
  // ==========================================
  {
    name: 'Bashundhara R/A',
    banglaName: 'বসুন্ধরা আ/এ',
    aliases: ['bashundhara', 'বসুন্ধরা', 'residential area', 'r/a', 'বসুন্ধরা আবাসিক', 'kuril', 'কুড়িল', 'jamuna future park', 'যমুনা ফিউচার পার্ক'],
    coordinates: [90.4326, 23.8164],
    subAreas: [
      { name: 'Block A', banglaName: 'ব্লক এ', aliases: ['block a', 'ব্লক এ'], coordinates: [90.4270, 23.8110] },
      { name: 'Block B', banglaName: 'ব্লক বি', aliases: ['block b', 'ব্লক বি'], coordinates: [90.4290, 23.8140] },
      { name: 'Block C', banglaName: 'ব্লক সি', aliases: ['block c', 'ব্লক সি', 'এভারকেয়ার সংলগ্ন'], coordinates: [90.4320, 23.8170] },
      { name: 'Block D', banglaName: 'ব্লক ডি', aliases: ['block d', 'ব্লক ডি', 'এনএসইউ ক্যাম্পাস'], coordinates: [90.4360, 23.8200] },
      { name: 'Block E', banglaName: 'ব্লক ই', aliases: ['block e', 'ব্লক ই'], coordinates: [90.4390, 23.8220] },
      { name: 'Block F', banglaName: 'ব্লক এফ', aliases: ['block f', 'ব্লক এফ'], coordinates: [90.4420, 23.8250] },
      { name: 'Block G', banglaName: 'ব্লক জি', aliases: ['block g', 'ব্লক জি'], coordinates: [90.4450, 23.8270] },
      { name: 'Block H', banglaName: 'ব্লক এইচ', aliases: ['block h', 'ব্লক এইচ'], coordinates: [90.4480, 23.8290] },
      { name: 'Block I', banglaName: 'ব্লক আই', aliases: ['block i', 'ব্লক আই', 'আই ব্লক বাজার'], coordinates: [90.4430, 23.8240] },
      { name: 'Block J', banglaName: 'ব্লক জে', aliases: ['block j', 'ব্লক জে'], coordinates: [90.4490, 23.8220] },
      { name: 'Block K', banglaName: 'ব্লক কে', aliases: ['block k', 'ব্লক কে'], coordinates: [90.4520, 23.8250] },
      { name: 'Block L', banglaName: 'ব্লক এল', aliases: ['block l', 'ব্লক এল'], coordinates: [90.4550, 23.8280] },
      { name: 'Block M', banglaName: 'ব্লক এম', aliases: ['block m', 'ব্লক এম'], coordinates: [90.4580, 23.8310] },
      { name: 'Kuril', banglaName: 'কুড়িল', aliases: ['kuril', 'কুড়িল বিশ্বরোড', 'কুড়িল ফ্লাইওভার'], coordinates: [90.4220, 23.8180] },
    ],
  },

  // ==========================================
  // 10. BADDA (বাড্ডা)
  // ==========================================
  {
    name: 'Badda',
    banglaName: 'বাড্ডা',
    aliases: ['badda', 'বাড্ডা', 'merul', 'মেরুল', 'satarkul', 'সাঁতারকুল', 'beraid', 'বেরাইদ'],
    coordinates: [90.4267, 23.7806],
    subAreas: [
      { name: 'North Badda', banglaName: 'উত্তর বাড্ডা', aliases: ['north badda', 'উত্তর বাড্ডা', 'ফুজি টাওয়ার'], coordinates: [90.4280, 23.7880] },
      { name: 'Middle Badda', banglaName: 'মধ্য বাড্ডা', aliases: ['middle badda', 'মধ্য বাড্ডা', 'বাড্ডা হাই স্কুল'], coordinates: [90.4270, 23.7810] },
      { name: 'South Badda', banglaName: 'দক্ষিণ বাড্ডা', aliases: ['south badda', 'দক্ষিণ বাড্ডা'], coordinates: [90.4240, 23.7740] },
      { name: 'Merul Badda', banglaName: 'মেরুল বাড্ডা', aliases: ['merul badda', 'মেরুল', 'ব্র্যাক ইউনিভার্সিটি', 'হাতিরঝিল সংযোগ'], coordinates: [90.4210, 23.7690] },
      { name: 'Satarkul', banglaName: 'সাঁতারকুল', aliases: ['satarkul', 'সাঁতারকুল রোড'], coordinates: [90.4430, 23.7880] },
      { name: 'Beraid', banglaName: 'বেরাইদ', aliases: ['beraid', 'বেরাইদ বাজার', 'বালু নদী'], coordinates: [90.4650, 23.7920] },
      { name: 'Gudaraghat', banglaName: 'গুদারঘাট', aliases: ['gudaraghat', 'গুদারঘাট বাড্ডা'], coordinates: [90.4190, 23.7750] },
    ],
  },

  // ==========================================
  // 11. AFTABNAGAR (আফতাবনগর)
  // ==========================================
  {
    name: 'Aftabnagar',
    banglaName: 'আফতাবনগর',
    aliases: ['aftabnagar', 'আফতাবনগর', 'jahurul islam city', 'জহুরুল ইসলাম সিটি', 'east west university'],
    coordinates: [90.4350, 23.7680],
    subAreas: [
      { name: 'Block A', banglaName: 'ব্লক এ', aliases: ['block a', 'ব্লক এ', 'ইস্ট ওয়েস্ট সংলগ্ন'], coordinates: [90.4290, 23.7690] },
      { name: 'Block B', banglaName: 'ব্লক বি', aliases: ['block b', 'ব্লক বি'], coordinates: [90.4320, 23.7690] },
      { name: 'Block C', banglaName: 'ব্লক সি', aliases: ['block c', 'ব্লক সি'], coordinates: [90.4360, 23.7680] },
      { name: 'Block D', banglaName: 'ব্লক ডি', aliases: ['block d', 'ব্লক ডি'], coordinates: [90.4390, 23.7670] },
      { name: 'Block E', banglaName: 'ব্লক ই', aliases: ['block e', 'ব্লক ই'], coordinates: [90.4420, 23.7660] },
      { name: 'Block F', banglaName: 'ব্লক এফ', aliases: ['block f', 'ব্লক এফ'], coordinates: [90.4450, 23.7650] },
    ],
  },

  // ==========================================
  // 12. RAMPURA (রামপুরা)
  // ==========================================
  {
    name: 'Rampura',
    banglaName: 'রামপুরা',
    aliases: ['rampura', 'রামপুরা', 'mohanagar', 'মহানগর', 'hazipara', 'হাজীপাড়া', 'ulan', 'উলান'],
    coordinates: [90.4208, 23.7612],
    subAreas: [
      { name: 'TV Station', banglaName: 'টিভি সেন্টার', aliases: ['tv station', 'টিভি সেন্টার', 'রামপুরা ব্রিজ'], coordinates: [90.4190, 23.7640] },
      { name: 'Mohanagar Project', banglaName: 'মহানগর প্রজেক্ট', aliases: ['mohanagar project', 'মহানগর প্রজেক্ট', 'হাতিরঝিল মহানগর'], coordinates: [90.4140, 23.7650] },
      { name: 'Hazipara', banglaName: 'হাজীপাড়া', aliases: ['hazipara', 'হাজীপাড়া পেট্রোল পাম্প'], coordinates: [90.4150, 23.7590] },
      { name: 'Ulan', banglaName: 'উলান', aliases: ['ulan', 'উলান বাজার'], coordinates: [90.4220, 23.7650] },
      { name: 'Wapda Road', banglaName: 'ওয়াপদা রোড', aliases: ['wapda road', 'ওয়াপদা রোড রামপুরা'], coordinates: [90.4170, 23.7630] },
      { name: 'East Rampura', banglaName: 'পূর্ব রামপুরা', aliases: ['east rampura', 'পূর্ব রামপুরা'], coordinates: [90.4240, 23.7610] },
      { name: 'West Rampura', banglaName: 'পশ্চিম রামপুরা', aliases: ['west rampura', 'পশ্চিম রামপুরা'], coordinates: [90.4180, 23.7610] },
    ],
  },

  // ==========================================
  // 13. BANASREE (বনশ্রী)
  // ==========================================
  {
    name: 'Banasree',
    banglaName: 'বনশ্রী',
    aliases: ['banasree', 'বনশ্রী', 'farazi hospital', 'ফরাজী হাসপাতাল', 'বনশ্রী আবাসিক'],
    coordinates: [90.4340, 23.7620],
    subAreas: [
      { name: 'Block A', banglaName: 'ব্লক এ', aliases: ['block a', 'ব্লক এ', 'বনশ্রী ১ নং গেট'], coordinates: [90.4250, 23.7630] },
      { name: 'Block B', banglaName: 'ব্লক বি', aliases: ['block b', 'ব্লক বি'], coordinates: [90.4280, 23.7630] },
      { name: 'Block C', banglaName: 'ব্লক সি', aliases: ['block c', 'ব্লক সি', 'ফরাজী হাসপাতাল মোড়'], coordinates: [90.4310, 23.7620] },
      { name: 'Block D', banglaName: 'ব্লক ডি', aliases: ['block d', 'ব্লক ডি'], coordinates: [90.4340, 23.7620] },
      { name: 'Block E', banglaName: 'ব্লক ই', aliases: ['block e', 'ব্লক ই'], coordinates: [90.4370, 23.7610] },
      { name: 'Block F', banglaName: 'ব্লক এফ', aliases: ['block f', 'ব্লক এফ'], coordinates: [90.4400, 23.7600] },
      { name: 'Block G', banglaName: 'ব্লক জি', aliases: ['block g', 'ব্লক জি'], coordinates: [90.4420, 23.7590] },
      { name: 'Block H', banglaName: 'ব্লক এইচ', aliases: ['block h', 'ব্লক এইচ'], coordinates: [90.4440, 23.7580] },
      { name: 'Block I', banglaName: 'ব্লক আই', aliases: ['block i', 'ব্লক আই'], coordinates: [90.4460, 23.7570] },
      { name: 'Block J', banglaName: 'ব্লক জে', aliases: ['block j', 'ব্লক জে'], coordinates: [90.4480, 23.7560] },
      { name: 'Block K', banglaName: 'ব্লক কে', aliases: ['block k', 'ব্লক কে'], coordinates: [90.4500, 23.7550] },
      { name: 'Block L', banglaName: 'ব্লক এল', aliases: ['block l', 'ব্লক এল'], coordinates: [90.4520, 23.7540] },
      { name: 'Block M', banglaName: 'ব্লক এম', aliases: ['block m', 'ব্লক এম'], coordinates: [90.4540, 23.7530] },
    ],
  },

  // ==========================================
  // 14. KHILGAON (খিলগাঁও)
  // ==========================================
  {
    name: 'Khilgaon',
    banglaName: 'খিলগাঁও',
    aliases: ['khilgaon', 'খিলগাঁও', 'taltola', 'তালতলা', 'goran', 'গোড়ান', 'sipahibagh', 'সিপাহীবাগ', 'tilpapara', 'তিলপাপাড়া', 'meradia', 'মেরাদিয়া'],
    coordinates: [90.4227, 23.7505],
    subAreas: [
      { name: 'Taltola', banglaName: 'তালতলা', aliases: ['taltola', 'তালতলা মার্কেট', 'তালতলা সুপার মার্কেট'], coordinates: [90.4220, 23.7530] },
      { name: 'Goran', banglaName: 'গোড়ান', aliases: ['goran', 'গোড়ান বাজার', 'পূর্ব গোড়ান', 'পশ্চিম গোড়ান'], coordinates: [90.4310, 23.7520] },
      { name: 'Sipahibagh', banglaName: 'সিপাহীবাগ', aliases: ['sipahibagh', 'সিপাহীবাগ বাজার'], coordinates: [90.4300, 23.7480] },
      { name: 'Tilpapara', banglaName: 'তিলপাপাড়া', aliases: ['tilpapara', 'তিলপাপাড়া রোড'], coordinates: [90.4250, 23.7490] },
      { name: 'Chowdhury Para', banglaName: 'খিলগাঁও চৌধুরীপাড়া', aliases: ['khilgaon chowdhury para', 'চৌধুরীপাড়া'], coordinates: [90.4180, 23.7530] },
      { name: 'Bagicha', banglaName: 'খিলগাঁও বাগিচা', aliases: ['bagicha', 'খিলগাঁও বাগিচা'], coordinates: [90.4200, 23.7470] },
      { name: 'Meradia', banglaName: 'মেরাদিয়া', aliases: ['meradia', 'মেরাদিয়া বাজার', 'মেরাদিয়া হাট'], coordinates: [90.4400, 23.7540] },
    ],
  },

  // ==========================================
  // 15. MALIBAGH & SHANTINAGAR (মালিবাগ ও শান্তিনগর)
  // ==========================================
  {
    name: 'Malibagh',
    banglaName: 'মালিবাগ',
    aliases: ['malibagh', 'মালিবাগ', 'mouchak', 'মৌচাক', 'shantinagar', 'শান্তিনগর', 'bailey road', 'বেইলি রোড', 'siddheshwari', 'সিদ্ধেশ্বরী', 'kakrail', 'কাকরাইল', 'segunbagicha', 'সেগুনবাগিচা'],
    coordinates: [90.4116, 23.7441],
    subAreas: [
      { name: 'Mouchak', banglaName: 'মৌচাক', aliases: ['mouchak', 'মৌচাক মোড়', 'মৌচাক মার্কেট'], coordinates: [90.4100, 23.7460] },
      { name: 'Shantinagar', banglaName: 'শান্তিনগর', aliases: ['shantinagar', 'শান্তিনগর মোড়', 'শান্তিনগর টুইন টাওয়ার'], coordinates: [90.4120, 23.7390] },
      { name: 'Malibagh Chowdhury Para', banglaName: 'মালিবাগ চৌধুরীপাড়া', aliases: ['malibagh chowdhury para', 'চৌধুরীপাড়া মালিবাগ'], coordinates: [90.4150, 23.7520] },
      { name: 'Malibagh Railgate', banglaName: 'মালিবাগ রেলগেট', aliases: ['malibagh railgate', 'মালিবাগ বাজার'], coordinates: [90.4110, 23.7480] },
      { name: 'Bailey Road', banglaName: 'বেইলি রোড', aliases: ['bailey road', 'বেইলি রোড', 'অফিসার্স ক্লাব'], coordinates: [90.4070, 23.7410] },
      { name: 'Siddheshwari', banglaName: 'সিদ্ধেশ্বরী', aliases: ['siddheshwari', 'সিদ্ধেশ্বরী গার্লস', 'ভিকারুননিসা সংলগ্ন'], coordinates: [90.4090, 23.7430] },
      { name: 'Kakrail', banglaName: 'কাকরাইল', aliases: ['kakrail', 'কাকরাইল মোড়', 'রাজমনি সিনেমা'], coordinates: [90.4080, 23.7370] },
      { name: 'Segunbagicha', banglaName: 'সেগুনবাগিচা', aliases: ['segunbagicha', 'সেগুনবাগিচা', 'দুদক কার্যালয়'], coordinates: [90.4050, 23.7340] },
    ],
  },

  // ==========================================
  // 16. MOGHBAZAR (মগবাজার)
  // ==========================================
  {
    name: 'Moghbazar',
    banglaName: 'মগবাজার',
    aliases: ['moghbazar', 'মগবাজার', 'wireless gate', 'ওয়্যারলেস গেট', 'modhubagh', 'মধুবাগ', 'dilu road', 'দিলু রোড', 'noyatola', 'নয়াটোলা', 'pearabag', 'পেয়ারাবাগ'],
    coordinates: [90.4040, 23.7500],
    subAreas: [
      { name: 'Wireless Gate', banglaName: 'ওয়্যারলেস গেট', aliases: ['wireless gate', 'মগবাজার ওয়্যারলেস'], coordinates: [90.4050, 23.7490] },
      { name: 'Modhubagh', banglaName: 'মধুবাগ', aliases: ['modhubagh', 'মধুবাগ ব্রিজ', 'হাতিরঝিল মধুবাগ'], coordinates: [90.4100, 23.7530] },
      { name: 'Dilu Road', banglaName: 'দিলু রোড', aliases: ['dilu road', 'দিলু রোড মগবাজার'], coordinates: [90.4020, 23.7460] },
      { name: 'Noyatola', banglaName: 'নয়াটোলা', aliases: ['noyatola', 'নয়াটোলা পার্ক'], coordinates: [90.4080, 23.7560] },
      { name: 'Pearabag', banglaName: 'পেয়ারাবাগ', aliases: ['pearabag', 'পেয়ারাবাগ রেলগেট'], coordinates: [90.4030, 23.7540] },
    ],
  },

  // ==========================================
  // 17. FARMGATE & TEJGAON (ফার্মগেট ও তেজগাঁও)
  // ==========================================
  {
    name: 'Farmgate',
    banglaName: 'ফার্মগেট',
    aliases: ['farmgate', 'ফার্মগেট', 'tejgaon', 'তেজগাঁও', 'indira road', 'ইন্দিরা রোড', 'green road', 'গ্রীন রোড', 'kawran bazar', 'কাওরান বাজার', 'panthapath', 'পান্থপথ', 'nakhalpara', 'নাখালপাড়া', 'monipuripara', 'মণিপুরীপাড়া', 'rajabazar', 'রাজাবাজার'],
    coordinates: [90.3888, 23.7570],
    subAreas: [
      { name: 'Indira Road', banglaName: 'ইন্দিরা রোড', aliases: ['indira road', 'ইন্দিরা রোড'], coordinates: [90.3850, 23.7580] },
      { name: 'Green Road', banglaName: 'গ্রীন রোড', aliases: ['green road', 'গ্রীন রোড', 'কমফোর্ট হাসপাতাল'], coordinates: [90.3840, 23.7480] },
      { name: 'Monipuripara', banglaName: 'মণিপুরীপাড়া', aliases: ['monipuripara', 'মণিপুরীপাড়া', 'সংসদ ভবন সংলগ্ন'], coordinates: [90.3810, 23.7620] },
      { name: 'East Nakhalpara', banglaName: 'পূর্ব নাখালপাড়া', aliases: ['east nakhalpara', 'নাখালপাড়া', 'লুকাস মোড়'], coordinates: [90.3950, 23.7690] },
      { name: 'West Nakhalpara', banglaName: 'পশ্চিম নাখালপাড়া', aliases: ['west nakhalpara', 'পশ্চিম নাখালপাড়া'], coordinates: [90.3900, 23.7680] },
      { name: 'Tejkunipara', banglaName: 'তেজকুনিপাড়া', aliases: ['tejkunipara', 'তেজকুনিপাড়া', 'বিজয় সরণি সংলগ্ন'], coordinates: [90.3910, 23.7630] },
      { name: 'Tejgaon I/A', banglaName: 'তেজগাঁও শিল্পাঞ্চল', aliases: ['tejgaon i/a', 'তেজগাঁও শিল্প এলাকা', 'শান্তা পিনাকল', 'চ্যানেল আই'], coordinates: [90.4010, 23.7670] },
      { name: 'Kawran Bazar', banglaName: 'কাওরান বাজার', aliases: ['kawran bazar', 'কাওরান বাজার', 'সোনারগাঁও মোড়'], coordinates: [90.3920, 23.7510] },
      { name: 'Panthapath', banglaName: 'পান্থপথ', aliases: ['panthapath', 'পান্থপথ', 'বসুন্ধরা সিটি', 'স্কয়ার হাসপাতাল'], coordinates: [90.3860, 23.7520] },
      { name: 'Rajabazar', banglaName: 'রাজাবাজার', aliases: ['rajabazar', 'পূর্ব রাজাবাজার', 'পশ্চিম রাজাবাজার'], coordinates: [90.3840, 23.7550] },
    ],
  },

  // ==========================================
  // 18. SHAHBAGH & CENTRAL DHAKA (শাহবাগ ও ঢাকা কেন্দ্র)
  // ==========================================
  {
    name: 'Shahbagh',
    banglaName: 'শাহবাগ',
    aliases: ['shahbagh', 'শাহবাগ', 'katabon', 'কাটাবন', 'nilkhet', 'নীলক্ষেত', 'elephant road', 'এলিফ্যান্ট রোড', 'new market', 'নিউ মার্কেট', 'azimpur', 'আজিমপুর', 'hatirpool', 'হাতিরপুল', 'banglamotor', 'বাংলামোটর', 'paribagh', 'পরিবাগ'],
    coordinates: [90.3965, 23.7388],
    subAreas: [
      { name: 'Shahbagh Circle', banglaName: 'শাহবাগ মোড়', aliases: ['shahbagh circle', 'পিজি হাসপাতাল', 'বারডেম'], coordinates: [90.3965, 23.7388] },
      { name: 'Katabon', banglaName: 'কাটাবন', aliases: ['katabon', 'কাটাবন মোড়', 'কাটাবন ঢাল'], coordinates: [90.3900, 23.7400] },
      { name: 'Nilkhet', banglaName: 'নীলক্ষেত', aliases: ['nilkhet', 'নীলক্ষেত বই মার্কেট', 'বাবলু রোড'], coordinates: [90.3860, 23.7330] },
      { name: 'Elephant Road', banglaName: 'এলিফ্যান্ট রোড', aliases: ['elephant road', 'এলিফ্যান্ট রোড', 'বাটা সিগন্যাল', 'মাল্টিপ্ল্যান'], coordinates: [90.3850, 23.7400] },
      { name: 'New Market', banglaName: 'নিউ মার্কেট', aliases: ['new market', 'নিউ মার্কেট', 'গাউছিয়া', 'চন্দ্রিমা সুপার মার্কেট'], coordinates: [90.3830, 23.7340] },
      { name: 'Azimpur', banglaName: 'আজিমপুর', aliases: ['azimpur', 'আজিমপুর বটতলা', 'গভঃ কলোনি', 'চায়না বিল্ডিং লেন', 'ইরাকি কবরস্থান'], coordinates: [90.3840, 23.7280] },
      { name: 'Paribagh', banglaName: 'পরিবাগ', aliases: ['paribagh', 'পরিবাগ মোড়'], coordinates: [90.3950, 23.7450] },
      { name: 'Hatirpool', banglaName: 'হাতিরপুল', aliases: ['hatirpool', 'হাতিরপুল বাজার', 'মোতালেব প্লাজা'], coordinates: [90.3900, 23.7440] },
      { name: 'Banglamotor', banglaName: 'বাংলামোটর', aliases: ['banglamotor', 'বাংলামোটর মোড়', 'বিশ্বসাহিত্য কেন্দ্র'], coordinates: [90.3950, 23.7480] },
      { name: 'Palashi', banglaName: 'পলাশী', aliases: ['palashi', 'পলাশী মোড়', 'বুয়েট ক্যাম্পাস সংলগ্ন'], coordinates: [90.3890, 23.7270] },
    ],
  },

  // ==========================================
  // 19. MOTIJHEEL & PALTAN (মতিঝিল ও পল্টন)
  // ==========================================
  {
    name: 'Motijheel',
    banglaName: 'মতিঝিল',
    aliases: ['motijheel', 'মতিঝিল', 'paltan', 'পল্টন', 'dilkusha', 'দিলকুশা', 'fakirapool', 'ফকিরাপুল', 'arambagh', 'আরামবাগ', 'kamalapur', 'কমলাপুর', 'shahjahanpur', 'শাহজাহানপুর', 'gopibagh', 'গোপীবাগ'],
    coordinates: [90.4172, 23.7330],
    subAreas: [
      { name: 'Motijheel C/A', banglaName: 'মতিঝিল বা/এ', aliases: ['motijheel c/a', 'শাপলা চত্বর', 'বাংলাদেশ ব্যাংক'], coordinates: [90.4172, 23.7330] },
      { name: 'Dilkusha', banglaName: 'দিলকুশা', aliases: ['dilkusha', 'দিলকুশা বা/এ'], coordinates: [90.4190, 23.7310] },
      { name: 'Purana Paltan', banglaName: 'পুরানা পল্টন', aliases: ['purana paltan', 'পল্টন মোড়', 'বায়তুল মোকাররম'], coordinates: [90.4110, 23.7340] },
      { name: 'Naya Paltan', banglaName: 'নয়া পল্টন', aliases: ['naya paltan', 'নয়া পল্টন বিএনপি অফিস সংলগ্ন'], coordinates: [90.4120, 23.7360] },
      { name: 'Fakirapool', banglaName: 'ফকিরাপুল', aliases: ['fakirapool', 'ফকিরাপুল পানির ট্যাংক'], coordinates: [90.4160, 23.7360] },
      { name: 'Arambagh', banglaName: 'আরামবাগ', aliases: ['arambagh', 'আরামবাগ বাসস্ট্যান্ড'], coordinates: [90.4190, 23.7350] },
      { name: 'Kamalapur', banglaName: 'কমলাপুর', aliases: ['kamalapur', 'কমলাপুর রেলওয়ে স্টেশন', 'টিঅ্যান্ডটি কলোনি'], coordinates: [90.4230, 23.7330] },
      { name: 'Shahjahanpur', banglaName: 'শাহজাহানপুর', aliases: ['shahjahanpur', 'রেলওয়ে কলোনি শাহজাহানপুর'], coordinates: [90.4200, 23.7420] },
      { name: 'Gopibagh', banglaName: 'গোপীবাগ', aliases: ['gopibagh', 'গোপীবাগ বাজার', 'ব্রাদার্স ইউনিয়ন'], coordinates: [90.4250, 23.7290] },
    ],
  },

  // ==========================================
  // 20. OLD DHAKA / PURAN DHAKA (পুরান ঢাকা)
  // ==========================================
  {
    name: 'Old Dhaka',
    banglaName: 'পুরান ঢাকা',
    aliases: ['old dhaka', 'পুরান ঢাকা', 'puran dhaka', 'lalbagh', 'লালবাগ', 'chawkbazar', 'চকবাজার', 'wari', 'ওয়ারী', 'sadarghat', 'সদরঘাট', 'armanitola', 'আরমানিটোলা', 'babu bazar', 'বাবুবাজার', 'islampur', 'ইসলামপুর', 'shankhari bazar', 'শাখারি বাজার', 'tanti bazar', 'তাঁতি বাজার', 'sutrapur', 'সূত্রাপুর', 'gandaria', 'গেন্ডারিয়া', 'narinda', 'নারিন্দা', 'tikatuli', 'টিকাটুলী', 'bangshal', 'বংশাল'],
    coordinates: [90.4000, 23.7150],
    subAreas: [
      { name: 'Wari', banglaName: 'ওয়ারী', aliases: ['wari', 'ওয়ারী', 'র‌্যাঙ্কিন স্ট্রিট', 'টিপু সুলতান রোড', 'ওয়ারী ক্লাব'], coordinates: [90.4200, 23.7170] },
      { name: 'Lalbagh', banglaName: 'লালবাগ', aliases: ['lalbagh', 'লালবাগ কেল্লা', 'শায়েস্তা খাঁ রোড'], coordinates: [90.3880, 23.7180] },
      { name: 'Chawkbazar', banglaName: 'চকবাজার', aliases: ['chawkbazar', 'চকবাজার', 'বেগমবাজার', 'উর্দু রোড', 'চক সার্কুলার রোড'], coordinates: [90.3950, 23.7150] },
      { name: 'Sadarghat', banglaName: 'সদরঘাট', aliases: ['sadarghat', 'লঞ্চ টার্মিনাল', 'ওয়াইজঘাট', 'পাটুয়াটুলী'], coordinates: [90.4120, 23.7080] },
      { name: 'Armanitola', banglaName: 'আরমানিটোলা', aliases: ['armanitola', 'তারা মসজিদ সংলগ্ন', 'আরমানিটোলা মাঠ'], coordinates: [90.4040, 23.7130] },
      { name: 'Babu Bazar', banglaName: 'বাবুবাজার', aliases: ['babu bazar', 'বাবুবাজার ব্রিজ', 'মিটফোর্ড রোড'], coordinates: [90.4010, 23.7110] },
      { name: 'Islampur', banglaName: 'ইসলামপুর', aliases: ['islampur', 'কাপড়ের বাজার ইসলামপুর'], coordinates: [90.4080, 23.7100] },
      { name: 'Shankhari Bazar', banglaName: 'শাখারি বাজার', aliases: ['shankhari bazar', 'শাখারি পট্টি'], coordinates: [90.4100, 23.7120] },
      { name: 'Tanti Bazar', banglaName: 'তাঁতি বাজার', aliases: ['tanti bazar', 'তাঁতি বাজার স্বর্ণের মার্কেট'], coordinates: [90.4070, 23.7130] },
      { name: 'Sutrapur', banglaName: 'সূত্রাপুর', aliases: ['sutrapur', 'সূত্রাপুর থানা', 'ধূপখোলা মাঠ'], coordinates: [90.4180, 23.7100] },
      { name: 'Gandaria', banglaName: 'গেন্ডারিয়া', aliases: ['gandaria', 'গেন্ডারিয়া রেলস্টেশন', 'দীননাথ সেন রোড'], coordinates: [90.4270, 23.7070] },
      { name: 'Narinda', banglaName: 'নারিন্দা', aliases: ['narinda', 'নারিন্দা পুল', 'শাহ সাহেব লেন'], coordinates: [90.4220, 23.7120] },
      { name: 'Tikatuli', banglaName: 'টিকাটুলী', aliases: ['tikatuli', 'টিকাটুলী মোড়', 'রাজধানী সুপার মার্কেট', 'অভয় দাস লেন'], coordinates: [90.4210, 23.7200] },
      { name: 'Bangshal', banglaName: 'বংশাল', aliases: ['bangshal', 'বংশাল মোড়', 'নাজিরাবাজার', 'আল রাজ্জাক সংলগ্ন'], coordinates: [90.4080, 23.7180] },
      { name: 'Swamibagh', banglaName: 'স্বামীবাগ', aliases: ['swamibagh', 'স্বামীবাগ ইসকন মন্দির সংলগ্ন'], coordinates: [90.4240, 23.7170] },
      { name: 'Dayaganj', banglaName: 'দয়াগঞ্জ', aliases: ['dayaganj', 'দয়াগঞ্জ মোড়', 'দয়াগঞ্জ বাজার'], coordinates: [90.4260, 23.7110] },
    ],
  },

  // ==========================================
  // 21. HAZARIBAGH & KAMRANGIRCHAR (হাজারীবাগ ও কামরাঙ্গীরচর)
  // ==========================================
  {
    name: 'Hazaribagh',
    banglaName: 'হাজারীবাগ',
    aliases: ['hazaribagh', 'হাজারীবাগ', 'kamrangirchar', 'কামরাঙ্গীরচর', 'jhauchar', 'ঝাউচর', 'tannery', 'ট্যানারি'],
    coordinates: [90.3690, 23.7330],
    subAreas: [
      { name: 'Hazaribagh Tannery', banglaName: 'ট্যানারি মোড়', aliases: ['tannery more', 'ট্যানারি মোড়', 'হাজারীবাগ পার্ক'], coordinates: [90.3690, 23.7330] },
      { name: 'Jhauchar', banglaName: 'ঝাউচর', aliases: ['jhauchar', 'ঝাউচর বেড়িবাঁধ'], coordinates: [90.3630, 23.7350] },
      { name: 'Kamrangirchar', banglaName: 'কামরাঙ্গীরচর', aliases: ['kamrangirchar', 'কামরাঙ্গীরচর', 'লোহারপুল', 'আশ্রাফাবাদ', 'রনি মার্কেট'], coordinates: [90.3700, 23.7150] },
      { name: 'Rayerbazar Beribadh', banglaName: 'রায়েরবাজার বেড়িবাঁধ', aliases: ['beribadh', 'বেড়িবাঁধ তিন রাস্তার মোড়'], coordinates: [90.3550, 23.7420] },
    ],
  },

  // ==========================================
  // 22. MOHAKHALI (মহাখালী)
  // ==========================================
  {
    name: 'Mohakhali',
    banglaName: 'মহাখালী',
    aliases: ['mohakhali', 'মহাখালী', 'amtoli', 'আমতলী', 'tb gate', 'টিবি গেট', 'mohakhali dohs', 'korail', 'কড়াইল'],
    coordinates: [90.4020, 23.7770],
    subAreas: [
      { name: 'Wireless Gate', banglaName: 'ওয়ারলেস গেট', aliases: ['wireless gate', 'মহাখালী ওয়ারলেস', 'আইসিডিডিআরবি'], coordinates: [90.4040, 23.7780] },
      { name: 'Amtoli', banglaName: 'আমতলী', aliases: ['amtoli', 'আমতলী মোড় মহাখালী'], coordinates: [90.4010, 23.7770] },
      { name: 'TB Gate', banglaName: 'টিবি গেট', aliases: ['tb gate', 'টিবি গেট সংলগ্ন'], coordinates: [90.4070, 23.7800] },
      { name: 'Bus Terminal', banglaName: 'মহাখালী বাস টার্মিনাল', aliases: ['bus terminal', 'মহাখালী টার্মিনাল'], coordinates: [90.4000, 23.7740] },
      { name: 'Mohakhali DOHS', banglaName: 'মহাখালী ডিওএইচএস', aliases: ['mohakhali dohs', 'মহাখালী ডিওএইচএস'], coordinates: [90.3920, 23.7780] },
      { name: 'Korail', banglaName: 'কড়াইল', aliases: ['korail', 'কড়াইল বস্তি', 'টিঅ্যান্ডটি কলোনি'], coordinates: [90.4080, 23.7740] },
      { name: 'Rasulbag', banglaName: 'রসুলবাগ', aliases: ['rasulbag', 'রসুলবাগ মহাখালী'], coordinates: [90.4030, 23.7750] },
    ],
  },

  // ==========================================
  // 23. KHILKHET, NIKUNJA & AIRPORT (খিলক্ষেত ও বিমানবন্দর)
  // ==========================================
  {
    name: 'Khilkhet',
    banglaName: 'খিলক্ষেত',
    aliases: ['khilkhet', 'খিলক্ষেত', 'nikunja', 'নিকুঞ্জ', 'airport', 'বিমানবন্দর', 'kawla', 'কাওলা', 'ashkona', 'আশকোনা', 'kuratoli', 'কুড়াতলী'],
    coordinates: [90.4206, 23.8293],
    subAreas: [
      { name: 'Nikunja 1', banglaName: 'নিকুঞ্জ ১', aliases: ['nikunja 1', 'নিকুঞ্জ ১'], coordinates: [90.4170, 23.8250] },
      { name: 'Nikunja 2', banglaName: 'নিকুঞ্জ ২', aliases: ['nikunja 2', 'নিকুঞ্জ ২', 'খিলক্ষেত নিকুঞ্জ'], coordinates: [90.4190, 23.8320] },
      { name: 'Khilkhet Bazar', banglaName: 'খিলক্ষেত বাজার', aliases: ['khilkhet bazar', 'টানপাড়া', 'নামাপাড়া'], coordinates: [90.4250, 23.8300] },
      { name: 'Airport', banglaName: 'বিমানবন্দর', aliases: ['airport', 'হযরত শাহজালাল বিমানবন্দর', 'এয়ারপোর্ট রেলওয়ে স্টেশন'], coordinates: [90.4080, 23.8440] },
      { name: 'Kawla', banglaName: 'কাওলা', aliases: ['kawla', 'কাওলা বাজার', 'আশিয়ান সিটি সংলগ্ন'], coordinates: [90.4130, 23.8400] },
      { name: 'Ashkona', banglaName: 'আশকোনা', aliases: ['ashkona', 'আশকোনা হজ্ব ক্যাম্প', 'আশকোনা বাজার'], coordinates: [90.4120, 23.8580] },
      { name: 'Kuratoli', banglaName: 'কুড়াতলী', aliases: ['kuratoli', 'কুড়াতলী আমেরিকান ইন্টারন্যাশনাল এআইইউবি'], coordinates: [90.4220, 23.8220] },
    ],
  },

  // ==========================================
  // 24. SHYAMOLI & KALYANPUR (শ্যামলী ও কল্যাণপুর)
  // ==========================================
  {
    name: 'Shyamoli',
    banglaName: 'শ্যামলী',
    aliases: ['shyamoli', 'শ্যামলী', 'kalyanpur', 'কল্যাণপুর', 'shishu mela', 'শিশু মেলা', 'shyamoli cinema'],
    coordinates: [90.3650, 23.7720],
    subAreas: [
      { name: 'Shyamoli Square', banglaName: 'শ্যামলী স্কয়ার', aliases: ['shyamoli square', 'শ্যামলী সিনেমা', 'রিং রোড সংলগ্ন'], coordinates: [90.3650, 23.7720] },
      { name: 'Kalyanpur', banglaName: 'কল্যাণপুর', aliases: ['kalyanpur', 'কল্যাণপুর বাসস্ট্যান্ড', 'রোড ১ থেকে ১১', 'খাজা রোড'], coordinates: [90.3620, 23.7780] },
      { name: 'Kalyanpur Natun Bazar', banglaName: 'কল্যাণপুর নতুন বাজার', aliases: ['natun bazar kalyanpur', 'নতুন বাজার কল্যাণপুর'], coordinates: [90.3580, 23.7810] },
    ],
  },

  // ==========================================
  // 25. AGARGAON & SHER-E-BANGLA NAGAR (আগারগাঁও)
  // ==========================================
  {
    name: 'Agargaon',
    banglaName: 'আগারগাঁও',
    aliases: ['agargaon', 'আগারগাঁও', 'sher-e-bangla nagar', 'শেরেবাংলা নগর', 'passport office', 'পাসপোর্ট অফিস', 'nirbachon bhaban'],
    coordinates: [90.3750, 23.7780],
    subAreas: [
      { name: 'Agargaon Taltola', banglaName: 'আগারগাঁও তালতলা', aliases: ['taltola agargaon', 'তালতলা আগারগাঁও', 'কলোনি বাজার'], coordinates: [90.3720, 23.7810] },
      { name: 'Sher-e-Bangla Nagar', banglaName: 'শেরেবাংলা নগর', aliases: ['sher-e-bangla nagar', 'জাতীয় সংসদ ভবন সংলগ্ন', 'শিশু হাসপাতাল সংলগ্ন'], coordinates: [90.3780, 23.7680] },
      { name: 'BNP Bazar', banglaName: 'বিএনপি বাজার', aliases: ['bnp bazar', 'বিএনপি বাজার আগারগাঁও'], coordinates: [90.3740, 23.7750] },
      { name: 'Passport Office Area', banglaName: 'পাসপোর্ট অফিস সংলগ্ন', aliases: ['passport office', 'নির্বাচন ভবন মোড়'], coordinates: [90.3760, 23.7770] },
    ],
  },

  // ==========================================
  // 26. CANTONMENT, KAFRUL & MIRPUR 14 (ক্যান্টনমেন্ট ও কাফরুল)
  // ==========================================
  {
    name: 'Cantonment',
    banglaName: 'ক্যান্টনমেন্ট',
    aliases: ['cantonment', 'ক্যান্টনমেন্ট', 'kafrul', 'কাফরুল', 'ibrahimpur', 'ইব্রাহিমপুর', 'vashantek', 'ভাসানটেক', 'matikata', 'মাটিকাটা', 'ecb chattar', 'ইসিবি চত্বর', 'manikdi', 'মানিকদী', 'kachukhet', 'কচুক্ষেত'],
    coordinates: [90.3950, 23.8150],
    subAreas: [
      { name: 'ECB Chattar', banglaName: 'ইসিবি চত্বর', aliases: ['ecb chattar', 'ইসিবি চত্বর', 'মাটিকাটা মোড়'], coordinates: [90.3910, 23.8210] },
      { name: 'Kachukhet', banglaName: 'কচুক্ষেত', aliases: ['kachukhet', 'কচুক্ষেত বাজার', 'সৈনিক ক্লাব'], coordinates: [90.3900, 23.7960] },
      { name: 'Kafrul', banglaName: 'কাফরুল', aliases: ['kafrul', 'কাফরুল থানা', 'সেনপাড়া পর্বতা'], coordinates: [90.3800, 23.7920] },
      { name: 'Ibrahimpur', banglaName: 'ইব্রাহিমপুর', aliases: ['ibrahimpur', 'ইব্রাহিমপুর পুলপাড়'], coordinates: [90.3860, 23.7950] },
      { name: 'Vashantek', banglaName: 'ভাসানটেক', aliases: ['vashantek', 'ভাসানটেক বাজার', 'ধামালকোট'], coordinates: [90.3920, 23.8090] },
      { name: 'Matikata', banglaName: 'মাটিকাটা', aliases: ['matikata', 'মাটিকাটা রোড'], coordinates: [90.3900, 23.8180] },
      { name: 'Manikdi', banglaName: 'মানিকদী', aliases: ['manikdi', 'মানিকদী বাজার', 'ক্যান্টনমেন্ট সংলগ্ন'], coordinates: [90.3940, 23.8240] },
    ],
  },

  // ==========================================
  // 27. BHATARA & PURBACHAL (ভাটারা ও পূর্বাচল)
  // ==========================================
  {
    name: 'Bhatara',
    banglaName: 'ভাটারা',
    aliases: ['bhatara', 'ভাটারা', 'solmaid', 'ছোলমাইদ', 'joar sahara', 'জোয়ার সাহারা', 'purbachal', 'পূর্বাচল', '300 feet', '৩০০ ফিট'],
    coordinates: [90.4310, 23.8050],
    subAreas: [
      { name: 'Solmaid', banglaName: 'ছোলমাইদ', aliases: ['solmaid', 'ছোলমাইদ বাজার', 'ভাটারা মোড়'], coordinates: [90.4360, 23.8020] },
      { name: 'Joar Sahara', banglaName: 'জোয়ার সাহারা', aliases: ['joar sahara', 'জোয়ার সাহারা বাজার'], coordinates: [90.4240, 23.8130] },
      { name: 'Jagannathpur', banglaName: 'জগন্নাথপুর', aliases: ['jagannathpur', 'জগন্নাথপুর নদ্দা'], coordinates: [90.4290, 23.8090] },
      { name: '300 Feet', banglaName: '৩০০ ফিট', aliases: ['300 feet', '৩০০ ফিট এক্সপ্রেসওয়ে', 'কাঞ্চন ব্রিজ রোড'], coordinates: [90.4450, 23.8200] },
      { name: 'Purbachal', banglaName: 'পূর্বাচল নতুন শহর', aliases: ['purbachal', 'পূর্বাচল', 'সেক্টর ১ থেকে ৩০'], coordinates: [90.4850, 23.8400] },
    ],
  },

  // ==========================================
  // 28. JATRABARI & DEMRA (যাত্রাবাড়ী ও ডেমরা)
  // ==========================================
  {
    name: 'Jatrabari',
    banglaName: 'যাত্রাবাড়ী',
    aliases: ['jatrabari', 'যাত্রাবাড়ী', 'sayedabad', 'সায়েদাবাদ', 'shanir akhra', 'শনির আখড়া', 'rayerbagh', 'রায়েরবাগ', 'matuail', 'মাতুয়াইল', 'demra', 'ডেমরা', 'dania', 'দনিয়া', 'dholairpar', 'ধোলাইরপাড়'],
    coordinates: [90.4349, 23.7104],
    subAreas: [
      { name: 'Jatrabari Chowrasta', banglaName: 'যাত্রাবাড়ী চৌরাস্তা', aliases: ['chowrasta', 'যাত্রাবাড়ী মোড়', 'শহীদ ফারুক রোড'], coordinates: [90.4349, 23.7104] },
      { name: 'Sayedabad', banglaName: 'সায়েদাবাদ', aliases: ['sayedabad', 'সায়েদাবাদ বাস টার্মিনাল', 'জনপথ মোড়'], coordinates: [90.4280, 23.7150] },
      { name: 'Shanir Akhra', banglaName: 'শনির আখড়া', aliases: ['shanir akhra', 'শনির আখড়া বাসস্ট্যান্ড', 'জিয়া সরণি'], coordinates: [90.4490, 23.7050] },
      { name: 'Rayerbagh', banglaName: 'রায়েরবাগ', aliases: ['rayerbagh', 'রায়েরবাগ বাসস্ট্যান্ড', 'কদমতলী সংলগ্ন'], coordinates: [90.4570, 23.7000] },
      { name: 'Matuail', banglaName: 'মাতুয়াইল', aliases: ['matuail', 'মাতুয়াইল মেডিকেল', 'মাতুয়াইল কবরস্থান'], coordinates: [90.4650, 23.7080] },
      { name: 'Demra', banglaName: 'ডেমরা', aliases: ['demra', 'ডেমরা বাজার', 'স্টাফ কোয়ার্টার', 'সারুলিয়া', 'কোনাপাড়া'], coordinates: [90.4950, 23.7150] },
      { name: 'Dania', banglaName: 'দনিয়া', aliases: ['dania', 'দনিয়া কলেজ রোড', 'রসুলপুর দনিয়া'], coordinates: [90.4450, 23.7000] },
      { name: 'Dholairpar', banglaName: 'ধোলাইরপাড়', aliases: ['dholairpar', 'ধোলাইরপাড় চত্বর', 'ফ্লাইওভার সংলগ্ন'], coordinates: [90.4320, 23.7020] },
    ],
  },

  // ==========================================
  // 29. MUGDA, MANDA & MANIKNAGAR (মুগদা ও মান্দা)
  // ==========================================
  {
    name: 'Mugda',
    banglaName: 'মুগদা',
    aliases: ['mugda', 'মুগদা', 'maniknagar', 'মানিকনগর', 'manda', 'মান্দা', 'dhalpur', 'ধলপুর', 'golapbagh', 'গোলাপবাগ'],
    coordinates: [90.4310, 23.7290],
    subAreas: [
      { name: 'North Mugda', banglaName: 'উত্তর মুগদা', aliases: ['north mugda', 'উত্তর মুগদা', 'মুগদা ঝিলপাড়'], coordinates: [90.4320, 23.7310] },
      { name: 'South Mugda', banglaName: 'দক্ষিণ মুগদা', aliases: ['south mugda', 'মুগদা মেডিকেল সংলগ্ন'], coordinates: [90.4300, 23.7280] },
      { name: 'Maniknagar', banglaName: 'মানিকনগর', aliases: ['maniknagar', 'মানিকনগর বিশ্বরোড', 'মিয়াজান গলি'], coordinates: [90.4280, 23.7230] },
      { name: 'Manda', banglaName: 'মান্দা', aliases: ['manda', 'মান্দা বাজার', 'গ্রীন মডেল টাউন'], coordinates: [90.4400, 23.7280] },
      { name: 'Dhalpur', banglaName: 'ধলপুর', aliases: ['dhalpur', 'ধলপুর সিটি কলোনি'], coordinates: [90.4300, 23.7180] },
      { name: 'Golapbagh', banglaName: 'গোলাপবাগ', aliases: ['golapbagh', 'গোলাপবাগ মাঠ', 'সায়েদাবাদ সংলগ্ন'], coordinates: [90.4270, 23.7190] },
    ],
  },

  // ==========================================
  // 30. JURAIN, SHYAMPUR & POSTOGOLA (জুরাইন ও শ্যামপুর)
  // ==========================================
  {
    name: 'Jurain',
    banglaName: 'জুরাইন',
    aliases: ['jurain', 'জুরাইন', 'shyampur', 'শ্যামপুর', 'postogola', 'পোস্তগোলা', 'kadamtali', 'কদমতলী'],
    coordinates: [90.4370, 23.6980],
    subAreas: [
      { name: 'Jurain Railgate', banglaName: 'জুরাইন রেলগেট', aliases: ['jurain railgate', 'জুরাইন বাজার', 'কমিশনার রোড'], coordinates: [90.4370, 23.6980] },
      { name: 'Shyampur', banglaName: 'শ্যামপুর', aliases: ['shyampur', 'শ্যামপুর শিল্পাঞ্চল', 'ইকো পার্ক'], coordinates: [90.4350, 23.6890] },
      { name: 'Postogola', banglaName: 'পোস্তগোলা', aliases: ['postogola', 'পোস্তগোলা ব্রিজ', 'বুড়িগঙ্গা সেতু'], coordinates: [90.4310, 23.6930] },
      { name: 'Kadamtali', banglaName: 'কদমতলী', aliases: ['kadamtali', 'কদমতলী থানা'], coordinates: [90.4350, 23.6930] },
    ],
  },

  // ==========================================
  // 31. KERANIGANJ (কেরানীগঞ্জ)
  // ==========================================
  {
    name: 'Keraniganj',
    banglaName: 'কেরানীগঞ্জ',
    aliases: ['keraniganj', 'কেরানীগঞ্জ', 'jinjira', 'জিনজিরা', 'chunkutia', 'চুনকুটিয়া', 'aganagar', 'আগানগর', 'hasnabad', 'হাসনাবাদ'],
    coordinates: [90.3900, 23.6900],
    subAreas: [
      { name: 'Jinjira', banglaName: 'জিনজিরা', aliases: ['jinjira', 'জিনজিরা বাসস্ট্যান্ড', 'জিনজিরা বাজার'], coordinates: [90.3930, 23.7050] },
      { name: 'Chunkutia', banglaName: 'চুনকুটিয়া', aliases: ['chunkutia', 'চুনকুটিয়া চৌরাস্তা'], coordinates: [90.4050, 23.6950] },
      { name: 'Aganagar', banglaName: 'আগানগর', aliases: ['aganagar', 'আগানগর কাপড়ের মার্কেট'], coordinates: [90.3980, 23.7020] },
      { name: 'Hasnabad', banglaName: 'হাসনাবাদ', aliases: ['hasnabad', 'হাসনাবাদ হাউজিং'], coordinates: [90.4250, 23.6820] },
      { name: 'Rohitpur', banglaName: 'রোহিতপুর', aliases: ['rohitpur', 'রোহিতপুর বাজার'], coordinates: [90.2850, 23.6950] },
    ],
  },

  // ==========================================
  // 32. SAVAR & HEMAYETPUR (সাভার ও হেমায়েতপুর)
  // ==========================================
  {
    name: 'Savar',
    banglaName: 'সাভার',
    aliases: ['savar', 'সাভার', 'hemayetpur', 'হেমায়েতপুর', 'radio colony', 'রেডিও কলোনি', 'crp', 'সিআরপি'],
    coordinates: [90.2667, 23.8583],
    subAreas: [
      { name: 'Savar Bazar', banglaName: 'সাভার বাজার', aliases: ['savar bazar', 'সাভার বাসস্ট্যান্ড', 'থানা রোড', 'সিআরপি'], coordinates: [90.2600, 23.8550] },
      { name: 'Hemayetpur', banglaName: 'হেমায়েতপুর', aliases: ['hemayetpur', 'হেমায়েতপুর বাসস্ট্যান্ড', 'ট্যানারি মোড় হেমায়েতপুর'], coordinates: [90.2780, 23.7950] },
      { name: 'Radio Colony', banglaName: 'রেডিও কলোনি', aliases: ['radio colony', 'রেডিও কলোনি সাভার'], coordinates: [90.2620, 23.8480] },
      { name: 'Bank Town', banglaName: 'ব্যাংক টাউন', aliases: ['bank town', 'ব্যাংক টাউন সাভার'], coordinates: [90.2690, 23.8390] },
    ],
  },

  // ==========================================
  // 33. ASHULIA & BAIPAIL (আশুলিয়া ও বাইপাইল)
  // ==========================================
  {
    name: 'Ashulia',
    banglaName: 'আশুলিয়া',
    aliases: ['ashulia', 'আশুলিয়া', 'baipail', 'বাইপাইল', 'depz', 'ডিইপিজেড', 'jamgora', 'জামগড়া', 'zirabo', 'জিরাবো', 'nabinagar', 'নবীনগর'],
    coordinates: [90.3200, 23.9000],
    subAreas: [
      { name: 'Ashulia Bazar', banglaName: 'আশুলিয়া বাজার', aliases: ['ashulia bazar', 'বেড়িবাঁধ আশুলিয়া'], coordinates: [90.3200, 23.9000] },
      { name: 'Baipail', banglaName: 'বাইপাইল', aliases: ['baipail', 'বাইপাইল ত্রিমোড়', 'বাইপাইল বাসস্ট্যান্ড'], coordinates: [90.2700, 23.9350] },
      { name: 'DEPZ', banglaName: 'ডিইপিজেড', aliases: ['depz', 'ডিইপিজেড গেট', 'ইপিজেড'], coordinates: [90.2800, 23.9400] },
      { name: 'Jamgora', banglaName: 'জামগড়া', aliases: ['jamgora', 'জামগড়া চৌরাস্তা'], coordinates: [90.3150, 23.9200] },
      { name: 'Zirabo', banglaName: 'জিরাবো', aliases: ['zirabo', 'জিরাবো বাজার'], coordinates: [90.3350, 23.9100] },
      { name: 'Nabinagar', banglaName: 'নবীনগর', aliases: ['nabinagar', 'জাতীয় স্মৃতিসৌধ সংলগ্ন'], coordinates: [90.2550, 23.9100] },
    ],
  },

  // ==========================================
  // 34. TONGI & GAZIPUR (টঙ্গী ও গাজীপুর)
  // ==========================================
  {
    name: 'Gazipur',
    banglaName: 'গাজীপুর',
    aliases: ['gazipur', 'গাজীপুর', 'tongi', 'টঙ্গী', 'board bazar', 'বোর্ড বাজার', 'chowrasta', 'চৌরাস্তা', 'konabari', 'কোনাবাড়ী'],
    coordinates: [90.4203, 23.9999],
    subAreas: [
      { name: 'Tongi', banglaName: 'টঙ্গী', aliases: ['tongi', 'টঙ্গী স্টেশন রোড', 'টঙ্গী বাজার', 'চেরাগ আলী', 'কলেজ গেট'], coordinates: [90.4000, 23.8900] },
      { name: 'Board Bazar', banglaName: 'বোর্ড বাজার', aliases: ['board bazar', 'বোর্ড বাজার ইসলামিক বিশ্ববিদ্যালয়'], coordinates: [90.3950, 23.9500] },
      { name: 'Gazipur Chowrasta', banglaName: 'গাজীপুর চৌরাস্তা', aliases: ['gazipur chowrasta', 'চান্দনা চৌরাস্তা'], coordinates: [90.3950, 23.9900] },
      { name: 'Konabari', banglaName: 'কোনাবাড়ী', aliases: ['konabari', 'কোনাবাড়ী বিসিক'], coordinates: [90.3250, 24.0100] },
    ],
  },

  // ==========================================
  // 35. NARAYANGANJ & SIGNBOARD (নারায়ণগঞ্জ ও সাইনবোর্ড)
  // ==========================================
  {
    name: 'Narayanganj',
    banglaName: 'নারায়ণগঞ্জ',
    aliases: ['narayanganj', 'নারায়ণগঞ্জ', 'chashara', 'চাষাড়া', 'signboard', 'সাইনবোর্ড', 'shiddhirganj', 'সিদ্ধিরগঞ্জ', 'fatullah', 'ফতুল্লা'],
    coordinates: [90.5000, 23.6238],
    subAreas: [
      { name: 'Chashara', banglaName: 'চাষাড়া', aliases: ['chashara', 'চাষাড়া গোলচত্বর', 'চাষাড়া রেলওয়ে স্টেশন'], coordinates: [90.4990, 23.6240] },
      { name: 'Signboard', banglaName: 'সাইনবোর্ড', aliases: ['signboard', 'সাইনবোর্ড মোড়', 'ঢাকা-চট্টগ্রাম হাইওয়ে সংলগ্ন'], coordinates: [90.4780, 23.6820] },
      { name: 'Shiddhirganj', banglaName: 'সিদ্ধিরগঞ্জ', aliases: ['shiddhirganj', 'সিদ্ধিরগঞ্জ পুল', 'কাঁচপুর ব্রিজ সংলগ্ন'], coordinates: [90.5150, 23.6700] },
      { name: 'Fatullah', banglaName: 'ফতুল্লা', aliases: ['fatullah', 'ফতুল্লা স্টেডিয়াম সংলগ্ন', 'পঞ্চবটী'], coordinates: [90.4850, 23.6500] },
    ],
  },

  // ==========================================
  // 36. CHITTAGONG / CHATTOGRAM (চট্টগ্রাম)
  // ==========================================
  {
    name: 'Chittagong',
    banglaName: 'চট্টগ্রাম',
    aliases: ['chittagong', 'chattogram', 'চট্টগ্রাম', 'agrabad', 'আগ্রাবাদ', 'gec', 'জিইসি', 'nasirabad', 'নাসিরাবাদ', 'khulshi', 'খুলশী', 'halishahar', 'হালিশহর', 'chawkbazar ctg'],
    coordinates: [91.7832, 22.3569],
    subAreas: [
      { name: 'GEC Circle', banglaName: 'জিইসি মোড়', aliases: ['gec', 'জিইসি মোড়', 'খুলশী সংলগ্ন'], coordinates: [91.8210, 22.3580] },
      { name: 'Agrabad', banglaName: 'আগ্রাবাদ', aliases: ['agrabad', 'আগ্রাবাদ বা/এ', 'বাদামতলী মোড়'], coordinates: [91.8120, 22.3270] },
      { name: 'Nasirabad', banglaName: 'নাসিরাবাদ', aliases: ['nasirabad', 'নাসিরাবাদ হাউজিং'], coordinates: [91.8190, 22.3700] },
      { name: 'Halishahar', banglaName: 'হালিশহর', aliases: ['halishahar', 'হালিশহর হাউজিং এস্টেট', 'বড়পুল'], coordinates: [91.7850, 22.3380] },
      { name: 'Chawkbazar Ctg', banglaName: 'চকবাজার চট্টগ্রাম', aliases: ['chawkbazar ctg', 'চকবাজার চিটাগাং', 'গুলজার মোড়'], coordinates: [91.8380, 22.3580] },
    ],
  },

  // ==========================================
  // 37. SYLHET (সিলেট)
  // ==========================================
  {
    name: 'Sylhet',
    banglaName: 'সিলেট',
    aliases: ['sylhet', 'সিলেট', 'zindabazar', 'জিন্দাবাজার', 'amberkhana', 'আম্বরখানা', 'subidbazar', 'সুবিদবাজার', 'shahi eidgah', 'শাহী ঈদগাহ'],
    coordinates: [91.8687, 24.8949],
    subAreas: [
      { name: 'Zindabazar', banglaName: 'জিন্দাবাজার', aliases: ['zindabazar', 'জিন্দাবাজার পয়েন্ট'], coordinates: [91.8690, 24.8960] },
      { name: 'Amberkhana', banglaName: 'আম্বরখানা', aliases: ['amberkhana', 'আম্বরখানা পয়েন্ট'], coordinates: [91.8680, 24.9080] },
      { name: 'Subidbazar', banglaName: 'সুবিদবাজার', aliases: ['subidbazar', 'সুবিদবাজার পয়েন্ট'], coordinates: [91.8550, 24.9020] },
      { name: 'Shahi Eidgah', banglaName: 'শাহী ঈদগাহ', aliases: ['shahi eidgah', 'টিলাগড় সংলগ্ন'], coordinates: [91.8800, 24.9050] },
    ],
  },

  // ==========================================
  // 38. RAJSHAHI (রাজশাহী)
  // ==========================================
  {
    name: 'Rajshahi',
    banglaName: 'রাজশাহী',
    aliases: ['rajshahi', 'রাজশাহী', 'motihar', 'মতিহার', 'shaheb bazar', 'সাহেব বাজার', 'kazla', 'কাজলা'],
    coordinates: [88.6241, 24.3636],
    subAreas: [
      { name: 'Shaheb Bazar', banglaName: 'সাহেব বাজার', aliases: ['shaheb bazar', 'সাহেব বাজার জিরো পয়েন্ট'], coordinates: [88.6010, 24.3670] },
      { name: 'Motihar', banglaName: 'মতিহার', aliases: ['motihar', 'রাবি ক্যাম্পাস সংলগ্ন', 'কাজলা'], coordinates: [88.6360, 24.3680] },
    ],
  },

  // ==========================================
  // 39. KHULNA (খুলনা)
  // ==========================================
  {
    name: 'Khulna',
    banglaName: 'খুলনা',
    aliases: ['khulna', 'খুলনা', 'sonadanga', 'সোনাডাঙ্গা', 'khalishpur', 'খালিশপুর', 'daulatpur', 'দৌলতপুর'],
    coordinates: [89.5403, 22.8456],
    subAreas: [
      { name: 'Sonadanga', banglaName: 'সোনাডাঙ্গা', aliases: ['sonadanga', 'সোনাডাঙ্গা বাস টার্মিনাল', 'সোনাডাঙ্গা আবাসিক'], coordinates: [89.5370, 22.8220] },
      { name: 'Khalishpur', banglaName: 'খালিশপুর', aliases: ['khalishpur', 'খালিশপুর হাউজিং'], coordinates: [89.5350, 22.8600] },
      { name: 'Daulatpur', banglaName: 'দৌলতপুর', aliases: ['daulatpur', 'দৌলতপুর বাজার'], coordinates: [89.5200, 22.8800] },
    ],
  },

  // ==========================================
  // 40. BARISAL (বরিশাল)
  // ==========================================
  {
    name: 'Barisal',
    banglaName: 'বরিশাল',
    aliases: ['barisal', 'barishal', 'বরিশাল', 'sadar road', 'সদর রোড', 'rupatali', 'রূপাতলী', 'natun bazar barisal'],
    coordinates: [90.3696, 22.7010],
    subAreas: [
      { name: 'Sadar Road', banglaName: 'সদর রোড', aliases: ['sadar road', 'সদর রোড বরিশাল'], coordinates: [90.3700, 22.7030] },
      { name: 'Rupatali', banglaName: 'রূপাতলী', aliases: ['rupatali', 'রূপাতলী বাস টার্মিনাল'], coordinates: [90.3500, 22.6800] },
    ],
  },

  // ==========================================
  // 41. RANGPUR (রংপুর)
  // ==========================================
  {
    name: 'Rangpur',
    banglaName: 'রংপুর',
    aliases: ['rangpur', 'রংপুর', 'dhap', 'ধাপ', 'lalbagh rangpur', 'জাহাজ কোম্পানি মোড়'],
    coordinates: [89.2444, 25.7439],
    subAreas: [
      { name: 'Dhap', banglaName: 'ধাপ', aliases: ['dhap', 'ধাপ মেডিকেল মোড়'], coordinates: [89.2300, 25.7550] },
      { name: 'Jahaj Company', banglaName: 'জাহাজ কোম্পানি মোড়', aliases: ['jahaj company', 'পায়রা চত্বর'], coordinates: [89.2480, 25.7450] },
    ],
  },

  // ==========================================
  // 42. MYMENSINGH (ময়মনসিংহ)
  // ==========================================
  {
    name: 'Mymensingh',
    banglaName: 'ময়মনসিংহ',
    aliases: ['mymensingh', 'ময়মনসিংহ', 'ganginar par', 'গাঙ্গিনার পাড়', 'charpara', 'চরপাড়া', 'town hall mymensingh'],
    coordinates: [90.4049, 24.7471],
    subAreas: [
      { name: 'Charpara', banglaName: 'চরপাড়া', aliases: ['charpara', 'মেডিকেল মোড় ময়মনসিংহ'], coordinates: [90.4100, 24.7380] },
      { name: 'Ganginar Par', banglaName: 'গাঙ্গিনার পাড়', aliases: ['ganginar par', 'গাঙ্গিনার পাড় মোড়'], coordinates: [90.4050, 24.7520] },
    ],
  },

  // ==========================================
  // 43. COMILLA (কুমিল্লা)
  // ==========================================
  {
    name: 'Comilla',
    banglaName: 'কুমিল্লা',
    aliases: ['comilla', 'cumilla', 'কুমিল্লা', 'kandirpar', 'কান্দিরপাড়', 'shashangachha', 'শাসনগাছা', 'badurtala', 'বাদুড়তলা'],
    coordinates: [91.1809, 23.4607],
    subAreas: [
      { name: 'Kandirpar', banglaName: 'কান্দিরপাড়', aliases: ['kandirpar', 'কান্দিরপাড় টাউন হল'], coordinates: [91.1810, 23.4610] },
      { name: 'Shashangachha', banglaName: 'শাসনগাছা', aliases: ['shashangachha', 'শাসনগাছা বাস টার্মিনাল'], coordinates: [91.1710, 23.4680] },
    ],
  },
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
 * @param {number} [maxDistanceKm=20] - Maximum acceptable distance
 * @returns {{ area: string, banglaName: string, subArea: string|null, distanceKm: number } | null}
 */
function detectAreaFromCoordinates(lat, lng, maxDistanceKm = 20) {
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
      if (subDist < minSubAreaDist && subDist <= 3.5) {
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

module.exports = {
  BD_AREAS,
  getHaversineDistanceKm,
  detectAreaFromCoordinates,
  getCoordinatesForArea,
  buildAreaRegexPattern,
  buildSubAreaRegexPattern,
};
