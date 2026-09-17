import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadEnvFile} from 'node:process';
const root=path.dirname(fileURLToPath(import.meta.url));
try { loadEnvFile(path.join(root,'.env')); } catch (error) {
 if (error.code !== 'ENOENT') { console.error('Khong doc duoc tep .env. Kiem tra quyen truy cap tep.'); process.exit(1); }
}
const key=process.env.OPENAI_API_KEY?.trim();
const model=process.env.OPENAI_MODEL||'gpt-4.1-mini';
const json=(s,status,data)=>{s.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});s.end(JSON.stringify(data));};
export function providerError(status,code){if(status===401||code==='invalid_api_key')return [401,'INVALID_KEY','Khóa OpenAI không hợp lệ hoặc đã bị thu hồi. Người quản trị cần thay khóa.'];if(status===429&&code==='insufficient_quota')return [429,'QUOTA_EXCEEDED','Tài khoản OpenAI đã hết hạn mức hoặc chưa có số dư API. Người quản trị cần kiểm tra Billing.'];if(status===429)return [429,'RATE_LIMITED','Dịch vụ đang giới hạn tốc độ gửi. Hãy chờ một phút rồi thử lại.'];if(status===403)return [403,'ACCESS_DENIED','Tài khoản hoặc khóa chưa có quyền dùng dịch vụ này.'];if(status===404)return [502,'MODEL_UNAVAILABLE','Mô hình AI chưa khả dụng với tài khoản. Người quản trị cần kiểm tra OPENAI_MODEL.'];return [502,'PROVIDER_ERROR','Dịch vụ OpenAI đang gặp lỗi. Hãy thử lại sau.'];}
async function openai(endpoint,body){const r=await fetch('https://api.openai.com/v1/'+endpoint,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(25000)});let data;try{data=await r.json()}catch{throw {publicError:[502,'INVALID_RESPONSE','Dịch vụ AI trả về dữ liệu không hợp lệ. Hãy thử lại sau.']}}if(!r.ok)throw {publicError:providerError(r.status,data?.error?.code)};return data;}
let recent=[],busy=0;
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://127.0.0.1:4174');
 if(!['127.0.0.1:4174','localhost:4174'].includes(req.headers.host))return json(res,403,{code:'FORBIDDEN',message:'Địa chỉ máy chủ không hợp lệ.'});
 if(url.pathname==='/api/status'&&req.method==='GET')return json(res,200,{configured:!!key,message:key?'Máy chủ đã có khóa. Gửi câu hỏi để kiểm tra kết nối AI.':'Chưa cấu hình khóa OpenAI. Hãy chạy KHOI-DONG.cmd và nhập khóa trên máy.'});
 if(url.pathname==='/api/ask'){
  if(req.method!=='POST')return json(res,405,{code:'METHOD_NOT_ALLOWED',message:'Phương thức không hợp lệ.'});
  if(req.headers.origin&&!['http://127.0.0.1:4174','http://localhost:4174'].includes(req.headers.origin))return json(res,403,{code:'FORBIDDEN',message:'Yêu cầu phải gửi từ website Buddy trên máy này.'});
  if(!req.headers['content-type']?.startsWith('application/json'))return json(res,415,{code:'INVALID_REQUEST',message:'Dữ liệu gửi không hợp lệ.'});
  if(!key)return json(res,503,{code:'MISSING_KEY',message:'Chưa cấu hình khóa OpenAI. Người quản trị cần nhập khóa khi khởi động máy chủ.'});
  let text='',bytes=0;for await(const part of req){bytes+=part.length;if(bytes>8000)return json(res,413,{code:'TOO_LARGE',message:'Câu hỏi quá dài.'});text+=part}
  let data;try{data=JSON.parse(text)}catch{return json(res,400,{code:'INVALID_REQUEST',message:'Dữ liệu không hợp lệ.'})}
  if(data.grade!=null&&(!Number.isInteger(data.grade)||data.grade<6||data.grade>12))return json(res,400,{code:'INVALID_GRADE',message:'Khối học không hợp lệ.'});if(data.ageConfirmed!==true)return json(res,400,{code:'AGE_REQUIRED',message:'Chức năng AI trong bản này dành cho người từ 13 tuổi trở lên.'});
  if(typeof data.question!=='string'||!data.question.trim()||data.question.length>1500||!['middle','high'].includes(data.level)||!['Toán','Ngữ văn','Lịch sử'].includes(data.subject))return json(res,400,{code:'INVALID_REQUEST',message:'Câu hỏi, môn học hoặc cấp học không hợp lệ.'});
  const now=Date.now();recent=recent.filter(t=>now-t<60000);if(recent.length>=6||busy>=2)return json(res,429,{code:'LOCAL_RATE_LIMIT',message:'Bạn đang gửi quá nhanh. Hãy chờ một phút rồi thử lại.'});recent.push(now);busy++;
  try{
   const moderation=await openai('moderations',{model:'omni-moderation-latest',input:data.question});
   if(!Array.isArray(moderation.results)||typeof moderation.results[0]?.flagged!=='boolean')throw {publicError:[502,'INVALID_RESPONSE','Không kiểm tra được nội dung. Hãy thử lại sau.']};
   if(moderation.results[0].flagged)return json(res,200,{answer:'Buddy chỉ hỗ trợ nội dung học tập phù hợp. Nếu bạn đang gặp nguy hiểm hoặc bị làm tổn thương, hãy liên hệ ngay với cha mẹ, giáo viên hoặc người lớn đáng tin cậy.'});
   const result=await openai('responses',{model,store:false,max_output_tokens:700,instructions:`Bạn là Hà Giang Smart Buddy, trợ lý học tập cho học sinh ${data.level==='middle'?'THCS':'THPT'}, môn ${data.subject}. Trả lời tiếng Việt, thân thiện, ngắn gọn. Ưu tiên gợi mở từng bước giúp học sinh tự giải. Không bịa kiến thức hoặc nguồn; thừa nhận khi chưa chắc. Không hỏi thông tin riêng tư. Chỉ hỗ trợ học tập phù hợp lứa tuổi; không nội dung tình dục, hướng dẫn gây hại, chẩn đoán hay điều trị. Với nguy hiểm hoặc khủng hoảng, khuyến khích tìm người lớn đáng tin cậy ngay. Nêu cách kiểm tra lời giải.`,input:(data.context?.title?`Bài đang hiển thị: ${data.context.title}\nGợi ý hiện tại của Buddy: ${data.context.hint||''}\nPhản hồi hoặc câu hỏi của học sinh: ${data.question.trim()}`:data.question.trim())});
   const answer=(result.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();
   if(result.status==='incomplete'||!answer)throw {publicError:[502,'INCOMPLETE_RESPONSE','AI chưa hoàn thành câu trả lời. Hãy thử đặt câu hỏi ngắn hơn.']};
   const outputCheck=await openai('moderations',{model:'omni-moderation-latest',input:answer});
   if(typeof outputCheck.results?.[0]?.flagged!=='boolean')throw {publicError:[502,'INVALID_RESPONSE','Không kiểm tra được câu trả lời. Hãy thử lại sau.']};
   return json(res,200,{answer:outputCheck.results[0].flagged?'Buddy chưa có câu trả lời phù hợp. Bạn hãy hỏi thầy cô hoặc thử diễn đạt lại câu hỏi học tập.':answer});
  }catch(e){const error=e.publicError||[504,'CONNECTION_ERROR','Không kết nối được OpenAI hoặc yêu cầu đã quá thời gian chờ. Kiểm tra mạng rồi thử lại.'];return json(res,error[0],{code:error[1],message:error[2]})}finally{busy--}
 }
 const files={'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/features.js':['features.js','text/javascript; charset=utf-8'],'/practice.js':['practice.js','text/javascript; charset=utf-8'],'/enhancements.js':['enhancements.js','text/javascript; charset=utf-8'],'/manifest.webmanifest':['manifest.webmanifest','application/manifest+json'],'/pwa-icon.svg':['pwa-icon.svg','image/svg+xml'],'/sw.js':['sw.js','text/javascript; charset=utf-8']};const file=files[url.pathname];if(req.method!=='GET'||!file)return json(res,404,{message:'Không tìm thấy trang.'});res.writeHead(200,{'Content-Type':file[1],'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});res.end(await readFile(path.join(root,file[0])));
 }catch{if(!res.headersSent)json(res,500,{code:'SERVER_ERROR',message:'Máy chủ gặp lỗi. Hãy thử lại.'});else res.end()}});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(4174,'127.0.0.1',()=>console.log('Smart Buddy: http://127.0.0.1:4174 — khóa chỉ nằm ở máy chủ.'));


