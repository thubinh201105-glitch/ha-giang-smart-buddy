/* Experience upgrades: theme, mobile navigation, progress and local community. */
const upgradeState=(()=>{try{return JSON.parse(localStorage.getItem('buddy-upgrades-v1')||'{}')}catch{return{}}})();
upgradeState.attempts=Array.isArray(upgradeState.attempts)?upgradeState.attempts:[];
upgradeState.posts=Array.isArray(upgradeState.posts)?upgradeState.posts:[];
const saveUpgrades=()=>localStorage.setItem('buddy-upgrades-v1',JSON.stringify(upgradeState));

titles.progress='Tiến độ của tôi';titles.opportunities='Học bổng & Nghề nghiệp';titles.community='Bạn đồng hành';
const renderBase=render;
render=function(){
 if(view==='progress')renderProgressHub();
 else if(view==='opportunities')renderOpportunities();
 else if(view==='community')renderCommunity();
 else renderBase();
 closeMobileMenu();
};

const practiceResultBase=renderPracticeResult;
renderPracticeResult=function(){
 const pct=Math.round(score/generatedPractice.length*100);
 upgradeState.attempts.unshift({date:new Date().toISOString(),grade,subject,score,total:generatedPractice.length,pct});
 upgradeState.attempts=upgradeState.attempts.slice(0,30);saveUpgrades();
 practiceResultBase();
};

function renderProgressHub(){
 const attempts=upgradeState.attempts,done=featureState.todos.filter(t=>t.done).length;
 const avg=attempts.length?Math.round(attempts.reduce((n,a)=>n+a.pct,0)/attempts.length):0;
 const daily=Math.round((habits.filter(Boolean).length/3)*100);
 const goal=Math.min(100,Math.round((attempts.length*12+done*5+featureState.points)/2));
 const bars=Array.from({length:7},(_,i)=>{const date=new Date();date.setDate(date.getDate()-(6-i));const key=date.toISOString().slice(0,10);const n=attempts.filter(a=>a.date.slice(0,10)===key).length;return `<div><i style="height:${Math.max(8,Math.min(100,n*28))}%"></i><small>${['CN','T2','T3','T4','T5','T6','T7'][date.getDay()]}</small></div>`}).join('');
 content.innerHTML=`<span class="eyebrow">HÀNH TRÌNH CỦA BẠN</span><h1>Mỗi buổi học đều được ghi nhận</h1><p class="muted">Số liệu lưu riêng trên thiết bị này.</p><div class="metric-grid"><article class="metric"><span>🔥</span><b>${streak.current}</b><small>ngày liên tiếp</small></article><article class="metric"><span>◎</span><b>${avg}%</b><small>điểm luyện đề TB</small></article><article class="metric"><span>✦</span><b>${featureState.points}</b><small>điểm nỗ lực</small></article><article class="metric"><span>▦</span><b>${attempts.length}</b><small>bộ đề đã làm</small></article></div><div class="progress-layout"><section class="panel"><div class="panel-head"><h2>Tiến độ mục tiêu</h2><span class="pill">Khối ${grade}</span></div>${progressLine('Thói quen hôm nay',daily)}${progressLine('Kết quả luyện đề',avg)}${progressLine('Mục tiêu học kỳ',goal)}<div class="week-chart" aria-label="Số bộ đề trong bảy ngày">${bars}</div></section><section class="panel"><h2>Lịch sử luyện đề</h2><div class="attempt-list">${attempts.length?attempts.slice(0,6).map(a=>`<article><span><b>${esc(a.subject)}</b><small>Khối ${a.grade} · ${new Date(a.date).toLocaleDateString('vi-VN')}</small></span><strong>${a.score}/${a.total}</strong></article>`).join(''):'<div class="empty-result"><span>🌱</span><p>Hãy hoàn thành một bộ đề để bắt đầu biểu đồ.</p></div>'}</div><div class="account-box"><b>Đồng bộ nhiều thiết bị</b><p>Hiện tiến độ đang lưu cục bộ. Đăng nhập Google sẽ được bật khi dự án có cấu hình OAuth và cơ sở dữ liệu riêng.</p><button class="secondary" disabled>Đăng nhập Google · Chưa cấu hình</button></div></section></div>`;
}
function progressLine(label,value){return `<div class="progress-line"><span>${label}<b>${value}%</b></span><div class="progress"><i style="width:${value}%"></i></div></div>`}

const gradeSheets={
 'Toán':g=>g<=7?[['Phân số','a/b ± c/d = (ad ± bc)/bd'],['Tỉ lệ thức','a/b = c/d ⇒ ad = bc'],['Diện tích tam giác','S = a·h/2']]:g<=9?[['Pythagore','a² + b² = c²'],['Bậc hai','Δ = b² − 4ac'],['Đường tròn','C = 2πR; S = πR²']]:g<=11?[['Lượng giác','sin²x + cos²x = 1'],['Cấp số nhân','uₙ = u₁qⁿ⁻¹'],['Tổ hợp','C(n,k) = n!/[k!(n−k)!]']]:[['Đạo hàm','(xⁿ)′ = nxⁿ⁻¹'],['Tích phân','∫xⁿdx = xⁿ⁺¹/(n+1)+C'],['Mặt cầu','(x−a)²+(y−b)²+(z−c)²=R²']],
 'Vật lý':g=>g<=9?[['Vận tốc','v = s/t'],['Khối lượng riêng','D = m/V'],['Công suất','P = A/t']]:[['Định luật II Newton','F = ma'],['Động năng','Wđ = mv²/2'],['Định luật Ohm','I = U/R']],
 'Hóa học':g=>g<=9?[['Số mol','n = m/M'],['Bảo toàn khối lượng','m tham gia = m sản phẩm'],['Nồng độ phần trăm','C% = mct/mdd × 100%']]:[['Nồng độ mol','Cₘ = n/V'],['Khí lý tưởng','PV = nRT'],['pH','pH = −log[H⁺]']],
 'Tiếng Anh':g=>g<=9?[['Present simple','S + V(s/es)'],['Past simple','S + V2/ed'],['Comparison','adj-er / more + adj']]:[['Passive voice','S + be + V3'],['Conditional II','If + past, would + V'],['Reported speech','said (that) + backshift']]
};
const visualsBase=renderVisuals;
renderVisuals=function(){visualsBase();const area=$('#sheetCards'),select=$('#sheetSubject');if(!area||!select)return;const draw=()=>{const rows=gradeSheets[select.value](grade);area.innerHTML=`<div class="sheet-grade">Sổ tay khối ${grade}</div>`+rows.map(x=>`<article><small>${x[0]}</small><b>${x[1]}</b></article>`).join('')};select.onchange=draw;draw()};

function renderOpportunities(){
 content.innerHTML=`<span class="eyebrow">MỞ RỘNG CÁNH CỬA</span><h1>Học bổng & định hướng nghề nghiệp</h1><p class="muted">Đi từ sở thích, năng lực đến nguồn thông tin chính thức.</p><div class="career-banner textile"><div><small>DÀNH CHO HỌC SINH HÀ GIANG</small><h2>Bạn không cần chọn nghề ngay hôm nay</h2><p>Hãy bắt đầu bằng điều bạn thích học, việc bạn làm tốt và vấn đề bạn muốn giúp cộng đồng giải quyết.</p></div><span>⛰</span></div><div class="opportunity-grid"><article class="panel"><span class="card-kicker">TUYỂN SINH</span><h2>Cổng thông tin Bộ GDĐT</h2><p>Tra cứu quy chế, lịch và thông báo tuyển sinh từ nguồn chính thức.</p><a class="primary link-button" href="https://moet.gov.vn/" target="_blank" rel="noopener">Xem nguồn chính thức ↗</a></article><article class="panel"><span class="card-kicker">HỌC BỔNG</span><h2>Săn cơ hội an toàn</h2><p>Kiểm tra đơn vị cấp, hạn nộp, điều kiện và không chuyển phí cho tài khoản cá nhân.</p><a class="secondary link-button" href="https://moet.gov.vn/giaoducquocdan/hoc-bong/Pages/default.aspx" target="_blank" rel="noopener">Xem thông báo học bổng ↗</a></article><article class="panel"><span class="card-kicker">HỌC MIỄN PHÍ</span><h2>Kho học liệu số</h2><p>Ưu tiên tài liệu có tác giả, chương trình rõ ràng và phù hợp khối lớp.</p><a class="secondary link-button" href="https://hanhtrangso.nxbgd.vn/" target="_blank" rel="noopener">Mở Hành trang số ↗</a></article></div><section class="panel career-path"><h2>La bàn nghề nghiệp</h2><div class="career-steps"><article><b>1</b><span><strong>Hiểu mình</strong><small>Môn thích, kỹ năng, giá trị</small></span></article><article><b>2</b><span><strong>Khám phá nghề</strong><small>Công việc thật, môi trường, yêu cầu</small></span></article><article><b>3</b><span><strong>Thử nhỏ</strong><small>Dự án, câu lạc bộ, hỏi người đi trước</small></span></article><article><b>4</b><span><strong>Lập lộ trình</strong><small>Môn học, kỹ năng, mốc thời gian</small></span></article></div></section><div class="notice">Thông tin tuyển sinh và học bổng có thể thay đổi. Luôn kiểm tra ngày đăng và xác nhận lại trên trang của đơn vị tổ chức.</div>`;
}

function renderCommunity(){
 const samples=[{name:'Bạn Mây · Khối 9',tag:'Mẹo học',text:'Mình chia bài dài thành 3 phần, học 20 phút rồi tự kể lại mà không nhìn sách.'},{name:'Nhóm Đồng Văn',tag:'Tìm bạn học',text:'Cùng ôn Toán và Tiếng Anh tối thứ Bảy, mỗi bạn chuẩn bị một câu khó.'}];
 const posts=[...upgradeState.posts,...samples];
 content.innerHTML=`<span class="eyebrow">CỘNG ĐỒNG CÙNG TIẾN</span><h1>Học cùng nhau, tiến xa hơn</h1><p class="muted">Chia sẻ phương pháp và tìm bạn học. Không đăng số điện thoại, địa chỉ hoặc thông tin riêng tư.</p><div class="community-layout"><section class="panel"><h2>Viết lời nhắn cho bạn đồng hành</h2><label>Chủ đề<select id="postTag"><option>Mẹo học</option><option>Tìm bạn học</option><option>Hỏi bài</option><option>Động viên</option></select></label><textarea id="postText" maxlength="280" placeholder="Ví dụ: Mình đang ôn Vật lý khối ${grade}, muốn tìm bạn cùng giải 5 câu mỗi ngày..."></textarea><button class="primary" id="addPost">Chia sẻ trên thiết bị này</button><div class="notice">Bản hiện tại chỉ lưu bài trên trình duyệt của bạn. Tính năng cộng đồng trực tuyến cần tài khoản, kiểm duyệt và máy chủ riêng để bảo vệ học sinh.</div></section><section class="community-feed">${posts.map(p=>`<article class="panel post"><div><span class="avatar mini">${esc((p.name||'B')[0])}</span><span><b>${esc(p.name||`Bạn học · Khối ${grade}`)}</b><small>${esc(p.tag)}</small></span></div><p>${esc(p.text)}</p><button class="secondary compact" data-cheer>♡ Cổ vũ</button></article>`).join('')}</section></div>`;
 $('#addPost').onclick=()=>{const text=$('#postText').value.trim();if(text.length<5){toast('Hãy viết ít nhất 5 ký tự.');return}upgradeState.posts.unshift({name:`Bạn học · Khối ${grade}`,tag:$('#postTag').value,text:text.slice(0,280)});upgradeState.posts=upgradeState.posts.slice(0,10);saveUpgrades();renderCommunity();toast('Đã lưu lời nhắn trên thiết bị này.')};document.querySelectorAll('[data-cheer]').forEach(b=>b.onclick=()=>{b.textContent='♥ Đã cổ vũ';b.disabled=true});
}

function closeMobileMenu(){document.body.classList.remove('menu-open')}
$('#openMenu').onclick=()=>document.body.classList.add('menu-open');$('#closeMenu').onclick=closeMobileMenu;$('#menuBackdrop').onclick=closeMobileMenu;
const savedTheme=localStorage.getItem('buddy-theme')||'light';document.documentElement.dataset.theme=savedTheme;updateThemeButton();
$('#themeToggle').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';localStorage.setItem('buddy-theme',document.documentElement.dataset.theme);updateThemeButton()};
function updateThemeButton(){$('#themeToggle').textContent=document.documentElement.dataset.theme==='dark'?'☀':'☾';$('#themeToggle').title=document.documentElement.dataset.theme==='dark'?'Bật chế độ sáng':'Bật chế độ tối'}
