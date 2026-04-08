import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "join_lobby": "Join Lobby",
      "enter_nickname": "Enter your nickname",
      "nickname": "Nickname",
      "room_id": "Room ID",
      "start_game": "Start Game",
      "waiting_host": "Waiting for host to start...",
      "players": "Players",
      "you": "You",
      "host": "Host",
      "hold_to_reveal": "Press and Hold to Reveal",
      "you_are_spy": "You are the Spy!",
      "secret_info": "Your Secret Identity",
      "location": "Location: ",
      "role": "Role: ",
      "release_to_hide": "Release to hide",
      "time_remaining": "Time Remaining:",
      "accuse": "Pause & Accuse",
      "guess_location": "Guess Location",
      "game_over": "Game Over!",
      "spy_wins": "Spy Wins!",
      "players_win": "Players Win!",
      "back_to_lobby": "Back to Lobby",
      "vote_question": "Who is the Spy?",
      "yes": "Yes",
      "no": "No",
      "submit_guess": "Submit Guess",
      "select_location": "Select a location...",
      "vote": "Vote",
      "voted": "Voted",
      "waiting_for_votes": "Waiting for votes...",
      "leave_room": "Leave Room",
      "game_in_progress": "Game in Progress ⏳",
      "please_wait": "The game has already started. Please wait here for the current round to finish!",
      "welcome_title": "Welcome to Attika!",
      "welcome_body": "This web app was made for ice breaking among the lovely customers of Attika Studio.",
      "welcome_footer": "Enjoy the night!",
      "welcome_btn": "Let's Play! 🎮"
    }
  },
  th: {
    translation: {
      "join_lobby": "เข้าร่วมล็อบบี้",
      "enter_nickname": "กรอกชื่อเล่นของคุณ",
      "nickname": "ชื่อเล่น",
      "room_id": "รหัสห้อง",
      "start_game": "เริ่มเกม",
      "waiting_host": "รอโฮสต์เริ่มเกม...",
      "players": "ผู้เล่น",
      "you": "คุณ",
      "host": "โฮสต์",
      "hold_to_reveal": "กดค้างเพื่อดูบทบาท",
      "you_are_spy": "คุณคือสปาย!",
      "secret_info": "ตัวตนลับของคุณ",
      "location": "สถานที่: ",
      "role": "บทบาท: ",
      "release_to_hide": "ปล่อยเพื่อซ่อน",
      "time_remaining": "เวลาที่เหลือ:",
      "accuse": "หยุดเวลาเพื่อจับสปาย",
      "guess_location": "สปายขอทายสถานที่",
      "game_over": "จบเกม!",
      "spy_wins": "สปายชนะ!",
      "players_win": "ผู้เล่นชนะ!",
      "back_to_lobby": "กลับหน้าล็อบบี้",
      "vote_question": "ใครคือสปาย?",
      "yes": "ได้! (สปายแพ้)",
      "no": "ไม่ได้",
      "submit_guess": "ตกลง",
      "select_location": "เลือกสถานที่...",
      "vote": "โหวต",
      "voted": "โหวตแล้ว",
      "waiting_for_votes": "รอผู้เล่นคนอื่นโหวต...",
      "leave_room": "ออกจากห้อง",
      "game_in_progress": "เกมกำลังเริ่มอยู่ ⏳",
      "please_wait": "ผู้เล่นอื่นกำลังเล่นอยู่ตอนนี้ โปรดรอก่อนเพื่อให้จบรอบนี้แล้วเริ่มเล่นพร้อมกันในรอบหน้า!",
      "welcome_title": "Welcome to Attika!",
      "welcome_body": "ผมทำเว็บนี้เพื่อเป็น Ice Breaking แก่ลูกค้า Attika Studio ที่น่ารักของเราทุกคน",
      "welcome_footer": "ขอให้ทุกคน Enjoy the night!",
      "welcome_btn": "เล่นเลย! 🎮"
    }
  },
  zh: {
    translation: {
      "join_lobby": "加入大厅",
      "enter_nickname": "输入您的昵称",
      "nickname": "昵称",
      "room_id": "房间号",
      "start_game": "开始游戏",
      "waiting_host": "等待房主开始...",
      "players": "玩家",
      "you": "你",
      "host": "房主",
      "hold_to_reveal": "长按以查看",
      "you_are_spy": "你是卧底！",
      "secret_info": "你的秘密身份",
      "location": "地点: ",
      "role": "角色: ",
      "release_to_hide": "松开以隐藏",
      "time_remaining": "剩余时间:",
      "accuse": "指控卧底",
      "guess_location": "猜测地点",
      "game_over": "游戏结束!",
      "spy_wins": "卧底获胜!",
      "players_win": "平民获胜!",
      "back_to_lobby": "返回大厅",
      "vote_question": "谁是卧底？",
      "yes": "是的",
      "no": "没有",
      "submit_guess": "提交猜测",
      "select_location": "选择地点...",
      "vote": "投票",
      "voted": "已投票",
      "waiting_for_votes": "等待投票...",
      "leave_room": "离开房间",
      "game_in_progress": "游戏进行中 ⏳",
      "please_wait": "游戏已经开始。请在这里等待当前回合结束！",
      "welcome_title": "Welcome to Attika!",
      "welcome_body": "我制作这个网站是为了帮助 Attika Studio 可爱的客户们打破居面（Ice Breaking）。",
      "welcome_footer": "祝大家度过美好的喑夜！",
      "welcome_btn": "开始游戏! 🎮"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
