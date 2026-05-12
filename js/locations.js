// Curated location database for Delhi NCR
// Covers Delhi, Gurugram (Gurgaon), Noida, Greater Noida, Faridabad, Ghaziabad
// Coordinates verified against OpenStreetMap

const LOCATIONS = [
  // ── Central Delhi ──────────────────────────────────────────────
  { name: 'Connaught Place (CP)',        area: 'Central Delhi',         lat: 28.6315, lon: 77.2167 },
  { name: 'India Gate',                  area: 'Central Delhi',         lat: 28.6129, lon: 77.2295 },
  { name: 'Janpath',                     area: 'Central Delhi',         lat: 28.6231, lon: 77.2152 },
  { name: 'Barakhamba Road',             area: 'Central Delhi',         lat: 28.6310, lon: 77.2250 },
  { name: 'Mandi House',                 area: 'Central Delhi',         lat: 28.6293, lon: 77.2313 },
  { name: 'New Delhi Railway Station',   area: 'Central Delhi',         lat: 28.6431, lon: 77.2194 },
  { name: 'Lodhi Colony',               area: 'Central Delhi',         lat: 28.5900, lon: 77.2270 },
  { name: 'Sundar Nagar',               area: 'Central Delhi',         lat: 28.5966, lon: 77.2340 },
  { name: 'Khan Market',                area: 'Central Delhi',         lat: 28.6000, lon: 77.2269 },

  // ── Old Delhi ──────────────────────────────────────────────────
  { name: 'Chandni Chowk',              area: 'Old Delhi',             lat: 28.6508, lon: 77.2298 },
  { name: 'Old Delhi (Lal Qila)',        area: 'Old Delhi',             lat: 28.6562, lon: 77.2410 },
  { name: 'Old Delhi Railway Station',  area: 'Old Delhi',             lat: 28.6594, lon: 77.2282 },
  { name: 'Kashmere Gate',              area: 'Old Delhi',             lat: 28.6668, lon: 77.2281 },
  { name: 'Jama Masjid',               area: 'Old Delhi',             lat: 28.6507, lon: 77.2334 },
  { name: 'Darya Ganj',                area: 'Old Delhi',             lat: 28.6396, lon: 77.2400 },
  { name: 'Sadar Bazar',               area: 'Old Delhi',             lat: 28.6558, lon: 77.2122 },

  // ── North Delhi ────────────────────────────────────────────────
  { name: 'Rohini Sector 3',            area: 'North Delhi',           lat: 28.7149, lon: 77.0659 },
  { name: 'Rohini Sector 7',            area: 'North Delhi',           lat: 28.7308, lon: 77.0794 },
  { name: 'Rohini Sector 10',           area: 'North Delhi',           lat: 28.7434, lon: 77.0897 },
  { name: 'Pitampura',                  area: 'North Delhi',           lat: 28.7005, lon: 77.1305 },
  { name: 'Shalimar Bagh',             area: 'North Delhi',           lat: 28.7206, lon: 77.1459 },
  { name: 'Ashok Vihar',               area: 'North Delhi',           lat: 28.6897, lon: 77.1693 },
  { name: 'Model Town',                area: 'North Delhi',           lat: 28.7174, lon: 77.1939 },
  { name: 'Azadpur',                   area: 'North Delhi',           lat: 28.7146, lon: 77.1882 },
  { name: 'Burari',                    area: 'North Delhi',           lat: 28.7658, lon: 77.2107 },
  { name: 'Bawana',                    area: 'North West Delhi',      lat: 28.7976, lon: 77.0316 },
  { name: 'Narela',                    area: 'North Delhi',           lat: 28.8453, lon: 77.0931 },
  { name: 'Alipur',                    area: 'North Delhi',           lat: 28.7970, lon: 77.1430 },
  { name: 'Mukherjee Nagar',           area: 'North Delhi',           lat: 28.7053, lon: 77.2007 },

  // ── South Delhi ────────────────────────────────────────────────
  { name: 'Hauz Khas',                 area: 'South Delhi',           lat: 28.5494, lon: 77.2007 },
  { name: 'Hauz Khas Village',         area: 'South Delhi',           lat: 28.5540, lon: 77.1984 },
  { name: 'Saket',                     area: 'South Delhi',           lat: 28.5244, lon: 77.2090 },
  { name: 'Malviya Nagar',             area: 'South Delhi',           lat: 28.5343, lon: 77.2105 },
  { name: 'Nehru Place',               area: 'South Delhi',           lat: 28.5488, lon: 77.2519 },
  { name: 'Greater Kailash 1 (GK1)',   area: 'South Delhi',           lat: 28.5449, lon: 77.2390 },
  { name: 'Greater Kailash 2 (GK2)',   area: 'South Delhi',           lat: 28.5304, lon: 77.2418 },
  { name: 'Lajpat Nagar',             area: 'South Delhi',           lat: 28.5672, lon: 77.2434 },
  { name: 'South Extension Part 1',    area: 'South Delhi',           lat: 28.5724, lon: 77.2200 },
  { name: 'South Extension Part 2',    area: 'South Delhi',           lat: 28.5695, lon: 77.2237 },
  { name: 'Defence Colony',            area: 'South Delhi',           lat: 28.5739, lon: 77.2357 },
  { name: 'Vasant Kunj',              area: 'South Delhi',           lat: 28.5204, lon: 77.1576 },
  { name: 'Vasant Vihar',             area: 'South Delhi',           lat: 28.5571, lon: 77.1696 },
  { name: 'Sarojini Nagar',           area: 'South Delhi',           lat: 28.5757, lon: 77.1990 },
  { name: 'RK Puram',                 area: 'South Delhi',           lat: 28.5637, lon: 77.1769 },
  { name: 'Munirka',                  area: 'South Delhi',           lat: 28.5538, lon: 77.1700 },
  { name: 'Mehrauli',                 area: 'South Delhi',           lat: 28.5218, lon: 77.1797 },
  { name: 'Chattarpur',               area: 'South Delhi',           lat: 28.4929, lon: 77.1620 },
  { name: 'Kalkaji',                  area: 'South Delhi',           lat: 28.5524, lon: 77.2583 },
  { name: 'Govindpuri',               area: 'South Delhi',           lat: 28.5388, lon: 77.2603 },
  { name: 'Okhla Phase 1',            area: 'South Delhi',           lat: 28.5491, lon: 77.2738 },
  { name: 'Okhla Phase 2',            area: 'South Delhi',           lat: 28.5400, lon: 77.2750 },
  { name: 'Jasola',                   area: 'South Delhi',           lat: 28.5470, lon: 77.2900 },
  { name: 'Badarpur',                 area: 'South Delhi',           lat: 28.5016, lon: 77.2968 },
  { name: 'Tughlakabad',              area: 'South Delhi',           lat: 28.4949, lon: 77.2661 },
  { name: 'Sangam Vihar',             area: 'South Delhi',           lat: 28.5009, lon: 77.2497 },
  { name: 'Pul Prahladpur',           area: 'South Delhi',           lat: 28.5278, lon: 77.2819 },

  // ── West Delhi ─────────────────────────────────────────────────
  { name: 'Dwarka Sector 1',          area: 'West Delhi',            lat: 28.5921, lon: 77.0460 },
  { name: 'Dwarka Sector 6',          area: 'West Delhi',            lat: 28.5874, lon: 77.0690 },
  { name: 'Dwarka Sector 10',         area: 'West Delhi',            lat: 28.5775, lon: 77.0596 },
  { name: 'Dwarka Sector 14',         area: 'West Delhi',            lat: 28.5629, lon: 77.0408 },
  { name: 'Dwarka Sector 21',         area: 'West Delhi',            lat: 28.5580, lon: 77.0591 },
  { name: 'Dwarka Mor',               area: 'West Delhi',            lat: 28.6119, lon: 77.0573 },
  { name: 'Janakpuri',                area: 'West Delhi',            lat: 28.6210, lon: 77.0852 },
  { name: 'Uttam Nagar',              area: 'West Delhi',            lat: 28.6111, lon: 77.0576 },
  { name: 'Vikaspuri',                area: 'West Delhi',            lat: 28.6345, lon: 77.0709 },
  { name: 'Paschim Vihar',            area: 'West Delhi',            lat: 28.6693, lon: 77.0973 },
  { name: 'Tilak Nagar',              area: 'West Delhi',            lat: 28.6369, lon: 77.0980 },
  { name: 'Rajouri Garden',           area: 'West Delhi',            lat: 28.6476, lon: 77.1213 },
  { name: 'Tagore Garden',            area: 'West Delhi',            lat: 28.6504, lon: 77.1062 },
  { name: 'Patel Nagar',              area: 'West Delhi',            lat: 28.6461, lon: 77.1694 },
  { name: 'Karol Bagh',               area: 'West Delhi',            lat: 28.6508, lon: 77.1905 },
  { name: 'Moti Nagar',               area: 'West Delhi',            lat: 28.6576, lon: 77.1492 },
  { name: 'Rajendra Nagar',           area: 'West Delhi',            lat: 28.6400, lon: 77.1773 },
  { name: 'Punjabi Bagh',             area: 'West Delhi',            lat: 28.6636, lon: 77.1235 },
  { name: 'Shakur Basti',             area: 'West Delhi',            lat: 28.6799, lon: 77.1360 },

  // ── East Delhi ─────────────────────────────────────────────────
  { name: 'Laxmi Nagar',              area: 'East Delhi',            lat: 28.6319, lon: 77.2788 },
  { name: 'Mayur Vihar Phase 1',      area: 'East Delhi',            lat: 28.6046, lon: 77.2961 },
  { name: 'Mayur Vihar Phase 2',      area: 'East Delhi',            lat: 28.6094, lon: 77.3137 },
  { name: 'Mayur Vihar Phase 3',      area: 'East Delhi',            lat: 28.6115, lon: 77.3310 },
  { name: 'Preet Vihar',              area: 'East Delhi',            lat: 28.6435, lon: 77.2997 },
  { name: 'Karkardooma',              area: 'East Delhi',            lat: 28.6637, lon: 77.3023 },
  { name: 'Anand Vihar',              area: 'East Delhi',            lat: 28.6461, lon: 77.3157 },
  { name: 'Vivek Vihar',              area: 'East Delhi',            lat: 28.6703, lon: 77.3148 },
  { name: 'Shahdara',                 area: 'East Delhi',            lat: 28.6745, lon: 77.2859 },
  { name: 'Dilshad Garden',           area: 'East Delhi',            lat: 28.6843, lon: 77.3132 },
  { name: 'Yamuna Vihar',             area: 'East Delhi',            lat: 28.7016, lon: 77.2896 },
  { name: 'Patparganj',               area: 'East Delhi',            lat: 28.6227, lon: 77.2977 },
  { name: 'IP Extension',             area: 'East Delhi',            lat: 28.6333, lon: 77.3027 },
  { name: 'Gandhinagar',              area: 'East Delhi',            lat: 28.6620, lon: 77.2789 },
  { name: 'Seemapuri',                area: 'East Delhi',            lat: 28.6865, lon: 77.3271 },

  // ── Delhi Landmarks / Airports ─────────────────────────────────
  { name: 'IGI Airport Terminal 1',   area: 'Delhi Airport',         lat: 28.5562, lon: 77.1000 },
  { name: 'IGI Airport Terminal 2',   area: 'Delhi Airport',         lat: 28.5590, lon: 77.0907 },
  { name: 'IGI Airport Terminal 3',   area: 'Delhi Airport',         lat: 28.5563, lon: 77.0868 },
  { name: 'Aerocity',                 area: 'Delhi Airport Zone',    lat: 28.5538, lon: 77.0938 },
  { name: 'AIIMS Delhi',              area: 'South Delhi',           lat: 28.5672, lon: 77.2100 },
  { name: 'Safdarjung Hospital',      area: 'Central Delhi',         lat: 28.5695, lon: 77.2027 },
  { name: 'Select City Walk Mall',    area: 'Saket, South Delhi',    lat: 28.5289, lon: 77.2198 },
  { name: 'DLF Mall of India',        area: 'Noida Sector 18',       lat: 28.5678, lon: 77.3232 },
  { name: 'Ambience Mall Vasant Kunj',area: 'Vasant Kunj, Delhi',    lat: 28.5177, lon: 77.1572 },

  // ── Gurugram (Gurgaon) ─────────────────────────────────────────
  { name: 'Cyber City (DLF Cyber Hub)', area: 'Gurugram',            lat: 28.4950, lon: 77.0879 },
  { name: 'Cyber Hub',                area: 'DLF, Gurugram',         lat: 28.4953, lon: 77.0893 },
  { name: 'MG Road Gurugram',         area: 'Gurugram',              lat: 28.4749, lon: 77.0600 },
  { name: 'IFFCO Chowk',              area: 'Gurugram',              lat: 28.4746, lon: 77.0716 },
  { name: 'Huda City Centre',         area: 'Gurugram',              lat: 28.4595, lon: 77.0726 },
  { name: 'Golf Course Road',         area: 'Gurugram',              lat: 28.4430, lon: 77.1040 },
  { name: 'Golf Course Extension Road', area: 'Gurugram',            lat: 28.4218, lon: 77.1093 },
  { name: 'Sohna Road',               area: 'Gurugram',              lat: 28.4231, lon: 77.0360 },
  { name: 'NH-48 Gurugram',           area: 'Gurugram',              lat: 28.4714, lon: 77.0263 },
  { name: 'Udyog Vihar Phase 1',      area: 'Gurugram',              lat: 28.5045, lon: 77.0893 },
  { name: 'Udyog Vihar Phase 4',      area: 'Gurugram',              lat: 28.5002, lon: 77.0870 },
  { name: 'DLF Phase 1',              area: 'Gurugram',              lat: 28.4809, lon: 77.0975 },
  { name: 'DLF Phase 2',              area: 'Gurugram',              lat: 28.4760, lon: 77.0979 },
  { name: 'DLF Phase 3',              area: 'Gurugram',              lat: 28.4784, lon: 77.0949 },
  { name: 'DLF Phase 4',              area: 'Gurugram',              lat: 28.4616, lon: 77.0770 },
  { name: 'DLF Phase 5',              area: 'Gurugram',              lat: 28.4386, lon: 77.1007 },
  { name: 'Sector 14 Gurugram',       area: 'Gurugram',              lat: 28.4729, lon: 77.0379 },
  { name: 'Sector 15 Gurugram',       area: 'Gurugram',              lat: 28.4783, lon: 77.0461 },
  { name: 'Sector 17 Gurugram',       area: 'Gurugram',              lat: 28.4655, lon: 77.0332 },
  { name: 'Sector 22 Gurugram',       area: 'Gurugram',              lat: 28.4611, lon: 77.0466 },
  { name: 'Sector 29 Gurugram',       area: 'Gurugram',              lat: 28.4634, lon: 77.0665 },
  { name: 'Sector 44 Gurugram',       area: 'Gurugram',              lat: 28.4529, lon: 77.0799 },
  { name: 'Sector 45 Gurugram',       area: 'Gurugram',              lat: 28.4448, lon: 77.0683 },
  { name: 'Sector 46 Gurugram',       area: 'Gurugram',              lat: 28.4385, lon: 77.0768 },
  { name: 'Sector 47 Gurugram',       area: 'Gurugram',              lat: 28.4322, lon: 77.0744 },
  { name: 'Sector 49 Gurugram',       area: 'Gurugram',              lat: 28.4209, lon: 77.0692 },
  { name: 'Sector 56 Gurugram',       area: 'Gurugram',              lat: 28.4196, lon: 77.1018 },
  { name: 'Sector 57 Gurugram',       area: 'Gurugram',              lat: 28.4214, lon: 77.1121 },
  { name: 'Sector 67 Gurugram',       area: 'Gurugram',              lat: 28.3952, lon: 77.0573 },
  { name: 'Sector 82 Gurugram',       area: 'New Gurugram',          lat: 28.3927, lon: 76.9935 },
  { name: 'Sector 83 Gurugram',       area: 'New Gurugram',          lat: 28.3889, lon: 76.9941 },
  { name: 'Palam Vihar',              area: 'Gurugram',              lat: 28.5106, lon: 77.0393 },
  { name: 'South City 1',             area: 'Gurugram',              lat: 28.4387, lon: 77.0477 },
  { name: 'South City 2',             area: 'Gurugram',              lat: 28.4231, lon: 77.0350 },
  { name: 'Vatika City',              area: 'Gurugram',              lat: 28.3957, lon: 77.0691 },
  { name: 'Signature Tower',          area: 'Gurugram',              lat: 28.4894, lon: 77.0832 },
  { name: 'Manesar',                  area: 'Gurugram District',     lat: 28.3584, lon: 76.9312 },
  { name: 'IMT Manesar',              area: 'Gurugram',              lat: 28.3582, lon: 76.9344 },
  { name: 'Hero Honda Chowk',         area: 'Gurugram',              lat: 28.4431, lon: 77.0099 },
  { name: 'Rajiv Chowk Gurugram',     area: 'Gurugram',              lat: 28.4498, lon: 77.0222 },
  { name: 'Old Gurgaon',              area: 'Gurugram',              lat: 28.4583, lon: 77.0186 },
  { name: 'Gurgaon Railway Station',  area: 'Gurugram',              lat: 28.4526, lon: 77.0040 },
  { name: 'Medanta Hospital',         area: 'Gurugram',              lat: 28.4510, lon: 77.0256 },
  { name: 'Artemis Hospital',         area: 'Gurugram',              lat: 28.4440, lon: 77.0826 },
  { name: 'Fortis Gurugram',          area: 'Gurugram',              lat: 28.4395, lon: 77.0470 },
  { name: 'Ambience Mall Gurugram',   area: 'Gurugram',              lat: 28.5024, lon: 77.0868 },
  { name: 'Galleria Market',          area: 'Gurugram',              lat: 28.4605, lon: 77.0779 },
  { name: 'Ardee Mall',               area: 'Gurugram',              lat: 28.4695, lon: 77.0441 },
  { name: 'Unitech Cyber Park',       area: 'Gurugram',              lat: 28.4960, lon: 77.0866 },

  // ── Noida ──────────────────────────────────────────────────────
  { name: 'Noida Sector 15',          area: 'Noida',                 lat: 28.5812, lon: 77.3135 },
  { name: 'Noida Sector 16',          area: 'Noida',                 lat: 28.5909, lon: 77.3148 },
  { name: 'Noida Sector 18 (Atta Market)', area: 'Noida',            lat: 28.5672, lon: 77.3213 },
  { name: 'Noida City Centre Metro',  area: 'Noida Sector 32',       lat: 28.5747, lon: 77.3220 },
  { name: 'Noida Sector 38',          area: 'Noida',                 lat: 28.5543, lon: 77.3324 },
  { name: 'Noida Sector 39',          area: 'Noida',                 lat: 28.5552, lon: 77.3345 },
  { name: 'Noida Sector 44',          area: 'Noida',                 lat: 28.5597, lon: 77.3479 },
  { name: 'Noida Sector 50',          area: 'Noida',                 lat: 28.5722, lon: 77.3587 },
  { name: 'Noida Sector 51',          area: 'Noida',                 lat: 28.5780, lon: 77.3627 },
  { name: 'Noida Sector 52',          area: 'Noida',                 lat: 28.5838, lon: 77.3675 },
  { name: 'Noida Sector 62',          area: 'Noida',                 lat: 28.6088, lon: 77.3618 },
  { name: 'Noida Sector 63',          area: 'Noida',                 lat: 28.6141, lon: 77.3808 },
  { name: 'Noida Sector 65',          area: 'Noida',                 lat: 28.5973, lon: 77.3899 },
  { name: 'Noida Sector 71',          area: 'Noida',                 lat: 28.5820, lon: 77.3770 },
  { name: 'Noida Sector 75',          area: 'Noida',                 lat: 28.5648, lon: 77.3872 },
  { name: 'Noida Sector 76',          area: 'Noida',                 lat: 28.5710, lon: 77.3925 },
  { name: 'Noida Sector 78',          area: 'Noida',                 lat: 28.5503, lon: 77.3808 },
  { name: 'Noida Sector 100',         area: 'Noida',                 lat: 28.5503, lon: 77.3706 },
  { name: 'Noida Sector 110',         area: 'Noida',                 lat: 28.5310, lon: 77.3691 },
  { name: 'Noida Sector 120',         area: 'Noida',                 lat: 28.5939, lon: 77.3988 },
  { name: 'Noida Sector 125',         area: 'Noida',                 lat: 28.5405, lon: 77.3297 },
  { name: 'Noida Sector 128',         area: 'Noida',                 lat: 28.5170, lon: 77.3596 },
  { name: 'Noida Sector 137',         area: 'Noida',                 lat: 28.4958, lon: 77.3921 },
  { name: 'Film City Noida',          area: 'Noida Sector 16A',      lat: 28.5756, lon: 77.3437 },
  { name: 'DND Flyway (Noida side)',  area: 'Noida',                 lat: 28.5597, lon: 77.3012 },
  { name: 'Botanical Garden Metro',   area: 'Noida Sector 25',       lat: 28.5564, lon: 77.3295 },
  { name: 'Noida Electronic City',    area: 'Noida Sector 62',       lat: 28.6055, lon: 77.3665 },
  { name: 'Amity University Noida',   area: 'Noida Sector 125',      lat: 28.5452, lon: 77.3337 },
  { name: 'Fortis Hospital Noida',    area: 'Noida Sector 62',       lat: 28.6090, lon: 77.3539 },
  { name: 'Jaypee Hospital Noida',    area: 'Noida Sector 128',      lat: 28.5497, lon: 77.3260 },
  { name: 'The Great India Place',    area: 'Noida Sector 38A',      lat: 28.5632, lon: 77.3215 },
  { name: 'Logix City Centre Mall',   area: 'Noida Sector 32',       lat: 28.5697, lon: 77.3211 },
  { name: 'Noida Expressway',         area: 'Noida',                 lat: 28.5097, lon: 77.3920 },
  { name: 'Vaishali',                 area: 'Ghaziabad (NCR)',        lat: 28.6449, lon: 77.3357 },
  { name: 'Indirapuram',              area: 'Ghaziabad (NCR)',        lat: 28.6455, lon: 77.3643 },

  // ── Greater Noida ──────────────────────────────────────────────
  { name: 'Greater Noida (City Centre)', area: 'Greater Noida',      lat: 28.4745, lon: 77.5040 },
  { name: 'Pari Chowk',               area: 'Greater Noida',         lat: 28.4755, lon: 77.4977 },
  { name: 'Knowledge Park 1',         area: 'Greater Noida',         lat: 28.4691, lon: 77.4859 },
  { name: 'Knowledge Park 3',         area: 'Greater Noida',         lat: 28.4624, lon: 77.4953 },
  { name: 'Alpha 1 Greater Noida',    area: 'Greater Noida',         lat: 28.4687, lon: 77.4861 },
  { name: 'Surajpur',                 area: 'Greater Noida',         lat: 28.5241, lon: 77.4326 },
  { name: 'Greater Noida West',       area: 'Greater Noida',         lat: 28.5778, lon: 77.4196 },
  { name: 'Gaur City Greater Noida',  area: 'Greater Noida West',    lat: 28.5900, lon: 77.4285 },

  // ── Faridabad ──────────────────────────────────────────────────
  { name: 'Faridabad',                area: 'Faridabad, Haryana',    lat: 28.4089, lon: 77.3178 },
  { name: 'NIT Faridabad',            area: 'Faridabad',             lat: 28.3869, lon: 77.3187 },
  { name: 'Ballabhgarh',              area: 'Faridabad',             lat: 28.3428, lon: 77.3255 },
  { name: 'Sector 12 Faridabad',      area: 'Faridabad',             lat: 28.4133, lon: 77.3090 },
  { name: 'Faridabad Railway Station', area: 'Faridabad',            lat: 28.4185, lon: 77.3143 },

  // ── Ghaziabad ──────────────────────────────────────────────────
  { name: 'Ghaziabad',                area: 'Ghaziabad, UP',         lat: 28.6692, lon: 77.4538 },
  { name: 'Raj Nagar Extension',      area: 'Ghaziabad',             lat: 28.6798, lon: 77.4285 },
  { name: 'Crossings Republik',       area: 'Ghaziabad',             lat: 28.6380, lon: 77.4258 },
  { name: 'Hindon',                   area: 'Ghaziabad',             lat: 28.6991, lon: 77.4345 },
];

// Search locations by query — returns up to 8 best matches
function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/);

  const scored = LOCATIONS.map(loc => {
    const nameL  = loc.name.toLowerCase();
    const areaL  = loc.area.toLowerCase();
    const fullL  = nameL + ' ' + areaL;
    let score = 0;

    // Exact start-of-name match: highest priority
    if (nameL.startsWith(q)) score += 100;
    // All tokens present in name
    if (tokens.every(t => nameL.includes(t))) score += 60;
    // Substring anywhere in name
    if (nameL.includes(q)) score += 40;
    // Tokens in full string
    if (tokens.every(t => fullL.includes(t))) score += 20;
    // Any token in full string
    if (tokens.some(t => fullL.includes(t))) score += 5;

    return { loc, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(s => ({
      display_name: `${s.loc.name}, ${s.loc.area}`,
      lat: s.loc.lat,
      lon: s.loc.lon,
    }));
}
