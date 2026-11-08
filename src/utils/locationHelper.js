/**
 * Location Helper for Smart Location-Aware Property Listing in Varatia
 * Provides area dictionary, coordinates mapping, reverse geocoding via Haversine distance,
 * and fuzzy English-Bangla area keyword matching.
 */

// Major areas in Bangladesh (focused on Dhaka & major metropolitan cities)
const BD_AREAS = [
  {
    name: 'Mirpur',
    banglaName: 'মিরপুর',
    aliases: ['mirpur', 'মিরপুর', 'pallabi', 'পল্লবী', 'kazipara', 'কাজীপাড়া', 'shewrapara', 'শেওড়াপাড়া', 'rupnagar', 'রুপনগর'],
    coordinates: [90.3685, 23.8067], // [lng, lat]
    subAreas: [
      { name: 'Section 1', banglaName: 'সেকশন ১', aliases: ['section 1', 'sec 1', '১', 'সেকশন ১'], coordinates: [90.3533, 23.7956] },
      { name: 'Section 2', banglaName: 'সেকশন ২', aliases: ['section 2', 'sec 2', '২', 'সেকশন ২'], coordinates: [90.3582, 23.8031] },
      { name: 'Section 6', banglaName: 'সেকশন ৬', aliases: ['section 6', 'sec 6', '৬', 'সেকশন ৬'], coordinates: [90.3644, 23.8123] },
      { name: 'Section 7', banglaName: 'সেকশন ৭', aliases: ['section 7', 'sec 7', '৭', 'সেকশন ৭'], coordinates: [90.3670, 23.8160] },
      { name: 'Section 10', banglaName: 'সেকশন ১০', aliases: ['section 10', 'sec 10', '১০', 'সেকশন ১০', 'গোলচত্বর'], coordinates: [90.3685, 23.8067] },
      { name: 'Section 11', banglaName: 'সেকশন ১১', aliases: ['section 11', 'sec 11', '১১', 'সেকশন ১১'], coordinates: [90.3705, 23.8197] },
      { name: 'Section 12', banglaName: 'সেকশন ১২', aliases: ['section 12', 'sec 12', '১২', 'সেকশন ১২'], coordinates: [90.3639, 23.8273] },
      { name: 'Section 13', banglaName: 'সেকশন ১৩', aliases: ['section 13', 'sec 13', '১৩', 'সেকশন ১৩'], coordinates: [90.3768, 23.8080] },
      { name: 'Section 14', banglaName: 'সেকশন ১৪', aliases: ['section 14', 'sec 14', '১৪', 'সেকশন ১৪'], coordinates: [90.3855, 23.8010] },
      { name: 'Mirpur DOHS', banglaName: 'মিরপুর ডিওএইচএস', aliases: ['dohs', 'ডিওএইচএস'], coordinates: [90.3725, 23.8340] },
      { name: 'Kazipara', banglaName: 'কাজীপাড়া', aliases: ['kazipara', 'কাজীপাড়া'], coordinates: [90.3723, 23.7925] },
      { name: 'Shewrapara', banglaName: 'শেওড়াপাড়া', aliases: ['shewrapara', 'শেওড়াপাড়া'], coordinates: [90.3735, 23.7845] },
    ],
  },
  {
    name: 'Dhanmondi',
    banglaName: 'ধানমন্ডি',
    aliases: ['dhanmondi', 'ধানমন্ডি', 'jigatola', 'জিগাতলা', 'kalabagan', 'কলাবাগান', 'sobhanbag', 'শোভনবাগ', 'shankar', 'শংকর'],
    coordinates: [90.3742, 23.7465],
    subAreas: [
      { name: 'Dhanmondi 27', banglaName: 'ধানমন্ডি ২৭', aliases: ['27', '২৭', 'road 27'], coordinates: [90.3720, 23.7540] },
      { name: 'Dhanmondi 32', banglaName: 'ধানমন্ডি ৩২', aliases: ['32', '৩২', 'road 32'], coordinates: [90.3780, 23.7510] },
      { name: 'Jigatola', banglaName: 'জিগাতলা', aliases: ['jigatola', 'জিগাতলা'], coordinates: [90.3690, 23.7410] },
      { name: 'Kalabagan', banglaName: 'কলাবাগান', aliases: ['kalabagan', 'কলাবাগান'], coordinates: [90.3810, 23.7490] },
      { name: 'Shankar', banglaName: 'শংকর', aliases: ['shankar', 'শংকর'], coordinates: [90.3660, 23.7500] },
    ],
  },
  {
    name: 'Uttara',
    banglaName: 'উত্তরা',
    aliases: ['uttara', 'উত্তরা', 'diabari', 'দিয়াবাড়ি', 'azampur', 'আজমপুর', 'jasimuddin', 'জসীমউদদীন'],
    coordinates: [90.3978, 23.8759],
    subAreas: [
      { name: 'Sector 1', banglaName: 'সেক্টর ১', aliases: ['sector 1', 'sec 1', 'সেক্টর ১', '১'], coordinates: [90.3980, 23.8630] },
      { name: 'Sector 3', banglaName: 'সেক্টর ৩', aliases: ['sector 3', 'sec 3', 'সেক্টর ৩', '৩', 'jasimuddin'], coordinates: [90.3990, 23.8680] },
      { name: 'Sector 4', banglaName: 'সেক্টর ৪', aliases: ['sector 4', 'sec 4', 'সেক্টর ৪', '৪'], coordinates: [90.4040, 23.8690] },
      { name: 'Sector 7', banglaName: 'সেক্টর ৭', aliases: ['sector 7', 'sec 7', 'সেক্টর ৭', '৭'], coordinates: [90.3980, 23.8760] },
      { name: 'Sector 9', banglaName: 'সেক্টর ৯', aliases: ['sector 9', 'sec 9', 'সেক্টর ৯', '৯'], coordinates: [90.3950, 23.8810] },
      { name: 'Sector 10', banglaName: 'সেক্টর ১০', aliases: ['sector 10', 'sec 10', 'সেক্টর ১০', '১০'], coordinates: [90.3880, 23.8820] },
      { name: 'Sector 11', banglaName: 'সেক্টর ১১', aliases: ['sector 11', 'sec 11', 'সেক্টর ১১', '১১'], coordinates: [90.3870, 23.8750] },
      { name: 'Sector 12', banglaName: 'সেক্টর ১২', aliases: ['sector 12', 'sec 12', 'সেক্টর ১২', '১২'], coordinates: [90.3830, 23.8770] },
      { name: 'Sector 13', banglaName: 'সেক্টর ১৩', aliases: ['sector 13', 'sec 13', 'সেক্টর ১৩', '১৩'], coordinates: [90.3850, 23.8700] },
      { name: 'Sector 14', banglaName: 'সেক্টর ১৪', aliases: ['sector 14', 'sec 14', 'সেক্টর ১৪', '১৪'], coordinates: [90.3830, 23.8650] },
      { name: 'Diabari', banglaName: 'দিয়াবাড়ি', aliases: ['diabari', 'দিয়াবাড়ি', 'metro'], coordinates: [90.3700, 23.8780] },
    ],
  },
  {
    name: 'Mohammadpur',
    banglaName: 'মোহাম্মদপুর',
    aliases: ['mohammadpur', 'মোহাম্মদপুর', 'bosila', 'বসিলা', 'ring road', 'রিং রোড', 'tajmahal', 'তাজমহল'],
    coordinates: [90.3584, 23.7658],
    subAreas: [
      { name: 'Ring Road', banglaName: 'রিং রোড', aliases: ['ring road', 'রিং রোড'], coordinates: [90.3600, 23.7710] },
      { name: 'Town Hall', banglaName: 'টাউন হল', aliases: ['town hall', 'টাউন হল'], coordinates: [90.3640, 23.7610] },
      { name: 'Tajmahal Road', banglaName: 'তাজমহল রোড', aliases: ['tajmahal', 'তাজমহল'], coordinates: [90.3620, 23.7640] },
      { name: 'Japan Garden City', banglaName: 'জাপান গার্ডেন সিটি', aliases: ['japan garden', 'জাপান গার্ডেন'], coordinates: [90.3580, 23.7720] },
      { name: 'Bosila', banglaName: 'বসিলা', aliases: ['bosila', 'বসিলা'], coordinates: [90.3390, 23.7550] },
    ],
  },
  {
    name: 'Gulshan',
    banglaName: 'গুলশান',
    aliases: ['gulshan', 'গুলশান', 'niketan', 'নিকেতন', 'police plaza'],
    coordinates: [90.4152, 23.7925],
    subAreas: [
      { name: 'Gulshan 1', banglaName: 'গুলশান ১', aliases: ['gulshan 1', 'গুলশান ১', '১'], coordinates: [90.4180, 23.7800] },
      { name: 'Gulshan 2', banglaName: 'গুলশান ২', aliases: ['gulshan 2', 'গুলশান ২', '২'], coordinates: [90.4150, 23.7930] },
      { name: 'Niketan', banglaName: 'নিকেতন', aliases: ['niketan', 'নিকেতন'], coordinates: [90.4100, 23.7760] },
    ],
  },
  {
    name: 'Banani',
    banglaName: 'বনানী',
    aliases: ['banani', 'বনানী', 'kakoli', 'কাকলী', 'chairman bari'],
    coordinates: [90.4043, 23.7937],
    subAreas: [
      { name: 'Road 11', banglaName: 'রোড ১১', aliases: ['road 11', '১১ নম্বর রোড'], coordinates: [90.4030, 23.7940] },
      { name: 'Banani DOHS', banglaName: 'বনানী ডিওএইচএস', aliases: ['banani dohs', 'ডিওএইচএস'], coordinates: [90.3990, 23.7980] },
      { name: 'Kakoli', banglaName: 'কাকলী', aliases: ['kakoli', 'কাকলী'], coordinates: [90.4010, 23.7900] },
    ],
  },
  {
    name: 'Badda',
    banglaName: 'বাড্ডা',
    aliases: ['badda', 'বাড্ডা', 'aftabnagar', 'আফতাবনগর', 'merul', 'মেরুল বাড্ডা'],
    coordinates: [90.4267, 23.7806],
    subAreas: [
      { name: 'Aftabnagar', banglaName: 'আফতাবনগর', aliases: ['aftabnagar', 'আফতাবনগর'], coordinates: [90.4350, 23.7680] },
      { name: 'Middle Badda', banglaName: 'মধ্য বাড্ডা', aliases: ['middle badda', 'মধ্য বাড্ডা'], coordinates: [90.4270, 23.7810] },
      { name: 'South Badda', banglaName: 'দক্ষিণ বাড্ডা', aliases: ['south badda', 'দক্ষিণ বাড্ডা'], coordinates: [90.4240, 23.7740] },
      { name: 'Merul Badda', banglaName: 'মেরুল বাড্ডা', aliases: ['merul badda', 'মেরুল'], coordinates: [90.4210, 23.7690] },
    ],
  },
  {
    name: 'Bashundhara R/A',
    banglaName: 'বসুন্ধরা আ/এ',
    aliases: ['bashundhara', 'বসুন্ধরা', 'residential area', 'r/a', 'আবাসিক এলাকা'],
    coordinates: [90.4326, 23.8164],
    subAreas: [
      { name: 'Block A', banglaName: 'ব্লক এ', aliases: ['block a', 'ব্লক এ'], coordinates: [90.4270, 23.8110] },
      { name: 'Block B', banglaName: 'ব্লক বি', aliases: ['block b', 'ব্লক বি'], coordinates: [90.4290, 23.8140] },
      { name: 'Block C', banglaName: 'ব্লক সি', aliases: ['block c', 'ব্লক সি'], coordinates: [90.4320, 23.8170] },
      { name: 'Block D', banglaName: 'ব্লক ডি', aliases: ['block d', 'ব্লক ডি'], coordinates: [90.4360, 23.8200] },
      { name: 'Block I', banglaName: 'ব্লক আই', aliases: ['block i', 'ব্লক আই'], coordinates: [90.4430, 23.8240] },
    ],
  },
  {
    name: 'Baridhara',
    banglaName: 'বারিধারা',
    aliases: ['baridhara', 'বারিধারা'],
    coordinates: [90.4200, 23.8000],
    subAreas: [
      { name: 'Baridhara DOHS', banglaName: 'বারিধারা ডিওএইচএস', aliases: ['dohs', 'ডিওএইচএস'], coordinates: [90.4150, 23.8120] },
      { name: 'Diplomatic Zone', banglaName: 'কূটনৈতিক এলাকা', aliases: ['diplomatic', 'কূটনৈতিক'], coordinates: [90.4210, 23.7990] },
    ],
  },
  {
    name: 'Khilgaon',
    banglaName: 'খিলগাঁও',
    aliases: ['khilgaon', 'খিলগাঁও', 'taltola', 'তালতলা', 'goran', 'গোড়ান', 'sipahibagh'],
    coordinates: [90.4227, 23.7505],
    subAreas: [
      { name: 'Taltola', banglaName: 'তালতলা', aliases: ['taltola', 'তালতলা'], coordinates: [90.4220, 23.7530] },
      { name: 'Goran', banglaName: 'গোড়ান', aliases: ['goran', 'গোড়ান'], coordinates: [90.4310, 23.7520] },
    ],
  },
  {
    name: 'Rampura',
    banglaName: 'রামপুরা',
    aliases: ['rampura', 'রামপুরা', 'banasree', 'বনশ্রী'],
    coordinates: [90.4208, 23.7612],
    subAreas: [
      { name: 'Banasree', banglaName: 'বনশ্রী', aliases: ['banasree', 'বনশ্রী'], coordinates: [90.4340, 23.7620] },
      { name: 'TV Station', banglaName: 'টিভি সেন্টার', aliases: ['tv station', 'টিভি সেন্টার'], coordinates: [90.4190, 23.7640] },
    ],
  },
  {
    name: 'Farmgate',
    banglaName: 'ফার্মগেট',
    aliases: ['farmgate', 'ফার্মগেট', 'tejgaon', 'তেজগাঁও', 'indira road', 'ইন্দিরা রোড', 'green road', 'গ্রীন রোড'],
    coordinates: [90.3888, 23.7570],
    subAreas: [
      { name: 'Indira Road', banglaName: 'ইন্দিরা রোড', aliases: ['indira road', 'ইন্দিরা রোড'], coordinates: [90.3850, 23.7580] },
      { name: 'Green Road', banglaName: 'গ্রীন রোড', aliases: ['green road', 'গ্রীন রোড'], coordinates: [90.3840, 23.7480] },
      { name: 'Monipuripara', banglaName: 'মণিপুরীপাড়া', aliases: ['monipuripara', 'মণিপুরীপাড়া'], coordinates: [90.3810, 23.7620] },
      { name: 'Nakhalpara', banglaName: 'নাখালপাড়া', aliases: ['nakhalpara', 'নাখালপাড়া'], coordinates: [90.3950, 23.7690] },
    ],
  },
  {
    name: 'Malibagh',
    banglaName: 'মালিবাগ',
    aliases: ['malibagh', 'মালিবাগ', 'mouchak', 'মৌচাক', 'shantinagar', 'শান্তিনগর', 'bailey road'],
    coordinates: [90.4116, 23.7441],
    subAreas: [
      { name: 'Mouchak', banglaName: 'মৌচাক', aliases: ['mouchak', 'মৌচাক'], coordinates: [90.4100, 23.7460] },
      { name: 'Shantinagar', banglaName: 'শান্তিনগর', aliases: ['shantinagar', 'শান্তিনগর'], coordinates: [90.4120, 23.7390] },
      { name: 'Chowdhury Para', banglaName: 'চৌধুরীপাড়া', aliases: ['chowdhury para', 'চৌধুরীপাড়া'], coordinates: [90.4150, 23.7520] },
    ],
  },
  {
    name: 'Motijheel',
    banglaName: 'মতিঝিল',
    aliases: ['motijheel', 'মতিঝিল', 'paltan', 'পল্টন', 'dilkusha', 'দিলকুশা', 'fakirapool'],
    coordinates: [90.4172, 23.7330],
    subAreas: [
      { name: 'Paltan', banglaName: 'পল্টন', aliases: ['paltan', 'পল্টন'], coordinates: [90.4110, 23.7340] },
      { name: 'Dilkusha', banglaName: 'দিলকুশা', aliases: ['dilkusha', 'দিলকুশা'], coordinates: [90.4190, 23.7310] },
    ],
  },
  {
    name: 'Old Dhaka',
    banglaName: 'পুরান ঢাকা',
    aliases: ['old dhaka', 'পুরান ঢাকা', 'lalbagh', 'লালবাগ', 'chawkbazar', 'চকবাজার', 'wari', 'ওয়ারী', 'sadarghat'],
    coordinates: [90.3887, 23.7176],
    subAreas: [
      { name: 'Lalbagh', banglaName: 'লালবাগ', aliases: ['lalbagh', 'লালবাগ'], coordinates: [90.3880, 23.7180] },
      { name: 'Wari', banglaName: 'ওয়ারী', aliases: ['wari', 'ওয়ারী'], coordinates: [90.4200, 23.7170] },
      { name: 'Chawkbazar', banglaName: 'চকবাজার', aliases: ['chawkbazar', 'চকবাজার'], coordinates: [90.3950, 23.7150] },
    ],
  },
  {
    name: 'Khilkhet',
    banglaName: 'খিলক্ষেত',
    aliases: ['khilkhet', 'খিলক্ষেত', 'nikunja', 'নিকুঞ্জ'],
    coordinates: [90.4206, 23.8293],
    subAreas: [
      { name: 'Nikunja 1', banglaName: 'নিকুঞ্জ ১', aliases: ['nikunja 1', 'নিকুঞ্জ ১'], coordinates: [90.4170, 23.8250] },
      { name: 'Nikunja 2', banglaName: 'নিকুঞ্জ ২', aliases: ['nikunja 2', 'নিকুঞ্জ ২'], coordinates: [90.4190, 23.8320] },
    ],
  },
  {
    name: 'Jatrabari',
    banglaName: 'যাত্রাবাড়ী',
    aliases: ['jatrabari', 'যাত্রাবাড়ী', 'sayedabad', 'সায়েদাবাদ', 'donia', 'শনির আখড়া'],
    coordinates: [90.4349, 23.7104],
    subAreas: [
      { name: 'Sayedabad', banglaName: 'সায়েদাবাদ', aliases: ['sayedabad', 'সায়েদাবাদ'], coordinates: [90.4280, 23.7150] },
      { name: 'Shanir Akhra', banglaName: 'শনির আখড়া', aliases: ['shanir akhra', 'শনির আখড়া'], coordinates: [90.4490, 23.7050] },
    ],
  },
  {
    name: 'Savar',
    banglaName: 'সাভার',
    aliases: ['savar', 'সাভার', 'ashulia', 'আশুলিয়া'],
    coordinates: [90.2667, 23.8583],
    subAreas: [
      { name: 'Ashulia', banglaName: 'আশুলিয়া', aliases: ['ashulia', 'আশুলিয়া'], coordinates: [90.3200, 23.9000] },
      { name: 'Savar Bazar', banglaName: 'সাভার বাজার', aliases: ['savar bazar', 'সাভার বাজার'], coordinates: [90.2600, 23.8550] },
    ],
  },
  {
    name: 'Gazipur',
    banglaName: 'গাজীপুর',
    aliases: ['gazipur', 'গাজীপুর', 'tongi', 'টঙ্গী', 'board bazar', 'বোর্ড বাজার'],
    coordinates: [90.4203, 23.9999],
    subAreas: [
      { name: 'Tongi', banglaName: 'টঙ্গী', aliases: ['tongi', 'টঙ্গী'], coordinates: [90.4000, 23.8900] },
      { name: 'Board Bazar', banglaName: 'বোর্ড বাজার', aliases: ['board bazar', 'বোর্ড বাজার'], coordinates: [90.3950, 23.9500] },
    ],
  },
  {
    name: 'Narayanganj',
    banglaName: 'নারায়ণগঞ্জ',
    aliases: ['narayanganj', 'নারায়ণগঞ্জ', 'chashara', 'চাষাড়া'],
    coordinates: [90.5000, 23.6238],
    subAreas: [
      { name: 'Chashara', banglaName: 'চাষাড়া', aliases: ['chashara', 'চাষাড়া'], coordinates: [90.4990, 23.6240] },
      { name: 'Signboard', banglaName: 'সাইনবোর্ড', aliases: ['signboard', 'সাইনবোর্ড'], coordinates: [90.4780, 23.6820] },
    ],
  },
  {
    name: 'Chittagong',
    banglaName: 'চট্টগ্রাম',
    aliases: ['chittagong', 'chattogram', 'চট্টগ্রাম', 'agrabad', 'অ্যাগ্রাবাদ', 'gec', 'জিইসি', 'nasirabad', 'খুলশী'],
    coordinates: [91.7832, 22.3569],
    subAreas: [
      { name: 'GEC Circle', banglaName: 'জিইসি মোড়', aliases: ['gec', 'জিইসি'], coordinates: [91.8210, 22.3580] },
      { name: 'Agrabad', banglaName: 'আগ্রাবাদ', aliases: ['agrabad', 'আগ্রাবাদ'], coordinates: [91.8120, 22.3270] },
      { name: 'Nasirabad', banglaName: 'নাসিরাবাদ', aliases: ['nasirabad', 'নাসিরাবাদ'], coordinates: [91.8190, 22.3700] },
      { name: 'Halishahar', banglaName: 'হালিশহর', aliases: ['halishahar', 'হালিশহর'], coordinates: [91.7850, 22.3380] },
    ],
  },
  {
    name: 'Sylhet',
    banglaName: 'সিলেট',
    aliases: ['sylhet', 'সিলেট', 'zindabazar', 'জিন্দাবাজার', 'amberkhana', 'আম্বরখানা'],
    coordinates: [91.8687, 24.8949],
    subAreas: [
      { name: 'Zindabazar', banglaName: 'জিন্দাবাজার', aliases: ['zindabazar', 'জিন্দাবাজার'], coordinates: [91.8690, 24.8960] },
      { name: 'Amberkhana', banglaName: 'আম্বরখানা', aliases: ['amberkhana', 'আম্বরখানা'], coordinates: [91.8680, 24.9080] },
    ],
  },
  {
    name: 'Rajshahi',
    banglaName: 'রাজশাহী',
    aliases: ['rajshahi', 'রাজশাহী', 'motihar', 'মতিহার', 'shaheb bazar'],
    coordinates: [88.6241, 24.3636],
    subAreas: [
      { name: 'Shaheb Bazar', banglaName: 'সাহেব বাজার', aliases: ['shaheb bazar', 'সাহেব বাজার'], coordinates: [88.6010, 24.3670] },
      { name: 'Motihar', banglaName: 'মতিহার', aliases: ['motihar', 'মতিহার'], coordinates: [88.6360, 24.3680] },
    ],
  },
  {
    name: 'Khulna',
    banglaName: 'খুলনা',
    aliases: ['khulna', 'খুলনা', 'sonadanga', 'সোনাডাঙ্গা', 'khalishpur'],
    coordinates: [89.5403, 22.8456],
    subAreas: [
      { name: 'Sonadanga', banglaName: 'সোনাডাঙ্গা', aliases: ['sonadanga', 'সোনাডাঙ্গা'], coordinates: [89.5370, 22.8220] },
      { name: 'Khalishpur', banglaName: 'খালিশপুর', aliases: ['khalishpur', 'খালিশপুর'], coordinates: [89.5350, 22.8600] },
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
 * @param {number} [maxDistanceKm=15] - Maximum acceptable distance
 * @returns {{ area: string, banglaName: string, subArea: string|null, distanceKm: number } | null}
 */
function detectAreaFromCoordinates(lat, lng, maxDistanceKm = 15) {
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
