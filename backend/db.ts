import Database from 'better-sqlite3';

const db = new Database('game.db');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name_th TEXT,
    name_en TEXT,
    name_zh TEXT
  );

  CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    location_id TEXT,
    name_th TEXT,
    name_en TEXT,
    name_zh TEXT,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
  );
`);

export function seedDatabase() {
  console.log("Seeding databases with 30+ locations...");
  db.exec('DELETE FROM roles; DELETE FROM locations;');

  const insertLocation = db.prepare(`
    INSERT INTO locations (id, name_th, name_en, name_zh)
    VALUES (@id, @name_th, @name_en, @name_zh)
  `);

  const insertRole = db.prepare(`
    INSERT INTO roles (id, location_id, name_th, name_en, name_zh)
    VALUES (@id, @location_id, @name_th, @name_en, @name_zh)
  `);

  const gameData = [
    {
      id: 'attika_studio', th: 'Attika Studio (Co-working)', en: 'Attika Studio', zh: 'Attika 共享工作室',
      roles: [
        { th: 'วิทยากร', en: 'Speaker', zh: '讲师' },
        { th: 'ผู้เข้าร่วมเวิร์กชอป', en: 'Attendee', zh: '参与者' },
        { th: 'สตาฟจัดงาน', en: 'Event Staff', zh: '活动工作人员' },
        { th: 'ช่างภาพ', en: 'Photographer', zh: '摄影师' },
        { th: 'แม่บ้าน', en: 'Cleaner', zh: '清洁工' }
      ]
    },
    {
      id: 'hospital', th: 'โรงพยาบาล', en: 'Hospital', zh: '医院',
      roles: [
        { th: 'หมอ', en: 'Doctor', zh: '医生' },
        { th: 'พยาบาล', en: 'Nurse', zh: '护士' },
        { th: 'เภสัชกร', en: 'Pharmacist', zh: '药剂师' },
        { th: 'คนไข้', en: 'Patient', zh: '病人' },
        { th: 'ศัลยแพทย์', en: 'Surgeon', zh: '外科医生' },
        { th: 'ยาม', en: 'Security Guard', zh: '保安' }
      ]
    },
    {
      id: 'school', th: 'โรงเรียน', en: 'School', zh: '学校',
      roles: [
        { th: 'ครูใหญ่', en: 'Principal', zh: '校长' },
        { th: 'ภารโรง', en: 'Janitor', zh: '门卫' },
        { th: 'นักเรียนเรียนเก่ง', en: 'Nerd Student', zh: '学霸' },
        { th: 'นักเรียนหัวโจก', en: 'Bully', zh: '校霸' },
        { th: 'ครูพละ', en: 'PE Teacher', zh: '体育老师' },
        { th: 'แม่ครัว', en: 'Cafeteria Cook', zh: '食堂厨师' }
      ]
    },
    {
      id: 'restaurant', th: 'ภัตตาคาร', en: 'Restaurant', zh: '餐厅',
      roles: [
        { th: 'หัวหน้าเชฟ', en: 'Head Chef', zh: '主厨' },
        { th: 'เด็กเสิร์ฟ', en: 'Waiter', zh: '服务员' },
        { th: 'ลูกค้าประจำ', en: 'Regular Customer', zh: '常客' },
        { th: 'นักวิจารณ์อาหาร', en: 'Food Critic', zh: '美食评论家' },
        { th: 'พนักงานล้างจาน', en: 'Dishwasher', zh: '洗碗工' }
      ]
    },
    {
      id: 'bank', th: 'ธนาคาร', en: 'Bank', zh: '银行',
      roles: [
        { th: 'ผู้จัดการธนาคาร', en: 'Bank Manager', zh: '银行经理' },
        { th: 'พนักงานหน้าเคาน์เตอร์', en: 'Teller', zh: '出纳员' },
        { th: 'รปภ.', en: 'Security Guard', zh: '保安' },
        { th: 'ลูกค้าเศรษฐี', en: 'Wealthy Client', zh: '富豪客户' },
        { th: 'แฮกเกอร์', en: 'Hacker', zh: '黑客' }
      ]
    },
    {
      id: 'supermarket', th: 'ซูเปอร์มาร์เก็ต', en: 'Supermarket', zh: '超市',
      roles: [
        { th: 'แคชเชียร์', en: 'Cashier', zh: '收银员' },
        { th: 'พนักงานจัดสต็อก', en: 'Stock Clerk', zh: '理货员' },
        { th: 'ลูกค้าขี้บ่น', en: 'Karen (Angry Customer)', zh: '暴躁顾客' },
        { th: 'พนักงานชิมอาหาร', en: 'Sample Promoter', zh: '试吃推销员' },
        { th: 'คนขายเนื้อ', en: 'Butcher', zh: '屠夫' }
      ]
    },
    {
      id: 'police_station', th: 'สถานีตำรวจ', en: 'Police Station', zh: '警察局',
      roles: [
        { th: 'สารวัตร', en: 'Inspector', zh: '探长' },
        { th: 'สายตรวจ', en: 'Patrol Officer', zh: '巡警' },
        { th: 'ผู้ต้องขัง', en: 'Prisoner', zh: '囚犯' },
        { th: 'นักอนุรักษ์กฎหมาย', en: 'Lawyer', zh: '律师' },
        { th: 'นักสืบ', en: 'Detective', zh: '侦探' }
      ]
    },
    {
      id: 'airport', th: 'สนามบิน', en: 'Airport', zh: '机场',
      roles: [
        { th: 'กัปตัน', en: 'Pilot', zh: '飞行员' },
        { th: 'แอร์โฮสเตส', en: 'Flight Attendant', zh: '空乘' },
        { th: 'ผู้โดยสารที่สายไป', en: 'Late Passenger', zh: '晚点的乘客' },
        { th: 'เจ้าหน้าที่ศุลกากร', en: 'Customs Officer', zh: '海关人员' },
        { th: 'คนขนกระเป๋า', en: 'Baggage Handler', zh: '行李搬运工' }
      ]
    },
    {
      id: 'cinema', th: 'โรงภาพยนตร์', en: 'Cinema', zh: '电影院',
      roles: [
        { th: 'พนักงานขายตั๋ว', en: 'Ticket Seller', zh: '售票员' },
        { th: 'คนฉายหนัง', en: 'Projectionist', zh: '放映员' },
        { th: 'วัยรุ่นเดทกัน', en: 'Dating Teen', zh: '约会青年' },
        { th: 'คนขายป๊อปคอร์น', en: 'Popcorn Vendor', zh: '爆米花卖家' },
        { th: 'คนคุยเสียงดัง', en: 'Loud Talker', zh: '大声吵闹的观众' }
      ]
    },
    {
      id: 'hotel', th: 'โรงแรมหรู', en: 'Luxury Hotel', zh: '豪华酒店',
      roles: [
        { th: 'พนักงานต้อนรับ', en: 'Receptionist', zh: '前台' },
        { th: 'เบลล์บอย', en: 'Bellboy', zh: '门童' },
        { th: 'แม่บ้าน', en: 'Maid', zh: '客房保洁' },
        { th: 'แขก VIP', en: 'VIP Guest', zh: 'VIP贵宾' },
        { th: 'ผู้จัดการโรงแรม', en: 'Hotel Manager', zh: '酒店经理' }
      ]
    },
    {
      id: 'beach', th: 'ชายหาด', en: 'Beach', zh: '海滩',
      roles: [
        { th: 'ไลฟ์การ์ด', en: 'Lifeguard', zh: '救生员' },
        { th: 'นักเล่นเซิร์ฟ', en: 'Surfer', zh: '冲浪者' },
        { th: 'คนขายไอติม', en: 'Ice Cream Vendor', zh: '冰淇淋小贩' },
        { th: 'นักท่องเที่ยวอาบแดด', en: 'Sunbather', zh: '晒日光浴者' },
        { th: 'ช่างภาพท่องเที่ยว', en: 'Tourist Photographer', zh: '旅游摄影师' }
      ]
    },
    {
      id: 'space_station', th: 'สถานีอวกาศ', en: 'Space Station', zh: '太空站',
      roles: [
        { th: 'กัปตันอวกาศ', en: 'Commander', zh: '指挥官' },
        { th: 'วิศวกรซ่อมยาน', en: 'Engineer', zh: '工程师' },
        { th: 'นักบินอวกาศ', en: 'Astronaut', zh: '宇航员' },
        { th: 'นักวิจัยเอเลี่ยน', en: 'Alien Researcher', zh: '外星人研究员' },
        { th: 'นักท่องเที่ยวอวกาศ', en: 'Space Tourist', zh: '太空游客' }
      ]
    },
    {
      id: 'pirate_ship', th: 'เรือโจรสลัด', en: 'Pirate Ship', zh: '海盗船',
      roles: [
        { th: 'กัปตันเรือ', en: 'Pirate Captain', zh: '海盗船长' },
        { th: 'คนบังคับหางเสือ', en: 'Helmsman', zh: '舵手' },
        { th: 'ลูกเรือประจำปืนใหญ่', en: 'Cannoneer', zh: '炮手' },
        { th: 'เชฟบนเรือ', en: 'Ship Cook', zh: '厨师' },
        { th: 'ผู้โดนจับเป็นเชลย', en: 'Hostage', zh: '俘虏' }
      ]
    },
    {
      id: 'zoo', th: 'สวนสัตว์', en: 'Zoo', zh: '动物园',
      roles: [
        { th: 'สัตวแพทย์', en: 'Veterinarian', zh: '兽医' },
        { th: 'คนดูแลสัตว์', en: 'Zookeeper', zh: '饲养员' },
        { th: 'เด็กหลงทาง', en: 'Lost Child', zh: '走失的小孩' },
        { th: 'คนขายลูกโป่ง', en: 'Balloon Vendor', zh: '卖气球的人' },
        { th: 'ไกด์นำเที่ยว', en: 'Tour Guide', zh: '导游' }
      ]
    },
    {
      id: 'museum', th: 'พิพิธภัณฑ์ประวัติศาสตร์', en: 'History Museum', zh: '历史博物馆',
      roles: [
        { th: 'ภัณฑารักษ์ (คนดูแล)', en: 'Curator', zh: '馆长' },
        { th: 'ยามเฝ้ากลางคืน', en: 'Night Guard', zh: '夜间保安' },
        { th: 'หัวขโมย', en: 'Thief', zh: '小偷' },
        { th: 'นักโบราณคดี', en: 'Archaeologist', zh: '考古学家' },
        { th: 'ผู้เข้าชมงงๆ', en: 'Confused Visitor', zh: '困惑的游客' }
      ]
    },
    {
      id: 'amusement_park', th: 'สวนสนุก', en: 'Amusement Park', zh: '游乐园',
      roles: [
        { th: 'คนคุมเครื่องเล่น', en: 'Ride Operator', zh: '游乐设施操作员' },
        { th: 'มาสคอต', en: 'Mascot', zh: '吉祥物扮演者' },
        { th: 'เด็กขี้แย', en: 'Crying Kid', zh: '爱哭的孩子' },
        { th: 'คนขายสายไหม', en: 'Cotton Candy Vendor', zh: '棉花糖小贩' },
        { th: 'ช่างเครื่อง', en: 'Mechanic', zh: '机械师' }
      ]
    },
    {
      id: 'circus', th: 'คณะละครสัตว์', en: 'Circus', zh: '马戏团',
      roles: [
        { th: 'นักมายากล', en: 'Magician', zh: '魔术师' },
        { th: 'ตัวตลก', en: 'Clown', zh: '小丑' },
        { th: 'คนฝึกสิงโต', en: 'Lion Tamer', zh: '驯兽师' },
        { th: 'นักกายกรรม', en: 'Acrobat', zh: '杂技演员' },
        { th: 'คนขายตั๋ว', en: 'Ringmaster', zh: '马戏团老板' }
      ]
    },
    {
      id: 'gym', th: 'ยิม / ฟิตเนส', en: 'Gym', zh: '健身房',
      roles: [
        { th: 'เทรนเนอร์ส่วนตัว', en: 'Personal Trainer', zh: '私人教练' },
        { th: 'คนบ้ากล้าม', en: 'Bodybuilder', zh: '肌肉男' },
        { th: 'คนมาเซลฟี่', en: 'Selfie Addict', zh: '爱自拍的人' },
        { th: 'คนทำความสะอาด', en: 'Cleaner', zh: '保洁' },
        { th: 'คนสอนโยคะ', en: 'Yoga Instructor', zh: '瑜伽教练' }
      ]
    },
    {
      id: 'library', th: 'ห้องสมุด', en: 'Library', zh: '图书馆',
      roles: [
        { th: 'บรรณารักษ์', en: 'Librarian', zh: '图书管理员' },
        { th: 'นักศึกษาปั่นงาน', en: 'Stressed Student', zh: '赶作业的学生' },
        { th: 'คนแอบหลับ', en: 'Sleeper', zh: '打瞌睡的人' },
        { th: 'คนหาหนังสือ', en: 'Researcher', zh: '研究员' },
        { th: 'คนจัดหนังสือ', en: 'Book Sorter', zh: '排书员' }
      ]
    },
    {
      id: 'submarine', th: 'เรือดำน้ำ', en: 'Submarine', zh: '潜水艇',
      roles: [
        { th: 'กัปตันเรือ', en: 'Captain', zh: '舰长' },
        { th: 'คนดูโซนาร์', en: 'Sonar Operator', zh: '声纳员' },
        { th: 'ช่างซ่อมตอร์ปิโด', en: 'Torpedo Tech', zh: '鱼雷技师' },
        { th: 'กุ๊ก', en: 'Cook', zh: '厨师' },
        { th: 'ลูกเรือฝึกหัด', en: 'Rookie', zh: '实习水手' }
      ]
    },
    {
      id: 'casino', th: 'คาสิโน', en: 'Casino', zh: '赌场',
      roles: [
        { th: 'ดิลเลอร์แจกไพ่', en: 'Dealer', zh: '荷官' },
        { th: 'ยามคุมบ่อน', en: 'Bouncer', zh: '保安' },
        { th: 'เศรษฐีหน้าใหม่', en: 'High Roller', zh: '大富豪' },
        { th: 'คนล้มละลาย', en: 'Broke Gambler', zh: '破产赌徒' },
        { th: 'บาร์เทนเดอร์', en: 'Bartender', zh: '酒保' }
      ]
    },
    {
      id: 'office', th: 'ออฟฟิศบริษัท', en: 'Corporate Office', zh: '办公室',
      roles: [
        { th: 'ประธานบริษัท', en: 'CEO', zh: 'CEO' },
        { th: 'หัวหน้างานสายโหด', en: 'Strict Manager', zh: '严厉的经理' },
        { th: 'เด็กฝึกงาน', en: 'Intern', zh: '实习生' },
        { th: 'พนักงาน IT', en: 'IT Guy', zh: 'IT员工' },
        { th: 'สาวช่างเม้าท์', en: 'Gossip Employee', zh: '爱八卦的员工' }
      ]
    },
    {
      id: 'military_base', th: 'ฐานทัพทหาร', en: 'Military Base', zh: '军事基地',
      roles: [
        { th: 'นายพล', en: 'General', zh: '将军' },
        { th: 'พลทหาร', en: 'Private', zh: '列兵' },
        { th: 'ครูฝึกสายโหด', en: 'Drill Sergeant', zh: '教官' },
        { th: 'แพทย์สนาม', en: 'Medic', zh: '军医' },
        { th: 'คนล้างห้องน้ำ', en: 'Latrine Cleaner', zh: '洗厕所兵' }
      ]
    },
    {
      id: 'train_station', th: 'สถานีรถไฟ', en: 'Train Station', zh: '火车站',
      roles: [
        { th: 'นายตรวจตั๋ว', en: 'Inspector', zh: '检票员' },
        { th: 'คนขับรถไฟ', en: 'Conductor', zh: '司机' },
        { th: 'ผู้โดยสารที่กำลังรีบ', en: 'Rushing Passenger', zh: '匆忙的乘客' },
        { th: 'คนขายข้าวกล่อง', en: 'Bento Vendor', zh: '便当小贩' },
        { th: 'คนประกาศสถานี', en: 'Announcer', zh: '播音员' }
      ]
    },
    {
      id: 'coffee_shop', th: 'ร้านกาแฟ', en: 'Coffee Shop', zh: '咖啡馆',
      roles: [
        { th: 'บาริสต้า', en: 'Barista', zh: '咖啡师' },
        { th: 'ลูกค้าที่สั่งของยาก', en: 'Picky Customer', zh: '挑剔的顾客' },
        { th: 'ฟรีแลนซ์มาทำงาน', en: 'Freelancer', zh: '自由职业者' },
        { th: 'คู่รักมาเดท', en: 'Couple', zh: '情侣' },
        { th: 'ผู้จัดการร้าน', en: 'Store Manager', zh: '店长' }
      ]
    },
    {
      id: 'nightclub', th: 'ไนต์คลับ', en: 'Nightclub', zh: '夜总会',
      roles: [
        { th: 'ดีเจ', en: 'DJ', zh: 'DJ' },
        { th: 'การ์ดคุมหน้าประตู', en: 'Bouncer', zh: '看门保镖' },
        { th: 'บาร์เทนเดอร์', en: 'Bartender', zh: '酒保' },
        { th: 'นักปาร์ตี้ตัวยง', en: 'Party Animal', zh: '派对狂' },
        { th: 'คนเมาหลับ', en: 'Drunk Person', zh: '醉汉' }
      ]
    },
    {
      id: 'spa', th: 'สปา / ร้านนวด', en: 'Spa', zh: '水疗中心',
      roles: [
        { th: 'หมอนวดแผนไทย', en: 'Masseuse', zh: '按摩师' },
        { th: 'ผู้จัดการร้าน', en: 'Manager', zh: '店经理' },
        { th: 'ลูกค้าที่มาผ่อนคลาย', en: 'Relaxing Customer', zh: '来放松的顾客' },
        { th: 'คนอบซาวน่า', en: 'Sauna User', zh: '蒸桑拿者' },
        { th: 'พนักงานต้อนรับ', en: 'Receptionist', zh: '前台' }
      ]
    },
    {
      id: 'theater', th: 'โรงละครแห่งชาติ', en: 'Theater', zh: '剧院',
      roles: [
        { th: 'นักแสดงนำ', en: 'Lead Actor', zh: '主演' },
        { th: 'ผู้กำกับ', en: 'Director', zh: '导演' },
        { th: 'ช่างไฟ / ฉาก', en: 'Stagehand', zh: '布景师' },
        { th: 'คนดูละคร', en: 'Audience Member', zh: '观众' },
        { th: 'นักเปียโน', en: 'Pianist', zh: '钢琴师' }
      ]
    },
    {
      id: 'cruise_ship', th: 'เรือสำราญ', en: 'Cruise Ship', zh: '游轮',
      roles: [
        { th: 'กัปตัน', en: 'Captain', zh: '船长' },
        { th: 'ผู้จัดปาร์ตี้', en: 'Cruise Director', zh: '航程指挥' },
        { th: 'นักดนตรีบนเรือ', en: 'Musician', zh: '乐手' },
        { th: 'เศรษฐีนักเดินทาง', en: 'Rich Traveler', zh: '土豪旅客' },
        { th: 'บาร์เทนเดอร์ริมสระ', en: 'Pool Bartender', zh: '泳池酒保' }
      ]
    },
    {
      id: 'fire_station', th: 'สถานีดับเพลิง', en: 'Fire Station', zh: '消防局',
      roles: [
        { th: 'หัวหน้าดับเพลิง', en: 'Fire Chief', zh: '消防局长' },
        { th: 'นักดับเพลิง', en: 'Firefighter', zh: '消防员' },
        { th: 'คนรับแจ้งสายด่วน', en: 'Dispatcher', zh: '接线员' },
        { th: 'คนทำอาหารประจำกะ', en: 'Station Cook', zh: '消防局厨师' },
        { th: 'นักกู้ภัยอาสาสมัคร', en: 'Volunteer', zh: '志愿兵' }
      ]
    }
  ];

  db.transaction(() => {
     for (const loc of gameData) {
        insertLocation.run({ id: loc.id, name_th: loc.th, name_en: loc.en, name_zh: loc.zh });
        loc.roles.forEach((r, idx) => {
           insertRole.run({ 
             id: `${loc.id}_role_${idx}`, 
             location_id: loc.id, 
             name_th: r.th, 
             name_en: r.en, 
             name_zh: r.zh 
           });
        });
     }
  })();
  console.log("Seeding complete. Inserted 30 locations!");
}

export function getRandomLocationRoles() {
  const locStmt = db.prepare('SELECT * FROM locations ORDER BY RANDOM() LIMIT 1');
  const location = locStmt.get() as any;
  if (!location) return null;

  const roleStmt = db.prepare('SELECT * FROM roles WHERE location_id = ?');
  const roles = roleStmt.all(location.id) as any[];

  return { location, roles };
}

export function getAllLocations() {
  return db.prepare('SELECT * FROM locations ORDER BY name_en ASC').all();
}

export default db;
